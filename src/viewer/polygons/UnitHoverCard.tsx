"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IUnitItem } from "@/types/IUnitItem";
import { IUnitTypeModel } from "@/types/IUnitTypeModel";
import { useFavorites } from "@/hooks/useFavorites";
import { useAppSelector } from "@redux/hooks";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";

interface UnitHoverCardProps {
  unit: IUnitItem;
  unitTypes: IUnitTypeModel[];
  getNetArea: (unit: IUnitItem) => number;
  getGrossArea: (unit: IUnitItem) => number;
  position: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  scaleFactor?: number;
  unitTemplate?: any;
}

const UnitHoverCard: React.FC<UnitHoverCardProps> = ({
  unit,
  unitTypes,
  getNetArea,
  getGrossArea,
  position,
  containerWidth,
  containerHeight,
  scaleFactor = 1,
  unitTemplate,
}) => {
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const [imageError, setImageError] = useState(false);
  const { presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );
  const { toggleFavorite, isUnitFavorited } = useFavorites(
    presentationInitResponse?.projectId
  );
  const isFavorite = isUnitFavorited(unit.id);

  const getRoomName = (unit: IUnitItem): string => {
    const unitType = unitTypes?.find(
      (type: IUnitTypeModel) => type.id === unit.unitTypeId
    );
    return unitType?.name || "N/A";
  };

  const getNetAreaFromTemplate = (unit: IUnitItem): number => {
    return getNetArea ? getNetArea(unit) : unit.netArea || 0;
  };

  const getGrossAreaFromTemplate = (unit: IUnitItem): number => {
    return getGrossArea ? getGrossArea(unit) : unit.grossArea || 0;
  };

  const safeUnitName = String(
    unit?.block?.name + " - " + unit?.unitNumber || "N/A"
  );
  const safeFloor = unit.floor?.number?.toString() || "N/A";
  const safeRoomCount = getRoomName(unit);
  const safeFacadeDirection = getFacadeDirection(unit, t);
  const safeNetArea = String(getNetAreaFromTemplate(unit));
  const safeGrossArea = String(getGrossAreaFromTemplate(unit));

  const minScale = 0.4;
  const effectiveScale = Math.max(scaleFactor, minScale);

  const cardWidth = Math.max(350 * effectiveScale, 220);
  const cardHeight = Math.max(190 * effectiveScale, 120);
  const imageSize = Math.max(150 * effectiveScale, 80);

  const adjustedX = Math.min(
    Math.max(position.x + 15, 10),
    containerWidth - cardWidth - 10
  );

  const adjustedY = Math.min(
    Math.max(position.y - cardHeight - 10, 10),
    containerHeight - cardHeight - 10
  );

  return (
    <Card
      elevation={8}
      sx={{
        userSelect: "none",
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        borderRadius: 3,
        height: cardHeight,
        bgcolor: "background.paper",
        cursor: "pointer",
        zIndex: 999999,
        pointerEvents: "none",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        opacity: 0,
        transform: "scale(0.95)",
        animation: "unitCardFadeIn 0.15s ease-out forwards",
        "@keyframes unitCardFadeIn": {
          "0%": {
            opacity: 0,
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ p: 1.5, height: "100%" }}>
        <Box
          sx={{
            width: imageSize,
            height: imageSize,
            borderRadius: 2,
            bgcolor: "white",
            flexShrink: 0,
            p: 0.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={
              imageError
                ? "/placeholder.png"
                : unitTemplate?.image?.url || "/placeholder.png"
            }
            alt={`Unit ${safeUnitName} floor plan`}
            fill
            style={{
              objectFit: "contain",
            }}
            sizes={`${imageSize}px`}
            onError={() => setImageError(true)}
          />
        </Box>

        <Stack spacing={0.5} sx={{ flex: 1, py: 0.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              fontSize={`${Math.max(16 * effectiveScale, 10)}px`}
              sx={{ lineHeight: 1.2 }}
            >
              {safeUnitName}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(unit);
              }}
              sx={{
                color: isFavorite ? "error.main" : "grey.400",
                "&:hover": {
                  color: "error.main",
                  transform: "scale(1.1)",
                },
                pointerEvents: "auto",
                width: Math.max(24 * effectiveScale, 20),
                height: Math.max(24 * effectiveScale, 20),
                "& .MuiSvgIcon-root": {
                  fontSize: Math.max(20 * effectiveScale, 16),
                },
              }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Stack>

          <Stack spacing={0.3}>
            <Stack direction="row" justifyContent="space-between">
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                sx={{ lineHeight: 1.1 }}
              >
                {t("Floor")}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                sx={{ lineHeight: 1.1 }}
              >
                {safeFloor}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                sx={{ lineHeight: 1.1 }}
              >
                {t("Room")}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                sx={{ lineHeight: 1.1 }}
              >
                {safeRoomCount}
              </Typography>
            </Stack>

            {!isAreaHidden("netArea") && (
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                  sx={{ lineHeight: 1.1 }}
                >
                  {areaLabel("netArea")}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                  sx={{ lineHeight: 1.1 }}
                >
                  {safeNetArea}
                </Typography>
              </Stack>
            )}

            {!isAreaHidden("grossArea") && (
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                  sx={{ lineHeight: 1.1 }}
                >
                  {areaLabel("grossArea")}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                  sx={{ lineHeight: 1.1 }}
                >
                  {safeGrossArea}
                </Typography>
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                sx={{ lineHeight: 1.1, flexShrink: 0 }}
              >
                {t("Facade")}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                fontSize={`${Math.max(12 * effectiveScale, 8)}px`}
                noWrap
                sx={{
                  lineHeight: 1.1,
                  textAlign: "right",
                  maxWidth: 80,
                }}
              >
                {safeFacadeDirection}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default UnitHoverCard;
