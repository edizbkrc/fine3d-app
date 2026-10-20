"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@redux/hooks";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { getDefaultTheme } from "@/assets/theme/theme";
import { ColorModeProvider } from "@/contexts/ColorModeContext";
import { setTheme } from "@redux/appSlice";
import { ThemeOptionsEnum } from "@enums/ThemeOptionsEnum";
import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";

export default function CustomThemeProvider({ children }: any) {
  const dispatch = useDispatch();
  const themeMode = useAppSelector((state) => state.AppReducer.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LocalStorageKeysEnum.THEME);

      if (
        savedTheme &&
        Object.values(ThemeOptionsEnum).includes(savedTheme as ThemeOptionsEnum)
      ) {

        dispatch(setTheme(savedTheme as ThemeOptionsEnum));
      } else {

        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        const systemTheme = prefersDark
          ? ThemeOptionsEnum.DARK
          : ThemeOptionsEnum.LIGHT;

        dispatch(setTheme(systemTheme));
        localStorage.setItem(LocalStorageKeysEnum.THEME, systemTheme);
      }
    } catch (error) {
      console.error("Theme initialization error:", error);
      dispatch(setTheme(ThemeOptionsEnum.LIGHT));
    }

    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (!mounted) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(LocalStorageKeysEnum.THEME);

      if (!savedTheme) {
        const newTheme = e.matches
          ? ThemeOptionsEnum.DARK
          : ThemeOptionsEnum.LIGHT;
        dispatch(setTheme(newTheme));
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, [dispatch, mounted]);

  const getTheme = useCallback(() => {
    return themeMode;
  }, [themeMode]);

  const muiTheme = useMemo(
    () => getDefaultTheme(getTheme() as any),
    [getTheme]
  );

  useEffect(() => {
    if (!mounted) return;

    try {
      const themeColor =
        getTheme() === ThemeOptionsEnum.DARK ? "#060D12" : "#FCFBFA";

      let meta = document.querySelector('meta[name="theme-color"]');

      if (!meta) {
        meta = document.createElement("meta");
        (meta as HTMLMetaElement).name = "theme-color";
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", themeColor);
    } catch (error) {
      console.error("Theme color meta update error:", error);
    }
  }, [getTheme, themeMode, mounted]);

  // Mount olana kadar null dönme — App Router'da children kaybolup error boundary'ye düşüyordu
  return (
    <ColorModeProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        <GlobalStyles
          styles={(theme) => ({

            "*": {
              transition: "background-color 0.3s ease, color 0.3s ease",
            },

            "::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "::-webkit-scrollbar-thumb": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : theme.palette.primary.main,
              borderRadius: "10px",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.5)"
                    : "#C6C6C6",
              },
            },
            "::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.background.default,
            },

            "::selection": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          })}
        />
        {children}
      </ThemeProvider>
    </ColorModeProvider>
  );
}
