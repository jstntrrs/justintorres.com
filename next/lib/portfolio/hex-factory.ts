import type * as THREE from "three";
import {
  DEFAULT_CANVAS_HEIGHT,
  DROP_HEIGHT_FACTOR,
  DROP_START_Z,
  DROP_DELAY_FACTOR,
  PORTFOLIO_Z_FRONT,
  QUOTE_Z_BACK,
  QUOTE_HEX_SCALE,
  QUOTE_HEX_ID,
} from "@/lib/constants";
import type { HexItem, TextureCtx, VgHex } from "@/lib/types";
import { createHexGeometry } from "./geometry";
import { createItemTexture, createQuoteTexture } from "./textures";

type ThreeModule = typeof THREE;

export function createPortfolioHex(
  item: HexItem,
  slot: { ux: number; uy: number },
  index: number,
  cellSize: number,
  geometry: THREE.BufferGeometry,
  texCtx: TextureCtx,
  scene: THREE.Scene,
  meshes: THREE.Mesh[],
  three: ThreeModule,
  viewportHeight: number,
): VgHex {
  const x = slot.ux * cellSize;
  const y = slot.uy * cellSize;
  const distanceFromCenter = Math.sqrt(x * x + y * y) / cellSize;
  const dropStartY =
    (viewportHeight / 2 || DEFAULT_CANVAS_HEIGHT / 2) +
    cellSize * DROP_HEIGHT_FACTOR;

  const mesh = new three.Mesh(
    geometry,
    new three.MeshBasicMaterial({
      map: createItemTexture(item, texCtx),
      transparent: true,
      side: three.FrontSide,
      depthTest: true,
      depthWrite: true,
    }),
  );

  mesh.position.set(x, dropStartY, DROP_START_Z);
  mesh.renderOrder = 0;
  scene.add(mesh);
  meshes.push(mesh);

  const hex: VgHex = {
    mesh,
    item,
    posX: x,
    posY: dropStartY,
    posZ: DROP_START_Z,
    velX: 0,
    velY: 0,
    velZ: 0,
    targetX: x,
    targetY: y,
    targetZ: PORTFOLIO_Z_FRONT,
    dropDelay: Math.round(index * DROP_DELAY_FACTOR),
    slotIndex: index,
    scale: 1,
    scaleTarget: 1,
    scaleVel: 0,
    rotX: 0,
    rotY: 0,
    rotVelX: 0,
    rotVelY: 0,
    distanceFromCenter,
  };

  mesh.userData = { item, hex };
  return hex;
}

export function createQuoteHex(
  cellSize: number,
  texCtx: TextureCtx,
  scene: THREE.Scene,
  three: ThreeModule,
  viewportHeight: number,
): VgHex {
  const dropStartY =
    (viewportHeight / 2 || DEFAULT_CANVAS_HEIGHT / 2) +
    cellSize * DROP_HEIGHT_FACTOR;

  const quoteItem: HexItem = {
    id: QUOTE_HEX_ID,
    name: "Quote",
    type: "all",
    image: "",
  };

  const geometry = createHexGeometry(three, cellSize * QUOTE_HEX_SCALE);
  const mesh = new three.Mesh(
    geometry,
    new three.MeshBasicMaterial({
      map: createQuoteTexture(texCtx),
      transparent: true,
      side: three.FrontSide,
      depthTest: true,
      depthWrite: true,
    }),
  );

  mesh.position.set(0, dropStartY, DROP_START_Z);
  mesh.rotation.y = Math.PI;
  mesh.renderOrder = 0;
  scene.add(mesh);

  const hex: VgHex = {
    mesh,
    item: quoteItem,
    posX: 0,
    posY: dropStartY,
    posZ: DROP_START_Z,
    velX: 0,
    velY: 0,
    velZ: 0,
    targetX: 0,
    targetY: 0,
    targetZ: QUOTE_Z_BACK,
    dropDelay: 0,
    slotIndex: -1,
    scale: 1,
    scaleTarget: 1,
    scaleVel: 0,
    rotX: 0,
    rotY: 0,
    rotVelX: 0,
    rotVelY: 0,
    distanceFromCenter: 0,
  };

  mesh.userData = { item: quoteItem, hex };
  return hex;
}
