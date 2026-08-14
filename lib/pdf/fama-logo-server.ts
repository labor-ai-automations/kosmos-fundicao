import fs from "fs";
import path from "path";

const FAMA_LOGO_FILE = path.join(
  process.cwd(),
  "public",
  "images",
  "fama-logo.png"
);

let cachedBase64: string | null = null;

export function getFamaLogoSrcServer(): string {
  if (cachedBase64) return cachedBase64;

  if (fs.existsSync(FAMA_LOGO_FILE)) {
    const buffer = fs.readFileSync(FAMA_LOGO_FILE);
    cachedBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
    return cachedBase64;
  }

  return "";
}
