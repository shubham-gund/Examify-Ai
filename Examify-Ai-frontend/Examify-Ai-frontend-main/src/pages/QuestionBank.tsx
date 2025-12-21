import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, FileText, CheckCircle, RefreshCw } from "lucide-react";
import { questionService, testService, aiService } from "@/lib/api";

interface Question {
  _id: string;
  text: string;
  type: string;
  options?: string[];
  answer?: string;
}

const QuestionBank = () => {
  const { syllabusId } = useParams<{ syllabusId?: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // For test creation
  const [testTitle, setTestTitle] = useState("");
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    fetchQuestions();
  }, [syllabusId]);

  const handleGenerateQuestions = async () => {
    if (!syllabusId) {
      toast.error("No syllabus selected. Please upload a syllabus first.");
      return;
    }

    setIsGenerating(true);
    try {
      await aiService.generateQuestions(syllabusId, 5, ["mcq"]);
      toast.success("Questions generated successfully!");
      // Refresh questions list
      await fetchQuestions();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = syllabusId
        ? await questionService.getBySyllabus(syllabusId)
        : await questionService.getAllByTeacher();
      setQuestions(response.data.questions || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleCreateTest = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    if (!testTitle.trim()) {
      toast.error("Please enter a test title");
      return;
    }

    setCreatingTest(true);
    try {
      await testService.create({
        title: testTitle,
        description: `Custom test with ${selected.length} selected questions`,
        questions: selected,
        duration,
        allowedAttempts: 2,
        passingScore: 60,
      });

      toast.success("Test created successfully!");
      setSelected([]);
      setTestTitle("");
      setDuration(30);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create test");
    } finally {
      setCreatingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-5xl px-6 py-8">
        <Card className="mb-6 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Select Questions to Create Test
            </CardTitle>
            {syllabusId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className={`p-4 border rounded-lg flex gap-3 items-start ${
                    selected.includes(q._id)
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <Checkbox
                    checked={selected.includes(q._id)}
                    onCheckedChange={() => toggleSelect(q._id)}
                  />
                  <div>
                    <p className="font-medium">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {q.type.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Test Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Create Test from Selected Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test Title</Label>
              <Input
                placeholder="e.g., Data Structures Final Exam"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                disabled={creatingTest}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min="10"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={creatingTest}
              />
            </div>

            <Button
              className="w-full"
              disabled={creatingTest || selected.length === 0}
              onClick={handleCreateTest}
            >
              {creatingTest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Test...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Test ({selected.length} selected)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionBank;
