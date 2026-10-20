"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import {
  Box,
  Card,
  Typography,
  Fade,
  useTheme,
  IconButton,
} from "@mui/material";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import { IPolygonModel } from "@/types/IPolygonModel";
import { IInfoCard } from "@/types/IInfoCard";
import { EntityTypeEnum } from "@/enums/EntityTypeEnum";
import { NavigationTypeEnum } from "@/enums/NavigationTypeEnum";
import { ShapeTypeEnum } from "@/enums/ShapeTypeEnum";
import {
  setSelectedUnitId,
  setSelectedFloorId,
  setPolygonView,
} from "@redux/appSlice";
import useViewer from "../../hooks/useViewer";
import { useNavigationService } from "@hooks/useNavigationService";
import UnitHoverCard from "./UnitHoverCard";
import StageHoverCard from "./StageHoverCard";
import FloorHoverCard from "./FloorHoverCard";
import BlockHoverCard from "./BlockHoverCard";
import InfoCardPopover from "./InfoCardPopover";
import InfoCardModal from "./InfoCardModal";
import { IPresentationInitResponse } from "@/types/IPresentationInitResponse";
import { toRgba, ALPHA_VALUES } from "@/helpers/Common/colorUtils";
import InfoPoligonIcon from "@/assets/svgs/InfoPoligonIcon";
import { PolygonTypeEnum } from "@enums/PolygonTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { TabEnum } from "@enums/TabEnum";

import CameraswitchIcon from "@mui/icons-material/Cameraswitch";

interface InteractivePolygonsProps {
  polygons: IPolygonModel[];
  containerWidth: number;
  containerHeight: number;
}

export default function InteractivePolygons({
  polygons,
  containerWidth,
  containerHeight,
}: InteractivePolygonsProps) {
  const theme = useTheme();
  const t = useTranslations("Common");
  const dispatch = useAppDispatch();
  const {
    tabBarContentResponse,
    selectedUnitId,
    presentationContentResponse,
    presentationInitResponse,
    polygonsVisible,
    infoCards,
    polygonView,
    projectBlockContent,
  } = useAppSelector((state) => state.AppReducer);

  const {
    handleChangePresentation,
    updateUrlWithParams,
    currentEntityType,
    currentEntityId,
  } = useViewer();
  const navService = useNavigationService();
  const [hoveredPolygon, setHoveredPolygon] = useState<IPolygonModel | null>(
    null
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedInfoCard, setSelectedInfoCard] = useState<IInfoCard | null>(
    null
  );
  const [infoCardModalOpen, setInfoCardModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [animateFromCard, setAnimateFromCard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isBlockView = currentEntityType === EntityTypeEnum.Block;
  const initResponse =
    presentationInitResponse || ({} as IPresentationInitResponse);
  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );
  const unitTypes = useMemo(
    () => initResponse?.unitTypes || [],
    [initResponse?.unitTypes]
  );
  const unitTemplates = useMemo(
    () => initResponse?.unitTemplates || [],
    [initResponse?.unitTemplates]
  );
  const blocks = tabBarContentResponse?.find(
    (item: any) => item.entityName === "Block"
  )?.data;
  const stages = tabBarContentResponse?.find(
    (item: any) => item.entityName === "FineProjectStage"
  )?.data;

  const scaleFactor = useMemo(() => {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleX = containerWidth / baseWidth;
    const scaleY = containerHeight / baseHeight;
    return Math.min(scaleX, scaleY, 1);
  }, [containerWidth, containerHeight]);

  const displayedPolygons = useMemo(() => {
    if (!polygons || polygons.length === 0) return [];
    if (!isBlockView) return polygons;

    return polygons.filter((p) => {
      if (
        (p.entityType === EntityTypeEnum.Unit ||
          p.type === PolygonTypeEnum.Unit) &&
        polygonView === "floor"
      )
        return false;
      if (
        (p.entityType === EntityTypeEnum.Floor ||
          p.type === PolygonTypeEnum.Floor) &&
        polygonView === "unit"
      )
        return false;
      return true;
    });
  }, [polygons, isBlockView, polygonView]);

  const responsiveDimensions = useMemo(() => {
    const minScale = 0.3;
    const effectiveScale = Math.max(scaleFactor, minScale);

    return {
      circleRadius: Math.max(12 * effectiveScale, 8),
      smallCircleRadius: Math.max(5 * effectiveScale, 5),
      strokeWidth: Math.max(2 * effectiveScale, 1),
      fontSize: Math.max(10 * effectiveScale, 8),
      blockFontSize: Math.max(12 * effectiveScale, 9),
      chipWidth: Math.max(70 * effectiveScale, 50),
      chipHeight: Math.max(20 * effectiveScale, 15),
      blockChipWidth: Math.max(80 * effectiveScale, 60),
      blockChipHeight: Math.max(25 * effectiveScale, 18),
      lineLength: Math.max(25 * effectiveScale, 15),
      blockLineLength: Math.max(35 * effectiveScale, 20),
    };
  }, [scaleFactor]);

  useEffect(() => {
    const checkIsMobile = () => {
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768
      );
    };

    setIsMobile(checkIsMobile());

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && hoveredPolygon) {
      const handleTouchStart = (event: TouchEvent) => {
        const target = event.target as Element;
        if (!target.closest("svg")) {
          setHoveredPolygon(null);
        }
      };

      document.addEventListener("touchstart", handleTouchStart);
      return () => document.removeEventListener("touchstart", handleTouchStart);
    }
    return undefined;
  }, [isMobile, hoveredPolygon]);

  useEffect(() => {
    setHoveredPolygon(null);
  }, [presentationContentResponse, tabBarContentResponse, polygons]);

  useEffect(() => {
    setHoveredPolygon(null);
  }, [currentEntityType, currentEntityId]);

  useEffect(() => {
    const handleGlobalMouseLeave = (event: MouseEvent) => {
      const target = event.target as Element;
      try {
        if (!target.closest("svg") && hoveredPolygon) {
          setHoveredPolygon(null);
        }
      } catch (error) {}
    };

    document.addEventListener("mouseleave", handleGlobalMouseLeave);
    return () =>
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
  }, [hoveredPolygon]);

  const convertToScreenCoordinates = useMemo(() => {
    return (point: { x: number; y: number }) => {
      const originalImageWidth = 1920;
      const originalImageHeight = 1080;

      const cameraHeight = 9;
      const fullCanvasAspect = originalImageWidth / originalImageHeight;
      const cameraWidth = cameraHeight * fullCanvasAspect;

      const geometryHeight = 9;
      const geometryWidth = 16;

      const worldX =
        (point.x / originalImageWidth) * geometryWidth - geometryWidth / 2;
      const worldY =
        geometryHeight / 2 - (point.y / originalImageHeight) * geometryHeight;

      const fullCanvasX =
        ((worldX + cameraWidth / 2) / cameraWidth) * originalImageWidth;
      const fullCanvasY =
        ((cameraHeight / 2 - worldY) / cameraHeight) * originalImageHeight;

      const viewportAspect = containerWidth / containerHeight;
      const fullCanvasAspect2 = originalImageWidth / originalImageHeight;

      if (viewportAspect !== fullCanvasAspect2) {
        if (viewportAspect > fullCanvasAspect2) {
          const scale = containerWidth / originalImageWidth;
          const effectiveHeight = originalImageHeight * scale;
          const cropY = (effectiveHeight - containerHeight) / 2;

          const screenX = fullCanvasX * scale;
          const screenY = fullCanvasY * scale - cropY;

          return { x: screenX, y: screenY };
        } else {
          const scale = containerHeight / originalImageHeight;
          const effectiveWidth = originalImageWidth * scale;
          const cropX = (effectiveWidth - containerWidth) / 2;

          const screenX = fullCanvasX * scale - cropX;
          const screenY = fullCanvasY * scale;

          return { x: screenX, y: screenY };
        }
      } else {
        const scaleX = containerWidth / originalImageWidth;
        const scaleY = containerHeight / originalImageHeight;

        return {
          x: fullCanvasX * scaleX,
          y: fullCanvasY * scaleY,
        };
      }
    };
  }, [containerWidth, containerHeight]);

  const createPolygonPath = (points: { x: number; y: number }[]) => {
    const pathString =
      points
        .map((point, index) => {
          const screenPoint = convertToScreenCoordinates(point);
          return `${index === 0 ? "M" : "L"} ${screenPoint.x} ${screenPoint.y}`;
        })
        .join(" ") + " Z";

    return pathString;
  };

  const getPolygonCenterPoint = (points: { x: number; y: number }[]) => {
    const screenPoints = points.map((point) =>
      convertToScreenCoordinates(point)
    );
    const centerX =
      screenPoints.reduce((sum, point) => sum + point.x, 0) /
      screenPoints.length;
    const centerY =
      screenPoints.reduce((sum, point) => sum + point.y, 0) /
      screenPoints.length;

    return { x: centerX, y: centerY };
  };

  const getPolygonTopPoint = (
    points: { x: number; y: number }[],
    offsetX = 0,
    offsetY = 0
  ) => {
    if (!points?.length) return { x: 0, y: 0 };
    const minY = Math.min(...points.map((point) => point.y));
    const centerX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    return convertToScreenCoordinates({
      x: centerX + offsetX,
      y: minY + offsetY,
    });
  };

  const getBlockName = (polygon: IPolygonModel) => {
    if (Number(polygon.entityType) !== EntityTypeEnum.Block) return null;
    const block = blocks?.find(
      (row: any) => Number(row?.Id ?? row?.id) === Number(polygon.relatedEntityId)
    );
    const name = block?.Name ?? block?.name;
    return `${name || polygon.relatedEntityId} ${t("Block")}`;
  };

  const getStageName = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.ProjectStage && stages) {
      const stage = stages.find(
        (stage: any) => stage?.Id === polygon.relatedEntityId
      );
      return stage?.Name || `${t("Stage")} ${polygon.relatedEntityId}`;
    }
    return null;
  };

  const getUnitName = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.Unit && units && selectedUnitId) {
      const selectedUnit = units.find(
        (unit: any) => unit?.id === selectedUnitId
      );
      if (!selectedUnit) return null;
      return selectedUnit?.block?.name + " - " + selectedUnit?.unitNumber;
    }
    return null;
  };

  const getUnitByPolygon = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.Unit && units) {
      return units.find((unit: any) => unit?.id === polygon.relatedEntityId);
    }
    return null;
  };

  const getInfoCardByPolygon = (polygon: IPolygonModel) => {
    if (polygon.navigationType === NavigationTypeEnum.InfoCard && infoCards) {
      return infoCards.find((card: any) => card?.id === polygon.navigationId);
    }
    return null;
  };

  const getStageByPolygon = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.ProjectStage && stages) {
      return stages.find((stage: any) => stage?.Id === polygon.relatedEntityId);
    }
    return null;
  };

  const getUnitStateByPolygon = (polygon: IPolygonModel) => {
    if (
      polygon.entityType === EntityTypeEnum.Unit &&
      units &&
      initResponse?.unitStates
    ) {
      const unit = units.find(
        (unit: any) => unit?.id === polygon.relatedEntityId
      );
      if (unit?.currentStateId) {
        return initResponse.unitStates.find(
          (state: any) => state.id === unit.currentStateId
        );
      }
    }
    return null;
  };

  const getNetArea = (unit: any) => {
    return unit?.netArea || 0;
  };

  const getGrossArea = (unit: any) => {
    return unit?.grossArea || 0;
  };

  const isSelectedUnit = (polygon: IPolygonModel) => {
    return (
     ( polygon.entityType === EntityTypeEnum.Unit ) &&
      selectedUnitId &&
      (polygon.relatedEntityId === selectedUnitId ||
        polygon.navigationId === selectedUnitId)
    );
  };

  const isSelectedFloor = (polygon: IPolygonModel) => {
    const floorIdParam = navService.getParam(QueryParamEnum.FloorId);
    return (
      polygon.entityType === EntityTypeEnum.Floor &&
      floorIdParam &&
      polygon.relatedEntityId?.toString() === floorIdParam
    );
  };

  const isSelectedInfoCard = (polygon: IPolygonModel) => {
    return polygon.navigationType === NavigationTypeEnum.InfoCard;
  };

  const handlePolygonHover = (
    polygon: IPolygonModel,
    event: React.MouseEvent
  ) => {
    setHoveredPolygon(polygon);
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handlePolygonTouch = (
    polygon: IPolygonModel,
    event: React.TouchEvent
  ) => {
    if (!isMobile) return;

    event.preventDefault();
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const touch = event.touches[0];

    setMousePosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    if (hoveredPolygon?.id === polygon.id) {
      setHoveredPolygon(null);
    } else {
      setHoveredPolygon(polygon);
    }
  };

  const handleInfoCardModalOpen = (
    infoCard: IInfoCard,
    position: { x: number; y: number }
  ) => {
    setClickPosition(position);
    setAnimateFromCard(true);
    setSelectedInfoCard(infoCard);
    setHoveredPolygon(null);
    setTimeout(() => {
      setInfoCardModalOpen(true);
    }, 100);
  };

  const handleInfoCardModalClose = () => {
    setSelectedInfoCard(null);
    setInfoCardModalOpen(false);
    setAnimateFromCard(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredPolygon) {
      const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handlePolygonClick = (
    polygon: IPolygonModel,
    event?: React.MouseEvent
  ) => {
    switch (polygon.navigationType) {
      case NavigationTypeEnum.Project:
        handleChangePresentation(EntityTypeEnum.Project, polygon?.navigationId);
        break;
      case NavigationTypeEnum.ProjectStage:
        handleChangePresentation(
          EntityTypeEnum.ProjectStage,
          polygon?.navigationId
        );
        break;
      case NavigationTypeEnum.Block:
        handleChangePresentation(EntityTypeEnum.Block, polygon?.navigationId);
        break;
      case NavigationTypeEnum.Floor:
        if (polygon.navigationId) {
          dispatch(setPolygonView("floor"));
          dispatch(setSelectedFloorId(Number(polygon.navigationId)));
          dispatch(setSelectedUnitId(null));

          navService.navigateToTab(
            TabEnum.FloorPlan,
            polygon.navigationId.toString()
          );
          navService.updateQueryParams({
            [QueryParamEnum.FloorId]: polygon.navigationId.toString(),
            [QueryParamEnum.PolygonView]: "floor",
            [QueryParamEnum.ActiveTab]: TabEnum.FloorPlan,
          });
        }
        break;
      case NavigationTypeEnum.Unit:
        if (polygon.navigationId) {
          // Daire id'leri küçük; tip string de içeriyor çünkü sanal tur id'leri string gelir.
          const unitId = Number(polygon.navigationId);
          if (selectedUnitId === unitId) {
            dispatch(setSelectedUnitId(null));
            navService.closeAllUnitAndFloorDrawers();
            if (currentEntityId) {
              const currentPolygonView = navService.getPolygonView();
              const currentProjectStageId = navService.getParam(
                QueryParamEnum.ProjectStageId
              );
              updateUrlWithParams(
                EntityTypeEnum.Block,
                currentEntityId,
                null,
                currentPolygonView || undefined,
                false,
                false,
                currentProjectStageId
              );
            }
          } else {
            dispatch(setSelectedUnitId(unitId || null));

            navService.openUnitDetailDrawer(unitId);

            if (currentEntityId) {
              const currentProjectStageId = navService.getParam(
                QueryParamEnum.ProjectStageId
              );
              updateUrlWithParams(
                EntityTypeEnum.Block,
                currentEntityId,
                unitId,
                "unit",
                true,
                true,
                currentProjectStageId
              );
            }
          }
        }
        break;
      case NavigationTypeEnum.InfoCard:
        const infoCard = getInfoCardByPolygon(polygon);
        if (infoCard && event) {
          const rect = (
            event.currentTarget as SVGElement
          ).getBoundingClientRect();
          const clickPos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
          handleInfoCardModalOpen(infoCard, clickPos);
        }

        break;
      case NavigationTypeEnum.VirtualTour:
        if (polygon?.navigationId) {
          navService.openVirtualTourById(
            polygon.navigationId.toString(),
            polygon?.navigationValue || undefined
          );
        }
        if ((window as any).openVirtualTourDrawer) {
          (window as any).openVirtualTourDrawer(
            polygon?.navigationId,
            polygon?.navigationValue
          );
        }
        break;
      default:
        break;
    }
  };

  const getPolygonStyles = (polygon: IPolygonModel) => {
    const isHovered = hoveredPolygon?.id === polygon.id;
    const isSelected =
      isSelectedUnit(polygon) ||
      isSelectedFloor(polygon) ||
      isSelectedInfoCard(polygon);

    const shapeType = polygon.shapeType ?? ShapeTypeEnum.Outline;

    if (polygon.entityType === EntityTypeEnum.Unit) {
      const unitState = getUnitStateByPolygon(polygon);
      const unitColor = unitState?.color || "#9e9e9e";
      // Blok görünümünde işaretler görünsün ama arkadaki daireyi kapatmasın
      const showUnitPolygons = polygonsVisible || isBlockView;

      let fillColor = "transparent";
      let strokeColor = "transparent";

      if (isHovered) {
        fillColor = toRgba(unitColor, ALPHA_VALUES.MEDIUM);
        strokeColor = toRgba(unitColor, ALPHA_VALUES.HIGH);
      } else if (shapeType === ShapeTypeEnum.Inline) {
        // İç soluk, border parlak — arkadaki daire okunabilsin
        fillColor = isSelected
          ? toRgba(unitColor, ALPHA_VALUES.MEDIUM)
          : showUnitPolygons
          ? toRgba(unitColor, 0.18)
          : "transparent";

        strokeColor = isSelected
          ? toRgba(unitColor, ALPHA_VALUES.HIGH)
          : showUnitPolygons
          ? toRgba(unitColor, ALPHA_VALUES.HIGH)
          : "transparent";
      } else if (shapeType === ShapeTypeEnum.Outline) {
        fillColor = "transparent";
        strokeColor = isSelected
          ? toRgba(unitColor, ALPHA_VALUES.HIGH)
          : showUnitPolygons
          ? toRgba(unitColor, ALPHA_VALUES.HIGH)
          : "transparent";
      }

      const strokeWidth =
        isHovered || isSelected
          ? responsiveDimensions.strokeWidth * 3
          : showUnitPolygons
          ? responsiveDimensions.strokeWidth * 2
          : responsiveDimensions.strokeWidth * 2;

      const filter = isHovered
        ? `drop-shadow(0 0 12px ${toRgba(
            unitColor,
            ALPHA_VALUES.MEDIUM
          )}) drop-shadow(0 0 20px ${toRgba(unitColor, 0.5)})`
        : isSelected
        ? `drop-shadow(0 0 8px ${toRgba(
            unitColor,
            0.45
          )}) drop-shadow(0 0 12px ${toRgba(unitColor, 0.3)})`
        : showUnitPolygons
        ? `drop-shadow(0 0 4px ${toRgba(unitColor, 0.55)})`
        : "none";

      return { fillColor, strokeColor, strokeWidth, filter };
    }

    if (polygon.navigationType === NavigationTypeEnum.InfoCard) {
      const infoCardColor = "#FF6B35";

      let fillColor = "transparent";
      let strokeColor = "transparent";

      if (isHovered) {
        fillColor = toRgba(infoCardColor, ALPHA_VALUES.MEDIUM_HIGH);
        strokeColor = toRgba(infoCardColor, ALPHA_VALUES.HIGH);
      } else if (shapeType === ShapeTypeEnum.Inline) {
        fillColor = isSelected
          ? toRgba(infoCardColor, ALPHA_VALUES.MEDIUM_HIGH)
          : polygonsVisible
          ? toRgba(infoCardColor, ALPHA_VALUES.MEDIUM_LOW)
          : "transparent";

        strokeColor = isSelected
          ? toRgba(infoCardColor, ALPHA_VALUES.HIGH)
          : polygonsVisible
          ? toRgba(infoCardColor, ALPHA_VALUES.MEDIUM_HIGH)
          : "transparent";
      } else {
        strokeColor = isSelected
          ? toRgba(infoCardColor, ALPHA_VALUES.HIGH)
          : polygonsVisible
          ? toRgba(infoCardColor, ALPHA_VALUES.MEDIUM_HIGH)
          : "transparent";
      }

      const strokeWidth = isSelected
        ? responsiveDimensions.strokeWidth * 3
        : responsiveDimensions.strokeWidth * 2;

      const infoGlow =
        polygonsVisible && !isSelected && !isHovered
          ? `drop-shadow(0 0 8px ${toRgba(
              infoCardColor,
              0.6
            )}) drop-shadow(0 0 12px ${toRgba(infoCardColor, 0.4)})`
          : "none";

      const filter = isSelected
        ? `drop-shadow(0 0 15px ${toRgba(
            infoCardColor,
            ALPHA_VALUES.MEDIUM
          )}) drop-shadow(0 0 25px ${toRgba(infoCardColor, 0.5)})`
        : isHovered
        ? `drop-shadow(0 0 12px ${toRgba(
            infoCardColor,
            0.7
          )}) drop-shadow(0 0 20px ${toRgba(infoCardColor, 0.5)})`
        : infoGlow;

      return { fillColor, strokeColor, strokeWidth, filter };
    }

    let fillColor = "transparent";
    let strokeColor = "transparent";

    if (isHovered) {
      fillColor = toRgba(theme.palette.polygon.main, ALPHA_VALUES.MEDIUM_LOW);
      strokeColor = toRgba(
        theme.palette.polygon.main,
        ALPHA_VALUES.MEDIUM_HIGH
      );
    } else if (shapeType === ShapeTypeEnum.Inline) {
      const neonColor = "#E8E8E0";
      fillColor = isSelected
        ? toRgba(theme.palette.polygon.main, ALPHA_VALUES.MEDIUM_HIGH)
        : polygonsVisible
        ? toRgba(neonColor, 0.1)
        : "transparent";

      strokeColor = isSelected
        ? toRgba(theme.palette.polygon.main, ALPHA_VALUES.MEDIUM_HIGH)
        : polygonsVisible
        ? neonColor
        : "transparent";
    } else {
      const neonColor = "#E8E8E0";
      strokeColor = isSelected
        ? toRgba(theme.palette.polygon.main, ALPHA_VALUES.MEDIUM_HIGH)
        : polygonsVisible
        ? neonColor
        : "transparent";
    }

    const strokeWidth =
      isHovered || isSelected
        ? responsiveDimensions.strokeWidth * 3
        : responsiveDimensions.strokeWidth * 2;

    const neonGlow =
      polygonsVisible && !isSelected
        ? `drop-shadow(0 0 12px rgba(232, 232, 224, 0.8)) drop-shadow(0 0 20px rgba(232, 232, 224, 0.6)) drop-shadow(0 0 30px rgba(232, 232, 224, 0.4))`
        : "none";

    const filter = isHovered
      ? `drop-shadow(0 0 12px ${toRgba(
          theme.palette.polygon.main,
          ALPHA_VALUES.MEDIUM
        )}) drop-shadow(0 0 20px ${toRgba(theme.palette.polygon.main, 0.5)})`
      : neonGlow;

    return { fillColor, strokeColor, strokeWidth, filter };
  };

  const renderUnitChip = (polygon: IPolygonModel) => {
    if (!isSelectedUnit(polygon) || !getUnitName(polygon)) return null;

    const centerPoint = getPolygonCenterPoint(polygon.points);
    const chipColor = "white";

    const circleRadius = Math.max(8 * scaleFactor, 8);
    const lineLength = Math.max(40 * scaleFactor, 50);
    const chipWidth = Math.max(90 * scaleFactor, 90);
    const chipHeight = Math.max(28 * scaleFactor, 25);
    const fontSize = Math.max(12 * scaleFactor, 12);

    return (
      <g key={`unit-chip-${polygon.id}`}>
        <circle
          cx={centerPoint.x}
          cy={centerPoint.y}
          r={circleRadius}
          fill={chipColor}
          stroke={chipColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
          className="blink-animation"
        />

        <line
          x1={centerPoint.x}
          y1={centerPoint.y}
          x2={centerPoint.x}
          y2={centerPoint.y - lineLength}
          stroke={chipColor}
          strokeWidth={Math.max(3 * scaleFactor, 2)}
          style={{ pointerEvents: "none" }}
        />

        <rect
          x={centerPoint.x - chipWidth / 2}
          y={centerPoint.y - lineLength - chipHeight / 2}
          width={chipWidth}
          height={chipHeight}
          rx={chipHeight / 2}
          ry={chipHeight / 2}
          fill={chipColor}
          stroke={chipColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
          }}
        />

        <text
          x={centerPoint.x}
          y={centerPoint.y - lineLength}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: "#333",
            fontSize: `${fontSize}px`,
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {getUnitName(polygon)}
        </text>
      </g>
    );
  };

  const renderBlockLabel = (polygon: IPolygonModel, index: number) => {
    if (Number(polygon.entityType) !== EntityTypeEnum.Block || !getBlockName(polygon)) {
      return null;
    }

    const topPoint = getPolygonTopPoint(
      polygon.points,
      Number(polygon.labelOffsetX ?? 0),
      Number(polygon.labelOffsetY ?? 0)
    );
    const labelColor = "white";
    const textColor = "black";

    return (
      <g key={`block-label-${polygon.id}-${index}`}>
        <circle
          cx={topPoint.x}
          cy={topPoint.y + responsiveDimensions.lineLength * 1.2}
          r={responsiveDimensions.smallCircleRadius}
          fill={labelColor}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        <line
          x1={topPoint.x}
          y1={topPoint.y + responsiveDimensions.lineLength * 1.2}
          x2={topPoint.x}
          y2={topPoint.y - responsiveDimensions.blockLineLength * 0.2}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{ pointerEvents: "none" }}
        />

        <rect
          x={topPoint.x - responsiveDimensions.blockChipWidth / 2}
          y={topPoint.y - responsiveDimensions.blockLineLength * 0.7}
          width={responsiveDimensions.blockChipWidth}
          height={responsiveDimensions.blockChipHeight}
          rx={responsiveDimensions.blockChipHeight * 0.4}
          ry={responsiveDimensions.blockChipHeight * 0.4}
          fill={labelColor}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
          }}
        />

        <text
          x={topPoint.x}
          y={topPoint.y - responsiveDimensions.blockLineLength * 0.35}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: textColor,
            fontSize: `${responsiveDimensions.blockFontSize}px`,
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {getBlockName(polygon)}
        </text>
      </g>
    );
  };

  const renderStageLabel = (polygon: IPolygonModel, index: number) => {
    if (
      polygon.entityType !== EntityTypeEnum.ProjectStage ||
      !getStageName(polygon)
    ) {
      return null;
    }

    const topPoint = getPolygonTopPoint(
      polygon.points,
      Number(polygon.labelOffsetX ?? 0),
      Number(polygon.labelOffsetY ?? 0)
    );
    const labelColor = "white";
    const textColor = "black";
    const stageChipWidth = responsiveDimensions.blockChipWidth * 1.4;
    const stageChipHeight = responsiveDimensions.blockChipHeight * 1.2;
    const stageFontSize = responsiveDimensions.blockFontSize * 1.1;

    return (
      <g key={`stage-label-${polygon.id}-${index}`}>
        <circle
          cx={topPoint.x}
          cy={topPoint.y + responsiveDimensions.lineLength * 1.2}
          r={responsiveDimensions.smallCircleRadius * 1.2}
          fill={labelColor}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth * 1.5}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        <line
          x1={topPoint.x}
          y1={topPoint.y + responsiveDimensions.lineLength * 1.2}
          x2={topPoint.x}
          y2={topPoint.y - responsiveDimensions.blockLineLength * 0.5}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth * 1.5}
          style={{ pointerEvents: "none" }}
        />

        <rect
          x={topPoint.x - stageChipWidth / 2}
          y={topPoint.y - responsiveDimensions.blockLineLength * 1.1}
          width={stageChipWidth}
          height={stageChipHeight}
          rx={stageChipHeight * 0.4}
          ry={stageChipHeight * 0.4}
          fill={labelColor}
          stroke={labelColor}
          strokeWidth={responsiveDimensions.strokeWidth}
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
          }}
        />

        <text
          x={topPoint.x}
          y={topPoint.y - responsiveDimensions.blockLineLength * 0.75}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: textColor,
            fontSize: `${stageFontSize}px`,
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {getStageName(polygon)}
        </text>
      </g>
    );
  };

  const renderPolygon = (polygon: IPolygonModel, index: number) => {
    const styles = getPolygonStyles(polygon);
    const shapeType = polygon.shapeType ?? ShapeTypeEnum.Outline;

    if (polygon.navigationType === NavigationTypeEnum.InfoCard) {
      const point = convertToScreenCoordinates(polygon.points[0]);
      const scaleFactor = Math.min(
        containerWidth / 1920,
        containerHeight / 1080,
        1
      );
      const effectiveScale = Math.max(scaleFactor, 0.3);

      const balloonRadius = Math.max(25 * effectiveScale, 18);
      const stickHeight = Math.max(40 * effectiveScale, 25);
      const stickWidth = Math.max(4 * effectiveScale, 2);
      const bottomCircleRadius = Math.max(8 * effectiveScale, 5);

      const balloonCenterY = point.y - stickHeight - balloonRadius;
      const stickTopY = point.y - stickHeight;

      return (
        <g key={`infocard-balloon-${polygon.id}-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={bottomCircleRadius}
            fill={"#CAC9CB"}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <rect
            x={point.x - stickWidth / 2}
            y={stickTopY}
            width={stickWidth}
            height={stickHeight}
            fill={"#CAC9CB"}
            stroke="none"
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <circle
            cx={point.x}
            cy={balloonCenterY}
            r={balloonRadius}
            fill={"white"}
            stroke="#CAC9CB"
            strokeWidth={4}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <g
            transform={`translate(${point.x - balloonRadius * 0.5}, ${
              balloonCenterY - balloonRadius * 0.5
            })`}
          >
            <foreignObject
              width={balloonRadius}
              height={balloonRadius}
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => handlePolygonHover(polygon, e)}
              onMouseLeave={() => setHoveredPolygon(null)}
              onTouchStart={(e) => handlePolygonTouch(polygon, e)}
              onClick={(e) => handlePolygonClick(polygon, e)}
            >
              <div
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <InfoPoligonIcon sx={{ fontSize: balloonRadius }} />
              </div>
            </foreignObject>
          </g>
        </g>
      );
    }

    if ((polygon.navigationType as any) === NavigationTypeEnum.VirtualTour) {
      const point = convertToScreenCoordinates(polygon.points[0]);
      const scaleFactor = Math.min(
        containerWidth / 1920,
        containerHeight / 1080,
        1
      );
      const effectiveScale = Math.max(scaleFactor, 0.3);

      const balloonRadius = Math.max(25 * effectiveScale, 18);
      const stickHeight = Math.max(40 * effectiveScale, 25);
      const stickWidth = Math.max(4 * effectiveScale, 2);
      const bottomCircleRadius = Math.max(8 * effectiveScale, 5);

      const balloonCenterY = point.y - stickHeight - balloonRadius;
      const stickTopY = point.y - stickHeight;

      return (
        <g key={`virtualtour-balloon-${polygon.id}-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={bottomCircleRadius}
            fill={"#7B2CBF"}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <rect
            x={point.x - stickWidth / 2}
            y={stickTopY}
            width={stickWidth}
            height={stickHeight}
            fill={"#7B2CBF"}
            stroke="none"
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <circle
            cx={point.x}
            cy={balloonCenterY}
            r={balloonRadius}
            fill={"#7B2CBF"}
            stroke="#7B2CBF"
            strokeWidth={4}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />

          <g
            transform={`translate(${point.x - balloonRadius * 0.5}, ${
              balloonCenterY - balloonRadius * 0.5
            })`}
          >
            <foreignObject
              width={balloonRadius}
              height={balloonRadius}
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => handlePolygonHover(polygon, e)}
              onMouseLeave={() => setHoveredPolygon(null)}
              onTouchStart={(e) => handlePolygonTouch(polygon, e)}
              onClick={(e) => handlePolygonClick(polygon, e)}
            >
              <div
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <ThreeDRotationIcon sx={{ fontSize: balloonRadius }} />
              </div>
            </foreignObject>
          </g>
        </g>
      );
    }

    if (shapeType === ShapeTypeEnum.Dot && polygon.points.length > 0) {
      const centerPoint = getPolygonCenterPoint(polygon.points);
      const isHovered = hoveredPolygon?.id === polygon.id;
      const isSelected =
        isSelectedUnit(polygon) ||
        isSelectedFloor(polygon) ||
        isSelectedInfoCard(polygon);

      let dotColor = "#9e9e9e";
      if (polygon.entityType === EntityTypeEnum.Unit) {
        const unitState = getUnitStateByPolygon(polygon);
        dotColor = unitState?.color || "#9e9e9e";
      } else if (
        (polygon.navigationType as any) === NavigationTypeEnum.VirtualTour
      ) {
        dotColor = "#7B2CBF";
      } else {
        dotColor = theme.palette.polygon.main;
      }

      const dotRadius =
        isHovered || isSelected
          ? responsiveDimensions.circleRadius * 1.8
          : responsiveDimensions.circleRadius * 1.5;

      return (
        <g key={`polygon-dot-${polygon.id}-${index}`}>
          <circle
            cx={centerPoint.x}
            cy={centerPoint.y}
            r={dotRadius}
            fill={dotColor}
            stroke={dotColor}
            strokeWidth={responsiveDimensions.strokeWidth}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              transition: "all 0.5s ease-in-out",
              filter: isHovered
                ? `drop-shadow(0 0 12px ${toRgba(
                    dotColor,
                    ALPHA_VALUES.MEDIUM
                  )})`
                : "none",
            }}
            className={
              isSelectedUnit(polygon) || isSelectedFloor(polygon)
                ? "blink-animation"
                : ""
            }
            onMouseEnter={(e) => handlePolygonHover(polygon, e)}
            onMouseLeave={() => setHoveredPolygon(null)}
            onTouchStart={(e) => handlePolygonTouch(polygon, e)}
            onClick={(e) => handlePolygonClick(polygon, e)}
          />
          {(polygon.navigationType as any) ===
            NavigationTypeEnum.VirtualTour && (
            <g
              transform={`translate(${centerPoint.x - dotRadius * 0.5}, ${
                centerPoint.y - dotRadius * 0.5
              })`}
            >
              <foreignObject
                width={dotRadius}
                height={dotRadius}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => handlePolygonHover(polygon, e)}
                onMouseLeave={() => setHoveredPolygon(null)}
                onTouchStart={(e) => handlePolygonTouch(polygon, e)}
                onClick={(e) => handlePolygonClick(polygon, e)}
              >
                <div
                  style={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <CameraswitchIcon sx={{ fontSize: dotRadius * 0.9 }} />
                </div>
              </foreignObject>
            </g>
          )}
        </g>
      );
    }

    return (
      <g key={`polygon-group-${polygon.id}-${index}`}>
        <path
          key={`${polygon.id}-${index}`}
          d={createPolygonPath(polygon.points)}
          fill={styles.fillColor}
          stroke={styles.strokeColor}
          strokeWidth={styles.strokeWidth}
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
            transition: "all 0.5s ease-in-out",
            filter: styles.filter,
          }}
          className={isSelectedUnit(polygon) ? "blink-animation" : ""}
          onMouseEnter={(e) => handlePolygonHover(polygon, e)}
          onMouseLeave={() => setHoveredPolygon(null)}
          onTouchStart={(e) => handlePolygonTouch(polygon, e)}
          onClick={(e) => handlePolygonClick(polygon, e)}
        />
      </g>
    );
  };

  return (
    <>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 998,
        }}
        onMouseMove={handleMouseMove}
      >
        {displayedPolygons
          .filter(
            (polygon) =>
              polygon.navigationType !== NavigationTypeEnum.InfoCard &&
              (polygon.navigationType as any) !== NavigationTypeEnum.VirtualTour
          )
          .map(renderPolygon)}
      </svg>

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1001,
        }}
      >
        {polygons
          .filter(
            (polygon) =>
              polygon.entityType === EntityTypeEnum.Block &&
              getBlockName(polygon)
          )
          .map(renderBlockLabel)}

        {polygons
          .filter(
            (polygon) =>
              polygon.entityType === EntityTypeEnum.ProjectStage &&
              getStageName(polygon)
          )
          .map(renderStageLabel)}
      </svg>

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1005,
        }}
        onMouseMove={handleMouseMove}
      >
        {displayedPolygons
          .filter(
            (polygon) =>
              polygon.navigationType === NavigationTypeEnum.InfoCard ||
              (polygon.navigationType as any) === NavigationTypeEnum.VirtualTour
          )
          .map(renderPolygon)}
      </svg>

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1010,
        }}
      >
        {displayedPolygons
          .filter((polygon) => isSelectedUnit(polygon))
          .map(renderUnitChip)}
      </svg>

      {hoveredPolygon && !isMobile && (
        <Box>
          {hoveredPolygon.entityType === EntityTypeEnum.Unit ? (
            (() => {
              const unit = getUnitByPolygon(hoveredPolygon);
              return unit ? (
                <UnitHoverCard
                  unit={unit}
                  unitTypes={unitTypes || []}
                  getNetArea={getNetArea}
                  getGrossArea={getGrossArea}
                  position={mousePosition}
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                  scaleFactor={scaleFactor}
                  unitTemplate={unitTemplates?.find(
                    (template: any) => template?.id === unit?.templateId
                  )}
                />
              ) : null;
            })()
          ) : hoveredPolygon.entityType === EntityTypeEnum.Floor ? (
            (() => {

              const floorId = hoveredPolygon.relatedEntityId;
              let floorInfo = null;

              for (const unit of units) {
                if (unit.floor?.id === floorId) {
                  floorInfo = unit.floor;
                  break;
                }
              }

              return floorInfo ? (
                <Fade in={!!hoveredPolygon} timeout={150}>
                  <Box>
                    <FloorHoverCard
                      floor={floorInfo}
                      units={units}
                      position={mousePosition}
                      containerWidth={containerWidth}
                      containerHeight={containerHeight}
                      scaleFactor={scaleFactor}
                    />
                  </Box>
                </Fade>
              ) : null;
            })()
          ) : hoveredPolygon.entityType === EntityTypeEnum.ProjectStage ? (
            (() => {
              const stage = getStageByPolygon(hoveredPolygon);
              return stage ? (
                <Fade in={!!hoveredPolygon} timeout={150}>
                  <Box>
                    <StageHoverCard
                      stage={stage}
                      position={mousePosition}
                      containerWidth={containerWidth}
                      containerHeight={containerHeight}
                      scaleFactor={scaleFactor}
                    />
                  </Box>
                </Fade>
              ) : null;
            })()
          ) : hoveredPolygon.entityType === EntityTypeEnum.Block ? (
            (() => {
              const block = projectBlockContent?.find(
                (b: any) => b?.id === hoveredPolygon.relatedEntityId
              );
              return block ? (
                <Fade in={!!hoveredPolygon} timeout={150}>
                  <Box>
                    <BlockHoverCard
                      block={block}
                      position={mousePosition}
                      containerWidth={containerWidth}
                      containerHeight={containerHeight}
                    />
                  </Box>
                </Fade>
              ) : null;
            })()
          ) : Number(hoveredPolygon.navigationType) ===
            NavigationTypeEnum.InfoCard ? (
            <Fade in={!!hoveredPolygon} timeout={200}>
              <Box>
                <InfoCardPopover
                  open={true}
                  anchorEl={null}
                  onClose={() => {}}
                  infoCard={getInfoCardByPolygon(hoveredPolygon) || null}
                  position={mousePosition}
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                  isHoverMode={true}
                />
              </Box>
            </Fade>
          ) : Number(hoveredPolygon.navigationType) ===
            NavigationTypeEnum.VirtualTour ? (
            <Fade in={!!hoveredPolygon} timeout={200}>
              <Box>
                <Card
                  sx={{
                    userSelect: "none",
                    position: "absolute",
                    left: Math.min(
                      Math.max(mousePosition.x + 15, 10),
                      containerWidth - 250 - 10
                    ),
                    top: Math.min(
                      Math.max(mousePosition.y - 60, 10),
                      containerHeight - 80 - 10
                    ),
                    width: 250,
                    backgroundColor: toRgba("#7B2CBF", ALPHA_VALUES.HIGH),
                    color: "white",
                    backdropFilter: "blur(10px)",
                    zIndex: 999999,
                    pointerEvents: "none",
                    transform: "translateZ(0)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        mb: 1,
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      {t("VirtualTour")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        opacity: 0.9,
                        lineHeight: 1.1,
                      }}
                    >
                      {t("ClickToViewProjectVirtualTour")}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Fade>
          ) : null}
        </Box>
      )}
      <InfoCardModal
        open={infoCardModalOpen}
        onClose={handleInfoCardModalClose}
        infoCard={selectedInfoCard}
        startPosition={clickPosition}
        animateFromCard={animateFromCard}
      />
    </>
  );
}
