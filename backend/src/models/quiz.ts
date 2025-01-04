import mongoose from "mongoose";
const quizSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  syllabus: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

export const Quiz = mongoose.model('Quiz', quizSchema);