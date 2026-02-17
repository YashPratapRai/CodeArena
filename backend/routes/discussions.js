const express = require('express');
const {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  voteDiscussion,
  voteComment,
  markAsSolution,
  getTags,
  searchProblems,
  getUserDiscussions
} = require('../controllers/discussions');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getDiscussions);
router.get('/tags', getTags);
router.get('/:id', getDiscussion);
router.get('/user/:userId', getUserDiscussions);

// Protected routes
router.get('/problems/search', auth, searchProblems);
router.post('/', auth, createDiscussion);
router.put('/:id', auth, updateDiscussion);
router.delete('/:id', auth, deleteDiscussion);
router.post('/:id/comments', auth, addComment);
router.post('/:id/vote', auth, voteDiscussion);
router.post('/:discussionId/comments/:commentId/vote', auth, voteComment);
router.post('/:discussionId/comments/:commentId/solution', auth, markAsSolution);

module.exports = router;