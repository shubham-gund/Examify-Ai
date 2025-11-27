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

    if (typeof test.allowedAttempts === 'number' && attemptCount >= test.allowedAttempts) {
      return res.status(403).json({
        status: 'error',
        message: 'Maximum attempts reached for this test'
      });
    }

    const evaluatedAnswers = [];
    let totalScore = 0;

    // helper: normalize different answer shapes to comparable strings
    const normalize = (v) => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return v ? 'true' : 'false';
      if (typeof v === 'number') return String(v).trim().toLowerCase();
      if (typeof v === 'object') {
        // try common fields
        if (v.text) return String(v.text).trim().toLowerCase();
        if (v.value) return String(v.value).trim().toLowerCase();
        if (v.id) return String(v.id).trim().toLowerCase();
        // fallback to JSON string
        try {
          return JSON.stringify(v).trim().toLowerCase();
        } catch (err) {
          return '';
        }
      }
      // string
      const s = String(v).trim().toLowerCase();
      if (['t', 'true', '1', 'yes', 'y'].includes(s)) return 'true';
      if (['f', 'false', '0', 'no', 'n'].includes(s)) return 'false';
      return s;
    };

    for (const submittedAnswer of answers) {
      const question = test.questions.find(
        q => q._id.toString() === String(submittedAnswer.questionId)
      );

      if (!question) continue;

      let evaluation;

      if (question.type === 'mcq' || question.type === 'true_false') {
        // Determine correct answer from multiple possible schema shapes

        // 1) Try options array (common for MCQ)
        let correctValue = '';
        if (Array.isArray(question.options) && question.options.length) {
          // common markers: isCorrect, correct, is_answer, is_correct
          const correctOpt = question.options.find(opt =>
            opt && (opt.isCorrect === true || opt.correct === true || opt.is_answer === true || opt.is_correct === true)
          ) || question.options.find(opt => {
            // maybe stored as answer: true or similar
            return opt && (opt.answer === true || opt.correct_answer === true);
          });

          if (correctOpt) {
            // prefer text/value/id/label
            correctValue = normalize(correctOpt.text ?? correctOpt.value ?? correctOpt.label ?? correctOpt.id ?? correctOpt);
          }
        }

        // 2) Fallbacks: common fields that might contain correct answer
        if (!correctValue && (question.correctAnswer !== undefined && question.correctAnswer !== null)) {
          correctValue = normalize(question.correctAnswer);
        }
        if (!correctValue && (question.correct_answer !== undefined && question.correct_answer !== null)) {
          correctValue = normalize(question.correct_answer);
        }
        if (!correctValue && (question.answer !== undefined && question.answer !== null)) {
          correctValue = normalize(question.answer);
        }
        if (!correctValue && (question.explanation !== undefined && question.explanation !== null)) {
          // sometimes teacher puts a model answer in explanation
          correctValue = normalize(question.explanation);
        }

        // submitted normalization
        const submittedRaw = (submittedAnswer && (submittedAnswer.answer ?? submittedAnswer.value ?? submittedAnswer.optionId ?? submittedAnswer)) ?? '';
        const submittedValue = normalize(submittedRaw);

        // If correctValue is empty, we can't automatically grade reliably.
        let isCorrect = false;
        if (correctValue) {
          // direct compare
          isCorrect = submittedValue === correctValue;
          // extra check: if options use ids and submittedValue may be an id while correctValue is text
          // try comparing against option ids as well if options exist
          if (!isCorrect && Array.isArray(question.options) && question.options.length) {
            const optById = question.options.find(opt => normalize(opt.id ?? opt._id) === submittedValue);
            if (optById) {
              const correctOpt = question.options.find(opt =>
                opt && (opt.isCorrect === true || opt.correct === true || opt.is_answer === true || opt.is_correct === true)
              );
              isCorrect = !!(correctOpt && normalize(correctOpt.text ?? correctOpt.value ?? correctOpt.id) === normalize(optById.text ?? optById.value ?? optById.id));
            }
          }
        } else {
          // No machine-readable correct answer found — log a warning (server-side) and treat as ungraded/incorrect
          console.warn(`[Examify] No correct answer metadata for question ${question._id}. Manual grading or schema fix recommended.`);
          isCorrect = false;
        }

        evaluation = {
          score: isCorrect ? 1 : 0,
          isCorrect,
          feedback: isCorrect
            ? 'Correct!'
            : (correctValue ? `Incorrect. Correct answer: ${correctValue}` : 'Incorrect. Correct answer not available'),
          suggestions: question.explanation || ''
        };
      } else {
        // non-mcq -> use AI evaluation (existing)
        evaluation = await evaluateAnswer(
          question.text || question.question_text || question.questionText || '',
          submittedAnswer && (submittedAnswer.answer ?? submittedAnswer) || '',
          question.correctAnswer || question.explanation || 'No model answer provided'
        );
        // make sure evaluation has score/isCorrect/feedback
        evaluation = {
          score: typeof evaluation.score === 'number' ? evaluation.score : (evaluation.isCorrect ? 1 : 0),
          isCorrect: !!evaluation.isCorrect,
          feedback: evaluation.feedback || (evaluation.isCorrect ? 'Correct' : 'Incorrect'),
          suggestions: evaluation.suggestions || ''
        };
      }

      const pointsEarned = Math.round((evaluation.score || 0) * (question.points || 1));
      totalScore += pointsEarned;

      evaluatedAnswers.push({
        questionId: question._id,
        answer: submittedAnswer.answer ?? submittedAnswer,
        isCorrect: !!evaluation.isCorrect,
        pointsEarned,
        aiFeedback: evaluation.feedback
      });
    }

    const totalPoints = Number(test.totalPoints) || 0;
    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = typeof test.passingScore === 'number' ? (percentage >= test.passingScore) : false;

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
      averageScore: results.length ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) : 0,
      passCount: results.filter(r => r.passed).length,
      failCount: results.filter(r => !r.passed).length,
      highestScore: results.length ? Math.max(...results.map(r => r.score || 0)) : 0,
      lowestScore: results.length ? Math.min(...results.map(r => r.score || 0)) : 0
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
