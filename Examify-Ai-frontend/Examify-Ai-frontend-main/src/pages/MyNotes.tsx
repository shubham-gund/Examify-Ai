import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { notesService } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const MyNotes = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    notesService.getMyNotes().then(res => {
      setNotes(res.data.notes);
    });
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Notes</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {notes.map(note => (
          <Card key={note._id} className="hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">
                    {note.syllabusId?.title || "Notes"}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/notes/${note._id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {note.content.substring(0, 150)}...
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyNotes;
