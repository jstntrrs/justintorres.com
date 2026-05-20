"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import {
  SKILLS,
  WORKS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  CAMERA_FOV,
  HEX_LIFT_FACTOR,
  HOVER_LIFT_FACTOR,
  ORBIT_DAMPING,
  MIN_ZOOM_FACTOR,
  MAX_ZOOM_FACTOR,
  MAX_PIXEL_RATIO,
  DRAG_THRESHOLD,
  HOVER_SAMPLE_FRAMES,
  RESIZE_DEBOUNCE_MS,
  ROTATION_SMOOTH_FACTOR,
  ROTATION_SCALE_FACTOR,
  PORTFOLIO_Z_FRONT,
  QUOTE_HEX_ID,
} from "@/lib/constants";
import type { HexItem, Filter, TextureCtx, VgHex } from "@/lib/types";
import {
  getPrimaryColor,
  generateHexGridSlots,
  calculateCellSize,
  loadImage,
  createHexGeometry,
  createStarfield,
  updateHexPhysics,
  createPortfolioHex,
  createQuoteHex,
  createItemTexture,
} from "@/lib/client";
import { useTooltip } from "@/lib/context";

type ThreeModule = typeof THREE;

const threePromise = import("three");
const orbitPromise = import("three/examples/jsm/controls/OrbitControls.js");

const PORTFOLIO_ITEMS = [...SKILLS, ...WORKS];

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const output = [...arr];
  let rng = seed >>> 0;

  for (let i = output.length - 1; i > 0; i--) {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    const j = rng % (i + 1);
    [output[i], output[j]] = [output[j], output[i]];
  }

  return output;
}

function matchesFilter(item: HexItem, filter: Filter): boolean {
  return filter === "all" || item.type === filter;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PortfolioProps {
  filter: Filter;
  theme: string;
  selectedItem: HexItem | null;
  onLoadingChange: (loading: boolean) => void;
  onSelectedChange: (item: HexItem | null) => void;
}

export default function Portfolio({
  filter,
  theme,
  selectedItem,
  onLoadingChange,
  onSelectedChange,
}: PortfolioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hexesRef = useRef<VgHex[]>([]);
  const filterRef = useRef<Filter>(filter);
  const meshScaleRef = useRef(1);
  const baseCellSizeRef = useRef(0);
  const viewportRef = useRef({ w: 0, h: 0 });
  const selectedHexRef = useRef<VgHex | null>(null);
  const hoveredHexRef = useRef<VgHex | null>(null);
  const { showTooltip, hideTooltip, updatePosition } = useTooltip();

  function refitLayout(currentFilter: Filter): void {
    const hexes = hexesRef.current;
    const { w, h } = viewportRef.current;
    if (!hexes.length || !w || !h || !baseCellSizeRef.current) return;

    const visible: VgHex[] = [];
    const hidden: VgHex[] = [];

    for (const hex of hexes) {
      if (hex.item.id === QUOTE_HEX_ID) continue;
      const shouldShow = matchesFilter(hex.item, currentFilter);
      (shouldShow ? visible : hidden).push(hex);
    }

    if (!visible.length) {
      for (const hex of hidden) hex.scaleTarget = 0;
      return;
    }

    visible.sort((a, b) => a.slotIndex - b.slotIndex);
    const newSlots = generateHexGridSlots(visible.length);
    const newCellSize = calculateCellSize(newSlots, w, h);
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
        hex.mesh.position.set(hex.posX, hex.posY, PORTFOLIO_Z_FRONT);
      }

      hex.scaleTarget = 1;
    });

    for (const hex of hidden) {
      hex.scaleTarget = 0;
      hex.targetX = hex.posX;
      hex.targetY = hex.posY;

      if (selectedHexRef.current === hex) {
        hex.targetZ = PORTFOLIO_Z_FRONT;
        hex.mesh.renderOrder = 0;
        selectedHexRef.current = null;
        onSelectedChange(null);
      }
    }
  }

  useEffect(() => {
    filterRef.current = filter;
    refitLayout(filter);
  }, [filter]);

  useEffect(() => {
    // Sync external selectedItem changes with internal selectedHexRef
    if (!selectedItem && selectedHexRef.current) {
      selectedHexRef.current.targetZ = PORTFOLIO_Z_FRONT;
      selectedHexRef.current.mesh.renderOrder = 0;
      selectedHexRef.current = null;
    }
  }, [selectedItem]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId: number;
    const cleanups: Array<() => void> = [];

    (async () => {
      const three: ThreeModule = await threePromise;
      const { OrbitControls } = await orbitPromise;

      if (cancelled) return;

      const primaryColor = getPrimaryColor();
      const width = container.clientWidth || DEFAULT_CANVAS_WIDTH;
      const height = container.clientHeight || DEFAULT_CANVAS_HEIGHT;
      viewportRef.current = { w: width, h: height };

      const renderer = new three.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
      );
      renderer.setClearColor(0x000000, 0);
      renderer.sortObjects = true;
      Object.assign(renderer.domElement.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      container.appendChild(renderer.domElement);
      cleanups.push(() => {
        renderer.dispose();
        renderer.domElement.remove();
      });

      const cameraZ =
        height / (2 * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180));
      const camera = new three.PerspectiveCamera(
        CAMERA_FOV,
        width / height,
        1,
        8000,
      );
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, 0);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = ORBIT_DAMPING;
      controls.enableZoom = true;
      controls.minDistance = cameraZ * MIN_ZOOM_FACTOR;
      controls.maxDistance = cameraZ * MAX_ZOOM_FACTOR;
      controls.enablePan = false;
      controls.target.set(0, 0, 0);
      controls.update();
      cleanups.push(() => controls.dispose());

      const scene = new three.Scene();
      scene.add(new three.AmbientLight(0xffffff, 1));
      scene.add(createStarfield(three, primaryColor));

      const texCtx: TextureCtx = {
        images: new Map(),
        THREE: three,
        primaryColor,
      };

      const shuffledItems = shuffleArray(
        PORTFOLIO_ITEMS,
        Math.random() * 0xffffffff,
      );

      const slots = generateHexGridSlots(shuffledItems.length);
      const cellSize = calculateCellSize(slots, width, height);
      baseCellSizeRef.current = cellSize;
      meshScaleRef.current = 1;

      if (cancelled) return;

      const hexGeometry = createHexGeometry(three, cellSize);
      const hexes: VgHex[] = [];
      const meshes: THREE.Mesh[] = [];

      shuffledItems.forEach((item, index) => {
        hexes.push(
          createPortfolioHex(
            item,
            slots[index],
            index,
            cellSize,
            hexGeometry,
            texCtx,
            scene,
            meshes,
            three,
            height,
          ),
        );
      });

      hexes.push(createQuoteHex(cellSize, texCtx, scene, three, height));

      hexesRef.current = hexes;
      refitLayout(filterRef.current);
      onLoadingChange(false);

      // Load images progressively and update textures as they arrive
      const uniqueImages = [
        ...new Set(
          shuffledItems
            .map((item) => item.image)
            .filter((img): img is string => Boolean(img)),
        ),
      ];
      uniqueImages.forEach(async (image) => {
        const img = await loadImage(image, primaryColor);
        if (cancelled || !img) return;
        texCtx.images.set(image, img);
        // Update textures for hexes that use this image
        for (const hex of hexes) {
          if (hex.item.image === image) {
            const mat = hex.mesh.material as THREE.MeshBasicMaterial;
            mat.map?.dispose();
            mat.map = createItemTexture(hex.item, texCtx);
            mat.needsUpdate = true;
          }
        }
      });

      const pointer = new three.Vector2(-9999, -9999);
      const raycaster = new three.Raycaster();
      let dragStartX = 0;
      let dragStartY = 0;
      let isDragging = false;

      function handleMouseMove(event: MouseEvent): void {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = ((event.clientY - rect.top) / rect.height) * -2 + 1;
        updatePosition(event.clientX - rect.left, event.clientY - rect.top);

        if (
          Math.abs(event.clientX - dragStartX) > DRAG_THRESHOLD ||
          Math.abs(event.clientY - dragStartY) > DRAG_THRESHOLD
        ) {
          isDragging = true;
        }
      }

      function handleMouseDown(event: MouseEvent): void {
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        isDragging = false;
      }

      function handleMouseLeave(): void {
        pointer.set(-9999, -9999);
        if (
          hoveredHexRef.current &&
          hoveredHexRef.current !== selectedHexRef.current
        ) {
          hoveredHexRef.current.targetZ = PORTFOLIO_Z_FRONT;
        }
        hoveredHexRef.current = null;
        hideTooltip();
        if (container) container.style.cursor = "";
      }

      function handleClick(): void {
        if (isDragging) return;

        raycaster.setFromCamera(pointer, camera);
        const hitHex =
          (raycaster.intersectObjects(meshes)[0]?.object.userData
            .hex as VgHex) ?? null;

        if (!hitHex) {
          if (selectedHexRef.current) {
            selectedHexRef.current.targetZ = PORTFOLIO_Z_FRONT;
            selectedHexRef.current.mesh.renderOrder = 0;
            selectedHexRef.current = null;
            onSelectedChange(null);
          }
          return;
        }

        if (selectedHexRef.current === hitHex) {
          // Deselecting — restore hover lift if pointer is still over it
          hitHex.targetZ =
            hitHex === hoveredHexRef.current && hitHex.item.id !== QUOTE_HEX_ID
              ? PORTFOLIO_Z_FRONT + cameraZ * HOVER_LIFT_FACTOR
              : PORTFOLIO_Z_FRONT;
          hitHex.mesh.renderOrder = 0;
          selectedHexRef.current = null;
          onSelectedChange(null);
          return;
        }

        if (selectedHexRef.current) {
          selectedHexRef.current.targetZ = PORTFOLIO_Z_FRONT;
          selectedHexRef.current.mesh.renderOrder = 0;
        }

        if (hoveredHexRef.current === hitHex) hoveredHexRef.current = null;

        hitHex.targetZ = PORTFOLIO_Z_FRONT + cameraZ * HEX_LIFT_FACTOR;
        hitHex.mesh.renderOrder = 1;
        selectedHexRef.current = hitHex;
        onSelectedChange(hitHex.item);
      }

      container.addEventListener("mousedown", handleMouseDown);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
      container.addEventListener("click", handleClick);
      cleanups.push(() => {
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        container.removeEventListener("click", handleClick);
      });

      let resizeTimeout: ReturnType<typeof setTimeout>;
      const resizeObserver = new ResizeObserver(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (!newWidth || !newHeight) return;

        renderer.setSize(newWidth, newHeight, false);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        viewportRef.current = { w: newWidth, h: newHeight };

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(
          () => refitLayout(filterRef.current),
          RESIZE_DEBOUNCE_MS,
        );
      });
      resizeObserver.observe(container);
      cleanups.push(() => {
        resizeObserver.disconnect();
        clearTimeout(resizeTimeout);
      });

      let frame = 0;
      let prevAzimuth = 0;
      let prevPolar = 0;
      let rotDeltaX = 0;
      let rotDeltaY = 0;

      function animate(): void {
        rafId = requestAnimationFrame(animate);
        frame++;
        controls.update();

        const azimuthDelta = controls.getAzimuthalAngle() - prevAzimuth;
        const polarDelta = controls.getPolarAngle() - prevPolar;
        prevAzimuth = controls.getAzimuthalAngle();
        prevPolar = controls.getPolarAngle();

        rotDeltaX =
          rotDeltaX * ROTATION_SMOOTH_FACTOR +
          polarDelta * ROTATION_SCALE_FACTOR;
        rotDeltaY =
          rotDeltaY * ROTATION_SMOOTH_FACTOR -
          azimuthDelta * ROTATION_SCALE_FACTOR;

        const meshScale = meshScaleRef.current;
        for (const hex of hexes) {
          updateHexPhysics(hex, meshScale, rotDeltaX, rotDeltaY);
        }

        if (frame % HOVER_SAMPLE_FRAMES === 0) {
          raycaster.setFromCamera(pointer, camera);
          const hitHex =
            (raycaster.intersectObjects(meshes)[0]?.object.userData
              .hex as VgHex) ?? null;

          if (hitHex !== hoveredHexRef.current) {
            if (
              hoveredHexRef.current &&
              hoveredHexRef.current !== selectedHexRef.current
            ) {
              hoveredHexRef.current.targetZ = PORTFOLIO_Z_FRONT;
            }

            if (
              hitHex &&
              hitHex !== selectedHexRef.current &&
              hitHex.item.id !== QUOTE_HEX_ID
            ) {
              hitHex.targetZ = PORTFOLIO_Z_FRONT + cameraZ * HOVER_LIFT_FACTOR;
              hoveredHexRef.current = hitHex;
            } else {
              hoveredHexRef.current = null;
            }

            // Show or hide tooltip based on hitHex
            if (hitHex?.item) {
              showTooltip(hitHex.item.name);
            } else {
              hideTooltip();
            }
            if (container) container.style.cursor = hitHex ? "pointer" : "";
          }
        }

        renderer.render(scene, camera);
      }

      animate();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId!);
      cleanups.forEach((fn) => fn());
      hexesRef.current = [];
    };
  }, [
    theme,
    onLoadingChange,
    onSelectedChange,
    showTooltip,
    hideTooltip,
    updatePosition,
  ]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
