const express = require('express');
const {
  getAvailableTests,
  startTest,
  getTestHistory,
  getDetailedResult,
  uploadForPractice,
  getPracticeTests,
  getStudentAnalytics,
  deletePracticeTest
} = require('../controllers/examController');
const { protect, authorize } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

// Get all available tests for students
router.get('/available', getAvailableTests);

// Start/Get a test for taking exam
router.get('/start/:testId', startTest);

// Get student's test history
router.get('/history', getTestHistory);

// Get detailed result of a specific test attempt
router.get('/result/:resultId', getDetailedResult);

// Get student performance analytics
router.get('/analytics', getStudentAnalytics);

// Practice Test Routes
// Upload PDF for self-practice
router.post(
  '/practice/upload',
  upload.single('pdf'),
  handleUploadError,
  uploadForPractice
);

// Get all practice tests
router.get('/practice', getPracticeTests);

// Delete practice test
router.delete('/practice/:testId', deletePracticeTest);

module.exports = router;