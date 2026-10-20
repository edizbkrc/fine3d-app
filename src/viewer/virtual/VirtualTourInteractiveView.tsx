"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material";
import { useAppSelector } from "@redux/hooks";
import { IPolygonModel } from "@/types/IPolygonModel";
import { ITagItem } from "@/types/ITagItem";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { resolveTagImageUrl } from "@helpers/Common/tagFilters";

interface VirtualTourInteractiveViewProps {
  containerWidth: number;
  containerHeight: number;
  currentSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
  EntityType?: EntityTypeEnum;
  EntityId?: string;
  onHasPolygons?: (hasPolygons: boolean) => void;
  defaultImage?: string;
}

export default function VirtualTourInteractiveView({
  containerWidth = 300,
  containerHeight = 600,
  currentSceneId,
  onSceneChange,
  EntityType,
  EntityId,
  onHasPolygons,
  defaultImage,
}: VirtualTourInteractiveViewProps) {
  const theme = useTheme();
  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);

  const { presentationInitResponse, currentPresentationType } = useAppSelector(
    (state) => state.AppReducer
  );

  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [tags, setTags] = useState<ITagItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Eski veride minimap'te iki kare olabiliyor: gündüz karesi gündüz turunun sahnelerine, ayrı
  // gece karesi ayrı "Gece" turunun sahnelerine bağlı (ikisi de presentationType=1 etiketli).
  // Hep ilk kareyi almak gece turunda hiçbir noktayı seçili göstermiyordu; aktif sahneyi içeren
  // kareyi seçiyoruz, bulunamazsa ilk kare.
  const firstWorspaceItem = useMemo<ITagItem | null>(() => {
    if (tags.length === 0) return null;
    return (
      tags.find((tag) =>
        tag.polygons?.some((polygon: IPolygonModel) => polygon.navigationValue === currentSceneId)
      ) ?? tags[0]
    );
  }, [tags, currentSceneId]);
  // Gece modunda karenin bağlı gece görseli (minimap); yoksa resolveTagImageUrl gündüze düşer.
  const itemImageUrl = resolveTagImageUrl(firstWorspaceItem, currentPresentationType);

  useEffect(() => {
    if (EntityType && EntityId) {
      setIsLoading(true);
      setTags([]);
      axiosInstance
        .get(OpsApiRoutes.GetPresentations, {
          params: {
            TenantId,
            ProjectSlug,
            ProjectId: presentationInitResponse?.projectId,
            EntityType: EntityType,
            EntityId: EntityId,
          },
          headers: {
            "Accept-Language": getAcceptLanguage(locale || "en"),
          },
        })
        .then((response) => {
          if (response.data && response.data.isSuccess) {
            const allTags: ITagItem[] = response?.data?.data?.tags ?? [];
            setTags(allTags);
            const hasPolygons = allTags.some(
              (tag) => tag?.polygons && tag.polygons.length > 0
            );
            onHasPolygons?.(hasPolygons);
          }
        })
        .catch((error) => {
          onHasPolygons?.(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [
    TenantId,
    ProjectSlug,
    presentationInitResponse,
    locale,
    EntityType,
    EntityId,
    onHasPolygons,
  ]);

  const handleSceneChange = (navigationValue: string) => {
    onSceneChange?.(navigationValue);
  };

  const getPolygonPosition = (polygon: IPolygonModel) => {
    if (!polygon.points || polygon.points.length === 0) {
      return { x: 50, y: 50 };
    }

    const centerX =
      polygon.points.reduce((sum, point) => sum + point.x, 0) /
      polygon.points.length;
    const centerY =
      polygon.points.reduce((sum, point) => sum + point.y, 0) /
      polygon.points.length;

    const imageWidth = 1920;
    const imageHeight = 1080;

    const imageAspect = imageWidth / imageHeight;
    const containerAspect = containerWidth / containerHeight;

    let scale, offsetX, offsetY;

    if (containerAspect > imageAspect) {
      scale = containerWidth / imageWidth;
      offsetX = 0;
      offsetY = (containerHeight - imageHeight * scale) / 2;
    } else {
      scale = containerHeight / imageHeight;
      offsetX = (containerWidth - imageWidth * scale) / 2;
      offsetY = 0;
    }

    return {
      x: centerX * scale + offsetX,
      y: centerY * scale + offsetY,
    };
  };

  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {defaultImage && (
          <img
            src={defaultImage}
            alt="Floor plan"
            style={{
              width: "100%",
              height: "100%",

              objectPosition: "center",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.action.disabledBackground,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: `4px solid ${theme.palette.divider}`,
              borderTop: `4px solid ${theme.palette.primary.main}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  if (
    !firstWorspaceItem ||
    !firstWorspaceItem.polygons ||
    firstWorspaceItem.polygons.length === 0
  ) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={
            defaultImage || itemImageUrl || "/placeholder.png"
          }
          alt="Floor plan"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="virtual-tour-interactive-view"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <img
        src={itemImageUrl || "/placeholder.png"}
        alt="Unit plan"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <style jsx>{`
        @keyframes interactive-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.9),
              0 0 0 0 rgba(255, 255, 255, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(255, 59, 48, 0),
              0 0 0 20px rgba(255, 255, 255, 0);
            transform: scale(1.15);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0),
              0 0 0 0 rgba(255, 255, 255, 0);
            transform: scale(1);
          }
        }

        .virtual-tour-interactive-view .pulse-animation {
          animation: interactive-pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {firstWorspaceItem.polygons.map(
        (polygon: IPolygonModel, index: number) => {
          const position = getPolygonPosition(polygon);
          const isHovered = hoveredDot === polygon.id?.toString();
          const isSelected = polygon.navigationValue === currentSceneId;

          return (
            <div
              key={`dot-${polygon.id}-${index}`}
              className={isSelected ? "pulse-animation" : ""}
              style={{
                position: "absolute",
                left: position.x - 8,
                top: position.y - 8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: isSelected
                  ? theme.palette.error.main
                  : theme.palette.background.paper,
                border: `2px solid ${
                  isSelected
                    ? theme.palette.background.paper
                    : theme.palette.text.primary
                }`,
                cursor: "pointer",
                boxShadow: isHovered ? theme.shadows[4] : theme.shadows[2],
                transform: isHovered ? "scale(1.2)" : "scale(1)",
                transition: "all 0.3s ease",
                zIndex: 10,
              }}
              onMouseEnter={() => setHoveredDot(polygon.id?.toString() || null)}
              onMouseLeave={() => setHoveredDot(null)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (polygon.navigationValue) {
                  handleSceneChange(polygon.navigationValue);
                }
              }}
            />
          );
        }
      )}
    </div>
  );
}
