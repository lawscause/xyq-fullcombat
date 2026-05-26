"use client";

import { getVimeoEmbedUrl } from "@/lib/media/vimeo";

interface VideoPlayerProps {
  /** Vimeo video ID, optionally with hash for private videos: "123456789" or "123456789/abcdef" */
  videoId: string;
  title: string;
}

/**
 * Vimeo video player.
 * Videos should be configured in Vimeo with:
 * - Privacy: "Hide from Vimeo.com"
 * - Embed: "Specific domains" (your domain only)
 * - Download: disabled
 * - Share: disabled
 */
export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const embedUrl = getVimeoEmbedUrl(videoId);

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use the gear icon for playback speed. Double-tap to fullscreen on mobile.
      </p>
    </div>
  );
}
