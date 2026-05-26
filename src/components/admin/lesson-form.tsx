"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload, UploadedFileDisplay } from "@/components/admin/file-upload";
import { LESSON_CATEGORIES } from "@/lib/constants/categories";
import { ACCEPTED_TYPES, MAX_FILE_SIZES } from "@/lib/storage/upload";
import type { Lesson, LessonMedia } from "@/types/domain";

interface LessonFormProps {
  lesson?: Lesson;
}

interface MediaAttachment {
  id?: string;
  type: "video" | "pdf" | "audio" | "image";
  title: string;
  url: string | null;
  storage_path: string | null;
  cloudflare_stream_id: string | null;
}

export function LessonForm({ lesson }: LessonFormProps) {
  const router = useRouter();
  const isEditing = !!lesson;

  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [instructorNotes, setInstructorNotes] = useState(lesson?.instructor_notes || "");
  const [categoryId, setCategoryId] = useState(lesson?.category_id || "");
  const [accessLevel, setAccessLevel] = useState<"free" | "trial" | "member">(
    lesson?.access_level || "member"
  );
  const [published, setPublished] = useState(lesson?.published || false);
  const [vimeoId, setVimeoId] = useState(
    lesson?.lesson_media?.find((m) => m.type === "video")?.url || ""
  );
  const [transcript, setTranscript] = useState(
    lesson?.transcripts?.[0]?.content || ""
  );
  const [attachments, setAttachments] = useState<MediaAttachment[]>(
    lesson?.lesson_media?.filter((m) => m.type !== "video").map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      url: m.url,
      storage_path: m.storage_path,
      cloudflare_stream_id: m.cloudflare_stream_id,
    })) || []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title
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

  function handleFileUploaded(result: { path: string; publicUrl: string; fileName: string }, type: "pdf" | "image" | "audio") {
    setAttachments((prev) => [
      ...prev,
      {
        type,
        title: result.fileName,
        url: result.publicUrl,
        storage_path: result.path,
        cloudflare_stream_id: null,
      },
    ]);
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();

    try {
      // Upsert lesson
      const lessonData = {
        title,
        slug,
        description: description || null,
        instructor_notes: instructorNotes || null,
        category_id: categoryId || null,
        access_level: accessLevel,
        published,
      };

      let lessonId = lesson?.id;

      if (isEditing) {
        const { error: updateError } = await (supabase
          .from("lessons") as any)
          .update(lessonData)
          .eq("id", lesson!.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await (supabase
          .from("lessons") as any)
          .insert(lessonData)
          .select("id")
          .single();

        if (insertError) throw insertError;
        lessonId = data.id;
      }

      // Handle video (Vimeo ID stored in lesson_media)
      if (vimeoId && lessonId) {
        // Delete existing video media if editing
        if (isEditing) {
          await (supabase
            .from("lesson_media") as any)
            .delete()
            .eq("lesson_id", lessonId)
            .eq("type", "video");
        }

        await (supabase.from("lesson_media") as any).insert({
          lesson_id: lessonId,
          type: "video",
          title: "Lesson Video",
          url: vimeoId,
          sort_order: 0,
        });
      }

      // Handle attachments
      if (lessonId) {
        // Remove old non-video media if editing
        if (isEditing) {
          await (supabase
            .from("lesson_media") as any)
            .delete()
            .eq("lesson_id", lessonId)
            .neq("type", "video");
        }

        // Insert new attachments
        if (attachments.length > 0) {
          const mediaRows = attachments.map((att, i) => ({
            lesson_id: lessonId,
            type: att.type,
            title: att.title,
            url: att.url,
            storage_path: att.storage_path,
            sort_order: i + 1,
          }));

          await (supabase.from("lesson_media") as any).insert(mediaRows);
        }
      }

      // Handle transcript
      if (transcript && lessonId) {
        if (isEditing && lesson?.transcripts?.[0]) {
          await (supabase
            .from("transcripts") as any)
            .update({ content: transcript })
            .eq("id", lesson.transcripts[0].id);
        } else {
          await (supabase.from("transcripts") as any).insert({
            lesson_id: lessonId,
            content: transcript,
          });
        }
      }

      router.push("/admin/lessons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Basic Information</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Pi Quan — Splitting Fist Fundamentals"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="pi-quan-splitting-fist-fundamentals"
            required
          />
          <p className="text-xs text-muted-foreground">
            Used in the lesson URL: /lessons/{slug || "..."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this lesson covers..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-y placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">No category</option>
              {LESSON_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access">Access Level</Label>
            <select
              id="access"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as "free" | "trial" | "member")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="free">Free (public)</option>
              <option value="trial">Trial members</option>
              <option value="member">Paid members only</option>
            </select>
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
      </section>

      {/* Video */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Video</h2>
        <p className="text-sm text-muted-foreground">
          Paste your Vimeo video ID or URL. Upload videos directly to Vimeo, then reference them here.
        </p>
        <div className="space-y-2">
          <Label htmlFor="vimeo">Vimeo Video ID or URL</Label>
          <Input
            id="vimeo"
            value={vimeoId}
            onChange={(e) => setVimeoId(e.target.value)}
            placeholder="e.g. 987654321 or https://vimeo.com/987654321"
          />
          <p className="text-xs text-muted-foreground">
            Set video privacy to &quot;Hide from Vimeo&quot; and restrict embeds to your domain.
          </p>
        </div>
      </section>

      {/* Instructor Notes */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Instructor Notes</h2>
        <textarea
          value={instructorNotes}
          onChange={(e) => setInstructorNotes(e.target.value)}
          placeholder="Key points, corrections, things to focus on..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[150px] resize-y placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </section>

      {/* Attachments */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Attachments</h2>
        <p className="text-sm text-muted-foreground">
          Upload PDFs, diagrams, images, or audio files.
        </p>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att, i) => (
              <UploadedFileDisplay
                key={i}
                fileName={att.title}
                fileType={att.type}
                onRemove={() => removeAttachment(i)}
              />
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <FileUpload
            bucket="lesson-media"
            folder="pdfs"
            accept={ACCEPTED_TYPES.pdf}
            maxSize={MAX_FILE_SIZES.pdf}
            label="Upload PDF"
            onUploadComplete={(r) => handleFileUploaded(r, "pdf")}
          />
          <FileUpload
            bucket="lesson-media"
            folder="images"
            accept={ACCEPTED_TYPES.image}
            maxSize={MAX_FILE_SIZES.image}
            label="Upload Image"
            onUploadComplete={(r) => handleFileUploaded(r, "image")}
          />
          <FileUpload
            bucket="lesson-media"
            folder="audio"
            accept={ACCEPTED_TYPES.audio}
            maxSize={MAX_FILE_SIZES.audio}
            label="Upload Audio"
            onUploadComplete={(r) => handleFileUploaded(r, "audio")}
          />
        </div>
      </section>

      {/* Transcript */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="font-medium">Transcript</h2>
        <p className="text-sm text-muted-foreground">
          Full text transcript of the video. Enables search across lesson content.
        </p>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste or type the lesson transcript..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[200px] resize-y font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </section>

      {/* Actions */}
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Lesson" : "Create Lesson"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/lessons")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
