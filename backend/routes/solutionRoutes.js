const express = require('express');
const router = express.Router();
const Solution = require('../models/Solution');
const Problem = require('../models/Problem');

// Import auth middleware - make sure the path is correct
const { auth, admin } = require('../middleware/auth');

// @desc    Get solution for a problem
// @route   GET /api/problems/:problemId/solution
// @access  Public
router.get('/:problemId/solution', async (req, res) => {
  try {
    const solution = await Solution.findOne({ 
      problemId: req.params.problemId,
      isPublished: true 
    });
    
    if (!solution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solution not found' 
      });
    }
    
    res.json({
      success: true,
      data: solution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Create or update solution (admin only)
// @route   POST /api/problems/:problemId/solution
// @access  Private/Admin
router.post('/:problemId/solution', auth, admin, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found' 
      });
    }

    const { 
      textSolution, 
      videoSolution, 
      additionalResources, 
      isPublished 
    } = req.body;

    // Check if solution already exists
    let solution = await Solution.findOne({ 
      problemId: req.params.problemId 
    });

    if (solution) {
      // Update existing solution
      solution.textSolution = textSolution || solution.textSolution;
      solution.videoSolution = videoSolution || solution.videoSolution;
      solution.additionalResources = additionalResources || solution.additionalResources;
      solution.isPublished = isPublished !== undefined ? isPublished : solution.isPublished;
      solution.updatedBy = req.user._id;
      solution.version += 1;

      await solution.save();
      
      // ✅ Update problem's hasSolution flag (for updates)
      problem.hasSolution = true;
      problem.solutionId = solution._id;
      await problem.save();
      
      res.json({
        success: true,
        message: 'Solution updated successfully',
        data: solution
      });
    } else {
      // Create new solution
      solution = await Solution.create({
        problemId: req.params.problemId,
        problemTitle: problem.title,
        textSolution,
        videoSolution,
        additionalResources,
        isPublished: isPublished !== undefined ? isPublished : true,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });

      // ✅ Update problem with solution reference
      problem.hasSolution = true;
      problem.solutionId = solution._id;
      await problem.save();

      res.status(201).json({
        success: true,
        message: 'Solution created successfully',
        data: solution
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Delete solution (admin only)
// @route   DELETE /api/problems/:problemId/solution
// @access  Private/Admin
router.delete('/:problemId/solution', auth, admin, async (req, res) => {
  try {
    const solution = await Solution.findOne({ 
      problemId: req.params.problemId 
    });

    if (!solution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solution not found' 
      });
    }

    await solution.deleteOne();

    // ✅ Update problem to remove solution reference
    await Problem.findByIdAndUpdate(req.params.problemId, {
      hasSolution: false,
      $unset: { solutionId: 1 }
    });

    res.json({
      success: true,
      message: 'Solution deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Toggle solution publish status (admin only)
// @route   PATCH /api/problems/:problemId/solution/toggle
// @access  Private/Admin
router.patch('/:problemId/solution/toggle', auth, admin, async (req, res) => {
  try {
    const solution = await Solution.findOne({ 
      problemId: req.params.problemId 
    });

    if (!solution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solution not found' 
      });
    }

    solution.isPublished = !solution.isPublished;
    solution.updatedBy = req.user._id;
    await solution.save();

    res.json({
      success: true,
      message: `Solution ${solution.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: solution.isPublished }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Get all solutions (admin only)
// @route   GET /api/solutions
// @access  Private/Admin
router.get('/solutions', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const solutions = await Solution.find()
      .populate('problemId', 'title difficulty')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Solution.countDocuments();

    res.json({
      success: true,
      data: solutions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;