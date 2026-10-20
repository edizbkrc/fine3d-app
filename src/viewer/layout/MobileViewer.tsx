"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import NavigationTabBar from "../tabs/NavigationTabBar";
import GalleryDrawer from "../drawers/GalleryDrawer";
import InfoCardDrawer from "../drawers/InfoCardDrawer";
import MapDrawer from "../drawers/MapDrawer";
import ComparisonDrawer from "../drawers/ComparisonDrawer";
import VirtualTourDrawer from "../virtual/VirtualTourDrawer";
import WorkflowDrawer from "../drawers/WorkflowDrawer";
import ProjectWorkflowDrawer from "../drawers/ProjectWorkflowDrawer";
import StageDrawer from "../drawers/StageDrawer";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import OpsIconButton from "@components/OpsIconButton";
import MobileDrawerContent from "../drawers/MobileDrawerContent";
import MobileContentRenderer from "./MobileContentRenderer";
import { useSearchParams } from "next/navigation";

import { useAppSelector } from "@redux/hooks";
import { TabEnum } from "@enums/TabEnum";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";

const MIN_DRAWER_HEIGHT = 50;

export default function MobileViewer() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const urlActiveTab = searchParams?.get("activeTab");
  const isIframeMode = searchParams?.get("from") === "iframe";

  const {
    selectedUnitId,
    selectedFloorId,
    presentationContentResponse,
    currentEntityType,
  } = useAppSelector((state) => state.AppReducer);

  const currentActiveTab = useAppSelector(
    (state) => state.AppReducer.activeTab
  );

  const tabsToHide = [
    TabEnum.VirtualTour,
    TabEnum.Dollhouse,
    TabEnum.FloorPlanView,
    TabEnum.BalconyView,
    TabEnum.UnitPlan,
    TabEnum.FloorPlan,
  ] as const;

  const shouldHideNavigationButtons = useMemo(() => {
    const activeTab = urlActiveTab || currentActiveTab;
    return (
      activeTab &&
      (tabsToHide as readonly string[]).includes(activeTab)
    );
  }, [urlActiveTab, currentActiveTab]);

  const totalHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const MAX_DRAWER_HEIGHT = Math.round(totalHeight / 2);
  const [drawerHeight, setDrawerHeight] = useState(400);
  const [dragging, setDragging] = useState(false);
  const [contentScrolling, setContentScrolling] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(drawerHeight);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const navigationFuncsRef = useRef<{
    nextFunc: (() => void) | null;
    prevFunc: (() => void) | null;
  }>({ nextFunc: null, prevFunc: null });

  const [currentMobileDrawerTab, setCurrentMobileDrawerTab] =
    useState<string>("unit");

  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );

  useEffect(() => {

    const activeTab = urlActiveTab || currentActiveTab;
    if (activeTab && selectedUnitId) {
      setCurrentMobileDrawerTab(activeTab);
      const fullScreenTabs = [
        TabEnum.VirtualTour,
        TabEnum.Dollhouse,
        TabEnum.FloorPlanView,
        TabEnum.BalconyView,
        TabEnum.UnitPlan,
        TabEnum.FloorPlan,
      ] as const;
      if ((fullScreenTabs as readonly string[]).includes(activeTab)) {
        setDrawerHeight(MIN_DRAWER_HEIGHT);
      } else {
        setDrawerHeight(MAX_DRAWER_HEIGHT);
      }
    } else {
      if (selectedUnitId && !selectedFloorId) {
        setDrawerHeight(MAX_DRAWER_HEIGHT);
      }

      setCurrentMobileDrawerTab("unit");
    }
  }, [urlActiveTab, currentActiveTab, selectedUnitId, selectedFloorId, MIN_DRAWER_HEIGHT, MAX_DRAWER_HEIGHT]);

  const selectedUnit = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const canvasHeight = isIframeMode
    ? totalHeight
    : totalHeight - drawerHeight + 50;

  const handlePreviousClick = useCallback(() => {
    const prevFunc = navigationFuncsRef.current.prevFunc;
    if (prevFunc) {
      try {
        prevFunc();
      } catch (error) {}
    }
  }, []);

  const handleNextClick = useCallback(() => {
    const nextFunc = navigationFuncsRef.current.nextFunc;
    if (nextFunc) {
      try {
        nextFunc();
      } catch (error) {}
    }
  }, []);

  const handleNavigationChange = useCallback(
    (nextFunc: () => void, prevFunc: () => void) => {
      navigationFuncsRef.current = { nextFunc, prevFunc };
    },
    []
  );

  const updateHeightThrottled = useCallback((height: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setDrawerHeight(height);
    });
  }, []);

  const handleContentTouchStart = (e: React.TouchEvent) => {
    if (!contentRef.current) return;

    const touch = e.touches[0];
    const scrollTop = contentRef.current.scrollTop;

    startY.current = touch.clientY;
    lastScrollY.current = scrollTop;

    const isMaxHeight = drawerHeight >= MAX_DRAWER_HEIGHT;
    const atTop = scrollTop <= 0;

    if (!isMaxHeight || (isMaxHeight && atTop)) {
      setDragging(true);
      setContentScrolling(false);
      startHeight.current = drawerHeight;
    } else {
      setDragging(false);
      setContentScrolling(true);
      return;
    }
  };

  const handleContentTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!contentRef.current) return;

      const touch = e.touches[0];
      const deltaY = startY.current - touch.clientY;

      if (dragging && !contentScrolling) {
        e.preventDefault();
        const slowedDelta = deltaY * 0.8;
        const nextHeight = Math.max(
          MIN_DRAWER_HEIGHT,
          Math.min(MAX_DRAWER_HEIGHT, startHeight.current + slowedDelta)
        );
        updateHeightThrottled(nextHeight);
      } else if (contentScrolling && !dragging) {
        const scrollTop = contentRef.current.scrollTop;
        const atTop = scrollTop <= 0;
        const movingDown = deltaY < 0;

        if (atTop && movingDown) {
          e.preventDefault();
          setContentScrolling(false);
          setDragging(true);
          startHeight.current = drawerHeight;
          startY.current = touch.clientY;
        }
      }
    },
    [
      dragging,
      contentScrolling,
      drawerHeight,
      MAX_DRAWER_HEIGHT,
      updateHeightThrottled,
    ]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setDragging(true);
    setContentScrolling(false);
    startY.current = e.touches[0].clientY;
    startHeight.current = drawerHeight;
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging || contentScrolling) return;

      e.preventDefault();
      const rawDelta = startY.current - e.touches[0].clientY;
      const slowedDelta = rawDelta * 0.8;
      const nextHeight = Math.max(
        MIN_DRAWER_HEIGHT,
        Math.min(MAX_DRAWER_HEIGHT, startHeight.current + slowedDelta)
      );

      updateHeightThrottled(nextHeight);
    },
    [dragging, contentScrolling, MAX_DRAWER_HEIGHT, updateHeightThrottled]
  );

  const handleTouchEnd = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDragging(false);
    setContentScrolling(false);
  }, []);

  useEffect(() => {
    if (dragging && !contentScrolling) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
    } else if (contentScrolling && !dragging) {
      window.addEventListener("touchmove", handleContentTouchMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
    } else {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchmove", handleContentTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchmove", handleContentTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    dragging,
    contentScrolling,
    handleTouchMove,
    handleContentTouchMove,
    handleTouchEnd,
  ]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height:
            isIframeMode
              ? "100vh"
              : currentMobileDrawerTab === "unit"
                ? `${canvasHeight}px`
                : "100vh",
          overflowX: "auto",
          overflowY: "hidden",
          position: "relative",
          flexShrink: 0,
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.3)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.5)",
          },
        }}
      >
        <MobileContentRenderer
          currentMobileDrawerTab={currentMobileDrawerTab}
          canvasHeight={canvasHeight}
          onNavigationChange={handleNavigationChange}
          selectedUnit={selectedUnit}
          selectedFloorId={selectedFloorId}
        />
      </Box>

      {!isIframeMode && (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom: `${drawerHeight + 15}px`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          pointerEvents: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 1,
        }}
      >
        {!shouldHideNavigationButtons && (
          <Box
            sx={{
              position: "absolute",
              left: 8,
              zIndex: 99999,
              bottom: 40,
            }}
          >
            <OpsIconButton
              onClick={handlePreviousClick}
              sx={{
                borderRadius: "50%",
                pointerEvents: "auto",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.8)"
                    : "rgba(245, 245, 247, 0.8)",
                backdropFilter: "blur(4px)",
              }}
            >
              <ArrowBackIosNewRoundedIcon />
            </OpsIconButton>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <NavigationTabBar />
        </Box>

        {!shouldHideNavigationButtons && (
          <Box
            sx={{
              position: "absolute",
              right: 8,
              zIndex: 99999,
              bottom: 40,
            }}
          >
            <OpsIconButton
              onClick={handleNextClick}
              sx={{
                borderRadius: "50%",
                pointerEvents: "auto",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.8)"
                    : "rgba(245, 245, 247, 0.8)",
                backdropFilter: "blur(4px)",
              }}
            >
              <ArrowForwardIosRoundedIcon />
            </OpsIconButton>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${drawerHeight}px`,
          bgcolor: "background.paper",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: "0px -2px 10px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          transition: dragging ? "none" : "height 0.2s ease",
          zIndex: 1299,
        }}
      >
        <Box
          onTouchStart={handleTouchStart}
          sx={{
            height: 40,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            width: "100%",
            minHeight: 40,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 6,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.3)"
                  : "#ccc",
            }}
          />
        </Box>

        <Box
          ref={contentRef}
          onTouchStart={handleContentTouchStart}
          sx={{
            flex: 1,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            pointerEvents: "auto",
            touchAction: drawerHeight >= MAX_DRAWER_HEIGHT ? "auto" : "none",
            overscrollBehavior: "contain",
          }}
        >
          {currentEntityType === EntityTypeEnum.Project ? (
            <StageDrawer />
          ) : (
            <MobileDrawerContent currentTab={currentMobileDrawerTab} />
          )}
        </Box>

        {currentEntityType === EntityTypeEnum.Project ? null : (
          <ComparisonDrawer />
        )}

        <GalleryDrawer />

        <InfoCardDrawer />

        <MapDrawer />

        <VirtualTourDrawer />

        <WorkflowDrawer />

        <ProjectWorkflowDrawer />
      </Box>
        </>
      )}
    </Box>
  );
}
