import { TEX_SIZE } from "@/lib/constants";

function isSkillImage(src: string): boolean {
  return src.includes("/skills/");
}

function processSvgText(
  src: string,
  text: string,
  primaryColor: string,
): string {
  if (!text.includes("<svg")) return text;

  if (isSkillImage(src)) {
    return text.replace(
      /<svg\b([^>]*)>/,
      `<svg$1 width="${TEX_SIZE}" height="${TEX_SIZE}"><style>* { fill: ${primaryColor} !important; }</style>`,
    );
  }

  return text.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 width="${TEX_SIZE}" height="${TEX_SIZE}">`,
  );
}

export async function loadImage(
  src: string,
  primaryColor: string,
): Promise<HTMLImageElement | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;

    let blob = await response.blob();

    if (src.endsWith(".svg")) {
      const text = await blob.text();
      const processedText = processSvgText(src, text, primaryColor);
      blob = new Blob([processedText], { type: "image/svg+xml" });
    }

    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}
