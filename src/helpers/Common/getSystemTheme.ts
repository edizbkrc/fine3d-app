import { ThemeOptionsEnum } from "@enums/ThemeOptionsEnum";

export const getSystemTheme = (): ThemeOptionsEnum => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return ThemeOptionsEnum.DARK;
  }
  return ThemeOptionsEnum.LIGHT;
};
