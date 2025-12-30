const express = require('express');
const {
  generateNotesFromSyllabus,
  generateQuestionsFromSyllabus,
  evaluateAnswerWithAI,
  getNotesForSyllabus,
  getMyNotes,
  getNoteById
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate notes from syllabus
router.post('/generate-notes', protect, generateNotesFromSyllabus);

// Get all notes of logged-in user
router.get('/', protect, getMyNotes);

// Get single note
router.get('/:id', protect, getNoteById);

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