"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Fullscreen,
  FullscreenExit,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Add,
  Remove,
} from "@mui/icons-material";

import Marzipano from "marzipano";
import screenfull from "screenfull";
import { IVirtualItem, IScene } from "@/types/IVirtualItem";
import LoadingComponent from "@components/LoadingComponent";
import VirtualTourInteractiveView from "./VirtualTourInteractiveView";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setCurrentSceneId } from "@redux/appSlice";
import { useNavigationService } from "@hooks/useNavigationService";
import { useSearchParams } from "next/navigation";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { resolveVirtualTourBaseUrl } from "@helpers/Common/cdnImageUrl";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";

const SCENE_TRANSITION_MS = 1100;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface SwitchSceneOptions {
  /** Mevcut bakış yönünü (yaw/pitch/fov) hedef sahneye taşı — varsayılan true */
  preserveView?: boolean;
  /** Animasyonsuz geçiş (ilk yükleme) */
  instant?: boolean;
}

const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  virtualItem,
  selectedScene,
  EntityType,
  EntityId,
}) => {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const {
    currentSceneId: reduxSceneId,
    unitDetailDrawerOpen,
    currentPresentationType,
  } = useAppSelector((state) => state.AppReducer);
  const navService = useNavigationService();
  // Daire içi (mülk şablonu) turlarda gece/gündüz yok; proje gece modundayken bile gündüz açılır.
  const useNightPanorama =
    EntityType !== EntityTypeEnum.UnitTemplate &&
    Number(currentPresentationType) === Number(PresentationTypeEnum.NightLight);

  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const autorotateRef = useRef<any>(null);
  const autorotateEnabledRef = useRef<boolean>(false);
  const currentSceneRef = useRef<MarzipanoScene | null>(null);
  const switchSceneRef = useRef<
    (scene: MarzipanoScene, options?: SwitchSceneOptions) => void
  >(() => {});

  const [tourData, setTourData] = useState<
    ActualVirtualItem | IVirtualItem | null
  >(null);
  const [scenes, setScenes] = useState<MarzipanoScene[]>([]);
  const [currentScene, setCurrentScene] = useState<MarzipanoScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autorotateEnabled, setAutorotateEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] =
    useState<ProcessedHotspot | null>(null);

  const startAutorotate = () => {
    if (viewerRef.current && autorotateRef.current && currentScene) {
      try {
        viewerRef.current.startMovement(autorotateRef.current);
        viewerRef.current.setIdleMovement(3000, autorotateRef.current);
      } catch (error) {}
    }
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let switchTimer: ReturnType<typeof setTimeout> | null = null;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setScenes([]);
        setCurrentScene(null);
        setTourData(virtualItem);

        // Container loading state'te unmount edilmemeli; yoksa Marzipano canvas kaybolur (siyah ekran).
        const viewerContainer = panoRef.current;
        if (!viewerContainer) {
          retryTimer = setTimeout(() => {
            if (!cancelled) void initViewer();
          }, 50);
          return;
        }

        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (error) {
            console.warn("Error destroying viewer:", error);
          }
          viewerRef.current = null;
        }

        const viewerOpts = {
          controls: {
            mouseViewMode:
              virtualItem.viewerSettings.mouseViewMode === 1 ||
              virtualItem.viewerSettings.mouseViewMode === "1"
                ? "drag"
                : "qtvr",
          },
        };

        viewerRef.current = new Marzipano.Viewer(viewerContainer, viewerOpts);

        let lastViewParams: any = null;
        const checkViewChange = () => {
          if (viewerRef.current && autorotateEnabledRef.current) {
            const view = viewerRef.current.view();
            if (view) {
              const currentParams = view.parameters();

              if (!lastViewParams) {
                lastViewParams = currentParams;
                return;
              }

              const hasChanged =
                Math.abs(currentParams.yaw - lastViewParams.yaw) > 0.001 ||
                Math.abs(currentParams.pitch - lastViewParams.pitch) > 0.001 ||
                Math.abs(currentParams.fov - lastViewParams.fov) > 0.001;

              if (hasChanged) {
                setAutorotateEnabled(false);
                autorotateEnabledRef.current = false;
                stopAutorotate();
              }

              lastViewParams = currentParams;
            }
          }
        };

        const handleUserInteraction = () => {
          if (autorotateEnabledRef.current) {
            setTimeout(checkViewChange, 50);
          }
        };

        viewerContainer.addEventListener("mousedown", handleUserInteraction);
        viewerContainer.addEventListener("touchstart", handleUserInteraction);
        viewerContainer.addEventListener("wheel", handleUserInteraction);

        const createdScenes = await createScenes(virtualItem.scenes);
        if (cancelled) return;

        setScenes(createdScenes);

        if (createdScenes.length > 0) {
          let initialScene = createdScenes[0];

          const urlSceneId = searchParams?.get("sceneId");
          if (urlSceneId) {
            const sceneByUrl = createdScenes.find(
              (s) => s.data.id === urlSceneId
            );
            if (sceneByUrl) initialScene = sceneByUrl;
          } else if (selectedScene) {
            const sceneByNavigationValue = createdScenes.find(
              (s) => s.data.id === selectedScene
            );
            if (sceneByNavigationValue) initialScene = sceneByNavigationValue;
          } else if (virtualItem.viewerSettings.initialSceneId) {
            const sceneByInitialId = createdScenes.find(
              (s) => s.data.id === virtualItem.viewerSettings.initialSceneId
            );
            if (sceneByInitialId) initialScene = sceneByInitialId;
          }

          switchTimer = setTimeout(() => {
            if (!cancelled) {
              switchSceneRef.current(initialScene, {
                preserveView: false,
                instant: true,
              });
            }
          }, 150);
        }

        autorotateRef.current = Marzipano.autorotate({
          yawSpeed: 0.03,
          targetPitch: 0,
          targetFov: Math.PI / 2,
        });

        if (virtualItem.viewerSettings.autorotateEnabled) {
          setAutorotateEnabled(true);
          autorotateEnabledRef.current = true;
        }
      } catch (error) {
        console.error("Virtual tour init failed:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void initViewer();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (switchTimer) clearTimeout(switchTimer);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
        viewerRef.current = null;
      }
    };
  }, [virtualItem, useNightPanorama]);

  const getTranslation = (
    translations: any[],
    languageId: number,
    fallbackText?: string
  ) => {
    const translation = translations.find((t) => t.languageId === languageId);
    return (
      translation ||
      translations[0] || {
        name: fallbackText,
        title: fallbackText,
        content: fallbackText,
      }
    );
  };

  const createScenes = async (
    sceneDataArray: (ActualScene | IScene)[]
  ): Promise<MarzipanoScene[]> => {
    const createdScenes: MarzipanoScene[] = [];

    for (const sceneData of sceneDataArray) {
      try {
        let levels: Array<{
          tileSize: number;
          size: number;
          fallbackOnly?: boolean;
        }> = [];
        let tileBaseUrl = "";
        let zStart = 0;
        let previewOrder = "lfrbud";

        const iScene = sceneData as IScene;
        const actualScene = sceneData as ActualScene;
        const nightImageUrl = resolveVirtualTourBaseUrl(
          iScene.nightImage?.url || "",
        );
        const preferNightEquirect = useNightPanorama && Boolean(nightImageUrl);

        const hasPresentationTiles = Boolean(
          iScene.tilesBaseUrl || iScene.tileConfigUrl,
        );

        if (!preferNightEquirect && hasPresentationTiles) {
          try {
            const configUrl = resolveVirtualTourBaseUrl(
              iScene.tileConfigUrl || "",
            );
            if (configUrl) {
              const response = await fetch(configUrl);
              if (response.ok) {
                const tileConfig = await response.json();
                levels = tileConfig.levels || [];
                zStart = Number(tileConfig.zStart) || 0;
                if (tileConfig.previewOrder) {
                  previewOrder = String(tileConfig.previewOrder);
                }
              }
            }
          } catch (error) {}

          tileBaseUrl = resolveVirtualTourBaseUrl(iScene.tilesBaseUrl || "");
        } else if (!preferNightEquirect && actualScene.tilesBasePath) {
          try {
            if (actualScene.tileConfigPath) {
              const configUrl = resolveVirtualTourBaseUrl(
                `https://dpjvxmlb5zg94.cloudfront.net/${actualScene.tileConfigPath}`,
              );
              const response = await fetch(configUrl);
              if (response.ok) {
                const tileConfig = await response.json();
                levels = tileConfig.levels || [];
                zStart = Number(tileConfig.zStart) || 0;
                if (tileConfig.previewOrder) {
                  previewOrder = String(tileConfig.previewOrder);
                }
              }
            }
          } catch (error) {}

          tileBaseUrl = resolveVirtualTourBaseUrl(
            `https://dpjvxmlb5zg94.cloudfront.net/${actualScene.tilesBasePath}`,
          );
        }

        if (!preferNightEquirect && levels.length === 0) {
          levels = [
            { tileSize: 512, size: 512 },
            { tileSize: 512, size: 1024 },
            { tileSize: 512, size: 2048 },
          ];
          zStart = zStart || 1;
        }

        const previewUrl = `${tileBaseUrl}/preview.jpg`;
        const geometryLevels = [
          { tileSize: 256, size: 256, fallbackOnly: true },
          ...levels,
        ];

        // Workspace gece modunda: sahnedeki nightImage (equirect) kullanılır.
        // Yoksa gündüz cube tile'larına düşülür.
        const source = preferNightEquirect
          ? Marzipano.ImageUrlSource.fromString(nightImageUrl)
          : new Marzipano.ImageUrlSource((tile: any) => {
              if (tile.z === 0) {
                const mapY = previewOrder.indexOf(tile.face) / 6;
                if (mapY >= 0) {
                  return {
                    url: previewUrl,
                    rect: { x: 0, y: mapY, width: 1, height: 1 / 6 },
                  };
                }
                return { url: previewUrl };
              }

              const levelIndex = tile.z - 1;
              const z = levelIndex + zStart;
              return {
                url: `${tileBaseUrl}/${z}/${tile.face}/${tile.y}/${tile.x}.jpg`,
              };
            });

        const geometry = preferNightEquirect
          ? new Marzipano.EquirectGeometry([{ width: 4096 }])
          : new Marzipano.CubeGeometry(geometryLevels);

        const limiter = Marzipano.RectilinearView.limit.traditional(
          2048,
          (90 * Math.PI) / 180,
          (150 * Math.PI) / 180
        );

        const yaw = sceneData.initialViewParameters.yaw;
        const pitch = sceneData.initialViewParameters.pitch;
        const fov = sceneData.initialViewParameters.fov;

        const initialViewParams = {
          yaw: (yaw * Math.PI) / 180,
          pitch: (pitch * Math.PI) / 180,
          fov: (fov * Math.PI) / 180,
        };

        const view = new Marzipano.RectilinearView(initialViewParams, limiter);

        const scene = viewerRef.current.createScene({
          source: source,
          geometry: geometry,
          view: view,
          pinFirstLevel: true,
        });

        createdScenes.push({
          data: sceneData,
          scene: scene,
          view: view,
        });

        if (!document.getElementById("marzipano-pulse-styles")) {
          const isDark = theme.palette.mode === "dark";
          const style = document.createElement("style");
          style.id = "marzipano-pulse-styles";
          style.textContent = `
            @keyframes marzipano-pulse {
              0% { box-shadow: 0 0 0 0 ${
                isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.7)"
              }; }
              70% { box-shadow: 0 0 0 10px ${
                isDark ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0)"
              }; }
              100% { box-shadow: 0 0 0 0 ${
                isDark ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0)"
              }; }
            }

            .info-hotspot-tooltip {
              position: absolute;
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              color: #333;
              padding: 12px 16px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              backdrop-filter: blur(10px);
              z-index: 1000;
              opacity: 0;
              visibility: hidden;
              transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
              transform: translateX(-50%) translateY(10px);
              pointer-events: none;
              max-width: 280px;
              min-width: 200px;
              font-size: 14px;
              line-height: 1.4;
              border: 1px solid rgba(0, 0, 0, 0.1);
            }

            .info-hotspot-tooltip::after {
              content: '';
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 6px solid transparent;
              border-top-color: white;
            }

            .info-hotspot-tooltip-title {
              font-weight: 600;
              font-size: 15px;
              margin-bottom: 6px;
              color: ${theme.palette.primary.main};
            }

            .info-hotspot-tooltip-text {
              font-size: 13px;
              color: ${theme.palette.text.primary};
              line-height: 1.5;
            }

            .hotspot.info-hotspot:hover .info-hotspot-tooltip,
            .hotspot.link-hotspot:hover .info-hotspot-tooltip {
              opacity: 1;
              visibility: visible;
              transform: translateX(-50%) translateY(0);
            }
          `;
          document.head.appendChild(style);
        }
      } catch (error) {}
    }

    createdScenes.forEach((marzipanoScene) => {
      try {
        marzipanoScene.data.hotspots.forEach((hotspot: any) => {
          let processedHotspot: ProcessedHotspot;

          if ("translations" in hotspot) {
            const hotspotTranslation = getTranslation(hotspot.translations, 1);

            processedHotspot = {
              id: hotspot.id,
              type: parseInt(hotspot.type),
              yaw: hotspot.yaw,
              pitch: hotspot.pitch,
              title: hotspotTranslation.title || hotspotTranslation.name,
              text: hotspotTranslation.content || hotspotTranslation.text,
              targetScene: hotspot.targetScene,
              rotation: hotspot.rotation || undefined,
            };
          } else {
            processedHotspot = {
              id: hotspot.id,
              type: hotspot.type,
              yaw: hotspot.yaw,
              pitch: hotspot.pitch,
              title: hotspot.title,
              text: hotspot.content || hotspot.text,
              targetScene: hotspot.targetScene,
              rotation: hotspot.rotation || undefined,
            };
          }

          if (processedHotspot.type === 1) {
            const element = createLinkHotspotElement(
              processedHotspot,
              createdScenes
            );
            marzipanoScene.scene.hotspotContainer().createHotspot(element, {
              yaw: hotspot.yaw,
              pitch: hotspot.pitch,
            });
          } else {
            const element = createInfoHotspotElement(processedHotspot);
            marzipanoScene.scene.hotspotContainer().createHotspot(element, {
              yaw: hotspot.yaw,
              pitch: hotspot.pitch,
            });
          }
        });
      } catch (error) {
        console.error("Error creating hotspots:", error);
      }
    });

    return createdScenes;
  };

  const createLinkHotspotElement = (
    hotspot: ProcessedHotspot,
    allScenes: MarzipanoScene[]
  ): HTMLElement => {
    const size = isMobile ? 50 : 60;
    const iconSize = isMobile ? 35 : 40;

    const wrapper = document.createElement("div");
    wrapper.className = "hotspot link-hotspot marzipano-hotspot";
    wrapper.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      margin-left: -${size / 2}px;
      margin-top: -${size / 2}px;
      opacity: 0.9;
      cursor: pointer;
      transition: opacity 0.2s;
      animation: marzipano-pulse 2s infinite;
      position: absolute;
      transform: translate(0, 0);
    `;

    const icon = document.createElement("div");
    const isDark = theme.palette.mode === "dark";
    const bgColor = isDark ? theme.palette.grey[800] : "white";
    const iconColor = theme.palette.primary.main;
    icon.style.cssText = `
      width: 100%;
      height: 100%;
      background: ${bgColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${iconColor};
      font-weight: bold;
      box-shadow: ${theme.shadows[3]};
    `;

    icon.innerHTML = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}">
        <path d="M7 14l5-5 5 5H7z"/>
      </svg>
    `;

    const tooltip = document.createElement("div");
    tooltip.className = "info-hotspot-tooltip";

    let tooltipContent = "";
    if (hotspot.title) {
      tooltipContent += `<div class="info-hotspot-tooltip-title">${hotspot.title}</div>`;
    }
    if (hotspot.text) {
      const cleanText = hotspot.text.replace(/<[^>]*>/g, "").substring(0, 200);
      const displayText =
        cleanText.length === 200 ? cleanText + "..." : cleanText;
      tooltipContent += `<div class="info-hotspot-tooltip-text">${displayText}</div>`;
    }

    tooltip.innerHTML = tooltipContent;

    wrapper.addEventListener("click", () => {
      const targetScene = allScenes.find(
        (s) => s.data.id === hotspot.targetScene
      );
      if (targetScene) {
        switchSceneRef.current(targetScene, { preserveView: true });
      }
    });

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);
    return wrapper;
  };

  const createInfoHotspotElement = (hotspot: ProcessedHotspot): HTMLElement => {
    const size = isMobile ? 50 : 60;
    const iconSize = isMobile ? 35 : 40;

    const wrapper = document.createElement("div");
    wrapper.className = "hotspot info-hotspot marzipano-hotspot";
    wrapper.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      margin-left: -${size / 2}px;
      margin-top: -${size / 2}px;
      cursor: pointer;
      animation: marzipano-pulse 2s infinite;
      position: absolute;
      transform: translate(0, 0);
    `;

    const icon = document.createElement("div");
    const isDark = theme.palette.mode === "dark";
    const bgColor = isDark ? theme.palette.grey[800] : "white";
    const iconColor = theme.palette.primary.main;
    icon.style.cssText = `
      width: 100%;
      height: 100%;
      background: ${bgColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${iconColor};
      font-weight: bold;
      box-shadow: ${theme.shadows[3]};
    `;

    icon.innerHTML = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}">
        <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM13,17H11V11H13V17ZM13,9H11V7H13V9Z"/>
      </svg>
    `;

    const tooltip = document.createElement("div");
    tooltip.className = "info-hotspot-tooltip";

    let tooltipContent = "";
    if (hotspot.title) {
      tooltipContent += `<div class="info-hotspot-tooltip-title">${hotspot.title}</div>`;
    }
    if (hotspot.text) {
      const cleanText = hotspot.text.replace(/<[^>]*>/g, "").substring(0, 200);
      const displayText =
        cleanText.length === 200 ? cleanText + "..." : cleanText;
      tooltipContent += `<div class="info-hotspot-tooltip-text">${displayText}</div>`;
    }

    tooltip.innerHTML = tooltipContent;

    wrapper.addEventListener("click", () => {
      setSelectedHotspot(hotspot);
    });

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);
    return wrapper;
  };

  const switchScene = useCallback(
    (scene: MarzipanoScene, options?: SwitchSceneOptions) => {
      if (!scene || !scene.scene || !viewerRef.current) return;
      if (currentSceneRef.current?.data.id === scene.data.id) return;

      try {
        stopAutorotate();

        const preserveView = options?.preserveView !== false;
        const duration = options?.instant ? 0 : SCENE_TRANSITION_MS;
        const previous = currentSceneRef.current;

        // Bakış yönünü koru — yeni sahnede aynı yaw/pitch/fov ile başla
        if (preserveView && previous?.view) {
          try {
            const currentParams = previous.view.parameters();
            scene.view.setParameters({
              yaw: currentParams.yaw,
              pitch: currentParams.pitch,
              fov: currentParams.fov,
            });
          } catch (e) {}
        }

        scene.scene.switchTo({
          transitionDuration: duration,
          transitionUpdate: (val: number, newScene: any) => {
            const t = easeInOutCubic(Math.min(Math.max(val, 0), 1));
            try {
              newScene.listLayers?.().forEach((layer: any) => {
                layer.mergeEffects?.({ opacity: t });
              });
              const hotspotEl = newScene._hotspotContainer?.domElement?.();
              if (hotspotEl) hotspotEl.style.opacity = String(t);
            } catch (e) {}
          },
        });

        currentSceneRef.current = scene;
        setCurrentScene(scene);
        dispatch(setCurrentSceneId(scene.data.id));

        setTimeout(() => {
          if (viewerRef.current) {
            try {
              viewerRef.current.updateSize();
            } catch (e) {}
          }
        }, Math.min(duration, 200));

        if (autorotateEnabled) {
          setTimeout(() => startAutorotate(), duration + 100);
        }
      } catch (error) {
        console.error("Error switching scene:", error);
      }
    },
    [autorotateEnabled, dispatch]
  );

  switchSceneRef.current = switchScene;

  const stopAutorotate = () => {
    if (viewerRef.current) {
      try {
        viewerRef.current.stopMovement();
        viewerRef.current.setIdleMovement(Infinity);
      } catch (error) {}
    }
  };

  const toggleAutorotate = () => {
    const newState = !autorotateEnabled;
    setAutorotateEnabled(newState);
    autorotateEnabledRef.current = newState;

    if (newState) {
      startAutorotate();
    } else {
      stopAutorotate();
    }
  };

  const toggleFullscreen = () => {
    if (screenfull.isEnabled) {
      if (panoRef.current && !screenfull.isFullscreen) {
        screenfull.request(panoRef.current);
      } else if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    }
  };

  const handleViewControl = (direction: string, velocity: number = 0.7) => {
    if (!viewerRef.current || !currentScene) return;

    const view = currentScene.view;
    const currentParams = view.parameters();

    const moveAmount = 0.1;
    const zoomAmount = 0.1;

    let newParams = { ...currentParams };

    switch (direction) {
      case "up":
        newParams.pitch = Math.max(
          currentParams.pitch - moveAmount,
          -Math.PI / 2
        );
        break;
      case "down":
        newParams.pitch = Math.min(
          currentParams.pitch + moveAmount,
          Math.PI / 2
        );
        break;
      case "left":
        newParams.yaw = currentParams.yaw - moveAmount;
        break;
      case "right":
        newParams.yaw = currentParams.yaw + moveAmount;
        break;
      case "zoomIn":
        newParams.fov = Math.max(currentParams.fov - zoomAmount, Math.PI / 8);
        break;
      case "zoomOut":
        newParams.fov = Math.min(currentParams.fov + zoomAmount, Math.PI);
        break;
    }

    view.setParameters(newParams, { duration: 200 });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = screenfull.isFullscreen;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullscreenChange);
      return () => screenfull.off("change", handleFullscreenChange);
    }

    return () => {};
  }, []);

  useEffect(() => {
    if (!isLoading && autorotateEnabled && currentScene) {
      startAutorotate();
    }
  }, [isLoading, currentScene]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const handleResize = () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.updateSize();
        } catch (e) {}
      }
    };

    window.addEventListener("resize", handleResize);

    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 200);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    if (reduxSceneId && scenes.length > 0 && !isLoading) {
      const targetScene = scenes.find((s) => s.data.id === reduxSceneId);
      if (targetScene && currentScene?.data.id !== reduxSceneId) {
        setTimeout(
          () => switchScene(targetScene, { preserveView: true }),
          50,
        );
      }
    }
  }, [reduxSceneId, scenes, isLoading, currentScene, switchScene]);

  useEffect(() => {
    if (currentScene) {
      navService.updateQueryParams(
        { [QueryParamEnum.SceneId]: currentScene.data.id },
        { scroll: false },
      );
    }
  }, [currentScene, navService]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "black",
      }}
    >
      {/* Marzipano container her zaman mount — loading’de unmount edilirse canvas kaybolur. */}
      <Box
        ref={panoRef}
        id="marzipano-viewer-container"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          cursor: isLoading ? "default" : "grab",
          zIndex: 99,
          "&:active": {
            cursor: isLoading ? "default" : "grabbing",
          },
        }}
      />

      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "black",
            color: "white",
            pointerEvents: "none",
          }}
        >
          <LoadingComponent open />
        </Box>
      )}

      {!isLoading && EntityId && (!unitDetailDrawerOpen || isFullscreen) && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 9999,
            width: 320,
            height: 180,
            borderRadius: 2,
            overflow: "hidden",
            display: ["none", "block"],
            backdropFilter: "blur(10px)",
          }}
        >
          <VirtualTourInteractiveView
            containerWidth={320}
            containerHeight={180}
            currentSceneId={currentScene?.data.id}
            EntityId={EntityId}
            EntityType={EntityType}
            onSceneChange={(sceneId) => {
              const targetScene = scenes.find((s) => s.data.id === sceneId);
              if (targetScene) {
                switchScene(targetScene, { preserveView: true });
              }
            }}
          />
        </Box>
      )}

      {tourData?.viewerSettings?.viewControlButtons && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: isMobile ? "35%" : "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            justifyContent: "center",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <IconButton
            onClick={() => handleViewControl("up")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
          <IconButton
            onClick={() => handleViewControl("down")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
          <IconButton
            onClick={() => handleViewControl("left")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={() => handleViewControl("right")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
          <IconButton
            onClick={() => handleViewControl("zoomIn")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <Add />
          </IconButton>
          <IconButton
            onClick={() => handleViewControl("zoomOut")}
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(245, 245, 247, 0.8)",
              color: theme.palette.text.primary,
              width: [35, 50],
              height: [35, 50],
              pointerEvents: "auto",
            }}
          >
            <Remove />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: isMobile ? 16 : 62,
          zIndex: 100,
          display: "flex",
          gap: 1,
        }}
      >
        {tourData?.viewerSettings?.autorotateEnabled && (
          <IconButton
            onClick={toggleAutorotate}
            sx={{
              width: isMobile ? 35 : 42,
              height: isMobile ? 35 : 42,
              bgcolor: autorotateEnabled
                ? "rgba(76,175,80,0.8)"
                : theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.95)"
                : "rgba(245, 245, 247, 0.95)",
              color: autorotateEnabled
                ? theme.palette.common.white
                : theme.palette.text.secondary,
              borderRadius: 10,
              "&:hover": {
                bgcolor: autorotateEnabled
                  ? "rgba(76,175,80,0.9)"
                  : theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.98)"
                  : "rgba(245, 245, 247, 0.95)",
                color: theme.palette.text.primary,
              },
            }}
          >
            {autorotateEnabled ? (
              <Pause sx={{ fontSize: isMobile ? 18 : 24 }} />
            ) : (
              <PlayArrow sx={{ fontSize: isMobile ? 18 : 24 }} />
            )}
          </IconButton>
        )}

        {screenfull.isEnabled && tourData?.viewerSettings?.fullscreenButton && (
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              width: isMobile ? 35 : 42,
              height: isMobile ? 35 : 42,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.95)"
                  : "rgba(245, 245, 247, 0.95)",
              color: theme.palette.text.secondary,
              backdropFilter: "blur(10px)",
              borderRadius: "50%",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.98)"
                    : "rgba(245, 245, 247, 0.98)",
                color: theme.palette.text.primary,
              },
              boxShadow: theme.shadows[4],
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {isFullscreen ? (
              <FullscreenExit sx={{ fontSize: isMobile ? 20 : 24 }} />
            ) : (
              <Fullscreen sx={{ fontSize: isMobile ? 20 : 24 }} />
            )}
          </IconButton>
        )}
      </Box>

      <Dialog
        open={!!selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.95)"
                : "rgba(245, 245, 247, 0.95)",
            color: theme.palette.common.white,
            backdropFilter: "blur(4px)",
            ...(isMobile && {
              margin: 0,
              maxHeight: "100vh",
              borderRadius: 0,
            }),
          },
        }}
      >
        {selectedHotspot && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.8)"
                    : "rgba(245, 245, 247, 0.8)",
                fontSize: isMobile ? "1.2rem" : "1.25rem",
                padding: isMobile ? 2 : 3,
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h6"}
                sx={{ fontSize: isMobile ? "1.1rem" : "1.25rem" }}
              >
                {selectedHotspot.title}
              </Typography>
              <IconButton
                onClick={() => setSelectedHotspot(null)}
                sx={{
                  color: theme.palette.common.white,
                  width: isMobile ? 50 : 40,
                  height: isMobile ? 50 : 40,
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ padding: isMobile ? 3 : 2 }}>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  lineHeight: 1.5,
                  fontSize: isMobile ? "1rem" : "0.875rem",
                }}
                dangerouslySetInnerHTML={{ __html: selectedHotspot.text || "" }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

interface ActualScene {
  id: string;
  name: string;
  tilesBasePath: string;
  tileConfigPath: string;
  faceSize: number;
  hotspots: ActualHotspot[];
  initialViewParameters: {
    yaw: number;
    pitch: number;
    fov: number;
  };
}

interface ActualHotspot {
  id: string;
  title: string;
  content: string;
  text: string;
  type: number;
  yaw: number;
  pitch: number;
  rotation?: number | null;
  targetScene: string;
}

interface ActualVirtualItem {
  id: string;
  name: string;
  imagesBasePath: string;
  scenes: ActualScene[];
  viewerSettings: {
    mouseViewMode: number;
    autorotateEnabled: boolean;
    fullscreenButton: boolean;
    viewControlButtons: boolean;
    initialSceneId: string;
  };
}

interface VirtualTourViewerProps {
  virtualItem: ActualVirtualItem | IVirtualItem;
  selectedScene?: string | null;
  EntityType?: EntityTypeEnum;
  EntityId?: string;
}

interface MarzipanoScene {
  data: ActualScene | IScene;
  scene: any;
  view: any;
}

interface ProcessedHotspot {
  id: string;
  type: number;
  yaw: number;
  pitch: number;
  title?: string;
  text?: string;
  targetScene?: string;
  rotation?: number;
}
export default VirtualTourViewer;
