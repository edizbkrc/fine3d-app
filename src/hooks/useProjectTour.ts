import { useState, useCallback, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";

export const useProjectTour = (tourKey: string = "projectTourSeen") => {
  const [tourActive, setTourActive] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  const { drawerOpen } = useAppSelector((state) => state.AppReducer);

  useEffect(() => {
    const tourSeen = localStorage.getItem(tourKey);
    if (tourSeen === "true") {
      setHasSeenTour(true);
    }
  }, [tourKey]);

  const startTour = useCallback(() => {
    setTourActive(true);
  }, []);

  const stopTour = useCallback(() => {
    setTourActive(false);
  }, []);

  const completeTour = useCallback(() => {
    setTourActive(false);
    setHasSeenTour(true);
    localStorage.setItem(tourKey, "true");
  }, [tourKey]);

  const resetTour = useCallback(() => {
    setHasSeenTour(false);
    setTourActive(false);
    localStorage.removeItem(tourKey);
  }, [tourKey]);

  const shouldAutoStart = !hasSeenTour && !drawerOpen;

  return {
    tourActive,
    hasSeenTour,
    shouldAutoStart,
    startTour,
    stopTour,
    completeTour,
    resetTour,
  };
};
