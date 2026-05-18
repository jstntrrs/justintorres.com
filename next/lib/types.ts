import type * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PanelKind = "bio" | "portfolio";
export type FilterKind = "all" | "skills" | "works";

export interface TextureCtx {
  images: Map<string, HTMLImageElement | null>;
  THREE: typeof THREE;
  primaryColor: string;
}

export interface ItemRenderConfig {
  clipInset: number;
  imageScale: number;
  imagePadding: number;
}

export interface HexItem {
  id: string;
  name: string;
  description?: string;
  type: FilterKind;
  image: string;
  accent?: string;
  url?: string;
}

export interface VgHex {
  mesh: THREE.Mesh;
  item: HexItem;
  posX: number;
  posY: number;
  posZ: number;
  velX: number;
  velY: number;
  velZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  dropDelay: number;
  slotIndex: number;
  scale: number;
  scaleTarget: number;
  scaleVel: number;
  rotX: number;
  rotY: number;
  rotVelX: number;
  rotVelY: number;
  distanceFromCenter: number;
}
