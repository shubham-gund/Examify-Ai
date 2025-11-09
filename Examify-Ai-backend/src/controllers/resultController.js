const Result = require('../models/Result');
const Test = require('../models/Test');
const Question = require('../models/Question');
const { evaluateAnswer } = require('../utils/aiService');

/**
 * @desc    Submit test and get results
 * @route   POST /api/results/submit
 * @access  Private (Student only)
 */
exports.submitTest = async (req, res, next) => {
  try {
    const { testId, answers, timeSpent } = req.body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide testId and answers array'
      });
    }

    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

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

    const evaluatedAnswers = [];
    let totalScore = 0;

    for (const submittedAnswer of answers) {
      const question = test.questions.find(
        q => q._id.toString() === submittedAnswer.questionId
      );

      if (!question) continue;

      let evaluation;

      if (question.type === 'mcq' || question.type === 'true_false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        const isCorrect = submittedAnswer.answer.toLowerCase() === correctOption.text.toLowerCase();
        
        evaluation = {
          score: isCorrect ? 1 : 0,
          isCorrect,
          feedback: isCorrect 
            ? 'Correct!' 
            : `Incorrect. Correct answer: ${correctOption.text}`,
          suggestions: question.explanation || ''
        };
      } else {
        evaluation = await evaluateAnswer(
          question.text,
          submittedAnswer.answer,
          question.correctAnswer || question.explanation || 'No model answer provided'
        );
      }

      const pointsEarned = Math.round(evaluation.score * (question.points || 1));
      totalScore += pointsEarned;

      evaluatedAnswers.push({
        questionId: question._id,
        answer: submittedAnswer.answer,
        isCorrect: evaluation.isCorrect,
        pointsEarned,
        aiFeedback: evaluation.feedback
      });
    }

    const percentage = (totalScore / test.totalPoints) * 100;
    const passed = percentage >= test.passingScore;

    const result = await Result.create({
      studentId: req.user.id,
      testId: test._id,
      answers: evaluatedAnswers,
      score: totalScore,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      feedback: passed 
        ? 'Congratulations! You passed the test.' 
        : 'Keep practicing. You can do better!',
      evaluationType: 'ai',
      timeSpent,
      attemptNumber: attemptCount + 1
    });

    await result.populate([
      { path: 'testId', select: 'title totalPoints' },
      { path: 'studentId', select: 'name email' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Test submitted successfully',
      data: {
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's results
 * @route   GET /api/results/my-results
 * @access  Private (Student only)
 */
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('testId', 'title totalPoints')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: {
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single result with detailed answers
 * @route   GET /api/results/:id
 * @access  Private
 */
exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('testId')
      .populate('studentId', 'name email')
      .populate('answers.questionId');

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Result not found'
      });
    }

    if (
      req.user.role === 'student' && 
      result.studentId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this result'
      });
    }

    if (
      req.user.role === 'teacher' && 
      result.testId.createdBy.toString() !== req.user.id
    ) {
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
 * @desc    Get all results for a specific test (Teacher only)
 * @route   GET /api/results/test/:testId
 * @access  Private (Teacher only)
 */
exports.getTestResults = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view results for this test'
      });
    }

    const results = await Result.find({ testId: req.params.testId })
      .populate('studentId', 'name email')
      .sort('-score');

    const stats = {
      totalAttempts: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length || 0,
      passCount: results.filter(r => r.passed).length,
      failCount: results.filter(r => !r.passed).length,
      highestScore: Math.max(...results.map(r => r.score), 0),
      lowestScore: Math.min(...results.map(r => r.score), test.totalPoints)
    };

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: {
        results,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};