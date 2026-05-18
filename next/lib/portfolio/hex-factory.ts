import type * as THREE from "three";
import {
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

  mesh.position.set(x, y, PORTFOLIO_Z_FRONT);
  mesh.renderOrder = 0;
  mesh.visible = false;
  scene.add(mesh);
  meshes.push(mesh);

  const hex: VgHex = {
    mesh,
    item,
    posX: x,
    posY: y,
    posZ: PORTFOLIO_Z_FRONT,
    velX: 0,
    velY: 0,
    velZ: 0,
    targetX: x,
    targetY: y,
    targetZ: PORTFOLIO_Z_FRONT,
    dropDelay: Math.round(Math.random() * index * DROP_DELAY_FACTOR),
    slotIndex: index,
    scale: 0,
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

  mesh.position.set(0, 0, QUOTE_Z_BACK);
  mesh.rotation.y = Math.PI;
  mesh.renderOrder = 0;
  mesh.visible = false;
  scene.add(mesh);

  const hex: VgHex = {
    mesh,
    item: quoteItem,
    posX: 0,
    posY: 0,
    posZ: QUOTE_Z_BACK,
    velX: 0,
    velY: 0,
    velZ: 0,
    targetX: 0,
    targetY: 0,
    targetZ: QUOTE_Z_BACK,
    dropDelay: 0,
    slotIndex: -1,
    scale: 0,
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
