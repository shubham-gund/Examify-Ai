const Syllabus = require('../models/Syllabus');
const { parsePDF, cleanText } = require('../utils/pdfParser');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Upload syllabus/study material (PDF or text)
 * @route   POST /api/syllabus/upload
 * @access  Private
 */
exports.uploadSyllabus = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
      }
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a title for the syllabus'
      });
    }

    let parsedText = '';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let pageCount = null;

    // Case 1: PDF file uploaded
    if (req.file) {
      try {
        const pdfData = await parsePDF(req.file.path);
        parsedText = cleanText(pdfData.text);
        
        if (!parsedText || parsedText.length < 100) {
          await fs.unlink(req.file.path);
          return res.status(400).json({
            status: 'error',
            message: 'Failed to extract meaningful content from PDF. Please check the file or use text input instead.'
          });
        }

        fileUrl = `/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
        fileSize = req.file.size;
        pageCount = pdfData.pageCount;
      } catch (pdfError) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
        }
        return res.status(400).json({
          status: 'error',
          message: 'Failed to parse PDF file. Please ensure it contains readable text.'
        });
      }
    }
    // Case 2: Text content provided
    else if (content) {
      parsedText = cleanText(content);
      
      if (!parsedText || parsedText.length < 100) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide at least 100 characters of meaningful content'
        });
      }

      // For text input, set default values
      fileUrl = null;
      fileName = 'Text Input';
      fileSize = Buffer.byteLength(parsedText, 'utf8');
      pageCount = 0;
    }
    // Case 3: Neither file nor content provided
    else {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide either a PDF file or text content'
      });
    }

    const syllabus = await Syllabus.create({
      title,
      uploadedBy: req.user.id,
      fileUrl: fileUrl || 'text-input',
      fileName,
      parsedText,
      fileSize,
      pageCount
    });

    res.status(201).json({
      status: 'success',
      message: req.file ? 'Syllabus uploaded and parsed successfully' : 'Syllabus content saved successfully',
      data: {
        syllabus: {
          id: syllabus._id,
          title: syllabus.title,
          fileName: syllabus.fileName,
          pageCount: syllabus.pageCount,
          uploadDate: syllabus.uploadDate,
          contentLength: parsedText.length,
          contentType: req.file ? 'pdf' : 'text'
        }
      }
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    next(error);
  }
};

/**
 * @desc    Get all syllabi for current user
 * @route   GET /api/syllabus
 * @access  Private
 */
exports.getAllSyllabi = async (req, res, next) => {
  try {
    const syllabi = await Syllabus.find({ uploadedBy: req.user.id })
      .select('-parsedText')
      .sort('-createdAt')
      .populate('uploadedBy', 'name email');

    res.status(200).json({
      status: 'success',
      count: syllabi.length,
      data: {
        syllabi
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single syllabus with parsed text
 * @route   GET /api/syllabus/:id
 * @access  Private
 */
exports.getSyllabus = async (req, res, next) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!syllabus) {
      return res.status(404).json({
        status: 'error',
        message: 'Syllabus not found'
      });
    }

    if (syllabus.uploadedBy._id.toString() !== req.user.id && req.user.role === 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this syllabus'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        syllabus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete syllabus
 * @route   DELETE /api/syllabus/:id
 * @access  Private
 */
exports.deleteSyllabus = async (req, res, next) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({
        status: 'error',
        message: 'Syllabus not found'
      });
    }

    if (syllabus.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this syllabus'
      });
    }

    const filePath = path.join(__dirname, '..', '..', syllabus.fileUrl);
    await fs.unlink(filePath).catch(err => console.error('Error deleting file:', err));

    await syllabus.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Syllabus deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};