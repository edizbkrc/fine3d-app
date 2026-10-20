"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { useMediaQuery } from "@mui/material";
import * as THREE from "three";
import {
  filterTagsByPresentationType,
  resolveTagImageUrl,
} from "@helpers/Common/tagFilters";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { preloadFramesInBackground } from "@helpers/Common/backgroundFramePreload";
import { ViewModeEnum } from "@enums/ViewModeEnum";
import ViewerToolbar from "./layout/ViewerToolbar";
import InteractivePolygons from "./polygons/InteractivePolygons";
import NavigationControls from "./layout/NavigationControls";
import LoadingComponent from "@components/LoadingComponent";
import BlockPositionImage from "./layout/BlockPositionImage";
import { setCurrentFrameIndex } from "@redux/appSlice";
import { useNavigationService } from "@hooks/useNavigationService";
import { QueryParamEnum } from "@enums/QueryParamEnum";

type CanvasConfig = {
  preloadFrameCount?: number;
  geometrySize?: [number, number];
  cameraHeight?: number;
  startAngle?: number;
  mobileViewMode?: ViewModeEnum;
};

function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const MIN_CANVAS_HEIGHT = 250;

export default function Scene3D({
  canvasHeight,
  onNavigationChange,
}: {
  canvasHeight?: number;
  onNavigationChange?: (nextFunc: () => void, prevFunc: () => void) => void;
}) {
  const {
    drawerOpen,
    presentationInitResponse,
    presentationResponse,
    currentPresentationType,
    theme,
  } = useAppSelector((state) => state.AppReducer);

  const dispatch = useAppDispatch();
  const navService = useNavigationService();
  const searchParams = useSearchParams();

  const initialFrameFromUrl = useMemo(() => {
    const param = searchParams.get(QueryParamEnum.FrameIndex);
    if (param !== null) {
      const parsed = parseInt(param, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const workspaceItems = useMemo(() => {
    const allTags = presentationResponse?.tags || [];
    return filterTagsByPresentationType(allTags, currentPresentationType);
  }, [presentationResponse?.tags, currentPresentationType]);

  const [viewportDimensions, setViewportDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const ContainerWidth = 1920;
  const ContainerHeight = 1080;
  const totalFrames = workspaceItems?.length || 0;

  const ViewportWidth = useMemo(() => {
    if (isMobile) {
      return viewportDimensions.width;
    }

    const baseWidth = viewportDimensions.width;
    const sidebarWidth = 60;
    const drawerWidth = drawerOpen ? 400 : 0;
    return Math.max(baseWidth - drawerWidth - sidebarWidth, 320);
  }, [drawerOpen, viewportDimensions.width, isMobile]);

  const ViewportHeight = useMemo(() => {
    if (isMobile && canvasHeight !== undefined) {
      return Math.max(canvasHeight, MIN_CANVAS_HEIGHT);
    }
    return Math.max(viewportDimensions.height, MIN_CANVAS_HEIGHT);
  }, [viewportDimensions.height, canvasHeight, isMobile]);

  const {
    preloadFrameCount = 5,
    geometrySize = [16, 9],
    cameraHeight = 9,
    startAngle = 180,
    mobileViewMode = ViewModeEnum.FIXED,
  } = (presentationInitResponse?.canvasConfig as CanvasConfig) || {
    preloadFrameCount: 5,
    geometrySize: [16, 9],
    cameraHeight: 9,
    startAngle: 180,
    mobileViewMode: ViewModeEnum.FIXED,
  };

  const MobileCanvasWidth = useMemo(() => {
    if (!isMobile) return ViewportWidth;

    const targetHeight =
      canvasHeight !== undefined
        ? Math.max(canvasHeight, MIN_CANVAS_HEIGHT)
        : MIN_CANVAS_HEIGHT;

    const optimalWidth = (targetHeight * 16) / 9;

    if (mobileViewMode === ViewModeEnum.FIXED) {
      return viewportDimensions.width;
    }

    return Math.max(optimalWidth, viewportDimensions.width);
  }, [
    isMobile,
    viewportDimensions.width,
    ViewportWidth,
    canvasHeight,
    mobileViewMode,
  ]);

  const MobileCanvasHeight = useMemo(() => {
    if (isMobile && canvasHeight !== undefined) {
      return Math.max(canvasHeight, MIN_CANVAS_HEIGHT);
    }
    return isMobile ? MIN_CANVAS_HEIGHT : ViewportHeight;
  }, [isMobile, canvasHeight, ViewportHeight]);

  const mainFrameAnchors = useMemo(() => {
    return (
      workspaceItems
        ?.map((item: any, index: number) => (item?.mainFrame ? index : -1))
        .filter((i: number) => i >= 0) || [0]
    );
  }, [workspaceItems]);

  const [angleDeg, setAngleDeg] = useState(startAngle);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const prevThemeRef = useRef(theme);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [currentDisplayFrame, setCurrentDisplayFrame] = useState(
    initialFrameFromUrl ?? mainFrameAnchors?.[0] ?? 0,
  );

  const currentFramePolygons =
    workspaceItems?.[currentDisplayFrame]?.polygons || [];

  const needsRenderRef = useRef(true);

  const triggerRender = useCallback(() => {
    needsRenderRef.current = true;
  }, []);

  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      prevThemeRef.current = theme;
      setThemeTransitioning(true);

      needsRenderRef.current = true;

      const timer = setTimeout(() => {
        needsRenderRef.current = true;
        setThemeTransitioning(false);
      }, 500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [theme]);

  useEffect(() => {
    const currentFrame = currentFrameRef.current ?? 0;
    const isCurrentFrameMainFrame = mainFrameAnchors.includes(currentFrame);

    let targetFrame: number;

    if (isCurrentFrameMainFrame) {
      targetFrame = currentFrame;
    } else {
      const sortedAnchors = [...mainFrameAnchors].sort((a, b) => a - b);

      let closestAnchor = sortedAnchors[0];
      let minDistance = Math.abs(currentFrame - closestAnchor);

      for (const anchor of sortedAnchors) {
        const distance = Math.abs(currentFrame - anchor);
        if (distance < minDistance) {
          minDistance = distance;
          closestAnchor = anchor;
        }
      }

      targetFrame = closestAnchor;
    }

    setCurrentDisplayFrame(targetFrame);
    if (currentFrameRef.current !== undefined) {
      currentFrameRef.current = targetFrame;
      targetFrameRef.current = targetFrame;
      currentFrameFloatRef.current = targetFrame;

      const newAngle = safeMod(
        startAngle - (targetFrame / totalFrames) * 360,
        360,
      );
      setAngleDeg(newAngle);
    }
  }, [mainFrameAnchors, totalFrames, startAngle]);

  useEffect(() => {
    if (textureCacheRef.current && workspaceItems) {
      textureCacheRef.current.forEach((texture) => {
        texture.dispose();
      });
      textureCacheRef.current.clear();

      setFirstImageLoaded(false);
      needsRenderRef.current = true;
    }
  }, [workspaceItems, currentPresentationType]);

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const textureLoader = useRef(new THREE.TextureLoader()).current;
  const textureCacheRef = useRef<Map<number, THREE.Texture>>(new Map());
  const meshRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const currentFrameRef = useRef(initialFrameFromUrl ?? mainFrameAnchors?.[0]);
  const targetFrameRef = useRef(initialFrameFromUrl ?? mainFrameAnchors?.[0]);
  const currentFrameFloatRef = useRef(initialFrameFromUrl ?? mainFrameAnchors?.[0]);
  const lastDragDeltaRef = useRef(0);
  const navigationDirectionRef = useRef<number>(1);

  const getImageUrl = useCallback(
    (idx: number): string => {
      const originalUrl = resolveTagImageUrl(
        workspaceItems?.[idx],
        currentPresentationType,
      );
      return resolveCdnImageUrl(originalUrl, { preferMobile: isMobile });
    },
    [workspaceItems, isMobile, currentPresentationType],
  );

  const preloadNearbyFrames = useCallback(
    (centerIndex: number, radius: number = 2) => {
      const preloadSet = new Set<number>();
      for (let i = -radius; i <= radius; i++) {
        preloadSet.add(safeMod(centerIndex + i, totalFrames));
      }
      for (const anchor of mainFrameAnchors) preloadSet.add(anchor);

      for (const idx of preloadSet) {
        const url = getImageUrl(idx);
        if (!textureCacheRef.current.has(idx) && url) {
          const texture = textureLoader.load(url, (loadedTexture) => {
            const imageUrl = url.toLowerCase();
            const isSVG =
              imageUrl.includes(".svg") || imageUrl.includes("image/svg");

            if (
              !isSVG &&
              loadedTexture.image.width &&
              loadedTexture.image.height
            ) {
              const textureAspect =
                loadedTexture.image.width / loadedTexture.image.height;
              const targetAspect = 16 / 9;

              loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
              loadedTexture.wrapT = THREE.ClampToEdgeWrapping;

              if (textureAspect > targetAspect) {
                const scale = targetAspect / textureAspect;
                loadedTexture.repeat.set(scale, 1);
                loadedTexture.offset.set((1 - scale) / 2, 0);
              } else {
                const scale = textureAspect / targetAspect;
                loadedTexture.repeat.set(1, scale);
                loadedTexture.offset.set(0, (1 - scale) / 2);
              }
            }
          });
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          textureCacheRef.current.set(idx, texture);
        }
      }
    },
    [totalFrames, mainFrameAnchors, textureLoader, getImageUrl],
  );

  const findNextAnchorStepByDirection = useCallback(
    (current: number, direction: number): number => {
      const normalized = safeMod(current, totalFrames || 1);
      const sortedAnchors = [...(mainFrameAnchors || [])].sort((a, b) => a - b);
      if (direction > 0) {
        for (const anchor of sortedAnchors)
          if (anchor > normalized) return anchor;
        return sortedAnchors[0];
      } else {
        for (let i = sortedAnchors.length - 1; i >= 0; i--)
          if (sortedAnchors[i] < normalized) return sortedAnchors[i];
        return sortedAnchors[sortedAnchors.length - 1];
      }
    },
    [totalFrames, mainFrameAnchors],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    if (totalFrames > 0 && mainFrameAnchors.length > 0) {
      const urlFrame = initialFrameFromUrl;
      const initialFrame =
        urlFrame !== null && urlFrame >= 0 && urlFrame < totalFrames
          ? urlFrame
          : mainFrameAnchors[0];
      currentFrameRef.current = initialFrame;
      targetFrameRef.current = initialFrame;
      currentFrameFloatRef.current = initialFrame;

      const initialAngle = safeMod(
        startAngle - (initialFrame / totalFrames) * 360,
        360,
      );
      setAngleDeg(initialAngle);
      setCurrentDisplayFrame(initialFrame);
    }

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const initWidth = isMobile ? MobileCanvasWidth : ContainerWidth;
    const initHeight = isMobile ? MobileCanvasHeight : ContainerHeight;

    const aspect = initWidth / initHeight;
    const height = cameraHeight;
    const width = height * aspect;
    const textureCache = textureCacheRef.current;

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      100,
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      stencil: false,
      depth: false,
      failIfMajorPerformanceCaveat: false,
      precision: "mediump",
      logarithmicDepthBuffer: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0.0);

    renderer.info.autoReset = false;
    renderer.shadowMap.enabled = false;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const w = initWidth;
    const h = initHeight;
    renderer.setSize(w, h, true);

    const preloadInitialFrames = () => {
      const urlFrame = initialFrameFromUrl;
      const mainFrameIndex =
        urlFrame !== null && urlFrame >= 0 && urlFrame < totalFrames
          ? urlFrame
          : mainFrameAnchors?.[0] || 0;
      const mainFrameUrl = getImageUrl(mainFrameIndex);

      if (mainFrameUrl) {
        const [planeW, planeH] = [16, 9];
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
        });
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        needsRenderRef.current = true;

        const mainFrameTexture = textureLoader.load(mainFrameUrl, (texture) => {
          const imageUrl = mainFrameUrl.toLowerCase();
          const isSVG =
            imageUrl.includes(".svg") || imageUrl.includes("image/svg");

          if (!isSVG && texture.image.width && texture.image.height) {
            const textureAspect = texture.image.width / texture.image.height;
            const targetAspect = 16 / 9;

            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;

            if (textureAspect > targetAspect) {
              const scale = targetAspect / textureAspect;
              texture.repeat.set(scale, 1);
              texture.offset.set((1 - scale) / 2, 0);
            } else {
              const scale = textureAspect / targetAspect;
              texture.repeat.set(1, scale);
              texture.offset.set(0, (1 - scale) / 2);
            }
          }

          if (meshRef.current) {
            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.map = texture;
            mat.color.setHex(0xffffff);
            mat.opacity = 1;
            mat.needsUpdate = true;
          }
          setFirstImageLoaded(true);
          needsRenderRef.current = true;

          setTimeout(() => {
            const preloadIndices = new Set<number>([
              ...mainFrameAnchors,
              ...Array.from({ length: preloadFrameCount }, (_, i) => i),
            ]);

            preloadIndices.delete(mainFrameIndex);

            preloadIndices.forEach((idx) => {
              if (!textureCacheRef.current.has(idx) && getImageUrl(idx)) {
                const texture = textureLoader.load(
                  getImageUrl(idx),
                  (loadedTexture) => {
                    const imageUrl = (getImageUrl(idx) || "").toLowerCase();
                    const isSVG =
                      imageUrl.includes(".svg") ||
                      imageUrl.includes("image/svg");

                    if (
                      !isSVG &&
                      loadedTexture.image.width &&
                      loadedTexture.image.height
                    ) {
                      const loadedTextureAspect =
                        loadedTexture.image.width / loadedTexture.image.height;
                      const targetAspect = 16 / 9;

                      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;

                      if (loadedTextureAspect > targetAspect) {
                        const scale = targetAspect / loadedTextureAspect;
                        loadedTexture.repeat.set(scale, 1);
                        loadedTexture.offset.set((1 - scale) / 2, 0);
                      } else {
                        const scale = loadedTextureAspect / targetAspect;
                        loadedTexture.repeat.set(1, scale);
                        loadedTexture.offset.set(0, (1 - scale) / 2);
                      }
                    }
                  },
                );
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                textureCacheRef.current.set(idx, texture);
              }
            });
          }, 100);
        });

        mainFrameTexture.colorSpace = THREE.SRGBColorSpace;
        mainFrameTexture.minFilter = THREE.LinearFilter;
        mainFrameTexture.magFilter = THREE.LinearFilter;
        mainFrameTexture.generateMipmaps = false;
        textureCacheRef.current.set(mainFrameIndex, mainFrameTexture);
      }
    };

    preloadInitialFrames();

    const clock = new THREE.Clock();

    const ANIMATION_SPEED = 25.0;

    let animationId: number;
    let needsRender = true;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();

      if (needsRenderRef.current) {
        needsRender = true;
        needsRenderRef.current = false;
      }

      let diff = targetFrameRef.current - currentFrameFloatRef.current;

      if (Math.abs(diff) > 0.01) {
        const moveAmount = ANIMATION_SPEED * deltaTime * Math.sign(diff);

        if (Math.abs(diff) <= Math.abs(moveAmount)) {
          currentFrameFloatRef.current = targetFrameRef.current;
          navigationDirectionRef.current = 1;

          currentFrameFloatRef.current = safeMod(
            currentFrameFloatRef.current,
            totalFrames,
          );
          targetFrameRef.current = currentFrameFloatRef.current;
        } else {
          currentFrameFloatRef.current += moveAmount;
        }

        needsRender = true;
      }

      if (needsRender) {
        const displayFrame = safeMod(
          Math.round(currentFrameFloatRef.current),
          totalFrames,
        );

        const currentTexture = textureCacheRef.current.get(displayFrame);
        if (currentTexture?.image && meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshBasicMaterial;
          if (mat.map !== currentTexture) {
            mat.map = currentTexture;
            mat.needsUpdate = true;
            needsRender = true;
          }
          currentFrameRef.current = displayFrame;
          setCurrentDisplayFrame(displayFrame);
        }

        const angle = safeMod(
          startAngle - (currentFrameFloatRef.current / totalFrames) * 360,
          360,
        );
        setAngleDeg(angle);

        try {
          if (renderer && camera && meshRef.current && scene) {
            renderer.render(scene, camera);
          }
        } catch (error) {
          console.warn("Render error:", error);
        }

        if (Math.abs(diff) <= 0.01) {
          needsRender = false;
        }
      }
    };

    animate();

    // Bütün kareler arka planda, sınırlı eşzamanlılıkla ve yakından uzağa (bkz. backgroundFramePreload).
    const backgroundStartFrame =
      initialFrameFromUrl !== null && initialFrameFromUrl >= 0 && initialFrameFromUrl < totalFrames
        ? initialFrameFromUrl
        : mainFrameAnchors?.[0] || 0;
    const cancelBackgroundPreload = preloadFramesInBackground({
      total: totalFrames,
      startIndex: backgroundStartFrame,
      shouldSkip: (i) => textureCacheRef.current.has(i) || !getImageUrl(i),
      load: (i) =>
        new Promise<void>((resolve) => {
          const url = getImageUrl(i);
          if (!url) return resolve();
          textureLoader.load(
            url,
            (loadedTexture) => {
              const imageUrl = (url || "").toLowerCase();
              const isSVG =
                imageUrl.includes(".svg") || imageUrl.includes("image/svg");

              if (
                !isSVG &&
                loadedTexture.image.width &&
                loadedTexture.image.height
              ) {
                const textureAspect =
                  loadedTexture.image.width / loadedTexture.image.height;
                const targetAspect = 16 / 9;

                loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                loadedTexture.wrapT = THREE.ClampToEdgeWrapping;

                if (textureAspect > targetAspect) {
                  const scale = targetAspect / textureAspect;
                  loadedTexture.repeat.set(scale, 1);
                  loadedTexture.offset.set((1 - scale) / 2, 0);
                } else {
                  const scale = textureAspect / targetAspect;
                  loadedTexture.repeat.set(1, scale);
                  loadedTexture.offset.set(0, (1 - scale) / 2);
                }
              }

              loadedTexture.colorSpace = THREE.SRGBColorSpace;
              loadedTexture.minFilter = THREE.LinearFilter;
              loadedTexture.magFilter = THREE.LinearFilter;
              loadedTexture.generateMipmaps = false;
              textureCacheRef.current.set(i, loadedTexture);
              resolve();
            },
            undefined,
            () => resolve(),
          );
        }),
    });

    let isDragging = false;
    let dragStarted = false;
    let lastX = 0;
    const dragThreshold = 20;

    const updateFrameFromDelta = (delta: number) => {
      if (totalFrames === 0) return;

      const baseDragSensitivity = isMobile ? 12 : 15;
      const frameChange = delta / baseDragSensitivity;

      targetFrameRef.current += frameChange;
      lastDragDeltaRef.current = frameChange;
      needsRenderRef.current = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStarted = false;
      lastX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = e.clientX - lastX;

      if (!dragStarted && Math.abs(delta) >= dragThreshold) {
        dragStarted = true;
      }

      if (dragStarted) {
        lastX = e.clientX;
        updateFrameFromDelta(delta);
      }
    };

    const handleMouseUp = () => {
      if (isDragging && dragStarted && totalFrames > 0) {
        const snap = findNextAnchorStepByDirection(
          currentFrameFloatRef.current,
          lastDragDeltaRef.current,
        );
        const currentNormalized = safeMod(
          currentFrameFloatRef.current,
          totalFrames,
        );
        if (lastDragDeltaRef.current > 0 && snap < currentNormalized) {
          targetFrameRef.current = snap + totalFrames;
        } else if (lastDragDeltaRef.current < 0 && snap > currentNormalized) {
          targetFrameRef.current = snap - totalFrames;
        } else {
          targetFrameRef.current = snap;
        }

        preloadNearbyFrames(snap, 5);
      }

      isDragging = false;
      dragStarted = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      dragStarted = false;
      lastX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const delta = e.touches[0].clientX - lastX;

      if (!dragStarted && Math.abs(delta) >= dragThreshold) {
        dragStarted = true;
      }

      if (dragStarted) {
        lastX = e.touches[0].clientX;
        updateFrameFromDelta(delta);
      }
    };
    const handleTouchEnd = () => handleMouseUp();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;

      if (!isMobile) {
        const w = ContainerWidth;
        const h = ContainerHeight;
        const aspect = w / h;
        const width = cameraHeight * aspect;

        cameraRef.current.left = -width / 2;
        cameraRef.current.right = width / 2;
        cameraRef.current.top = cameraHeight / 2;
        cameraRef.current.bottom = -cameraHeight / 2;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(w, h, true);

        const canvas = rendererRef.current.domElement;
        canvas.style.width = `${ViewportWidth}px`;
        canvas.style.height = `${ViewportHeight}px`;
        canvas.style.objectPosition = "center";
        canvas.style.transition =
          "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)";

        needsRenderRef.current = true;
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    canvas.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      cancelBackgroundPreload();
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);

      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      textureCache.forEach((texture) => {
        texture.dispose();
      });
      textureCache.clear();

      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (meshRef.current.material instanceof THREE.Material) {
          meshRef.current.material.dispose();
        }
      }

      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [workspaceItems]);

  const goToNextAnchor = useCallback(() => {
    if (!totalFrames || !workspaceItems?.length) return;

    const currentFrame = safeMod(currentFrameRef.current ?? 0, totalFrames);
    const anchors = [...mainFrameAnchors];

    if (anchors.length === 0) return;

    const sortedAnchors = [...anchors].sort((a, b) => a - b);
    const foundedIndex = sortedAnchors.indexOf(currentFrame);

    let nextAnchor;
    if (foundedIndex !== -1 && foundedIndex === sortedAnchors.length - 1) {
      nextAnchor = sortedAnchors[0];
      targetFrameRef.current = nextAnchor + totalFrames;
    } else {
      nextAnchor = sortedAnchors[foundedIndex + 1];
      if (nextAnchor < currentFrameRef.current) {
        targetFrameRef.current = nextAnchor + totalFrames;
      } else {
        targetFrameRef.current = nextAnchor;
      }
    }

    preloadNearbyFrames(nextAnchor, 5);
    triggerRender();
  }, [
    totalFrames,
    workspaceItems,
    presentationResponse,
    preloadNearbyFrames,
    triggerRender,
  ]);

  const goToPreviousAnchor = useCallback(() => {
    if (!totalFrames || !workspaceItems?.length) return;

    const currentFrame = safeMod(currentFrameRef.current ?? 0, totalFrames);
    const anchors = [...mainFrameAnchors];

    if (anchors.length === 0) return;

    const sortedAnchors = [...anchors].sort((a, b) => a - b);
    const foundedIndex = sortedAnchors.indexOf(currentFrame);

    let prevAnchor;
    if (foundedIndex !== -1 && foundedIndex === 0) {
      prevAnchor = sortedAnchors[sortedAnchors.length - 1];
      targetFrameRef.current = prevAnchor - totalFrames;
    } else {
      prevAnchor = sortedAnchors[foundedIndex - 1];
      if (prevAnchor > currentFrameRef.current) {
        targetFrameRef.current = prevAnchor - totalFrames;
      } else {
        targetFrameRef.current = prevAnchor;
      }
    }
    preloadNearbyFrames(prevAnchor, 5);
    triggerRender();
  }, [
    totalFrames,
    workspaceItems,
    presentationResponse,
    preloadNearbyFrames,
    triggerRender,
  ]);

  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange(goToNextAnchor, goToPreviousAnchor);
    }
  }, [onNavigationChange, goToNextAnchor, goToPreviousAnchor]);

  // Debounced effect: write currentDisplayFrame to URL & Redux when it settles
  useEffect(() => {
    if (totalFrames <= 0) return;

    const timeout = setTimeout(() => {
      dispatch(setCurrentFrameIndex(currentDisplayFrame));
      navService.updateQueryParams({
        frameIndex: currentDisplayFrame.toString(),
      });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDisplayFrame, totalFrames]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && rendererRef.current) {
        const canvas = rendererRef.current.domElement;
        setContainerDimensions({
          width: canvas.width / rendererRef.current.getPixelRatio(),
          height: canvas.height / rendererRef.current.getPixelRatio(),
        });
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    if (!isMobile) {
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, [ViewportWidth, ViewportHeight]);

  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    if (!isMobile) {
      const w = ContainerWidth;
      const h = ContainerHeight;
      const aspect = w / h;
      const width = cameraHeight * aspect;

      cameraRef.current.left = -width / 2;
      cameraRef.current.right = width / 2;
      cameraRef.current.top = cameraHeight / 2;
      cameraRef.current.bottom = -cameraHeight / 2;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h, true);

      const canvas = rendererRef.current.domElement;
      if (canvas) {
        canvas.style.width = `${ViewportWidth}px`;
        canvas.style.height = `${ViewportHeight}px`;
        canvas.style.objectFit = "cover";
        canvas.style.objectPosition = "center";
        canvas.style.transition =
          "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)";
      }

      if (meshRef.current) {
        const baseHeight = 9;
        const baseWidth = 16;
        meshRef.current.geometry.dispose();

        const newGeometry = new THREE.PlaneGeometry(baseWidth, baseHeight);
        meshRef.current.geometry = newGeometry;
      }

      needsRenderRef.current = true;
    } else {
      const canvas = rendererRef.current.domElement;
      if (canvas) {
        const finalHeight = Math.max(MobileCanvasHeight, MIN_CANVAS_HEIGHT);

        if (mobileViewMode === ViewModeEnum.FIXED) {
          canvas.style.height = `${finalHeight}px`;
          canvas.style.width = `${MobileCanvasWidth}px`;
          canvas.style.objectFit = "cover";
          canvas.style.objectPosition = "center";
          canvas.style.transition =
            "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)";
        } else {
          canvas.style.height = `${finalHeight}px`;
          canvas.style.width = `${MobileCanvasWidth}px`;
          canvas.style.objectFit = "cover";
          canvas.style.objectPosition = "center";
          canvas.style.transition =
            "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)";
        }

        rendererRef.current.setSize(MobileCanvasWidth, finalHeight, true);

        const aspect = MobileCanvasWidth / finalHeight;
        const width = cameraHeight * aspect;

        cameraRef.current.left = -width / 2;
        cameraRef.current.right = width / 2;
        cameraRef.current.top = cameraHeight / 2;
        cameraRef.current.bottom = -cameraHeight / 2;
        cameraRef.current.updateProjectionMatrix();

        needsRenderRef.current = true;
      }
    }
  }, [
    ViewportWidth,
    ViewportHeight,
    MobileCanvasWidth,
    MobileCanvasHeight,
    cameraHeight,
    geometrySize,
    isMobile,
    mobileViewMode,
  ]);

  return (
    <div
      ref={containerRef}
      className="scene3d-container"
      data-tour="scene3d-container"
      style={{
        width: isMobile ? `${MobileCanvasWidth}px` : `${ViewportWidth}px`,
        height: isMobile ? `${MobileCanvasHeight}px` : `${ViewportHeight}px`,
        background: "transparent",
        cursor: "grab",
        position: "relative" as const,
        top: "auto",
        left: "auto",
        zIndex: "auto",
        overflow: "hidden",
        minHeight: isMobile ? `${MIN_CANVAS_HEIGHT}px` : "auto",
        minWidth: isMobile ? `${MobileCanvasWidth}px` : "auto",
        flexShrink: 0,
        transition:
          "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          transition: "opacity 0.35s ease",
          opacity: !firstImageLoaded || themeTransitioning ? 1 : 0,
          pointerEvents: !firstImageLoaded || themeTransitioning ? "auto" : "none",
        }}
      >
        <LoadingComponent open={!firstImageLoaded || themeTransitioning} />
      </div>

      {containerDimensions.width > 0 && containerDimensions.height > 0 && (
        <InteractivePolygons
          polygons={currentFramePolygons}
          containerWidth={isMobile ? MobileCanvasWidth : ViewportWidth}
          containerHeight={isMobile ? MobileCanvasHeight : ViewportHeight}
        />
      )}

      {!isMobile && (
        <NavigationControls
          onLeftClick={goToPreviousAnchor}
          onRightClick={goToNextAnchor}
        />
      )}

      {!isMobile && (
        <BlockPositionImage
          containerWidth={isMobile ? MobileCanvasWidth : ViewportWidth}
          containerHeight={isMobile ? MobileCanvasHeight : ViewportHeight}
        />
      )}

      <ViewerToolbar angleDeg={angleDeg} />
    </div>
  );
}
