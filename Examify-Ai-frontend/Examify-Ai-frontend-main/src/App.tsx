import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TestInterface from "./pages/TestInterface";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import QuestionBank from "./pages/QuestionBank";
import NoteView from "./pages/NoteView";
import MyNotes from "./pages/MyNotes";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/notes" element={<MyNotes />} />
            <Route path="/notes/:id" element={<NoteView />} />
            <Route path="/faculty/questions" element={<QuestionBank />} />
            <Route path="/faculty/questions/:syllabusId" element={<QuestionBank />} />
            <Route path="/test/:id" element={<TestInterface />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
