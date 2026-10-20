"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import OpsIconButton from "@components/OpsIconButton";
import ContactFormDialog from "@/viewer/drawers/ContactFormDialog";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Stack,
  useMediaQuery,
  SwipeableDrawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Chip,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HorizontalCompass from "./HorizontalCompass";
import { usePresentationType } from "@hooks/usePresentationType";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import {
  setPolygonsVisible,
  setSelectedFloorId,
  setSelectedUnitId,
  setUnitFullDetailDrawerOpen,
  setUnitDetailDrawerOpen,
  toggleWorkflowDrawer,
  toggleProjectWorkflowDrawer,
} from "@redux/appSlice";
import { useParams } from "next/navigation";
import { useNavigationService } from "@hooks/useNavigationService";
import {
  useRouter as useI18nRouter,
  usePathname as useI18nPathname,
} from "@/i18n/navigation";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";
import LinkWraper from "@components/LinkWraper";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";
import ThemeToggleButton from "@components/ThemeToggleButton";
import useViewer from "@hooks/useViewer";

interface ContactFormData {
  nameSurname: string;
  email: string;
  phoneNumber: string;
  message: string;
  unitId: number | null;
  captchaToken: string;
}

const ViewerToolbar = ({ angleDeg }: { angleDeg: number }) => {
  const prevAngleRef = useRef(angleDeg);
  const smoothRotationRef = useRef(-angleDeg);

  // Compute shortest-path delta to avoid 360→0 wrap-around jumps
  const angleDelta = angleDeg - prevAngleRef.current;
  const shortDelta = ((angleDelta + 180) % 360 + 360) % 360 - 180;
  smoothRotationRef.current -= shortDelta;
  prevAngleRef.current = angleDeg;

  const params = useParams<any>();
  const t = useTranslations("Common");
  const currentLocale = useLocale();
  const i18nRouter = useI18nRouter();
  const i18nPathname = useI18nPathname();
  const navService = useNavigationService();
  const { handleChangePresentation } = useViewer();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);
  const [showUnitCard, setShowUnitCard] = useState(true);
  const { currentPresentationType, canToggle, togglePresentationType } =
    usePresentationType();
  const [showPolygonTooltip, setShowPolygonTooltip] = useState(false);
  const [polygonTooltipAnchor, setPolygonTooltipAnchor] =
    useState<HTMLElement | null>(null);

  const dispatch = useAppDispatch();
  const {
    polygonsVisible,
    galleryDrawerOpen,
    mapDrawerOpen,
    infoCardDrawerOpen,
    currentEntityType,
    selectedUnitId,
    presentationContentResponse,
    presentationInitResponse,
    hasSellMode,
    tourActive,
    workflowDrawerOpen,
    projectBlockContent,
    currentEntityId,
    projectContent,
    projectWorkflowDrawerOpen,
  } = useAppSelector((state) => state.AppReducer);

  useEffect(() => {
    const savedPolygonsVisible = localStorage.getItem(
      LocalStorageKeysEnum.PolygonsVisible
    );
    if (savedPolygonsVisible !== null) {
      const isVisible = JSON.parse(savedPolygonsVisible);
      if (isVisible !== polygonsVisible) {
        dispatch(setPolygonsVisible(isVisible));
      }
    } else {
      dispatch(setPolygonsVisible(false));
      localStorage.setItem(
        LocalStorageKeysEnum.PolygonsVisible,
        JSON.stringify(false)
      );
    }
  }, []);

  useEffect(() => {
    if (!tourActive) {
      const hasSeenPolygonTooltip = localStorage.getItem(
        LocalStorageKeysEnum.PolygonTooltipSeen
      );
      if (!hasSeenPolygonTooltip) {
        const timer = setTimeout(() => {
          setShowPolygonTooltip(true);
          const button = document.querySelector(
            "[data-polygon-visibility-button]"
          );
          if (button) setPolygonTooltipAnchor(button as HTMLElement);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [tourActive]);

  const SellHref = hasSellMode
    ? selectedUnitId
      ? process.env.FINEPORTAL_URL +
        "/" +
        currentLocale +
        "/projects/project/" +
        presentationInitResponse?.projectId +
        "/units/sell?unitId=" +
        selectedUnitId
      : process.env.FINEPORTAL_URL +
        "/" +
        currentLocale +
        "/projects/project/" +
        presentationInitResponse?.projectId +
        "/units/sell"
    : undefined;

  const units: any[] = Array.isArray(presentationContentResponse)
    ? presentationContentResponse
    : Array.isArray(presentationContentResponse?.units)
      ? presentationContentResponse.units
      : [];
  const selectedUnit = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const handleLanguageToggle = () => {
    const newLocale = currentLocale === "tr" ? "en" : "tr";
    i18nRouter.replace(i18nPathname, { locale: newLocale });
  };

  const handleContactFormOpen = () => {
    setContactModalOpen(true);
    setContactFormError(null);
    setContactFormSuccess(false);
    setShowUnitCard(true);
  };

  const handleContactFormClose = () => {
    setContactModalOpen(false);
    setContactFormError(null);
    setContactFormSuccess(false);
    setTimeout(() => {
      setShowUnitCard(true);
    }, 350);
  };

  const handleContactFormSubmit = async (data: ContactFormData) => {
    setContactFormLoading(true);
    setContactFormError(null);

    try {

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          unitId: showUnitCard ? data.unitId : null,
          tenantId: decodeURIComponent(params?.tenantId || ""),
          projectSlug: decodeURIComponent(params?.projectSlug || ""),
          projectId: presentationInitResponse?.projectId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setContactFormSuccess(true);
      setShowUnitCard(true);
      setTimeout(() => {
        handleContactFormClose();
      }, 2000);
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      setContactFormError(error.message || t("FormSubmitError"));
    } finally {
      setContactFormLoading(false);
    }
  };

  const getPresentationIcon = () => {
    if (currentPresentationType === PresentationTypeEnum.NightLight) {
      return <DarkModeIcon />;
    }
    return <LightModeIcon />;
  };

  const handlePolygonsVisibilityToggle = () => {
    dispatch(setPolygonsVisible(!polygonsVisible));
  };

  const handlePolygonTooltipClose = () => {
    setShowPolygonTooltip(false);
    setPolygonTooltipAnchor(null);
    localStorage.setItem(LocalStorageKeysEnum.PolygonTooltipSeen, "true");
  };

  const handleHomeClick = () => {
    navService.closeSideDrawers();
    setMobileMenuOpen(false);
  };

  const handleNavigateBack = () => {
    // URL'e ara replace yazma — clearUrl / closeUnitFullDetailDrawer
    // yarışı bloğa geri atıp siyah ekranda bırakıyordu
    navService.closeSideDrawers();
    dispatch(setUnitFullDetailDrawerOpen(false));
    dispatch(setUnitDetailDrawerOpen(false));
    dispatch(setSelectedUnitId(null));
    dispatch(setSelectedFloorId(null));
    const currentProjectStageId = navService.getCurrentProjectStageId();
    handleChangePresentation(
      EntityTypeEnum.ProjectStage,
      currentProjectStageId || presentationInitResponse?.initialStageId
    );
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleGalleryToggle = () => {
    if (galleryDrawerOpen) {
      navService.closeSideDrawers();
    } else {
      navService.openGallery();
    }
    setMobileMenuOpen(false);
  };

  const handleMapToggle = () => {
    if (mapDrawerOpen) {
      navService.closeSideDrawers();
    } else {
      navService.openMap();
    }
    setMobileMenuOpen(false);
  };

  const handleInfoCardToggle = () => {
    if (infoCardDrawerOpen) {
      navService.closeSideDrawers();
    } else {
      navService.openInfoCard();
    }
    setMobileMenuOpen(false);
  };

  const handleWorkflowToggle = () => {
    dispatch(toggleWorkflowDrawer());
    setMobileMenuOpen(false);
  };

  const handleProjectWorkflowToggle = () => {
    dispatch(toggleProjectWorkflowDrawer());
    setMobileMenuOpen(false);
  };

  const isBlockView = currentEntityType === EntityTypeEnum.Block;
  const showBackButton =
    currentEntityType === EntityTypeEnum.Block ||
    currentEntityType === EntityTypeEnum.Floor;

  const currentBlockWorkflow = isBlockView
    ? projectBlockContent?.find((block: any) => block?.id === Number(currentEntityId))?.workflow
    : null;

  const hasWorkflow =
    isBlockView &&
    currentBlockWorkflow !== null &&
    currentBlockWorkflow !== undefined &&
    currentBlockWorkflow.id !== "00000000-0000-0000-0000-000000000000" &&
    currentBlockWorkflow.phases &&
    currentBlockWorkflow.phases.length > 0;

  const isProjectStageView = currentEntityType === EntityTypeEnum.ProjectStage;

  const currentProjectStageWorkflow = isProjectStageView
    ? projectContent?.find((item: any) => item?.id === Number(currentEntityId))?.workflow
    : null;

  const hasProjectWorkflow =
    isProjectStageView &&
    currentProjectStageWorkflow !== null &&
    currentProjectStageWorkflow !== undefined &&
    currentProjectStageWorkflow.id !== "00000000-0000-0000-0000-000000000000" &&
    currentProjectStageWorkflow.phases &&
    currentProjectStageWorkflow.phases.length > 0;

  const isHomeActive =
    !galleryDrawerOpen && !mapDrawerOpen && !infoCardDrawerOpen;

  return (
    <Box
      data-tour="viewer-toolbar"
      sx={{
        position: ["fixed", "fixed", "absolute"],
        top: [4, 16],
        left: 0,
        width: "100%",
        px: [1, 3],
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: [1300,0],
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <HorizontalCompass angleDeg={angleDeg} isMobile={isMobile} />
        </Box>
      )}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          userSelect: "none",
          pointerEvents: "auto",
          zIndex: 1399,
        }}
      >
        {presentationInitResponse?.companyLogo?.url && (
          <Box
            sx={{ cursor: "pointer" }}
            onClick={handleNavigateBack}
          >
            <Image
              src={presentationInitResponse?.companyLogo?.url}
              alt="Logo"
              width={isMobile ? 80 : 100}
              height={isMobile ? 40 : 50}
              priority
            />
          </Box>
        )}

        {showBackButton && (
          <Chip
            icon={<ArrowBackIcon />}
            label={t("Back")}
            onClick={handleNavigateBack}
            clickable
            sx={{
              height: isMobile ? 32 : 36,
              fontWeight: 600,
              fontSize: isMobile ? "0.8rem" : "0.875rem",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(32, 33, 36, 0.85)"
                  : "rgba(249, 250, 252, 0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "& .MuiChip-icon": {
                ml: 0.75,
                fontSize: "1.1rem",
              },
            }}
          />
        )}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          pointerEvents: "auto",
        }}
      >
        {isMobile && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "radial-gradient(circle, rgba(30,30,30,0.85) 40%, rgba(50,50,50,0.7) 100%)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.12)",
            }}
          >
            {[0, 90, 180, 270].map((deg) => (
              <Box
                key={deg}
                sx={{
                  position: "absolute",
                  width: "1px",
                  height: "3px",
                  bgcolor: "rgba(255,255,255,0.25)",
                  transform: `rotate(${deg}deg) translateY(-16px)`,
                }}
              />
            ))}

            <Box
              sx={{
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: `rotate(${smoothRotationRef.current}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 1,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "4.5px solid transparent",
                  borderRight: "4.5px solid transparent",
                  borderBottom: "12px solid",
                  borderBottomColor: "primary.main",
                  filter: "drop-shadow(0 0 3px rgba(25,118,210,0.5))",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 1,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "4.5px solid transparent",
                  borderRight: "4.5px solid transparent",
                  borderTop: "12px solid rgba(255,255,255,0.22)",
                }}
              />
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  zIndex: 2,
                  boxShadow: "0 0 4px rgba(255,255,255,0.6)",
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "7px",
                  fontWeight: 900,
                  color: "primary.main",
                  lineHeight: 1,
                  letterSpacing: "0.5px",
                  textShadow: "0 0 4px rgba(25,118,210,0.6), 0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                N
              </Typography>
            </Box>
          </Box>
        )}

        {canToggle && (
          <OpsIconButton
            size={isMobile ? "medium" : "large"}
            sx={{ borderRadius: "50%" }}
            onClick={canToggle ? togglePresentationType : undefined}
          >
            {getPresentationIcon()}
          </OpsIconButton>
        )}

        <OpsIconButton
          size={isMobile ? "medium" : "large"}
          sx={{ borderRadius: "50%" }}
          onClick={handlePolygonsVisibilityToggle}
          data-polygon-visibility-button
        >
          {polygonsVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </OpsIconButton>

        {hasWorkflow && (
          <OpsIconButton
            size={isMobile ? "medium" : "large"}
            sx={{
              borderRadius: "50%",

            }}
            onClick={handleWorkflowToggle}
          >
            <AccountTreeIcon
              sx={{
                color: workflowDrawerOpen ? "#fff" : "inherit",
              }}
            />
          </OpsIconButton>
        )}

        {hasProjectWorkflow && (
          <OpsIconButton
            size={isMobile ? "medium" : "large"}
            sx={{
              borderRadius: "50%",
            }}
            onClick={handleProjectWorkflowToggle}
          >
            <AccountTreeIcon
              sx={{
                color: projectWorkflowDrawerOpen ? "#fff" : "inherit",
              }}
            />
          </OpsIconButton>
        )}

        <Popover
          open={showPolygonTooltip}
          anchorEl={polygonTooltipAnchor}
          onClose={handlePolygonTooltipClose}
          disablePortal={false}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiPopover-paper": {
              mt: 1,
              width: { xs: 260, sm: 300 },
              backdropFilter: "blur(20px)",
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "transparent",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                },
                "50%": { boxShadow: "0 12px 40px rgba(0, 0, 0, 0.18)" },
              },
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              p: 2,
              color: "text.primary",
              backdropFilter: "blur(20px)",
              borderRadius: 2,
            }}
          >
            <IconButton
              onClick={handlePolygonTooltipClose}
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                color: "white",
                padding: "4px",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <Typography
              variant="subtitle2"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 0.5,
                pr: 2,
                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              }}
            >
              💡 {t("PolygonTooltipTitle")}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "white",
                mb: 1.5,
                lineHeight: 1.4,
                opacity: 0.95,
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              }}
            >
              {t("PolygonTooltipMessage")}
            </Typography>

            <Box
              onClick={handlePolygonTooltipClose}
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                py: 0.75,
                px: 2,
                borderRadius: 2,
                textAlign: "center",
                fontWeight: 600,
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                },
              }}
            >
              {t("PolygonTooltipButton")}
            </Box>
          </Box>
        </Popover>

        <LinkWraper href={SellHref} target={hasSellMode ? "_blank" : undefined}>
          <OpsIconButton
            size={isMobile ? "medium" : "large"}
            sx={{
              borderRadius: isMobile ? "50%" : "24px",
              px: isMobile ? 1 : 2,
              minWidth: isMobile ? "auto" : "120px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            onClick={SellHref ? undefined : handleContactFormOpen}
          >
            <RealEstateAgentIcon />
            {!isMobile && (
              <Typography variant="body2" fontWeight={600}>
                {t(hasSellMode ? "Sell" : "GetQuote")}
              </Typography>
            )}
          </OpsIconButton>
        </LinkWraper>

        {isMobile && (
          <OpsIconButton
            size="medium"
            sx={{ borderRadius: "50%" }}
            onClick={handleMobileMenuToggle}
          >
            <MenuIcon />
          </OpsIconButton>
        )}
      </Stack>

      <SwipeableDrawer
        anchor="bottom"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => setMobileMenuOpen(true)}
        disableSwipeToOpen={false}
        sx={{
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            maxHeight: "50vh",
            bgcolor: "background.paper",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ p: 0 }}>
            <ListItem sx={{ p: 0 }}>
              <ListItemButton
                onClick={handleHomeClick}
                selected={isHomeActive}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Home"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: isHomeActive ? 600 : 500,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ p: 0 }}>
              <ListItemButton
                onClick={handleGalleryToggle}
                selected={galleryDrawerOpen}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Gallery"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: galleryDrawerOpen ? 600 : 500,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ p: 0 }}>
              <ListItemButton
                onClick={handleInfoCardToggle}
                selected={infoCardDrawerOpen}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Info Cards"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: infoCardDrawerOpen ? 600 : 500,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ p: 0 }}>
              <ListItemButton
                onClick={handleMapToggle}
                selected={mapDrawerOpen}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Map"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: mapDrawerOpen ? 600 : 500,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            {hasWorkflow && (
              <ListItem sx={{ p: 0 }}>
                <ListItemButton
                  onClick={handleWorkflowToggle}
                  selected={workflowDrawerOpen}
                  sx={{
                    borderRadius: "12px",
                    mb: 1,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "#fff",
                      "& .MuiListItemIcon-root": {
                        color: "#fff",
                      },
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("Workflow")}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: workflowDrawerOpen ? 600 : 500,
                        fontSize: "16px",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}

            {hasProjectWorkflow && (
              <ListItem sx={{ p: 0 }}>
                <ListItemButton
                  onClick={handleProjectWorkflowToggle}
                  selected={projectWorkflowDrawerOpen}
                  sx={{
                    borderRadius: "12px",
                    mb: 1,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "#fff",
                      "& .MuiListItemIcon-root": {
                        color: "#fff",
                      },
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("Workflow")}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: projectWorkflowDrawerOpen ? 600 : 500,
                        fontSize: "16px",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem sx={{ p: 0 }}>
              <LinkWraper
                href={SellHref}
                target={hasSellMode ? "_blank" : undefined}
              >
                <ListItemButton
                  onClick={() => {
                    if (!SellHref) handleContactFormOpen();
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: "12px",
                    mb: 1,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "#fff",
                      "& .MuiListItemIcon-root": {
                        color: "#fff",
                      },
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <RealEstateAgentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("GetQuote")}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: mapDrawerOpen ? 600 : 500,
                        fontSize: "16px",
                      },
                    }}
                  />
                </ListItemButton>
              </LinkWraper>
            </ListItem>

            <ListItem sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => {
                  handleLanguageToggle();
                  setMobileMenuOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: "#fff",
                    },
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: "40px" }}>
                  <Image
                    src={`/flag-${currentLocale}.png`}
                    alt={currentLocale.toUpperCase()}
                    width={24}
                    height={18}
                    style={{ borderRadius: "2px" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${currentLocale === "tr" ? "English" : "Türkçe"}`}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: 600,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem sx={{ p: 0 }}>
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  mb: 1,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "text.primary",
                  }}
                >
                  {t("Theme")}
                </Typography>
                <ThemeToggleButton />
              </Box>
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      <ContactFormDialog
        open={contactModalOpen}
        onClose={handleContactFormClose}
        onSubmit={handleContactFormSubmit}
        loading={contactFormLoading}
        error={contactFormError}
        success={contactFormSuccess}
        selectedUnit={selectedUnit}
        showUnitCard={showUnitCard}
        setShowUnitCard={setShowUnitCard}
      />
    </Box>
  );
};

export default ViewerToolbar;
