import type * as THREE from "three";

export type Filter = "all" | "skills" | "works";
export type ThemeMode = "auto" | "light" | "dark";
export type Level = "beginner" | "knowledgeable" | "expert";

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
  type: Filter;
  id: string;
  name: string;
  description?: string;
  image?: string;
  accent?: string;
  url?: string;
  level?: Level;
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
