const express = require('express');
const router = express.Router();
const Solution = require('../models/Solution');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/solutions/problem/:problemId
// @desc    Get all solutions for a problem
// @access  Public
router.get('/problem/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      language,
      approvedOnly = true
    } = req.query;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Build query
    const query = { problemId };
    if (approvedOnly) {
      query.isApproved = true;
    }
    if (language) {
      query['code.language'] = language;
    }

    // Get solutions
    const solutions = await Solution.find(query)
      .populate('author', 'username name avatar')
      .select('-code.code') // Don't send code in list
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Solution.countDocuments(query);

    res.json({
      solutions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/solutions/:id
// @desc    Get single solution by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('author', 'username name avatar')
      .populate('problemId', 'title difficulty tags');

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Increment views
    solution.views += 1;
    await solution.save();

    res.json(solution);
  } catch (error) {
    console.error('Error fetching solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/solutions
// @desc    Create a new solution
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      problemId,
      title,
      description,
      approach,
      complexity,
      code,
      explanation,
      examples,
      tags,
      youtubeUrl
    } = req.body;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check if user already submitted a solution for this problem
    const existingSolution = await Solution.findOne({
      problemId,
      author: req.user.id
    });

    if (existingSolution) {
      return res.status(400).json({ 
        error: 'You have already submitted a solution for this problem' 
      });
    }

    const solution = new Solution({
      problemId,
      title,
      description,
      approach,
      complexity,
      code,
      explanation,
      examples: examples || [],
      tags: tags || [],
      youtubeUrl,
      author: req.user.id
    });

    await solution.save();
    
    // Populate author info for response
    await solution.populate('author', 'username name avatar');

    res.status(201).json(solution);
  } catch (error) {
    console.error('Error creating solution:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/solutions/:id
// @desc    Update a solution
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Check if user owns the solution or is admin
    if (solution.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.problemId;
    delete updates.author;
    delete updates.isApproved;
    delete updates.upvotes;
    delete updates.downvotes;
    delete updates.views;

    Object.assign(solution, updates);
    await solution.save();

    await solution.populate('author', 'username name avatar');
    res.json(solution);
  } catch (error) {
    console.error('Error updating solution:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/solutions/:id
// @desc    Delete a solution
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Check if user owns the solution or is admin
    if (solution.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Solution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solution deleted successfully' });
  } catch (error) {
    console.error('Error deleting solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/solutions/:id/upvote
// @desc    Upvote a solution
// @access  Private
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    const userId = req.user.id;

    // Check if user already upvoted
    if (solution.upvotes.includes(userId)) {
      // Remove upvote
      solution.upvotes.pull(userId);
    } else {
      // Add upvote and remove downvote if exists
      solution.upvotes.push(userId);
      solution.downvotes.pull(userId);
    }

    await solution.save();
    res.json({ 
      upvotes: solution.upvotes.length,
      downvotes: solution.downvotes.length,
      userUpvoted: solution.upvotes.includes(userId),
      userDownvoted: solution.downvotes.includes(userId)
    });
  } catch (error) {
    console.error('Error upvoting solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/solutions/:id/downvote
// @desc    Downvote a solution
// @access  Private
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    const userId = req.user.id;

    // Check if user already downvoted
    if (solution.downvotes.includes(userId)) {
      // Remove downvote
      solution.downvotes.pull(userId);
    } else {
      // Add downvote and remove upvote if exists
      solution.downvotes.push(userId);
      solution.upvotes.pull(userId);
    }

    await solution.save();
    res.json({ 
      upvotes: solution.upvotes.length,
      downvotes: solution.downvotes.length,
      userUpvoted: solution.upvotes.includes(userId),
      userDownvoted: solution.downvotes.includes(userId)
    });
  } catch (error) {
    console.error('Error downvoting solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PATCH /api/solutions/:id/approve
// @desc    Approve a solution (admin only)
// @access  Private/Admin
router.patch('/:id/approve', adminAuth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    solution.isApproved = true;
    await solution.save();

    res.json({ message: 'Solution approved successfully', solution });
  } catch (error) {
    console.error('Error approving solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/solutions/user/:userId
// @desc    Get solutions by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const solutions = await Solution.find({ author: userId })
      .populate('problemId', 'title difficulty')
      .select('title problemId views upvotes downvotes createdAt isApproved')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Solution.countDocuments({ author: userId });

    res.json({
      solutions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user solutions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;