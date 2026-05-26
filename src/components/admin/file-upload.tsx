"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile, type UploadBucket, MAX_FILE_SIZES } from "@/lib/storage/upload";
import { cn } from "@/lib/utils/cn";

interface FileUploadProps {
  bucket: UploadBucket;
  folder?: string;
  accept?: string;
  maxSize?: number;
  onUploadComplete: (result: { path: string; publicUrl: string; fileName: string }) => void;
  label?: string;
  className?: string;
}

export function FileUpload({
  bucket,
  folder,
  accept,
  maxSize = MAX_FILE_SIZES.document,
  onUploadComplete,
  label = "Upload file",
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSize) {
      setError(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFile(file, bucket, folder);
      onUploadComplete({ ...result, fileName: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-primary bg-accent" : "border-border",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {uploading ? "Uploading..." : "Drag and drop or click to browse"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {label}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

interface UploadedFileDisplayProps {
  fileName: string;
  fileType: "video" | "image" | "pdf" | "audio" | "document";
  onRemove?: () => void;
}

export function UploadedFileDisplay({ fileName, fileType, onRemove }: UploadedFileDisplayProps) {
  const icons = {
    video: Video,
    image: Image,
    pdf: FileText,
    audio: Music,
    document: FileText,
  };
  const Icon = icons[fileType] || FileText;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm truncate flex-1">{fileName}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
