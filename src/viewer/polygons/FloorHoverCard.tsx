import React from "react";
import { Box, Card, Typography, Divider } from "@mui/material";
import { useTranslations } from "next-intl";
import { toRgba, ALPHA_VALUES } from "@/helpers/Common/colorUtils";

interface FloorHoverCardProps {
  floor: any;
  units: any[];
  position: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  scaleFactor: number;
}

const FloorHoverCard: React.FC<FloorHoverCardProps> = ({
  floor,
  units,
  position,
  containerWidth,
  containerHeight,
  scaleFactor,
}) => {
  const t = useTranslations("Common");

  const minScale = 0.3;
  const effectiveScale = Math.max(scaleFactor, minScale);

  const cardWidth = Math.max(280 * effectiveScale, 200);
  const cardMaxHeight = Math.max(350 * effectiveScale, 250);
  const fontSize = Math.max(14 * effectiveScale, 11);
  const smallFontSize = Math.max(12 * effectiveScale, 9);
  const padding = Math.max(16 * effectiveScale, 10);

  const adjustedX = Math.min(
    Math.max(position.x + 15, 10),
    containerWidth - cardWidth - 10
  );

  const adjustedY = Math.min(
    Math.max(position.y - 60, 10),
    containerHeight - cardMaxHeight - 10
  );

  const floorUnits = units.filter((unit: any) => unit.floor?.id === floor.id);

  return (
    <Card
      sx={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        maxHeight: cardMaxHeight,
        backgroundColor: (theme) =>
          toRgba(theme.palette.polygon.main, ALPHA_VALUES.HIGH),
        color: "white",
        backdropFilter: "blur(10px)",
        zIndex: 99999,
        pointerEvents: "none",
        transform: "translateZ(0)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "auto",
      }}
    >
      <Box sx={{ p: padding / 8 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: `${fontSize + 2}px`,
            fontWeight: 700,
            mb: 1,
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {floor.name ||
            (floor.number ? `${floor.number}. ${t("Floor")}` : t("Floor"))}
        </Typography>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 1 }} />

        {floorUnits.length > 0 ? (
          <>
            <Typography
              variant="body2"
              sx={{
                fontSize: `${smallFontSize}px`,
                mb: 0.5,
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              {t("Units")} ({floorUnits.length}):
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                maxHeight: cardMaxHeight - 120,
                overflowY: "auto",
              }}
            >
              {floorUnits.map((unit: any) => (
                <Box
                  key={unit.id}
                  sx={{
                    fontSize: `${smallFontSize - 1}px`,
                    px: 0.8,
                    py: 0.3,
                    bgcolor: "rgba(255,255,255,0.15)",
                    borderRadius: "4px",
                    opacity: 0.85,
                  }}
                >
                  {unit.unitNumber}
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: `${smallFontSize}px`,
              opacity: 0.7,
              fontStyle: "italic",
            }}
          >
            {t("NoUnitsOnThisFloor")}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default FloorHoverCard;
