import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import { useAppSelector } from "@redux/hooks";
import {
  setAllPresentationDataWithoutInit,
  setGeneralLoading,
  setSelectedUnitId,
  setCurrentFrameIndex,
} from "@redux/appSlice";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { useNavigationService } from "./useNavigationService";

let hasInitialized = false;

const useViewer = () => {
  const dispatch = useDispatch();
  const navService = useNavigationService();
  const { locale, tenantId, projectSlug } = useParams<any>();
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const {
    presentationInitResponse,
    currentEntityType,
    currentEntityId,
    selectedUnitId,
  } = useAppSelector((state) => state.AppReducer);

  const urlEntityType = navService.getParam(QueryParamEnum.EntityType);
  const urlEntityId = navService.getParam(QueryParamEnum.EntityId);
  const urlSelectedUnitId = navService.getParam(QueryParamEnum.SelectedUnitId);

  const parseEntityType = (entityTypeString: string): EntityTypeEnum | null => {
    const entityTypeNumber = parseInt(entityTypeString, 10);
    if (isNaN(entityTypeNumber)) return null;

    const entityTypeValues = Object.values(EntityTypeEnum).filter(
      (val) => typeof val === "number",
    ) as number[];
    return entityTypeValues.includes(entityTypeNumber)
      ? (entityTypeNumber as EntityTypeEnum)
      : null;
  };

  useEffect(() => {
    if (hasInitialized) return;
    hasInitialized = true;
    if (urlEntityType && urlEntityId) {
      const entityType = parseEntityType(urlEntityType);
      if (
        entityType !== null &&
        (currentEntityType !== entityType || currentEntityId !== urlEntityId)
      ) {
        navService.navigateToEntity(entityType, urlEntityId);
      }
    }

    if (urlSelectedUnitId) {
      const unitId = parseInt(urlSelectedUnitId, 10);
      if (!isNaN(unitId) && selectedUnitId !== unitId) {
        dispatch(setSelectedUnitId(unitId));
        navService.openUnitDetailDrawer(unitId);
      }
    }
  }, []);

  const updateUrlWithParams = (
    entityType: EntityTypeEnum,
    entityId: any,
    unitId?: number | null,
    polygonView?: string,
    clearFloorParams?: boolean,
    clearUnitTab?: boolean,
    projectStageId?: string | number | null,
  ) => {
    navService.updateQueryParams(
      {
        entityType,
        entityId,
        selectedUnitId: unitId !== undefined ? unitId : undefined,
        polygonView,
        projectStageId,
      },
      {
        clearFloorParams,
        clearUnitParams: clearUnitTab,
      },
    );
  };

  const handleChangePresentation = async (
    EntityType: EntityTypeEnum,
    EntityId: any,
    clearAllParams?: boolean,
  ) => {
    dispatch(setGeneralLoading(true));
    navService.closeAllUnitAndFloorDrawers();
    dispatch(setSelectedUnitId(null));
    dispatch(setCurrentFrameIndex(null));

    if (clearAllParams) {
      navService.clearUrl();
      navService.navigateToEntity(EntityType, EntityId, {
        clearUnit: true,
        clearFloor: true,
        projectStageId:
          EntityType === EntityTypeEnum.ProjectStage ? EntityId : null,
      });
    } else {
      let projectStageId: string | number | null =
        navService.getCurrentProjectStageId();

      if (EntityType === EntityTypeEnum.ProjectStage) {
        projectStageId = EntityId;
      } else if (EntityType === EntityTypeEnum.Project) {
        projectStageId = null;
      }

      const shouldClearFloor =
        EntityType === EntityTypeEnum.Project ||
        EntityType === EntityTypeEnum.ProjectStage;

      navService.navigateToEntity(EntityType, EntityId, {
        clearUnit: true,
        clearFloor: shouldClearFloor,
        projectStageId,
      });
    }

    let currentProjectStageId = navService.getCurrentProjectStageId();
    if (EntityType === EntityTypeEnum.ProjectStage) {
      currentProjectStageId = EntityId;
    } else if (EntityType === EntityTypeEnum.Project || clearAllParams) {
      currentProjectStageId = null;
    }

    const GeneralParams = {
      TenantId,
      ProjectSlug,
      ProjectId: presentationInitResponse?.projectId,
      EntityType,
      EntityId,
    };
    const ContentBarParams = {
      TenantId,
      ProjectSlug,
      ProjectId: presentationInitResponse?.projectId,
      EntityType:
        EntityType === EntityTypeEnum.Project
          ? EntityTypeEnum.Project
          : EntityTypeEnum.ProjectStage,
      ProjectStageId: currentProjectStageId || undefined,
    };
    const headers = {
      "Accept-Language": getAcceptLanguage(locale),
    };

    const [
      PresentationResponse,
      TabBarContentResponse,
      PresentationContentResponse,
    ] = await Promise.all([
      axiosInstance.get(OpsApiRoutes.GetPresentations, {
        params: GeneralParams,
        headers,
      }),
      axiosInstance.get(OpsApiRoutes.GetPresentationTabBar, {
        params: ContentBarParams,
        headers,
      }),
      axiosInstance.get(OpsApiRoutes.GetPresentationContent, {
        params: ContentBarParams,
        headers,
      }),
    ]);

    if (
      !PresentationResponse?.data?.isSuccess ||
      !TabBarContentResponse?.data?.isSuccess
    ) {
      dispatch(setGeneralLoading(false));
      return;
    } else {
      dispatch(
        setAllPresentationDataWithoutInit({
          presentationResponse: PresentationResponse.data.data,
          tabBarContentResponse: TabBarContentResponse.data.data,
          presentationContentResponse: PresentationContentResponse.data.data,
        }),
      );
      dispatch(setGeneralLoading(false));
    }
  };

  const handleUnitClick = (unit: any) => {
    const blockId = unit?.block?.id;
    if (blockId) {
      dispatch(setSelectedUnitId(unit.id));
      if (
        currentEntityType !== EntityTypeEnum.Block ||
        Number(currentEntityId) !== Number(blockId)
      )
        handleChangePresentation(EntityTypeEnum.Block, blockId);

      const currentProjectStageId = navService.getCurrentProjectStageId();
      navService.navigateToUnit(
        unit.id,
        blockId,
        currentProjectStageId || undefined,
      );
    }
    if (unit === null) {
      dispatch(setSelectedUnitId(null));
      navService.closeUnitDetailDrawer();
      navService.removeParams(
        "selectedUnitId",
        "unitTab",
        "virtualTourId",
        "virtualTourOpen",
        "sceneId",
      );
    }
  };

  return {
    handleChangePresentation,
    handleUnitClick,
    currentEntityType,
    currentEntityId,
    selectedUnitId,
    updateUrlWithParams,
  };
};
export default useViewer;
