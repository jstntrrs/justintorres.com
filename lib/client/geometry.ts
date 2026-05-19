import type * as THREE from "three";
import {
  HEX_RADIUS_FACTOR,
  STAR_COUNT,
  STAR_RADIUS,
  STAR_SIZE,
  STAR_OPACITY,
} from "@/lib/constants";

type ThreeModule = typeof THREE;

export function createHexGeometry(
  three: ThreeModule,
  cellSize: number,
): THREE.BufferGeometry {
  const radius = cellSize * HEX_RADIUS_FACTOR;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    positions.push(radius * Math.cos(angle), radius * Math.sin(angle), 0);
    uvs.push(Math.cos(angle) / Math.sqrt(3) + 0.5, Math.sin(angle) / 2 + 0.5);
  }

  for (let i = 0; i < 6; i++) {
    indices.push(0, i + 1, ((i + 1) % 6) + 1);
  }

  const geometry = new three.BufferGeometry();
  geometry.setAttribute(
    "position",
    new three.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function createStarfield(
  three: ThreeModule,
  primaryColor: string,
): THREE.Group {
  const group = new three.Group();
  const starsPerSize = Math.floor(STAR_COUNT / STAR_SIZE.length);

  STAR_SIZE.forEach((size, si) => {
    const count =
      si === STAR_SIZE.length - 1
        ? STAR_COUNT - starsPerSize * si
        : starsPerSize;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = STAR_RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = STAR_RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = STAR_RADIUS * Math.cos(phi);
    }

    const geometry = new three.BufferGeometry();
    geometry.setAttribute("position", new three.BufferAttribute(positions, 3));

    const material = new three.PointsMaterial({
      color: primaryColor,
      size,
      transparent: true,
      opacity: STAR_OPACITY,
      sizeAttenuation: false,
    });

    group.add(new three.Points(geometry, material));
  });

  return group;
}
