"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { SKILLS, WORKS } from "@/data/portfolio-items";
import {
  TEX_SIZE,
  DROP_SEED,
  STIFFNESS,
  DAMPING,
  HEX_COL_SPACING,
  HEX_ROW_SPACING,
  HEX_RADIUS_FACTOR,
  HEX_BORDER_INSET,
  LOGO_PAD_FACTOR,
  LOGO_FONT_SIZE,
  HEX_BORDER_WIDTH,
  PRIMARY_COLOR,
  DROP_DELAY_FACTOR,
  MAX_CELL_SIZE,
  LAYOUT_PADDING,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DROP_HEIGHT_FACTOR,
  CAMERA_FOV,
  HEX_LIFT_FACTOR,
  ORBIT_DAMPING,
  MIN_ZOOM_FACTOR,
  MAX_ZOOM_FACTOR,
  MAX_PIXEL_RATIO,
  DRAG_THRESHOLD,
  HOVER_SAMPLE_FRAMES,
  RESIZE_DEBOUNCE_MS,
  GRID_ASPECT_RATIO,
} from "@/lib/schema";
import type { HexItem, FilterType, TextureCtx, VgHex } from "@/lib/schema";

// ─── Hex Grid Layout ──────────────────────────────────────────────────────────

// Generate unit-space slot positions for pointy-top hexes in a square arrangement
function generateSquareHexSlots(count: number): { ux: number; uy: number }[] {
  if (count === 0) return [];

  const HALF_COL = HEX_COL_SPACING / 2;

  // Calculate optimal column count for desired aspect ratio
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

  const slots: { ux: number; uy: number }[] = [];
  let remaining = count;
  let row = 0;

  // Build rows with centered short rows and odd-row stagger
  while (remaining > 0) {
    const rowCount = Math.min(cols, remaining);
    remaining -= rowCount;
    const skip = cols - rowCount;
    const startCol = Math.floor(skip / 2) - Math.floor((cols - 1) / 2);
    const rowOffset = row % 2 === 1 ? HALF_COL : 0;

    for (let c = 0; c < rowCount; c++) {
      const col = startCol + c;
      slots.push({
        ux: col * HEX_COL_SPACING + rowOffset,
        uy: -row * HEX_ROW_SPACING,
      });
    }
    row++;
  }

  // Shift centroid to origin for centered grid
  const cx = slots.reduce((s, p) => s + p.ux, 0) / slots.length;
  const cy = slots.reduce((s, p) => s + p.uy, 0) / slots.length;
  return slots.map((p) => ({ ux: p.ux - cx, uy: p.uy - cy }));
}

// Calculate cell size that fits slots inside viewport with padding
function fitCellSizeToSlots(
  slots: { ux: number; uy: number }[],
  w: number,
  h: number,
): number {
  if (!slots.length) return 40;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of slots) {
    if (p.ux < minX) minX = p.ux;
    if (p.ux > maxX) maxX = p.ux;
    if (p.uy < minY) minY = p.uy;
    if (p.uy > maxY) maxY = p.uy;
  }
  return Math.min(
    (w * LAYOUT_PADDING) / (maxX - minX + HEX_COL_SPACING),
    (h * LAYOUT_PADDING) / (maxY - minY + 2.0),
    MAX_CELL_SIZE,
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

// Seeded shuffle for consistent drop order
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Load and optionally resize image
async function loadImg(src: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    let blob = await res.blob();
    if (src.endsWith(".svg")) {
      const text = await blob.text();
      const sized = text.replace(
        /<svg\b/,
        `<svg width="${TEX_SIZE}" height="${TEX_SIZE}"`,
      );
      blob = new Blob([sized], { type: "image/svg+xml" });
    }
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

// ─── Three.js Builders ────────────────────────────────────────────────────────

// Build pointy-top hex geometry with center-fan triangles
function buildPointyTopHexGeo(
  THREE: typeof import("three"),
  cellSize: number,
): THREE.BufferGeometry {
  const r = cellSize * HEX_RADIUS_FACTOR;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];

  // Center vertex
  pos.push(0, 0, 0);
  uv.push(0.5, 0.5);

  // 6 border vertices with UV mapping for pointy-top hex
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pos.push(r * Math.cos(a), r * Math.sin(a), 0);
    uv.push(Math.cos(a) / Math.sqrt(3) + 0.5, Math.sin(a) / 2 + 0.5);
  }

  // Build 6 triangles
  for (let i = 0; i < 6; i++) {
    idx.push(0, i + 1, ((i + 1) % 6) + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Draw hex path on canvas context
function drawHexPath(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  inset: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const px =
      centerX + inset * ((Math.cos(a) / Math.sqrt(3) + 0.5) * size - centerX);
    const py = centerY + inset * ((0.5 - Math.sin(a) / 2) * size - centerY);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Create hex texture with logo and border
function makeHexTex(item: HexItem, ctx: TextureCtx): THREE.CanvasTexture {
  const { THREE } = ctx;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX_SIZE;
  const c = canvas.getContext("2d")!;
  const hx = TEX_SIZE / 2;
  const hy = TEX_SIZE / 2;

  c.clearRect(0, 0, TEX_SIZE, TEX_SIZE);

  const img = ctx.logoImages.get(item.logo);

  // Clip to hex and draw logo
  c.save();
  // For works: clip to border inset so image aligns with border edge
  // For skills: clip to full hex since logo has padding anyway
  const clipInset = item.type === "work" ? HEX_BORDER_INSET : 1;
  drawHexPath(c, hx, hy, TEX_SIZE, clipInset);
  c.clip();

  if (img) {
    // Calculate target area based on type
    let targetSize, pad;
    if (item.type === "work") {
      // Fill to the border edge (no padding, but inset to border size)
      targetSize = TEX_SIZE * HEX_BORDER_INSET;
      pad = (TEX_SIZE - targetSize) / 2;
    } else {
      // Skills use padding for breathing room
      pad = TEX_SIZE * LOGO_PAD_FACTOR;
      targetSize = TEX_SIZE - 2 * pad;
    }

    // Calculate scale to cover (maintain aspect ratio, fill area completely)
    const scale = Math.max(targetSize / img.width, targetSize / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;

    // Center the scaled image
    const x = hx - scaledW / 2;
    const y = hy - scaledH / 2;

    c.drawImage(img, x, y, scaledW, scaledH);
  } else {
    c.fillStyle = PRIMARY_COLOR;
    c.font = `700 ${Math.round(TEX_SIZE * LOGO_FONT_SIZE)}px system-ui,sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(item.name.slice(0, 3).toUpperCase(), hx, hy);
  }
  c.restore();

  // Draw border
  c.strokeStyle = PRIMARY_COLOR;
  c.lineWidth = HEX_BORDER_WIDTH;
  drawHexPath(c, hx, hy, TEX_SIZE, HEX_BORDER_INSET);
  c.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// ─── Spring Physics ───────────────────────────────────────────────────────────

// Update hex spring physics
function stepVgHex(hex: VgHex, meshScale: number) {
  if (hex.dropDelay > 0) {
    hex.dropDelay--;
    return;
  }
  hex.velX = hex.velX * DAMPING + (hex.targetX - hex.posX) * STIFFNESS;
  hex.velY = hex.velY * DAMPING + (hex.targetY - hex.posY) * STIFFNESS;
  hex.velZ = hex.velZ * DAMPING + (hex.targetZ - hex.posZ) * STIFFNESS;
  hex.posX += hex.velX;
  hex.posY += hex.velY;
  hex.posZ += hex.velZ;
  hex.mesh.position.set(hex.posX, hex.posY, hex.posZ);

  hex.scaleVel =
    hex.scaleVel * DAMPING + (hex.scaleTarget - hex.scale) * STIFFNESS;
  hex.scale = Math.max(0, hex.scale + hex.scaleVel);
  hex.mesh.scale.setScalar(meshScale * hex.scale);
  hex.mesh.visible = hex.scale > 0.01;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PortfolioProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onLoadingChange: (loading: boolean) => void;
  onHoverChange: (item: HexItem | null) => void;
  onTipPosChange: (pos: { x: number; y: number }) => void;
  onSelectedChange: (item: HexItem | null) => void;
}

export default function Portfolio({
  filter,
  onFilterChange,
  onLoadingChange,
  onHoverChange,
  onTipPosChange,
  onSelectedChange,
}: PortfolioProps) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const hexesRef = useRef<VgHex[]>([]);
  const filterRef = useRef<FilterType>(filter);
  const meshScaleRef = useRef(1);
  const baseCellSizeRef = useRef(0);
  const viewportRef = useRef({ w: 0, h: 0 });
  const selectedHexRef = useRef<VgHex | null>(null);

  // Update filter ref when prop changes
  useEffect(() => {
    filterRef.current = filter;
    refitLayout(filter);
  }, [filter]);

  // Refit layout based on filter
  function refitLayout(f: FilterType) {
    const hexes = hexesRef.current;
    const { w, h } = viewportRef.current;
    if (!hexes.length || !w || !h || !baseCellSizeRef.current) return;

    const visible: VgHex[] = [];
    const hidden: VgHex[] = [];
    for (const hex of hexes) {
      const show =
        f === "all" ||
        (f === "skills" && hex.item.type === "skill") ||
        (f === "works" && hex.item.type === "work");
      (show ? visible : hidden).push(hex);
    }

    if (!visible.length) {
      for (const hex of hidden) hex.scaleTarget = 0;
      return;
    }

    visible.sort((a, b) => a.slotIndex - b.slotIndex);
    const newSlots = generateSquareHexSlots(visible.length);
    const newCellSize = fitCellSizeToSlots(newSlots, w, h);
    meshScaleRef.current = newCellSize / baseCellSizeRef.current;

    visible.forEach((hex, i) => {
      const slot = newSlots[i];
      hex.targetX = slot.ux * newCellSize;
      hex.targetY = slot.uy * newCellSize;
      if (hex.scale < 0.1) {
        hex.posX = hex.targetX;
        hex.posY = hex.targetY;
        hex.velX = 0;
        hex.velY = 0;
        hex.mesh.position.set(hex.posX, hex.posY, 0);
      }
      hex.scaleTarget = 1;
    });

    for (const hex of hidden) {
      hex.scaleTarget = 0;
      hex.targetX = hex.posX;
      hex.targetY = hex.posY;
      if (selectedHexRef.current === hex) {
        hex.targetZ = 0;
        hex.mesh.renderOrder = 0;
        selectedHexRef.current = null;
        onSelectedChange(null);
      }
    }
  }

  // Deselect current hex
  function deselect() {
    if (selectedHexRef.current) {
      selectedHexRef.current.targetZ = 0;
      selectedHexRef.current.mesh.renderOrder = 0;
      selectedHexRef.current = null;
    }
    onSelectedChange(null);
  }

  // Apply filter and refit
  function applyFilter(f: FilterType) {
    deselect();
    onFilterChange(f);
  }

  // Setup Three.js scene
  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId: number;
    const disposers: Array<() => void> = [];

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "three/examples/jsm/controls/OrbitControls.js"
      );
      if (cancelled) return;

      const width = container.clientWidth || DEFAULT_CANVAS_WIDTH;
      const height = container.clientHeight || DEFAULT_CANVAS_HEIGHT;
      viewportRef.current = { w: width, h: height };

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
      );
      renderer.setClearColor(0x000000, 0);
      Object.assign(renderer.domElement.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      container.appendChild(renderer.domElement);
      disposers.push(() => {
        renderer.dispose();
        renderer.domElement.remove();
      });

      // Setup camera
      const cameraZ =
        height / (2 * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180));
      const camera = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        width / height,
        1,
        8000,
      );
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, 0);

      // Setup controls
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controls = new (OrbitControls as any)(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = ORBIT_DAMPING;
      controls.enableZoom = true;
      controls.minDistance = cameraZ * MIN_ZOOM_FACTOR;
      controls.maxDistance = cameraZ * MAX_ZOOM_FACTOR;
      controls.enablePan = false;
      controls.target.set(0, 0, 0);
      controls.update();
      disposers.push(() => controls.dispose());

      // Setup scene
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 1));

      // Create back plane with quote
      const backCanvas = document.createElement("canvas");
      backCanvas.width = 2048;
      backCanvas.height = 1024;
      const backCtx = backCanvas.getContext("2d")!;
      // Flip horizontally so text reads correctly when viewed from behind
      backCtx.translate(backCanvas.width, 0);
      backCtx.scale(-1, 1);
      backCtx.fillStyle = PRIMARY_COLOR;
      backCtx.globalAlpha = 0.08;
      backCtx.font = "bold 48px system-ui, sans-serif";
      backCtx.textAlign = "center";
      backCtx.textBaseline = "middle";
      backCtx.fillText(
        '"Somewhere, something incredible',
        backCanvas.width / 2,
        backCanvas.height / 2 - 60,
      );
      backCtx.fillText(
        'is waiting to be known."',
        backCanvas.width / 2,
        backCanvas.height / 2,
      );
      backCtx.font = "italic 32px system-ui, sans-serif";
      backCtx.fillText(
        "― Carl Sagan",
        backCanvas.width / 2,
        backCanvas.height / 2 + 60,
      );

      const backTexture = new THREE.CanvasTexture(backCanvas);
      backTexture.generateMipmaps = false;
      backTexture.minFilter = THREE.LinearFilter;

      const backPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(width * 2, height * 2),
        new THREE.MeshBasicMaterial({
          map: backTexture,
          transparent: true,
          side: THREE.BackSide,
        }),
      );
      backPlane.position.z = -1;
      scene.add(backPlane);

      const texCtx: TextureCtx = {
        logoImages: new Map(),
        THREE,
      };

      // Generate hex layout
      const shuffled = seededShuffle([...SKILLS, ...WORKS], DROP_SEED);
      const slots = generateSquareHexSlots(shuffled.length);
      const cellSize = fitCellSizeToSlots(slots, width, height);
      baseCellSizeRef.current = cellSize;
      meshScaleRef.current = 1;

      // Preload logos
      const uniqueLogos = [...new Set(shuffled.map((i) => i.logo))];
      await Promise.all(
        uniqueLogos.map(async (logo) => {
          texCtx.logoImages.set(logo, await loadImg(logo));
        }),
      );
      if (cancelled) return;

      // Build hex meshes
      const hexGeo = buildPointyTopHexGeo(THREE, cellSize);
      const dropFromY = height / 2 + cellSize * DROP_HEIGHT_FACTOR;
      const springHexes: VgHex[] = [];
      const meshList: THREE.Mesh[] = [];

      shuffled.forEach((item, i) => {
        const { ux, uy } = slots[i];
        const x = ux * cellSize;
        const y = uy * cellSize;

        const mesh = new THREE.Mesh(
          hexGeo,
          new THREE.MeshBasicMaterial({
            map: makeHexTex(item, texCtx),
            transparent: true,
            side: THREE.FrontSide,
          }),
        );
        mesh.position.set(x, dropFromY, 0);
        scene.add(mesh);
        meshList.push(mesh);

        const springHex: VgHex = {
          mesh,
          item,
          posX: x,
          posY: dropFromY,
          posZ: 0,
          velX: 0,
          velY: 0,
          velZ: 0,
          targetX: x,
          targetY: y,
          targetZ: 0,
          dropDelay: Math.round(i * DROP_DELAY_FACTOR),
          slotIndex: i,
          scale: 1,
          scaleTarget: 1,
          scaleVel: 0,
        };
        mesh.userData = { item, hex: springHex };
        springHexes.push(springHex);
      });

      hexesRef.current = springHexes;
      refitLayout(filterRef.current);
      onLoadingChange(false);

      // Mouse interaction
      const mouse = new THREE.Vector2(-9999, -9999);
      const raycaster = new THREE.Raycaster();
      let lastHovered: HexItem | null = null;
      let pointerDownX = 0;
      let pointerDownY = 0;
      let didDrag = false;

      function onMouseMove(e: MouseEvent) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = ((e.clientY - rect.top) / rect.height) * -2 + 1;
        onTipPosChange({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        if (
          Math.abs(e.clientX - pointerDownX) > DRAG_THRESHOLD ||
          Math.abs(e.clientY - pointerDownY) > DRAG_THRESHOLD
        ) {
          didDrag = true;
        }
      }

      function onMouseDown(e: MouseEvent) {
        pointerDownX = e.clientX;
        pointerDownY = e.clientY;
        didDrag = false;
      }

      function onMouseLeave() {
        mouse.set(-9999, -9999);
        onHoverChange(null);
        lastHovered = null;
        if (container) container.style.cursor = "";
      }

      function onClick() {
        if (didDrag) return;
        raycaster.setFromCamera(mouse, camera);
        const hit = raycaster.intersectObjects(meshList)[0];
        const hitHex = (hit?.object.userData.hex as VgHex) ?? null;

        if (!hitHex) {
          if (selectedHexRef.current) {
            selectedHexRef.current.targetZ = 0;
            selectedHexRef.current.mesh.renderOrder = 0;
            selectedHexRef.current = null;
            onSelectedChange(null);
          }
          return;
        }

        if (selectedHexRef.current === hitHex) {
          hitHex.targetZ = 0;
          hitHex.mesh.renderOrder = 0;
          selectedHexRef.current = null;
          onSelectedChange(null);
          return;
        }

        if (selectedHexRef.current) {
          selectedHexRef.current.targetZ = 0;
          selectedHexRef.current.mesh.renderOrder = 0;
        }

        hitHex.targetZ = cameraZ * HEX_LIFT_FACTOR;
        hitHex.mesh.renderOrder = 1;
        selectedHexRef.current = hitHex;
        onSelectedChange(hitHex.item);
      }

      container.addEventListener("mousedown", onMouseDown);
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      container.addEventListener("click", onClick);
      disposers.push(() => {
        container.removeEventListener("mousedown", onMouseDown);
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
        container.removeEventListener("click", onClick);
      });

      // Handle resize
      let resizeTimer: ReturnType<typeof setTimeout>;
      const resizeObserver = new ResizeObserver(() => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (!newW || !newH) return;
        renderer.setSize(newW, newH, false);
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        viewportRef.current = { w: newW, h: newH };
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(
          () => refitLayout(filterRef.current),
          RESIZE_DEBOUNCE_MS,
        );
      });
      resizeObserver.observe(container);
      disposers.push(() => {
        resizeObserver.disconnect();
        clearTimeout(resizeTimer);
      });

      // Render loop
      let frame = 0;
      function animate() {
        rafId = requestAnimationFrame(animate);
        frame++;
        controls.update();

        const meshScale = meshScaleRef.current;
        for (const hex of springHexes) stepVgHex(hex, meshScale);

        // Sample hover every N frames for performance
        if (frame % HOVER_SAMPLE_FRAMES === 0) {
          raycaster.setFromCamera(mouse, camera);
          const hitItem =
            (raycaster.intersectObjects(meshList)[0]?.object.userData
              .item as HexItem) ?? null;
          if (hitItem !== lastHovered) {
            lastHovered = hitItem;
            onHoverChange(hitItem);
            if (container) container.style.cursor = hitItem ? "pointer" : "";
          }
        }

        renderer.render(scene, camera);
      }

      animate();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId!);
      disposers.forEach((fn) => fn());
      hexesRef.current = [];
    };
  }, [onLoadingChange, onHoverChange, onTipPosChange, onSelectedChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={canvasWrapRef} className="absolute inset-0" />;
}
