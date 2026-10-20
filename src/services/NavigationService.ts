import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";
import { AppDispatch } from "@redux/store";
import {
  setUnitDetailDrawerOpen,
  setUnitFullDetailDrawerOpen,
  setSelectedUnitId,
  setCurrentEntityType,
  setCurrentEntityId,
  toggleGalleryDrawer,
  toggleMapDrawer,
  toggleInfoCardDrawer,
  toggleVirtualTourDrawer,
  openGalleryDrawer,
  openMapDrawer,
  openInfoCardDrawer,
  openVirtualTourDrawer,
  closeAllDrawers,
  setActiveTab,
  setPolygonView,
  setVirtualTourId,
  setCurrentSceneId,
} from "@redux/appSlice";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { QueryParamEnum } from "@enums/QueryParamEnum";
import { TabEnum } from "@enums/TabEnum";

export interface NavigationParams {
  entityType?: EntityTypeEnum;
  entityId?: string | number;
  selectedUnitId?: number | null;
  projectStageId?: string | number | null;
  polygonView?: string;
  activeTab?: string;
  floorId?: string;
  virtualTourId?: string;
  virtualTourOpen?: string;
  sceneId?: string;
  frameIndex?: string | number | null;
}

export interface UpdateUrlOptions {
  clearFloorParams?: boolean;
  clearUnitParams?: boolean;
  clearVirtualTourParams?: boolean;
  clearAllParams?: boolean;
  scroll?: boolean;
}

class NavigationService {
  private static instance: NavigationService;
  private router: AppRouterInstance | null = null;
  private searchParams: ReadonlyURLSearchParams | null = null;
  private dispatch: typeof AppDispatch | null = null;
  private pathname: string = "";
  /** Write-through query cache — React searchParams lag behind router.replace */
  private queryCache: URLSearchParams | null = null;
  private lastWrittenQuery: string = "";
  private ignoreSyncUntil = 0;

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  public initialize(
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
    dispatch: typeof AppDispatch,
    pathname?: string,
  ) {
    this.router = router;
    this.searchParams = searchParams;
    this.dispatch = dispatch;
    if (pathname) {
      this.pathname = pathname;
    }

    const incoming = searchParams.toString();
    if (!this.queryCache) {
      this.queryCache = new URLSearchParams(incoming);
      this.lastWrittenQuery = incoming;
      return;
    }

    // React caught up to our last write
    if (incoming === this.lastWrittenQuery) {
      this.queryCache = new URLSearchParams(incoming);
      return;
    }

    // Ignore stale React snapshots right after our own replaces
    if (Date.now() < this.ignoreSyncUntil) {
      return;
    }

    // External change (browser back/forward, shared link)
    if (incoming !== this.queryCache.toString()) {
      this.queryCache = new URLSearchParams(incoming);
      this.lastWrittenQuery = incoming;
    }
  }

  private ensureInitialized() {
    if (!this.router || !this.searchParams || !this.dispatch) {
      console.error("NavigationService is not initialized properly");
      return false;
    }
    return true;
  }

  public getQueryParams(): URLSearchParams {
    if (this.queryCache) {
      return new URLSearchParams(this.queryCache.toString());
    }
    if (!this.searchParams) return new URLSearchParams();
    return new URLSearchParams(this.searchParams.toString());
  }

  public getParam(key: QueryParamEnum | string): string | null {
    if (this.queryCache) {
      return this.queryCache.get(key);
    }
    return this.searchParams?.get(key) || null;
  }

  private commitQuery(
    params: URLSearchParams,
    options: { scroll?: boolean } = {},
  ) {
    this.queryCache = new URLSearchParams(params.toString());
    this.lastWrittenQuery = params.toString();
    this.ignoreSyncUntil = Date.now() + 600;

    const newQuery = this.lastWrittenQuery;
    const currentPath = this.pathname || window.location.pathname;
    const newUrl = newQuery ? `${currentPath}?${newQuery}` : currentPath;
    this.router!.replace(newUrl, { scroll: options.scroll ?? false });
  }

  public updateQueryParams(
    params: NavigationParams,
    options: UpdateUrlOptions = {},
  ) {
    if (!this.ensureInitialized()) return;

    const current = this.getQueryParams();

    if (options.clearAllParams) {
      Array.from(current.keys()).forEach((key) => current.delete(key));
    } else {
      if (options.clearFloorParams) {
        current.delete(QueryParamEnum.FloorId);
      }
      if (options.clearUnitParams) {
        current.delete(QueryParamEnum.ActiveTab);
        current.delete(QueryParamEnum.SelectedUnitId);
      }
      if (options.clearVirtualTourParams) {
        current.delete(QueryParamEnum.VirtualTourId);
        current.delete(QueryParamEnum.VirtualTourOpen);
        current.delete(QueryParamEnum.SceneId);
      }
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        current.set(key, value.toString());
      } else if (value === null) {
        current.delete(key);
      }
    });

    this.commitQuery(current, { scroll: options.scroll ?? false });
  }

  public clearUrl() {
    if (!this.ensureInitialized()) return;
    this.queryCache = new URLSearchParams();
    this.lastWrittenQuery = "";
    this.ignoreSyncUntil = Date.now() + 600;
    const currentPath = this.pathname || window.location.pathname;
    this.router!.replace(currentPath, { scroll: false });
  }

  public removeParams(...keys: (QueryParamEnum | string)[]) {
    if (!this.ensureInitialized()) return;

    const current = this.getQueryParams();
    keys.forEach((key) => current.delete(key));
    this.commitQuery(current);
  }

  public openUnitDetailDrawer(unitId?: number) {
    if (!this.ensureInitialized()) return;

    if (unitId) {
      this.dispatch!(setSelectedUnitId(unitId));
    }
    this.dispatch!(setActiveTab(null));
    this.dispatch!(setUnitDetailDrawerOpen(true));
    this.dispatch!(setUnitFullDetailDrawerOpen(false));
  }

  public closeUnitDetailDrawer() {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setUnitDetailDrawerOpen(false));
    this.dispatch!(setActiveTab(null));
    this.removeParams(QueryParamEnum.SelectedUnitId, QueryParamEnum.ActiveTab);
  }

  public openUnitFullDetailDrawer(unitId?: number) {
    if (!this.ensureInitialized()) return;

    if (unitId) {
      this.dispatch!(setSelectedUnitId(unitId));
    }
    this.dispatch!(setUnitFullDetailDrawerOpen(true));
    this.dispatch!(setUnitDetailDrawerOpen(false));
  }

  public closeUnitFullDetailDrawer() {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setUnitFullDetailDrawerOpen(false));
    this.dispatch!(setActiveTab(null));
    this.dispatch!(setVirtualTourId(null));
    this.dispatch!(setCurrentSceneId(null));

    this.removeParams(
      QueryParamEnum.ActiveTab,
      QueryParamEnum.VirtualTourId,
      QueryParamEnum.VirtualTourOpen,
      QueryParamEnum.SceneId,
      QueryParamEnum.FloorId,
    );
  }

  public closeAllUnitAndFloorDrawers() {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setUnitFullDetailDrawerOpen(false));
    this.dispatch!(setSelectedUnitId(null));
    this.dispatch!(setActiveTab(null));
    this.dispatch!(setVirtualTourId(null));
  }

  public toggleGallery() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(toggleGalleryDrawer());
  }

  public toggleMap() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(toggleMapDrawer());
  }

  public toggleInfoCard() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(toggleInfoCardDrawer());
  }

  public toggleVirtualTour() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(toggleVirtualTourDrawer());
  }

  public openGallery() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(openGalleryDrawer());
  }

  public openMap() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(openMapDrawer());
  }

  public openInfoCard() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(openInfoCardDrawer());
  }

  public openVirtualTour() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(openVirtualTourDrawer());
  }

  public closeSideDrawers() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(closeAllDrawers());
  }

  public navigateToTab(tabId: string, entityId?: number | string) {
    if (!this.ensureInitialized()) return;

    if (entityId) {
      const numericId =
        typeof entityId === "string" ? parseInt(entityId, 10) : entityId;
      this.dispatch!(setSelectedUnitId(numericId));
    }

    this.dispatch!(setActiveTab(tabId));
    this.updateQueryParams(
      { [QueryParamEnum.ActiveTab]: tabId },
      { scroll: false },
    );

    // this.dispatch!(setUnitFullDetailDrawerOpen(true));
  }

  public navigateToUnitTab(tabId: string, unitId?: number) {
    this.navigateToTab(tabId, unitId);
  }

  public getActiveTab(): string | null {
    return this.getParam(QueryParamEnum.ActiveTab);
  }

  public openVirtualTourById(virtualTourId: string, sceneId?: string) {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setVirtualTourId(virtualTourId));
    this.dispatch!(setActiveTab(TabEnum.VirtualTour));
    this.dispatch!(openVirtualTourDrawer());
    if (sceneId) {
      this.dispatch!(setCurrentSceneId(sceneId));
    }

    const params: Record<string, string> = {
      [QueryParamEnum.VirtualTourId]: virtualTourId,
      [QueryParamEnum.VirtualTourOpen]: "true",
    };

    if (sceneId) {
      params[QueryParamEnum.SceneId] = sceneId;
    }

    this.updateQueryParams(params);
  }

  public closeVirtualTour() {
    if (!this.ensureInitialized()) return;
    this.dispatch!(setVirtualTourId(null));
    this.removeParams(
      QueryParamEnum.VirtualTourId,
      QueryParamEnum.VirtualTourOpen,
      QueryParamEnum.SceneId,
    );
  }

  public navigateToEntity(
    entityType: EntityTypeEnum,
    entityId: string | number,
    options: {
      clearUnit?: boolean;
      clearFloor?: boolean;
      projectStageId?: string | number | null;
    } = {},
  ) {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setUnitDetailDrawerOpen(false));
    this.dispatch!(setUnitFullDetailDrawerOpen(false));

    if (options.clearUnit) {
      this.dispatch!(setSelectedUnitId(null));
    }

    this.dispatch!(setCurrentEntityType(entityType));
    this.dispatch!(setCurrentEntityId(entityId.toString()));

    const current = this.getQueryParams();

    if (options.clearUnit) {
      current.delete(QueryParamEnum.SelectedUnitId);
      current.delete(QueryParamEnum.ActiveTab);
    }

    if (options.clearFloor) {
      current.delete(QueryParamEnum.FloorId);
    }

    // Always clear frameIndex on entity navigation so the new presentation starts at its default frame
    current.delete(QueryParamEnum.FrameIndex);
    current.delete(QueryParamEnum.VirtualTourId);
    current.delete(QueryParamEnum.VirtualTourOpen);
    current.delete(QueryParamEnum.SceneId);
    current.delete(QueryParamEnum.PolygonView);

    current.set(QueryParamEnum.EntityType, entityType.toString());
    current.set(QueryParamEnum.EntityId, entityId.toString());

    if (
      options.projectStageId !== undefined &&
      options.projectStageId !== null
    ) {
      current.set(
        QueryParamEnum.ProjectStageId,
        options.projectStageId.toString(),
      );
    } else if (options.projectStageId === null) {
      current.delete(QueryParamEnum.ProjectStageId);
    }

    this.commitQuery(current);
  }

  public navigateToProjectStage(stageId: string | number) {
    if (!this.ensureInitialized()) return;

    this.navigateToEntity(EntityTypeEnum.ProjectStage, stageId, {
      clearUnit: true,
      clearFloor: true,
      projectStageId: stageId,
    });
  }

  public navigateToBlock(
    blockId: string | number,
    projectStageId?: string | number,
  ) {
    if (!this.ensureInitialized()) return;

    this.navigateToEntity(EntityTypeEnum.Block, blockId, {
      clearUnit: true,
      clearFloor: true,
      projectStageId,
    });
  }

  public navigateToProject(projectId: string | number) {
    if (!this.ensureInitialized()) return;

    this.navigateToEntity(EntityTypeEnum.Project, projectId, {
      clearUnit: true,
      clearFloor: true,
      projectStageId: null,
    });
  }

  public navigateToUnit(
    unitId: number,
    blockId: string | number,
    projectStageId?: string | number,
  ) {
    if (!this.ensureInitialized()) return;

    this.dispatch!(setSelectedUnitId(unitId));

    this.dispatch!(setPolygonView("unit"));

    this.updateQueryParams(
      {
        [QueryParamEnum.EntityType]: EntityTypeEnum.Block,
        [QueryParamEnum.EntityId]: blockId.toString(),
        [QueryParamEnum.SelectedUnitId]: unitId,
        [QueryParamEnum.PolygonView]: "unit",
        [QueryParamEnum.ProjectStageId]: projectStageId,
      },
      {
        clearFloorParams: true,
        clearUnitParams: true,
        clearVirtualTourParams: true,
      },
    );

    this.openUnitDetailDrawer(unitId);
  }

  public getCurrentEntityType(): EntityTypeEnum | null {
    const entityType = this.getParam(QueryParamEnum.EntityType);
    return entityType ? (parseInt(entityType) as EntityTypeEnum) : null;
  }

  public getCurrentEntityId(): string | null {
    return this.getParam(QueryParamEnum.EntityId);
  }

  public getSelectedUnitId(): number | null {
    const unitId = this.getParam(QueryParamEnum.SelectedUnitId);
    return unitId ? parseInt(unitId) : null;
  }

  public getCurrentProjectStageId(): string | null {
    return this.getParam(QueryParamEnum.ProjectStageId);
  }

  public getPolygonView(): string | null {
    return (
      this.getParam(QueryParamEnum.PolygonView) ||
      this.getParam(QueryParamEnum.Pv)
    );
  }

  public getSceneId(): string | null {
    return this.getParam(QueryParamEnum.SceneId);
  }

  public isVirtualTourOpen(): boolean {
    return this.getParam(QueryParamEnum.VirtualTourOpen) === "true";
  }

  public getVirtualTourId(): string | null {
    return this.getParam(QueryParamEnum.VirtualTourId);
  }
}

export const navigationService = NavigationService.getInstance();
export default navigationService;
