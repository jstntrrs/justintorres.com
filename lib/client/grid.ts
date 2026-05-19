import {
  HEX_COL_SPACING,
  HEX_ROW_SPACING,
  GRID_ASPECT_RATIO,
  LAYOUT_PADDING,
  MAX_CELL_SIZE,
} from "@/lib/constants";

export function calculateOptimalColumns(count: number): number {
  let cols = 1;
  let bestDiff = Infinity;

  for (let c = 1; c <= count; c++) {
    const rows = Math.ceil(count / c);
    const actualRatio = (c * HEX_COL_SPACING) / (rows * HEX_ROW_SPACING);
    const diff = Math.abs(actualRatio - GRID_ASPECT_RATIO);
    if (diff < bestDiff) {
      bestDiff = diff;
      cols = c;
    }
  }

  return cols;
}

export function generateHexGridSlots(
  count: number,
): { ux: number; uy: number }[] {
  if (count === 0) return [];

  const cols = calculateOptimalColumns(count);
  const halfColOffset = HEX_COL_SPACING / 2;
  const slots: { ux: number; uy: number }[] = [];
  let remaining = count;
  let row = 0;

  while (remaining > 0) {
    const rowCount = Math.min(cols, remaining);
    remaining -= rowCount;
    const skip = cols - rowCount;
    const colOffset = Math.floor(skip / 2) - Math.floor((cols - 1) / 2);
    const rowOffset = row % 2 === 1 ? halfColOffset : 0;

    for (let c = 0; c < rowCount; c++) {
      slots.push({
        ux: (colOffset + c) * HEX_COL_SPACING + rowOffset,
        uy: -row * HEX_ROW_SPACING,
      });
    }
    row++;
  }

  const cx = slots.reduce((sum, s) => sum + s.ux, 0) / slots.length;
  const cy = slots.reduce((sum, s) => sum + s.uy, 0) / slots.length;
  return slots.map((s) => ({ ux: s.ux - cx, uy: s.uy - cy }));
}

export function calculateCellSize(
  slots: { ux: number; uy: number }[],
  viewportWidth: number,
  viewportHeight: number,
): number {
  if (!slots.length) return 40;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const s of slots) {
    if (s.ux < minX) minX = s.ux;
    if (s.ux > maxX) maxX = s.ux;
    if (s.uy < minY) minY = s.uy;
    if (s.uy > maxY) maxY = s.uy;
  }

  return Math.min(
    (viewportWidth * LAYOUT_PADDING) / (maxX - minX + HEX_COL_SPACING),
    (viewportHeight * LAYOUT_PADDING) / (maxY - minY + 2.0),
    MAX_CELL_SIZE,
  );
}
