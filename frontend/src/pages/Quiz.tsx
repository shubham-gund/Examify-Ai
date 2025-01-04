import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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

const QuizApp = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Quiz ID is missing.');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/quiz/${id}`);
        setQuiz(response.data.quiz);
        setUserAnswers(new Array(response.data.quiz.questions.length).fill(''));
      } catch (error: any) {
        setError('Error fetching quiz');
        console.error(error);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((score, question, index) => {
      return userAnswers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-black p-6 rounded-lg shadow-lg mt-8">
      {quiz ? (
        <>
          <h2 className="text-3xl font-semibold text-center mb-6">Quiz: {quiz.syllabus}</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-2">{question.question}</h3>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={userAnswers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        disabled={isSubmitted}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded-full focus:ring-blue-500"
                      />
                      <span className="text-lg">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </form>

          <div className="text-center mt-6">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition duration-200"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="text-xl font-semibold">
                <h3>Your Score: {calculateScore()} / {quiz.questions.length}</h3>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">Loading quiz...</div>
      )}
    </div>
  );
};

export default QuizApp;
