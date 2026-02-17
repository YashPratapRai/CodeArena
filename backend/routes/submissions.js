const express = require('express');
const { 
  submitCode, 
  getSubmissions, 
  getSubmission,
  runCode // ADD THIS IMPORT
} = require('../controllers/submissions');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, submitCode);
router.post('/run', auth, runCode); // ADD THIS ROUTE
router.get('/', auth, getSubmissions);
router.get('/:id', auth, getSubmission);

module.exports = router;