import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, Home, Loader2 } from "lucide-react";
import { resultService } from "@/lib/api";
import { toast } from "sonner";

const Results = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const response = await resultService.getById(id!);
        setResultData(response.data.result);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load results");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadResult();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

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

  const correctCount = resultData.answers.filter((a: any) => a.isCorrect).length;

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
            <h2 className="mb-2 text-3xl font-bold">{getScoreMessage(resultData.percentage)}</h2>
            <p className="mb-4 text-muted-foreground">
              {resultData.testId.title}
            </p>
            
            <div className={`mb-6 text-6xl font-bold ${getScoreColor(resultData.percentage)}`}>
              {resultData.percentage.toFixed(1)}%
            </div>

            <div className="mx-auto mb-6 max-w-md">
              <Progress value={resultData.percentage} className="h-3" />
            </div>

            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">
                  {resultData.answers.length - correctCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{resultData.answers.length}</p>
              </div>
            </div>

            {resultData.feedback && (
              <p className="mt-4 text-muted-foreground">{resultData.feedback}</p>
            )}
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-bold">Answer Review</h3>
          <div className="space-y-4">
            {resultData.answers.map((answer: any, idx: number) => {
              const question = answer.questionId;
              
              return (
                <Card key={answer._id || idx} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-1 ${
                        answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="mb-3 font-semibold">
                          Question {idx + 1}: {question.text}
                        </p>
                        
                        {/* MCQ/True-False Questions */}
                        {(question.type === 'mcq' || question.type === 'true_false') && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option: any, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={`rounded-lg border-2 p-3 ${
                                  option.isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                    : option.text === answer.answer && !answer.isCorrect
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.text}</span>
                                  {option.isCorrect && (
                                    <span className="text-xs font-medium text-green-600">
                                      Correct Answer
                                    </span>
                                  )}
                                  {option.text === answer.answer && !answer.isCorrect && (
                                    <span className="text-xs font-medium text-red-600">
                                      Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short/Long Answer Questions */}
                        {(question.type === 'short' || question.type === 'long') && (
                          <div className="space-y-3">
                            <div className="rounded-lg border-2 border-border bg-muted/50 p-3">
                              <p className="mb-1 text-xs font-medium text-muted-foreground">Your Answer:</p>
                              <p className="text-sm">{answer.answer || "No answer provided"}</p>
                            </div>
                            {question.correctAnswer && (
                              <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/20 p-3">
                                <p className="mb-1 text-xs font-medium text-green-600">Model Answer:</p>
                                <p className="text-sm">{question.correctAnswer}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Feedback */}
                        {answer.aiFeedback && (
                          <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
                            <p className="text-xs font-medium text-blue-600 mb-1">AI Feedback:</p>
                            <p className="text-sm">{answer.aiFeedback}</p>
                          </div>
                        )}

                        {/* Points */}
                        <div className="mt-3 text-sm text-muted-foreground">
                          Points: {answer.pointsEarned} / {question.points || 1}
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
          {resultData.testId.allowedAttempts > resultData.attemptNumber && (
            <Button onClick={() => navigate(`/test/${resultData.testId._id}`)}>
              Retake Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;