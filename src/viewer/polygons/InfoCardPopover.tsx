"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  Popover,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { IInfoCard } from "@/types/IInfoCard";

interface InfoCardPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  infoCard: IInfoCard | null;
  position?: { x: number; y: number };
  containerWidth?: number;
  containerHeight?: number;
  isHoverMode?: boolean;
}

export default function InfoCardPopover({
  open,
  anchorEl,
  onClose,
  infoCard,
  position,
  containerWidth,
  containerHeight,
  isHoverMode = false,
}: InfoCardPopoverProps) {
  const theme = useTheme();
  const t = useTranslations("Common");
  const [selectedTab, setSelectedTab] = useState(0);

  if (!infoCard) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (isHoverMode && position && containerWidth && containerHeight) {
    const cardWidth = 300;
    const cardHeight = 320;

    const adjustedX = Math.min(
      Math.max(position.x + 15, 10),
      containerWidth - cardWidth - 10
    );

    const adjustedY = Math.min(
      Math.max(position.y - 60, 10),
      containerHeight - cardHeight - 10
    );

    const sortedItems = [...(infoCard?.items || [])].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    return (
      <Card
        sx={{
          position: "absolute",
          left: adjustedX,
          top: adjustedY,
          width: cardWidth,
          maxHeight: cardHeight,
          backgroundColor: theme.palette.background.paper,
          zIndex: 999999,
          pointerEvents: "none",
          transform: "translateZ(0)",
          boxShadow: theme.shadows[8],
          borderRadius: 2,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <Box
          sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: "1rem",
            }}
          >
            {infoCard.name || t("Information")}
          </Typography>
        </Box>

        {sortedItems?.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  fontSize: "0.75rem",
                  textTransform: "none",
                  fontWeight: 500,
                  minHeight: 40,
                },
              }}
            >
              {sortedItems?.map((item, index) => (
                <Tab key={item.id} label={item.name || `Item ${index + 1}`} />
              ))}
            </Tabs>

            <Box sx={{ p: 1.5 }}>
              {sortedItems[selectedTab] && (
                <Box>
                  {sortedItems[selectedTab].image?.url ? (
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        height: 120,
                        borderRadius: 1.5,
                        objectFit: "cover",
                        mb: 1.5,
                      }}
                      image={sortedItems[selectedTab].image.url ?? undefined}
                      alt={
                        sortedItems[selectedTab].image.altText ||
                        sortedItems[selectedTab].name ||
                        ""
                      }
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 120,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No Image")}
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.4,
                      fontSize: "0.875rem",
                    }}
                  >
                    {sortedItems[selectedTab].description ||
                      t("No description available")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("No items available")}
            </Typography>
          </Box>
        )}
      </Card>
    );
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      sx={{
        "& .MuiPopover-paper": {
          maxWidth: 300,
          minWidth: 300,
          maxHeight: 600,
          overflow: "auto",
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Card sx={{ border: "none", boxShadow: "none" }}>
        <Box
          sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: "1rem",
            }}
          >
            {infoCard.name || t("Information")}
          </Typography>
        </Box>

        {infoCard.items.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  fontSize: "0.875rem",
                  textTransform: "none",
                  fontWeight: 500,
                  minHeight: 48,
                },
              }}
            >
              {infoCard.items
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item, index) => (
                  <Tab key={item.id} label={item.name || `Item ${index + 1}`} />
                ))}
            </Tabs>

            <Box sx={{ p: 2 }}>
              {infoCard.items.sort((a, b) => a.displayOrder - b.displayOrder)[
                selectedTab
              ] && (
                <Box>
                  {infoCard.items.sort(
                    (a, b) => a.displayOrder - b.displayOrder
                  )[selectedTab].image?.url ? (
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        height: 150,
                        borderRadius: 1.5,
                        objectFit: "cover",
                        mb: 1.5,
                      }}
                      image={
                        infoCard.items.sort(
                          (a, b) => a.displayOrder - b.displayOrder
                        )[selectedTab].image?.url || ""
                      }
                      alt={
                        infoCard.items.sort(
                          (a, b) => a.displayOrder - b.displayOrder
                        )[selectedTab].image?.altText ||
                        infoCard.items.sort(
                          (a, b) => a.displayOrder - b.displayOrder
                        )[selectedTab].name ||
                        ""
                      }
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 150,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No Image")}
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.4,
                      fontSize: "0.875rem",
                    }}
                  >
                    {infoCard.items.sort(
                      (a, b) => a.displayOrder - b.displayOrder
                    )[selectedTab].description || t("No description available")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("No items available")}
            </Typography>
          </Box>
        )}
      </Card>
    </Popover>
  );
}
