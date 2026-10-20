"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import LoadingComponent from "@components/LoadingComponent";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";

interface VirtualTourViewerProps {
  virtualItem: any;
  selectedScene?: string | null;
  EntityType?: EntityTypeEnum;
  EntityId?: string;
}

const VirtualTourViewer = dynamic<VirtualTourViewerProps>(
  () => import("./VirtualTourViewer"),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "black",
          color: "white",
        }}
      >
        <LoadingComponent open />
      </Box>
    ),
  }
);

export default VirtualTourViewer;
