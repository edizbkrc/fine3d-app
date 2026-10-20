"use client";

import React from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useColorMode } from "@/contexts/ColorModeContext";
import { ThemeOptionsEnum } from "@enums/ThemeOptionsEnum";

interface ThemeToggleButtonProps {
  size?: "small" | "medium" | "large";
  color?: "inherit" | "default" | "primary" | "secondary";
  edge?: false | "start" | "end";
  showTooltip?: boolean;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  size = "medium",
  color = "inherit",
  edge = false,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const t = useTranslations("Common");

  const isDarkMode = mode === ThemeOptionsEnum.DARK;
  const tooltipText = isDarkMode ? t("SwitchToLightMode") : t("SwitchToDarkMode");

  const button = (
    <IconButton
      onClick={toggleColorMode}
      color={color}
      size={size}
      edge={edge}
      aria-label="toggle theme"
      sx={{
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "rotate(180deg)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      {isDarkMode ? (
        <Brightness7
          sx={{
            transition: "transform 0.3s ease",
            color: "inherit",
          }}
        />
      ) : (
        <Brightness4
          sx={{
            transition: "transform 0.3s ease",
            color: "inherit",
          }}
        />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} placement="left">
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggleButton;
