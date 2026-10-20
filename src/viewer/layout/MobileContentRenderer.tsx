"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { TabEnum } from "@enums/TabEnum";
import { ITagItem } from "@/types/ITagItem";
import { IUnitItem } from "@/types/IUnitItem";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setGeneralLoading } from "@redux/appSlice";
import Scene3D from "../Scene3D";
import VirtualTourViewer from "../virtual/VirtualTourViewerWrapper";
import DollhouseScene3D from "../drawers/DollhouseScene3D";
import InteractiveSceneView from "../InteractiveSceneView";
import BalconyPanoramaViewer from "../virtual/BalconyPanoramaViewerWrapper";
import useNavigationService from "@hooks/useNavigationService";
import { QueryParamEnum } from "@enums/QueryParamEnum";

interface MobileContentRendererProps {
  currentMobileDrawerTab: string;
  canvasHeight: number;
  onNavigationChange: (nextFunc: () => void, prevFunc: () => void) => void;
  selectedUnit: IUnitItem | null;
  selectedFloorId: number | null;
}

const MobileContentRenderer: React.FC<MobileContentRendererProps> = ({
  currentMobileDrawerTab,
  canvasHeight,
  onNavigationChange,
  selectedUnit,
  selectedFloorId,
}) => {
  const theme = useTheme();
  const t = useTranslations("Common");
  const dispatch = useAppDispatch();
  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const { presentationInitResponse, floorContent } = useAppSelector(
    (state) => state.AppReducer,
  );
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [dollhouseData, setDollhouseData] = useState<ITagItem[]>([]);
  const [floorPlanData, setFloorPlanData] = useState<ITagItem | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: 320,
    height: 400,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedVirtualTourId, setSelectedVirtualTourId] = useState<
    string | null
  >(null);
  const [lastFetchedFloorId, setLastFetchedFloorId] = useState<string | null>(
    null,
  );
  const navService = useNavigationService();

  const unitTemplate = useMemo(() => {
    if (!selectedUnit || !presentationInitResponse?.unitTemplates) return null;
    return presentationInitResponse.unitTemplates.find(
      (template) => template.id === selectedUnit.templateId,
    );
  }, [selectedUnit, presentationInitResponse?.unitTemplates]);

  const availableVirtualTours = useMemo(() => {
    return unitTemplate?.virtualTours || [];
  }, [unitTemplate]);

  useEffect(() => {
    if (availableVirtualTours.length > 0) {
      if (
        currentMobileDrawerTab === TabEnum.VirtualTour &&
        !selectedVirtualTourId
      ) {
        setSelectedVirtualTourId(availableVirtualTours[0].id?.toString());
      }
    } else {
      setSelectedVirtualTourId(null);
    }
  }, [availableVirtualTours, selectedVirtualTourId, currentMobileDrawerTab]);

  const currentVirtualTour = useMemo(() => {
    if (!selectedVirtualTourId || !availableVirtualTours.length) return null;
    return availableVirtualTours.find(
      (tour) => tour.id?.toString() === selectedVirtualTourId.toString(),
    );
  }, [selectedVirtualTourId, availableVirtualTours]);

  useEffect(() => {
    const updateContainerSize = () => {
      const height =
        currentMobileDrawerTab === "unit"
          ? canvasHeight
          : typeof window !== "undefined"
            ? window.innerHeight
            : 800;

      setContainerSize({
        width: typeof window !== "undefined" ? window.innerWidth : 320,
        height: height,
      });
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, [canvasHeight, currentMobileDrawerTab]);

  useEffect(() => {
    if (
      currentMobileDrawerTab !== TabEnum.FloorPlanView &&
      currentMobileDrawerTab !== TabEnum.FloorPlan
    ) {
      setFloorPlanData(null);
    }
    if (currentMobileDrawerTab !== TabEnum.Dollhouse) {
      setDollhouseData([]);
    }
  }, [currentMobileDrawerTab]);

  useEffect(() => {
    if (
      currentMobileDrawerTab === TabEnum.FloorPlanView ||
      currentMobileDrawerTab === TabEnum.FloorPlan
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
        .catch((error) => {
          console.error("Floor plan loading error:", error);
        })
        .finally(() => {
          dispatch(setGeneralLoading(false));
        });
    } else {
      setFloorPlanData(null);
      setLastFetchedFloorId(null);
    }
  }, [
    currentMobileDrawerTab,
    selectedUnit?.floor?.id,
    selectedFloorId,
    floorPlanData,
    TenantId,
    ProjectSlug,
    presentationInitResponse?.projectId,
    locale,
    dispatch,
  ]);

  useEffect(() => {
    if (
      currentMobileDrawerTab === TabEnum.Dollhouse &&
      dollhouseData.length === 0 &&
      selectedUnit?.dollhouseId
    ) {
      const entityId = selectedUnit.dollhouseId;
      dispatch(setGeneralLoading(true));
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
        .catch((error) => {
          console.error("Dollhouse loading error:", error);
        })
        .finally(() => {
          dispatch(setGeneralLoading(false));
        });
    }
  }, [
    currentMobileDrawerTab,
    selectedUnit?.dollhouseId,
    dollhouseData.length,
    TenantId,
    ProjectSlug,
    presentationInitResponse?.projectId,
    locale,
  ]);

  const getUnitPlanImageUrl = useCallback((): string | undefined => {
    if (!unitTemplate?.image?.url) {
      return undefined;
    }
    return resolveCdnImageUrl(unitTemplate.image.url, {
      preferMobile: isMobile,
    });
  }, [unitTemplate, isMobile]);

  const getFloorPlanImageUrl = useCallback((): string | undefined => {
    if (!floorPlanData?.image?.url) {
      return undefined;
    }
    return resolveCdnImageUrl(floorPlanData.image.url, {
      preferMobile: isMobile,
    });
  }, [floorPlanData, isMobile]);

  const getDefaultFloorImage = useCallback((): string | undefined => {
    if (!selectedUnit?.floor?.id || !floorContent) {
      return undefined;
    }
    const floorData = floorContent.find(
      (floor: any) => floor?.id === selectedUnit?.floor?.id,
    );

    return (
      resolveCdnImageUrl(floorData?.floorPlanImage?.url, {
        preferMobile: isMobile,
      }) || undefined
    );
  }, [selectedUnit, floorContent, isMobile]);

  switch (currentMobileDrawerTab) {
    case "unit":
      return (
        <Scene3D
          canvasHeight={canvasHeight}
          onNavigationChange={onNavigationChange}
        />
      );
    case TabEnum.UnitPlan:
      return (
        <>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              position: "relative",
              p: 2,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            {unitTemplate?.image?.url ? (
              <Box
                onClick={() => setIsFullscreen(true)}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "auto",
                  maxHeight: "100%",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={getUnitPlanImageUrl() || "/placeholder.png"}
                  alt={`Unit ${unitTemplate?.name} floor plan`}
                  width={1000}
                  height={1000}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            ) : (
              <Typography variant="h6" color="text.secondary">
                {t("UnitPlan")} - {t("NoImage")}
              </Typography>
            )}
          </Box>
          <Modal
            open={isFullscreen}
            onClose={() => setIsFullscreen(false)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.95)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <IconButton
                onClick={() => setIsFullscreen(false)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
              {unitTemplate?.image?.url && (
                <Image
                  src={unitTemplate.image.url}
                  alt={`Unit ${unitTemplate?.name} floor plan fullscreen`}
                  width={2000}
                  height={2000}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>
          </Modal>
        </>
      );
    case TabEnum.VirtualTour:
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.palette.mode === "dark" ? "#000" : "#1a1a1a",
            position: "relative",
          }}
        >
          {currentVirtualTour ? (
            <VirtualTourViewer
              virtualItem={currentVirtualTour}
              EntityType={EntityTypeEnum.UnitTemplate}
              EntityId={selectedUnit?.templateId.toString() || ""}
            />
          ) : availableVirtualTours.length > 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                p: 2,
              }}
            >
              <Typography variant="h6" textAlign="center">
                {t("VirtualTour")} - {t("Loading")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                p: 2,
              }}
            >
              <Typography variant="h6" textAlign="center">
                {t("VirtualTour")} - {t("NotAvailable")}
              </Typography>
            </Box>
          )}
        </Box>
      );
    case TabEnum.Dollhouse:
      return (
        <Box
          sx={{
            height: canvasHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bgcolor: "white",
          }}
        >
          {dollhouseData && dollhouseData.length > 0 ? (
            <DollhouseScene3D
              dollhouseData={dollhouseData}
              containerWidth={containerSize.width}
              containerHeight={canvasHeight}
              canvasHeight={canvasHeight}
            />
          ) : (
            <Typography variant="h6" color="#1a1a1a">
              {t("Dollhouse")} - {t("Loading")}
            </Typography>
          )}
        </Box>
      );
    case TabEnum.FloorPlan:
    case TabEnum.FloorPlanView:
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.50",
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
            <Typography variant="h6" color="text.secondary">
              {t("FloorPlanView")} - {t("Loading")}
            </Typography>
          )}
        </Box>
      );
    case TabEnum.BalconyView:
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backgroundColor: theme.palette.mode === "dark" ? "#000" : "#1a1a1a",
          }}
        >
          {selectedUnit?.balconies && selectedUnit.balconies.length > 0 ? (
            <BalconyPanoramaViewer
              balconies={selectedUnit.balconies}
              width="100%"
              height="100%"
              onImageChange={(imageId) => {}}
            />
          ) : (
            <Typography variant="h6" color="white">
              {t("BalconyViewNotAvailable")}
            </Typography>
          )}
        </Box>
      );
    default:
      return (
        <Scene3D
          canvasHeight={canvasHeight}
          onNavigationChange={onNavigationChange}
        />
      );
  }
};

export default MobileContentRenderer;
