const Syllabus = require('../models/Syllabus');
const { parsePDF, cleanText } = require('../utils/pdfParser');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Upload syllabus/study material
 * @route   POST /api/syllabus/upload
 * @access  Private
 */
exports.uploadSyllabus = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }

    const { title } = req.body;

    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a title for the syllabus'
      });
    }

    const pdfData = await parsePDF(req.file.path);
    const cleanedText = cleanText(pdfData.text);

    if (!cleanedText || cleanedText.length < 100) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to extract meaningful content from PDF'
      });
    }

    const syllabus = await Syllabus.create({
      title,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      parsedText: cleanedText,
      fileSize: req.file.size,
      pageCount: pdfData.pageCount
    });

    res.status(201).json({
      status: 'success',
      message: 'Syllabus uploaded and parsed successfully',
      data: {
        syllabus: {
          id: syllabus._id,
          title: syllabus.title,
          fileName: syllabus.fileName,
          pageCount: syllabus.pageCount,
          uploadDate: syllabus.uploadDate
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