const express = require('express');
const { 
  getProblems, 
  getProblem, 
  createProblem, 
  updateProblem, 
  deleteProblem,
  getProblemsByTag,
  getRandomProblem,
  getProblemStats
} = require('../controllers/problems');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProblems);
router.get('/stats', getProblemStats);
router.get('/random', getRandomProblem);
router.get('/tag/:tag', getProblemsByTag);
router.get('/:id', getProblem);
router.post('/', auth, admin, createProblem);
router.put('/:id', auth, admin, updateProblem);
router.delete('/:id', auth, admin, deleteProblem);

module.exports = router;