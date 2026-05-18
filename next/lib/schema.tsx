import type * as THREE from "three";

export type Panel = "bio" | "portfolio";
export type FilterType = "all" | "skills" | "works";

// Spring simulation
export const STIFFNESS = 0.09;
export const DAMPING = 0.72;

// Hex geometry
export const HEX_COL_SPACING = Math.sqrt(3);
export const HEX_ROW_SPACING = 1.5;
export const HEX_RADIUS_FACTOR = 0.95;
export const HEX_BORDER_INSET = 0.92;

// Texture
export const TEX_SIZE = 256;
export const LOGO_PAD_FACTOR = 0.22;
export const LOGO_FONT_SIZE = 0.26;
export const HEX_BORDER_WIDTH = 5;
export const PRIMARY_COLOR = "#facc15";

// Layout
export const DROP_SEED = 42;
export const DROP_DELAY_FACTOR = 1.6;
export const MAX_CELL_SIZE = 80;
export const LAYOUT_PADDING = 0.5;
export const DEFAULT_CANVAS_WIDTH = 500;
export const DEFAULT_CANVAS_HEIGHT = 400;
export const DROP_HEIGHT_FACTOR = 5;
export const GRID_ASPECT_RATIO = 1.6;

// Camera
export const CAMERA_FOV = 50;
export const HEX_LIFT_FACTOR = 0.05;
export const ORBIT_DAMPING = 0.07;
export const MIN_ZOOM_FACTOR = 0.3;
export const MAX_ZOOM_FACTOR = 3;
export const MAX_PIXEL_RATIO = 2;

// Interaction
export const DRAG_THRESHOLD = 4;
export const HOVER_SAMPLE_FRAMES = 4;
export const RESIZE_DEBOUNCE_MS = 200;

export interface TextureCtx {
  logoImages: Map<string, HTMLImageElement | null>;
  THREE: typeof THREE;
}

export interface HexItem {
  id: string;
  name: string;
  description?: string;
  type: "skill" | "work";
  logo: string;
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
}
