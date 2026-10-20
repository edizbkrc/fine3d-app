"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@redux/hooks";
import { Box, Stack, Drawer } from "@mui/material";
import SidebarMenu from "./SidebarMenu";
import { setDrawerOpen } from "@/redux/appSlice";
import UnitDrawer from "../drawers/UnitDrawer";
import GalleryDrawer from "../drawers/GalleryDrawer";
import InfoCardDrawer from "../drawers/InfoCardDrawer";
import MapDrawer from "../drawers/MapDrawer";
import NavigationTabBar from "../tabs/NavigationTabBar";
import UnitDetailDrawer from "../drawers/UnitDetailDrawer";
import UnitFullDetailDrawer from "../drawers/UnitFullDetailDrawer";
import ComparisonDrawer from "../drawers/ComparisonDrawer";
import VirtualTourDrawer from "../virtual/VirtualTourDrawer";
import WorkflowDrawer from "../drawers/WorkflowDrawer";
import ProjectWorkflowDrawer from "../drawers/ProjectWorkflowDrawer";
import Scene3D from "../Scene3D";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import StageDrawer from "../drawers/StageDrawer";

const drawerWidth = 400;

const DesktopViewer: React.FC = () => {
  const dispatch = useDispatch();
  const drawerOpen = useAppSelector((state) => state.AppReducer.drawerOpen);
  const currentEntityType = useAppSelector(
    (state) => state.AppReducer.currentEntityType
  );

  const handleDrawerToggle = () => {
    dispatch(setDrawerOpen(!drawerOpen));
  };


  return (
    <Stack
      direction="row"
      sx={{
        height:  "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          overflowY: "hidden",
          paddingRight: `${60}px`,
          transition: "all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
          height: "100vh",
          width:  "auto",
        }}
      >
        <Scene3D  />

       <NavigationTabBar />
      </Box>

      <Drawer
        id="unit-drawer"
        variant={"permanent"}
        anchor="right"
        open={drawerOpen}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: drawerWidth,
              boxSizing: "border-box",
              marginRight: "60px",
              overflow: "hidden",
              transform: drawerOpen
                ? "translateX(0)"
                : `translateX(${drawerWidth}px)`,
              transition: "transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
              visibility: drawerOpen ? "visible" : "hidden",
            },
          },
        }}
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          zIndex: 1299,
          flexShrink: 0,
        }}
      >
        {currentEntityType === EntityTypeEnum.Project ? (
          <StageDrawer />
        ) : (
          <UnitDrawer />
        )}
      </Drawer>

      <SidebarMenu onMenuToggle={handleDrawerToggle} />

      {currentEntityType === EntityTypeEnum.Project ? null : (
        <UnitDetailDrawer />
      )}

      {currentEntityType === EntityTypeEnum.Project ? null : (
        <UnitFullDetailDrawer />
      )}

      {currentEntityType === EntityTypeEnum.Project ? null : (
        <ComparisonDrawer />
      )}

      <GalleryDrawer />

      <InfoCardDrawer />

      <MapDrawer />

      <VirtualTourDrawer />

      <WorkflowDrawer />

      <ProjectWorkflowDrawer />
    </Stack>
  );
};

export default DesktopViewer;
