"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@redux/hooks";
import { setTheme } from "@redux/appSlice";
import { ThemeOptionsEnum } from "@enums/ThemeOptionsEnum";
import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";

interface ColorModeContextType {
  mode: ThemeOptionsEnum;
  toggleColorMode: () => void;
  setColorMode: (mode: ThemeOptionsEnum) => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: ThemeOptionsEnum.LIGHT,
  toggleColorMode: () => {},
  setColorMode: () => {},
});

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
};

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const themeMode = useAppSelector((state) => state.AppReducer.theme);

  const saveThemeToStorage = useCallback((mode: ThemeOptionsEnum) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LocalStorageKeysEnum.THEME, mode);

        const themeColor =
          mode === ThemeOptionsEnum.DARK ? "#060D12" : "#FCFBFA";
        let meta = document.querySelector('meta[name="theme-color"]');

        if (!meta) {
          meta = document.createElement("meta");
          (meta as HTMLMetaElement).name = "theme-color";
          document.head.appendChild(meta);
        }

        meta.setAttribute("content", themeColor);
      } catch (error) {
        console.error("Theme save error:", error);
      }
    }
  }, []);

  const setColorMode = useCallback(
    (mode: ThemeOptionsEnum) => {
      if (mode === ThemeOptionsEnum.SYSTEM) {

        const prefersDark =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        const actualMode = prefersDark
          ? ThemeOptionsEnum.DARK
          : ThemeOptionsEnum.LIGHT;

        dispatch(setTheme(actualMode));
        saveThemeToStorage(actualMode);
      } else {
        dispatch(setTheme(mode));
        saveThemeToStorage(mode);
      }
    },
    [dispatch, saveThemeToStorage]
  );

  const toggleColorMode = useCallback(() => {
    const newMode =
      themeMode === ThemeOptionsEnum.LIGHT
        ? ThemeOptionsEnum.DARK
        : ThemeOptionsEnum.LIGHT;

    setColorMode(newMode);
  }, [themeMode, setColorMode]);

  const value = {
    mode: themeMode,
    toggleColorMode,
    setColorMode,
  };

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};

export default ColorModeContext;
