"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    async function loadNote() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("notes")
        .select("id, content")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single() as { data: { id: string; content: string } | null };

      if (data) {
        setNote(data.content);
        setNoteId(data.id);
      }
    }

    loadNote();
  }, [lessonId]);

  async function saveNote() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (noteId) {
      await (supabase.from("notes") as any)
        .update({ content: note, updated_at: new Date().toISOString() })
        .eq("id", noteId);
    } else {
      const { data } = await (supabase.from("notes") as any)
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          content: note,
        })
        .select("id")
        .single() as { data: { id: string } | null };

      if (data) {
        setNoteId(data.id);
      }
    }

    setLastSaved(new Date());
    setSaving(false);
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">My Notes</h2>
        {lastSaved && (
          <span className="text-xs text-muted-foreground">Saved</span>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add private notes about this lesson..."
        className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px] resize-y"
      />
      <Button
        onClick={saveNote}
        disabled={saving}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        {saving ? "Saving..." : "Save Note"}
      </Button>
    </section>
  );
}
