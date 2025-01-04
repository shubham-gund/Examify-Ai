import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { Quiz } from './models/quiz';
import cors from 'cors';
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



const generateQuizPrompt = (syllabus: string) => `
Generate a quiz of EXACTLY 10 questions for this syllabus: ${syllabus}
Return ONLY a JSON array with 10 questions. Each question must have exactly 4 options. 
Must match format: [{"question": "What is...", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]
The response must contain exactly 10 question objects in the array.`;

app.post('/generate-quiz', async (req, res) => {
  const { syllabus } = req.body;
  if (!syllabus) return res.status(400).json({ message: 'Syllabus required' });

  try {
    const result = await model.generateContent(generateQuizPrompt(syllabus));
    const responseText = result.response.text().trim();
    const cleanedText = responseText.replace(/```json\n|\n```/g, '');
    const questions = JSON.parse(cleanedText);

    if (questions.length !== 10) {
      throw new Error(`Expected 10 questions, but got ${questions.length}`);
    }

    const quizId = uuidv4();
    const quiz = new Quiz({ id: quizId, syllabus, questions });
    await quiz.save();

    res.status(201).json({
      message: 'Quiz generated',
      quizId,
      link: `${req.protocol}://${req.get('host')}/quiz/${quizId}`,
      questions
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Quiz generation failed', 
      error: error.message,
    });
  }
});

app.get('/quiz/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

app.listen(process.env.PORT || 5000);