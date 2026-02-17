const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile/:userId
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('solvedProblems.problemId', 'title difficulty tags');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .select('username profile stats solvedProblems')
      .sort({ 'stats.totalSolved': -1, 'stats.reputation': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};