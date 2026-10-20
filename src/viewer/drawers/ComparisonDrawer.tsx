"use client";
import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Dialog,
  DialogContent,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IUnitItem } from "@/types/IUnitItem";
import { IUnitTypeModel } from "@/types/IUnitTypeModel";
import { useAppSelector } from "@redux/hooks";
import { useFavorites } from "@hooks/useFavorites";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { IPresentationInitResponse } from "@/types/IPresentationInitResponse";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";

const ComparisonDrawer: React.FC = () => {
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showDifferences, setShowDifferences] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    unitName: string;
  } | null>(null);
  const { presentationContentResponse, presentationInitResponse } =
    useAppSelector((state) => state.AppReducer);
  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );
  const initResponse =
    presentationInitResponse || ({} as IPresentationInitResponse);
  const {
    isComparisonDrawerOpen,
    toggleFavorite,
    toggleShowFavoritesOnly,
    filterFavoriteUnits,
  } = useFavorites(initResponse?.projectId);

  const unitTemplates = useMemo(
    () => initResponse?.unitTemplates || [],
    [initResponse?.unitTemplates]
  );

  const favoriteUnits = useMemo(() => {
    return filterFavoriteUnits(units);
  }, [filterFavoriteUnits, units]);

  const unitTypes = useMemo(
    () => initResponse?.unitTypes || [],
    [initResponse?.unitTypes]
  );

  const getRoomName = (unit: IUnitItem): string => {
    const unitType = unitTypes?.find(
      (type: IUnitTypeModel) => type.id === unit.unitTypeId
    );
    return unitType?.name || "N/A";
  };

  const getNetArea = useCallback(
    (unit: IUnitItem): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId
      );

      return templateUnit?.netArea || unit.netArea || 0;
    },
    [unitTemplates]
  );

  const getGrossArea = useCallback(
    (unit: IUnitItem): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId
      );
      return templateUnit?.grossArea || unit.grossArea || 0;
    },
    [unitTemplates]
  );

  const getImageUrl = (unit: IUnitItem): string => {
    const templateUnit = unitTemplates.find(
      (template) => template.id === unit?.templateId
    );
    return templateUnit?.image?.url || "/placeholder.png";
  };

  const getAllSpecificationNames = useMemo(() => {
    const specNames = new Set<string>();

    favoriteUnits.forEach((unit) => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId
      );

      if (templateUnit?.specifications) {
        templateUnit.specifications.forEach((spec) => {
          specNames.add(spec.name);
        });
      }
    });

    return Array.from(specNames).sort();
  }, [favoriteUnits, unitTemplates]);

  const getSpecificationValue = (unit: IUnitItem, specName: string): string => {
    const templateUnit = unitTemplates.find(
      (template) => template.id === unit?.templateId
    );

    if (!templateUnit?.specifications) {
      return "N/A";
    }

    const spec = templateUnit.specifications.find((s) => s.name === specName);

    return spec?.value || "N/A";
  };

  const comparisonFeatures = useMemo(() => {
    const baseFeatures = [
      {
        key: "image",
        label: t("UnitPlan"),
        getValue: (unit: IUnitItem) => getImageUrl(unit),
        isImage: true,
      },
      {
        key: "name",
        label: t("Unit"),
        getValue: (unit: IUnitItem) =>
          unit?.block?.name + " - " + unit?.unitNumber || "N/A",
      },
      {
        key: "floor",
        label: t("Floor"),
        getValue: (unit: IUnitItem) => unit.floor?.number?.toString() || "1",
      },
      {
        key: "room",
        label: t("Room"),
        getValue: (unit: IUnitItem) => getRoomName(unit),
      },
      {
        key: "netArea",
        label: areaLabel("netArea"),
        getValue: (unit: IUnitItem) => `${getNetArea(unit)} m²`,
      },
      {
        key: "grossArea",
        label: areaLabel("grossArea"),
        getValue: (unit: IUnitItem) => `${getGrossArea(unit)} m²`,
      },
      {
        key: "facade",
        label: t("Facade"),
        getValue: (unit: IUnitItem) => getFacadeDirection(unit, t),
      },
      {
        key: "status",
        label: t("Status"),
        getValue: (unit: IUnitItem) => t("Available"),
      },
    ];

    const specificationFeatures = getAllSpecificationNames.map((specName) => ({
      key: `spec_${specName}`,
      label: specName,
      getValue: (unit: IUnitItem) => getSpecificationValue(unit, specName),
      isImage: false,
    }));

    // Projede gizlenen alan karşılaştırma tablosunda satır olarak hiç yer almaz.
    const visibleBaseFeatures = baseFeatures.filter(
      (f) =>
        !(
          (f.key === "netArea" || f.key === "grossArea") &&
          isAreaHidden(f.key)
        ),
    );

    return [...visibleBaseFeatures, ...specificationFeatures];
  }, [t, getAllSpecificationNames, areaLabel, isAreaHidden]);

  const hasUnitDifference = useCallback(
    (feature: any, unitIndex: number) => {
      if (!showDifferences || favoriteUnits.length < 2) return false;

      if (feature.key === "name" || feature.key === "image") return false;

      const values = favoriteUnits.map((unit) => feature.getValue(unit));
      const currentValue = values[unitIndex];

      return values.some(
        (value, index) => index !== unitIndex && value !== currentValue
      );
    },
    [showDifferences, favoriteUnits]
  );

  if (favoriteUnits.length === 0) {
    return (
      <Drawer
        anchor="left"
        open={isComparisonDrawerOpen}
        onClose={toggleShowFavoritesOnly}
        variant="temporary"
        hideBackdrop
        sx={{
          zIndex: 1450,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100vw" : "calc(100vw - 460px)",
            height: "100vh",
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <CompareIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                {t("CompareUnits")}
              </Typography>
            </Stack>
            <IconButton onClick={toggleShowFavoritesOnly} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
              textAlign: "center",
            }}
          >
            <CompareIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("NoFavoritesToCompare")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("AddUnitsToFavoritesToCompare")}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor={"left"}
      open={isComparisonDrawerOpen}
      onClose={toggleShowFavoritesOnly}
      variant="temporary"
      hideBackdrop
      sx={{
        zIndex: 9999,
        "& .MuiDrawer-paper": {
          width: isMobile ? "100vw" : "calc(100vw - 460px)",
          height: "100vh",
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "grey.300",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <CompareIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {t("CompareUnits")} ({favoriteUnits.length})
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showDifferences}
                  onChange={(e) => setShowDifferences(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  {t("ShowDifferences")}
                </Typography>
              }
              sx={{
                m: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                },
              }}
            />
            <IconButton onClick={toggleShowFavoritesOnly} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: "calc(100vh - 160px)",
              overflow: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "grey.50",
                      borderRight: "1px solid",
                      borderColor: "grey.200",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      width: isMobile ? 50 : 100,
                      p: isMobile ? 0.5 : 1,
                      height: isMobile ? 60 : 70,
                    }}
                  >
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      fontWeight={600}
                      sx={{ fontSize: isMobile ? "0.65rem" : "0.8rem" }}
                    >
                      {t("Features")}
                    </Typography>
                  </TableCell>
                  {favoriteUnits.map((unit, index) => (
                    <TableCell
                      key={unit.id}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "grey.50",
                        width: isMobile ? 120 : 150,
                        p: isMobile ? 0.5 : 1,
                        height: isMobile ? 60 : 70,
                      }}
                    >
                      <Stack
                        direction="column"
                        alignItems="center"
                        spacing={isMobile ? 0.25 : 0.5}
                      >
                        <Typography
                          variant={isMobile ? "caption" : "body2"}
                          fontWeight={600}
                          noWrap
                          sx={{
                            fontSize: isMobile ? "0.65rem" : "0.8rem",
                            lineHeight: 1.2,
                          }}
                          title={
                            unit?.block?.name + " - " + unit?.unitNumber ||
                            `Unit ${unit.id}`
                          }
                        >
                          {isMobile &&
                          (unit?.block?.name + " - " + unit?.unitNumber || "")
                            .length > 6
                            ? `${(
                                unit?.block?.name + " - " + unit?.unitNumber ||
                                ""
                              ).slice(0, 6)}...`
                            : unit?.block?.name + " - " + unit?.unitNumber ||
                              `Unit ${unit.id}`}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(unit)}
                          sx={{
                            color: "red",
                            "&:hover": {
                              bgcolor: "rgba(255, 0, 0, 0.1)",
                            },
                            p: isMobile ? 0.25 : 0.5,
                          }}
                          title={t("RemoveFromFavorites")}
                        >
                          <FavoriteIcon sx={{ fontSize: isMobile ? 12 : 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonFeatures.map((feature, featureIndex) => (
                  <TableRow
                    key={feature.key}
                    sx={{
                      "&:nth-of-type(odd)": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.02)"
                            : "grey.25",
                      },
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        borderRight: "1px solid",
                        borderColor: "grey.200",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "grey.50",
                        p: isMobile ? 0.5 : 1,
                        width: isMobile ? 50 : 100,
                      }}
                    >
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        fontWeight={600}
                        sx={{ fontSize: isMobile ? "0.65rem" : "0.8rem" }}
                      >
                        {feature.label}
                      </Typography>
                    </TableCell>
                    {favoriteUnits.map((unit, unitIndex) => (
                      <TableCell
                        key={`${unit.id}-${feature.key}`}
                        align="center"
                        sx={{
                          p: feature.isImage
                            ? isMobile
                              ? 0.5
                              : 1
                            : isMobile
                            ? 0.5
                            : 1.5,
                          width: isMobile ? 120 : 150,
                          maxWidth: isMobile ? 120 : 150,
                          bgcolor: hasUnitDifference(feature, unitIndex)
                            ? theme.palette.mode === "dark"
                              ? "rgba(255, 193, 7, 0.2)"
                              : "#fff3cd"
                            : "inherit",
                        }}
                      >
                        {feature.isImage ? (
                          <Box
                            sx={{
                              width: isMobile ? 45 : 70,
                              height: isMobile ? 45 : 70,
                              position: "relative",
                              mx: "auto",
                              borderRadius: 1,
                              overflow: "hidden",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.08)"
                                  : "grey.100",
                              cursor: "pointer",
                              transition: "transform 0.2s",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                            onClick={() =>
                              setFullscreenImage({
                                url:
                                  feature.getValue(unit) || "/placeholder.png",
                                unitName:
                                  unit?.block?.name +
                                    " - " +
                                    unit?.unitNumber || "N/A",
                              })
                            }
                          >
                            <Image
                              src={feature.getValue(unit) || "/placeholder.png"}
                              alt={`${unit.name} plan`}
                              fill
                              style={{
                                objectFit: "contain",
                              }}
                              sizes={isMobile ? "45px" : "70px"}
                            />
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: isMobile ? "0.65rem" : "0.8rem",
                              wordBreak: "break-word",
                              lineHeight: 1.2,
                              maxHeight:
                                feature.key === "specifications"
                                  ? "60px"
                                  : "auto",
                              overflow:
                                feature.key === "specifications"
                                  ? "hidden"
                                  : "visible",
                              textOverflow: "ellipsis",
                              display:
                                feature.key === "specifications"
                                  ? "-webkit-box"
                                  : "block",
                              WebkitLineClamp:
                                feature.key === "specifications" ? 3 : "unset",
                              WebkitBoxOrient:
                                feature.key === "specifications"
                                  ? "vertical"
                                  : "unset",
                            }}
                            title={
                              feature.key === "specifications"
                                ? feature.getValue(unit)
                                : undefined
                            }
                          >
                            {feature.getValue(unit)}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "grey.300",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "grey.50",
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            {t("ComparisonNote")}
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={fullscreenImage !== null}
        onClose={() => setFullscreenImage(null)}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            margin: 0,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 50,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
              zIndex: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {fullscreenImage?.unitName || ""}
            </Typography>
            <IconButton onClick={() => setFullscreenImage(null)} size="large">
              <CloseIcon sx={{ color: "white" }} fontSize="large" />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "100vh",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {fullscreenImage && (
              <Image
                src={fullscreenImage.url}
                alt={fullscreenImage.unitName}
                fill
                style={{
                  objectFit: "contain",
                }}
                sizes="100vw"
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
};

export default ComparisonDrawer;
