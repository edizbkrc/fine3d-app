"use client";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useNavigationService } from "@hooks/useNavigationService";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { enqueueSnackbar } from "notistack";
import VirtualTourInteractiveView from "@/viewer/virtual/VirtualTourInteractiveView";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Chip,
  Card,
  Drawer,
  Tooltip,
  Badge,
  useMediaQuery,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/IosShare";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { IUnitItem } from "../../types/IUnitItem";
import { IUnitTypeModel } from "../../types/IUnitTypeModel";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import {
  setSelectedUnitId,
  setUnitDetailDrawerOpen,
  setUnitFullDetailDrawerOpen,
  toggleComparisonDrawer,
  setCurrentSceneId,
  setActiveTab,
} from "@redux/appSlice";
import { ArrowBack } from "@mui/icons-material";
import FloorIcon from "@/assets/svgs/FloorIcon";
import UnitNumberIcon from "@/assets/svgs/UnitNumberIcon";
import GrossIcon from "@/assets/svgs/GrossIcon";
import useViewer from "@/hooks/useViewer";
import { getCurrencyFormat } from "@helpers/Common/getCurrencyFormat";
import { getFloorText } from "@helpers/Common/getOrdinalNumber";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";
import { handleNativeShare } from "@helpers/Common/handleNativeShare";
import { useFavorites } from "@/hooks/useFavorites";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { TabEnum } from "@enums/TabEnum";

const UnitDetailDrawer: React.FC = () => {
  const {
    unitDetailDrawerOpen,
    presentationContentResponse,
    presentationInitResponse,
    selectedUnitId,
    isComparisonDrawerOpen,
    favorites,
    unitFullDetailDrawerOpen,
    drawerOpen,
    currentSceneId,
  } = useAppSelector((state) => state.AppReducer);
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const dispatch = useAppDispatch();
  const params = useParams<any>();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { locale } = params;
  const navService = useNavigationService();
  const activeTab = useAppSelector((state) => state.AppReducer.activeTab);
  const { handleUnitClick } = useViewer();
  const { toggleFavorite, isUnitFavorited } = useFavorites(
    presentationInitResponse?.projectId,
  );
  const [imageError, setImageError] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 300,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setContainerDimensions({
          width: containerRef.current?.offsetWidth || 400,
          height: containerRef.current?.offsetHeight || 300,
        });
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => window.removeEventListener("resize", updateDimensions);
    }
    return undefined;
  }, [unitDetailDrawerOpen]);

  useEffect(() => {
    if (!selectedUnitId && unitDetailDrawerOpen) {
      dispatch(setUnitDetailDrawerOpen(false));
    }
  }, [selectedUnitId, unitDetailDrawerOpen, dispatch]);

  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse],
  );

  const selectedUnit: IUnitItem | null = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const isFavorite = selectedUnit ? isUnitFavorited(selectedUnit.id) : false;

  const unitTemplates = useMemo(
    () => presentationInitResponse?.unitTemplates || [],
    [presentationInitResponse?.unitTemplates],
  );

  const unitTypes = useMemo(
    () => presentationInitResponse?.unitTypes || [],
    [presentationInitResponse?.unitTypes],
  );

  const selectedUnitState = presentationInitResponse?.unitStates?.find(
    (state) => state.id === selectedUnit?.currentStateId,
  );

  const selectedUnitTemplate = unitTemplates.find(
    (template) => template.id === selectedUnit?.templateId,
  );

  const handleClose = () => {
    dispatch(setUnitFullDetailDrawerOpen(false));
    dispatch(setUnitDetailDrawerOpen(false));
    dispatch(setSelectedUnitId(null));
    dispatch(setCurrentSceneId(null));
    dispatch(setActiveTab(null));
    handleUnitClick(null);
    navService.removeParams(
      QueryParamEnum.SelectedUnitId,
      QueryParamEnum.ActiveTab,
      QueryParamEnum.SceneId,
      QueryParamEnum.VirtualTourId,
      QueryParamEnum.VirtualTourOpen,
      QueryParamEnum.FloorId,
    );
  };

  const handleShare = useCallback(() => {
    handleNativeShare({
      unitName: selectedUnit?.block?.name + " " + selectedUnit?.unitNumber,
      projectName: presentationInitResponse?.projectName,
      t,
      presentationInitResponse,
    });
  }, [t, selectedUnit, presentationInitResponse?.projectName]);

  const handleImageClick = () => {
    if (unitFullDetailDrawerOpen) {
      dispatch(setUnitFullDetailDrawerOpen(false));
      navService.removeParams(QueryParamEnum.ActiveTab);
      return;
    }

    navService.navigateToUnitTab(TabEnum.UnitPlan);
  };

  const getRoomName = (unit: IUnitItem | null): string => {
    const unitType = unitTypes?.find(
      (type: IUnitTypeModel) => type.id === unit?.unitTypeId,
    );
    return unitType?.name || "N/A";
  };

  const getNetArea = useCallback(
    (unit: IUnitItem | null): number => {
      return selectedUnitTemplate?.netArea || unit?.netArea || 0;
    },
    [selectedUnitTemplate],
  );

  const getGrossArea = useCallback(
    (unit: IUnitItem | null): number => {
      return selectedUnitTemplate?.grossArea || unit?.grossArea || 0;
    },
    [selectedUnitTemplate],
  );

  const getselectedUnitImageUrl = useCallback(() => {
    const originalUrl = selectedUnitTemplate?.image?.url ?? "";
    return resolveCdnImageUrl(originalUrl, { preferMobile: isMobile });
  }, [isMobile, selectedUnitTemplate]);

  const renderInfoItem = useCallback(
    (label: string, value: string | number, index: number) => {
      const valueStr = String(value);
      const shouldTruncate = valueStr.split(",").length > 2;
      const displayValue = shouldTruncate
        ? valueStr.split(",").slice(0, 2).join(",") + "..."
        : valueStr;

      return (
        <Box
          // Anahtar etiket değil sıra: alan adları artık projeye özel girilebiliyor ve başka bir
          // satırın etiketiyle (ör. "Durum") çakışabilir; çakışan key React uyarısı verir.
          key={index}
          sx={{
            width: "calc(50% - 8px)",
            mb: 1,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 1, px: 1 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              {label}
            </Typography>
            <Tooltip
              title={shouldTruncate ? valueStr : ""}
              arrow
              placement="top"
            >
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: "0.8rem",
                  cursor: shouldTruncate ? "help" : "default",
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayValue}
              </Typography>
            </Tooltip>
          </Stack>
          <Divider sx={{ borderStyle: "dashed" }} />
        </Box>
      );
    },
    [],
  );

  return (
    <Drawer
      id="unit-detail-drawer"
      variant="persistent"
      open={unitDetailDrawerOpen && drawerOpen}
      anchor="right"
      slotProps={{
        paper: {
          sx: {
            marginRight: ["0px", "0px", "60px"],
            width: ["100%", "100%", "400px"],
            backgroundColor: "background.default",
          },
        },
      }}
      sx={{
        zIndex: 1390,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
        }}
      >
        <Chip
          icon={<ArrowBack sx={{ cursor: "pointer" }} />}
          onClick={handleClose}
          label={
            selectedUnit?.block?.name
              ? selectedUnit.block.name + " " + t("Block")
              : "N/A"
          }
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            height: 32,
            borderRadius: 3,
            cursor: "pointer",
            "& .MuiChip-icon": {
              fontSize: "1rem",
              ml: 1,
            },
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip
            title={
              isFullscreen
                ? t("ExitFullscreen") || "Exit Fullscreen"
                : t("Fullscreen") || "Fullscreen"
            }
            arrow
            sx={{
              display: ["none", "none", "inline-flex"],
            }}
          >
            <IconButton onClick={handleFullscreen} color="primary">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("ShareLink") || "Share Link"} arrow>
            <IconButton onClick={handleShare} color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isComparisonDrawerOpen ? t("ShowAll") : t("CompareUnits")}
            arrow
          >
            <IconButton
              onClick={() => {
                dispatch(toggleComparisonDrawer());
              }}
              color="primary"
            >
              <Badge badgeContent={favorites?.length} color="primary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack
        direction={"column"}
        sx={{ px: 2, py: 2, pb: 0, backgroundColor: "card2.main" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography color="primary.main" sx={{ fontSize: 18 }}>
              {String((selectedUnit?.block.name || "") + " - ")}
              <Typography
                fontWeight={600}
                component="span"
                sx={{ fontWeight: "Bold", fontSize: 18 }}
              >
                {selectedUnit?.unitNumber || "" || "N/A"}
              </Typography>
            </Typography>
            <Chip
              label={selectedUnitState?.name || "N/A"}
              sx={{
                backgroundColor: selectedUnitState?.color,
                color: "white",
                fontSize: "0.75rem",
                borderRadius: 3,
              }}
              size="small"
            />
            {presentationInitResponse?.showUnitPricesInFine3d ? (
              <Chip
                label={getCurrencyFormat(selectedUnit?.price)}
                color="primary"
                sx={{
                  fontSize: "0.75rem",
                }}
                size="small"
              />
            ) : null}
          </Stack>
          <IconButton
            onClick={() => selectedUnit && toggleFavorite(selectedUnit)}
            sx={{
              color: isFavorite ? "error.main" : "grey.400",
              "&:hover": {
                color: "error.main",
              },
            }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ py: 3 }}>
          <Card
            elevation={0}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "card.main",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={"center"}
              spacing={1}
            >
              <FloorIcon color="action" sx={{ fontSize: 21 }} />
              <Typography variant="body2" textAlign={"center"}>
                {selectedUnit?.floor?.number
                  ? getFloorText(selectedUnit.floor.number, locale || "en", t)
                  : "N/A"}
              </Typography>
            </Stack>
          </Card>

          <Card
            elevation={0}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "card.main",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={"center"}
              spacing={1}
            >
              <UnitNumberIcon color="action" sx={{ fontSize: 21 }} />
              <Typography variant="body2">
                {getRoomName(selectedUnit) || "N/A"}
              </Typography>
            </Stack>
          </Card>

          {/* Brüt alanı gizleyen projede (ör. dükkan) çip hiç çizilmez; kalan kartlar flex:1 ile yayılır. */}
          {!isAreaHidden("grossArea") && (
            <Card
              elevation={0}
              sx={{
                flex: 1,
                p: 1,
                borderRadius: 2,
                textAlign: "center",
                backgroundColor: "card.main",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={"center"}
                spacing={1}
              >
                <GrossIcon color="action" sx={{ fontSize: 21 }} />
                <Typography variant="body2">{`${getGrossArea(
                  selectedUnit,
                )} m²`}</Typography>
              </Stack>
            </Card>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pt: 0,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            width: "100%",
            height: 300,
            cursor:
              activeTab === TabEnum.VirtualTour ||
              activeTab === TabEnum.UnitPlan
                ? undefined
                : "pointer",
          }}
          onClick={
            activeTab === TabEnum.VirtualTour || activeTab === TabEnum.UnitPlan
              ? undefined
              : handleImageClick
          }
        >
          {activeTab === TabEnum.VirtualTour ||
          activeTab === TabEnum.UnitPlan ? (
            <VirtualTourInteractiveView
              containerWidth={containerDimensions.width}
              containerHeight={containerDimensions.height}
              currentSceneId={currentSceneId || undefined}
              onSceneChange={
                activeTab === TabEnum.VirtualTour
                  ? (sceneId) => {
                      dispatch(setCurrentSceneId(sceneId));
                      if (sceneId) {
                        navService.updateQueryParams(
                          { [QueryParamEnum.SceneId]: sceneId },
                          { scroll: false },
                        );
                      } else {
                        navService.removeParams(QueryParamEnum.SceneId);
                      }
                    }
                  : activeTab === TabEnum.UnitPlan
                    ? (sceneId) => {
                        if (sceneId) {
                          dispatch(setCurrentSceneId(sceneId));
                          dispatch(setActiveTab(TabEnum.VirtualTour));
                          navService.updateQueryParams(
                            {
                              [QueryParamEnum.ActiveTab]: TabEnum.VirtualTour,
                              [QueryParamEnum.SceneId]: sceneId,
                            },
                            { scroll: false },
                          );
                        }
                      }
                    : undefined
              }
              EntityType={EntityTypeEnum.UnitTemplate}
              EntityId={selectedUnit?.templateId?.toString()}
              defaultImage={getselectedUnitImageUrl()}
            />
          ) : (
            <Image
              src={
                imageError
                  ? "/placeholder.png"
                  : getselectedUnitImageUrl() || "/placeholder.png"
              }
              alt={`Unit ${selectedUnit?.name} floor plan`}
              fill
              onError={() => setImageError(true)}
              style={{
                padding: "16px",
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            p: 2,
            pb: "230px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            {renderInfoItem(t("Status"), selectedUnitState?.name || "N/A", 0)}
            {presentationInitResponse?.showUnitPricesInFine3d &&
              renderInfoItem(
                t("Price"),
                getCurrencyFormat(selectedUnit?.price),
                1,
              )}
            {renderInfoItem(t("Stage"), selectedUnit?.stage?.name || "N/A", 2)}
            {renderInfoItem(t("Block"), selectedUnit?.block?.name || "N/A", 3)}
            {renderInfoItem(t("UnitType"), selectedUnit?.name || "N/A", 4)}
            {!isAreaHidden("netArea") &&
              renderInfoItem(
                areaLabel("netArea"),
                `${getNetArea(selectedUnit)} m²`,
                5,
              )}
            {!isAreaHidden("grossArea") &&
              renderInfoItem(
                areaLabel("grossArea"),
                `${getGrossArea(selectedUnit)} m²`,
                6,
              )}
            {!isAreaHidden("indoorArea") &&
              renderInfoItem(
                areaLabel("indoorArea"),
                `${selectedUnit?.indoorArea} m²`,
                7,
              )}
            {renderInfoItem(
              t("Facade"),
              getFacadeDirection(selectedUnit, t),
              8,
            )}
            {renderInfoItem(t("Room"), getRoomName(selectedUnit) || "N/A", 9)}
            {selectedUnitTemplate?.specifications?.map((spec, index) =>
              renderInfoItem(spec.name, spec.value || "N/A", 10 + index),
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UnitDetailDrawer;
