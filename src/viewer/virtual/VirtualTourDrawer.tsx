"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { openVirtualTourDrawer } from "@redux/appSlice";
import { useNavigationService } from "@hooks/useNavigationService";
import VirtualTourViewer from "@/viewer/virtual/VirtualTourViewerWrapper";
import { IVirtualItem } from "@/types/IVirtualItem";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { isSameEntityId } from "@helpers/Common/entityId";

const VirtualTourDrawerContent: React.FC = () => {
  const t = useTranslations("Common");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const navService = useNavigationService();

  const {
    virtualTourDrawerOpen,
    presentationInitResponse,
    virtualTourId: reduxVirtualTourId,
  } = useAppSelector((state) => state.AppReducer);
  const [currentVirtualTour, setCurrentVirtualTour] =
    useState<IVirtualItem | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const findVirtualTour = (tourId: string | number | null | undefined) => {
    if (tourId == null || !presentationInitResponse) return null;

    const fromProject = presentationInitResponse.projectVirtualTours?.find(
      (tour: IVirtualItem) => isSameEntityId(tour.id, tourId),
    );
    if (fromProject) return fromProject;

    for (const template of presentationInitResponse.unitTemplates || []) {
      const fromUnit = template.virtualTours?.find(
        (tour: IVirtualItem) => isSameEntityId(tour.id, tourId),
      );
      if (fromUnit) return fromUnit;
    }

    return null;
  };

  useEffect(() => {
    if (!presentationInitResponse || isClosing) {
      return;
    }

    const virtualTourId =
      navService.getVirtualTourId() || reduxVirtualTourId;
    const virtualTourOpen =
      navService.isVirtualTourOpen() || virtualTourDrawerOpen;
    const sceneId = navService.getSceneId();

    if (virtualTourId && virtualTourOpen) {
      const virtualTour = findVirtualTour(virtualTourId);

      if (virtualTour) {
        if (currentVirtualTour?.id?.toString() !== virtualTour.id?.toString()) {
          setCurrentVirtualTour(virtualTour);
        }

        if (selectedScene !== sceneId) {
          setSelectedScene(sceneId || null);
        }

        if (!virtualTourDrawerOpen) {
          dispatch(openVirtualTourDrawer());
        }
      }
    }
  }, [
    presentationInitResponse,
    virtualTourDrawerOpen,
    reduxVirtualTourId,
    dispatch,
    isClosing,
  ]);

  useEffect(() => {
    if (virtualTourDrawerOpen) {
      navService.closeUnitDetailDrawer();
    }
  }, [virtualTourDrawerOpen]);

  useEffect(() => {
    (window as any).openVirtualTourDrawer = (
      navigationId: string | number,
      navigationValue?: any
    ) => {
      const virtualTour = findVirtualTour(navigationId);

      if (virtualTour) {
        setCurrentVirtualTour(virtualTour);
        setSelectedScene(navigationValue || null);

        dispatch(openVirtualTourDrawer());

        // Poligondaki id eski veride yuvarlanmış olabilir; URL'e turun gerçek id'si yazılır.
        navService.openVirtualTourById(
          String(virtualTour.id ?? navigationId),
          navigationValue
        );
      }
    };

    return () => {
      delete (window as any).openVirtualTourDrawer;
    };
  }, [presentationInitResponse, dispatch]);

  const handleClose = () => {
    setIsClosing(true);

    navService.toggleVirtualTour();
    setCurrentVirtualTour(null);
    setSelectedScene(null);

    navService.closeVirtualTour();

    setTimeout(() => {
      setIsClosing(false);
    }, 500);
  };
  return (
    <Drawer
      anchor="left"
      open={virtualTourDrawerOpen}
      onClose={handleClose}
      hideBackdrop
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
        <Box
          sx={{ flex: 1, position: "relative", bgcolor: "background.default" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 9999,
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                boxShadow: theme.shadows[2],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {!currentVirtualTour ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textAlign: "center",
                p: 3,
              }}
            >
              <Typography variant="h6">
                {t("VirtualTourNotAvailable")}
              </Typography>
            </Box>
          ) : (
            <VirtualTourViewer
              virtualItem={currentVirtualTour}
              selectedScene={selectedScene}
              EntityType={EntityTypeEnum.ProjectMinimap}
              EntityId={presentationInitResponse?.minimapId || ""}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

const VirtualTourDrawer: React.FC = () => {
  return (
    <Suspense fallback={<div />}>
      <VirtualTourDrawerContent />
    </Suspense>
  );
};

export default VirtualTourDrawer;
