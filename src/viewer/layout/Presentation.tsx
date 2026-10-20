"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setAllPresentationData,
  setCurrentEntityType,
  setCurrentEntityId,
  setSelectedUnitId,
  setUnitDetailDrawerOpen,
  setUnitFullDetailDrawerOpen,
  setInfoCards,
  setHasSellMode,
  setFloorContent,
  setProjectBlockContent,
  setProjectContent,
} from "@redux/appSlice";
import LoadingComponent from "@components/LoadingComponent";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { TabEnum } from "@enums/TabEnum";
import { useQuerySync } from "@hooks/useQuerySync";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import { useMediaQuery } from "@mui/material";
import DesktopViewer from "./DesktopViewer";
import MobileViewer from "./MobileViewer";
import ProjectTour from "@components/ProjectTour";
import { useAppSelector } from "@redux/hooks";
import ProjectStageTour from "@components/ProjectStageTour";
import { useNavigationService } from "@hooks/useNavigationService";
import { QueryParamEnum } from "@enums/QueryParamEnum";

export default function Presentation({
  presentationInitResponse,
  presentationResponse,
  tabBarContentResponse,
  presentationContentResponse,
  projectBlockContent,
  currentEntityType,
  currentEntityId,
  selectedUnitId,
  tenantId,
  projectSlug,
  projectId,
  projectStageId,
  projectContent
}: {
  presentationInitResponse: any;
  presentationResponse: any;
  tabBarContentResponse: any;
  presentationContentResponse: any;
  projectContent?: any | null;
  projectBlockContent?: any[] | null;
  currentEntityType?: EntityTypeEnum;
  currentEntityId?: string | number;
  selectedUnitId?: number | null;
  tenantId?: string;
  projectSlug?: string;
  projectId?: string | number;
  projectStageId?: string | number;
}) {
  const navService = useNavigationService();
  const dispatch = useDispatch();
  useQuerySync();
  const [isDataSet, setIsDataSet] = useState(false);
  const isInitialized = useRef(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentEntityTypeFromState = useAppSelector(
    (state) => state.AppReducer.currentEntityType
  );

  useEffect(() => {
    if (!isInitialized.current) {
      axiosInstance
        .patch(OpsApiRoutes.GetInfoCards, {
          pageNumber: 1,
          rowCount: 1000,
          tenantId,
          projectSlug,
          projectId,
        })
        .then((response) => {
          if (response?.data?.isSuccess) {
            dispatch(setInfoCards(response?.data?.data || []));
          }
        });
      if (currentEntityType === EntityTypeEnum.Block) {
        axiosInstance
          .get(OpsApiRoutes.GetPresentationContent, {
            params: {
              entityType: EntityTypeEnum.Floor,
              tenantId,
              projectSlug,
              projectId,
              projectStageId: projectStageId,
            },
          })
          .then((response) => {
            if (response?.data?.isSuccess) {
              dispatch(setFloorContent(response?.data?.data || null));
            }
          });
      }

      dispatch(
        setAllPresentationData({
          presentationInitResponse: presentationInitResponse
            ? { ...presentationInitResponse, tenantId, projectSlug }
            : null,
          presentationResponse: presentationResponse || null,
          tabBarContentResponse: tabBarContentResponse || null,
          presentationContentResponse: presentationContentResponse || null,
        })
      );

        dispatch(setProjectBlockContent(projectBlockContent || null));

        dispatch(setProjectContent(projectContent));

      if (currentEntityType !== undefined) {
        dispatch(setCurrentEntityType(currentEntityType));
      }
      if (currentEntityId !== undefined) {
        dispatch(setCurrentEntityId(currentEntityId?.toString()));
      }
      if (selectedUnitId !== null && selectedUnitId !== undefined) {
        dispatch(setSelectedUnitId(selectedUnitId));
        dispatch(setUnitDetailDrawerOpen(true));
        const activeTabParam = navService.getParam(QueryParamEnum.ActiveTab);
        const FULL_DETAIL_TABS: string[] = [
          TabEnum.UnitPlan,
          TabEnum.VirtualTour,
          TabEnum.Dollhouse,
          TabEnum.FloorPlan,
          TabEnum.FloorPlanView,
          TabEnum.BalconyView,
        ];
        if (activeTabParam && FULL_DETAIL_TABS.includes(activeTabParam)) {
          dispatch(setUnitFullDetailDrawerOpen(true));
        }
      }

      isInitialized.current = true;
      setIsDataSet(true);
    }
  }, [
    dispatch,
    presentationInitResponse,
    presentationResponse,
    tabBarContentResponse,
    presentationContentResponse,
    currentEntityType,
    currentEntityId,
    selectedUnitId,
  ]);

  useEffect(() => {
    const token = navService.getParam(QueryParamEnum.Token);

    if (token) {
      validateTokenAndSetAuth(token);
    }
  }, [navService]);

  const validateTokenAndSetAuth = async (token: string) => {
    try {
      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.valid) {
        dispatch(setHasSellMode(true));

        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      } else {
        dispatch(setHasSellMode(false));
      }
    } catch (error) {
      dispatch(setHasSellMode(false));
    } finally {
    }
  };

  if (!isDataSet) {
    return <LoadingComponent open />;
  }

  return (
    <>
      {isMobile ? <MobileViewer /> : <DesktopViewer />}

      {isMobile ? null : currentEntityTypeFromState ===
        EntityTypeEnum.Project ? (
        <ProjectStageTour autoStart={true} showTourButton={true} />
      ) : currentEntityTypeFromState === EntityTypeEnum.ProjectStage ? (
        <ProjectTour autoStart={true} showTourButton={true} />
      ) : null}
    </>
  );
}
