const express = require('express');
const { 
  getUserProfile, 
  getLeaderboard 
} = require('../controllers/users');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:userId', getUserProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;