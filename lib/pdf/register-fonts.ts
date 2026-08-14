import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

const FONT_FILES = {
  400: "montserrat-latin-400-normal.woff",
  600: "montserrat-latin-600-normal.woff",
  700: "montserrat-latin-700-normal.woff",
} as const;

function resolveFontSrc(filename: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/fonts/montserrat/${filename}`;
  }

  return path.join(process.cwd(), "public", "fonts", "montserrat", filename);
}

export function registerPdfFonts() {
  if (registered) return;

  Font.register({
    family: "Montserrat",
    fonts: [
      { src: resolveFontSrc(FONT_FILES[400]), fontWeight: 400 },
      { src: resolveFontSrc(FONT_FILES[600]), fontWeight: 600 },
      { src: resolveFontSrc(FONT_FILES[700]), fontWeight: 700 },
    ],
  });

  registered = true;
}

export function resetPdfFontsRegistration() {
  registered = false;
}
