import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type Quiz = {
  id: string;
  syllabus: string;
  questions: Question[];
};

const Landing = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // React Router's navigation hook

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get('http://localhost:5000/quiz/all');
        setQuizzes(response.data.quizzes);
      } catch (error: any) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Available Quizzes</h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-semibold text-gray-800">{quiz.syllabus}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Questions: {quiz.questions.length}
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
                  onClick={() => navigate(`/quiz/${quiz.id}`)} // Navigate to the quiz page
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No quizzes available.</p>
        )}
      </div>
    </div>
  );
};

export default Landing;
