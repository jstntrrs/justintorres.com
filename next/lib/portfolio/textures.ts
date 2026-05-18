import type * as THREE from "three";
import {
  TEX_SIZE,
  LOGO_PAD_FACTOR,
  LOGO_FONT_SIZE,
  HEX_BORDER_WIDTH,
  HEX_BORDER_INSET,
} from "@/lib/constants";
import type { HexItem, TextureCtx, ItemRenderConfig } from "@/lib/types";

type ThreeModule = typeof THREE;

function drawHexagonPath(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  inset: number,
): void {
  ctx.beginPath();

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    const px =
      centerX +
      inset * ((Math.cos(angle) / Math.sqrt(3) + 0.5) * size - centerX);
    const py = centerY + inset * ((0.5 - Math.sin(angle) / 2) * size - centerY);

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
}

function getItemRenderConfig(itemType: HexItem["type"]): ItemRenderConfig {
  if (itemType === "works") {
    return { clipInset: HEX_BORDER_INSET, imageScale: 1.0, imagePadding: 0 };
  }
  return { clipInset: 1, imageScale: 0.75, imagePadding: LOGO_PAD_FACTOR };
}

function applyCanvasTextureSettings(
  three: ThreeModule,
  canvas: HTMLCanvasElement,
): THREE.CanvasTexture {
  const texture = new three.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = three.LinearFilter;
  texture.colorSpace = three.SRGBColorSpace;
  return texture;
}

export function createQuoteTexture(texCtx: TextureCtx): THREE.CanvasTexture {
  const { THREE } = texCtx;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX_SIZE;
  const c2d = canvas.getContext("2d")!;
  const center = TEX_SIZE / 2;

  c2d.clearRect(0, 0, TEX_SIZE, TEX_SIZE);

  c2d.save();
  drawHexagonPath(c2d, center, center, TEX_SIZE, 1);
  c2d.clip();

  c2d.fillStyle = texCtx.primaryColor;
  c2d.globalAlpha = 0.75;
  c2d.font = "bold 18px system-ui, sans-serif";
  c2d.textAlign = "center";
  c2d.textBaseline = "middle";
  c2d.fillText('"Somewhere, something', center, center - 25);
  c2d.fillText("incredible is waiting", center, center - 5);
  c2d.fillText('to be known."', center, center + 15);
  c2d.font = "italic 14px system-ui, sans-serif";
  c2d.fillText("\u2015 Carl Sagan", center, center + 38);
  c2d.restore();

  c2d.strokeStyle = texCtx.primaryColor;
  c2d.lineWidth = HEX_BORDER_WIDTH;
  drawHexagonPath(c2d, center, center, TEX_SIZE, HEX_BORDER_INSET);
  c2d.stroke();

  return applyCanvasTextureSettings(THREE, canvas);
}

export function createItemTexture(
  item: HexItem,
  texCtx: TextureCtx,
): THREE.CanvasTexture {
  const { THREE } = texCtx;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX_SIZE;
  const c2d = canvas.getContext("2d")!;
  const center = TEX_SIZE / 2;

  c2d.clearRect(0, 0, TEX_SIZE, TEX_SIZE);

  const config = getItemRenderConfig(item.type);
  const img = texCtx.images.get(item.image);

  c2d.save();
  drawHexagonPath(c2d, center, center, TEX_SIZE, config.clipInset);
  c2d.clip();

  if (img) {
    const baseSize = TEX_SIZE - 2 * TEX_SIZE * config.imagePadding;
    const targetSize = baseSize * config.imageScale;
    const scale = Math.max(targetSize / img.width, targetSize / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    c2d.drawImage(
      img,
      center - scaledWidth / 2,
      center - scaledHeight / 2,
      scaledWidth,
      scaledHeight,
    );
  } else {
    c2d.fillStyle = texCtx.primaryColor;
    c2d.font = `700 ${Math.round(TEX_SIZE * LOGO_FONT_SIZE)}px system-ui,sans-serif`;
    c2d.textAlign = "center";
    c2d.textBaseline = "middle";
    c2d.fillText(item.id.toUpperCase(), center, center);
  }

  c2d.restore();

  c2d.strokeStyle = texCtx.primaryColor;
  c2d.lineWidth = HEX_BORDER_WIDTH;
  drawHexagonPath(c2d, center, center, TEX_SIZE, HEX_BORDER_INSET);
  c2d.stroke();

  return applyCanvasTextureSettings(THREE, canvas);
}
