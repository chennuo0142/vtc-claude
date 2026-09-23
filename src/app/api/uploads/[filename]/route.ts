import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const FILENAME_PATTERN = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!FILENAME_PATTERN.test(filename)) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const extension = filename.split(".").pop()!;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const [buffer, fileStat] = await Promise.all([readFile(filePath), stat(filePath)]);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension],
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
