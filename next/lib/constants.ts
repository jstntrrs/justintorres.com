// ─── Spring Simulation ────────────────────────────────────────────────────────

export const STIFFNESS = 0.09;
export const DAMPING = 0.72;

// ─── Hex Geometry ─────────────────────────────────────────────────────────────

export const HEX_COL_SPACING = Math.sqrt(3);
export const HEX_ROW_SPACING = 1.5;
export const HEX_RADIUS_FACTOR = 0.95;
export const HEX_BORDER_INSET = 0.92;

// ─── Texture Rendering ───────────────────────────────────────────────────────

export const TEX_SIZE = 256;
export const LOGO_PAD_FACTOR = 0.22;
export const LOGO_FONT_SIZE = 0.2;
export const HEX_BORDER_WIDTH = 4;

// ─── Grid Layout ─────────────────────────────────────────────────────────────

export const DROP_DELAY_FACTOR = 1.6;
export const MAX_CELL_SIZE = 80;
export const LAYOUT_PADDING = 0.5;
export const DEFAULT_CANVAS_WIDTH = 500;
export const DEFAULT_CANVAS_HEIGHT = 400;
export const DROP_HEIGHT_FACTOR = 5;
export const GRID_ASPECT_RATIO = 1.6;

// ─── Camera ──────────────────────────────────────────────────────────────────

export const CAMERA_FOV = 50;
export const HEX_LIFT_FACTOR = 0.05;
export const HOVER_LIFT_FACTOR = 0.015;
export const ORBIT_DAMPING = 0.07;
export const MIN_ZOOM_FACTOR = 0.3;
export const MAX_ZOOM_FACTOR = 3;
export const MAX_PIXEL_RATIO = 2;

// ─── Interaction ─────────────────────────────────────────────────────────────

export const DRAG_THRESHOLD = 4;
export const HOVER_SAMPLE_FRAMES = 4;
export const RESIZE_DEBOUNCE_MS = 200;

// ─── Rotation Drag Effect ────────────────────────────────────────────────────

export const ROTATION_LAG_FACTOR = 0.12;
export const ROTATION_DAMPING = 0.92;
export const MAX_HEX_ROTATION = Math.PI / 6;

// ─── Starfield ───────────────────────────────────────────────────────────────

export const STAR_COUNT = 1000;
export const STAR_RADIUS = 1000;
export const STAR_SIZE = 2;
export const STAR_OPACITY = 0.8;

// ─── Z-Axis Positioning ──────────────────────────────────────────────────────

export const PORTFOLIO_Z_FRONT = 50;
export const QUOTE_Z_BACK = -50;
export const DROP_START_Z = 75;
export const QUOTE_HEX_SCALE = 3.5;

// ─── Identifiers ─────────────────────────────────────────────────────────────

export const QUOTE_HEX_ID = "quote-hex";

// ─── Animation Smoothing ─────────────────────────────────────────────────────

export const ROTATION_SMOOTH_FACTOR = 0.92;
export const ROTATION_SCALE_FACTOR = 0.8;
