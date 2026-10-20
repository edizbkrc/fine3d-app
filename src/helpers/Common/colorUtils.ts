import { alpha } from "@mui/material/styles";

export const toRgba = (color: string, alphaValue: number): string => {
  return alpha(color, alphaValue);
};

export const ALPHA_VALUES = {
  HIGH: 0.95,
  MEDIUM_HIGH: 0.8,
  MEDIUM: 0.6,
  MEDIUM_LOW: 0.4,
  LOW: 0.3,
  VERY_LOW: 0.1,
} as const;
