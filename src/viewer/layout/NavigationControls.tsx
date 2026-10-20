"use client";
import React from "react";
import OpsIconButton from "@components/OpsIconButton";
import { Box, useMediaQuery } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useAppSelector } from "@redux/hooks";

interface NavigationControlsProps {
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onLeftClick,
  onRightClick,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    unitFullDetailDrawerOpen,
    galleryDrawerOpen,
    mapDrawerOpen,
    infoCardDrawerOpen,
    virtualTourDrawerOpen,
    workflowDrawerOpen,
    projectWorkflowDrawerOpen,
    isComparisonDrawerOpen,
  } = useAppSelector((state) => state.AppReducer);

  const isAnyDrawerOpen =
    !isMobile &&
    (unitFullDetailDrawerOpen ||
      galleryDrawerOpen ||
      mapDrawerOpen ||
      infoCardDrawerOpen ||
      virtualTourDrawerOpen ||
      workflowDrawerOpen ||
      projectWorkflowDrawerOpen ||
      isComparisonDrawerOpen);

  if (isAnyDrawerOpen) return null;

  return (
    <Box
      data-tour="navigation-controls"
      sx={{
        position: "absolute",
        ...(isMobile
          ? { top: "50%", transform: "translateY(-50%)" }
          : { bottom: 30 }
        ),
        left: 0,
        right: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <OpsIconButton
        size={isMobile ? "small" : "large"}
        onClick={onLeftClick}
        data-tour="navigation-controls-left"
        sx={{
          borderRadius: "50%",
          pointerEvents: "auto",
        }}
      >
        <ArrowBackIosNewRoundedIcon />
      </OpsIconButton>

      <OpsIconButton
        size={isMobile ? "small" : "large"}
        onClick={onRightClick}
        data-tour="navigation-controls-right"
        sx={{
          borderRadius: "50%",
          pointerEvents: "auto",
        }}
      >
        <ArrowForwardIosRoundedIcon />
      </OpsIconButton>
    </Box>
  );
};

export default NavigationControls;
