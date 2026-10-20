"use client";

import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";
import { localStorageService } from "./localStorageService";

export interface FavoriteUnit {
  unitId: number;
  unitName: string;
  projectId: number;
}

export interface ProjectFavorites {
  [projectId: string]: FavoriteUnit[];
}

export const favoritesService = {
  getAllFavorites: (): ProjectFavorites => {
    try {
      const favorites = localStorageService.getItem(
        LocalStorageKeysEnum.Favorites
      );
      return favorites || {};
    } catch (error) {
      return {};
    }
  },

  getProjectFavorites: (projectId: number): FavoriteUnit[] => {
    try {
      const allFavorites = favoritesService.getAllFavorites();
      return allFavorites[projectId.toString()] || [];
    } catch (error) {
      return [];
    }
  },

  addToFavorites: (
    projectId: number,
    unitId: number,
    unitName: string
  ): void => {
    try {
      const allFavorites = favoritesService.getAllFavorites();
      const projectKey = projectId.toString();

      if (!allFavorites[projectKey]) {
        allFavorites[projectKey] = [];
      }

      const existingIndex = allFavorites[projectKey].findIndex(
        (fav) => fav.unitId === unitId
      );

      if (existingIndex === -1) {
        allFavorites[projectKey].push({
          unitId,
          unitName,
          projectId,
        });
        localStorageService.setItem(
          LocalStorageKeysEnum.Favorites,
          allFavorites
        );
      }
    } catch (error) {}
  },

  removeFromFavorites: (projectId: number, unitId: number): void => {
    try {
      const allFavorites = favoritesService.getAllFavorites();
      const projectKey = projectId.toString();

      if (allFavorites[projectKey]) {
        allFavorites[projectKey] = allFavorites[projectKey].filter(
          (fav) => fav.unitId !== unitId
        );

        if (allFavorites[projectKey].length === 0) {
          delete allFavorites[projectKey];
        }

        localStorageService.setItem(
          LocalStorageKeysEnum.Favorites,
          allFavorites
        );
      }
    } catch (error) {}
  },

  isUnitFavorited: (projectId: number, unitId: number): boolean => {
    try {
      const projectFavorites = favoritesService.getProjectFavorites(projectId);
      return projectFavorites.some((fav) => fav.unitId === unitId);
    } catch (error) {
      return false;
    }
  },

  toggleFavorite: (
    projectId: number,
    unitId: number,
    unitName: string
  ): boolean => {
    try {
      const isFavorited = favoritesService.isUnitFavorited(projectId, unitId);

      if (isFavorited) {
        favoritesService.removeFromFavorites(projectId, unitId);
        return false;
      } else {
        favoritesService.addToFavorites(projectId, unitId, unitName);
        return true;
      }
    } catch (error) {
      return false;
    }
  },

  getProjectFavoritesCount: (projectId: number): number => {
    try {
      const projectFavorites = favoritesService.getProjectFavorites(projectId);
      return projectFavorites.length;
    } catch (error) {
      return 0;
    }
  },

  clearProjectFavorites: (projectId: number): void => {
    try {
      const allFavorites = favoritesService.getAllFavorites();
      const projectKey = projectId.toString();

      if (allFavorites[projectKey]) {
        delete allFavorites[projectKey];
        localStorageService.setItem(
          LocalStorageKeysEnum.Favorites,
          allFavorites
        );
      }
    } catch (error) {}
  },
};
