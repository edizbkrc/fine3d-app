"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Box, Card, Typography, useTheme } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";

interface StageHoverCardProps {
  stage: any;
  position: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  scaleFactor: number;
}

const StageHoverCard: React.FC<StageHoverCardProps> = ({
  stage,
  position,
  containerWidth,
  containerHeight,
  scaleFactor,
}) => {
  const theme = useTheme();
  const t = useTranslations("Common");

  const effectiveScale = Math.max(scaleFactor, 0.3);
  const cardWidth = Math.max(300 * effectiveScale, 250);
  const cardHeight = Math.max(140 * effectiveScale, 100);

  const adjustedX = Math.min(
    Math.max(position.x + 15, 10),
    containerWidth - cardWidth - 10
  );
  const adjustedY = Math.min(
    Math.max(position.y - 60, 10),
    containerHeight - cardHeight - 10
  );

  return (
    <Card
      sx={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        bgcolor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        zIndex: 999999,
        pointerEvents: "none",
        transform: "translateZ(0)",
        boxShadow: theme.shadows[8],
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: Math.max(18 * effectiveScale, 14),
            fontWeight: 700,
            mb: 2,
            color: theme.palette.primary.main,
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          {stage.Name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              flex: 1,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)"
                  : "linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)",
              color: theme.palette.text.primary,
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
              boxShadow:
                "0px 8px 24px rgba(30, 41, 59, 0.4), 0px 2px 8px rgba(47, 61, 94, 0.2)",
            }}
          >
            <BusinessIcon
              sx={{
                fontSize: Math.max(20 * effectiveScale, 16),
                mb: 0.5,
                color: "white",
                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: Math.max(16 * effectiveScale, 13),
                fontWeight: 700,
                lineHeight: 1,
                mb: 0.3,
                color: "white",
              }}
            >
              {stage.blockCount || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: Math.max(10 * effectiveScale, 8),
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t("Block")}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              background:
                "linear-gradient(135deg, rgba(47, 61, 94, 0.8) 0%, rgba(47, 61, 94, 0.6) 100%)",
              color: "white",
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
              boxShadow: "0px 4px 12px rgba(47, 61, 94, 0.3)",
            }}
          >
            <HomeIcon
              sx={{
                fontSize: Math.max(20 * effectiveScale, 16),
                mb: 0.5,
                color: "white",
                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: Math.max(16 * effectiveScale, 13),
                fontWeight: 700,
                lineHeight: 1,
                mb: 0.3,
                color: "white",
              }}
            >
              {stage.unitCount || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: Math.max(10 * effectiveScale, 8),
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t("Unit")}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default StageHoverCard;
