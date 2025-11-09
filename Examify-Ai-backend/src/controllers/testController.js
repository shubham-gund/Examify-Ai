const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');

/**
 * @desc    Create new test
 * @route   POST /api/tests
 * @access  Private (Teacher only)
 */
exports.createTest = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      syllabusId, 
      questions, 
      scheduledDate, 
      duration,
      allowedAttempts,
      passingScore
    } = req.body;

    if (!title || !questions || !duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title, questions, and duration'
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least one question'
      });
    }

    const questionDocs = await Question.find({
      _id: { $in: questions }
    });

    if (questionDocs.length !== questions.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Some questions are invalid'
      });
    }

    const totalPoints = questionDocs.reduce((sum, q) => sum + (q.points || 1), 0);

    const test = await Test.create({
      title,
      description,
      createdBy: req.user.id,
      syllabusId,
      questions,
      scheduledDate,
      duration,
      totalPoints,
      allowedAttempts: allowedAttempts || 1,
      passingScore: passingScore || 50
    });

    await test.populate('questions');

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully',
      data: {
        test
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tests (for teachers: their tests, for students: available tests)
 * @route   GET /api/tests
 * @access  Private
 */
exports.getAllTests = async (req, res, next) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }

    const tests = await Test.find(query)
      .populate('createdBy', 'name email')
      .populate('syllabusId', 'title')
      .select('-questions')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      count: tests.length,
      data: {
        tests
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single test with questions
 * @route   GET /api/tests/:id
 * @access  Private
 */
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('syllabusId', 'title')
      .populate('questions');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    if (req.user.role === 'student') {
      const attemptCount = await Result.countDocuments({
        studentId: req.user.id,
        testId: test._id
      });

      if (attemptCount >= test.allowedAttempts) {
        return res.status(403).json({
          status: 'error',
          message: 'Maximum attempts reached for this test'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        test
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update test
 * @route   PUT /api/tests/:id
 * @access  Private (Teacher only - own tests)
 */
exports.updateTest = async (req, res, next) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this test'
      });
    }

    const allowedUpdates = [
      'title', 
      'description', 
      'scheduledDate', 
      'duration', 
      'isActive',
      'allowedAttempts',
      'passingScore'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    test = await Test.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('questions');

    res.status(200).json({
      status: 'success',
      message: 'Test updated successfully',
      data: {
        test
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete test
 * @route   DELETE /api/tests/:id
 * @access  Private (Teacher only - own tests)
 */
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this test'
      });
    }

    await test.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Test deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};