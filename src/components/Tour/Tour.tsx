"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Backdrop, useTheme, alpha } from "@mui/material";
import { TourStep } from "@/types/ITour";
import TourTooltip from "./TourTooltip";

interface TourProps {
  steps: TourStep[];
  isActive: boolean;

  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;

  currentStepIndex: number;

  autoStart?: boolean;
  showStartButton?: boolean;
  startButtonPosition?: {
    bottom?: number;
    right?: number;
    top?: number;
    left?: number;
  };

  locale: {
    back: string;
    close: string;
    last: string;
    next: string;
    nextLabelWithProgress: string;
    open: string;
    skip: string;
    startTour: string;
  };
}

const Tour: React.FC<TourProps> = ({
  steps,
  isActive,
  onStart,
  onStop,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  currentStepIndex,
  autoStart = false,
  showStartButton = true,
  startButtonPosition = { bottom: 16, right: 16 },
  locale,
}) => {
  const theme = useTheme();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isActive && steps[currentStepIndex]) {
      const currentStep = steps[currentStepIndex];
      const targetElement = document.querySelector(
        currentStep.target
      ) as HTMLElement;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        const tooltipWidth = 400;
        const tooltipHeight = 200;
        const offset = currentStep.offset || 20;

        let top = rect.top + scrollTop;
        let left = rect.left + scrollLeft;

        switch (currentStep.placement) {
          case "top":
            top = rect.top + scrollTop - tooltipHeight - offset;
            left = rect.left + scrollLeft + (rect.width - tooltipWidth) / 2;
            break;
          case "bottom":
            top = rect.bottom + scrollTop + offset;
            left = rect.left + scrollLeft + (rect.width - tooltipWidth) / 2;
            break;
          case "left":
            left = rect.left + scrollLeft - tooltipWidth - offset;
            top = rect.top + scrollTop + (rect.height - tooltipHeight) / 2;
            break;
          case "right":
            left = rect.right + scrollLeft + offset;
            top = rect.top + scrollTop + (rect.height - tooltipHeight) / 2;
            break;
          case "center":
            top = window.innerHeight / 2 + scrollTop - tooltipHeight / 2;
            left = window.innerWidth / 2 + scrollLeft - tooltipWidth / 2;
            break;
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipWidth > windowWidth - 10) {
          left = windowWidth - tooltipWidth - 10;
        }

        if (top < 10) top = 10;
        if (top + tooltipHeight > windowHeight + scrollTop - 10) {
          top = windowHeight + scrollTop - tooltipHeight - 10;
        }

        setTooltipPosition({ top, left });
      } else {
        setTooltipPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        });
      }
    }
  }, [isActive, currentStepIndex, steps]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        onNext();
      } else {
        onComplete();
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  }, [currentStepIndex, steps.length, onNext, onComplete, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;

    if (currentStepIndex > 0) {
      setIsTransitioning(true);

      setTimeout(() => {
        onPrev();

        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 150);
    }
  }, [currentStepIndex, onPrev, isTransitioning]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handleClose = useCallback(() => {
    onStop();
  }, [onStop]);

  const getCurrentStepElement = () => {
    if (!isActive || !steps[currentStepIndex]) return null;
    const currentStep = steps[currentStepIndex];
    return document.querySelector(currentStep.target);
  };

  const getSpotlightStyle = () => {
    const element = getCurrentStepElement();
    if (!element) return {};

    const rect = element.getBoundingClientRect();

    return {
      position: "fixed" as const,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: "8px",
      boxShadow: `0 0 0 9999px ${alpha(theme.palette.common.black, 0.8)}`,
      border: `2px solid ${theme.palette.primary.main}`,
      pointerEvents: "none" as const,
      zIndex: 10000,
    };
  };

  return (
    <>
      {isActive && (
        <>
          <Backdrop
            open={true}
            sx={{
              zIndex: 9999,
              bgcolor:
                currentStepIndex === 0
                  ? alpha(theme.palette.common.black, 0.7)
                  : "transparent",
              animation: "backdropFadeIn 0.3s ease-out",
              "@keyframes backdropFadeIn": {
                "0%": {
                  opacity: 0,
                  bgcolor: "transparent",
                },
                "100%": {
                  opacity: 1,
                  bgcolor:
                    currentStepIndex === 0
                      ? alpha(theme.palette.common.black, 0.7)
                      : "transparent",
                },
              },
            }}
            onClick={handleClose}
          />

          {getCurrentStepElement() && (
            <Box
              sx={{
                ...getSpotlightStyle(),
                animation: "spotlightFadeIn 0.4s ease-out",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "@keyframes spotlightFadeIn": {
                  "0%": {
                    opacity: 0,
                    transform: "scale(0.8)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "scale(1)",
                  },
                },
              }}
            />
          )}

          {steps[currentStepIndex] && !isTransitioning && (
            <TourTooltip
              step={steps[currentStepIndex]}
              stepIndex={currentStepIndex}
              totalSteps={steps.length}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
              onClose={handleClose}
              position={tooltipPosition}
              locale={locale}
              placement={steps[currentStepIndex].placement || "center"}
            />
          )}
        </>
      )}
    </>
  );
};

export default Tour;
