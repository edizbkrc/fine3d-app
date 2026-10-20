"use client";

import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import Image from "next/image";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { useAppSelector } from "@redux/hooks";
import { useParams } from "next/navigation";
import { useNavigationService } from "@hooks/useNavigationService";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import { QueryParamEnum } from "@enums/QueryParamEnum";

interface BlockData {
  id: number;
  name: string;
  positionImage: {
    url: string;
    altText: string | null;
  } | null;
  stageId: number;
}

interface BlockPositionImageProps {
  containerWidth: number;
  containerHeight: number;
}

const BlockPositionImage: React.FC<BlockPositionImageProps> = ({
  containerWidth,
  containerHeight,
}) => {
  const params = useParams<any>();
  const navService = useNavigationService();
  const { tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId || "");
  const ProjectSlug = decodeURIComponent(projectSlug || "");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );

  const [positionImageUrl, setPositionImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBlockPositionImage = async () => {
      try {
        const entityType = navService.getParam(QueryParamEnum.EntityType);
        const entityId = navService.getParam(QueryParamEnum.EntityId);

        if (entityType !== "2" || !entityId) {
          setPositionImageUrl(null);
          return;
        }

        setIsLoading(true);

        const response = await axiosInstance.get<{
          data: BlockData[];
        }>(OpsApiRoutes.GetPresentationContent, {
          params: {
            TenantId,
            ProjectSlug,
            ProjectId: presentationInitResponse?.projectId,
            EntityType: entityType,
          },
        });

        if (response.data?.data) {
          const blocks = response.data.data;
          const currentBlock = blocks.find(
            (block) => block.id.toString() === entityId
          );

          if (currentBlock?.positionImage?.url) {
            setPositionImageUrl(
              resolveCdnImageUrl(currentBlock.positionImage.url, {
                preferMobile: isMobile,
              }),
            );
          } else {
            setPositionImageUrl(null);
          }
        }
      } catch (error) {
        console.error("Error fetching block position image:", error);
        setPositionImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockPositionImage();
  }, [navService, presentationInitResponse, TenantId, ProjectSlug]);

  if (!positionImageUrl || isLoading) {
    return null;
  }

  const imageWidth = Math.min(240, containerWidth * 0.25);
  const imageHeight = Math.min(135, containerHeight * 0.25);

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 86,
        left: 16,
        width: imageWidth,
        height: imageHeight,
        borderRadius: 2,
        overflow: "visible",
        zIndex: 100,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "scale(2)",
          transformOrigin: "bottom left",
          zIndex: 1000,
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        },
      }}
    >
      <Image
        src={positionImageUrl}
        alt="Blok Konumu"
        width={imageWidth}
        height={imageHeight}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "8px",
        }}
        unoptimized
      />
    </Box>
  );
};

export default BlockPositionImage;
