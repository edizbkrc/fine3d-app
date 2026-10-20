import React from "react";
import Image from "next/image";
import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MenuIcon from "@mui/icons-material/Menu";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import TourIcon from "@mui/icons-material/Tour";
import ThemeToggleButton from "@components/ThemeToggleButton";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useNavigationService } from "@hooks/useNavigationService";
import {
  openGalleryDrawer,
  openMapDrawer,
  openInfoCardDrawer,
  closeAllDrawers,
  startTour as startTourAction,
} from "@redux/appSlice";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";

interface SidebarMenuProps {
  onMenuToggle?: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const navService = useNavigationService();
  const currentLocale = useLocale();
  const {
    galleryDrawerOpen,
    mapDrawerOpen,
    infoCardDrawerOpen,
    currentEntityType,
  } = useAppSelector((state) => state.AppReducer);

  const handleLanguageToggle = () => {
    const newLocale = currentLocale === "tr" ? "en" : "tr";

    const currentParams = navService.getQueryParams();
    const queryString = currentParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(fullPath, { locale: newLocale });
  };

  const handleHomeClick = () => {
    dispatch(closeAllDrawers());
  };

  const handleGalleryToggle = () => {
    if (galleryDrawerOpen) {
      dispatch(closeAllDrawers());
    } else {
      dispatch(openGalleryDrawer());
    }
  };

  const handleMapToggle = () => {
    if (mapDrawerOpen) {
      dispatch(closeAllDrawers());
    } else {
      dispatch(openMapDrawer());
    }
  };

  const handleInfoCardToggle = () => {
    if (infoCardDrawerOpen) {
      dispatch(closeAllDrawers());
    } else {
      dispatch(openInfoCardDrawer());
    }
  };

  const handleStartTour = () => {
    dispatch(closeAllDrawers());
    dispatch(startTourAction());
  };

  const isHomeActive =
    !galleryDrawerOpen && !mapDrawerOpen && !infoCardDrawerOpen;

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      data-tour="sidebar-menu"
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 60,
        height: "100dvh",
        py: 2,
        boxShadow: 1,
        bgcolor: "card2.main",
        display: { xs: "none", md: "flex" },
        zIndex: 1400,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Tooltip title={t("Common.Menu")} placement="left">
          <IconButton onClick={onMenuToggle} data-tour="drawer-toggle">
            <MenuIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Common.Home")} placement="left">
          <IconButton
            onClick={handleHomeClick}
            data-tour="home-button"
            sx={{
              bgcolor: isHomeActive
                ? theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "#C0C4CF"
                : "transparent",
              "&:hover": {
                bgcolor: isHomeActive
                  ? theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.15)"
                    : "#C0C4CF"
                  : "action.hover",
              },
            }}
          >
            <HomeIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Common.Gallery")} placement="left">
          <IconButton
            onClick={handleGalleryToggle}
            data-tour="gallery-button"
            sx={{
              bgcolor: galleryDrawerOpen
                ? theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "#C0C4CF"
                : "transparent",
              "&:hover": {
                bgcolor: galleryDrawerOpen
                  ? theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.15)"
                    : "#C0C4CF"
                  : "action.hover",
              },
            }}
          >
            <ImageIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Common.Information")} placement="left">
          <IconButton
            onClick={handleInfoCardToggle}
            data-tour="info-button"
            sx={{
              bgcolor: infoCardDrawerOpen
                ? theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "#C0C4CF"
                : "transparent",
              "&:hover": {
                bgcolor: infoCardDrawerOpen
                  ? theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.15)"
                    : "#C0C4CF"
                  : "action.hover",
              },
            }}
          >
            <InfoIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Common.Map")} placement="left">
          <IconButton
            onClick={handleMapToggle}
            data-tour="map-button"
            sx={{
              bgcolor: mapDrawerOpen
                ? theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "#C0C4CF"
                : "transparent",
              "&:hover": {
                bgcolor: mapDrawerOpen
                  ? theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.15)"
                    : "#C0C4CF"
                  : "action.hover",
              },
            }}
          >
            <LocationOnIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box>
        <Stack spacing={2} alignItems="center">
          {currentEntityType === EntityTypeEnum.ProjectStage && (
            <Tooltip title={t("Tour.StartTour")} placement="left">
              <IconButton
                onClick={handleStartTour}
                data-tour="tour-button"
                sx={{
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <TourIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "white" : "primary.main",
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          <ThemeToggleButton size="medium" showTooltip={true} />
          <Tooltip title={t("Common.Language")} placement="left">
            <IconButton
              onClick={handleLanguageToggle}
              data-tour="language-button"
              sx={{
                bgcolor: "transparent",
                borderRadius: "8px",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& img": {
                    opacity: 0.9,
                    color: "white",
                  },
                  "& .MuiTypography-caption": {
                    color: "white",
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Image
                  src={`/flag-${currentLocale}.png`}
                  alt={currentLocale.toUpperCase()}
                  width={20}
                  height={15}
                  style={{ borderRadius: "2px" }}
                />
              </Box>
            </IconButton>
          </Tooltip>
        </Stack>
        <Link
          href="https://finegroup.com.tr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo-big.svg"
            alt="Logo"
            width={40}
            height={40}
            priority
          />
        </Link>
      </Box>
    </Stack>
  );
};

export default SidebarMenu;
