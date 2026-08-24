import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import jsQR from "jsqr";

const publicDir = path.join(process.cwd(), "public");
const possiblePaths = [
  path.join(publicDir, "image", "qris.jpeg"),
  path.join(publicDir, "image", "qris.jpg"),
  path.join(publicDir, "image", "qris.png"),
  path.join(publicDir, "qris.jpeg"),
  path.join(publicDir, "qris.jpg"),
  path.join(publicDir, "qris.png"),
];

let foundPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    foundPath = p;
    break;
  }
}

if (!foundPath) {
  console.log("❌ File public/image/qris.jpeg tidak ditemukan.");
  process.exit(0);
}

console.log(`🔍 Membaca file QRIS: ${foundPath}...`);
const buffer = fs.readFileSync(foundPath);

let decodedText = null;
if (foundPath.toLowerCase().endsWith(".png")) {
  const png = PNG.sync.read(buffer);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  if (code) decodedText = code.data;
} else {
  const rawImageData = jpeg.decode(buffer, { tolerantDecoding: true, useTArray: true });
  const code = jsQR(
    new Uint8ClampedArray(rawImageData.data),
    rawImageData.width,
    rawImageData.height
  );
  if (code) decodedText = code.data;
}

if (decodedText) {
  console.log("✅ Berhasil membaca QRIS Static dari file!");
  console.log("----------------------------------------");
  console.log("Payload Static:", decodedText);
  console.log("----------------------------------------");
} else {
  console.log("⚠️ Gagal mendekode QR code dari gambar. Pastikan gambar QRIS cukup jelas.");
}
