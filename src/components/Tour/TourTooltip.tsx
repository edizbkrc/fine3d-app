"use client";

import React from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { TourStep } from "@/types/ITour";

interface TourTooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  position: { top: number; left: number };
  locale: {
    back: string;
    close: string;
    last: string;
    next: string;
    nextLabelWithProgress: string;
    open: string;
    skip: string;
  };
  placement: string;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
  position,
  locale,
  placement,
}) => {
  const theme = useTheme();

  const getTransformAndArrow = () => {
    switch (placement) {
      case "top":
        return {
          transform: "none",
          arrowStyle: {
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            borderTop: `8px solid ${theme.palette.background.paper}`,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
          },
        };
      case "bottom":
        return {
          transform: "none",
          arrowStyle: {
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            borderBottom: `8px solid ${theme.palette.background.paper}`,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
          },
        };
      case "left":
        return {
          transform: "none",
          arrowStyle: {
            top: "50%",
            right: "-8px",
            transform: "translateY(-50%)",
            borderLeft: `8px solid ${theme.palette.background.paper}`,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
          },
        };
      case "right":
        return {
          transform: "none",
          arrowStyle: {
            top: "50%",
            left: "-8px",
            transform: "translateY(-50%)",
            borderRight: `8px solid ${theme.palette.background.paper}`,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
          },
        };
      case "center":
        return {
          transform: "none",
          arrowStyle: null,
        };
      default:
        return {
          transform: "none",
          arrowStyle: {
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            borderBottom: `8px solid ${theme.palette.background.paper}`,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
          },
        };
    }
  };

  const { transform, arrowStyle } = getTransformAndArrow();

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        top: position.top,
        left: position.left,
        maxWidth: 400,
        zIndex: 10001,
        borderRadius: 2,
        p: 3,
        bgcolor: "background.paper",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transform: transform,
        opacity: 0,
        animation: "tourTooltipFadeIn 0.4s ease-out forwards",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "@keyframes tourTooltipFadeIn": {
          "0%": {
            opacity: 0,
            transform: `${transform} scale(0.9) translateY(-10px)`,
          },
          "100%": {
            opacity: 1,
            transform: `${transform} scale(1) translateY(0)`,
          },
        },
        "&:hover": {
          transform: `${transform} scale(1.02)`,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
        },
        ...(arrowStyle && {
          "&::after": {
            content: '""',
            position: "absolute",
            width: 0,
            height: 0,
            ...arrowStyle,
          },
        }),
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          p: 0.5,
        }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {locale.nextLabelWithProgress
            ?.replace("{step}", (stepIndex + 1).toString())
            .replace("{steps}", totalSteps.toString())}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((stepIndex + 1) / totalSteps) * 100}
          sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
        />
      </Box>

      {step.title && (
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            color: "primary.main",
            fontWeight: 600,
            pr: 2,
          }}
        >
          {step.title}
        </Typography>
      )}

      <Typography
        variant="body2"
        sx={{
          mb: 3,
          lineHeight: 1.6,
          color: "text.primary",
        }}
      >
        {step.content}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          onClick={onSkip}
          size="small"
          sx={{
            color: "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              color: "text.primary",
              transform: "translateY(-1px)",
            },
          }}
        >
          {locale.skip}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          {stepIndex > 0 && (
            <Button
              onClick={onPrev}
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "text.secondary",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "text.primary",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {locale.back}
            </Button>
          )}

          <Button
            onClick={onNext}
            variant="contained"
            size="small"
            endIcon={stepIndex < totalSteps - 1 ? <ArrowForwardIcon /> : null}
            sx={{
              minWidth: 80,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px) scale(1.05)",
                boxShadow: 4,
              },
            }}
          >
            {stepIndex < totalSteps - 1 ? locale.next : locale.last}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TourTooltip;
