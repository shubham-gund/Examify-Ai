const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

/**
 * Initialize Gemini AI client
 */
let gemini;
if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Call Gemini AI using official SDK
 */
const callGemini = async (prompt) => {
  try {
    if (!gemini) throw new Error('Gemini API key not configured');

    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' }); // you can also use gemini-2.0-flash when available
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('❌ Gemini API error:', error.message || error);
    throw new Error('Failed to generate response from Gemini AI');
  }
};

/**
 * Call OpenAI (fallback)
 */
const callOpenAI = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an educational AI assistant that helps generate study materials and evaluate answers.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate response from OpenAI');
  }
};

/**
 * Unified AI call
 */
const callAI = async (prompt) => {
  if (AI_PROVIDER === 'openai') return await callOpenAI(prompt);
  if (AI_PROVIDER === 'gemini') return await callGemini(prompt);
  throw new Error('Invalid AI provider configured');
};

/**
 * Generate notes
 */
const generateNotes = async (text) => {
  const prompt = `Based on the following educational content, create comprehensive study notes with:
1. A brief summary
2. Key concepts and definitions
3. Important points to remember
4. Main topics covered

Content:
${text}

Please format the response as JSON with this structure:
{
  "summary": "Brief overview",
  "keyPoints": ["point1", "point2", ...],
  "topics": ["topic1", "topic2", ...],
  "content": "Detailed notes"
}`;

  try {
    const response = await callAI(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    return {
      summary: 'Notes generated successfully',
      keyPoints: [],
      topics: [],
      content: response,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};

/**
 * Generate questions
 */
const generateQuestions = async (text, count = 10, types = ['mcq', 'short', 'long']) => {
  const prompt = `Based on the following educational content, generate ${count} diverse questions.
Include these types: ${types.join(', ')}

Content:
${text}

For each question, provide:
- Question text
- Type (mcq, short, long, or true_false)
- For MCQs: 4 options with correct answer marked
- For other types: a model answer or key points
- Difficulty level (easy, medium, hard)
- Brief explanation

Format as a JSON array of question objects like:
[
  {
    "text": "question text",
    "type": "mcq",
    "options": [
      {"text": "option1", "isCorrect": false},
      {"text": "option2", "isCorrect": true},
      {"text": "option3", "isCorrect": false},
      {"text": "option4", "isCorrect": false}
    ],
    "correctAnswer": "for non-MCQ questions",
    "difficulty": "medium",
    "explanation": "brief explanation"
  }
]`;

  try {
    const response = await callAI(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Failed to parse questions from AI response');
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

/**
 * Evaluate answers
 */
const evaluateAnswer = async (question, studentAnswer, correctAnswer) => {
  const prompt = `Evaluate the following student answer:

Question: ${question}
Student's Answer: ${studentAnswer}
Correct/Model Answer: ${correctAnswer}

Please provide:
1. A score from 0–1
2. Detailed feedback
3. Suggestions for improvement

Format as JSON:
{
  "score": 0.85,
  "isCorrect": true,
  "feedback": "detailed feedback",
  "suggestions": "improvement suggestions"
}`;

  try {
    const response = await callAI(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    return {
      score: 0,
      isCorrect: false,
      feedback: response,
      suggestions: 'Please review the material',
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};

module.exports = {
  generateNotes,
  generateQuestions,
  evaluateAnswer,
  callAI,
};
