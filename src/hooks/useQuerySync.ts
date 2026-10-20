import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import {
  setActiveTab,
  setPolygonView,
  setVirtualTourId,
  setSelectedFloorId,
  setCurrentSceneId,
  setUnitFullDetailDrawerOpen,
  setCurrentFrameIndex,
} from "@redux/appSlice";
import { TabEnum } from "@enums/TabEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";

const FULL_DETAIL_TABS: string[] = [
  TabEnum.UnitPlan,
  TabEnum.VirtualTour,
  TabEnum.Dollhouse,
  TabEnum.FloorPlan,
  TabEnum.FloorPlanView,
  TabEnum.BalconyView,
];

export function useQuerySync() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentPolygonView = useAppSelector(
    (state) => state.AppReducer.polygonView,
  );

  useEffect(() => {
    const activeTabParam = searchParams.get("activeTab");
    dispatch(setActiveTab(activeTabParam));

    if (activeTabParam && FULL_DETAIL_TABS.includes(activeTabParam)) {
      dispatch(setUnitFullDetailDrawerOpen(true));
    } else if (!activeTabParam) {
      dispatch(setUnitFullDetailDrawerOpen(false));
    }

    const polygonViewParam = searchParams.get("polygonView");
    if (polygonViewParam === "unit" || polygonViewParam === "floor") {
      if (currentPolygonView !== polygonViewParam) {
        dispatch(setPolygonView(polygonViewParam));
      }
    } else if (!polygonViewParam && currentPolygonView !== "unit") {
      dispatch(setPolygonView("unit"));
    }

    const virtualTourIdParam = searchParams.get("virtualTourId");
    if (virtualTourIdParam) {
      dispatch(setVirtualTourId(virtualTourIdParam));
    } else {
      dispatch(setVirtualTourId(null));
    }

    const floorIdParam = searchParams.get("floorId");
    if (floorIdParam && polygonViewParam === "floor") {
      const floorId = parseInt(floorIdParam, 10);
      if (!isNaN(floorId)) {
        dispatch(setSelectedFloorId(floorId));
      }
    } else if (!floorIdParam || polygonViewParam === "unit") {
      dispatch(setSelectedFloorId(null));
    }

    const sceneIdParam = searchParams.get("sceneId");
    if (sceneIdParam) {
      dispatch(setCurrentSceneId(sceneIdParam));
    } else {
      dispatch(setCurrentSceneId(null));
    }

    const frameIndexParam = searchParams.get(QueryParamEnum.FrameIndex);
    if (frameIndexParam) {
      const parsed = parseInt(frameIndexParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        dispatch(setCurrentFrameIndex(parsed));
      }
    } else {
      dispatch(setCurrentFrameIndex(null));
    }
  }, [searchParams, dispatch, currentPolygonView]);
}
