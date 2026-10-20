"use client";
import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  Tooltip,
  useTheme,
} from "@mui/material";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IUnitItem } from "@/types/IUnitItem";
import { IUnitTypeModel } from "@/types/IUnitTypeModel";
import { Circle } from "@mui/icons-material";
import { getCurrencyFormat } from "@helpers/Common/getCurrencyFormat";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";

const UnitListItem = ({ index, style, data }: any) => {
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const theme = useTheme();

  const {
    items,
    viewMode,
    isUnitFavorited,
    handleToggleFavorite,
    unitTypes,
    getNetArea,
    getGrossArea,
    handleUnitClick,
    presentationInitResponse,
    unitTemplates,
  } = data;

  const showUnitPricesInFine3d =
    presentationInitResponse?.showUnitPricesInFine3d;

  const [imageError, setImageError] = React.useState(false);
  const unit: IUnitItem = items[index];
  const isFavorite = isUnitFavorited ? isUnitFavorited(unit?.id) : false;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const unitTemplate = unitTemplates?.find(
    (template: any) => template?.id === unit?.templateId
  );
  useEffect(() => {
    setImageError(false);
  }, [unitTemplate?.image?.url]);

  const getselectedUnitImageUrl = useCallback((): string | undefined => {
    if (!unitTemplate?.image?.url) {
      return undefined;
    }
    return resolveCdnImageUrl(unitTemplate.image.url, {
      preferMobile: isMobile,
    });
  }, [unitTemplate, isMobile]);

  if (index >= items.length) {
    return (
      <div style={style}>
        <Box sx={{ height: "60px" }}></Box>
      </div>
    );
  }

  if (!unit || typeof unit !== "object" || !unit.name) {
    return (
      <div style={style}>
        <Box sx={{ p: 1 }}>
          <Card elevation={0} sx={{ borderRadius: 2, height: "190px" }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography color="text.secondary">{t("Loading")}</Typography>
            </Box>
          </Card>
        </Box>
      </div>
    );
  }

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

  const selectedUnitState = presentationInitResponse?.unitStates?.find(
    (state: any) => state.id === unit?.currentStateId
  );

  const safeUnitName = String(
    unit?.block?.name + " - " + unit?.unitNumber || "N/A"
  );
  const safeFloor = unit.floor?.number?.toString() || "1";
  const safeRoomCount = getRoomName(unit);
  const safeFacadeDirection = getFacadeDirection(unit, t);
  const safeNetArea = String(getNetAreaFromTemplate(unit));
  const safeGrossArea = String(getGrossAreaFromTemplate(unit));
  const safePrice = getCurrencyFormat(unit?.price || 0);

  if (viewMode === "card") {
    return (
      <div style={style}>
        <Box sx={{ p: 1 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              height: "190px",
              bgcolor: "background.paper",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
            onClick={() => handleUnitClick && handleUnitClick(unit)}
          >
            <Stack direction="row" spacing={2} sx={{ p: 2, height: "100%" }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                  flexShrink: 0,
                  p: 2,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={
                    imageError
                      ? "/placeholder.png"
                      : getselectedUnitImageUrl() || "/placeholder.png"
                  }
                  alt={`Unit ${safeUnitName} floor plan`}
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                  sizes="(max-width: 768px) 100vw, 150px"
                  priority={index < 5}
                  onError={() => setImageError(true)}
                />
              </Box>

              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Tooltip title={selectedUnitState?.name || "N/A"}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Circle
                        sx={{ color: selectedUnitState?.color }}
                        fontSize="inherit"
                      />
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        fontSize="1rem"
                      >
                        {safeUnitName}
                      </Typography>
                    </Stack>
                  </Tooltip>

                  <Tooltip
                    title={
                      isFavorite
                        ? t("RemoveFromFavorites")
                        : t("AddToFavorites")
                    }
                    arrow
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite && handleToggleFavorite(unit);
                      }}
                      sx={{
                        color: isFavorite ? "error.main" : "grey.400",
                        "&:hover": {
                          color: "error.main",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Stack spacing={0.25}>
                  {showUnitPricesInFine3d ? (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {t("Price")}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {safePrice}
                      </Typography>
                    </Stack>
                  ) : null}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {t("Floor")}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {safeFloor}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {t("Room")}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {safeRoomCount}
                    </Typography>
                  </Stack>

                  {!isAreaHidden("netArea") && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {areaLabel("netArea")}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {safeNetArea}
                      </Typography>
                    </Stack>
                  )}

                  {!isAreaHidden("grossArea") && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {areaLabel("grossArea")}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {safeGrossArea}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {t("Facade")}
                    </Typography>
                    <Tooltip
                      title={String(safeFacadeDirection)}
                      arrow
                      placement="top"
                    >
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "help",
                        }}
                      >
                        {String(safeFacadeDirection).split(",").length > 2
                          ? String(safeFacadeDirection)
                              .split(",")
                              .slice(0, 2)
                              .join(",") + "..."
                          : String(safeFacadeDirection)}
                      </Typography>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </div>
    );
  }

  return (
    <div style={style}>
      <Box sx={{ px: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            py: { xs: 0.5, md: 1 },
            height: { xs: "50px", md: "58px" },
            display: "flex",
            alignItems: "center",
            borderBottom: "1px dashed",
            borderColor: "grey.300",
            cursor: "pointer",
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
          onClick={() => handleUnitClick && handleUnitClick(unit)}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              sx={{ flex: 1, width: "100%" }}
            >
              <Box sx={{ flex: isMobile ? 1.6 : 2, textAlign: "center" }}>
                <Stack direction="row" alignItems="center">
                  <Circle
                    sx={{ color: selectedUnitState?.color }}
                    fontSize="inherit"
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" }, ml: 1 }}
                  >
                    {safeUnitName}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: isMobile ? 1.2 : 1.5, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
                  noWrap
                >
                  {isMobile ? safeRoomCount.slice(0, 3) : safeRoomCount}
                </Typography>
              </Box>

              {showUnitPricesInFine3d ? (
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
                  >
                    {safePrice}
                  </Typography>
                </Box>
              ) : null}

              {/* Başlık (UnitDrawer) ile aynı koşul; ikisi birlikte gizlenmezse kolonlar kayar. */}
              {!isAreaHidden("grossArea") && (
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
                  >
                    {getGrossAreaFromTemplate(unit)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ flex: isMobile ? 0.8 : 1.5, textAlign: "center" }}>
                <Tooltip
                  title={String(safeFacadeDirection)}
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.7rem", md: "0.75rem" },
                      cursor: "help",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(safeFacadeDirection).split(",").length > 2
                      ? String(safeFacadeDirection)
                          .split(",")
                          .slice(0, 2)
                          .join(",") + "..."
                      : String(safeFacadeDirection)}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>

            <Tooltip
              title={
                isFavorite ? t("RemoveFromFavorites") : t("AddToFavorites")
              }
              arrow
            >
              <IconButton
                size={isMobile ? "small" : "small"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite && handleToggleFavorite(unit);
                }}
                sx={{
                  color: isFavorite ? "error.main" : "grey.400",
                  "&:hover": {
                    color: "error.main",
                    transform: "scale(1.1)",
                  },
                  p: { xs: 0.5, md: 1 },
                }}
              >
                {isFavorite ? (
                  <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
                ) : (
                  <FavoriteBorderIcon
                    fontSize={isMobile ? "small" : "medium"}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </div>
  );
};
export default UnitListItem;
