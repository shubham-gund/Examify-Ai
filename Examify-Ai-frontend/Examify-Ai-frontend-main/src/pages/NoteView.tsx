import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

import { notesService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  _id: string;
  content: string;
}

/* ===============================
   Helpers
================================ */

// Extract headings for TOC
const extractHeadings = (markdown: string) => {
  const regex = /^(##|###)\s+(.*)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const text = match[2];
    headings.push({
      text,
      level: match[1].length,
      id: text.toLowerCase().replace(/\s+/g, "-"),
    });
  }
  return headings;
};

/* ===============================
   Component
================================ */

const NoteView = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [tocOpen, setTocOpen] = useState(false);


  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        const res = await notesService.getById(id);
        setNote(res.data.note);
        setEditableContent(res.data.note.content);
      } catch {
        toast.error("Failed to load notes");
      }
    };

    fetchNote();
  }, [id]);

  const headings = useMemo(
    () => (note ? extractHeadings(note.content) : []),
    [note]
  );



  const exportPDF = () => {
    const element = document.getElementById("note-content");
    if (!element) return;

    html2pdf().from(element).save("notes.pdf");
  };

  const saveNotes = async () => {
    if (!note) return;

    try {
      await notesService.update(note._id, {
        content: editableContent,
      });

      setNote({ ...note, content: editableContent });
      setIsEditing(false);
      toast.success("Notes updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    }
  };


  if (!note) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-10">
      {/* Floating TOC Toggle */}
      <button
        onClick={() => setTocOpen(!tocOpen)}
        className="
          hidden lg:flex items-center gap-2
          fixed right-4 top-24 z-50
          bg-secondary text-primary
          px-4 py-2 rounded-full
          shadow-lg hover:scale-105 transition
        "
      >
        📑 <span className="text-sm font-medium">Contents</span>
      </button>


      {/* Floating TOC Panel */}
      {tocOpen && headings.length > 0 && (
        <aside className="hidden lg:block fixed right-4 top-40 w-72 z-40">
          <div className="bg-card border rounded-lg p-4 shadow-xl animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Contents</h4>
              <button
                onClick={() => setTocOpen(false)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-1 text-sm max-h-[60vh] overflow-auto">
              {headings.map((h) => (
                <li
                  key={h.id}
                  className={`cursor-pointer hover:text-primary ${
                    h.level === 3 ? "ml-4" : ""
                  }`}
                  onClick={() => {
                    document
                      .getElementById(h.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                    setTocOpen(false);
                  }}
                >
                  {h.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}


      {/* Notes Card */}
      <Card className="shadow-xl border">
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center bg-gradient-to-r from-primary to-indigo-500 p-6 text-primary-foreground">
          <div>
            <h1 className="text-2xl font-bold">📘 Study Notes</h1>
            <p className="text-sm opacity-90">
              AI-generated • Editable • Printable
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportPDF}>
              Export PDF
            </Button>

            {isEditing ? (
              <>
                <Button variant="secondary" onClick={saveNotes}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditableContent(note.content);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Notes
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-8">
          <div id="note-content">
            {isEditing ? (
              <Textarea
                rows={25}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
              />
            ) : (
              <div
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-h1:text-primary
                  prose-h2:text-indigo-500 prose-h2:border-b prose-h2:pb-1
                  prose-h3:text-emerald-500
                  prose-strong:text-primary
                  prose-li:marker:text-primary
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded-md
                  prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:rounded-lg
                "
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => {
                      const id = String(children)
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                      return <h2 id={id}>{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const id = String(children)
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                      return <h3 id={id}>{children}</h3>;
                    },
                  }}
                >
                  {note.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteView;
