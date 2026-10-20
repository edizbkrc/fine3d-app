import { useState, useCallback } from "react";
import { TourStep } from "@/types/ITour";

interface UseTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  onStop?: () => void;
}

interface UseTourReturn {
  isActive: boolean;
  currentStepIndex: number;

  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;

  goToStep: (stepIndex: number) => void;
  resetTour: () => void;

  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const useTour = ({
  steps,
  onComplete,
  onSkip,
  onStop,
}: UseTourProps): UseTourReturn => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    onStop?.();
  }, [onStop]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    onSkip?.();
  }, [onSkip]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    onComplete?.();
  }, [onComplete]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [steps.length]
  );

  const resetTour = useCallback(() => {
    setCurrentStepIndex(0);
  }, []);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrev = currentStepIndex > 0;

  return {
    isActive,
    currentStepIndex,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    goToStep,
    resetTour,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
  };
};
