"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { useSearchParams } from "next/navigation";
import {
  Box,
  ButtonBase,
  useMediaQuery,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  useTheme,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GridViewIcon from "@mui/icons-material/GridView";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { TabEnum } from "@enums/TabEnum";
import {
  setSelectedUnitId,
  setPolygonView,
  setSelectedFloorId,
} from "@redux/appSlice";
import { useNavigationService } from "@hooks/useNavigationService";
import useViewer from "@hooks/useViewer";
import { IUnitItem } from "@/types/IUnitItem";
import { getAvailableTabs } from "../drawers/UnitFullDetailDrawer";
import UnitViewIcon from "@/assets/svgs/UnitViewIcon";
import FloorViewIcon from "@/assets/svgs/FloorViewIcon";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactElement;
  type: "chip" | "button" | "text" | "selector";
  onClick?: () => void;
}

const NavigationTabBar: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navService = useNavigationService();
  const { handleChangePresentation } = useViewer();
  const t = useTranslations("Common");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const searchParams = useSearchParams();
  const [projectsMenuAnchor, setProjectsMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [blocksMenuAnchor, setBlocksMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const {
    currentEntityType,
    currentEntityId,
    selectedUnitId,
    selectedFloorId,
    presentationInitResponse,
    presentationContentResponse,
    tabBarContentResponse,
    polygonView,
    activeTab,
    galleryDrawerOpen,
    mapDrawerOpen,
    infoCardDrawerOpen,
    virtualTourDrawerOpen,
    workflowDrawerOpen,
    projectWorkflowDrawerOpen,
    isComparisonDrawerOpen,
  } = useAppSelector((state) => state.AppReducer);

  const currentProjectStageId = navService.getCurrentProjectStageId();

  const urlActiveTab = searchParams?.get("activeTab");
  const effectiveActiveTab = urlActiveTab || activeTab;

  useEffect(() => {
    const polygonViewParam = searchParams.get("polygonView");
    if (polygonViewParam === "unit" || polygonViewParam === "floor") {
      if (polygonView !== polygonViewParam) {
        dispatch(setPolygonView(polygonViewParam));
      }
    }
  }, [searchParams, polygonView, dispatch]);

  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );

  const selectedUnit: IUnitItem | null = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const currentBlock = useMemo(() => {
    if (!tabBarContentResponse?.[0]?.data || !selectedUnit?.block?.id)
      return null;
    return tabBarContentResponse[0].data.find(
      (item: any) => item.Id === selectedUnit.block.id
    );
  }, [tabBarContentResponse, selectedUnit]);

  const unitAvailableTabs = useMemo(() => {
    if (!selectedUnit) return [];
    return getAvailableTabs(
      selectedUnit,
      t,
      presentationInitResponse?.unitTemplates || []
    );
  }, [selectedUnit, t, presentationInitResponse?.unitTemplates]);

  const projectStages = useMemo(() => {
    const stageData = tabBarContentResponse?.find(
      (item: any) => item.entityName === "FineProjectStage"
    );
    return stageData?.data || [];
  }, [tabBarContentResponse]);

  const blocks = useMemo(() => {
    return tabBarContentResponse?.[0]?.data || [];
  }, [tabBarContentResponse]);

  const selectedFloor = useMemo(() => {
    if (!selectedFloorId || !units) return null;

    for (const unit of units) {
      if (unit.floor?.id === selectedFloorId) {
        return unit.floor;
      }
    }
    return null;
  }, [selectedFloorId, units]);

  const tabItems: TabItem[] = useMemo(() => {
    const items: TabItem[] = [];

    items.push({
      id: "project-name",
      label: presentationInitResponse?.projectName || t("ProjectView"),
      icon: <AccountBalanceIcon sx={{ fontSize: 18 }} />,
      type: "chip",
      onClick: () => {
        navService.closeUnitFullDetailDrawer();
        dispatch(setSelectedFloorId(null));
        handleChangePresentation(
          EntityTypeEnum.ProjectStage,
          currentProjectStageId || presentationInitResponse?.initialStageId
        );
      },
    });

    if (polygonView === "floor" && currentEntityType === EntityTypeEnum.Block) {
      if (blocks.length > 1) {
        items.push({
          id: "blocks-selector",
          label: t("Blocks"),
          icon: <GridViewIcon sx={{ fontSize: 20 }} />,
          type: "selector",
          onClick: () => {},
        });
      }

      const currentBlockItem = blocks.find((b: any) => b.Id == currentEntityId);
      if (currentBlockItem) {
        items.push({
          id: "block-name",
          label: `${currentBlockItem.Name} ${t("Block")}`,
          icon: <ApartmentIcon sx={{ fontSize: 20 }} />,
          type: "text",
        });
      }

      if (selectedFloor) {
        const floorLabel =
          selectedFloor.name ||
          (selectedFloor.number
            ? `${selectedFloor.number}. ${t("Floor")}`
            : t("Floor"));
        items.push({
          id: "floor-name",
          label: floorLabel,
          type: "text",
          icon: <FloorViewIcon sx={{ fontSize: 18 }} />,
        });
      } else if (selectedFloorId) {
        items.push({
          id: "floor-name",
          label: t("Floor"),
          type: "text",
          icon: <FloorViewIcon sx={{ fontSize: 18 }} />,
        });
      }

      if (selectedFloorId) {
        items.push({
          id: TabEnum.FloorPlan,
          label: t("FloorPlan"),
          icon: <FloorViewIcon />,
          type: "button",
          onClick: () => {
            navService.navigateToTab(
              TabEnum.FloorPlan,
              selectedFloorId.toString()
            );
          },
        });
      }

      items.push({
        id: "polygon-view-switch",
        label: "",
        type: "button",
        onClick: () => {},
      });

      return items;
    }

    if (selectedUnit && currentEntityType === EntityTypeEnum.Block) {
      if (blocks.length > 1) {
        items.push({
          id: "blocks-selector",
          label: t("Blocks"),
          icon: <GridViewIcon sx={{ fontSize: 20 }} />,
          type: "selector",
          onClick: () => {},
        });
      }

      if (currentBlock) {
        items.push({
          id: "block-name",
          label: `${currentBlock.Name} ${t("Block")}`,
          icon: <ApartmentIcon sx={{ fontSize: 18 }} />,
          type: "chip",
          onClick: () => {
            handleChangePresentation(EntityTypeEnum.Block, currentBlock.Id);
          },
        });
      }

      const unitLabel = currentBlock
        ? `${currentBlock.Name} - ${selectedUnit.unitNumber}`
        : selectedUnit.name || `Unit ${selectedUnit.unitNumber}`;

      const unitState = presentationInitResponse?.unitStates?.find(
        (state) => state.id === selectedUnit.currentStateId
      );
      const statusColor = unitState?.color || theme.palette.success.main;

      items.push({
        id: "unit-name",
        label: unitLabel,
        type: "text",
        icon: (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: statusColor,
            }}
          />
        ),
      });
      unitAvailableTabs
        .filter((tab) => tab.id !== TabEnum.FloorPlanView)
        .forEach((tab) => {
          items.push({
            id: tab.id,
            label: tab.label,
            icon: tab.icon,
            type: "button",
            onClick: () => {
              navService.navigateToUnitTab(tab.id);
            },
          });
        });

      items.push({
        id: TabEnum.FloorPlan,
        label: t("FloorPlan"),
        icon: <FloorViewIcon />,
        type: "button",
        onClick: () => {
          if (selectedUnit.floor?.id) {
            navService.navigateToTab(TabEnum.FloorPlan);
          }
        },
      });

      return items;
    }

    if (
      currentEntityType === EntityTypeEnum.Block &&
      !selectedUnit &&
      polygonView === "unit"
    ) {
      if (blocks.length > 1) {
        items.push({
          id: "blocks-selector",
          label: t("Blocks"),
          icon: <GridViewIcon sx={{ fontSize: 20 }} />,
          type: "selector",
          onClick: () => {},
        });
      }

      const currentBlockItem = blocks.find((b: any) => b.Id == currentEntityId);
      if (currentBlockItem) {
        items.push({
          id: "block-name",
          label: `${currentBlockItem.Name} ${t("Block")}`,
          icon: <ApartmentIcon sx={{ fontSize: 20 }} />,
          type: "text",
        });
      }

      items.push({
        id: "polygon-view-switch",
        label: "",
        type: "button",
        onClick: () => {},
      });

      return items;
    }

    if (currentEntityType === EntityTypeEnum.ProjectStage) {
      if (blocks.length > 0) {
        items.push({
          id: "blocks-selector",
          label: t("Blocks"),
          icon: <GridViewIcon sx={{ fontSize: 20 }} />,
          type: "selector",
          onClick: () => {},
        });
      }

      return items;
    }

    if (currentEntityType === EntityTypeEnum.Project) {
      if (projectStages.length > 0) {
        items.push({
          id: "projects-selector",
          label: t("ProjectStages"),
          icon: <AccountBalanceIcon sx={{ fontSize: 20 }} />,
          type: "selector",
          onClick: () => {},
        });
      }

      return items;
    }

    return items;
  }, [
    currentEntityType,
    currentEntityId,
    selectedUnit,
    selectedFloor,
    currentBlock,
    unitAvailableTabs,
    blocks,
    projectStages,
    presentationInitResponse,
    t,
    polygonView,
  ]);

  const handleProjectsMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setProjectsMenuAnchor((prev) => (prev ? null : event.currentTarget));
  };

  const handleBlocksMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setBlocksMenuAnchor((prev) => (prev ? null : event.currentTarget));
  };

  const handleProjectsMenuClose = (
    event?: object,
    reason?: string,
  ) => {
    // Buton üstüne tıklanınca backdrop önce kapanıp toggle'ı bozmasın
    if (
      reason === "backdropClick" &&
      event &&
      "target" in event &&
      projectsMenuAnchor?.contains(event.target as Node)
    ) {
      return;
    }
    setProjectsMenuAnchor(null);
  };

  const handleBlocksMenuClose = (
    event?: object,
    reason?: string,
  ) => {
    if (
      reason === "backdropClick" &&
      event &&
      "target" in event &&
      blocksMenuAnchor?.contains(event.target as Node)
    ) {
      return;
    }
    setBlocksMenuAnchor(null);
  };

  const handleProjectStageSelect = (stageId: string) => {
    handleChangePresentation(EntityTypeEnum.ProjectStage, stageId);
    handleProjectsMenuClose();
  };

  const handleBlockSelect = (blockId: string) => {
    handleChangePresentation(EntityTypeEnum.Block, blockId);
    handleBlocksMenuClose();
  };

  const activeIndex = useMemo(() => {
    if (effectiveActiveTab) {
      return tabItems.findIndex((item) => item.id === effectiveActiveTab);
    }
    return -1;
  }, [effectiveActiveTab, tabItems]);

  const isVisible = useMemo(() => {
    if (
      galleryDrawerOpen ||
      mapDrawerOpen ||
      infoCardDrawerOpen ||
      virtualTourDrawerOpen ||
      workflowDrawerOpen ||
      projectWorkflowDrawerOpen ||
      isComparisonDrawerOpen
    ) {
      return false;
    }
    return (
      selectedUnit !== null ||
      currentEntityType === EntityTypeEnum.Block ||
      currentEntityType === EntityTypeEnum.ProjectStage ||
      currentEntityType === EntityTypeEnum.Project
    );
  }, [
    selectedUnit,
    currentEntityType,
    galleryDrawerOpen,
    mapDrawerOpen,
    infoCardDrawerOpen,
    virtualTourDrawerOpen,
    workflowDrawerOpen,
    projectWorkflowDrawerOpen,
    isComparisonDrawerOpen,
  ]);

  if (!isVisible || tabItems.length === 0) return null;

  return (
    <>
      <Fade in={isVisible} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            bottom: isMobile ? -10 : 24,
            left: isMobile ? "50%" : isTablet ? "45%" : "50%",
            transform: "translateX(-50%)",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(42, 42, 42, 0.9)"
                : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderRadius: isTablet ? "18px" : "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: isTablet ? "flex-start" : "center",
            gap: isTablet ? 1 : 1.5,
            p: isTablet ? 0.75 : 1,
            maxWidth: isTablet ? "100%" : "80vw",
            zIndex: 1401,
          }}
        >
          {tabItems.map((item, index) => {
            const isActive = activeIndex === index;

            if (item.type === "chip") {
              const showLabel =
                !isTablet ||
                (item.id === "project-name" &&
                  currentEntityType !== EntityTypeEnum.Block);
              return (
                <Chip
                  key={item.id}
                  icon={item.icon}
                  label={showLabel ? item.label : ""}
                  onClick={item.onClick}
                  sx={{
                    height: isTablet ? 32 : 36,
                    minWidth:
                      showLabel && isTablet
                        ? "auto"
                        : isTablet
                        ? "32px"
                        : "100px",
                    width:
                      showLabel && isTablet
                        ? "auto"
                        : isTablet
                        ? "32px"
                        : "auto",
                    bgcolor: "primary.main",
                    borderRadius: isTablet ? "16px" : "18px",
                    color: "white",
                    fontSize: isTablet ? "12px" : "14px",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiChip-icon": {
                      color: "white",
                      fontSize: isTablet ? 18 : 20,
                      margin: showLabel || !isTablet ? undefined : 0,
                    },
                    "& .MuiChip-label": {
                      padding: showLabel || !isTablet ? undefined : 0,
                    },
                  }}
                />
              );
            }

            if (item.type === "text") {
              return (
                <Typography
                  key={item.id}
                  sx={{
                    fontSize: isTablet ? "12px" : "14px",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: item.onClick ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.label}
                </Typography>
              );
            }

            if (item.type === "selector") {
              if (
                isTablet &&
                item.id === "blocks-selector" &&
                currentEntityType === EntityTypeEnum.Block
              ) {
                return (
                  <Tooltip key={item.id} title={item.label} arrow>
                    <ButtonBase
                      onClick={handleBlocksMenuToggle}
                      aria-expanded={Boolean(blocksMenuAnchor)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        transition: "all 0.2s",
                        "& svg": {
                          color: theme.palette.text.primary,
                          fontSize: 18,
                        },
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "white",
                          "& svg": {
                            color: "white",
                          },
                        },
                      }}
                    >
                      {item.icon}
                    </ButtonBase>
                  </Tooltip>
                );
              }
              return (
                <ButtonBase
                  key={item.id}
                  onClick={(e) => {
                    if (item.id === "projects-selector") {
                      handleProjectsMenuToggle(e);
                    } else if (item.id === "blocks-selector") {
                      handleBlocksMenuToggle(e);
                    }
                  }}
                  aria-expanded={
                    item.id === "blocks-selector"
                      ? Boolean(blocksMenuAnchor)
                      : item.id === "projects-selector"
                      ? Boolean(projectsMenuAnchor)
                      : undefined
                  }
                  sx={{
                    height: isTablet ? 32 : 36,
                    px: isTablet ? 1.5 : 2,
                    borderRadius: isTablet ? "16px" : "18px",
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: isTablet ? "12px" : "14px",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                  <KeyboardArrowUpIcon
                    sx={{
                      fontSize: isTablet ? 14 : 18,
                      ml: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  />
                </ButtonBase>
              );
            }

            if (item.id === "polygon-view-switch") {
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: theme.palette.action.hover,
                    borderRadius: isTablet ? "16px" : "18px",
                    p: isTablet ? 0.4 : 0.5,
                    height: isTablet ? 32 : 36,
                  }}
                >
                  <ButtonBase
                    onClick={() => {
                      dispatch(setPolygonView("unit"));
                      dispatch(setSelectedFloorId(null));
                      dispatch(setSelectedUnitId(null));
                      navService.removeParams("floorId");
                      navService.updateQueryParams(
                        { polygonView: "unit" },
                        { scroll: false }
                      );
                    }}
                    sx={{
                      px: isTablet ? 1.25 : 2,
                      height: isTablet ? 24 : 28,
                      borderRadius: isTablet ? "12px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      bgcolor:
                        polygonView === "unit"
                          ? theme.palette.background.paper
                          : "transparent",
                      color: theme.palette.text.primary,
                      transition: "all 0.2s",
                      boxShadow:
                        polygonView === "unit"
                          ? "0 1px 3px rgba(0,0,0,0.12)"
                          : "none",
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <UnitViewIcon
                      sx={{
                        fontSize: isTablet ? 15 : 18,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: isTablet ? "11px" : "13px",
                        fontWeight: 500,
                      }}
                    >
                      {t("UnitView")}
                    </Typography>
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => {
                      dispatch(setPolygonView("floor"));
                      dispatch(setSelectedUnitId(null));
                      dispatch(setSelectedFloorId(null));
                      navService.removeParams("selectedUnitId", "activeTab");
                      navService.updateQueryParams(
                        { polygonView: "floor" },
                        { scroll: false }
                      );
                    }}
                    sx={{
                      px: isTablet ? 1.25 : 2,
                      height: isTablet ? 24 : 28,
                      borderRadius: isTablet ? "12px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      bgcolor:
                        polygonView === "floor"
                          ? theme.palette.background.paper
                          : "transparent",
                      color: theme.palette.text.primary,
                      transition: "all 0.2s",
                      boxShadow:
                        polygonView === "floor"
                          ? "0 1px 3px rgba(0,0,0,0.12)"
                          : "none",
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <FloorViewIcon
                      sx={{
                        fontSize: isTablet ? 15 : 18,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: isTablet ? "11px" : "13px",
                        fontWeight: 500,
                      }}
                    >
                      {t("FloorView")}
                    </Typography>
                  </ButtonBase>
                </Box>
              );
            }

            if (isActive) {
              return (
                <Chip
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  onClick={item.onClick}
                  sx={{
                    height: isTablet ? 32 : 36,
                    bgcolor: "primary.main",
                    borderRadius: isTablet ? "16px" : "18px",
                    color: "white",
                    fontSize: isTablet ? "12px" : "14px",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiChip-icon": {
                      color: "white",
                      fontSize: isTablet ? 18 : 20,
                    },
                    "& svg": {
                      color: "white",
                      fontSize: isTablet ? 18 : 20,
                    },
                  }}
                />
              );
            }

            return (
              <Tooltip key={item.id} title={item.label} arrow>
                <ButtonBase
                  onClick={item.onClick}
                  sx={{
                    width: isTablet ? 32 : 36,
                    height: isTablet ? 32 : 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    transition: "all 0.2s",
                    "& svg": {
                      color: theme.palette.text.primary,
                      fontSize: isTablet ? 18 : 20,
                    },
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      "& svg": {
                        color: "white",
                      },
                    },
                  }}
                >
                  {item.icon}
                </ButtonBase>
              </Tooltip>
            );
          })}
        </Box>
      </Fade>

      <Menu
        anchorEl={projectsMenuAnchor}
        open={Boolean(projectsMenuAnchor)}
        onClose={handleProjectsMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            mt: -1,
            borderRadius: "16px",
            minWidth: 200,
            maxHeight: 400,
            boxShadow: theme.shadows[8],
            color: theme.palette.text.primary,
          },
        }}
      >
        {projectStages.map((stage: any) => (
          <MenuItem
            key={stage.id}
            onClick={() => handleProjectStageSelect(stage.id)}
            selected={stage.id == currentProjectStageId}
            sx={{
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
              color: theme.palette.text.primary,
            }}
          >
            <Typography variant="body2">{stage.name}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={blocksMenuAnchor}
        open={Boolean(blocksMenuAnchor)}
        onClose={handleBlocksMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            mt: -1,
            borderRadius: "16px",
            minWidth: 200,
            maxHeight: 400,
            boxShadow: theme.shadows[8],
            color: theme.palette.text.primary,
          },
        }}
      >
        {blocks.map((block: any) => (
          <MenuItem
            key={block.Id}
            onClick={() => handleBlockSelect(block.Id)}
            selected={block.Id == currentEntityId}
            sx={{
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
              color: theme.palette.text.primary,
            }}
          >
            <Typography variant="body2">
              {block.Name} {t("Block")}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NavigationTabBar;
