import "server-only";

// Private file storage (Supabase Storage) for customer logos and generated images.
// Uses the secret key, so this must only ever run on the server.

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const headers = () => ({ apikey: secret()!, Authorization: `Bearer ${secret()}` });

export const storageReady = () => Boolean(url() && secret());

export async function uploadFile(bucket: string, path: string, body: Buffer, contentType: string) {
  const res = await fetch(`${url()}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { ...headers(), "Content-Type": contentType, "x-upsert": "true" }, body: new Uint8Array(body) });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status})`);
}

export async function downloadFile(bucket: string, path: string): Promise<Buffer> {
  const res = await fetch(`${url()}/storage/v1/object/${bucket}/${path}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Storage download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/** A link to a private file that stops working after `seconds`. */
export async function signedUrl(bucket: string, path: string, seconds = 3600): Promise<string> {
  const res = await fetch(`${url()}/storage/v1/object/sign/${bucket}/${path}`, { method: "POST", headers: { ...headers(), "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: seconds }) });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.signedURL) throw new Error(`Storage link failed (${res.status})`);
  return `${url()}/storage/v1${body.signedURL}`;
}
