const express = require('express');
const {
  uploadSyllabus,
  getAllSyllabi,
  getSyllabus,
  deleteSyllabus
} = require('../controllers/syllabusController');
const { protect } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload syllabus with PDF file
router.post(
  '/upload',
  upload.single('pdf'),
  handleUploadError,
  uploadSyllabus
);

// Get all syllabi for current user
router.get('/', getAllSyllabi);

// Get single syllabus
router.get('/:id', getSyllabus);

// Delete syllabus
router.delete('/:id', deleteSyllabus);

module.exports = router;