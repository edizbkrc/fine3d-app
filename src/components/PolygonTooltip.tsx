"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Fade,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslations } from "next-intl";
import { keyframes } from "@mui/material/styles";

interface PolygonTooltipProps {
  open: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(25, 118, 210, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(25, 118, 210, 0.8));
  }
`;

const PolygonTooltip: React.FC<PolygonTooltipProps> = ({
  open,
  onClose,
  anchorEl,
}) => {
  const t = useTranslations("Common");

  if (!open) return null;

  return (
    <Fade in={open} timeout={500}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          pointerEvents: "none",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          pt: { xs: 8, sm: 10 },
          px: { xs: 1, sm: 3 },
        }}
      >
        <Zoom in={open} timeout={600} style={{ transitionDelay: "200ms" }}>
          <Paper
            elevation={8}
            sx={{
              position: "relative",
              maxWidth: { xs: "calc(100% - 16px)", sm: 380 },
              pointerEvents: "auto",
              borderRadius: 3,
              overflow: "hidden",
              animation: `${pulse} 2s ease-in-out infinite`,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "#fff",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #64b5f6, #42a5f5, #64b5f6)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s linear infinite",
              },
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "200% 0" },
                "100%": { backgroundPosition: "-200% 0" },
              },
            }}
          >
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ p: 3, pt: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    animation: `${glow} 2s ease-in-out infinite`,
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 32, color: "#fff" }} />
                </Box>
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  mb: 1.5,
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {t("PolygonTooltipTitle")}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  mb: 3,
                  lineHeight: 1.6,
                  opacity: 0.95,
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {t("PolygonTooltipMessage")}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={onClose}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  backgroundColor: "#fff",
                  color: "#1976d2",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {t("PolygonTooltipButton")}
              </Button>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                filter: "blur(30px)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                filter: "blur(40px)",
              }}
            />
          </Paper>
        </Zoom>
      </Box>
    </Fade>
  );
};

export default PolygonTooltip;
