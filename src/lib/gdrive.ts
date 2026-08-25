import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export type GDriveFolder = "ktp" | "catalog";

/**
 * Buat Drive client dengan dua mode auth:
 * 1. OAuth2 Refresh Token (akun personal Gmail) — jika GDRIVE_REFRESH_TOKEN tersedia
 * 2. Service Account                            — fallback jika tidak ada refresh token
 */
function getDriveClient() {
  // ── Mode 1: OAuth2 Personal Account ──────────────────────────────────────
  const refreshToken  = process.env.GDRIVE_REFRESH_TOKEN;
  const clientId      = process.env.GDRIVE_OAUTH_CLIENT_ID;
  const clientSecret  = process.env.GDRIVE_OAUTH_CLIENT_SECRET;

  if (refreshToken && clientId && clientSecret) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: "v3", auth: oauth2Client });
  }

  // ── Mode 2: Service Account ───────────────────────────────────────────────
  const clientEmail = process.env.GDRIVE_CLIENT_EMAIL;
  const privateKey  = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Kredensial Google Drive belum lengkap. " +
      "Set GDRIVE_REFRESH_TOKEN + GDRIVE_OAUTH_CLIENT_ID + GDRIVE_OAUTH_CLIENT_SECRET (OAuth2 personal), " +
      "atau GDRIVE_CLIENT_EMAIL + GDRIVE_PRIVATE_KEY (Service Account)."
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Ambil Folder ID GDrive sesuai konteks upload.
 * - "ktp"     → GDRIVE_KTP_FOLDER_ID
 * - "catalog" → GDRIVE_CATALOG_FOLDER_ID
 * Fallback ke GDRIVE_FOLDER_ID (legacy) jika env spesifik belum diset.
 */
function getFolderId(folder: GDriveFolder): string | undefined {
  if (folder === "ktp") {
    const id = process.env.GDRIVE_KTP_FOLDER_ID;
    if (id) return id.split("?")[0].trim();
  }
  if (folder === "catalog") {
    const id = process.env.GDRIVE_CATALOG_FOLDER_ID;
    if (id) return id.split("?")[0].trim();
  }
  const fallback = process.env.GDRIVE_FOLDER_ID;
  return fallback ? fallback.split("?")[0].trim() : undefined;
}

/**
 * Upload file buffer ke Google Drive dan buat permission public.
 * @param folder - Folder tujuan: "ktp" atau "catalog"
 * @returns Direct Image URL yang bisa dirender di HTML <img>
 */
export async function uploadToGoogleDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: GDriveFolder = "catalog"
): Promise<string> {
  const drive    = getDriveClient();
  const folderId = getFolderId(folder);

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  // 1. Upload file ke folder Google Drive
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: folderId ? [folderId] : undefined,
    },
    media: { mimeType, body: stream },
    // supportsAllDrives diperlukan jika menggunakan Shared Drive
    supportsAllDrives: true,
    fields: "id, webViewLink, webContentLink",
  });

  const fileId = response.data.id;
  if (!fileId) {
    throw new Error("Gagal mendapatkan File ID dari Google Drive.");
  }

  // 2. Ubah permission file menjadi Public (Anyone can view)
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });
  } catch (permError) {
    console.warn("Gagal menyetel izin publik file (lanjut menggunakan URL):", permError);
  }

  // 3. Kembalikan URL gambar yang bisa dirender langsung di <img>
  //    Format thumbnail Google Drive — reliable & tidak butuh login
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}
