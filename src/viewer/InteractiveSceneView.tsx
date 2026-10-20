"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { useNavigationService } from "@hooks/useNavigationService";
import { useQuerySync } from "@hooks/useQuerySync";
import { Box, Card, Typography, Fade } from "@mui/material";
import { IPolygonModel } from "@/types/IPolygonModel";
import { EntityTypeEnum } from "@/enums/EntityTypeEnum";
import { ShapeTypeEnum } from "@/enums/ShapeTypeEnum";
import {
  setSelectedUnitId,
} from "@redux/appSlice";
import useViewer from "../hooks/useViewer";
import UnitHoverCard from "./polygons/UnitHoverCard";
import { IPresentationInitResponse } from "@/types/IPresentationInitResponse";
import { NavigationTypeEnum } from "@enums/NavigationTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";

interface InteractiveSceneViewProps {
  polygons: IPolygonModel[];
  containerWidth: number;
  containerHeight: number;
  imageWidth?: number;
  imageHeight?: number;
  imageUrl?: string;
  sceneType?: "floorPlan" | "dollhouse";
}

interface PolygonCardProps {
  polygon: IPolygonModel;
  mousePosition: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  blocks?: any[];
}

const PolygonCard: React.FC<PolygonCardProps> = ({
  polygon,
  mousePosition,
  containerWidth,
  containerHeight,
  blocks,
}) => {
  const t = useTranslations("Common");
  const cardWidth = 250;
  const cardHeight = polygon.entityType === EntityTypeEnum.Block ? 60 : 140;

  const adjustedX = Math.min(
    Math.max(mousePosition.x + 15, 10),
    containerWidth - cardWidth - 10
  );

  const adjustedY = Math.min(
    Math.max(mousePosition.y - 60, 10),
    containerHeight - cardHeight - 10
  );

  const getCardTitle = () => {
    switch (polygon.entityType) {
      case EntityTypeEnum.Block:
        return t("BlockInfo");
      case EntityTypeEnum.Floor:
        return t("FloorInfo");
      case EntityTypeEnum.Unit:
        return t("UnitInfo");
      case EntityTypeEnum.Project:
        return t("ProjectInfo");
      case EntityTypeEnum.ProjectStage:
        return t("ProjectStageInfo");
      case EntityTypeEnum.Dollhouse:
        return t("DollhouseInfo");
      default:
        return t("Information");
    }
  };

  const getBlockName = (polygon: IPolygonModel) => {
    if (Number(polygon.entityType) !== EntityTypeEnum.Block) return null;
    const block = blocks?.find(
      (row: any) => Number(row?.Id ?? row?.id) === Number(polygon.relatedEntityId)
    );
    const name = block?.Name ?? block?.name;
    return `${name || polygon.relatedEntityId} ${t("Block")}`;
  };

  return (
    <Card
      sx={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        backgroundColor: "rgba(122, 144, 73, 0.95)",
        color: "white",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        pointerEvents: "none",
        transform: "translateZ(0)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box sx={{ p: polygon.entityType === EntityTypeEnum.Block ? 2 : 2.5 }}>
        {polygon.entityType === EntityTypeEnum.Block ? (
          <Typography
            variant="h6"
            sx={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}
          >
            {getBlockName(polygon)}
          </Typography>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{ fontSize: "16px", fontWeight: 700, mb: 1.5, color: "#fff" }}
            >
              {getCardTitle()}
            </Typography>

            {polygon.entityTypeDescription && (
              <Typography
                variant="body2"
                sx={{ fontSize: "12px", mb: 0.5, opacity: 0.8 }}
              >
                {t("Type")}: {polygon.entityTypeDescription}
              </Typography>
            )}

            {polygon.navigationTypeDescription && (
              <Typography
                variant="body2"
                sx={{ fontSize: "12px", mb: 0.5, opacity: 0.8 }}
              >
                {t("Navigation")}: {polygon.navigationTypeDescription}
              </Typography>
            )}

            {polygon.navigationValue && (
              <Typography
                variant="body2"
                sx={{ fontSize: "12px", opacity: 0.7 }}
              >
                {t("Value")}: {polygon.navigationValue}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

export default function InteractiveSceneView({
  polygons,
  containerWidth = 1920,
  containerHeight = 1080,
  imageUrl = "/placeholder.png",
  sceneType = "floorPlan",
}: InteractiveSceneViewProps) {
  const navService = useNavigationService();
  const {
    selectedUnitId,
    presentationContentResponse,
    presentationInitResponse,
    tabBarContentResponse,
  } = useAppSelector((state) => state.AppReducer);

  useQuerySync();

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

  const blocks = tabBarContentResponse?.find(
    (item: any) => item.entityName === "Block"
  )?.data;

  const dispatch = useAppDispatch();

  const { updateUrlWithParams, currentEntityId } = useViewer();

  const unitTemplates = useMemo(
    () => initResponse?.unitTemplates || [],
    [initResponse?.unitTemplates]
  );
  const [hoveredPolygon, setHoveredPolygon] = useState<IPolygonModel | null>(
    null
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const createPolygonPath = (points: { x: number; y: number }[]) => {
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    const scaledImageWidth = 1920 * scale;
    const scaledImageHeight = 1080 * scale;
    const offsetX = (containerWidth - scaledImageWidth) / 2;
    const offsetY = (containerHeight - scaledImageHeight) / 2;

    const pathString =
      points
        .map((point, index) => {
          const scaledX = point.x * scale + offsetX;
          const scaledY = point.y * scale + offsetY;

          return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
        })
        .join(" ") + " Z";

    return pathString;
  };

  const getPolygonCenterPoint = (points: { x: number; y: number }[]) => {
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    const scaledImageWidth = 1920 * scale;
    const scaledImageHeight = 1080 * scale;
    const offsetX = (containerWidth - scaledImageWidth) / 2;
    const offsetY = (containerHeight - scaledImageHeight) / 2;

    const centerX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const centerY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;

    return {
      x: centerX * scale + offsetX,
      y: centerY * scale + offsetY,
    };
  };

  const getEntityName = (polygon: IPolygonModel) => {
    if (sceneType === "dollhouse") {
      const roomNames = [
        "Salon",
        "Yatak Odası",
        "Mutfak",
        "Banyo",
        "Balkon",
        "Çalışma Odası",
        "Giyinme Odası",
      ];
      const roomIndex = (polygon.relatedEntityId || 0) % roomNames.length;
      return roomNames[roomIndex];
    } else {
      const floorNames = [
        "Zemin Kat",
        "1. Kat",
        "2. Kat",
        "3. Kat",
        "4. Kat",
        "5. Kat",
        "Çatı Katı",
      ];
      const floorIndex = (polygon.relatedEntityId || 0) % floorNames.length;
      return floorNames[floorIndex];
    }
  };

  const getUnitName = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.Unit && units && selectedUnitId) {
      const unit = units.find((unit: any) => unit?.id === selectedUnitId);
      return unit?.name || `Daire ${selectedUnitId}`;
    }
    return null;
  };

  const getUnitByPolygon = (polygon: IPolygonModel) => {
    if (polygon.entityType === EntityTypeEnum.Unit && units) {
      return units.find((unit: any) => unit?.id === polygon.relatedEntityId);
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
      polygon.entityType === EntityTypeEnum.Unit &&
      selectedUnitId &&
      (polygon.relatedEntityId === selectedUnitId ||
        polygon.navigationId === selectedUnitId)
    );
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

  const handlePolygonLeave = () => {
    setHoveredPolygon(null);
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
                true,
                true,
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
      default:
        break;
    }
  };

  if (!polygons || polygons.length === 0) {
    return null;
  }

  const scaleX = containerWidth / 1920;
  const scaleY = containerHeight / 1080;
  const scale = Math.min(scaleX, scaleY);

  const scaledImageWidth = 1920 * scale;
  const scaledImageHeight = 1080 * scale;
  const offsetX = (containerWidth - scaledImageWidth) / 2;
  const offsetY = (containerHeight - scaledImageHeight) / 2;

  return (
    <>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: containerWidth,
          height: containerHeight,
          pointerEvents: "none",
          zIndex: 999,
        }}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        onMouseMove={handleMouseMove}
      >
        <image
          href={imageUrl}
          x={offsetX}
          y={offsetY}
          width={scaledImageWidth}
          height={scaledImageHeight}
          preserveAspectRatio="xMidYMid meet"
        />
        {polygons.map((polygon, index) => {
          if (
            polygon.shapeType === ShapeTypeEnum.Dot &&
            polygon.points.length > 0
          ) {
            const centerPoint = getPolygonCenterPoint(polygon.points);
            const isHovered = hoveredPolygon?.id === polygon.id;
            const isSelected = isSelectedUnit(polygon);
            const dotRadius = isHovered || isSelected ? 12 : 8;
            const dotColor = "rgba(122, 144, 73, 0.8)";

            return (
              <g key={`floor-dot-${polygon.id}-${index}`}>
                <circle
                  cx={centerPoint.x}
                  cy={centerPoint.y}
                  r={dotRadius}
                  fill={dotColor}
                  stroke={dotColor}
                  strokeWidth="2"
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                    transition: "all 0.5s ease-in-out",
                    filter: isHovered
                      ? "drop-shadow(0 0 12px rgba(122, 144, 73, 0.6))"
                      : "none",
                  }}
                  className={isSelected ? "blink-animation" : ""}
                  onMouseEnter={(e) => handlePolygonHover(polygon, e)}
                  onMouseLeave={handlePolygonLeave}
                  onClick={() => handlePolygonClick(polygon)}
                />
              </g>
            );
          }

          return (
            <g key={`floor-polygon-group-${polygon.id}-${index}`}>
              <path
                key={`floor-${polygon.id}-${index}`}
                d={createPolygonPath(polygon.points)}
                fill={
                  hoveredPolygon?.id === polygon.id
                    ? "rgba(122, 144, 73, 0.4)"
                    : polygon.shapeType === ShapeTypeEnum.Inline
                    ? isSelectedUnit(polygon)
                      ? "rgba(122, 144, 73, 0.8)"
                      : "transparent"
                    : "transparent"
                }
                stroke={
                  hoveredPolygon?.id === polygon.id
                    ? "rgba(122, 144, 73, 0.8)"
                    : isSelectedUnit(polygon)
                    ? "rgba(122, 144, 73, 0.8)"
                    : "transparent"
                }
                strokeWidth={
                  hoveredPolygon?.id === polygon.id || isSelectedUnit(polygon)
                    ? "3"
                    : "1"
                }
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  transition: "all 0.5s ease-in-out",
                  filter:
                    hoveredPolygon?.id === polygon.id
                      ? "drop-shadow(0 0 12px rgba(122, 144, 73, 0.6))"
                      : "none",
                }}
                className={isSelectedUnit(polygon) ? "blink-animation" : ""}
                onMouseEnter={(e) => handlePolygonHover(polygon, e)}
                onMouseLeave={handlePolygonLeave}
                onClick={() => handlePolygonClick(polygon)}
              />

              {polygon.entityType === EntityTypeEnum.Floor && (
                <>
                  <g>
                    <circle
                      cx={getPolygonCenterPoint(polygon.points).x}
                      cy={getPolygonCenterPoint(polygon.points).y - 10}
                      r="8"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    />

                    <line
                      x1={getPolygonCenterPoint(polygon.points).x}
                      y1={getPolygonCenterPoint(polygon.points).y - 10}
                      x2={getPolygonCenterPoint(polygon.points).x}
                      y2={getPolygonCenterPoint(polygon.points).y - 35}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                      }}
                    />

                    <rect
                      x={getPolygonCenterPoint(polygon.points).x - 45}
                      y={getPolygonCenterPoint(polygon.points).y - 55}
                      width="90"
                      height="20"
                      rx="10"
                      ry="10"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
                      }}
                    />
                  </g>

                  <text
                    x={getPolygonCenterPoint(polygon.points).x}
                    y={getPolygonCenterPoint(polygon.points).y - 45}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill: "black",
                      fontSize: "12px",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {getEntityName(polygon)}
                  </text>
                </>
              )}

              {isSelectedUnit(polygon) && getUnitName(polygon) && (
                <>
                  <g>
                    <circle
                      cx={getPolygonCenterPoint(polygon.points).x}
                      cy={getPolygonCenterPoint(polygon.points).y - 10}
                      r="6"
                      fill="rgba(122, 144, 73, 1)"
                      stroke="rgba(122, 144, 73, 1)"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                      className="blink-animation"
                    />

                    <line
                      x1={getPolygonCenterPoint(polygon.points).x}
                      y1={getPolygonCenterPoint(polygon.points).y - 10}
                      x2={getPolygonCenterPoint(polygon.points).x}
                      y2={getPolygonCenterPoint(polygon.points).y - 35}
                      stroke="rgba(122, 144, 73, 1)"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                      }}
                    />

                    <rect
                      x={getPolygonCenterPoint(polygon.points).x - 35}
                      y={getPolygonCenterPoint(polygon.points).y - 55}
                      width="70"
                      height="20"
                      rx="10"
                      ry="10"
                      fill="rgba(122, 144, 73, 1)"
                      stroke="rgba(122, 144, 73, 1)"
                      strokeWidth="2"
                      style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
                      }}
                    />
                  </g>

                  <text
                    x={getPolygonCenterPoint(polygon.points).x}
                    y={getPolygonCenterPoint(polygon.points).y - 45}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {getUnitName(polygon)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredPolygon && (
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
                  unitTemplate={unitTemplates?.find(
                    (template: any) => template?.id === unit?.templateId
                  )}
                />
              ) : null;
            })()
          ) : (
            <Fade in={!!hoveredPolygon} timeout={200}>
              <Box>
                <PolygonCard
                  polygon={hoveredPolygon}
                  mousePosition={mousePosition}
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                  blocks={blocks}
                />
              </Box>
            </Fade>
          )}
        </Box>
      )}
    </>
  );
}
