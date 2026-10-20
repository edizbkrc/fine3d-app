"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import { useMediaQuery, Box, Typography, Fade, Card } from "@mui/material";
import * as THREE from "three";
import { ITagItem } from "@/types/ITagItem";
import { IPolygonModel } from "@/types/IPolygonModel";
import { ShapeTypeEnum } from "@/enums/ShapeTypeEnum";
import NavigationControls from "../layout/NavigationControls";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";

interface DollhouseScene3DProps {
  dollhouseData: ITagItem[];
  containerWidth: number;
  containerHeight: number;
  canvasHeight?: number;
}

interface PolygonCardProps {
  polygon: IPolygonModel;
  mousePosition: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  sceneType: "dollhouse";
}

const PolygonCard: React.FC<PolygonCardProps> = ({
  polygon,
  mousePosition,
  containerWidth,
  containerHeight,
}) => {
  const t = useTranslations("Common");
  const cardWidth = 250;
  const cardHeight = 140;

  const adjustedX = Math.min(
    Math.max(mousePosition.x + 15, 10),
    containerWidth - cardWidth - 10
  );

  const adjustedY = Math.min(
    Math.max(mousePosition.y - 60, 10),
    containerHeight - cardHeight - 10
  );

  const getRoomName = (polygon: IPolygonModel) => {
    const roomNames = [
      "Salon",
      "Yatak Odası",
      "Mutfak",
      "Banyo",
      "Balkon",
      "Çalışma Odası",
      "Giyinme Odası",
      "Misafir Odası",
      "Koridor",
      "Antre",
    ];
    const roomIndex = (polygon.relatedEntityId || 0) % roomNames.length;
    return roomNames[roomIndex];
  };

  return (
    <Card
      sx={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        backgroundColor: "rgba(122, 144, 73, 0.95)",
        color: "white",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        pointerEvents: "none",
        transform: "translateZ(0)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{ fontSize: "16px", fontWeight: 700, mb: 1.5, color: "#fff" }}
        >
          {getRoomName(polygon)}
        </Typography>

        {polygon.entityTypeDescription && (
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", mb: 0.5, opacity: 0.8 }}
          >
            {t("Type")}: {polygon.entityTypeDescription}
          </Typography>
        )}

        {polygon.navigationTypeDescription && (
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", mb: 0.5, opacity: 0.8 }}
          >
            {t("Navigation")}: {polygon.navigationTypeDescription}
          </Typography>
        )}

        {polygon.navigationValue && (
          <Typography variant="body2" sx={{ fontSize: "12px", opacity: 0.7 }}>
            {t("Value")}: {polygon.navigationValue}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const MIN_CANVAS_HEIGHT = 250;

export default function DollhouseScene3D({
  dollhouseData,
  containerWidth,
  containerHeight,
  canvasHeight,
}: DollhouseScene3DProps) {
  const t = useTranslations("Common");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [isLoading, setIsLoading] = useState(true);
  const [currentDisplayFrame, setCurrentDisplayFrame] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [hoveredPolygon, setHoveredPolygon] = useState<IPolygonModel | null>(
    null
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const geometrySize: [number, number] = [16, 9];
  const cameraHeight = 9;
  const totalFrames = dollhouseData?.length || 0;
  const preloadFrameCount = 5;

  const mainFrameAnchors = useMemo(() => {
    return dollhouseData?.map((_, index) => index) || [0];
  }, [dollhouseData]);

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const textureLoader = useRef(new THREE.TextureLoader()).current;
  const textureCacheRef = useRef<Map<number, THREE.Texture>>(new Map());
  const meshRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const currentFrameFloatRef = useRef(0);
  const lastDragDeltaRef = useRef(0);
  const needsRenderRef = useRef(true);

  const getImageUrl = useCallback(
    (idx: number): string => {
      const originalUrl = dollhouseData?.[idx]?.image?.url ?? "";
      return resolveCdnImageUrl(originalUrl, { preferMobile: isMobile });
    },
    [dollhouseData, isMobile]
  );

  const preloadNearbyFrames = useCallback(
    (centerIndex: number, radius: number = 2) => {
      const preloadSet = new Set<number>();
      for (let i = -radius; i <= radius; i++) {
        preloadSet.add(safeMod(centerIndex + i, totalFrames));
      }
      for (const anchor of mainFrameAnchors) preloadSet.add(anchor);

      for (const idx of preloadSet) {
        if (!textureCacheRef.current.has(idx) && getImageUrl(idx)) {
          const tex = textureLoader.load(getImageUrl(idx));
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          textureCacheRef.current.set(idx, tex);
        }
      }
    },
    [totalFrames, mainFrameAnchors, getImageUrl, textureLoader]
  );

  const findNextAnchorStepByDirection = useCallback(
    (current: number, direction: number): number => {
      const normalized = safeMod(current, totalFrames || 1);
      const sortedAnchors = [...mainFrameAnchors].sort((a, b) => a - b);
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
    [totalFrames, mainFrameAnchors]
  );

  const goToNextAnchor = () => {
    const next = findNextAnchorStepByDirection(currentFrameRef.current, 1);
    targetFrameRef.current = next;
    preloadNearbyFrames(next, 5);
    needsRenderRef.current = true;
  };

  const goToPreviousAnchor = () => {
    const prev = findNextAnchorStepByDirection(currentFrameRef.current, -1);
    targetFrameRef.current = prev;
    preloadNearbyFrames(prev, 5);
    needsRenderRef.current = true;
  };

  const createPolygonPath = (points: { x: number; y: number }[]) => {
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    const scaledImageWidth = 1920 * scale;
    const scaledImageHeight = 1080 * scale;
    const offsetX = (containerWidth - scaledImageWidth) / 2;
    const offsetY = (containerHeight - scaledImageHeight) / 2;

    const pathString =
      points
        .map((point, index) => {
          const scaledX = point.x * scale + offsetX;
          const scaledY = point.y * scale + offsetY;
          return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
        })
        .join(" ") + " Z";

    return pathString;
  };

  const getPolygonCenterPoint = (points: { x: number; y: number }[]) => {
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    const scaledImageWidth = 1920 * scale;
    const scaledImageHeight = 1080 * scale;
    const offsetX = (containerWidth - scaledImageWidth) / 2;
    const offsetY = (containerHeight - scaledImageHeight) / 2;

    const centerX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const centerY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;

    return {
      x: centerX * scale + offsetX,
      y: centerY * scale + offsetY,
    };
  };

  const getRoomName = (polygon: IPolygonModel) => {
    const roomNames = [
      "Salon",
      "Yatak Odası",
      "Mutfak",
      "Banyo",
      "Balkon",
      "Çalışma Odası",
      "Giyinme Odası",
      "Misafir Odası",
      "Koridor",
      "Antre",
    ];
    const roomIndex = (polygon.relatedEntityId || 0) % roomNames.length;
    return roomNames[roomIndex];
  };

  const handlePolygonHover = (
    polygon: IPolygonModel,
    event: React.MouseEvent
  ) => {
    setHoveredPolygon(polygon);
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handlePolygonLeave = () => {
    setHoveredPolygon(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredPolygon) {
      const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handlePolygonClick = (polygon: IPolygonModel) => {};

  useEffect(() => {
    if (!containerRef.current || !dollhouseData || dollhouseData.length === 0)
      return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = null;
    const aspect = containerWidth / containerHeight;
    const height = cameraHeight;
    const width = height * aspect;
    const textureCache = textureCacheRef.current;

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      100
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

    const w = containerWidth;
    const h = containerHeight;
    renderer.setSize(w, h, true);

    const preloadInitialFrames = () => {
      const mainFrameIndex = 0;
      const mainFrameUrl = getImageUrl(mainFrameIndex);

      if (mainFrameUrl) {
        const mainFrameTexture = textureLoader.load(mainFrameUrl, () => {
          setIsLoading(false);
          needsRenderRef.current = true;

          setTimeout(() => {
            const preloadIndices = new Set<number>([
              ...Array.from(
                { length: Math.min(preloadFrameCount, totalFrames) },
                (_, i) => i
              ),
            ]);

            preloadIndices.delete(mainFrameIndex);

            preloadIndices.forEach((idx) => {
              if (!textureCacheRef.current.has(idx) && getImageUrl(idx)) {
                const tex = textureLoader.load(getImageUrl(idx));
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipmaps = false;
                textureCacheRef.current.set(idx, tex);
              }
            });
          }, 100);
        });

        mainFrameTexture.colorSpace = THREE.SRGBColorSpace;
        mainFrameTexture.minFilter = THREE.LinearFilter;
        mainFrameTexture.magFilter = THREE.LinearFilter;
        mainFrameTexture.generateMipmaps = false;
        textureCacheRef.current.set(mainFrameIndex, mainFrameTexture);

        const [planeW, planeH] = geometrySize;
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        const material = new THREE.MeshBasicMaterial({
          map: mainFrameTexture,
          transparent: true,
          alphaTest: 0.1,
          color: 0xffffff,
        });
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);
        needsRenderRef.current = true;
      } else {
        setIsLoading(false);
      }
    };

    preloadInitialFrames();

    const clock = new THREE.Clock();
    const ANIMATION_SPEED = 30.0;
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

      if (Math.abs(diff) > totalFrames / 2) {
        diff = diff > 0 ? diff - totalFrames : diff + totalFrames;
      }

      if (Math.abs(diff) > 0.01) {
        const moveAmount = ANIMATION_SPEED * deltaTime * Math.sign(diff);

        if (Math.abs(diff) <= Math.abs(moveAmount)) {
          currentFrameFloatRef.current = targetFrameRef.current;
        } else {
          currentFrameFloatRef.current += moveAmount;
        }

        needsRender = true;
      }

      if (needsRender) {
        const displayFrame = safeMod(
          Math.round(currentFrameFloatRef.current),
          totalFrames
        );

        const currentTexture = textureCacheRef.current.get(displayFrame);
        if (currentTexture?.image && meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshBasicMaterial;
          if (mat.map !== currentTexture) {
            mat.map = currentTexture;
            mat.needsUpdate = true;
          }
          currentFrameRef.current = displayFrame;
          setCurrentDisplayFrame(displayFrame);
        }

        try {
          if (renderer && camera && meshRef.current) {
            renderer.render(scene, camera);
          }
        } catch (error) {
          console.error("Render error:", error);
        }

        if (Math.abs(diff) <= 0.01) {
          needsRender = false;
        }
      }
    };

    animate();

    const preloadAllFrames = async () => {
      const promises: Promise<void>[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const url = getImageUrl(i);
        if (!textureCacheRef.current.has(i) && url) {
          const p = new Promise<void>((resolve) => {
            const tex = textureLoader.load(url, () => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.generateMipmaps = false;
              tex.wrapS = THREE.ClampToEdgeWrapping;
              tex.wrapT = THREE.ClampToEdgeWrapping;
              textureCacheRef.current.set(i, tex);
              resolve();
            });
          });
          promises.push(p);
        }
      }

      await Promise.all(promises);
    };

    preloadAllFrames();

    let isDragging = false;
    let dragStarted = false;
    let lastX = 0;
    const dragThreshold = 20;

    const updateFrameFromDelta = (delta: number) => {
      const baseDragSensitivity = isMobile ? 12 : 15;
      // Dollhouse render dizisi bina dizisinin ters yönünde çekilmiş: Scene3D'deki gibi +delta
      // verince sağa sürüklenen modelin ön yüzü sola kayıyordu ("ters kayıyor" şikâyeti).
      // İşaret burada çevriliyor; anchor'a yapışma lastDragDeltaRef'in işaretini kullandığı için
      // o da kendiliğinden doğru yöne gider.
      const frameChange = -delta / baseDragSensitivity;

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
      if (isDragging && dragStarted) {
        const snap = findNextAnchorStepByDirection(
          currentFrameFloatRef.current,
          lastDragDeltaRef.current
        );
        targetFrameRef.current = snap;
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
        e.preventDefault();
        lastX = e.touches[0].clientX;
        updateFrameFromDelta(delta);
      }
    };

    const handleTouchEnd = () => handleMouseUp();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;

      const w = containerWidth;
      const h = containerHeight;
      const aspect = w / h;
      const width = cameraHeight * aspect;

      cameraRef.current.left = -width / 2;
      cameraRef.current.right = width / 2;
      cameraRef.current.top = cameraHeight / 2;
      cameraRef.current.bottom = -cameraHeight / 2;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h, true);
      needsRenderRef.current = true;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
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
  }, [dollhouseData, containerWidth, containerHeight]);

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
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [canvasHeight]);

  const currentFramePolygons =
    dollhouseData?.[currentDisplayFrame]?.polygons || [];

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height:
          isMobile && canvasHeight !== undefined ? `${canvasHeight}px` : "100%",
        background: "transparent",
        backgroundColor: "transparent",
        cursor: "grab",
        position: "relative",
        overflow: "hidden",
        minHeight: isMobile ? `${MIN_CANVAS_HEIGHT}px` : "auto",
        touchAction: "pan-y",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            color: "white",
            fontSize: "1.2rem",
            fontWeight: 500,
          }}
        >
          {t("Loading")}...
        </div>
      )}

      {containerDimensions.width > 0 &&
        containerDimensions.height > 0 &&
        currentFramePolygons.length > 0 && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: containerWidth,
              height: containerHeight,
              pointerEvents: "none",
              zIndex: 999,
            }}
            viewBox={`0 0 ${containerWidth} ${containerHeight}`}
            onMouseMove={handleMouseMove}
          >
            {currentFramePolygons.map((polygon, index) => {
              const shapeType = polygon.shapeType ?? ShapeTypeEnum.Outline;
              const isHovered = hoveredPolygon?.id === polygon.id;

              if (
                shapeType === ShapeTypeEnum.Dot &&
                polygon.points.length > 0
              ) {
                const centerPoint = getPolygonCenterPoint(polygon.points);
                const dotRadius = isHovered ? 12 : 8;
                const dotColor = "rgba(122, 144, 73, 0.8)";

                return (
                  <g key={`dollhouse-dot-${polygon.id}-${index}`}>
                    <circle
                      cx={centerPoint.x}
                      cy={centerPoint.y}
                      r={dotRadius}
                      fill={dotColor}
                      stroke={dotColor}
                      strokeWidth="2"
                      style={{
                        pointerEvents: "auto",
                        cursor: "pointer",
                        transition: "all 0.3s ease-in-out",
                        filter: isHovered
                          ? "drop-shadow(0 0 12px rgba(122, 144, 73, 0.6))"
                          : "none",
                      }}
                      onMouseEnter={(e) => handlePolygonHover(polygon, e)}
                      onMouseLeave={handlePolygonLeave}
                      onClick={() => handlePolygonClick(polygon)}
                    />
                  </g>
                );
              }

              let fillColor = "transparent";
              let strokeColor = "transparent";

              if (isHovered) {
                fillColor = "rgba(122, 144, 73, 0.4)";
                strokeColor = "rgba(122, 144, 73, 0.8)";
              } else if (shapeType === ShapeTypeEnum.Inline) {
                fillColor = "transparent";
                strokeColor = "transparent";
              } else {
                strokeColor = "transparent";
              }

              return (
                <g key={`dollhouse-polygon-group-${polygon.id}-${index}`}>
                  <path
                    key={`dollhouse-${polygon.id}-${index}`}
                    d={createPolygonPath(polygon.points)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? "3" : "1"}
                    style={{
                      pointerEvents: "auto",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      filter: isHovered
                        ? "drop-shadow(0 0 12px rgba(122, 144, 73, 0.6))"
                        : "none",
                    }}
                    onMouseEnter={(e) => handlePolygonHover(polygon, e)}
                    onMouseLeave={handlePolygonLeave}
                    onClick={() => handlePolygonClick(polygon)}
                  />

                  <g>
                    <circle
                      cx={getPolygonCenterPoint(polygon.points).x}
                      cy={getPolygonCenterPoint(polygon.points).y - 10}
                      r="8"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    />

                    <line
                      x1={getPolygonCenterPoint(polygon.points).x}
                      y1={getPolygonCenterPoint(polygon.points).y - 10}
                      x2={getPolygonCenterPoint(polygon.points).x}
                      y2={getPolygonCenterPoint(polygon.points).y - 35}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                      }}
                    />

                    <rect
                      x={getPolygonCenterPoint(polygon.points).x - 45}
                      y={getPolygonCenterPoint(polygon.points).y - 55}
                      width="90"
                      height="20"
                      rx="10"
                      ry="10"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
                      }}
                    />
                  </g>

                  <text
                    x={getPolygonCenterPoint(polygon.points).x}
                    y={getPolygonCenterPoint(polygon.points).y - 45}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill: "black",
                      fontSize: "12px",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {getRoomName(polygon)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

      {hoveredPolygon && (
        <Fade in={!!hoveredPolygon} timeout={200}>
          <Box>
            <PolygonCard
              polygon={hoveredPolygon}
              mousePosition={mousePosition}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              sceneType="dollhouse"
            />
          </Box>
        </Fade>
      )}

      <NavigationControls
        onLeftClick={goToPreviousAnchor}
        onRightClick={goToNextAnchor}
      />
    </div>
  );
}
