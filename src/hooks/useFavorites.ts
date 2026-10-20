"use client";

import { useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import {
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleComparisonDrawer,
  closeComparisonDrawer,
} from "@redux/appSlice";
import {
  favoritesService,
  FavoriteUnit,
} from "@/helpers/Common/favoritesService";
import { IUnitItem } from "@/types/IUnitItem";

export const useFavorites = (projectId: number | undefined) => {
  const dispatch = useAppDispatch();
  const { favorites, isComparisonDrawerOpen } = useAppSelector(
    (state) => state.AppReducer
  );

  useEffect(() => {
    if (projectId) {
      const projectFavorites = favoritesService.getProjectFavorites(projectId);
      dispatch(setFavorites(projectFavorites));
    } else {
      dispatch(setFavorites([]));
    }
  }, [projectId, dispatch]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (projectId) {
        const projectFavorites =
          favoritesService.getProjectFavorites(projectId);
        dispatch(setFavorites(projectFavorites));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [projectId, dispatch]);

  const toggleFavorite = useCallback(
    (unit: IUnitItem) => {
      if (!projectId) return;

      const newIsFavorited = favoritesService.toggleFavorite(
        projectId,
        unit.id,
        unit.name || `Unit ${unit.id}`
      );

      if (newIsFavorited) {
        dispatch(
          addToFavorites({
            unitId: unit.id,
            unitName: unit.name || `Unit ${unit.id}`,
            projectId: projectId,
          })
        );
      } else {
        dispatch(removeFromFavorites(unit.id));
      }

      return newIsFavorited;
    },
    [projectId, dispatch]
  );

  const isUnitFavorited = useCallback(
    (unitId: number): boolean => {
      if (!projectId) return false;
      return favorites.some((fav) => fav.unitId === unitId);
    },
    [projectId, favorites]
  );

  const favoritesCount = favorites.length;

  const handleToggleComparisonDrawer = useCallback(() => {
    dispatch(toggleComparisonDrawer());
  }, [dispatch]);

  const handleCloseComparisonDrawer = useCallback(() => {
    dispatch(closeComparisonDrawer());
  }, [dispatch]);

  const filterFavoriteUnits = useCallback(
    (units: IUnitItem[]): IUnitItem[] => {
      if (!isComparisonDrawerOpen || !projectId) {
        return units;
      }

      const favoriteUnitIds = favorites.map((fav) => fav.unitId);
      return units.filter((unit) => favoriteUnitIds.includes(unit.id));
    },
    [isComparisonDrawerOpen, projectId, favorites]
  );

  const clearAllFavorites = useCallback(() => {
    if (!projectId) return;

    favoritesService.clearProjectFavorites(projectId);
    dispatch(setFavorites([]));
  }, [projectId, dispatch]);

  return {
    favorites,
    favoritesCount,
    isShowingFavoritesOnly: isComparisonDrawerOpen,
    isComparisonDrawerOpen,
    toggleFavorite,
    isUnitFavorited,
    toggleShowFavoritesOnly: handleToggleComparisonDrawer,
    closeComparisonDrawer: handleCloseComparisonDrawer,
    filterFavoriteUnits,
    clearAllFavorites,
  };
};
