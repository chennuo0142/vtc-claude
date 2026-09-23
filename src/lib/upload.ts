import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export class UploadError extends Error {}

export async function saveUploadedPhoto(photo: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(photo.type)) {
    throw new UploadError("Format de photo non supporté");
  }
  if (photo.size > MAX_SIZE) {
    throw new UploadError("La photo dépasse 5 Mo");
  }

  const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await photo.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  // Served through /api/uploads/[filename] rather than the static /public path:
  // `next start` only serves files present in /public at build time, so files
  // written here at runtime would 404 otherwise.
  return `/api/uploads/${filename}`;
}
