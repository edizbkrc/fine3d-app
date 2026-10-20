"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Skeleton,
  useMediaQuery,
  useTheme,
  Button,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavigationIcon from "@mui/icons-material/Navigation";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsTransitIcon from "@mui/icons-material/DirectionsTransit";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StraightenIcon from "@mui/icons-material/Straighten";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import StraightIcon from "@mui/icons-material/Straight";
import PlaceIcon from "@mui/icons-material/Place";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { IMapData, IMapResponse } from "@/types/IMapData";
import { closeAllDrawers } from "@redux/appSlice";
import axiosInstance from "@network/axiosInstance";
import { useParams } from "next/navigation";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { getIconPath, hasIconPath } from "@helpers/Common/getIconPath";
import {
  labelTextColor,
  normalizeLabelColor,
  resolveMapMarkerIconUrl,
} from "@helpers/Common/mapMarkerVisuals";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  DirectionsRenderer,
  Autocomplete,
  OverlayViewF,
  OverlayView,
} from "@react-google-maps/api";
import { useGoogleMapsLoader } from "@/providers/GoogleMapsProvider";

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

type TravelMode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

const MapDrawer: React.FC = () => {

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .pac-container {
        z-index: 9999 !important;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border: none;
        margin-top: 4px;
        font-family: inherit;
      }
      .pac-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid #f0f0f0;
      }
      .pac-item:hover {
        background-color: #f5f5f5;
      }
      .pac-icon {
        margin-top: 2px;
      }
      .pac-item-query {
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const params = useParams<any>();
  const { locale, tenantId, projectSlug } = params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);
  const t = useTranslations("Common");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<IMapData | null>(null);
  const [selectedMarkId, setSelectedMarkId] = useState<string | null>(null);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVING");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [destinationMarker, setDestinationMarker] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [destinationLabel, setDestinationLabel] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { mapDrawerOpen, presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );

  const { isLoaded } = useGoogleMapsLoader();

  const companyLogoUrl = presentationInitResponse?.companyLogo?.url;

  useEffect(() => {
    if (!isLoaded || !mapData?.geoPoint?.latitude || !mapData?.geoPoint?.longitude) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: mapData.geoPoint.latitude, lng: mapData.geoPoint.longitude } },
      (results, status) => {
        if (status === "OK" && results) {
          for (const result of results) {
            const country = result.address_components?.find((c) =>
              c.types.includes("country")
            );
            if (country?.short_name) {
              setCountryCode(country.short_name.toLowerCase());
              break;
            }
          }
        }
      }
    );
  }, [isLoaded, mapData?.geoPoint?.latitude, mapData?.geoPoint?.longitude]);

  const getProjectIcon = useCallback((): google.maps.Icon | undefined => {
    if (!isLoaded) return undefined;

    if (companyLogoUrl) {
      return {
        url: companyLogoUrl,
        scaledSize: new google.maps.Size(64, 64),
        anchor: new google.maps.Point(32, 64),
      };
    }

    const projectIconSvg = `
      <svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF8A50;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
          </linearGradient>
          <filter id="houseShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.15)"/>
          </filter>
          <filter id="circleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        <circle cx="42" cy="42" r="40" fill="url(#orangeGradient)" stroke="#ffffff" stroke-width="4" filter="url(#circleShadow)"/>
        <circle cx="42" cy="42" r="30" fill="url(#whiteGradient)" stroke="url(#orangeGradient)" stroke-width="2"/>
        <g filter="url(#houseShadow)">
          <g>
            <path d="M22,35 L28,29 L34,35 L34,50 L22,50 Z" fill="url(#orangeGradient)"/>
            <rect x="24" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="29.5" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="24" y="42" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="29.5" y="42" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="26.5" y="46" width="3" height="4" rx="0.5" fill="rgba(255,255,255,0.95)"/>
          </g>
          <g>
            <path d="M36,31 L42,25 L48,31 L48,52 L36,52 Z" fill="url(#orangeGradient)"/>
            <rect x="38" y="33" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="43.5" y="33" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="38" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="43.5" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="38" y="41" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="43.5" y="41" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="40.5" y="47" width="3" height="5" rx="0.5" fill="rgba(255,255,255,0.95)"/>
            <rect x="45" y="27" width="1.5" height="6" fill="url(#orangeGradient)"/>
          </g>
          <g>
            <path d="M50,35 L56,29 L62,35 L62,50 L50,50 Z" fill="url(#orangeGradient)"/>
            <rect x="52" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="57.5" y="37" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="52" y="42" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="57.5" y="42" width="2.5" height="2.5" rx="0.3" fill="rgba(255,255,255,0.9)"/>
            <rect x="54.5" y="46" width="3" height="4" rx="0.5" fill="rgba(255,255,255,0.95)"/>
          </g>
        </g>
        <circle cx="42" cy="42" r="6" fill="url(#orangeGradient)" filter="url(#houseShadow)"/>
        <circle cx="42" cy="42" r="3" fill="#ffffff"/>
        <circle cx="42" cy="42" r="1.5" fill="url(#orangeGradient)"/>
      </svg>
    `;
    return {
      url: `data:image/svg+xml;base64,${btoa(projectIconSvg)}`,
      scaledSize: new google.maps.Size(84, 84),
      anchor: new google.maps.Point(42, 84),
    };
  }, [isLoaded, companyLogoUrl]);

  const createCustomIconUrl = useCallback(
    (iconName: string, isSelected: boolean = false): string => {
      const iconSvg = `
      <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
        <circle cx="21" cy="21" r="20" fill="white" stroke="${
          isSelected ? "#ffc107" : "#1976d2"
        }" stroke-width="2"/>
        <g transform="translate(9, 9)" fill="${
          isSelected ? "#ffc107" : "#1976d2"
        }">
          <svg width="24" height="24" viewBox="0 0 24 24">
            ${getIconPath(iconName)}
          </svg>
        </g>
      </svg>
    `;
      return `data:image/svg+xml;base64,${btoa(iconSvg)}`;
    },
    []
  );

  const handleClose = () => {
    dispatch(closeAllDrawers());
    setNavDrawerOpen(false);
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setDestinationLabel("");
    setRouteError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const calculateRouteFromLatLng = useCallback(
    async (dest: google.maps.LatLngLiteral, mode?: TravelMode) => {
      if (!mapData?.geoPoint?.latitude || !mapData?.geoPoint?.longitude) return;

      setRouteLoading(true);
      setRouteError(null);
      setNavDrawerOpen(true);

      const directionsService = new google.maps.DirectionsService();

      try {
        const result = await directionsService.route({
          origin: {
            lat: mapData.geoPoint.latitude,
            lng: mapData.geoPoint.longitude,
          },
          destination: dest,
          travelMode: google.maps.TravelMode[mode || travelMode],

          language: locale || "en",
        });
        setDirectionsResponse(result);
      } catch {
        setRouteError(t("RouteNotFound"));
      } finally {
        setRouteLoading(false);
      }
    },
    [mapData, travelMode, t]
  );

  useEffect(() => {
    if (destinationMarker && navDrawerOpen) {
      calculateRouteFromLatLng(destinationMarker, travelMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelMode]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const dest = { lat, lng };
        setDestinationMarker(dest);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: dest }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const label = results[0].formatted_address;
            setDestinationLabel(label);
            if (inputRef.current) inputRef.current.value = label;
          } else {
            const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setDestinationLabel(label);
            if (inputRef.current) inputRef.current.value = label;
          }
        });

        calculateRouteFromLatLng(dest);
      }
    },
    [calculateRouteFromLatLng]
  );

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const dest = { lat, lng };
        setDestinationMarker(dest);
        setDestinationLabel(place.formatted_address || place.name || "");
        calculateRouteFromLatLng(dest);
      }
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setDestinationLabel("");
    setRouteError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const dest = { lat, lng };
          setDestinationMarker(dest);
          const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setDestinationLabel(label);
          if (inputRef.current) inputRef.current.value = label;
          calculateRouteFromLatLng(dest);
        },
        () => {
          setRouteError(t("LocationAccessDenied"));
        }
      );
    }
  };

  const getDirectionIcon = (instruction: string) => {
    const lower = instruction.toLowerCase();
    if (lower.includes("left") || lower.includes("sol")) return <TurnLeftIcon fontSize="small" />;
    if (lower.includes("right") || lower.includes("sağ")) return <TurnRightIcon fontSize="small" />;
    return <StraightIcon fontSize="small" />;
  };

  useEffect(() => {
    if (!mapDrawerOpen) return;

    setLoading(true);

    axiosInstance
      .get(OpsApiRoutes.GetMapData, {
        params: {
          TenantId,
          ProjectSlug,
          ProjectId: presentationInitResponse?.projectId,
        },
        headers: {
          "Accept-Language": getAcceptLanguage(locale || "en"),
        },
      })
      .then((response: { data: IMapResponse }) => {
        if (response.data && response.data.isSuccess) {
          setMapData(response.data.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    mapDrawerOpen,
    TenantId,
    ProjectSlug,
    presentationInitResponse?.projectId,
    locale,
  ]);

  const renderLoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        sx={{ borderRadius: 1, mb: 2 }}
      />
      <Stack spacing={1}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="text" height={24} />
        ))}
      </Stack>
    </Box>
  );

  const renderNavigationDrawer = () => {
    const route = directionsResponse?.routes?.[0];
    const leg = route?.legs?.[0];

    return (
      <Drawer
        anchor="right"
        open={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
        variant="persistent"
        sx={{
          zIndex: 1402,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100vw" : 380,
            height: "100vh",
            boxShadow: 6,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <NavigationIcon />
              <Typography variant="subtitle1" fontWeight={700}>
                {t("Navigation")}
              </Typography>
            </Stack>
            <IconButton
              onClick={() => setNavDrawerOpen(false)}
              size="small"
              sx={{ color: "primary.contrastText" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            <Paper
              elevation={2}
              sx={{ p: 2, mb: 2, borderRadius: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "#FF6B35",
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 2px #FF6B35",
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
                  {presentationInitResponse?.projectName || t("ProjectLocation")}
                </Typography>
              </Stack>

              <Box
                sx={{
                  ml: "5px",
                  borderLeft: "2px dashed",
                  borderColor: "divider",
                  height: 16,
                  mb: 1.5,
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PlaceIcon sx={{ color: "error.main", fontSize: 18, flexShrink: 0, ml: "-3px" }} />
                <Box sx={{ flex: 1 }}>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        autocompleteRef.current = autocomplete;
                      }}
                      onPlaceChanged={handlePlaceChanged}
                      options={{
                        fields: ["formatted_address", "geometry", "name"],
                        types: ["establishment", "geocode"],
                        ...(countryCode && {
                          componentRestrictions: { country: countryCode },
                        }),
                        ...(mapData?.geoPoint?.latitude && mapData?.geoPoint?.longitude && {
                          bounds: new google.maps.LatLngBounds(
                            new google.maps.LatLng(
                              mapData.geoPoint.latitude - 1,
                              mapData.geoPoint.longitude - 1
                            ),
                            new google.maps.LatLng(
                              mapData.geoPoint.latitude + 1,
                              mapData.geoPoint.longitude + 1
                            )
                          ),
                          strictBounds: false,
                        }),
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={t("SearchDestination")}
                        autoComplete="off"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "14px",
                          border: `2px solid ${theme.palette.divider}`,
                          borderRadius: "10px",
                          outline: "none",
                          fontFamily: theme.typography.fontFamily,
                          backgroundColor: theme.palette.background.default,
                          color: theme.palette.text.primary,
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = theme.palette.primary.main;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = theme.palette.divider;
                        }}
                      />
                    </Autocomplete>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Button
                  size="small"
                  startIcon={<MyLocationIcon fontSize="small" />}
                  onClick={handleUseMyLocation}
                  sx={{ textTransform: "none", fontSize: 12, py: 0.5 }}
                >
                  {t("UseMyLocation")}
                </Button>
                {destinationMarker && (
                  <Button
                    size="small"
                    onClick={clearRoute}
                    color="error"
                    sx={{ textTransform: "none", fontSize: 12, py: 0.5, ml: "auto" }}
                  >
                    {t("Clear")}
                  </Button>
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, fontStyle: "italic" }}
              >
                {t("ClickMapToSelect")}
              </Typography>
            </Paper>

            <Stack direction="row" spacing={0.5} sx={{ mb: 2 }} justifyContent="center" flexWrap="wrap">
              {(
                [
                  { mode: "DRIVING" as TravelMode, icon: <DirectionsCarIcon fontSize="small" />, label: t("Driving") },
                  { mode: "WALKING" as TravelMode, icon: <DirectionsWalkIcon fontSize="small" />, label: t("Walking") },
                  { mode: "BICYCLING" as TravelMode, icon: <DirectionsBikeIcon fontSize="small" />, label: t("Cycling") },
                  { mode: "TRANSIT" as TravelMode, icon: <DirectionsTransitIcon fontSize="small" />, label: t("Transit") },
                ] as const
              ).map(({ mode, icon, label }) => (
                <Chip
                  key={mode}
                  icon={icon}
                  label={label}
                  size="small"
                  variant={travelMode === mode ? "filled" : "outlined"}
                  color={travelMode === mode ? "primary" : "default"}
                  onClick={() => setTravelMode(mode)}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>

            {routeLoading && (
              <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  {t("GetDirections")}...
                </Typography>
              </Stack>
            )}

            {routeError && (
              <Paper
                sx={{
                  p: 1.5,
                  mb: 2,
                  bgcolor: "error.main",
                  borderRadius: 2,
                  color: "#fff",
                }}
              >
                <Typography variant="body2">{routeError}</Typography>
              </Paper>
            )}

            {leg && !routeLoading && (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: "#fff",
                  }}
                >
                  <Stack direction="row" justifyContent="space-around" alignItems="center">
                    <Stack alignItems="center" spacing={0.5}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="h6" fontWeight={700} fontSize={18}>
                        {leg.duration?.text}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {t("Duration")}
                      </Typography>
                    </Stack>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderColor: "rgba(255,255,255,0.25)", mx: 1 }}
                    />
                    <Stack alignItems="center" spacing={0.5}>
                      <StraightenIcon fontSize="small" />
                      <Typography variant="h6" fontWeight={700} fontSize={18}>
                        {leg.distance?.text}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {t("Distance")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("RouteDetails")}
                </Typography>
                <List
                  dense
                  sx={{
                    maxHeight: "calc(100vh - 520px)",
                    overflow: "auto",
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  {leg.steps?.map((step, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderBottom: index < (leg.steps?.length || 0) - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                        py: 1,
                        px: 1.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getDirectionIcon(step.instructions)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontSize={13}
                            dangerouslySetInnerHTML={{
                              __html: step.instructions,
                            }}
                          />
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {step.distance?.text} &middot; {step.duration?.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {!leg && !routeLoading && !routeError && (
              <Stack
                alignItems="center"
                spacing={1.5}
                sx={{ py: 4, textAlign: "center" }}
              >
                <NavigationIcon sx={{ fontSize: 48, color: "action.disabled" }} />
                <Typography variant="body2" color="text.secondary">
                  {t("ClickMapToSelect")}
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    );
  };

  const renderMapContent = () => {
    if (loading) {
      return renderLoadingSkeleton();
    }

    if (!mapData) {
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
            {t("NoMapDataFound")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("NoMapDataDescription")}
          </Typography>
        </Box>
      );
    }

    if (!isLoaded) {
      return renderLoadingSkeleton();
    }

    const center = {
      lat: mapData?.geoPoint?.latitude || 39.9208,
      lng: mapData?.geoPoint?.longitude || 32.8541,
    };

    return (
      <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={mapData?.zoom || 13}
          onClick={handleMapClick}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {mapData?.geoPoint?.latitude && mapData?.geoPoint?.longitude && (
            <>
              <MarkerF
                position={{
                  lat: mapData.geoPoint.latitude,
                  lng: mapData.geoPoint.longitude,
                }}
                icon={getProjectIcon()}
                onClick={() => setShowProjectInfo(true)}
              />
              {showProjectInfo && (
                <InfoWindowF
                  position={{
                    lat: mapData.geoPoint.latitude,
                    lng: mapData.geoPoint.longitude,
                  }}
                  onCloseClick={() => setShowProjectInfo(false)}
                  options={{
                    pixelOffset: new google.maps.Size(0, companyLogoUrl ? -64 : -84),
                    maxWidth: 300,
                    disableAutoPan: false,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      minWidth: "180px",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowProjectInfo(false)}
                  >
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "contain",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "8px",
                          backgroundColor: "#e3f2fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1976d2">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          lineHeight: 1.3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {presentationInitResponse?.projectName || t("CurrentProject")}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1976d2",
                          fontWeight: 500,
                          marginTop: "2px",
                        }}
                      >
                        {t("ProjectLocation")}
                      </div>
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </>
          )}

          {destinationMarker && !directionsResponse && (
            <MarkerF
              position={destinationMarker}
              icon={{
                url: "data:image/svg+xml;base64," +
                  btoa(`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="#d32f2f" stroke="white" stroke-width="3"/>
                    <circle cx="18" cy="18" r="6" fill="white"/>
                  </svg>`),
                scaledSize: new google.maps.Size(36, 36),
                anchor: new google.maps.Point(18, 18),
              }}
            />
          )}

          {mapData?.marks?.map((mark) => {
            if (!mark.geoPoint?.latitude || !mark.geoPoint?.longitude) return null;
            // Özel ikon önceliklidir; yoksa eski davranış birebir: yalnız hazır
            // sette olan emoji çizilir (bilinmeyen emoji → işaret hiç çizilmez).
            const customIconUrl = resolveMapMarkerIconUrl(mark.customIcon);
            const hasStockIcon = !!mark.emoji && hasIconPath(mark.emoji);
            if (!customIconUrl && !hasStockIcon) return null;

            const position = {
              lat: mark.geoPoint.latitude,
              lng: mark.geoPoint.longitude,
            };
            const labelBg = normalizeLabelColor(mark.labelColor);

            return (
              <React.Fragment key={mark.id}>
                <MarkerF
                  position={position}
                  icon={
                    customIconUrl
                      ? {
                          url: customIconUrl,
                          scaledSize: new google.maps.Size(42, 42),
                          anchor: new google.maps.Point(21, 42),
                        }
                      : {
                          url: createCustomIconUrl(mark.emoji as string, false),
                          scaledSize: new google.maps.Size(42, 42),
                          anchor: new google.maps.Point(21, 42),
                        }
                  }
                  onClick={() => setSelectedMarkId(mark.id)}
                />
                {mark.showLabel && mark.name && (
                  // Kalıcı etiket işaretin ALTINDA durur: tıklama balonu üstte açıldığı
                  // için ikisi çakışmaz. Etikete tıklamak da işarete tıklamak gibi balonu açar.
                  <OverlayViewF
                    position={position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width) => ({
                      x: -(width / 2),
                      y: 4,
                    })}
                  >
                    <div
                      // Overlay katmanındaki tıklama haritaya da kabarcıklanır ve haritanın
                      // onClick'i (handleMapClick) etiketin altına rota hedefi koyup geocode
                      // çağırırdı. React olayı kökte dinlendiği için stopPropagation geç kalır;
                      // Google'ın kendi engelleyicisi gerekiyor.
                      ref={(el) => {
                        // Satır içi ref her render'da yeniden çağrılır; dinleyici birikmesin.
                        if (!el || el.dataset.noMapHits) return;
                        el.dataset.noMapHits = "1";
                        google.maps.OverlayView.preventMapHitsFrom(el);
                      }}
                      onClick={() => setSelectedMarkId(mark.id)}
                      style={{
                        background: labelBg,
                        color: labelTextColor(labelBg),
                        border: "2px solid #fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                        padding: "2px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        lineHeight: "18px",
                        whiteSpace: "nowrap",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {mark.name}
                    </div>
                  </OverlayViewF>
                )}
                {selectedMarkId === mark.id && (
                  <OverlayViewF
                    position={position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width, height) => ({
                      x: -(width / 2),
                      y: -(height + 50),
                    })}
                  >
                    <div
                      onClick={() => setSelectedMarkId(null)}
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#333",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        position: "relative",
                        userSelect: "none",
                      }}
                    >
                      {mark.name}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -6,
                          left: "50%",
                          transform: "translateX(-50%) rotate(45deg)",
                          width: 12,
                          height: 12,
                          background: "#fff",
                          boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                  </OverlayViewF>
                )}
              </React.Fragment>
            );
          })}

         
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#1976d2",
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>

        <IconButton
          onClick={() => setNavDrawerOpen(true)}
          sx={{
            position: "absolute",
            bottom: 24,
            right: 24,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            width: 56,
            height: 56,
            boxShadow: 4,
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          <NavigationIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={mapDrawerOpen}
        onClose={handleClose}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          zIndex: 1401,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100vw" : "calc(100vw - 60px)",
            height: "100vh",
            boxShadow: 3,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
                <LocationOnIcon color="primary" />
              </IconButton>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "text.primary" }}
              >
                {t("Map")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => setNavDrawerOpen(!navDrawerOpen)}
                size="small"
                color={navDrawerOpen ? "primary" : "default"}
              >
                <NavigationIcon />
              </IconButton>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon color="primary" />
              </IconButton>
            </Stack>
          </Stack>
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
            }}
          >
            {renderMapContent()}
          </Box>
        </Box>
      </Drawer>
      {renderNavigationDrawer()}
    </>
  );
};

export default MapDrawer;
