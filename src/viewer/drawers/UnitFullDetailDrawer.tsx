"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  Modal,
  Backdrop,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/IosShare";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import PanoramaIcon from "@mui/icons-material/Panorama";
import { handleNativeShare } from "@helpers/Common/handleNativeShare";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { TabEnum } from "@enums/TabEnum";
import {
  setGeneralLoading,
} from "@redux/appSlice";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import { useParams } from "next/navigation";
import { useNavigationService } from "@hooks/useNavigationService";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { IUnitItem } from "@/types/IUnitItem";
import { ITagItem } from "@/types/ITagItem";
import InteractiveSceneView from "../InteractiveSceneView";
import DollhouseScene3D from "./DollhouseScene3D";
import VirtualTourViewer from "../virtual/VirtualTourViewerWrapper";
import BalconyPanoramaViewer from "../virtual/BalconyPanoramaViewerWrapper";
import UnitViewIcon from "@/assets/svgs/UnitViewIcon";
import FloorViewIcon from "@/assets/svgs/FloorViewIcon";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";

export const getAvailableTabs = (
  selectedUnit: IUnitItem | null,
  t: any,
  unitTemplates: any[],
  floorIdParam?: string | null
) => {
  if (!selectedUnit && !floorIdParam) return [];

  const tabs = [];

  if (floorIdParam && !selectedUnit) {
    tabs.push({
      id: TabEnum.FloorPlan,
      icon: <FloorViewIcon />,
      label: t("FloorPlan"),
      available: true,
    });
    return tabs;
  }

  if (selectedUnit) {
    tabs.push({
      id: TabEnum.UnitPlan,
      icon: <UnitViewIcon />,
      label: t("UnitPlan"),
      available: true,
    });

    const unitTemplate = unitTemplates?.find(
      (template) => template.id === selectedUnit.templateId
    );
    const hasVirtualTours =
      unitTemplate?.virtualTours && unitTemplate.virtualTours.length > 0;

    if (hasVirtualTours) {
      tabs.push({
        id: TabEnum.VirtualTour,
        icon: <CameraswitchIcon />,
        label: t("VirtualTour"),
        available: true,
      });
    }

    tabs.push({
      id: TabEnum.Dollhouse,
      icon: <ViewInArIcon />,
      label: t("Dollhouse"),
      available: true,
    });

    tabs.push({
      id: TabEnum.FloorPlanView,
      icon: <FloorViewIcon />,
      label: t("FloorPlanView"),
      available: true,
    });

    if (selectedUnit?.balconies && selectedUnit.balconies.length > 0) {
      tabs.push({
        id: TabEnum.BalconyView,
        icon: <PanoramaIcon />,
        label: t("BalconyView"),
        available: true,
      });
    }
  }

  return tabs;
};

const UnitFullDetailDrawer: React.FC = () => {
  const theme = useTheme();
  const navService = useNavigationService();
  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const {
    unitFullDetailDrawerOpen,
    presentationContentResponse,
    selectedUnitId,
    presentationInitResponse,
    drawerOpen,
    floorContent,
    activeTab: reduxActiveTab,
    currentSceneId,
  } = useAppSelector((state) => state.AppReducer);
  const searchParams = useSearchParams();
  const urlActiveTab = searchParams?.get(QueryParamEnum.ActiveTab);
  const currentTab = urlActiveTab || reduxActiveTab;
  const t = useTranslations("Common");
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [dollhouseData, setDollhouseData] = useState<ITagItem[]>([]);
  const [dollhouseLoading, setDollhouseLoading] = useState(true);
  const [floorPlanData, setFloorPlanData] = useState<ITagItem | null>(null);
  const [lastFetchedFloorId, setLastFetchedFloorId] = useState<string | null>(
    null
  );
  const [containerSize, setContainerSize] = useState({
    width: 1920,
    height: 1080,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenImageSrc, setFullScreenImageSrc] = useState("");
  const [fullScreenImageAlt, setFullScreenImageAlt] = useState("");
  const [selectedVirtualTourId, setSelectedVirtualTourId] = useState<
    string | null
  >(null);

  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );

  const selectedUnit: IUnitItem = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const unitTemplate = useMemo(() => {
    if (!selectedUnit || !presentationInitResponse?.unitTemplates) return null;
    return presentationInitResponse.unitTemplates.find(
      (template) => template.id === selectedUnit.templateId
    );
  }, [selectedUnit, presentationInitResponse?.unitTemplates]);

  const availableVirtualTours = useMemo(() => {
    return unitTemplate?.virtualTours || [];
  }, [unitTemplate]);

  useEffect(() => {
    if (availableVirtualTours.length > 0 && !selectedVirtualTourId) {
      setSelectedVirtualTourId(availableVirtualTours[0].id?.toString());
    }
  }, [availableVirtualTours, selectedVirtualTourId]);

  useEffect(() => {
    if (selectedUnit?.templateId) {
      setSelectedVirtualTourId(null);
    }
  }, [selectedUnit?.templateId]);


  useEffect(() => {
    if (
      currentTab === TabEnum.VirtualTour &&
      availableVirtualTours.length > 0 &&
      !selectedVirtualTourId
    ) {
      setSelectedVirtualTourId(availableVirtualTours[0].id?.toString());
    }

    if (currentTab !== TabEnum.VirtualTour) {
      setSelectedVirtualTourId(null);
    }
  }, [currentTab, availableVirtualTours, selectedVirtualTourId]);

  const currentVirtualTour = useMemo(() => {
    if (!availableVirtualTours.length) return null;

    if (selectedVirtualTourId) {
      const selectedTour = availableVirtualTours.find(
        (tour) => tour.id?.toString() === selectedVirtualTourId.toString()
      );
      if (selectedTour) {
        return selectedTour;
      }
    }

    return availableVirtualTours[0] || null;
  }, [selectedVirtualTourId, availableVirtualTours]);

  const handleClose = () => {
    navService.closeUnitFullDetailDrawer();
  };

  const handleShare = () => {
    handleNativeShare({
      unitName: selectedUnit?.block?.name + " " + selectedUnit?.unitNumber,
      projectName: presentationInitResponse?.projectName,
      t,
      presentationInitResponse,
    });
  };

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    setFullScreenImageSrc(imageSrc);
    setFullScreenImageAlt(imageAlt);
    setIsFullScreenOpen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenOpen(false);
    setFullScreenImageSrc("");
    setFullScreenImageAlt("");
  };

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateContainerSize();

    const resizeObserver = new ResizeObserver(updateContainerSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [unitFullDetailDrawerOpen]);

  useEffect(() => {
    if (
      currentTab !== TabEnum.FloorPlanView &&
      currentTab !== TabEnum.FloorPlan
    ) {
      setFloorPlanData(null);
    }
    if (currentTab !== TabEnum.Dollhouse) {
      setDollhouseData([]);
      setDollhouseLoading(true);
    }
    if (
      currentTab === TabEnum.FloorPlanView ||
      currentTab === TabEnum.FloorPlan
    ) {
      const floorIdParam = navService.getParam(QueryParamEnum.FloorId);
      const entityId = floorIdParam || selectedUnit?.floor.id;

      if (!entityId) {
        setFloorPlanData(null);
        setLastFetchedFloorId(null);
        return;
      }

      if (lastFetchedFloorId === entityId?.toString() && floorPlanData) {
        return;
      }

      dispatch(setGeneralLoading(true));
      axiosInstance
        .get(OpsApiRoutes.GetPresentations, {
          params: {
            TenantId,
            ProjectSlug,
            ProjectId: presentationInitResponse?.projectId,
            EntityType: EntityTypeEnum.Floor,
            EntityId: entityId,
          },
          headers: {
            "Accept-Language": getAcceptLanguage(locale || "en"),
          },
        })
        .then((response) => {
          if (response.data && response.data.isSuccess) {
            setFloorPlanData(response?.data?.data?.tags?.[0]);
            setLastFetchedFloorId(entityId?.toString());
          }
        })
        .finally(() => {
          dispatch(setGeneralLoading(false));
        });
    } else {
      setFloorPlanData(null);
      setLastFetchedFloorId(null);
    }

    if (currentTab === TabEnum.Dollhouse && !dollhouseData.length) {
      const entityId = selectedUnit?.dollhouseId;
      dispatch(setGeneralLoading(true));
      setDollhouseLoading(true);
      axiosInstance
        .get(OpsApiRoutes.GetPresentations, {
          params: {
            TenantId,
            ProjectSlug,
            ProjectId: presentationInitResponse?.projectId,
            EntityType: EntityTypeEnum.Dollhouse,
            EntityId: entityId,
          },
          headers: {
            "Accept-Language": getAcceptLanguage(locale || "en"),
          },
        })
        .then((response) => {
          if (response.data && response.data.isSuccess) {
            setDollhouseData(response?.data?.data?.tags);
          }
        })
        .finally(() => {
          dispatch(setGeneralLoading(false));
          setDollhouseLoading(false);
        });
    }
  }, [urlActiveTab, reduxActiveTab]);

  const getDefaultFloorImage = useCallback((): string | undefined => {
    if (!selectedUnit?.floor?.id || !floorContent) {
      return undefined;
    }
    const floorData = floorContent.find(
      (floor: any) => floor?.id === selectedUnit?.floor?.id
    );

    return resolveCdnImageUrl(floorData?.floorPlanImage?.url, {
      preferMobile: isMobile,
    }) || undefined;
  }, [selectedUnit, floorContent, isMobile]);

  const getFloorPlanImageUrl = useCallback((): string | undefined => {
    if (!floorPlanData?.image?.url) {
      return undefined;
    }
    return resolveCdnImageUrl(floorPlanData.image.url, {
      preferMobile: isMobile,
    });
  }, [floorPlanData, isMobile]);

  return (
    <Drawer
      variant="persistent"
      open={unitFullDetailDrawerOpen}
      anchor="left"
      sx={{
        zIndex: 1400,
        "& .MuiDrawer-paper": {
          width: isMobile
            ? "100%"
            : drawerOpen
            ? "calc(100vw - 460px)"
            : "calc(100vw - 60px)",
          height: "100vh",
          backdropFilter: "blur(30px)",
          background: "transparent",
        },
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Tooltip title={t("ShareLink") || "Share Link"} arrow>
            <IconButton
              onClick={handleShare}
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.9)"
                    : "rgba(255, 255, 255, 0.9)",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 1)"
                      : "rgba(255, 255, 255, 1)",
                  color: theme.palette.text.primary,
                },
                boxShadow: theme.shadows[3],
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={handleClose}
            sx={{
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.9)"
                  : "rgba(255, 255, 255, 0.9)",
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 1)"
                    : "rgba(255, 255, 255, 1)",
                color: theme.palette.text.primary,
              },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              zIndex: 9999,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{ flex: 1, overflow: "hidden", position: "relative" }}
        ref={containerRef}
      >
        {currentTab === TabEnum.UnitPlan && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
              background: "transparent",
            }}
            onClick={() =>
              handleImageClick(
                unitTemplate?.image?.url || "/placeholder.png",
                `Unit ${selectedUnit?.name} floor plan`
              )
            }
          >
            <Image
              src={unitTemplate?.image?.url || "/placeholder.png"}
              alt={`Unit ${selectedUnit?.name} floor plan`}
              fill
            />
          </Box>
        )}

        {currentTab === TabEnum.VirtualTour && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#000",
              position: "relative",
            }}
          >
            {availableVirtualTours.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: isMobile ? 80 : 100,
                  left: "55%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FormControl
                  sx={{
                    minWidth: isMobile ? 180 : 220,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(42, 42, 42, 0.8)"
                          : "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      borderRadius: "14px",
                      fontSize: "14px",
                      fontWeight: 500,
                      height: isMobile ? 40 : 44,
                      color: theme.palette.common.white,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[8],
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        color: theme.palette.common.white,
                      },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(42, 42, 42, 0.9)"
                            : "rgba(0, 0, 0, 0.5)",
                        borderColor: theme.palette.divider,
                      },
                      "&.Mui-focused": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(42, 42, 42, 0.9)"
                            : "rgba(0, 0, 0, 0.5)",
                        borderColor: theme.palette.divider,
                      },
                    },
                  }}
                >
                  <Select
                    value={selectedVirtualTourId || ""}
                    onChange={(event) => {
                      const newTourId = event.target.value as string;
                      setSelectedVirtualTourId(newTourId);
                    }}
                    displayEmpty
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      PaperProps: {
                        sx: {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(42, 42, 42, 0.95)"
                              : "rgba(0, 0, 0, 0.5)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          borderRadius: "14px",
                          mb: 0.5,
                          minWidth: isMobile ? 180 : 220,
                          maxHeight: 300,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: theme.shadows[8],
                          "& .MuiMenuItem-root": {
                            fontSize: "14px",
                            fontWeight: 500,
                            color: theme.palette.common.white,
                            padding: "10px 16px",
                            transition: "all 0.2s ease",
                            borderRadius: "10px",
                            mx: 1,
                            my: 0.5,
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                              backdropFilter: "blur(10px)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: theme.palette.action.selected,
                              backdropFilter: "blur(10px)",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: theme.palette.action.selected,
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {availableVirtualTours.map((tour) => {
                      return (
                        <MenuItem key={tour.id} value={tour.id}>
                          {tour?.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}

            {currentVirtualTour ? (
              <VirtualTourViewer
                key={`virtual-tour-${currentVirtualTour.id}-${selectedVirtualTourId}`}
                virtualItem={currentVirtualTour}
                selectedScene={currentSceneId || undefined}
                EntityType={EntityTypeEnum.UnitTemplate}
                EntityId={selectedUnit?.templateId.toString() || ""}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Typography variant="h5">
                  {t("VirtualTourNotAvailable")}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {currentTab === TabEnum.Dollhouse && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {dollhouseLoading ? (
              <Typography variant="h5" color="text.secondary">
                {t("Loading")}
              </Typography>
            ) : dollhouseData && dollhouseData.length > 0 ? (
              <DollhouseScene3D
                dollhouseData={dollhouseData}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                canvasHeight={containerSize.height}
              />
            ) : (
              <Typography variant="h5" color="text.secondary">
                {t("NotFoundDollhouse")}
              </Typography>
            )}
          </Box>
        )}

        {(currentTab === TabEnum.FloorPlanView ||
          currentTab === TabEnum.FloorPlan) && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {floorPlanData?.polygons && floorPlanData?.image?.url ? (
              <InteractiveSceneView
                polygons={floorPlanData.polygons}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                imageUrl={
                  getFloorPlanImageUrl() ||
                  getDefaultFloorImage() ||
                  "/placeholder.png"
                }
                sceneType="floorPlan"
              />
            ) : getDefaultFloorImage() ? (
              <Image
                src={getDefaultFloorImage() || "/placeholder.png"}
                alt={`Floor plan image`}
                fill
              />
            ) : (
              <Typography variant="h5" color="text.secondary">
                {t("FloorPlanView")}
              </Typography>
            )}
          </Box>
        )}

        {currentTab === TabEnum.BalconyView && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "transparent",
            }}
          >
            {selectedUnit?.balconies && selectedUnit.balconies.length > 0 ? (
              <BalconyPanoramaViewer
                balconies={selectedUnit.balconies}
                width="100%"
                height="100%"
                drawerOpen={drawerOpen}
                onImageChange={(imageId) => {}}
              />
            ) : (
              <Typography variant="h5" color="white">
                {t("BalconyViewNotAvailable")}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Modal
        open={isFullScreenOpen}
        onClose={handleCloseFullScreen}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.95)"
                : "rgba(0, 0, 0, 0.9)",
          },
        }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95vw",
            height: "95vh",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={handleCloseFullScreen}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: theme.palette.common.white,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(42, 42, 42, 0.8)"
                  : "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={fullScreenImageSrc}
              alt={fullScreenImageAlt}
              fill
              style={{
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              priority
            />
          </Box>
        </Box>
      </Modal>
    </Drawer>
  );
};
export default UnitFullDetailDrawer;
