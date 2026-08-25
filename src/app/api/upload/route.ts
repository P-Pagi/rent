import { NextResponse } from "next/server";
import { uploadToGoogleDrive, GDriveFolder } from "@/lib/gdrive";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    // Baca query param ?folder=ktp atau ?folder=catalog
    const { searchParams } = new URL(request.url);
    const rawFolder = searchParams.get("folder") ?? "catalog";
    const folder: GDriveFolder = rawFolder === "ktp" ? "ktp" : "catalog";

    const formData = await request.formData();
    // Support "file", "files", atau multiple entries sekaligus
    const fileEntries = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((f): f is File => f instanceof File && f.size > 0);

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const savedUrls: string[] = [];

    for (const file of fileEntries) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt) ? rawExt : "jpg";
      const filename = `${folder}-${uniqueSuffix}.${cleanExt}`;

      try {
        // Upload ke Google Drive di folder yang sesuai
        const driveUrl = await uploadToGoogleDrive(buffer, filename, file.type || `image/${cleanExt}`, folder);
        savedUrls.push(driveUrl);
      } catch (driveErr) {
        console.error(`Gagal upload ke Google Drive (folder: ${folder}), menggunakan fallback lokal:`, driveErr);

        // Fallback simpan ke lokal di subfolder yang sesuai
        const uploadDir = join(process.cwd(), "public", "uploads", folder);
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        savedUrls.push(`/uploads/${folder}/${filename}`);
      }
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
