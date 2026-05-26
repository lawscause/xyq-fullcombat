/**
 * Cloudflare Stream integration.
 * Handles video upload, management, and playback URL generation.
 */

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

interface StreamVideo {
  uid: string;
  thumbnail: string;
  playback: {
    hls: string;
    dash: string;
  };
  duration: number;
  status: {
    state: string;
  };
}

/**
 * Get direct upload URL for client-side uploads.
 * Returns a one-time upload URL that instructors can use.
 */
export async function getDirectUploadUrl(options?: {
  maxDurationSeconds?: number;
  meta?: Record<string, string>;
}): Promise<{ uploadUrl: string; videoId: string }> {
  const response = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: options?.maxDurationSeconds || 7200, // 2 hours max
        requireSignedURLs: true,
        allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL],
        meta: options?.meta || {},
      }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(data.errors)}`);
  }

  return {
    uploadUrl: data.result.uploadURL,
    videoId: data.result.uid,
  };
}

/**
 * Get video details from Cloudflare Stream.
 */
export async function getVideoDetails(videoId: string): Promise<StreamVideo> {
  const response = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Failed to get video details: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

/**
 * Delete a video from Cloudflare Stream.
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const response = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete video: ${response.statusText}`);
  }
}
