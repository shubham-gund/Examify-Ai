const Question = require("../models/Question");

exports.getAllQuestionsByTeacher = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user.id })
      .populate("syllabusId", "title")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      data: { questions },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch questions",
    });
  }
};

exports.getQuestionsBySyllabus = async (req, res) => {
  try {
    const { syllabusId } = req.params;

    const questions = await Question.find({
      createdBy: req.user.id,
      syllabusId,
    }).sort("-createdAt");

    res.status(200).json({
      status: "success",
      data: { questions },
    });
  } catch (error) {
    console.error("Error fetching syllabus questions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch syllabus questions",
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { syllabusId, text, type, options, correctAnswer, marks } = req.body;

    const question = await Question.create({
      syllabusId,
      createdBy: req.user.id,
      text,
      type,
      options: options || [],
      correctAnswer,
      marks: marks || 1,
    });

    res.status(201).json({
      status: "success",
      data: { question },
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create question",
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findOneAndDelete({
      _id: id,
      createdBy: req.user.id,
    });

    if (!question) {
      return res.status(404).json({
        status: "error",
        message: "Question not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete question",
    });
  }
};
