import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Upload,
  Loader2,
  TrendingUp 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService, examService } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { syllabusService, aiService } from "@/lib/api";
import { FileText } from "lucide-react";
import { notesService } from "@/lib/api";
import ThemeToggle from "@/components/ui/themeToggle";


interface Test {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  totalPoints: number;
  attemptCount: number;
  attemptsRemaining: number;
  canAttempt: boolean;
  passingScore: number;
  questions: any[];
}

interface Analytics {
  totalTests: number;
  testsCompleted: number;
  averageScore: number;
  passRate: number;
  passedTests: number;
  failedTests: number;
  highestScore: number;
  lowestScore: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [practiceTitle, setPracticeTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ===============================
  // Notes Generation State
  // ===============================
  const [notes, setNotes] = useState<any[]>([]);
  const [notesTitle, setNotesTitle] = useState("");
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesInputMode, setNotesInputMode] = useState<"pdf" | "manual">("pdf");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);


  const handleNotesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    setNotesFile(file);
  };


  const handleGenerateNotes = async () => {
    if (!notesTitle.trim()) {
      toast.error("Please enter notes title");
      return;
    }

    if (notesInputMode === "pdf" && !notesFile) {
      toast.error("Please upload a PDF syllabus");
      return;
    }

    if (notesInputMode === "manual" && !notesText.trim()) {
      toast.error("Please type syllabus content");
      return;
    }

    setIsGeneratingNotes(true);

    try {
      let syllabusId = "";

      // Step 1: Upload syllabus
      const formData = new FormData();
      formData.append("title", notesTitle);

      if (notesInputMode === "pdf") {
        formData.append("pdf", notesFile!);
      } else {
        formData.append("content", notesText);
      }

      const syllabusResponse = await syllabusService.upload(formData);

      syllabusId =
        syllabusResponse.data?.syllabus?.id ||
        syllabusResponse.data?.syllabus?._id ||
        syllabusResponse.data?.id;

      if (!syllabusId) {
        throw new Error("Failed to get syllabus ID");
      }

      // Step 2: Generate notes
      const notesResponse = await aiService.generateNotes(syllabusId);

      toast.success("Notes generated successfully!");
      navigate(`/notes/${notesResponse.data.note._id}`);

      // Reset
      setNotesTitle("");
      setNotesFile(null);
      setNotesText("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate notes");
    } finally {
      setIsGeneratingNotes(false);
    }
  };


  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login?role=student');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsResponse, analyticsResponse, notesResponse] = await Promise.all([
        examService.getAvailable(),
        examService.getAnalytics(),
        notesService.getMyNotes(),
      ]);

      setTests(testsResponse.data.tests || []);
      setAnalytics(analyticsResponse.data.analytics || null);
      setNotes(notesResponse.data.notes || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadForPractice = async () => {
    if (!selectedFile || !practiceTitle) {
      toast.error("Please provide both file and title");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('title', practiceTitle);
      formData.append('questionCount', '15');
      formData.append('questionTypes', 'mcq,short');

      const response = await examService.uploadForPractice(formData);
      toast.success("Practice test generated successfully!");
      
      // Navigate to the practice test
      navigate(`/test/${response.data.test.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate practice test");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const getDifficultyBadge = (test: Test) => {
    const avgPoints = test.totalPoints / (test.questions?.length || 1);
    if (avgPoints >= 5) return { label: "Hard", color: "bg-red-500/10 text-red-700" };
    if (avgPoints >= 2) return { label: "Medium", color: "bg-yellow-500/10 text-yellow-700" };
    return { label: "Easy", color: "bg-green-500/10 text-green-700" };
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
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img 
                  src="/favicon.png" 
                  alt="Examify AI logo" 
                  className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              {user && <p className="text-sm text-muted-foreground">{user.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Stats Overview */}
        {analytics && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tests Completed</p>
                    <p className="text-2xl font-bold">{analytics.testsCompleted}</p>
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
                    <p className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-2xl font-bold">{analytics.passRate.toFixed(0)}%</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Tests</p>
                    <p className="text-2xl font-bold">{tests.filter(t => t.canAttempt).length}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload for Practice */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Generate Practice Test</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your study material and we'll generate a personalized practice test for you!
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="practiceTitle">Test Title</Label>
                <Input
                  id="practiceTitle"
                  placeholder="e.g., Physics Chapter 3 Practice"
                  value={practiceTitle}
                  onChange={(e) => setPracticeTitle(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="practiceFile">Upload PDF</Label>
                  <Input
                    id="practiceFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                </div>
                <Button
                  onClick={handleUploadForPractice}
                  disabled={!selectedFile || !practiceTitle || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===============================
            Generate Notes Section
        =============================== */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Generate Notes</h3>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>Notes Title</Label>
                <Input
                  placeholder="e.g., DBMS Unit 1 Notes"
                  value={notesTitle}
                  onChange={(e) => setNotesTitle(e.target.value)}
                  disabled={isGeneratingNotes}
                />
              </div>

              {/* Input Mode */}
              <div className="space-y-2">
                <Label>Syllabus Input Mode</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={notesInputMode === "pdf"}
                      onChange={() => setNotesInputMode("pdf")}
                      disabled={isGeneratingNotes}
                    />
                    Upload PDF
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={notesInputMode === "manual"}
                      onChange={() => setNotesInputMode("manual")}
                      disabled={isGeneratingNotes}
                    />
                    Type Manually
                  </label>
                </div>
              </div>

              {/* Input */}
              {notesInputMode === "pdf" ? (
                <div className="space-y-2">
                  <Label>Upload Syllabus PDF</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleNotesFileChange}
                    disabled={isGeneratingNotes}
                  />
                  {notesFile && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {notesFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Type Syllabus</Label>
                  <Textarea
                    rows={5}
                    placeholder="Paste syllabus content here..."
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    disabled={isGeneratingNotes}
                  />
                </div>
              )}

              {/* Button */}
              <Button
                onClick={handleGenerateNotes}
                disabled={isGeneratingNotes}
                className="w-full"
              >
                {isGeneratingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Notes...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Notes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>


{notes.length > 0 && (
  <div className="mb-8">
    <div className="mb-4 flex items-center justify-between">
      <h2
        className="text-2xl font-bold cursor-pointer hover:underline"
        onClick={() => navigate("/notes")}
      >
        My Notes
      </h2>

      <Button
        size="sm"
        onClick={() => navigate("/notes")}
        className=" "
      >
        View All
      </Button>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {notes.slice(0, 4).map((note) => (
        <Card
          key={note._id}
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate(`/notes/${note._id}`)}
        >
          <CardContent className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold line-clamp-1">
                {note.title || "Generated Notes"}
              </h3>
            </div>

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {note.content?.substring(0, 150)}...
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}

        {/* Available Tests */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Available Mock Tests</h2>
          {tests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No tests available at the moment. Check back later!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => {
                const difficulty = getDifficultyBadge(test);
                return (
                  <Card key={test._id} className="transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{test.title}</h3>
                            <Badge className={difficulty.color}>
                              {difficulty.label}
                            </Badge>
                            {!test.canAttempt && (
                              <Badge variant="outline" className="bg-muted">
                                No attempts left
                              </Badge>
                            )}
                          </div>
                          {test.description && (
                            <p className="mb-3 text-muted-foreground">{test.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {test.questions?.length || test.totalPoints} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {test.duration} minutes
                            </span>
                            <span>
                              Attempts: {test.attemptCount} / {test.attemptsRemaining + test.attemptCount}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {test.canAttempt ? (
                            <Button
                              onClick={() => navigate(`/test/${test._id}`)}
                              className="w-full sm:w-auto"
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start Test
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="w-full sm:w-auto">
                              No Attempts Left
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;