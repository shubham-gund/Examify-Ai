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

// Upload syllabus with optional PDF file or text content
router.post(
  '/upload',
  (req, res, next) => {
    // Make file upload optional - proceed even if no file
    upload.single('pdf')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      next();
    });
  },
  uploadSyllabus
);

// Get all syllabi for current user
router.get('/', getAllSyllabi);

// Get single syllabus
router.get('/:id', getSyllabus);

// Delete syllabus
router.delete('/:id', deleteSyllabus);

module.exports = router;