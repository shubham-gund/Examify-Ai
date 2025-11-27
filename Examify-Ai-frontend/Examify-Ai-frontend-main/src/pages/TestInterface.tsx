import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { examService, resultService } from "@/lib/api";

const TestInterface = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const response = await examService.startTest(id!);
        setTestData(response.data.test);
        setTimeLeft(response.data.test.duration * 60); // Convert to seconds
        toast.success("Test started successfully!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load test");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTest();
    }
  }, [id, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!testData) return;
    setTimeLeft((prev) => prev || testData.duration * 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // We intentionally run this effect once when testData loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < testData.questions.length) {
      const unanswered = testData.questions.length - answeredCount;
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Format answers for submission
      const formattedAnswers = testData.questions.map((q: any, idx: number) => ({
        questionId: q._id,
        answer: answers[idx] || "",
      }));

      const response = await resultService.submit({
        testId: id!,
        answers: formattedAnswers,
        timeSpent,
      });

      toast.success("Test submitted successfully!");
      navigate(`/results/${response.data.result._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!testData) {
    return null;
  }

  const progress = ((currentQuestion + 1) / testData.questions.length) * 100;
  const question = testData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{testData.title}</h1>
              <p className="text-sm text-muted-foreground">{testData.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {testData.questions.length}
            </span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <h2 className="mb-6 text-xl font-semibold">{question.text}</h2>

            {/* TRUE / FALSE (explicit handling) */}
            {question.type === "true_false" && (
              <div className="flex gap-4">
                {["True", "False"].map((opt) => {
                  const selected = answers[currentQuestion] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={submitting}
                      aria-pressed={selected}
                      className={`flex-1 rounded-lg border-2 p-4 text-base font-medium transition-all ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MCQ (if options array exists) */}
            {question.type === "mcq" && Array.isArray(question.options) && (
              <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerSelect}>
                <div className="space-y-3">
                  {question.options.map((option: any, idx: number) => {
                    const id = `q-${question._id}-option-${idx}`;
                    const selected = answers[currentQuestion] === option.text;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={option.text} id={id} />
                        <Label htmlFor={id} className="flex-1 cursor-pointer text-base">
                          {option.text}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}

            {/* Short or Long Answer */}
            {(question.type === "short" || question.type === "long") && (
              <Textarea
                placeholder="Type your answer here..."
                rows={question.type === "long" ? 8 : 4}
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0 || submitting}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === testData.questions.length - 1 ? (
              <Button onClick={handleSubmit} size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={submitting}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Question Navigator</p>
            <div className="flex flex-wrap gap-2">
              {testData.questions.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  disabled={submitting}
                  className={`h-10 w-10 rounded-md border-2 font-medium transition-all ${
                    idx === currentQuestion
                      ? "border-primary bg-primary text-primary-foreground"
                      : answers[idx] !== undefined
                      ? "border-green-500 bg-green-500/10 text-green-700"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestInterface;
