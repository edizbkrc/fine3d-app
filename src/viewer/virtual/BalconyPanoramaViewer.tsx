"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

import Marzipano from "marzipano";
import { useAppSelector } from "@redux/hooks";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";

interface BalconyImage {
  name: string;
  image: {
    url: string;
    altText: string | null;
  };
  /** Opsiyonel gece panoraması; gece modunda bu açılır, yoksa gündüz görseli. */
  nightImage?: {
    url: string;
    altText: string | null;
  } | null;
  displayOrder: number;
  id: string;
}

interface BalconyPanoramaViewerProps {
  balconies: BalconyImage[];
  width?: string | number;
  height?: string | number;
  onImageChange?: (imageId: string) => void;
  initialImageId?: string;
  drawerOpen?: boolean;
}

const BalconyPanoramaViewer: React.FC<BalconyPanoramaViewerProps> = ({
  balconies,
  width = "100%",
  height = "100%",
  onImageChange,
  initialImageId,
  drawerOpen,
}) => {
  const t = useTranslations("Common");
  const theme = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentPresentationType = useAppSelector((state) => state.AppReducer.currentPresentationType);
  const isNight = Number(currentPresentationType) === Number(PresentationTypeEnum.NightLight);
  // Ref: loadPanoramaImage'in bağımlılığına girerse initializeMarzipano da değişip viewer'ı
  // yeniden kurar; gece/gündüz geçişinde yalnız sahneyi değiştirmek yeterli.
  const isNightRef = useRef(isNight);
  isNightRef.current = isNight;

  const tours = React.useMemo(() => {
    if (balconies.length === 0) return [];
    return balconies.map((balcony, index) => ({
      id: `tour-${balcony.id}`,
      name: balcony.name,
      balconies: [balcony],
    }));
  }, [balconies]);

  const currentBalconies = React.useMemo(() => {
    if (selectedTourId) {
      const selectedTour = tours.find((tour) => tour.id === selectedTourId);
      return selectedTour?.balconies || [];
    }
    return balconies;
  }, [tours, selectedTourId, balconies]);

  const sortedBalconies = React.useMemo(() => {
    const sorted = [...currentBalconies].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    return sorted;
  }, [currentBalconies]);

  const handleTourChange = (tourId: string) => {
    setSelectedTourId(tourId);
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    if (tours.length > 1 && !selectedTourId) {
      const firstTour = tours[0];
      setSelectedTourId(firstTour.id);
    }
  }, [tours, selectedTourId]);

  useEffect(() => {
    if (sortedBalconies.length > 0) {
      if (initialImageId) {
        const index = sortedBalconies.findIndex((b) => b.id === initialImageId);
        if (index !== -1) {
          setCurrentImageIndex(index);
        } else {
          setCurrentImageIndex(0);
        }
      } else {
        setCurrentImageIndex(0);
      }
    }
  }, [initialImageId, sortedBalconies]);

  const loadPanoramaImage = useCallback(
    (index: number) => {
      if (!viewerRef.current || !sortedBalconies[index]) return;

      setIsLoading(true);

      const balcony = sortedBalconies[index];
      // resolveCdnImageUrl: localde CDN CORS kapalı, WebGL dokusu siyah kalıyordu → same-origin
      // proxy. Production'da adres aynen döner.
      const imageUrl = resolveCdnImageUrl(
        (isNightRef.current && balcony.nightImage?.url) || balcony.image.url
      );

      try {
        const source = Marzipano.ImageUrlSource.fromString(imageUrl);

        const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
        const limiter = Marzipano.RectilinearView.limit.traditional(
          2048,
          (100 * Math.PI) / 180,
          (120 * Math.PI) / 180
        );
        const view = new Marzipano.RectilinearView(null, limiter);

        const scene = viewerRef.current.createScene({
          source: source,
          geometry: geometry,
          view: view,
          pinFirstLevel: true,
        });

        sceneRef.current = scene;

        scene.switchTo();

        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        setIsLoading(false);
      }
    },
    [sortedBalconies]
  );

  const initializeMarzipano = useCallback(async () => {
    const viewerElement = document.getElementById("marzipano-viewer");
    if (!viewerElement || sortedBalconies.length === 0) return;

    try {
      const viewer = new Marzipano.Viewer(viewerElement, {
        controls: {
          mouseViewMode: "drag",
        },
      });
      viewerRef.current = viewer;

      setTimeout(() => {
        loadPanoramaImage(currentImageIndex);
      }, 100);
    } catch (error) {
      setIsLoading(false);
    }
  }, [sortedBalconies, currentImageIndex, loadPanoramaImage]);

  // Gece/gündüz değişince açık balkonun panoramasını yeni moda göre yeniden yükle.
  useEffect(() => {
    if (viewerRef.current) loadPanoramaImage(currentImageIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNight]);

  const goToPrevious = useCallback(() => {
    const newIndex =
      currentImageIndex > 0
        ? currentImageIndex - 1
        : sortedBalconies.length - 1;
    setCurrentImageIndex(newIndex);
    loadPanoramaImage(newIndex);
    onImageChange?.(sortedBalconies[newIndex].id);
  }, [currentImageIndex, sortedBalconies, loadPanoramaImage, onImageChange]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentImageIndex < sortedBalconies.length - 1
        ? currentImageIndex + 1
        : 0;
    setCurrentImageIndex(newIndex);
    loadPanoramaImage(newIndex);
    onImageChange?.(sortedBalconies[newIndex].id);
  }, [currentImageIndex, sortedBalconies, loadPanoramaImage, onImageChange]);

  const zoomIn = useCallback(() => {
    if (viewerRef.current && sceneRef.current) {
      const view = sceneRef.current.view();
      const currentFov = view.fov();
      view.setFov(
        Math.max(currentFov - (10 * Math.PI) / 180, (30 * Math.PI) / 180)
      );
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (viewerRef.current && sceneRef.current) {
      const view = sceneRef.current.view();
      const currentFov = view.fov();
      view.setFov(
        Math.min(currentFov + (10 * Math.PI) / 180, (120 * Math.PI) / 180)
      );
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleResize = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.updateSize();
    }
  }, []);

  useEffect(() => {
    initializeMarzipano();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [initializeMarzipano]);

  useEffect(() => {
    if (viewerRef.current && sortedBalconies.length > 0) {
      loadPanoramaImage(currentImageIndex);
    }
  }, [currentImageIndex, loadPanoramaImage]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (drawerOpen !== undefined) {
      handleResize();
    }
  }, [drawerOpen, handleResize]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (sortedBalconies.length === 0) {
    return (
      <Box
        sx={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
        }}
      >
        <Typography color="white" variant="h6">
          {t("NoBalconyImagesAvailable")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={mountRef}
      sx={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        backgroundColor: "#000",
        cursor: "grab",
      }}
    >
      <div
        id="marzipano-viewer"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(0, 0, 0, 0.7)",
            zIndex: 10,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}

      {tours.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            opacity: 1,
            transition: "opacity 0.3s ease",
            pointerEvents: "auto",
          }}
        >
          <FormControl
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "rgba(245, 245, 247, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 0.98)"
                      : "rgba(245, 245, 247, 0.98)",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 0.98)"
                      : "rgba(245, 245, 247, 0.98)",
                },
              },
            }}
          >
            <Select
              value={selectedTourId || ""}
              onChange={(event) =>
                handleTourChange(event.target.value as string)
              }
              displayEmpty
              MenuProps={{
                disablePortal: false,
                container: document.body,
                slotProps: {
                  root: {
                    style: {
                      zIndex: 99999,
                    },
                  },
                },
                PaperProps: {
                  sx: {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(42, 42, 42, 0.95)"
                        : "rgba(245, 245, 247, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "0px 0px 12px12px",
                    minWidth: 200,
                    maxHeight: 300,
                    boxShadow: theme.shadows[8],
                    "& .MuiList-root": {
                      padding: "8px",
                    },
                    "& .MuiMenuItem-root": {
                      fontSize: "14px",
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      padding: "10px 16px",
                      transition: "all 0.2s ease",
                      borderRadius: "8px",
                      margin: "2px 0",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.main",
                        },
                      },
                    },
                  },
                },
              }}
            >
              {tours.map((tour) => (
                <MenuItem key={tour.id} value={tour.id}>
                  {tour.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {sortedBalconies.length > 1 && selectedTourId && (
            <>
              <Box
                sx={{
                  width: "1px",
                  height: "24px",
                  bgcolor: theme.palette.divider,
                  mx: 0.5,
                }}
              />

              <IconButton
                onClick={goToPrevious}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "12px",
                  fontWeight: 500,
                  minWidth: "30px",
                  textAlign: "center",
                }}
              >
                {currentImageIndex + 1}/{sortedBalconies.length}
              </Typography>

              <IconButton
                onClick={goToNext}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      )}

      {!isFullscreen && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            zIndex: 20,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.9)"
                : "rgba(245, 245, 247, 0.9)",
            borderRadius: "20px",
            px: 1,
            py: 0.5,
            backdropFilter: "blur(8px)",
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
            opacity: 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <IconButton
            onClick={zoomIn}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ZoomIn fontSize="small" />
          </IconButton>

          <IconButton
            onClick={zoomOut}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ZoomOut fontSize="small" />
          </IconButton>

          <Box
            sx={{
              width: "1px",
              height: "24px",
              bgcolor: theme.palette.divider,
              mx: 0.5,
            }}
          />

          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <Fullscreen fontSize="small" />
          </IconButton>
        </Box>
      )}

      {isFullscreen && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            zIndex: 9999,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.9)"
                : "rgba(245, 245, 247, 0.9)",
            borderRadius: "20px",
            px: 1,
            py: 0.5,
            backdropFilter: "blur(8px)",
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton
            onClick={zoomIn}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ZoomIn fontSize="small" />
          </IconButton>

          <IconButton
            onClick={zoomOut}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ZoomOut fontSize="small" />
          </IconButton>

          <Box
            sx={{
              width: "1px",
              height: "24px",
              bgcolor: theme.palette.divider,
              mx: 0.5,
            }}
          />

          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <FullscreenExit fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default BalconyPanoramaViewer;
