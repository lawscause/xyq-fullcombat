"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload, UploadedFileDisplay } from "@/components/admin/file-upload";
import { ACCEPTED_TYPES, MAX_FILE_SIZES } from "@/lib/storage/upload";
import type { Seminar } from "@/types/domain";

interface SeminarFormProps {
  seminar?: Seminar;
}

interface Attachment {
  title: string;
  url: string;
  storage_path: string;
}

export function SeminarForm({ seminar }: SeminarFormProps) {
  const router = useRouter();
  const isEditing = !!seminar;

  const [title, setTitle] = useState(seminar?.title || "");
  const [slug, setSlug] = useState(seminar?.slug || "");
  const [description, setDescription] = useState(seminar?.description || "");
  const [date, setDate] = useState(
    seminar?.date ? new Date(seminar.date).toISOString().slice(0, 10) : ""
  );
  const [instructorName, setInstructorName] = useState(seminar?.instructor_name || "");
  const [vimeoId, setVimeoId] = useState("");
  const [published, setPublished] = useState(seminar?.published || false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();

    const seminarData = {
      title,
      slug,
      description: description || null,
      date: new Date(date).toISOString(),
      instructor_name: instructorName || null,
      has_recording: !!vimeoId,
      published,
    };

    try {
      let seminarId = seminar?.id;

      if (isEditing) {
        const { error: updateError } = await (supabase
          .from("seminars") as any)
          .update(seminarData)
          .eq("id", seminar!.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await (supabase
          .from("seminars") as any)
          .insert(seminarData)
          .select("id")
          .single();

        if (insertError) throw insertError;
        seminarId = data.id;
      }

      // Add recording if Vimeo ID provided
      if (vimeoId && seminarId) {
        await (supabase.from("seminar_recordings") as any).insert({
          seminar_id: seminarId,
          title: "Seminar Recording",
          cloudflare_stream_id: vimeoId, // Reusing field for Vimeo ID
          sort_order: 0,
        });
      }

      router.push("/admin/seminars");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save seminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Seminar Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Guest Seminar — Bagua Applications with Zhang Sifu"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was covered in this seminar..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px] resize-y placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="Instructor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={published ? "published" : "draft"}
              onChange={(e) => setPublished(e.target.value === "published")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recording */}
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Recording</h2>
        <div className="space-y-2">
          <Label htmlFor="vimeo">Vimeo Video ID</Label>
          <Input
            id="vimeo"
            value={vimeoId}
            onChange={(e) => setVimeoId(e.target.value)}
            placeholder="e.g. 987654321"
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Materials & Handouts</h2>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att, i) => (
              <UploadedFileDisplay
                key={i}
                fileName={att.title}
                fileType="pdf"
                onRemove={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        )}

        <FileUpload
          bucket="seminar-media"
          accept={`${ACCEPTED_TYPES.pdf},${ACCEPTED_TYPES.image}`}
          maxSize={MAX_FILE_SIZES.pdf}
          label="Upload PDF or Image"
          onUploadComplete={(r) =>
            setAttachments((prev) => [...prev, { title: r.fileName, url: r.publicUrl, storage_path: r.path }])
          }
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Seminar" : "Create Seminar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/seminars")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
