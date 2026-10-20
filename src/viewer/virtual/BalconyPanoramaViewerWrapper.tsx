"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import LoadingComponent from "@components/LoadingComponent";

const BalconyPanoramaViewer = dynamic(() => import("./BalconyPanoramaViewer"), {
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
});

export default BalconyPanoramaViewer;
