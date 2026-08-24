import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import QRCode from "qrcode";

export interface EMVCoTag {
  tag: string;
  length: number;
  value: string;
}

// Sensible default QRIS static string (Noy.Rentcos Merchant) used if public/qris.jpeg is not present yet
export const DEFAULT_STATIC_QRIS =
  "00020101021126580014ID.CO.QRIS.WWW011893600914000000000002100000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204581253033605802ID5913Noy.Rentcos6007Jakarta61051234562070703A016304A1B2";

/**
 * Calculates CRC-16 CCITT-False checksum according to EMVCo standard
 */
export function calcCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Parses an EMVCo QRIS string into Tag-Length-Value array
 */
export function parseEMVCoPayload(rawString: string): EMVCoTag[] {
  let clean = rawString.trim();
  // Strip CRC tag (6304XXXX) if present at end
  if (/6304[0-9A-Fa-f]{4}$/.test(clean)) {
    clean = clean.substring(0, clean.length - 8);
  }

  const tags: EMVCoTag[] = [];
  let idx = 0;
  while (idx < clean.length) {
    if (idx + 4 > clean.length) break;
    const tag = clean.substring(idx, idx + 2);
    const len = parseInt(clean.substring(idx + 2, idx + 4), 10);
    if (isNaN(len) || idx + 4 + len > clean.length) break;
    const value = clean.substring(idx + 4, idx + 4 + len);
    tags.push({ tag, length: len, value });
    idx += 4 + len;
  }
  return tags;
}

/**
 * Converts a static QRIS EMVCo string into a dynamic QRIS EMVCo string
 * - Tag 01 set to "12" (Dynamic)
 * - Tag 54 set to formatted integer amount (e.g. "150000")
 * - Tag 62 optional booking/reference tag
 * - Recalculates Tag 63 (CRC16 CCITT-False)
 */
export function convertStaticToDynamicQris(
  staticQrisString: string,
  amount: number,
  bookingId?: string
): { dynamicString: string; amount: number; merchantName: string } {
  const tags = parseEMVCoPayload(staticQrisString);
  let merchantName = "Noy.Rentcos";

  let has01 = false;
  let has54 = false;

  const formattedAmount = Math.round(amount).toString();
  const updatedTags: { tag: string; value: string }[] = [];

  for (const t of tags) {
    if (t.tag === "01") {
      // Set to Dynamic
      updatedTags.push({ tag: "01", value: "12" });
      has01 = true;
    } else if (t.tag === "54") {
      // Update amount
      updatedTags.push({ tag: "54", value: formattedAmount });
      has54 = true;
    } else if (t.tag === "59") {
      merchantName = t.value;
      updatedTags.push(t);
    } else {
      updatedTags.push(t);
    }
  }

  if (!has01) {
    const idx00 = updatedTags.findIndex((t) => t.tag === "00");
    if (idx00 !== -1) {
      updatedTags.splice(idx00 + 1, 0, { tag: "01", value: "12" });
    } else {
      updatedTags.unshift({ tag: "01", value: "12" });
    }
  }

  if (!has54) {
    let insertIdx = updatedTags.findIndex((t) => t.tag === "58" || t.tag === "55");
    if (insertIdx === -1) {
      insertIdx = updatedTags.findIndex((t) => t.tag === "53");
      if (insertIdx !== -1) insertIdx++;
    }
    if (insertIdx !== -1) {
      updatedTags.splice(insertIdx, 0, { tag: "54", value: formattedAmount });
    } else {
      updatedTags.push({ tag: "54", value: formattedAmount });
    }
  }

  // Handle optional Tag 62 (Additional Data)
  if (bookingId) {
    const cleanRef = bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-15);
    const subTag05 = `05${cleanRef.length.toString().padStart(2, "0")}${cleanRef}`;

    const tag62Idx = updatedTags.findIndex((t) => t.tag === "62");
    if (tag62Idx !== -1) {
      const existingVal = updatedTags[tag62Idx].value;
      if (!existingVal.includes("05")) {
        updatedTags[tag62Idx] = { tag: "62", value: existingVal + subTag05 };
      }
    } else {
      updatedTags.push({ tag: "62", value: subTag05 });
    }
  }

  // Build raw payload up to Tag 6304
  let raw = "";
  for (const t of updatedTags) {
    const lenStr = t.value.length.toString().padStart(2, "0");
    raw += `${t.tag}${lenStr}${t.value}`;
  }

  raw += "6304";
  const crc = calcCRC16(raw);
  const dynamicString = raw + crc;

  return {
    dynamicString,
    amount,
    merchantName,
  };
}

/**
 * Server-side helper to read static QRIS string from public/qris.jpeg or public/qris.png
 */
export function getStaticQrisFromPublic(): { staticString: string; source: string } {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const possibleRelativePaths = [
      "image/qris.jpeg",
      "image/qris.jpg",
      "image/qris.png",
      "qris.jpeg",
      "qris.jpg",
      "qris.png",
    ];

    for (const relPath of possibleRelativePaths) {
      const filePath = path.join(publicDir, relPath);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        let decodedText: string | null = null;

        if (relPath.endsWith(".png")) {
          const png = PNG.sync.read(fileBuffer);
          const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
          if (code && code.data) decodedText = code.data;
        } else {
          const rawImageData = jpeg.decode(fileBuffer, { tolerantDecoding: true, useTArray: true });
          const code = jsQR(
            new Uint8ClampedArray(rawImageData.data),
            rawImageData.width,
            rawImageData.height
          );
          if (code && code.data) decodedText = code.data;
        }

        if (decodedText && decodedText.startsWith("000201")) {
          return { staticString: decodedText, source: `public/${relPath}` };
        }
      }
    }
  } catch (err) {
    console.error("[QRIS PUBLIC READER ERROR]", err);
  }

  return { staticString: DEFAULT_STATIC_QRIS, source: "default" };
}

/**
 * Generates a dynamic QRIS image (Data URL) and payload for given amount
 */
export async function generateDynamicQris(
  amount: number,
  bookingId?: string,
  customStaticString?: string
): Promise<{
  dynamicString: string;
  qrDataUrl: string;
  amount: number;
  merchantName: string;
  source: string;
}> {
  let staticString = customStaticString;
  let source = "custom";

  if (!staticString) {
    const pub = getStaticQrisFromPublic();
    staticString = pub.staticString;
    source = pub.source;
  }

  const { dynamicString, merchantName } = convertStaticToDynamicQris(
    staticString,
    amount,
    bookingId
  );

  const qrDataUrl = await QRCode.toDataURL(dynamicString, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });

  return {
    dynamicString,
    qrDataUrl,
    amount,
    merchantName,
    source,
  };
}
