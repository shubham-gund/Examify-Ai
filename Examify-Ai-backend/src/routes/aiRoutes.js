const express = require('express');
const {
  generateNotesFromSyllabus,
  generateQuestionsFromSyllabus,
  evaluateAnswerWithAI,
  getNotesForSyllabus,
  getMyNotes,
  getNoteById,
  updateNotesContent
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

console.log('✅ aiRoutes file loaded');

// All routes require authentication
router.use(protect);

// POST routes (most specific)
router.post('/generate-notes', generateNotesFromSyllabus);
router.post('/generate-questions', authorize('teacher'), generateQuestionsFromSyllabus);
router.post('/evaluate', evaluateAnswerWithAI);

// GET routes with specific paths (before /:id to avoid conflicts)
router.get('/notes/:syllabusId', getNotesForSyllabus);

// GET all notes
router.get('/', getMyNotes);

router.put('/:id', (req, res, next) => {
  console.log(`🔵 PUT /:id called with ID: ${req.params.id}`);
  updateNotesContent(req, res, next);
});

router.get('/:id', (req, res, next) => {
  console.log(`🟢 GET /:id called with ID: ${req.params.id}`);
  getNoteById(req, res, next);
});

module.exports = router;