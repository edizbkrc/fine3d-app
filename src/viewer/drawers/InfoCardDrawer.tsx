"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Skeleton,
  useMediaQuery,
  useTheme,
  Card,
  CardMedia,
  Tab,
  Tabs,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { IInfoCard } from "@/types/IInfoCard";
import { closeAllDrawers } from "@redux/appSlice";
import axiosInstance from "@network/axiosInstance";
import { useParams } from "next/navigation";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";

const InfoCardDrawer: React.FC = () => {
  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const t = useTranslations("Common");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<IInfoCard[]>([]);

  const { infoCardDrawerOpen, presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );

  const handleClose = () => {
    dispatch(closeAllDrawers());
  };

  useEffect(() => {
    if (!infoCardDrawerOpen) return;

    setLoading(true);
    axiosInstance
      .patch(
        OpsApiRoutes.GetInfoCards,
        {
          projectId: presentationInitResponse?.projectId,
          projectSlug: ProjectSlug,
          tenantId: TenantId,
          pageNumber: 1,
          rowCount: 1000,
        },
        {
          headers: {
            "Accept-Language": getAcceptLanguage(locale || "en"),
          },
        }
      )
      .then((response) => {
        if (response.data && response.data.isSuccess) {
          setItems(response?.data?.data || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching info cards:", error);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    infoCardDrawerOpen,
    presentationInitResponse?.projectId,
    ProjectSlug,
    TenantId,
    locale,
  ]);

  const renderLoadingSkeleton = () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
        pb: 2,
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} sx={{ width: "100%", height: "fit-content" }}>
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <Skeleton
                variant="rectangular"
                width={isMobile ? "100%" : 120}
                height={isMobile ? 100 : 120}
                sx={{ borderRadius: 1.5, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" height={16} />
                <Skeleton variant="text" height={16} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" height={16} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" height={16} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );

  const InfoCardComponent: React.FC<{ infoCard: IInfoCard }> = ({
    infoCard,
  }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue);
    };

    const sortedItems = [...(infoCard?.items || [])].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    return (
      <Card
        sx={{
          width: "100%",
          height: "fit-content",
          backgroundColor: theme.palette.background.paper,
          boxShadow: 1,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 1.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              fontSize: "1rem",
            }}
          >
            {infoCard.name || t("Information")}
          </Typography>
        </Box>

        {sortedItems.length > 0 ? (
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
              {sortedItems.map((item, index) => (
                <Tab key={item.id} label={item.name || `Item ${index + 1}`} />
              ))}
            </Tabs>

            <Box sx={{ p: 1.5 }}>
              {sortedItems[selectedTab] && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: isMobile ? "100%" : 200,
                      alignSelf: isMobile ? "center" : "flex-start",
                    }}
                  >
                    {sortedItems[selectedTab].image?.url ? (
                      <CardMedia
                        component="img"
                        sx={{
                          width: isMobile ? "100%" : 200,
                          height: isMobile ? 200 : 200,
                          borderRadius: 1.5,
                          objectFit: "cover",
                        }}
                        image={sortedItems[selectedTab].image.url ?? undefined}
                        alt={
                          sortedItems[selectedTab].image.altText ||
                          sortedItems[selectedTab].name ||
                          ""
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: isMobile ? "100%" : 140,
                          height: isMobile ? 100 : 140,
                          backgroundColor: theme.palette.grey[200],
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 200,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {t("No Image")}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.4,
                        fontSize: "0.875rem",
                        wordWrap: "break-word",
                        height: isMobile ? "auto" : 140,
                        maxHeight: isMobile ? 150 : 140,
                        overflow: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: theme.palette.grey[300],
                          borderRadius: "2px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: theme.palette.grey[400],
                        },
                      }}
                    >
                      {sortedItems[selectedTab].description ||
                        t("No description available")}
                    </Typography>
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
  };

  const renderInfoCardsContent = () => {
    if (loading && items.length === 0) {
      return renderLoadingSkeleton();
    }

    if (items.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("No Info Cards Found")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("No info cards available for this project")}
          </Typography>
        </Box>
      );
    }

    const sortedItems = items.sort((a, b) => a.displayOrder - b.displayOrder);

    return (
      <Grid container spacing={2} sx={{ pb: 2 }}>
        {sortedItems.map((infoCard) => (
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={infoCard.id}>
            <InfoCardComponent infoCard={infoCard} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={infoCardDrawerOpen}
      onClose={handleClose}
      variant={isMobile ? "temporary" : "persistent"}
      sx={{
        zIndex: 1400,
        "& .MuiDrawer-paper": {
          width: isMobile ? "100vw" : "calc(100vw - 60px)",
          height: "100vh",
          boxShadow: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          zIndex: 1401,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small">
              <InfoIcon color="primary" />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              {t("Info Cards")}
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon color="primary" />
          </IconButton>
        </Stack>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {renderInfoCardsContent()}
        </Box>
      </Box>
    </Drawer>
  );
};

export default InfoCardDrawer;
