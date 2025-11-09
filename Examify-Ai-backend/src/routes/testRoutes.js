const express = require('express');
const {
  createTest,
  getAllTests,
  getTest,
  updateTest,
  deleteTest
} = require('../controllers/testController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create test (Teachers only)
router.post('/', authorize('teacher'), createTest);

// Get all tests
router.get('/', getAllTests);

// Get single test
router.get('/:id', getTest);

// Update test (Teachers only)
router.put('/:id', authorize('teacher'), updateTest);

// Delete test (Teachers only)
router.delete('/:id', authorize('teacher'), deleteTest);

module.exports = router;