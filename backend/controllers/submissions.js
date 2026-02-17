const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const judge0Service = require('../utils/judge0');
const { isValidObjectId } = require('../utils/helper');
const codeRunner = require('../utils/codeRunner');

// @desc    Submit code for evaluation
// @route   POST /api/submissions
// @access  Private
exports.submitCode = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Code cannot be empty'
      });
    }

    if (!problemId || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID and language are required'
      });
    }

    if (!isValidObjectId(problemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID'
      });
    }

    // Check if language is supported
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }

    // Get problem with test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if code is too short (meaningless submission)
    const meaningfulCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
    if (meaningfulCode.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please write meaningful code before submitting'
      });
    }

    // Create submission with Pending status
    const submission = await Submission.create({
      user: req.user.id,
      problem: problemId,
      code: code.trim(),
      language,
      totalTestCases: problem.testCases.length,
      status: 'Pending'
    });

    try {
      let processedResults;

      // Try Judge0 first, fallback to local code runner if it fails
      try {
        console.log('Attempting to use Judge0 service...');
        const results = await judge0Service.submitCode(
          code.trim(),
          language,
          problem.testCases
        );
        processedResults = judge0Service.processResults(results, problem.testCases);
        console.log('Judge0 execution successful');
      } catch (judge0Error) {
        console.log('Judge0 failed, falling back to local code runner:', judge0Error.message);
        // Fallback to local code runner
        processedResults = await executeWithLocalRunner(code, language, problem.testCases);
      }

      // DEBUG: Log output comparison details
      console.log('=== OUTPUT COMPARISON DEBUG ===');
      for (let i = 0; i < processedResults.length; i++) {
        const result = processedResults[i];
        console.log(`Test case ${i + 1}:`);
        console.log('Expected:', JSON.stringify(result.expectedOutput));
        console.log('Actual:', JSON.stringify(result.actualOutput));
        console.log('Normalized Expected:', JSON.stringify(normalizeOutput(result.expectedOutput)));
        console.log('Normalized Actual:', JSON.stringify(normalizeOutput(result.actualOutput)));
        console.log('Passed:', result.passed);
        console.log('Status:', result.status);
        console.log('---');
      }

      let testCasesPassed = 0;
      let runtime = 0;
      let memory = 0;
      let status = 'Pending';
      let errorMessage = '';

      console.log(`Processing ${processedResults.length} test case results`);

      // Check each processed result
      for (let i = 0; i < processedResults.length; i++) {
        const result = processedResults[i];
        
        // Update runtime and memory with the maximum values
        runtime = Math.max(runtime, parseFloat(result.time) || 0);
        memory = Math.max(memory, parseFloat(result.memory) || 0);

        console.log(`Test case ${i + 1}: ${result.status}, Passed: ${result.passed}`);

        if (result.status === 'Accepted' && result.passed) {
          testCasesPassed++;
        } else {
          status = result.status;
          errorMessage = result.stderr || result.compile_output || result.error || 
                        `Test case ${i + 1} failed`;
          
          // Add more details for wrong answers
          if (result.status === 'Wrong Answer') {
            errorMessage += `\nExpected: "${result.expectedOutput}"\nGot: "${result.actualOutput}"`;
            errorMessage += `\nNormalized Expected: "${normalizeOutput(result.expectedOutput)}"`;
            errorMessage += `\nNormalized Actual: "${normalizeOutput(result.actualOutput)}"`;
          }
          break;
        }
      }

      // Only set as Accepted if ALL test cases passed
      if (testCasesPassed === problem.testCases.length && status === 'Pending') {
        status = 'Accepted';
        console.log('All test cases passed - Submission Accepted');
      }

      // If we didn't encounter specific errors but not all passed, it's Wrong Answer
      if (status === 'Pending' && testCasesPassed < problem.testCases.length) {
        status = 'Wrong Answer';
        errorMessage = `Passed ${testCasesPassed}/${problem.testCases.length} test cases`;
      }

      // Update submission with final results
      submission.status = status;
      submission.runtime = Math.round(runtime * 1000); // Convert to milliseconds
      submission.memory = memory;
      submission.testCasesPassed = testCasesPassed;
      submission.errorMessage = errorMessage;
      await submission.save();

      // Update problem stats - ALWAYS increment total submissions
      problem.totalSubmissions += 1;
      
      // Only increment correct submissions if status is Accepted
      if (status === 'Accepted') {
        problem.correctSubmissions += 1;
      }
      
      // Recalculate acceptance rate
      problem.acceptanceRate = problem.totalSubmissions > 0 
        ? (problem.correctSubmissions / problem.totalSubmissions) * 100 
        : 0;
      
      await problem.save();

      // Update user stats only if completely accepted and not already solved
      if (status === 'Accepted') {
        const user = await User.findById(req.user.id);
        const alreadySolved = user.solvedProblems.some(
          solved => solved.problemId.toString() === problemId
        );

        if (!alreadySolved) {
          await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { 
              solvedProblems: { 
                problemId: problemId, 
                submissionId: submission._id,
                solvedAt: new Date()
              } 
            },
            $inc: { 
              [`stats.${problem.difficulty}Solved`]: 1,
              'stats.totalSolved': 1
            }
          });
          console.log(`User ${req.user.id} solved problem ${problemId}`);
        } else {
          console.log(`User ${req.user.id} already solved problem ${problemId}`);
        }
      }

      res.json({
        success: true,
        submission: {
          _id: submission._id,
          status: submission.status,
          runtime: submission.runtime,
          memory: submission.memory,
          testCasesPassed: submission.testCasesPassed,
          totalTestCases: submission.totalTestCases,
          errorMessage: submission.errorMessage,
          language: submission.language,
          submittedAt: submission.submittedAt
        }
      });

    } catch (executionError) {
      console.error('All execution methods failed:', executionError);
      
      // Update submission with execution error
      submission.status = 'Runtime Error';
      submission.errorMessage = 'All code execution services unavailable. Please try again.';
      await submission.save();

      // Still increment total submissions count
      problem.totalSubmissions += 1;
      problem.acceptanceRate = problem.totalSubmissions > 0 
        ? (problem.correctSubmissions / problem.totalSubmissions) * 100 
        : 0;
      await problem.save();

      res.status(500).json({
        success: false,
        message: 'Code execution services temporarily unavailable',
        submission: {
          _id: submission._id,
          status: submission.status,
          errorMessage: submission.errorMessage,
          submittedAt: submission.submittedAt
        }
      });
    }

  } catch (error) {
    console.error('Submission controller error:', error);
    next(error);
  }
};

// @desc    Run code without submission (for testing)
// @route   POST /api/submissions/run
// @access  Private
exports.runCode = async (req, res, next) => {
  try {
    const { problemId, code, language, input } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Code cannot be empty'
      });
    }

    if (!problemId || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID and language are required'
      });
    }

    if (!isValidObjectId(problemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // For running code, use the provided input or first test case
    const testInput = input || problem.testCases[0]?.input || '';
    const expectedOutput = problem.testCases[0]?.output || problem.testCases[0]?.expectedOutput || '';

    console.log('=== RUN CODE DEBUG ===');
    console.log('Test Input:', testInput);
    console.log('Expected Output:', expectedOutput);

    try {
      let result;

      // Try Judge0 first, fallback to local runner
      try {
        console.log('Running code with Judge0...');
        const testCases = [{ input: testInput, expectedOutput: expectedOutput }];
        const results = await judge0Service.submitCode(code.trim(), language, testCases);
        const judge0Result = results[0];
        
        console.log('Judge0 Raw Result:', judge0Result);
        
        // For run code, check if the output matches expected output
        const actualOutput = judge0Result.stdout || '';
        const isCorrect = compareOutputs(actualOutput, expectedOutput);
        const judge0Status = judge0Service.mapStatus(judge0Result.status?.id);
        
        result = {
          status: isCorrect ? 'Accepted' : (judge0Status === 'Accepted' ? 'Wrong Answer' : judge0Status),
          runtime: parseFloat(judge0Result.time) || 0,
          memory: parseFloat(judge0Result.memory) || 0,
          output: actualOutput,
          errorMessage: judge0Result.stderr || judge0Result.compile_output || '',
          expectedOutput: expectedOutput,
          actualOutput: actualOutput
        };
        
        console.log('Processed Result:', result);
        
      } catch (judge0Error) {
        console.log('Judge0 run failed, using local runner:', judge0Error.message);
        
        // Fallback to local code runner
        const localResult = await codeRunner.runCode(code.trim(), language, testInput);
        
        const isCorrect = compareOutputs(localResult.output, expectedOutput);
        
        result = {
          status: isCorrect ? 'Accepted' : (localResult.success ? 'Wrong Answer' : 'Runtime Error'),
          runtime: localResult.runtime || 0,
          memory: 0, // Local runner doesn't provide memory usage
          output: localResult.output || '',
          errorMessage: localResult.error || '',
          expectedOutput: expectedOutput,
          actualOutput: localResult.output
        };
      }

      console.log('Final Result:', result);

      res.json({
        success: true,
        ...result,
        input: testInput
      });

    } catch (executionError) {
      console.error('Run code execution error:', executionError);
      res.status(500).json({
        success: false,
        message: 'Code execution services temporarily unavailable',
        status: 'Runtime Error',
        output: '',
        errorMessage: 'Execution service unavailable. Please try again.'
      });
    }

  } catch (error) {
    console.error('Run code controller error:', error);
    next(error);
  }
};

// Helper function to execute code using local code runner
async function executeWithLocalRunner(code, language, testCases) {
  console.log(`Executing ${testCases.length} test cases with local runner for ${language}`);
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      const result = await codeRunner.runCode(code, language, testCase.input);
      
      const processedResult = {
        token: `local-run-${i}`,
        status: {
          id: result.success ? 3 : 6 // 3 = Accepted, 6 = Compilation Error
        },
        stdout: result.output || '',
        stderr: result.error || '',
        compile_output: null,
        time: (result.runtime / 1000).toString() || '0.001', // Convert to seconds
        memory: 1024,
        // Additional fields for processing
        status: result.success ? 'Accepted' : 'Runtime Error',
        passed: compareOutputs(result.output, testCase.expectedOutput || testCase.output),
        expectedOutput: testCase.expectedOutput || testCase.output,
        actualOutput: result.output
      };
      
      // Check output if execution was successful
      if (result.success && (testCase.expectedOutput || testCase.output)) {
        const outputsMatch = compareOutputs(result.output, testCase.expectedOutput || testCase.output);
        if (!outputsMatch) {
          processedResult.status = 'Wrong Answer';
          processedResult.passed = false;
        }
      }
      
      results.push(processedResult);
      
    } catch (error) {
      results.push({
        token: `local-error-${i}`,
        status: {
          id: 6 // Compilation Error
        },
        stdout: '',
        stderr: error.message,
        compile_output: error.message,
        time: '0.000',
        memory: 0,
        status: 'Runtime Error',
        passed: false,
        expectedOutput: testCase.expectedOutput || testCase.output,
        actualOutput: ''
      });
    }
  }
  
  return results;
}

// IMPROVED OUTPUT COMPARISON FUNCTION
function compareOutputs(actual, expected) {
  if (!actual && !expected) return true;
  if (!actual || !expected) return false;
  
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  
  console.log(`Comparing: "${normalizedActual}" vs "${normalizedExpected}"`);
  
  // Exact match after normalization
  if (normalizedActual === normalizedExpected) {
    return true;
  }
  
  // Try numeric comparison (for cases like "8" vs "8.0" vs "8\n")
  try {
    const actualNum = parseFloat(normalizedActual);
    const expectedNum = parseFloat(normalizedExpected);
    
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      const match = actualNum === expectedNum;
      console.log(`Numeric comparison: ${actualNum} === ${expectedNum} -> ${match}`);
      return match;
    }
  } catch (e) {
    // Continue with other comparison methods
  }
  
  // Compare line by line (ignore empty lines and trim each line)
  const actualLines = normalizedActual.split('\n').filter(line => line.trim().length > 0);
  const expectedLines = normalizedExpected.split('\n').filter(line => line.trim().length > 0);
  
  if (actualLines.length !== expectedLines.length) {
    console.log(`Line count mismatch: ${actualLines.length} vs ${expectedLines.length}`);
    return false;
  }
  
  for (let i = 0; i < actualLines.length; i++) {
    if (actualLines[i].trim() !== expectedLines[i].trim()) {
      console.log(`Line ${i} mismatch: "${actualLines[i]}" vs "${expectedLines[i]}"`);
      return false;
    }
  }
  
  return true;
}

// ROBUST OUTPUT NORMALIZATION
function normalizeOutput(str) {
  if (!str) return '';
  
  return str
    .toString()
    .trim() // Remove leading/trailing whitespace
    .replace(/\r\n/g, '\n')  // Windows line endings to Unix
    .replace(/\r/g, '\n')    // Mac line endings to Unix
    .replace(/\n+/g, '\n')   // Multiple newlines to single
    .replace(/\s+/g, ' ')    // Multiple spaces to single space
    .trim();                 // Final trim
}

// @desc    Get user submissions with pagination and filtering
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      problemId, 
      status,
      language 
    } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (problemId && isValidObjectId(problemId)) {
      filter.problem = problemId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (language) {
      filter.language = language;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    const submissions = await Submission.find(filter)
      .populate('problem', 'title difficulty acceptanceRate')
      .sort({ submittedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .select('-code'); // Exclude code for list view

    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      submissions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSubmissions: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    next(error);
  }
};

// @desc    Get single submission with code
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const submission = await Submission.findById(id)
      .populate('problem')
      .populate('user', 'username profile');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns the submission or is admin
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this submission'
      });
    }

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    next(error);
  }
};

// @desc    Get user's submission statistics
// @route   GET /api/submissions/stats
// @access  Private
exports.getSubmissionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total submissions count
    const totalSubmissions = await Submission.countDocuments({ user: userId });

    // Get submissions by status
    const statusStats = await Submission.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get submissions by language
    const languageStats = await Submission.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    // Get submissions by difficulty of solved problems
    const difficultyStats = await Submission.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          status: 'Accepted'
        } 
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problem',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      { $group: { _id: '$problem.difficulty', count: { $sum: 1 } } }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Submission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          submittedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        byStatus: statusStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byLanguage: languageStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byDifficulty: difficultyStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentActivity: recentActivity.reduce((acc, activity) => {
          acc[activity._id] = activity.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get submission stats error:', error);
    next(error);
  }
};

// @desc    Get submissions for a specific problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
exports.getProblemSubmissions = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(problemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID'
      });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const submissions = await Submission.find({
      user: req.user.id,
      problem: problemId
    })
      .select('-code') // Exclude code for list view
      .sort({ submittedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Submission.countDocuments({
      user: req.user.id,
      problem: problemId
    });

    res.json({
      success: true,
      submissions,
      problem: {
        _id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty
      },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSubmissions: total
      }
    });
  } catch (error) {
    console.error('Get problem submissions error:', error);
    next(error);
  }
};