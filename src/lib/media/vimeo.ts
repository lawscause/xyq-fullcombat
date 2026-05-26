/**
 * Vimeo integration for video hosting.
 * Uses Vimeo's oEmbed and privacy settings for access control.
 *
 * Recommended Vimeo plan: Pro or Business
 * - Domain-level privacy (restrict embeds to your domain)
 * - Hide from Vimeo.com
 * - Disable sharing/downloading
 */

/**
 * Generate a Vimeo embed URL with privacy parameters.
 * Videos should be set to "Hide from Vimeo" with domain-level embed restriction.
 */
export function getVimeoEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    startTime?: number; // seconds
  }
): string {
  const params = new URLSearchParams({
    badge: "0",
    autopause: "0",
    player_id: "0",
    app_id: process.env.NEXT_PUBLIC_VIMEO_APP_ID || "",
    dnt: "1", // Do Not Track
  });

  if (options?.autoplay) {
    params.set("autoplay", "1");
  }

  if (options?.startTime) {
    params.set("t", `${options.startTime}s`);
  }

  // If using private/unlisted videos with a hash
  // Format: videoId/hashKey
  const [id, hash] = videoId.split("/");
  if (hash) {
    params.set("h", hash);
  }

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

/**
 * Extract video ID from various Vimeo URL formats.
 * Supports:
 * - https://vimeo.com/123456789
 * - https://vimeo.com/123456789/abcdef1234 (private link)
 * - https://player.vimeo.com/video/123456789
 * - 123456789 (raw ID)
 */
export function parseVimeoUrl(input: string): string | null {
  // Already a raw ID or ID/hash
  if (/^\d+(\/[a-f0-9]+)?$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    // player.vimeo.com/video/ID
    const playerMatch = url.pathname.match(/\/video\/(\d+)/);
    if (playerMatch) return playerMatch[1];

    // vimeo.com/ID or vimeo.com/ID/HASH
    const standardMatch = url.pathname.match(/^\/(\d+)(\/([a-f0-9]+))?/);
    if (standardMatch) {
      return standardMatch[3]
        ? `${standardMatch[1]}/${standardMatch[3]}`
        : standardMatch[1];
    }
  } catch {
    // Not a valid URL
  }

  return null;
}
