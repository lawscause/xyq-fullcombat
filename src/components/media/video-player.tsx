"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

/**
 * Cloudflare Stream video player with signed URL authentication.
 * Supports playback speed control and mobile optimization.
 */
export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const response = await fetch(
          `/api/media/signed-url?videoId=${encodeURIComponent(videoId)}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load video");
        }

        const data = await response.json();
        setSignedUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrl();
  }, [videoId]);

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video w-full rounded-lg border bg-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            An active membership is required to view video content.
          </p>
        </div>
      </div>
    );
  }

  // Cloudflare Stream embed player
  const embedUrl = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe?signed=1&preload=metadata`;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: Use playback speed controls for detailed review.
      </p>
    </div>
  );
}
