import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, Home } from "lucide-react";

// Mock test data (same as TestInterface)
const mockTestData = {
  subject: "Mathematics",
  topic: "Calculus - Derivatives",
  questions: [
    {
      id: 1,
      question: "What is the derivative of f(x) = x²?",
      options: ["2x", "x", "2", "x²"],
      correct: 0
    },
    {
      id: 2,
      question: "What is the derivative of f(x) = sin(x)?",
      options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
      correct: 0
    },
    {
      id: 3,
      question: "What is the chain rule formula?",
      options: [
        "(f∘g)'(x) = f'(g(x))·g'(x)",
        "(f∘g)'(x) = f'(x)·g'(x)",
        "(f∘g)'(x) = f(x)·g'(x)",
        "(f∘g)'(x) = f'(x)·g(x)"
      ],
      correct: 0
    }
  ]
};

const Results = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // In real app, would fetch from backend
  const score = location.state?.score || 85;
  const userAnswers = location.state?.answers || { 0: 0, 1: 0, 2: 1 };

  const correctCount = mockTestData.questions.filter(
    (q, idx) => userAnswers[idx] === q.correct
  ).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent Work!";
    if (score >= 60) return "Good Effort!";
    return "Keep Practicing!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">Test Results</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Score Overview */}
        <Card className="mb-8 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-3xl font-bold">{getScoreMessage(score)}</h2>
            <p className="mb-4 text-muted-foreground">
              {mockTestData.subject} - {mockTestData.topic}
            </p>
            
            <div className={`mb-6 text-6xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </div>

            <div className="mx-auto mb-6 max-w-md">
              <Progress value={score} className="h-3" />
            </div>

            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockTestData.questions.length - correctCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{mockTestData.questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-bold">Answer Review</h3>
          <div className="space-y-4">
            {mockTestData.questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correct;

              return (
                <Card key={q.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-1 ${
                        isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="mb-3 font-semibold">
                          Question {idx + 1}: {q.question}
                        </p>
                        
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`rounded-lg border-2 p-3 ${
                                optIdx === q.correct
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                  : optIdx === userAnswer && !isCorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {optIdx === q.correct && (
                                  <span className="text-xs font-medium text-green-600">
                                    Correct Answer
                                  </span>
                                )}
                                {optIdx === userAnswer && !isCorrect && (
                                  <span className="text-xs font-medium text-red-600">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/student")} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate(`/test/${id}`)}>
            Retake Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
