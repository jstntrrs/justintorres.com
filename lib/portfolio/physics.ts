import {
  STIFFNESS,
  DAMPING,
  ROTATION_DAMPING,
  ROTATION_LAG_FACTOR,
  MAX_HEX_ROTATION,
  QUOTE_HEX_ID,
} from "@/lib/constants";
import type { VgHex } from "@/lib/types";

export function updateHexPhysics(
  hex: VgHex,
  meshScale: number,
  rotationTargetX: number,
  rotationTargetY: number,
): void {
  if (hex.dropDelay > 0) {
    hex.dropDelay--;
    return;
  }

  // Position spring
  hex.velX = hex.velX * DAMPING + (hex.targetX - hex.posX) * STIFFNESS;
  hex.velY = hex.velY * DAMPING + (hex.targetY - hex.posY) * STIFFNESS;
  hex.velZ = hex.velZ * DAMPING + (hex.targetZ - hex.posZ) * STIFFNESS;
  hex.posX += hex.velX;
  hex.posY += hex.velY;
  hex.posZ += hex.velZ;
  hex.mesh.position.set(hex.posX, hex.posY, hex.posZ);

  // Rotation drag
  const dragStrength = hex.distanceFromCenter * ROTATION_LAG_FACTOR;
  hex.rotVelX =
    hex.rotVelX * ROTATION_DAMPING +
    (rotationTargetX * dragStrength - hex.rotX) * STIFFNESS;
  hex.rotVelY =
    hex.rotVelY * ROTATION_DAMPING +
    (rotationTargetY * dragStrength - hex.rotY) * STIFFNESS;
  hex.rotX = clamp(hex.rotX + hex.rotVelX, -MAX_HEX_ROTATION, MAX_HEX_ROTATION);
  hex.rotY = clamp(hex.rotY + hex.rotVelY, -MAX_HEX_ROTATION, MAX_HEX_ROTATION);

  const baseRotationY =
    hex.item.id === QUOTE_HEX_ID ? Math.PI + hex.rotY : hex.rotY;
  hex.mesh.rotation.set(hex.rotX, baseRotationY, 0);

  // Scale spring
  hex.scaleVel =
    hex.scaleVel * DAMPING + (hex.scaleTarget - hex.scale) * STIFFNESS;
  hex.scale = Math.max(0, hex.scale + hex.scaleVel);
  // Quote hex maintains fixed size, portfolio hexes scale with grid
  const finalScale =
    hex.item.id === QUOTE_HEX_ID ? hex.scale : meshScale * hex.scale;
  hex.mesh.scale.setScalar(finalScale);
  hex.mesh.visible = hex.scale > 0.01;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
