import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, FileText, BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState("");
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock previous tests
  const mockTests = [
    { id: 1, subject: "Mathematics", topic: "Calculus", questions: 15, created: "2024-01-15" },
    { id: 2, subject: "Physics", topic: "Mechanics", questions: 20, created: "2024-01-10" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("File uploaded successfully");
      // In real app, would extract text from PDF
    }
  };

  const handleGenerateTest = () => {
    if (!syllabus || !subject) {
      toast.error("Please provide both subject and syllabus");
      return;
    }

    setIsGenerating(true);
    // Mock API call - would call Gemini API via backend
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Mock test generated successfully!");
      setSyllabus("");
      setSubject("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Faculty Portal</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Generate Test Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Generate New Mock Test</CardTitle>
            <CardDescription>Upload syllabus or paste content to generate AI-powered test questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Topic</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics - Calculus"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syllabus">Syllabus Content</Label>
              <Textarea
                id="syllabus"
                placeholder="Paste your syllabus content here..."
                className="min-h-[200px]"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Or Upload PDF</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="max-w-sm"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <Button 
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? "Generating..." : "Generate Test"}
            </Button>
          </CardContent>
        </Card>

        {/* Previous Tests */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Your Tests</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mockTests.map((test) => (
              <Card key={test.id} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{test.subject}</h3>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{test.topic}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{test.questions} questions</span>
                        <span>Created {test.created}</span>
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
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
