const express = require('express');
const {
  submitTest,
  getMyResults,
  getResult,
  getTestResults
} = require('../controllers/resultController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit test (Students only)
router.post('/submit', authorize('student'), submitTest);

// Get my results (Students only)
router.get('/my-results', authorize('student'), getMyResults);

// Get results for a specific test (Teachers only)
router.get('/test/:testId', authorize('teacher'), getTestResults);

// Get single result details
router.get('/:id', getResult);

module.exports = router;