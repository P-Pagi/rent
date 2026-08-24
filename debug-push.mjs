/**
 * debug-push.mjs — Comprehensive push notification debugger
 * Run: node debug-push.mjs
 */
import { readFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Load .env manually ────────────────────────────────────────────────────────
const envPath = path.join(__dirname, ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const PASS = "✅";
const FAIL = "❌";
const WARN = "⚠️ ";
const INFO = "ℹ️ ";

console.log("\n════════════════════════════════════════════════════════");
console.log("  🔔 PUSH NOTIFICATION DEBUGGER");
console.log("════════════════════════════════════════════════════════\n");

// ── 1. Check FIREBASE_SERVICE_ACCOUNT ────────────────────────────────────────
console.log("── [1] FIREBASE_SERVICE_ACCOUNT ──────────────────────");
const rawSA = process.env.FIREBASE_SERVICE_ACCOUNT || "";
let serviceAccount = null;

if (!rawSA) {
  console.log(`${FAIL} FIREBASE_SERVICE_ACCOUNT is empty!`);
  console.log(`${INFO} Isi dengan full JSON dari Firebase Console:`);
  console.log(`     Project Settings → Service Accounts → Generate new private key\n`);
} else {
  // Check if it looks like JSON
  const looksLikeJson = rawSA.trim().startsWith("{");
  if (!looksLikeJson) {
    console.log(`${FAIL} FIREBASE_SERVICE_ACCOUNT bukan JSON yang valid!`);
    console.log(`${INFO} Yang ada sekarang: "${rawSA.slice(0, 60)}..."`);
    console.log(`${INFO} Yang harus diisi: seluruh isi file JSON service account ({"type":"service_account",...})`);
    console.log(`${WARN} Kelihatannya yang diisi hanya private key saja, bukan seluruh JSON\n`);
  } else {
    try {
      serviceAccount = JSON.parse(rawSA);
      const hasRequired = serviceAccount.type && serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email;
      if (!hasRequired) {
        console.log(`${FAIL} JSON parsed tapi field penting tidak lengkap:`);
        console.log(`     type: ${serviceAccount.type || "MISSING"}`);
        console.log(`     project_id: ${serviceAccount.project_id || "MISSING"}`);
        console.log(`     client_email: ${serviceAccount.client_email || "MISSING"}`);
        console.log(`     private_key: ${serviceAccount.private_key ? "ada" : "MISSING"}\n`);
        serviceAccount = null;
      } else {
        console.log(`${PASS} Service account JSON valid!`);
        console.log(`     project_id:    ${serviceAccount.project_id}`);
        console.log(`     client_email:  ${serviceAccount.client_email}`);
        console.log(`     key type:      ${serviceAccount.type}\n`);
      }
    } catch (e) {
      console.log(`${FAIL} JSON parse error: ${e.message}`);
      console.log(`${INFO} Pastikan JSON tidak ada karakter yang salah (newline, quotes, dll)\n`);
    }
  }
}

// ── 2. Check google-services.json ────────────────────────────────────────────
console.log("── [2] google-services.json ──────────────────────────");
try {
  const gsPath = path.join(__dirname, "android/app/google-services.json");
  const gs = JSON.parse(readFileSync(gsPath, "utf-8"));
  const projectId = gs.project_info?.project_id;
  const packageName = gs.client?.[0]?.client_info?.android_client_info?.package_name;
  console.log(`${PASS} google-services.json ditemukan`);
  console.log(`     project_id:    ${projectId}`);
  console.log(`     package_name:  ${packageName}`);
  
  // Cross-check project_id with service account
  if (serviceAccount && serviceAccount.project_id !== projectId) {
    console.log(`${FAIL} MISMATCH! Service account project_id (${serviceAccount.project_id}) ≠ google-services project_id (${projectId})`);
    console.log(`     Pastikan keduanya dari Firebase project yang SAMA\n`);
  } else if (serviceAccount) {
    console.log(`${PASS} project_id cocok dengan service account\n`);
  } else {
    console.log();
  }
} catch {
  console.log(`${FAIL} google-services.json tidak ditemukan di android/app/\n`);
}

// ── 3. Firebase Admin SDK init ────────────────────────────────────────────────
console.log("── [3] Firebase Admin SDK Init ───────────────────────");
let messaging = null;
if (!serviceAccount) {
  console.log(`${FAIL} Dilewati — service account tidak valid\n`);
} else {
  try {
    const { initializeApp, getApps, cert } = require("firebase-admin/app");
    const { getMessaging: gm } = require("firebase-admin/messaging");
    
    let app;
    if (getApps().length > 0) {
      const { getApp } = require("firebase-admin/app");
      app = getApp();
    } else {
      app = initializeApp({ credential: cert(serviceAccount) });
    }
    messaging = gm(app);
    console.log(`${PASS} Firebase Admin SDK berhasil diinisialisasi\n`);
  } catch (e) {
    console.log(`${FAIL} Firebase Admin init error: ${e.message}\n`);
  }
}

// ── 4. Check FCM tokens in DB ─────────────────────────────────────────────────
console.log("── [4] FCM Tokens di Database ────────────────────────");
let tokens = [];
try {
  const { createClient } = require("@libsql/client");
  const db = createClient({ url: `file:${path.join(__dirname, "dev.db")}` });
  const result = await db.execute("SELECT email, fcmToken FROM Admin");
  
  if (result.rows.length === 0) {
    console.log(`${WARN} Tidak ada admin di database`);
    console.log(`${INFO} Admin belum pernah login dari app Android\n`);
  } else {
    for (const row of result.rows) {
      const email = row[0] ?? row.email;
      const fcmToken = row[1] ?? row.fcmToken;
      if (fcmToken) {
        tokens.push(fcmToken);
        console.log(`${PASS} Admin: ${email}`);
        console.log(`     FCM Token: ${String(fcmToken).slice(0, 30)}...${String(fcmToken).slice(-10)}\n`);
      } else {
        console.log(`${WARN} Admin: ${email} — belum ada FCM token`);
        console.log(`${INFO} Token belum terdaftar. Kemungkinan:`);
        console.log(`     1. App Android belum dibuka setelah login`);
        console.log(`     2. Permission notifikasi ditolak`);
        console.log(`     3. Request ke /api/push/register gagal\n`);
      }
    }
  }
  db.close();
} catch (e) {
  console.log(`${FAIL} DB error: ${e.message}\n`);
}

// ── 5. Send test notification ─────────────────────────────────────────────────
console.log("── [5] Test Kirim Push Notification ─────────────────");
if (!messaging) {
  console.log(`${FAIL} Dilewati — Firebase tidak terinisialisasi`);
} else if (tokens.length === 0) {
  console.log(`${FAIL} Dilewati — tidak ada FCM token di database`);
  console.log(`${INFO} Langkah fix:`);
  console.log(`     1. Buka app Android → login`);
  console.log(`     2. Izinkan notifikasi saat diminta`);
  console.log(`     3. Cek server log — harus ada "FCM token received"`);
  console.log(`     4. Jalankan script ini lagi\n`);
} else {
  console.log(`${INFO} Mengirim test notifikasi ke ${tokens.length} device...\n`);
  for (const token of tokens) {
    try {
      const msgId = await messaging.send({
        token,
        notification: {
          title: "🔔 Test Notifikasi Berhasil!",
          body: "Push notification dari Kawaii Rental bekerja dengan baik ✨",
        },
        data: {
          type: "new_booking",
          href: "/notifications",
        },
        android: {
          priority: "high",
          notification: {
            channelId: "bookings",
            color: "#2563EB",
            icon: "ic_stat_notification",
            sound: "default",
          },
        },
      });
      console.log(`${PASS} BERHASIL! Message ID: ${msgId}`);
      console.log(`${INFO} Cek HP kamu — notifikasi harus muncul sekarang!\n`);
    } catch (e) {
      console.log(`${FAIL} Gagal kirim: ${e.message}`);
      if (e.code === "messaging/registration-token-not-registered") {
        console.log(`${INFO} Token sudah expired/tidak valid — buka ulang app Android untuk dapat token baru`);
      } else if (e.code === "messaging/invalid-registration-token") {
        console.log(`${INFO} Format token tidak valid`);
      } else if (e.message.includes("project_id")) {
        console.log(`${INFO} project_id di service account tidak cocok dengan app`);
      }
      console.log();
    }
  }
}

// ── 6. Summary & Fix Guide ────────────────────────────────────────────────────
console.log("════════════════════════════════════════════════════════");
console.log("  📋 RINGKASAN MASALAH & SOLUSI");
console.log("════════════════════════════════════════════════════════\n");

if (!serviceAccount) {
  console.log(`${FAIL} MASALAH UTAMA: FIREBASE_SERVICE_ACCOUNT tidak valid\n`);
  console.log("  SOLUSI:");
  console.log("  1. Buka https://console.firebase.google.com");
  console.log("  2. Pilih project 'com-rent-app'");
  console.log("  3. ⚙️ Project Settings → Service accounts");
  console.log("  4. Klik 'Generate new private key' → download JSON");
  console.log("  5. Buka file JSON tersebut dengan text editor");
  console.log("  6. Copy SELURUH ISI file (dari { sampai })");
  console.log("  7. Di .env, ganti nilai FIREBASE_SERVICE_ACCOUNT= dengan isi tersebut");
  console.log("  8. Pastikan satu baris (hapus semua newline di dalam nilai)\n");
  console.log("  Contoh format yang BENAR di .env:");
  console.log(`  FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"com-rent-app","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxx@com-rent-app.iam.gserviceaccount.com",...}\n`);
} else if (tokens.length === 0) {
  console.log(`${WARN} Firebase OK tapi belum ada FCM token\n`);
  console.log("  SOLUSI:");
  console.log("  1. Install APK debug terbaru di Android");
  console.log("  2. Buka app → login");
  console.log("  3. Tap 'Izinkan' saat muncul dialog notifikasi");
  console.log("  4. Tunggu ~2 detik");
  console.log("  5. Jalankan: node debug-push.mjs\n");
} else {
  console.log(`${PASS} Semua sistem OK — cek HP kamu untuk notifikasi test!\n`);
}
