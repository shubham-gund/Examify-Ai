import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Mock test data
const mockTestData = {
  id: 1,
  subject: "Mathematics",
  topic: "Calculus - Derivatives",
  duration: 30,
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

const TestInterface = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(mockTestData.duration * 60); // in seconds

  useEffect(() => {
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
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < mockTestData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < mockTestData.questions.length) {
      const unanswered = mockTestData.questions.length - answeredCount;
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    // Calculate score
    let correct = 0;
    mockTestData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });

    toast.success("Test submitted successfully!");
    navigate(`/results/${id}`, { 
      state: { 
        score: Math.round((correct / mockTestData.questions.length) * 100),
        answers 
      } 
    });
  };

  const progress = ((currentQuestion + 1) / mockTestData.questions.length) * 100;
  const question = mockTestData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{mockTestData.subject}</h1>
              <p className="text-sm text-muted-foreground">{mockTestData.topic}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {mockTestData.questions.length}
            </span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <h2 className="mb-6 text-xl font-semibold">
              {question.question}
            </h2>

            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                      answers[currentQuestion] === idx
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === mockTestData.questions.length - 1 ? (
              <Button onClick={handleSubmit} size="lg">
                Submit Test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Question Navigator
            </p>
            <div className="flex flex-wrap gap-2">
              {mockTestData.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`h-10 w-10 rounded-md border-2 font-medium transition-all ${
                    idx === currentQuestion
                      ? 'border-primary bg-primary text-primary-foreground'
                      : answers[idx] !== undefined
                      ? 'border-green-500 bg-green-500/10 text-green-700'
                      : 'border-border hover:border-primary/50'
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
