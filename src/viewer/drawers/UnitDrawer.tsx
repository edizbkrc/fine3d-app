"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { setSelectedUnitId, setUnitDetailDrawerOpen } from "@redux/appSlice";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  Tooltip,
  Chip,
  SwipeableDrawer,
  useTheme,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/IosShare";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { FixedSizeList as List } from "react-window";
import UnitFilter, { FilterValues } from "./UnitFilter";
import { handleNativeShare } from "@helpers/Common/handleNativeShare";
import { IUnitItem } from "../../types/IUnitItem";
import { IPresentationInitResponse } from "../../types/IPresentationInitResponse";
import UnitListItem from "./UnitListItem";
import useViewer from "@/hooks/useViewer";
import { useFavorites } from "@/hooks/useFavorites";
import { EntityTypeEnum } from "@/enums/EntityTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { Apartment } from "@mui/icons-material";
import { useNavigationService } from "@hooks/useNavigationService";

type ViewMode = "card" | "list";

const ScrollableOuter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={{
        ...props.style,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="hide-scrollbar"
    >
      {children}
    </div>
  ),
);
ScrollableOuter.displayName = "ScrollableOuter";

const UnitDrawer = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {
    presentationContentResponse,
    presentationInitResponse,
    tabBarContentResponse,
    selectedUnitId,
    currentEntityType,
    currentEntityId,
  } = useAppSelector((state) => state.AppReducer);
  const { handleUnitClick, handleChangePresentation } = useViewer();
  const units: any[] = useMemo(() => {
    const content = presentationContentResponse;
    if (Array.isArray(content)) return content;
    if (Array.isArray(content?.units)) return content.units;
    return [];
  }, [presentationContentResponse]);
  const initResponse =
    presentationInitResponse || ({} as IPresentationInitResponse);
  const {
    favoritesCount,
    isComparisonDrawerOpen,
    toggleFavorite,
    isUnitFavorited,
    toggleShowFavoritesOnly,
    filterFavoriteUnits,
  } = useFavorites(initResponse?.projectId);
  const navService = useNavigationService();
  const currentProjectStageId = navService.getParam(
    QueryParamEnum.ProjectStageId,
  );
  const t = useTranslations("Common");
  const { customLabel: customAreaLabel, isHidden: isAreaHidden } =
    useUnitAreaFields();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(600);

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
  const [filters, setFilters] = useState<FilterValues>({
    roomCount: [],
    floorRange: [0, 10],
    areaRange: [0, 300],
    status: "",
    direction: [],
  });

  const filteredUnits = useMemo(() => {
    const allUnits = units || [];

    let filteredUnits = [...(allUnits || [])];

    if (currentEntityType === EntityTypeEnum.Block && currentEntityId) {
      filteredUnits = allUnits?.filter(
        (unit: IUnitItem) =>
          unit.block?.id?.toString() === currentEntityId.toString(),
      );
    }

    return filteredUnits?.sort((a: IUnitItem, b: IUnitItem) => {
      const blockNameA = a.block?.name || "";
      const blockNameB = b.block?.name || "";

      if (blockNameA !== blockNameB) {
        return blockNameA.localeCompare(blockNameB);
      }

      const unitNumberA = a.unitNumber || 0;
      const unitNumberB = b.unitNumber || 0;

      return unitNumberA - unitNumberB;
    });
  }, [units, currentEntityType, currentEntityId]);

  const selectedBlockName = useMemo(() => {
    if (
      currentEntityType === EntityTypeEnum.Block &&
      currentEntityId &&
      tabBarContentResponse
    ) {
      const blocks = tabBarContentResponse?.find(
        (item: any) => item.entityName === "Block",
      )?.data;
      const foundedBlock = blocks?.find(
        (block: any) => block.Id === Number(currentEntityId),
      );
      return foundedBlock?.Name ? foundedBlock.Name + " " + t("Block") : "N/A";
    }
    return null;
  }, [currentEntityType, currentEntityId, units]);

  const unitTemplates = useMemo(
    () => initResponse?.unitTemplates || [],
    [initResponse?.unitTemplates],
  );

  const unitTypes = useMemo(
    () => initResponse?.unitTypes || [],
    [initResponse?.unitTypes],
  );

  const getUnitTypeName = useCallback(
    (unitTypeId: number): string => {
      const unitType = unitTypes.find((type) => type.id === unitTypeId);
      return unitType?.name || "N/A";
    },
    [unitTypes],
  );

  const getRoomCount = useCallback(
    (unit: IUnitItem): string => {
      return getUnitTypeName(unit.unitTypeId);
    },
    [getUnitTypeName],
  );

  const getNetArea = useCallback(
    (unit: IUnitItem): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId,
      );

      return templateUnit?.netArea || unit.netArea || 0;
    },
    [unitTemplates],
  );

  const getGrossArea = useCallback(
    (unit: IUnitItem): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId,
      );
      return templateUnit?.grossArea || unit.grossArea || 0;
    },
    [unitTemplates],
  );

  const filteredData = useMemo(() => {
    const baseFilteredData = filteredUnits.filter((unit: IUnitItem) => {
      if (!unit) return false;

      if (filters.roomCount.length > 0) {
        const roomCount = getRoomCount(unit);
        if (!filters.roomCount.includes(roomCount)) {
          return false;
        }
      }

      const floorNumber = unit.floor?.number || 0;
      if (
        floorNumber < filters.floorRange[0] ||
        floorNumber > filters.floorRange[1]
      ) {
        return false;
      }

      const netArea = getNetArea(unit);
      if (
        netArea > 0 &&
        (netArea < filters.areaRange[0] || netArea > filters.areaRange[1])
      ) {
        return false;
      }

      if (filters.status) {
        if (!unit.currentStateId) {
          return false;
        }
        if (unit?.currentStateId.toString() !== filters.status) {
          return false;
        }
      }

      if (filters.direction && filters.direction.length > 0) {
        const unitFacades = unit?.facades || [];
        const hasMatchingFacade = unitFacades.some((facade) =>
          filters.direction.includes(facade.toString()),
        );
        if (!hasMatchingFacade) {
          return false;
        }
      }

      return true;
    });

    return filterFavoriteUnits(baseFilteredData);
  }, [
    filteredUnits,
    filters,
    getRoomCount,
    getNetArea,
    t,
    filterFavoriteUnits,
  ]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "card" ? "list" : "card");
  };

  const handleToggleFavorite = useCallback(
    (unit: IUnitItem) => {
      return toggleFavorite(unit);
    },
    [toggleFavorite],
  );

  const roomOptions = useMemo(() => {
    return [...new Set(filteredUnits.map((unit) => getRoomCount(unit)))].sort();
  }, [filteredUnits, getRoomCount]);

  const filteredUnitStates = useMemo(() => {
    const allStates =
      initResponse?.unitStates?.filter(
        (state) =>
          state.id !== null && state.id !== undefined && state?.filterable,
      ) || [];

    const usedStateIds = new Set(
      filteredUnits.map((unit) => unit?.currentStateId).filter(Boolean),
    );

    return allStates.filter((state) => usedStateIds.has(state.id));
  }, [initResponse?.unitStates, filteredUnits]);

  const directionOptions = useMemo(() => {
    const uniqueFacades = new Set<number>();
    filteredUnits.forEach((unit) => {
      if (unit?.facades && unit.facades.length > 0) {
        unit.facades.forEach((facade: number) => uniqueFacades.add(facade));
      }
    });

    // Değerler API'nin Facade enum'u (1 Kuzey, 2 Güney, 3 Doğu, 4 Batı, 5-8 ara yönler,
    // 9 Hepsi). Eski elle yazılmış tablo farklı bir numaralandırmaya göreydi: 1'i Kuzeydoğu
    // gösteriyor, Doğu (3) ve Güneydoğu (7) cephelerini filtrede hiç listelemiyordu.
    // Kartlar da aynı Common.Facades çevirisini kullanıyor (getFacadeDirection).
    const facadeMap: { [key: number]: string } = Object.fromEntries(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((facade) => [facade, t(`Facades.${facade}`)]),
    );

    return Array.from(uniqueFacades)
      .filter((facade) => facadeMap[facade])
      .sort((a, b) => a - b)
      .map((facade) => ({
        value: facade.toString(),
        label: facadeMap[facade],
      }));
  }, [filteredUnits, t]);

  const selectedUnit = selectedUnitId
    ? filteredUnits.find((unit) => unit.id === selectedUnitId)
    : null;

  const isBlockView = currentEntityType === EntityTypeEnum.Block;

  const handleBackToProject = () => {
    dispatch(setSelectedUnitId(null));
    dispatch(setUnitDetailDrawerOpen(false));

    handleChangePresentation(
      EntityTypeEnum.ProjectStage,
      currentProjectStageId || presentationInitResponse?.initialStageId,
      true,
    );
  };

  const handleShare = useCallback(() => {
    handleNativeShare({
      projectName: presentationInitResponse?.projectName,
      t,
      presentationInitResponse,
    });
  }, [t, selectedUnit, presentationInitResponse?.projectName]);

  const floorMax =
    filteredUnits.length > 0
      ? Math.max(...filteredUnits.map((unit) => unit.floor?.number || 0))
      : 10;
  const areaMax =
    filteredUnits.length > 0
      ? Math.max(...filteredUnits.map((unit) => getNetArea(unit) || 100))
      : 300;

  React.useEffect(() => {
    if (filteredUnits.length > 0) {
      setFilters((prev) => ({
        ...prev,
        floorRange: [0, floorMax],
        areaRange: [0, Math.max(areaMax, prev.areaRange[1])],
      }));
    }
  }, [floorMax, areaMax, filteredUnits.length]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) setListHeight(h);
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewMode]);

  return (
    <Box
      data-tour="unit-drawer"
      sx={{
        bgcolor:
          theme.palette.mode === "dark" ? "rgba(42, 42, 42, 0.95)" : "#fff",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
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
        <Stack direction={"row"} spacing={1} alignItems="center">
            {isBlockView ? (
            <Chip
              icon={<ArrowBackIcon />}
              label={t("GeneralView")}
              onClick={handleBackToProject}
              clickable
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
          ) : (
            <Typography fontSize={18} fontWeight={600}>
              {t("GeneralView")}
            </Typography>
          )}

          {isBlockView && selectedBlockName && (
            <Chip
              label={selectedBlockName}
              icon={<Apartment />}
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
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Tooltip
            title={
              isFullscreen
                ? t("ExitFullscreen") || "Exit Fullscreen"
                : t("Fullscreen") || "Fullscreen"
            }
            arrow
            sx={{
              display: ["none", "none", "block"],
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
            <IconButton onClick={toggleShowFavoritesOnly} color="primary">
              <Badge badgeContent={favoritesCount} color="primary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {isMobile && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.8)"
                : "grey.200",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {filteredData.length} {t("Units")}
          </Typography>

          <Stack direction="row" spacing={1}>
            <IconButton
              data-tour="unit-drawer-filters"
              onClick={toggleFilterDrawer}
              size="small"
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "grey.100",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "grey.300",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 0.95)"
                      : "grey.200",
                },
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={toggleViewMode}
              size="small"
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "grey.100",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.95)"
                    : "grey.300",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 0.95)"
                      : "grey.200",
                },
              }}
            >
              {viewMode === "card" ? (
                <ViewListIcon fontSize="small" />
              ) : (
                <ViewModuleIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        </Stack>
      )}

      {!isMobile && (
        <>
          <UnitFilter
            data-tour="unit-drawer-filters"
            key={`filter-${currentEntityId}-${currentEntityType}`}
            onFilterChange={handleFilterChange}
            roomOptions={roomOptions}
            unitStates={filteredUnitStates}
            directionOptions={directionOptions}
            floorMax={floorMax}
            areaMax={areaMax}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2,
              py: 1.5,
              pb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {filteredData.length} {t("Units")}
            </Typography>

            <ButtonGroup
              size="small"
              variant="outlined"
              sx={{
                overflow: "hidden",
                "& .MuiButton-root": {
                  borderRadius: 0,
                  "&:first-of-type": {
                    borderTopLeftRadius: 24,
                    borderBottomLeftRadius: 24,
                  },
                  "&:last-of-type": {
                    borderTopRightRadius: 24,
                    borderBottomRightRadius: 24,
                  },
                  "&.MuiButton-outlined": {
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.divider,
                    },
                  },
                },
              }}
            >
              <Button
                onClick={() => setViewMode("card")}
                variant={viewMode === "card" ? "contained" : "outlined"}
                color={viewMode === "card" ? "primary" : "inherit"}
                startIcon={<ViewModuleIcon fontSize="small" />}
              >
                {t("Card")}
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "contained" : "outlined"}
                color={viewMode === "list" ? "primary" : "inherit"}
                startIcon={<ViewListIcon fontSize="small" />}
              >
                {t("List")}
              </Button>
            </ButtonGroup>
          </Stack>
        </>
      )}

      <SwipeableDrawer
        anchor="bottom"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onOpen={() => setIsFilterDrawerOpen(true)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80vh",
            backgroundColor: "background.paper",
          },
        }}
        disableSwipeToOpen={false}
      >
        <Box
          sx={{
            width: "100%",
            p: 3,
            paddingBottom: 4,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: "grey.300",
              borderRadius: 2,
              mx: "auto",
              mb: 3,
              cursor: "pointer",
            }}
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {t("Filters")}
            </Typography>

            <IconButton
              onClick={() => setIsFilterDrawerOpen(false)}
              size="small"
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(42, 42, 42, 0.8)"
                    : "grey.100",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(42, 42, 42, 0.8)"
                      : "grey.200",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <UnitFilter
            key={`mobile-filter-${currentEntityId}-${currentEntityType}`}
            onFilterChange={(newFilters) => {
              handleFilterChange(newFilters);
            }}
            roomOptions={roomOptions}
            unitStates={filteredUnitStates}
            directionOptions={directionOptions}
            floorMax={floorMax}
            areaMax={areaMax}
            isCollapsed={false}
          />
        </Box>
      </SwipeableDrawer>

      <Box ref={listContainerRef} sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {viewMode === "list" && (
          <Box
            sx={{
              px: { xs: 1, md: 2 },
              py: { xs: 0.5, md: 1 },
              borderBottom: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
              <Box sx={{ flex: isMobile ? 1.6 : 2, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                >
                  {t("Unit")}
                </Typography>
              </Box>

              <Box sx={{ flex: isMobile ? 1.2 : 1.5, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                >
                  {isMobile ? t("Room").slice(0, 3) : t("Room")}
                </Typography>
              </Box>

              {presentationInitResponse?.showUnitPricesInFine3d ? (
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                  >
                    {t("Price")}
                  </Typography>
                </Box>
              ) : null}

              {/* Liste görünümü kolonu: UnitListItem'daki brüt hücresiyle birlikte gizlenir,
                  yoksa başlıklar satırlarla kayar. Özel ad yoksa kısa "Brüt" korunur. */}
              {!isAreaHidden("grossArea") && (
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                    noWrap
                  >
                    {customAreaLabel("grossArea") ?? t("Gross")}
                  </Typography>
                </Box>
              )}

              <Box sx={{ flex: isMobile ? 0.8 : 1.5, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.65rem", md: "0.875rem" } }}
                >
                  {t("Facade")}
                </Typography>
              </Box>

              <Box sx={{ width: { xs: 32, md: 40 }, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.65rem", md: "0.875rem" } }}
                >
                  ♡
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
        <List
          key={`${viewMode}-${currentEntityId}-${currentEntityType}`}
          height={listHeight}
          width="100%"
          itemCount={(filteredData.length || 0) + (isMobile ? 1 : 2)}
          itemSize={viewMode === "card" ? 200 : 60}
          itemData={{
            items: filteredData.length ? filteredData : [],
            viewMode,
            isUnitFavorited,
            handleToggleFavorite,
            unitTypes: unitTypes,
            getNetArea,
            getGrossArea,
            handleUnitClick,
            presentationInitResponse,
            unitTemplates,
          }}
          style={{
            overflow: "auto",
            willChange: "transform",
          }}
          outerElementType={ScrollableOuter as any}
        >
          {UnitListItem}
        </List>
      </Box>
    </Box>
  );
};

export default React.memo(UnitDrawer);
