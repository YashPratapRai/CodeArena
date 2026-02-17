const Discussion = require('../models/Discussion');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/helper');

// @desc    Get all discussions with filtering and pagination
// @route   GET /api/discussions
// @access  Public
exports.getDiscussions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      problemTitle,
      authorId,
      tag,
      sortBy = 'newest',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (problemTitle) {
      filter.problemTitle = { $regex: problemTitle, $options: 'i' };
    }
    
    if (authorId && isValidObjectId(authorId)) {
      filter.author = authorId;
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { problemTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'mostVoted':
        sort = { upvotes: -1, createdAt: -1 };
        break;
      case 'mostViewed':
        sort = { views: -1, createdAt: -1 };
        break;
      case 'mostCommented':
        sort = { commentCount: -1, createdAt: -1 };
        break;
      case 'recentActivity':
        sort = { lastActivity: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Add pinned posts first
    sort = { isPinned: -1, ...sort };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const discussions = await Discussion.find(filter)
      .populate('author', 'username profile avatar')
      .populate('problem', 'title difficulty acceptanceRate')
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Add vote counts and user vote status
    const discussionsWithVotes = discussions.map(discussion => ({
      ...discussion,
      voteCount: discussion.upvotes.length - discussion.downvotes.length,
      userVote: req.user ? {
        upvoted: discussion.upvotes.includes(req.user.id),
        downvoted: discussion.downvotes.includes(req.user.id)
      } : null,
      upvotes: undefined,
      downvotes: undefined
    }));

    const total = await Discussion.countDocuments(filter);

    res.json({
      success: true,
      discussions: discussionsWithVotes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalDiscussions: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Public
exports.getDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }

    const discussion = await Discussion.findById(id)
      .populate('author', 'username profile avatar stats')
      .populate('problem', 'title difficulty acceptanceRate description')
      .populate({
        path: 'comments.user',
        select: 'username profile avatar'
      })
      .populate({
        path: 'comments.replies.user',
        select: 'username profile avatar'
      });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Increment views
    await discussion.incrementViews();

    // Transform comments with vote counts
    const transformedComments = discussion.comments.map(comment => ({
      ...comment.toObject(),
      voteCount: comment.upvotes.length - comment.downvotes.length,
      userVote: req.user ? {
        upvoted: comment.upvotes.includes(req.user.id),
        downvoted: comment.downvotes.includes(req.user.id)
      } : null,
      upvotes: undefined,
      downvotes: undefined,
      replies: comment.replies.map(reply => ({
        ...reply.toObject(),
        voteCount: reply.upvotes.length - reply.downvotes.length,
        userVote: req.user ? {
          upvoted: reply.upvotes.includes(req.user.id),
          downvoted: reply.downvotes.includes(req.user.id)
        } : null,
        upvotes: undefined,
        downvotes: undefined
      }))
    }));

    const discussionWithVotes = {
      ...discussion.toObject(),
      voteCount: discussion.upvotes.length - discussion.downvotes.length,
      userVote: req.user ? {
        upvoted: discussion.upvotes.includes(req.user.id),
        downvoted: discussion.downvotes.includes(req.user.id)
      } : null,
      upvotes: undefined,
      downvotes: undefined,
      comments: transformedComments
    };

    res.json({
      success: true,
      discussion: discussionWithVotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new discussion
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res, next) => {
  try {
    const { title, content, problemTitle, tags } = req.body;

    // Validate input
    if (!title || !content || !problemTitle) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and problem title are required'
      });
    }

    // Find problem by title
    const problem = await Problem.findOne({ 
      title: { $regex: new RegExp(`^${problemTitle}$`, 'i') } 
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found. Please check the problem title.'
      });
    }

    const discussion = await Discussion.create({
      title,
      content,
      author: req.user.id,
      problem: problem._id,
      problemTitle: problem.title,
      tags: tags || []
    });

    await discussion.populate('author', 'username profile avatar');
    await discussion.populate('problem', 'title difficulty');

    res.status(201).json({
      success: true,
      discussion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
// @access  Private
exports.updateDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check ownership or admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this discussion'
      });
    }

    // Update fields
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;

    discussion.lastActivity = new Date();
    await discussion.save();
    
    await discussion.populate('author', 'username profile avatar');
    await discussion.populate('problem', 'title difficulty');

    res.json({
      success: true,
      discussion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check ownership or admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this discussion'
      });
    }

    await Discussion.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search problems for discussion creation
// @route   GET /api/discussions/problems/search
// @access  Private
exports.searchProblems = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        problems: []
      });
    }

    const problems = await Problem.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('title difficulty acceptanceRate')
    .limit(10)
    .lean();

    res.json({
      success: true,
      problems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to discussion - FIXED VERSION
// @route   POST /api/discussions/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Discussion is locked'
      });
    }

    const commentData = {
      user: req.user.id,
      content: content.trim(),
      upvotes: [],
      downvotes: []
    };

    let newComment;

    if (parentCommentId && isValidObjectId(parentCommentId)) {
      // It's a reply to a comment
      const parentComment = discussion.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }

      parentComment.replies.push(commentData);
      await discussion.save();
      
      // Get the newly added reply
      const updatedDiscussion = await Discussion.findById(id);
      const parentCommentUpdated = updatedDiscussion.comments.id(parentCommentId);
      newComment = parentCommentUpdated.replies[parentCommentUpdated.replies.length - 1];
      await newComment.populate('user', 'username profile avatar');
    } else {
      // It's a top-level comment
      discussion.comments.push(commentData);
      await discussion.save();
      
      // Get the newly added comment
      const updatedDiscussion = await Discussion.findById(id);
      newComment = updatedDiscussion.comments[updatedDiscussion.comments.length - 1];
      await newComment.populate('user', 'username profile avatar');
    }

    discussion.commentCount += 1;
    discussion.lastActivity = new Date();
    await discussion.save();

    // Final population to ensure all data is properly loaded
    const finalDiscussion = await Discussion.findById(id)
      .populate('author', 'username profile avatar stats')
      .populate('problem', 'title difficulty acceptanceRate description')
      .populate({
        path: 'comments.user',
        select: 'username profile avatar'
      })
      .populate({
        path: 'comments.replies.user',
        select: 'username profile avatar'
      });

    const finalComment = parentCommentId 
      ? finalDiscussion.comments.id(parentCommentId).replies.id(newComment._id)
      : finalDiscussion.comments.id(newComment._id);

    res.status(201).json({
      success: true,
      comment: {
        ...finalComment.toObject(),
        voteCount: 0,
        userVote: { upvoted: false, downvoted: false },
        replies: parentCommentId ? undefined : []
      },
      isReply: !!parentCommentId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on discussion
// @route   POST /api/discussions/:id/vote
// @access  Private
exports.voteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be either "upvote" or "downvote"'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    await discussion.toggleVote(req.user.id, voteType);
    discussion.lastActivity = new Date();
    await discussion.save();

    res.json({
      success: true,
      voteCount: discussion.upvotes.length - discussion.downvotes.length,
      userVote: {
        upvoted: discussion.upvotes.includes(req.user.id),
        downvoted: discussion.downvotes.includes(req.user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on comment or reply - FIXED VERSION
// @route   POST /api/discussions/:discussionId/comments/:commentId/vote
// @access  Private
exports.voteComment = async (req, res, next) => {
  try {
    const { discussionId, commentId } = req.params;
    const { voteType, isReply, replyId } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be either "upvote" or "downvote"'
      });
    }

    if (!isValidObjectId(discussionId) || !isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion or comment ID'
      });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    let target;
    if (isReply && replyId) {
      // Voting on a reply
      const comment = discussion.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      target = comment.replies.id(replyId);
      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found'
        });
      }
    } else {
      // Voting on a comment
      target = discussion.comments.id(commentId);
      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
    }

    // Toggle vote using the schema method
    await target.toggleVote(req.user.id, voteType);
    discussion.lastActivity = new Date();
    await discussion.save();

    // Return updated vote information
    res.json({
      success: true,
      voteCount: target.upvotes.length - target.downvotes.length,
      userVote: {
        upvoted: target.upvotes.includes(req.user.id),
        downvoted: target.downvotes.includes(req.user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark comment as solution
// @route   POST /api/discussions/:discussionId/comments/:commentId/solution
// @access  Private
exports.markAsSolution = async (req, res, next) => {
  try {
    const { discussionId, commentId } = req.params;

    if (!isValidObjectId(discussionId) || !isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion or comment ID'
      });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check ownership
    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only discussion author can mark solutions'
      });
    }

    const comment = discussion.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove solution status from previous solution
    if (discussion.solutionComment) {
      const previousSolution = discussion.comments.id(discussion.solutionComment);
      if (previousSolution) {
        previousSolution.isSolution = false;
      }
    }

    // Mark new solution
    comment.isSolution = true;
    discussion.solutionComment = commentId;
    discussion.lastActivity = new Date();

    await discussion.save();

    res.json({
      success: true,
      message: 'Comment marked as solution'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get discussion tags
// @route   GET /api/discussions/tags
// @access  Public
exports.getTags = async (req, res, next) => {
  try {
    const tags = await Discussion.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's discussions
// @route   GET /api/discussions/user/:userId
// @access  Public
exports.getUserDiscussions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const discussions = await Discussion.find({ author: userId })
      .populate('author', 'username profile avatar')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const discussionsWithVotes = discussions.map(discussion => ({
      ...discussion,
      voteCount: discussion.upvotes.length - discussion.downvotes.length,
      userVote: req.user ? {
        upvoted: discussion.upvotes.includes(req.user.id),
        downvoted: discussion.downvotes.includes(req.user.id)
      } : null,
      upvotes: undefined,
      downvotes: undefined
    }));

    const total = await Discussion.countDocuments({ author: userId });

    res.json({
      success: true,
      discussions: discussionsWithVotes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalDiscussions: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};