"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useMemo, memo } from "react";
import { useTranslations } from "next-intl";

interface HorizontalCompassProps {
  angleDeg: number;
  isMobile?: boolean;
}

const HorizontalCompass = memo(
  ({ angleDeg, isMobile = false }: HorizontalCompassProps) => {
    const t = useTranslations("Common");
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

    const width = isXs ? "180px" : isSm ? "210px" : isMd ? "240px" : "270px";
    const height = isXs ? "34px" : isSm ? "38px" : isMd ? "42px" : "48px";
    const arrowSize = isXs ? 16 : isSm ? 18 : isMd ? 20 : 22;
    const letterSize = isXs ? 13 : isSm ? 14 : isMd ? 15 : 16;
    const dotSize = isXs ? 7 : isSm ? 8 : isMd ? 8 : 9;

    const normalizedAngle = ((angleDeg % 360) + 360) % 360;

    const pixelsPerDegree = isXs ? 2.4 : isSm ? 2.8 : isMd ? 3.2 : 3.6;
    const offset = -(normalizedAngle * pixelsPerDegree);

    const compassStrip = useMemo(() => {
      const directions = [
        t("CompassN"),
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        t("CompassE"),
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        t("CompassS"),
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        t("CompassW"),
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
        "•",
      ];

      const spacing = 5.625 * pixelsPerDegree;

      return directions.map((label, index) => {
        const isLetter = label !== "•";
        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              width: `${spacing}px`,
              fontSize: isLetter ? `${letterSize}px` : `${dotSize}px`,
              fontWeight: isLetter ? 600 : 400,
              color: "#fff",
              textAlign: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              flexShrink: 0,
              opacity: 1,
            }}
          >
            {label}
          </span>
        );
      });
    }, [t, pixelsPerDegree, letterSize, dotSize]);

    return (
      <Box
        sx={{
          position: "relative",
          width: width,
          height: height,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          borderRadius: "20px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-2px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            zIndex: 10002,
            display: "flex",
            alignItems: "center",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
            opacity: 0.9,
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: arrowSize, fontWeight: 300 }} />
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            zIndex: 10000,
          }}
        >
          {[0, 1, 2].map((cycle) => (
            <div
              key={cycle}
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                height: "100%",
                left: "50%",
                transform: `translateX(calc(-50% + ${
                  offset + cycle * 360 * pixelsPerDegree
                }px))`,
                transition: "transform 0.1s linear",
                whiteSpace: "nowrap",
                userSelect: "none",
                willChange: "transform",
              }}
            >
              {compassStrip}
            </div>
          ))}
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: "-2px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            zIndex: 10002,
            display: "flex",
            alignItems: "center",
            opacity: 0.9,
          }}
        >
          <KeyboardArrowDownIcon
            sx={{ fontSize: arrowSize, fontWeight: 300 }}
          />
        </Box>
      </Box>
    );
  }
);

export default HorizontalCompass;
