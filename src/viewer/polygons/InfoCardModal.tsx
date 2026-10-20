"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  Dialog,
  Tab,
  Tabs,
  Typography,
  useTheme,
  IconButton,
  Zoom,
  Grow,
  useMediaQuery,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { resolveCdnImageUrl } from "@helpers/Common/cdnImageUrl";
import { IInfoCard } from "@/types/IInfoCard";

const ScaleTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
    startPosition?: { x: number; y: number };
  },
  ref: React.Ref<unknown>,
) {
  return (
    <Zoom
      ref={ref}
      {...props}
      style={{
        transformOrigin: "center center",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      timeout={400}
    />
  );
});

interface InfoCardModalProps {
  open: boolean;
  onClose: () => void;
  infoCard: IInfoCard | null;
  startPosition?: { x: number; y: number };
  animateFromCard?: boolean;
}

export default function InfoCardModal({
  open,
  onClose,
  infoCard,
  startPosition,
  animateFromCard = false,
}: InfoCardModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = useTranslations("Common");
  const [selectedTab, setSelectedTab] = useState(0);

  const getItemImageUrl = React.useCallback(
    (item: (typeof sortedItems)[number]): string | undefined => {
      if (!item.image?.url) {
        return undefined;
      }
      return resolveCdnImageUrl(item.image.url, { preferMobile: isMobile });
    },
    [isMobile],
  );

  if (!infoCard) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const sortedItems = [...(infoCard?.items || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            zIndex: 1500,
            borderRadius: 3,
            maxHeight: "85vh",
            overflow: "hidden",
            ...(animateFromCard &&
              startPosition && {
                transformOrigin: `${startPosition.x}px ${startPosition.y}px`,
              }),
          },
        },
        transition: ScaleTransition,
      }}
      sx={{
        zIndex: 9999,
      }}
    >
      <Card sx={{ border: "none", boxShadow: "none", height: "100%" }}>
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: "1.5rem",
            }}
          >
            {infoCard.name || t("Information")}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {sortedItems.length > 0 ? (
          <Box
            sx={{
              height: "calc(100% - 80px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  fontSize: "1rem",
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 56,
                  py: 2,
                },
              }}
            >
              {sortedItems.map((item, index) => (
                <Tab key={item.id} label={item.name || `Item ${index + 1}`} />
              ))}
            </Tabs>

            <Box sx={{ flex: 1, overflow: "auto" }}>
              {sortedItems[selectedTab] && (
                <Box sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 4,
                      alignItems: "start",
                    }}
                  >
                    <Box>
                      {sortedItems[selectedTab].image?.url ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: "100%",
                            height: { xs: 250, md: 350 },
                            borderRadius: 2,
                            objectFit: "cover",
                            boxShadow: theme.shadows[4],
                          }}
                          image={getItemImageUrl(sortedItems[selectedTab])}
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
                            height: { xs: 250, md: 350 },
                            backgroundColor: theme.palette.grey[200],
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: theme.shadows[2],
                          }}
                        >
                          <Typography variant="h6" color="text.secondary">
                            {t("No Image")}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 3,
                          color: theme.palette.text.primary,
                          fontSize: { xs: "1.75rem", md: "2rem" },
                        }}
                      >
                        {sortedItems[selectedTab].name || t("Untitled")}
                      </Typography>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          fontSize: "1.1rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {sortedItems[selectedTab].description ||
                          t("No description available")}
                      </Typography>
                    </Box>
                  </Box>
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
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {t("No items available")}
            </Typography>
          </Box>
        )}
      </Card>
    </Dialog>
  );
}
