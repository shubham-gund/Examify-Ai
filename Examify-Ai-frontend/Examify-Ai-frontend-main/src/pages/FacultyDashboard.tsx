import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Loader2, FileText, BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, syllabusService, aiService, testService } from "@/lib/api";

interface Test {
  _id: string;
  title: string;
  description?: string;
  questions: any[];
  duration: number;
  totalPoints: number;
  createdAt: string;
}

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Form state
  const [testTitle, setTestTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualSyllabus, setManualSyllabus] = useState("");
  const [inputMode, setInputMode] = useState<"pdf" | "manual">("pdf");
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    short: false,
    long: false,
    true_false: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Load user and tests
  // ===============================
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== "teacher") {
      navigate("/login?role=faculty");
      return;
    }
    setUser(currentUser);
    fetchTests();
  }, [navigate]);

  const fetchTests = async () => {
    try {
      const tests = await testService.getAll();
      setTests(tests || []);
    } catch (error: any) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };



  // ===============================
  // Handlers
  // ===============================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only");
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleQuestionTypeChange = (type: keyof typeof questionTypes) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const getSelectedTypes = () => {
    return Object.entries(questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);
  };

  // ===============================
  // Generate Test
  // ===============================
  const handleGenerateTest = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!testTitle.trim()) {
    toast.error("Please enter a test title");
    return;
  }

  const selectedTypes = getSelectedTypes();
  if (selectedTypes.length === 0) {
    toast.error("Please select at least one question type");
    return;
  }

  if (questionCount < 5 || questionCount > 50) {
    toast.error("Number of questions must be between 5 and 50");
    return;
  }

  if (inputMode === "pdf" && !selectedFile) {
    toast.error("Please upload a PDF syllabus");
    return;
  }

  if (inputMode === "manual" && !manualSyllabus.trim()) {
    toast.error("Please type your syllabus content");
    return;
  }

  setIsGenerating(true);

  try {
    let syllabusId = "";

    // 🧾 Step 1: Upload syllabus (always FormData)
    toast.loading("Uploading syllabus...", { id: "upload" });
    const formData = new FormData();
    formData.append("title", testTitle);

    if (inputMode === "pdf") {
      formData.append("pdf", selectedFile!);
    } else {
      formData.append("content", manualSyllabus);
    }

    const syllabusResponse = await syllabusService.upload(formData);
    syllabusId = syllabusResponse.data.syllabus.id; // ✅ fixed access path

    toast.success("Syllabus uploaded successfully!", { id: "upload" });

    // 🤖 Step 2: Generate questions using AI
    toast.loading("Generating questions with AI...", { id: "generate" });
    const questionsResponse = await aiService.generateQuestions(
      syllabusId,
      questionCount,
      selectedTypes
    );

    const generatedQuestions = questionsResponse.data.questions;
    if (!generatedQuestions || generatedQuestions.length === 0) {
      throw new Error("No questions generated");
    }

    toast.success(`Generated ${generatedQuestions.length} questions!`, { id: "generate" });

    // 🚀 Step 3: Redirect to Question Bank page
    toast.success("Redirecting to Question Bank...", { id: "redirect" });

    // Redirect to QuestionBank page with syllabusId in URL
    navigate(`/faculty/questions?syllabusId=${syllabusId}`);

    // 🧹 Reset local state
    setTestTitle("");
    setSelectedFile(null);
    setManualSyllabus("");
    setQuestionCount(10);
    setQuestionTypes({
      mcq: true,
      short: false,
      long: false,
      true_false: false,
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    toast.error(error.message || "Failed to generate questions");
  } finally {
    setIsGenerating(false);
  }
};


  // ===============================
  // Utils
  // ===============================
  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ===============================
  // Render
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Faculty Portal</h1>
              {user && (
                <p className="text-sm text-muted-foreground">{user.name}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Generate Test Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Generate New Mock Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateTest} className="space-y-4">
              {/* Test Title */}
              <div className="space-y-2">
                <Label htmlFor="testTitle">Test Title</Label>
                <Input
                  id="testTitle"
                  type="text"
                  placeholder="e.g., Data Structures - Mid Term"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              {/* Input Mode */}
              <div className="space-y-2">
                <Label>Syllabus Input Mode</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={inputMode === "pdf"}
                      onChange={() => setInputMode("pdf")}
                      disabled={isGenerating}
                    />
                    Upload PDF
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={inputMode === "manual"}
                      onChange={() => setInputMode("manual")}
                      disabled={isGenerating}
                    />
                    Type Manually
                  </label>
                </div>
              </div>

              {/* Syllabus Input */}
              {inputMode === "pdf" ? (
                <div className="space-y-2">
                  <Label htmlFor="pdfFile">Upload Syllabus (PDF)</Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isGenerating}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {selectedFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="manualSyllabus">Type Syllabus</Label>
                  <Textarea
                    id="manualSyllabus"
                    placeholder="Type or paste syllabus content here..."
                    rows={6}
                    value={manualSyllabus}
                    onChange={(e) => setManualSyllabus(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              )}

              {/* Question Count */}
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(parseInt(e.target.value) || 5)
                  }
                  disabled={isGenerating}
                />
                <p className="text-sm text-muted-foreground">Min: 5, Max: 50</p>
              </div>

              {/* Question Types */}
              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="flex flex-wrap gap-4">
                  {["mcq", "short", "long", "true_false"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={questionTypes[type as keyof typeof questionTypes]}
                        onCheckedChange={() =>
                          handleQuestionTypeChange(type as keyof typeof questionTypes)
                        }
                        disabled={isGenerating}
                      />
                      <label
                        htmlFor={type}
                        className="text-sm font-medium leading-none"
                      >
                        {type.replace("_", "/").toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Test
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tests Section */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Your Tests</h2>
          {tests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No tests created yet. Generate your first test above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tests.map((test) => (
                <Card key={test._id} className="transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{test.title}</h3>
                        </div>

                        {test.description && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            {test.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>{test.questions?.length || 0} questions</span>
                          <span>{test.duration} min</span>
                          {test.createdBy?.name && (
                            <span>By {test.createdBy.name}</span>
                          )}
                          <span>Created {formatDate(test.createdAt)}</span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
