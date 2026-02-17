const Problem = require('../models/Problem');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tags, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };

    const problems = await Problem.find(filter)
      .select('title difficulty tags acceptanceRate totalSubmissions')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res, next) => {
  try {
    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    await Problem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get problems by tag
// @route   GET /api/problems/tag/:tag
// @access  Public
const getProblemsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20, difficulty } = req.query;
    
    const filter = { 
      isActive: true,
      tags: { $in: [tag] }
    };
    
    if (difficulty) filter.difficulty = difficulty;

    const problems = await Problem.find(filter)
      .select('title difficulty tags acceptanceRate totalSubmissions')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get random problem
// @route   GET /api/problems/random
// @access  Public
const getRandomProblem = async (req, res, next) => {
  try {
    const { difficulty } = req.query;
    
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;

    const count = await Problem.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    
    const problem = await Problem.findOne(filter)
      .select('_id title difficulty')
      .skip(random);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No problems found'
      });
    }

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get problem statistics
// @route   GET /api/problems/stats
// @access  Public
const getProblemStats = async (req, res, next) => {
  try {
    const stats = await Problem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          totalSubmissions: { $sum: '$totalSubmissions' },
          totalAccepted: { $sum: '$correctSubmissions' }
        }
      }
    ]);

    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalSubmissions' } } }
    ]);

    res.json({
      success: true,
      stats: {
        byDifficulty: stats,
        totalProblems,
        totalSubmissions: totalSubmissions[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemsByTag,
  getRandomProblem,
  getProblemStats
};