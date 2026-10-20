"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TourStep } from "@/types/ITour";
import { useProjectTour } from "@hooks/useProjectTour";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { stopTour, startTour as startTourAction } from "@redux/appSlice";
import { Tour, useTour } from "./Tour";

interface ProjectStageTourProps {
  autoStart?: boolean;
  showTourButton?: boolean;
}

const ProjectStageTour: React.FC<ProjectStageTourProps> = ({
  autoStart = false,
  showTourButton = true,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const tourActive = useAppSelector((state) => state.AppReducer.tourActive);

  const {
    hasSeenTour,
    shouldAutoStart,
    startTour: hookStartTour,
    stopTour: hookStopTour,
    completeTour,
  } = useProjectTour("projectStageTourSeen");

  const localizedTourSteps: TourStep[] = [
    {
      target: "body",
      content: t("Tour.WelcomeMessage"),
      title: `👋 ${t("Tour.Welcome")}`,
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".scene3d-container",
      content: t("Tour.MainSceneDescription"),
      title: t("Tour.MainSceneTitle"),
      placement: "right",
      offset: 10,
    },
    {
      target: '[data-tour="viewer-toolbar"]',
      content: t("Tour.ViewerToolbarDescription"),
      title: t("Tour.ViewerToolbarTitle"),
      placement: "bottom",
      offset: 20,
    },
    {
      target: '[data-tour="navigation-controls"]',
      content: t("Tour.NavigationControlsDescription"),
      title: t("Tour.NavigationControlsTitle"),
      placement: "top",
      offset: 70,
    },
    {
      target: '[data-tour="navigation-controls-left"]',
      content: t("Tour.NavigationLeftDescription"),
      title: t("Tour.NavigationLeftTitle"),
      placement: "top",
      offset: 80,
    },
    {
      target: '[data-tour="navigation-controls-right"]',
      content: t("Tour.NavigationRightDescription"),
      title: t("Tour.NavigationRightTitle"),
      placement: "top",
      offset: 80,
    },
    {
      target: '[data-tour="stage-drawer"]',
      content: t("Tour.StageDrawerDescription"),
      title: t("Tour.StageDrawerTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="stage-drawer-items"]',
      content: t("Tour.StageDrawerItemsDescription"),
      title: t("Tour.StageDrawerItemsTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="sidebar-menu"]',
      content: t("Tour.SidebarMenuDescription"),
      title: t("Tour.SidebarMenuTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="drawer-toggle"]',
      content: t("Tour.DrawerToggleDescription"),
      title: t("Tour.DrawerToggleTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="home-button"]',
      content: t("Tour.HomeButtonDescription"),
      title: t("Tour.HomeButtonTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="gallery-button"]',
      content: t("Tour.GalleryButtonDescription"),
      title: t("Tour.GalleryButtonTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="info-button"]',
      content: t("Tour.InfoButtonDescription"),
      title: t("Tour.InfoButtonTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="map-button"]',
      content: t("Tour.MapButtonDescription"),
      title: t("Tour.MapButtonTitle"),
      placement: "left",
    },
    {
      target: '[data-tour="language-button"]',
      content: t("Tour.LanguageButtonDescription"),
      title: t("Tour.LanguageButtonTitle"),
      placement: "left",
    },
    {
      target: ".scene3d-container",
      content: t("Tour.TourCompletedDescription"),
      title: t("Tour.TourCompletedTitle"),
      placement: "center",
    },
  ];

  const tour = useTour({
    steps: localizedTourSteps,
    onComplete: () => {
      completeTour();
      dispatch(stopTour());
    },
    onSkip: () => {
      completeTour();
      dispatch(stopTour());
    },
    onStop: () => {
      completeTour();
      dispatch(stopTour());
    },
  });

  useEffect(() => {
    if (tourActive && !tour.isActive) {
      tour.startTour();
    } else if (!tourActive && tour.isActive) {
      tour.stopTour();
    }
  }, [tourActive, tour]);

  useEffect(() => {
    if ((autoStart || shouldAutoStart) && !hasSeenTour && !tourActive) {
      const timer = setTimeout(() => {
        hookStartTour();
        dispatch(startTourAction());
      }, 1000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [
    autoStart,
    shouldAutoStart,
    hasSeenTour,
    tourActive,
    hookStartTour,
    dispatch,
  ]);

  const localizedTourLocale = {
    back: t("Tour.Back"),
    close: t("Tour.Close"),
    last: t("Tour.Last"),
    next: t("Tour.Next"),
    nextLabelWithProgress:
      locale === "tr" ? "İleri ({step} / {steps})" : "Next ({step} / {steps})",
    open: t("Tour.Open"),
    skip: t("Tour.Skip"),
    startTour: t("Tour.StartTour") || "Start Tour",
  };

  const handleStart = () => {
    dispatch(startTourAction());
  };

  return (
    <Tour
      steps={localizedTourSteps}
      isActive={tour.isActive}
      onStart={handleStart}
      onStop={tour.stopTour}
      onNext={tour.nextStep}
      onPrev={tour.prevStep}
      onSkip={tour.skipTour}
      onComplete={tour.completeTour}
      currentStepIndex={tour.currentStepIndex}
      autoStart={autoStart}
      showStartButton={showTourButton}
      locale={localizedTourLocale}
    />
  );
};

export default ProjectStageTour;
