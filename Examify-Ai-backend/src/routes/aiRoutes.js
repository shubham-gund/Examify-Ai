const express = require('express');
const {
  generateNotesFromSyllabus,
  generateQuestionsFromSyllabus,
  evaluateAnswerWithAI,
  getNotesForSyllabus
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate notes from syllabus (Both teachers and students)
router.post('/generate-notes', generateNotesFromSyllabus);

// Generate questions from syllabus (Teachers only)
router.post(
  '/generate-questions',
  authorize('teacher'),
  generateQuestionsFromSyllabus
);

// Evaluate student answer using AI
router.post('/evaluate', evaluateAnswerWithAI);

// Get notes for a syllabus
router.get('/notes/:syllabusId', getNotesForSyllabus);

module.exports = router;