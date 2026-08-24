import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    // Support "file", "files", or multiple entries seamlessly
    const fileEntries = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((f): f is File => f instanceof File && f.size > 0);

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedUrls: string[] = [];

    for (const file of fileEntries) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt) ? rawExt : "jpg";
      const filename = `img-${uniqueSuffix}.${cleanExt}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      savedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      url: savedUrls[0],
      urls: savedUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file gambar." },
      { status: 500 }
    );
  }
}
