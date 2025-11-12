const Test = require('../models/Test');
const Result = require('../models/Result');
const Syllabus = require('../models/Syllabus');
const Question = require('../models/Question');
const { parsePDF, cleanText } = require('../utils/pdfParser');
const { generateQuestions } = require('../utils/aiService');
const fs = require('fs').promises;

/**
 * @desc    Get all available tests for students
 * @route   GET /api/exams/available
 * @access  Private (Student only)
 */
exports.getAvailableTests = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find active tests that are either not scheduled or scheduled for now/past
    const tests = await Test.find({
      isActive: true,
      $or: [
        { scheduledDate: { $lte: now } },
        { scheduledDate: null }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('syllabusId', 'title')
      .select('-questions')
      .sort('-createdAt');

    // For each test, check if student has attempts remaining
    const testsWithAttempts = await Promise.all(
      tests.map(async (test) => {
        const attemptCount = await Result.countDocuments({
          studentId: req.user.id,
          testId: test._id
        });

        const attemptsRemaining = test.allowedAttempts - attemptCount;
        const canAttempt = attemptsRemaining > 0;

        return {
          ...test.toObject(),
          attemptCount,
          attemptsRemaining,
          canAttempt
        };
      })
    );

    res.status(200).json({
      status: 'success',
      count: testsWithAttempts.length,
      data: {
        tests: testsWithAttempts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start/Get a test for taking exam
 * @route   GET /api/exams/start/:testId
 * @access  Private (Student only)
 */
exports.startTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId)
      .populate('createdBy', 'name email')
      .populate('syllabusId', 'title')
      .populate({
        path: 'questions',
        select: '-correctAnswer -explanation' // Hide answers from students
      });

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    if (!test.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'This test is no longer active'
      });
    }

    // Check if test is scheduled for future
    if (test.scheduledDate && new Date(test.scheduledDate) > new Date()) {
      return res.status(403).json({
        status: 'error',
        message: 'Test has not started yet',
        scheduledDate: test.scheduledDate
      });
    }

    // Check attempts remaining
    const attemptCount = await Result.countDocuments({
      studentId: req.user.id,
      testId: test._id
    });

    if (attemptCount >= test.allowedAttempts) {
      return res.status(403).json({
        status: 'error',
        message: 'You have exhausted all attempts for this test',
        attemptCount,
        allowedAttempts: test.allowedAttempts
      });
    }

    // For MCQ questions, send options without marking correct answer
    const questionsForStudent = test.questions.map(q => {
      const questionObj = q.toObject();
      
      if (q.type === 'mcq' || q.type === 'true_false') {
        questionObj.options = q.options.map(opt => ({
          text: opt.text,
          _id: opt._id
        }));
      }
      
      delete questionObj.correctAnswer;
      delete questionObj.explanation;
      
      return questionObj;
    });

    res.status(200).json({
      status: 'success',
      message: 'Test started successfully',
      data: {
        test: {
          ...test.toObject(),
          questions: questionsForStudent,
          attemptNumber: attemptCount + 1,
          attemptsRemaining: test.allowedAttempts - attemptCount
        },
        startTime: new Date(),
        endTime: new Date(Date.now() + test.duration * 60 * 1000)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's test history
 * @route   GET /api/exams/history
 * @access  Private (Student only)
 */
exports.getTestHistory = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate({
        path: 'testId',
        select: 'title totalPoints duration passingScore',
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      })
      .sort('-submittedAt');

    const history = results.map(result => ({
      resultId: result._id,
      testTitle: result.testId?.title,
      teacher: result.testId?.createdBy?.name,
      score: result.score,
      totalPoints: result.testId?.totalPoints,
      percentage: result.percentage,
      passed: result.passed,
      attemptNumber: result.attemptNumber,
      submittedAt: result.submittedAt,
      timeSpent: result.timeSpent
    }));

    res.status(200).json({
      status: 'success',
      count: history.length,
      data: {
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed result of a specific test attempt
 * @route   GET /api/exams/result/:resultId
 * @access  Private (Student only)
 */
exports.getDetailedResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate({
        path: 'testId',
        select: 'title description totalPoints passingScore',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .populate('answers.questionId');

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Result not found'
      });
    }

    // Check if result belongs to the student
    if (result.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this result'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload PDF for self-practice and generate test
 * @route   POST /api/exams/practice/upload
 * @access  Private (Student only)
 */
exports.uploadForPractice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }

    const { title, questionCount = 10, questionTypes = 'mcq,short' } = req.body;

    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a title'
      });
    }

    // Parse PDF
    const pdfData = await parsePDF(req.file.path);
    const cleanedText = cleanText(pdfData.text);

    if (!cleanedText || cleanedText.length < 100) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to extract meaningful content from PDF'
      });
    }

    // Create syllabus entry
    const syllabus = await Syllabus.create({
      title: `Practice: ${title}`,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      parsedText: cleanedText,
      fileSize: req.file.size,
      pageCount: pdfData.pageCount
    });

    // Generate questions using AI
    const types = questionTypes.split(',').map(t => t.trim());
    const aiQuestions = await generateQuestions(
      cleanedText.substring(0, 4000), 
      parseInt(questionCount),
      types
    );

    // Create questions
    const questions = await Question.insertMany(
      aiQuestions.map(q => ({
        ...q,
        syllabusId: syllabus._id,
        createdBy: req.user.id
      }))
    );

    // Create practice test
    const practiceTest = await Test.create({
      title: `Practice Test: ${title}`,
      description: `Auto-generated practice test from uploaded material`,
      createdBy: req.user.id,
      syllabusId: syllabus._id,
      questions: questions.map(q => q._id),
      duration: 30,
      totalPoints: questions.length,
      isActive: true,
      allowedAttempts: 999, // Unlimited attempts for practice
      passingScore: 50
    });

    res.status(201).json({
      status: 'success',
      message: 'Practice test generated successfully',
      data: {
        syllabus: {
          id: syllabus._id,
          title: syllabus.title,
          pageCount: syllabus.pageCount
        },
        test: {
          id: practiceTest._id,
          title: practiceTest.title,
          questionCount: questions.length,
          duration: practiceTest.duration
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
 * @desc    Get all practice tests created by student
 * @route   GET /api/exams/practice
 * @access  Private (Student only)
 */
exports.getPracticeTests = async (req, res, next) => {
  try {
    const practiceTests = await Test.find({
      createdBy: req.user.id,
      title: { $regex: '^Practice Test:', $options: 'i' }
    })
      .populate('syllabusId', 'title pageCount')
      .select('-questions')
      .sort('-createdAt');

    // Add attempt count for each test
    const testsWithStats = await Promise.all(
      practiceTests.map(async (test) => {
        const attemptCount = await Result.countDocuments({
          studentId: req.user.id,
          testId: test._id
        });

        const bestResult = await Result.findOne({
          studentId: req.user.id,
          testId: test._id
        }).sort('-percentage');

        return {
          ...test.toObject(),
          attemptCount,
          bestScore: bestResult ? bestResult.percentage : 0
        };
      })
    );

    res.status(200).json({
      status: 'success',
      count: testsWithStats.length,
      data: {
        practiceTests: testsWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student performance analytics
 * @route   GET /api/exams/analytics
 * @access  Private (Student only)
 */
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('testId', 'title totalPoints');

    if (results.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No test attempts yet',
        data: {
          analytics: {
            totalTests: 0,
            testsCompleted: 0,
            averageScore: 0,
            passRate: 0
          }
        }
      });
    }

    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalTests;

    const analytics = {
      totalTests,
      testsCompleted: totalTests,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round((passedTests / totalTests) * 100 * 100) / 100,
      passedTests,
      failedTests: totalTests - passedTests,
      highestScore: Math.max(...results.map(r => r.percentage)),
      lowestScore: Math.min(...results.map(r => r.percentage)),
      recentTests: results.slice(0, 5).map(r => ({
        testTitle: r.testId?.title,
        score: r.percentage,
        passed: r.passed,
        date: r.submittedAt
      }))
    };

    res.status(200).json({
      status: 'success',
      data: {
        analytics
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete practice test
 * @route   DELETE /api/exams/practice/:testId
 * @access  Private (Student only)
 */
exports.deletePracticeTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Practice test not found'
      });
    }

    // Check if test belongs to student
    if (test.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this test'
      });
    }

    // Delete associated questions
    await Question.deleteMany({ testId: test._id });

    // Delete test
    await test.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Practice test deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};