const Syllabus = require('../models/Syllabus');
const Note = require('../models/Note');
const Question = require('../models/Question');
const { generateNotes, generateQuestions, evaluateAnswer } = require('../utils/aiService');
const { splitTextIntoChunks } = require('../utils/pdfParser');

exports.generateQuestions = async (req, res) => {
  try {
    const { syllabusId, count, types } = req.body;
    const userId = req.user.id;

    // Mock AI question generation (replace with your AI logic)
    const generated = Array.from({ length: count }, (_, i) => ({
      text: `Sample question ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      syllabusId,
      createdBy: userId,
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      marks: 1,
    }));

    // Save generated questions to DB
    const questions = await Question.insertMany(generated);

    res.status(201).json({
      status: "success",
      data: { questions },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate questions",
    });
  }
};


/**
 * @desc    Generate notes from syllabus
 * @route   POST /api/ai/generate-notes
 * @access  Private
 */
exports.generateNotesFromSyllabus = async (req, res, next) => {
  try {
    const { syllabusId } = req.body;

    if (!syllabusId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide syllabusId'
      });
    }

    const syllabus = await Syllabus.findById(syllabusId);

    if (!syllabus) {
      return res.status(404).json({
        status: 'error',
        message: 'Syllabus not found'
      });
    }

    const existingNote = await Note.findOne({ 
      syllabusId, 
      createdBy: req.user.id 
    });

    if (existingNote) {
      return res.status(200).json({
        status: 'success',
        message: 'Notes already generated for this syllabus',
        data: {
          note: existingNote
        }
      });
    }

    const chunks = splitTextIntoChunks(syllabus.parsedText, 3000);
    const firstChunk = chunks[0];

    const aiResponse = await generateNotes(firstChunk);

    const note = await Note.create({
      syllabusId,
      content: aiResponse.content || JSON.stringify(aiResponse),
      summary: aiResponse.summary,
      keyPoints: aiResponse.keyPoints || [],
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Notes generated successfully',
      data: {
        note
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate questions from syllabus
 * @route   POST /api/ai/generate-questions
 * @access  Private (Teacher only)
 */
exports.generateQuestionsFromSyllabus = async (req, res, next) => {
  try {
    const { syllabusId, count = 10, types = ['mcq'] } = req.body;

    if (!syllabusId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide syllabusId'
      });
    }

    const syllabus = await Syllabus.findById(syllabusId);

    if (!syllabus) {
      return res.status(404).json({
        status: 'error',
        message: 'Syllabus not found'
      });
    }

    const chunks = splitTextIntoChunks(syllabus.parsedText, 3000);
    const textForQuestions = chunks.slice(0, 2).join('\n\n');

    const aiQuestions = await generateQuestions(textForQuestions, count, types);

    const cleanedQuestions = aiQuestions.map(q => ({
      ...q,
      correctAnswer: typeof q.correctAnswer === 'object'
        ? JSON.stringify(q.correctAnswer)
        : q.correctAnswer,
      syllabusId,
      createdBy: req.user.id,
    }));

    const questions = await Question.insertMany(cleanedQuestions);


    res.status(201).json({
      status: 'success',
      message: 'Questions generated successfully',
      count: questions.length,
      data: {
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Evaluate student answer using AI
 * @route   POST /api/ai/evaluate
 * @access  Private
 */
exports.evaluateAnswerWithAI = async (req, res, next) => {
  try {
    const { questionId, studentAnswer } = req.body;

    if (!questionId || !studentAnswer) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide questionId and studentAnswer'
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    let evaluation;

    if (question.type === 'mcq' || question.type === 'true_false') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = studentAnswer.toLowerCase() === correctOption.text.toLowerCase();
      
      evaluation = {
        score: isCorrect ? 1 : 0,
        isCorrect,
        feedback: isCorrect ? 'Correct answer!' : `Incorrect. The correct answer is: ${correctOption.text}`,
        suggestions: question.explanation || 'Review the material for better understanding'
      };
    } else {
      evaluation = await evaluateAnswer(
        question.text,
        studentAnswer,
        question.correctAnswer || question.explanation
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Answer evaluated successfully',
      data: {
        evaluation: {
          ...evaluation,
          pointsEarned: Math.round(evaluation.score * question.points)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get generated notes for syllabus
 * @route   GET /api/ai/notes/:syllabusId
 * @access  Private
 */
exports.getNotesForSyllabus = async (req, res, next) => {
  try {
    const notes = await Note.find({ 
      syllabusId: req.params.syllabusId 
    }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      count: notes.length,
      data: {
        notes
      }
    });
  } catch (error) {
    next(error);
  }
};