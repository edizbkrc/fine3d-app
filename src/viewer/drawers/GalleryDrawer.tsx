"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Skeleton,
  Modal,
  useMediaQuery,
  useTheme,
  ImageList,
  ImageListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { IGalleryItem } from "@/types/IGalleryItem";
import { toggleGalleryDrawer } from "@redux/appSlice";
import axiosInstance from "@network/axiosInstance";
import { useParams } from "next/navigation";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import Image from "next/image";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";

const GalleryDrawer: React.FC = () => {
  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const t = useTranslations("Common");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<IGalleryItem[]>([]);

  const { galleryDrawerOpen, presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const handleClose = () => {
    dispatch(toggleGalleryDrawer());
  };

  const flatItems = React.useMemo(() => {
    return items.filter((item) => item?.image?.url);
  }, [items]);

  const selectedImage = selectedIndex >= 0 ? flatItems[selectedIndex] ?? null : null;

  const handleImageClick = (item: IGalleryItem) => {
    if (item?.image?.url) {
      const idx = flatItems.findIndex((i) => i === item);
      setSelectedIndex(idx >= 0 ? idx : 0);
      setFullscreenOpen(true);
    }
  };

  const handleCloseFullscreen = () => {
    setFullscreenOpen(false);
    setSelectedIndex(-1);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev >= flatItems.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!fullscreenOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") handleCloseFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenOpen, flatItems.length]);

  useEffect(() => {
    if (!galleryDrawerOpen) return;
    axiosInstance
      .get(OpsApiRoutes.GetGalleryItems, {
        params: {
          TenantId,
          ProjectSlug,
          ProjectId: presentationInitResponse?.projectId,
        },
        headers: {
          "Accept-Language": getAcceptLanguage(locale || "en"),
        },
      })
      .then((response) => {
        if (response.data && response.data.isSuccess) {
          setItems(response?.data?.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [galleryDrawerOpen]);

  const renderLoadingSkeleton = () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: 1.5,
        pb: 2,
      }}
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width="100%"
          height={Math.floor(Math.random() * 100) + 150}
          sx={{ borderRadius: 1 }}
        />
      ))}
    </Box>
  );

  const groupedItems = React.useMemo(() => {
    const validItems = items.filter((item) => item?.image?.url);
    return validItems.reduce((groups, item) => {
      const groupName = item.groupName || "Ungrouped";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
      return groups;
    }, {} as Record<string, IGalleryItem[]>);
  }, [items]);

  const renderGalleryContent = () => {
    if (loading && items.length === 0) {
      return renderLoadingSkeleton();
    }

    if (items.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("NoImagesFound")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("NoImagesDescription")}
          </Typography>
        </Box>
      );
    }

    const groupEntries = Object.entries(groupedItems);

    if (groupEntries.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("NoImagesFound")}
          </Typography>
        </Box>
      );
    }

    const getItemImageUrl = (item: IGalleryItem): string => {
      if (!item.image?.url) {
        return "/placeholder.png";
      }
      return (
        resolveCdnImageUrl(item.image.url, { preferMobile: isMobile }) ||
        "/placeholder.png"
      );
    };

    return (
      <Box sx={{ pb: 2 }}>
        {groupEntries.map(([groupName, groupItems]) => (
          <Accordion
            key={groupName}
            elevation={0}
            defaultExpanded
            sx={{
              mb: 2,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600}>
                {groupName} ({groupItems.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <ImageList variant="masonry" cols={isMobile ? 2 : 3} gap={8}>
                {groupItems.map((item, index) => (
                  <ImageListItem
                    key={`${item.groupName}-${index}`}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "opacity 0.2s ease",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => handleImageClick(item)}
                  >
                    <Image
                      src={getItemImageUrl(item)}
                      alt={
                        item.image.altText ||
                        `Gallery image ${item.displayOrder}`
                      }
                      width={300}
                      height={200}
                      style={{
                        borderRadius: 8,
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.png";
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={galleryDrawerOpen}
        onClose={handleClose}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          zIndex: 1400,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100vw" : "calc(100vw - 60px)",
            height: "100vh",
            boxShadow: 3,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small">
                <ImageIcon color="primary" />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {t("Gallery")}
              </Typography>
            </Stack>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon color="primary" />
            </IconButton>
          </Stack>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {renderGalleryContent()}
          </Box>
        </Box>
      </Drawer>

      <Modal
        open={fullscreenOpen}
        onClose={handleCloseFullscreen}
        sx={{ zIndex: 99999999 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          {selectedImage && selectedImage.image?.url && (
            <>
              <Image
                src={selectedImage.image.url}
                alt={selectedImage.image.altText || "Gallery image"}
                width={1200}
                height={800}
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  objectFit: "contain",
                  width: "auto",
                  height: "auto",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.png";
                }}
              />

              {/* Close button */}
              <IconButton
                onClick={handleCloseFullscreen}
                size="large"
                sx={{
                  position: "absolute",
                  zIndex: 99999999,
                  top: 16,
                  right: 16,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.75)",
                  border: "2px solid rgba(255,255,255,0.5)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.95)",
                    border: "2px solid white",
                  },
                }}
              >
                <FullscreenExitIcon sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Prev button */}
              {flatItems.length > 1 && (
                <IconButton
                  onClick={handlePrev}
                  size="large"
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 99999999,
                    color: "white",
                    bgcolor: "rgba(0, 0, 0, 0.75)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.95)",
                      border: "2px solid white",
                    },
                  }}
                >
                  <ArrowBackIosNewRoundedIcon sx={{ fontSize: 24 }} />
                </IconButton>
              )}

              {/* Next button */}
              {flatItems.length > 1 && (
                <IconButton
                  onClick={handleNext}
                  size="large"
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 99999999,
                    color: "white",
                    bgcolor: "rgba(0, 0, 0, 0.75)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.95)",
                      border: "2px solid white",
                    },
                  }}
                >
                  <ArrowForwardIosRoundedIcon sx={{ fontSize: 24 }} />
                </IconButton>
              )}

              {/* Caption + counter */}
              <Box
                sx={{
                  zIndex: 99999999,
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {selectedImage.groupName && (
                  <Typography variant="body1">{selectedImage.groupName}</Typography>
                )}
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {selectedIndex + 1} / {flatItems.length}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default GalleryDrawer;
