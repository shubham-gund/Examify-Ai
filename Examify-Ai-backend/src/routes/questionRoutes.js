const express = require("express");
const {
  getAllQuestionsByTeacher,
  getQuestionsBySyllabus,
  createQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { protect, authorize } = require("../middlewares/auth"); // ✅ same pattern as aiRoutes

const router = express.Router();

console.log("✅ questionRoutes file loaded");

// 🔒 Protect all routes (user must be logged in)
router.use(protect);

// ✅ Get all questions created by the logged-in teacher
router.get("/", authorize("teacher"), getAllQuestionsByTeacher);

// ✅ Get all questions for a specific syllabus
router.get("/syllabus/:syllabusId", authorize("teacher"), getQuestionsBySyllabus);

// ✅ Create a new manual question
router.post("/", authorize("teacher"), createQuestion);

// ✅ Delete a question
router.delete("/:id", authorize("teacher"), deleteQuestion);

module.exports = router;
