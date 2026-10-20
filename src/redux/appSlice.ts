import { ThemeOptionsEnum } from "@enums/ThemeOptionsEnum";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAppReducer } from "./IAppReducer";
import { FavoriteUnit } from "@/helpers/Common/favoritesService";

/**
 * Hub ProjectStage content { stages, blocks, floors, units } döner.
 * UI birim dizisi + unit.block/floor/stage bekler — lookup listelerinden birleştir.
 * Project content zaten stage dizisi döner; ona dokunma.
 */
function normalizePresentationContent(content: any): any {
  if (!content) return content;
  if (Array.isArray(content)) return content;
  if (!Array.isArray(content.units)) return content;

  const blocksById = new Map<string, any>(
    (content.blocks || []).map((b: any) => [String(b.id), b] as [string, any]),
  );
  const floorsById = new Map<string, any>(
    (content.floors || []).map((f: any) => [String(f.id), f] as [string, any]),
  );
  const stagesById = new Map<string, any>(
    (content.stages || []).map((s: any) => [String(s.id), s] as [string, any]),
  );

  return content.units.map((unit: any) => {
    const block = blocksById.get(String(unit.blockId));
    const floor = floorsById.get(String(unit.floorId));
    const stage = stagesById.get(String(unit.stageId));

    return {
      ...unit,
      block: unit.block || (block
        ? { id: block.id, name: block.name }
        : unit.blockId != null
          ? { id: unit.blockId, name: undefined }
          : undefined),
      floor: unit.floor || (floor
        ? { id: floor.id, name: floor.name }
        : undefined),
      stage: unit.stage || (stage
        ? { id: stage.id, name: stage.name }
        : undefined),
    };
  });
}

function sortUnits(units: any[]): any[] {
  return [...units].sort((a, b) => {
    const stageA = a.stage?.name || "";
    const stageB = b.stage?.name || "";
    const stageCompare = stageA.localeCompare(stageB);
    if (stageCompare !== 0) return stageCompare;

    const blockA = a.block?.name || "";
    const blockB = b.block?.name || "";
    const blockCompare = blockA.localeCompare(blockB);
    if (blockCompare !== 0) return blockCompare;

    const unitA = parseInt(a.unitNumber || "0", 10);
    const unitB = parseInt(b.unitNumber || "0", 10);
    return unitA - unitB;
  });
}

const initialState: IAppReducer = {
  theme: ThemeOptionsEnum.LIGHT,
  opsModalVisible: false,
  opsModalData: null,
  generalLoading: false,
  languageLoading: true,
  languages: [],
  drawerOpen: true,
  errorMessages: {
    tr: "Beklenmedik bir hata oluştu lütfen daha sonra tekrar deneyiniz! Sorun çözülmez ise yetkililer ile iletişime geçiniz...",
    en: "An unexpected error occurred, please try again later! If the problem is not solved, contact the authorities...",
  },
  connectionErrorMessages: {
    tr: "İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.",
    en: "You have no internet connection. Please check your connection.",
  },
  presentationInitResponse: null,
  presentationResponse: null,
  tabBarContentResponse: null,
  presentationContentResponse: null,
  currentEntityType: null,
  currentEntityId: null,
  selectedUnitId: null,
  selectedFloorId: null,
  unitDetailDrawerOpen: false,
  unitDetailDrawerWasOpen: false,
  unitFullDetailDrawerOpen: false,
  currentPresentationType: PresentationTypeEnum.DayLight,
  polygonsVisible: false,
  favorites: [],
  isComparisonDrawerOpen: false,
  galleryDrawerOpen: false,
  galleryItems: [],
  galleryLoading: false,
  mapDrawerOpen: false,
  mapData: null,
  mapLoading: false,
  infoCards: [],
  infoCardDrawerOpen: false,
  currentSceneId: null,
  virtualTourDrawerOpen: false,
  tourActive: false,
  hasSellMode: false,
  floorContent: null,
  activeTab: null,
  polygonView: "unit",
  virtualTourId: null,
  projectBlockContent: null,
  workflowDrawerOpen: false,
  projectContent: null,
  projectWorkflowDrawerOpen: false,
  currentFrameIndex: null,
};

export const appSlice = createSlice({
  name: "appReducer",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<any>) => {
      state = { ...state, theme: action.payload };
      return state;
    },
    setOpsModalVisible: (state, action: PayloadAction<boolean>) => {
      state.opsModalVisible = action.payload;
    },
    setOpsModalData: (state, action: PayloadAction<any>) => {
      state.opsModalData = action.payload;
    },
    setGeneralLoading: (state, action: PayloadAction<boolean>) => {
      state.generalLoading = action.payload;
      return state;
    },
    setLanguageLoading: (state, action: PayloadAction<boolean>) => {
      state.languageLoading = action.payload;
      return state;
    },
    setLanguages: (state, action: PayloadAction<any>) => {
      state.languages = action.payload;
      return state;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      if (!action.payload && state.drawerOpen) {
        state.unitDetailDrawerWasOpen = state.unitDetailDrawerOpen;
        state.unitDetailDrawerOpen = false;
      } else if (action.payload && !state.drawerOpen) {
        if (state.unitDetailDrawerWasOpen) {
          state.unitDetailDrawerOpen = true;
        }
      }

      state.drawerOpen = action.payload;
      return state;
    },
    setAllPresentationData: (state, action: PayloadAction<any>) => {
      const payload = action.payload || {};
      const {
        presentationInitResponse = null,
        presentationResponse = null,
        tabBarContentResponse = null,
        presentationContentResponse = null,
      } = payload;

      state.presentationInitResponse = presentationInitResponse;
      state.presentationResponse = presentationResponse;

      if (tabBarContentResponse && Array.isArray(tabBarContentResponse)) {
        state.tabBarContentResponse = tabBarContentResponse.map((item) => ({
          ...item,
          data: item.data
            ? [...item.data].sort((a, b) => {
                const nameA = a.Name || "";
                const nameB = b.Name || "";
                return nameA.localeCompare(nameB);
              })
            : item.data,
        }));
      } else {
        state.tabBarContentResponse = tabBarContentResponse;
      }

      const normalizedContent = normalizePresentationContent(
        presentationContentResponse,
      );
      if (normalizedContent && Array.isArray(normalizedContent)) {
        state.presentationContentResponse = sortUnits(normalizedContent);
      } else {
        state.presentationContentResponse = normalizedContent;
      }

      return state;
    },
    setAllPresentationDataWithoutInit: (state, action: PayloadAction<any>) => {
      const payload = action.payload || {};
      const {
        presentationResponse = null,
        tabBarContentResponse = null,
        presentationContentResponse = null,
      } = payload;

      state.presentationResponse = presentationResponse;

      if (tabBarContentResponse && Array.isArray(tabBarContentResponse)) {
        state.tabBarContentResponse = tabBarContentResponse.map((item) => ({
          ...item,
          data: item.data
            ? [...item.data].sort((a, b) => {
                const nameA = a.Name || "";
                const nameB = b.Name || "";
                return nameA.localeCompare(nameB);
              })
            : item.data,
        }));
      } else {
        state.tabBarContentResponse = tabBarContentResponse;
      }

      const normalizedContent = normalizePresentationContent(
        presentationContentResponse,
      );
      if (normalizedContent && Array.isArray(normalizedContent)) {
        state.presentationContentResponse = sortUnits(normalizedContent);
      } else {
        state.presentationContentResponse = normalizedContent;
      }

      return state;
    },
    setPresentationInitResponse: (state, action: PayloadAction<any | null>) => {
      state.presentationInitResponse = action.payload;
      return state;
    },
    setPresentationResponse: (state, action: PayloadAction<any | null>) => {
      state.presentationResponse = action.payload;
      return state;
    },
    setTabBarContentResponse: (state, action: PayloadAction<any | null>) => {
      state.tabBarContentResponse = action.payload;
      return state;
    },
    setPresentationContentResponse: (
      state,
      action: PayloadAction<any | null>,
    ) => {
      const normalizedContent = normalizePresentationContent(action.payload);
      state.presentationContentResponse =
        normalizedContent && Array.isArray(normalizedContent)
          ? sortUnits(normalizedContent)
          : normalizedContent;
      return state;
    },
    setCurrentEntityType: (state, action: PayloadAction<any | null>) => {
      state.currentEntityType = action.payload;
      return state;
    },
    setCurrentEntityId: (state, action: PayloadAction<string | null>) => {
      state.currentEntityId = action.payload;
      return state;
    },
    setSelectedUnitId: (state, action: PayloadAction<number | null>) => {
      state.selectedUnitId = action.payload;
      if (action.payload) {
        state.currentSceneId = null;
        state.selectedFloorId = null;
      } else {
        state.currentSceneId = null;
        state.unitDetailDrawerOpen = false;
        state.unitFullDetailDrawerOpen = false;
      }
      return state;
    },
    setSelectedFloorId: (state, action: PayloadAction<number | null>) => {
      state.selectedFloorId = action.payload;
      if (action.payload) {
        state.selectedUnitId = null;
      }
      return state;
    },
    setUnitDetailDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.unitDetailDrawerOpen = action.payload;
      return state;
    },
    setUnitFullDetailDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.unitFullDetailDrawerOpen = action.payload;
      return state;
    },
    setCurrentPresentationType: (
      state,
      action: PayloadAction<PresentationTypeEnum | null>,
    ) => {
      state.currentPresentationType = action.payload;
      return state;
    },
    setPolygonsVisible: (state, action: PayloadAction<boolean>) => {
      state.polygonsVisible = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("polygonsVisible", JSON.stringify(action.payload));
      }
      return state;
    },
    setFavorites: (state, action: PayloadAction<FavoriteUnit[]>) => {
      state.favorites = action.payload;
      return state;
    },
    addToFavorites: (state, action: PayloadAction<FavoriteUnit>) => {
      const exists = state.favorites.some(
        (fav) => fav.unitId === action.payload.unitId,
      );
      if (!exists) {
        state.favorites.push(action.payload);
      }
      return state;
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(
        (fav) => fav.unitId !== action.payload,
      );
      return state;
    },
    setIsComparisonDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isComparisonDrawerOpen = action.payload;
      return state;
    },
    toggleComparisonDrawer: (state) => {
      state.isComparisonDrawerOpen = !state.isComparisonDrawerOpen;
      return state;
    },
    closeComparisonDrawer: (state) => {
      state.isComparisonDrawerOpen = false;
      return state;
    },
    toggleGalleryDrawer: (state) => {
      state.galleryDrawerOpen = !state.galleryDrawerOpen;
      return state;
    },
    toggleMapDrawer: (state) => {
      state.mapDrawerOpen = !state.mapDrawerOpen;
      return state;
    },
    toggleInfoCardDrawer: (state) => {
      state.infoCardDrawerOpen = !state.infoCardDrawerOpen;
      return state;
    },
    toggleVirtualTourDrawer: (state) => {
      state.virtualTourDrawerOpen = !state.virtualTourDrawerOpen;
      return state;
    },
    openGalleryDrawer: (state) => {
      state.galleryDrawerOpen = true;
      state.mapDrawerOpen = false;
      state.infoCardDrawerOpen = false;
      state.virtualTourDrawerOpen = false;
      return state;
    },
    openMapDrawer: (state) => {
      state.mapDrawerOpen = true;
      state.galleryDrawerOpen = false;
      state.infoCardDrawerOpen = false;
      state.virtualTourDrawerOpen = false;
      return state;
    },
    openInfoCardDrawer: (state) => {
      state.infoCardDrawerOpen = true;
      state.galleryDrawerOpen = false;
      state.mapDrawerOpen = false;
      state.virtualTourDrawerOpen = false;
      return state;
    },
    openVirtualTourDrawer: (state) => {
      state.virtualTourDrawerOpen = true;
      state.galleryDrawerOpen = false;
      state.mapDrawerOpen = false;
      state.infoCardDrawerOpen = false;
      state.unitFullDetailDrawerOpen = false;
      return state;
    },
    closeAllDrawers: (state) => {
      state.galleryDrawerOpen = false;
      state.mapDrawerOpen = false;
      state.infoCardDrawerOpen = false;
      state.virtualTourDrawerOpen = false;
      return state;
    },
    setInfoCards: (state, action: PayloadAction<any>) => {
      state.infoCards = action.payload;
      return state;
    },
    setCurrentSceneId: (state, action: PayloadAction<string | null>) => {
      state.currentSceneId = action.payload;
      return state;
    },
    setTourActive: (state, action: PayloadAction<boolean>) => {
      state.tourActive = action.payload;
      return state;
    },
    startTour: (state) => {
      state.tourActive = true;
      return state;
    },
    stopTour: (state) => {
      state.tourActive = false;
      return state;
    },
    setHasSellMode: (state, action: PayloadAction<boolean>) => {
      state.hasSellMode = action.payload;
      return state;
    },
    setFloorContent: (state, action: PayloadAction<any | null>) => {
      state.floorContent = action.payload;
      return state;
    },
    setActiveTab: (state, action: PayloadAction<string | null>) => {
      state.activeTab = action.payload;
      return state;
    },
    setPolygonView: (state, action: PayloadAction<"unit" | "floor">) => {
      state.polygonView = action.payload;
      return state;
    },
    setVirtualTourId: (state, action: PayloadAction<string | null>) => {
      state.virtualTourId = action.payload;
      return state;
    },
    setProjectBlockContent: (state, action: PayloadAction<any[] | null>) => {
      state.projectBlockContent = action.payload;
      return state;
    },
    toggleWorkflowDrawer: (state) => {
      state.workflowDrawerOpen = !state.workflowDrawerOpen;
      return state;
    },
    openWorkflowDrawer: (state) => {
      state.workflowDrawerOpen = true;
      return state;
    },
    closeWorkflowDrawer: (state) => {
      state.workflowDrawerOpen = false;
      return state;
    },
    setProjectContent: (state, action: PayloadAction<any[] | null>) => {
      state.projectContent = action.payload;
      return state;
    },
    toggleProjectWorkflowDrawer: (state) => {
      state.projectWorkflowDrawerOpen = !state.projectWorkflowDrawerOpen;
      return state;
    },
    openProjectWorkflowDrawer: (state) => {
      state.projectWorkflowDrawerOpen = true;
      return state;
    },
    closeProjectWorkflowDrawer: (state) => {
      state.projectWorkflowDrawerOpen = false;
      return state;
    },
    setCurrentFrameIndex: (state, action: PayloadAction<number | null>) => {
      state.currentFrameIndex = action.payload;
      return state;
    },
  },
});

export const {
  setTheme,
  setOpsModalVisible,
  setOpsModalData,
  setGeneralLoading,
  setLanguageLoading,
  setLanguages,
  setDrawerOpen,
  setAllPresentationData,
  setPresentationInitResponse,
  setPresentationResponse,
  setTabBarContentResponse,
  setPresentationContentResponse,
  setAllPresentationDataWithoutInit,
  setCurrentEntityType,
  setCurrentEntityId,
  setSelectedUnitId,
  setSelectedFloorId,
  setUnitDetailDrawerOpen,
  setUnitFullDetailDrawerOpen,
  setCurrentPresentationType,
  setPolygonsVisible,
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  setIsComparisonDrawerOpen,
  toggleComparisonDrawer,
  closeComparisonDrawer,
  toggleGalleryDrawer,
  toggleMapDrawer,
  toggleInfoCardDrawer,
  toggleVirtualTourDrawer,
  openGalleryDrawer,
  openMapDrawer,
  openInfoCardDrawer,
  openVirtualTourDrawer,
  closeAllDrawers,
  setInfoCards,
  setCurrentSceneId,
  setTourActive,
  startTour,
  stopTour,
  setHasSellMode,
  setFloorContent,
  setActiveTab,
  setPolygonView,
  setVirtualTourId,
  setProjectBlockContent,
  toggleWorkflowDrawer,
  openWorkflowDrawer,
  closeWorkflowDrawer,
  setProjectContent,
  toggleProjectWorkflowDrawer,
  openProjectWorkflowDrawer,
  closeProjectWorkflowDrawer,
  setCurrentFrameIndex,
} = appSlice.actions;

export default appSlice.reducer;
