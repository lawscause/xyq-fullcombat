/**
 * Generate signed URLs for authenticated media access.
 * Uses Cloudflare Stream's signed URL mechanism with RSA keys.
 */

/**
 * Generate a signed Cloudflare Stream playback URL.
 * Token expires after the specified duration (default 4 hours).
 */
export async function generateSignedStreamUrl(
  videoId: string,
  expiresInSeconds: number = 14400 // 4 hours
): Promise<string> {
  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID!;
  const signingKey = process.env.CLOUDFLARE_STREAM_SIGNING_KEY!;

  // Create JWT token for signed URL
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;

  const header = {
    alg: "RS256",
    kid: keyId,
  };

  const payload = {
    sub: videoId,
    kid: keyId,
    exp,
    nbf: now - 60, // Allow 1 minute clock skew
    accessRules: [
      {
        type: "any",
        action: "allow",
      },
    ],
  };

  const token = await createJWT(header, payload, signingKey);

  return `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${token}/manifest/video.m3u8`;
}

/**
 * Generate a signed URL for Supabase Storage objects.
 */
export async function generateSignedStorageUrl(
  bucket: string,
  path: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  // This would use the Supabase admin client to generate signed URLs
  // Implementation depends on Supabase Storage setup
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// JWT creation helper (simplified — use jose library in production)
async function createJWT(
  header: Record<string, string>,
  payload: Record<string, unknown>,
  privateKey: string
): Promise<string> {
  const encoder = new TextEncoder();

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const signingInput = `${headerB64}.${payloadB64}`;

  // Import the private key
  const keyData = privateKey
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
    .replace(/-----END RSA PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(signature))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signingInput}.${signatureB64}`;
}
