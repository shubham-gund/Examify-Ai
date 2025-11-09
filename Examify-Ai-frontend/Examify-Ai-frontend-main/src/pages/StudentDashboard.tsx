import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Mock available tests
  const mockTests = [
    { 
      id: 1, 
      subject: "Mathematics", 
      topic: "Calculus - Derivatives", 
      questions: 15, 
      duration: 30,
      difficulty: "Medium",
      status: "available"
    },
    { 
      id: 2, 
      subject: "Physics", 
      topic: "Mechanics - Newton's Laws", 
      questions: 20, 
      duration: 45,
      difficulty: "Hard",
      status: "available"
    },
    { 
      id: 3, 
      subject: "Chemistry", 
      topic: "Organic Chemistry Basics", 
      questions: 10, 
      duration: 20,
      difficulty: "Easy",
      status: "completed",
      score: 85
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "Hard": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tests Completed</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Tests</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <PlayCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Tests */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Available Mock Tests</h2>
          <div className="grid gap-4">
            {mockTests.map((test) => (
              <Card key={test.id} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{test.subject}</h3>
                        <Badge className={getDifficultyColor(test.difficulty)}>
                          {test.difficulty}
                        </Badge>
                        {test.status === "completed" && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="mb-3 text-muted-foreground">{test.topic}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {test.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {test.duration} minutes
                        </span>
                        {test.status === "completed" && (
                          <span className="font-medium text-green-600">
                            Score: {test.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {test.status === "available" ? (
                        <Button 
                          onClick={() => navigate(`/test/${test.id}`)}
                          className="w-full sm:w-auto"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Test
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/results/${test.id}`)}
                          className="w-full sm:w-auto"
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
