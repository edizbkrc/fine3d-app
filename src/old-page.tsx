"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { Turnstile } from "@marsidev/react-turnstile";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import TourIcon from "@mui/icons-material/Tour";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import PanoramaIcon from "@mui/icons-material/Panorama";
import MapIcon from "@mui/icons-material/Map";
import InteractiveIcon from "@mui/icons-material/TouchApp";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CompareIcon from "@mui/icons-material/Compare";
import InfoIcon from "@mui/icons-material/Info";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DevicesIcon from "@mui/icons-material/Devices";
import FilterDramaIcon from "@mui/icons-material/FilterDrama";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SettingsIcon from "@mui/icons-material/Settings";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Image from "next/image";
import TelInput from "@components/TelInput";
import { useState } from "react";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionImage = motion(Image);

interface ContactFormData {
  nameSurname: string;
  email: string;
  phoneNumber: string;
  message: string;
  captchaToken: string;
}

export default function Page() {
  const theme = useTheme();
  const t = useTranslations("Home");
  const tCommon = useTranslations("Common");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ContactFormData>({
    defaultValues: {
      nameSurname: "",
      email: "",
      phoneNumber: "",
      message: "",
      captchaToken: "",
    },
  });

  const onSubmitForm = async (data: ContactFormData) => {
    if (!data.captchaToken) {
      setFormError(tCommon("CaptchaRequired") || "Captcha is required");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameSurname: data.nameSurname,
          email: data.email,
          phoneNumber: data.phoneNumber,
          message: data.message,
          captchaToken: data.captchaToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      setFormSuccess(true);
      reset();
      setValue("captchaToken", "");

      setTimeout(() => {
        setFormSuccess(false);
      }, 500);
    } catch (error) {
      setFormError(
        tCommon("FormSubmitError") || "An error occurred. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const sceneFeatures = [
    {
      icon: "🔄",
      title: t("3DScene.Features.Rotation"),
      description: t("3DScene.Features.RotationDesc"),
      color: theme.palette.primary.main,
    },
    {
      icon: "🔍",
      title: t("3DScene.Features.Zoom"),
      description: t("3DScene.Features.ZoomDesc"),
      color: theme.palette.primary.main,
    },
    {
      icon: "🏢",
      title: t("3DScene.Features.FloorSelection"),
      description: t("3DScene.Features.FloorSelectionDesc"),
      color: theme.palette.primary.main,
    },
    {
      icon: "☀️",
      title: t("3DScene.Features.DayNight"),
      description: t("3DScene.Features.DayNightDesc"),
      color: theme.palette.primary.main,
    },
  ];

  const features = [
    {
      icon: <ViewInArIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.3DScene.Title"),
      description: t("Features.Items.3DScene.Description"),
      color: theme.palette.primary.main,
    },
    {
      icon: <HomeWorkIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.Dollhouse.Title"),
      description: t("Features.Items.Dollhouse.Description"),
      color: "#5B7FA8",
    },
    {
      icon: <TourIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.VirtualTour.Title"),
      description: t("Features.Items.VirtualTour.Description"),
      color: theme.palette.primary.main,
    },
    {
      icon: <InteractiveIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.Polygons.Title"),
      description: t("Features.Items.Polygons.Description"),
      color: "#5B7FA8",
    },
    {
      icon: <PanoramaIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.Balcony.Title"),
      description: t("Features.Items.Balcony.Description"),
      color: theme.palette.primary.main,
    },
    {
      icon: <MapIcon sx={{ fontSize: 60 }} />,
      title: t("Features.Items.FloorPlan.Title"),
      description: t("Features.Items.FloorPlan.Description"),
      color: "#5B7FA8",
    },
    {
      icon: <PhotoLibraryIcon sx={{ fontSize: 60 }} />,
      title: "Medya Galerisi",
      description:
        "Yüksek çözünürlüklü fotoğraflar, render görselleri ve proje albümleri. Zengin görsel içerik yönetimi.",
      color: theme.palette.primary.main,
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 60 }} />,
      title: "Konum Haritası",
      description:
        "İnteraktif harita entegrasyonu ile proje konumu. Yakındaki önemli noktalar ve ulaşım bilgileri.",
      color: "#5B7FA8",
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 60 }} />,
      title: "Bulut Tabanlı",
      description:
        "Verileriniz güvenli bulut altyapısında saklanır. Her yerden erişim, otomatik yedekleme.",
      color: theme.palette.primary.main,
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 60 }} />,
      title: "Çoklu Platform",
      description:
        "Web, mobil ve tablet uyumlu responsive tasarım. Tüm cihazlarda kusursuz deneyim.",
      color: "#5B7FA8",
    },
    {
      icon: <FilterDramaIcon sx={{ fontSize: 60 }} />,
      title: "Gerçek Zamanlı Render",
      description:
        "Anlık 3D render teknolojisi ile hızlı yükleme. 60 FPS akıcı görüntüleme performansı.",
      color: theme.palette.primary.main,
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 60 }} />,
      title: "Özelleştirilebilir",
      description:
        "Markanıza özel tema ve renk seçenekleri. Logo, font ve arayüz kişiselleştirme.",
      color: "#5B7FA8",
    },
  ];

  const presentations = [
    {
      icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
      title: t("PresentationModes.Day.Title"),
      description: t("PresentationModes.Day.Description"),
    },
    {
      icon: <NightsStayIcon sx={{ fontSize: 40 }} />,
      title: t("PresentationModes.Night.Title"),
      description: t("PresentationModes.Night.Description"),
    },
    {
      icon: <ViewInArOutlinedIcon sx={{ fontSize: 40 }} />,
      title: t("PresentationModes.Mixed.Title"),
      description: t("PresentationModes.Mixed.Description"),
    },
  ];

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${
            theme.palette.background.default
          } 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, ${alpha(
            "#4A90E2",
            0.05
          )} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${alpha(
              "#5B7FA8",
              0.1
            )} 0%, transparent 50%)`,
            animation: "pulse 8s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.5 },
              "50%": { opacity: 1 },
            },
          },
        }}
      >
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              borderRadius: "50%",
              background: alpha(
                i % 2 === 0 ? theme.palette.primary.main : "#5B7FA8",
                0.3
              ),
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${
                Math.random() * 10 + 10
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              "@keyframes float": {
                "0%, 100%": {
                  transform: `translate(0, 0) scale(1)`,
                },
                "50%": {
                  transform: `translate(${Math.random() * 100 - 50}px, ${
                    Math.random() * 100 - 50
                  }px) scale(${Math.random() * 0.5 + 0.5})`,
                },
              },
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <MotionTypography
                  variant="h1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  sx={{
                    fontSize: { xs: "2.8rem", md: "4.5rem" },
                    fontWeight: 900,
                    mb: 2,
                    lineHeight: 1.1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #5B7FA8 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Fine3D
                </MotionTypography>

                <MotionTypography
                  variant="h2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  sx={{
                    fontSize: { xs: "1.8rem", md: "3rem" },
                    fontWeight: 800,
                    mb: 2,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                  }}
                >
                  {t("Hero.Title")}
                </MotionTypography>

                <MotionTypography
                  variant="h6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  sx={{
                    mb: 4,
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                  }}
                >
                  {t("Hero.Subtitle")}
                </MotionTypography>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  sx={{ mb: 4 }}
                >
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: <CheckCircleIcon />,
                        text: t("Hero.Features.RealTime3D"),
                      },
                      {
                        icon: <CheckCircleIcon />,
                        text: t("Hero.Features.VirtualTour"),
                      },
                      {
                        icon: <CheckCircleIcon />,
                        text: t("Hero.Features.EasyIntegration"),
                      },
                      { icon: <CheckCircleIcon />, text: "7/24 Destek" },
                    ].map((item, index) => (
                      <Grid size={{ xs: 6 }} key={index}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              color: theme.palette.primary.main,
                              display: "flex",
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {item.text}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Grid container spacing={3}>
                    {[
                      {
                        icon: <TrendingUpIcon />,
                        value: "500+",
                        label: "Aktif Proje",
                        color: theme.palette.primary.main,
                      },
                      {
                        icon: <GroupsIcon />,
                        value: "50K+",
                        label: "Kullanıcı",
                        color: theme.palette.primary.main,
                      },
                      {
                        icon: <StarIcon />,
                        value: "99%",
                        label: "Memnuniyet",
                        color: "#FFB800",
                      },
                    ].map((stat, index) => (
                      <Grid size={{ xs: 4 }} key={index}>
                        <MotionCard
                          whileHover={{ scale: 1.05, y: -5 }}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            background: alpha(stat.color, 0.05),
                            border: `1px solid ${alpha(stat.color, 0.2)}`,
                            borderRadius: 3,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: `0 8px 24px ${alpha(stat.color, 0.2)}`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              color: stat.color,
                              mb: 1,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 900,
                              color: stat.color,
                              mb: 0.5,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </MotionCard>
                      </Grid>
                    ))}
                  </Grid>
                </MotionBox>
              </MotionBox>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                sx={{
                  position: "relative",
                  height: { xs: 400, md: 600 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MotionBox
                  animate={{
                    y: [0, -20, 0],
                    rotateY: [0, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    borderRadius: 4,
                    boxShadow: `0 20px 60px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    overflow: "hidden",
                    position: "relative",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `radial-gradient(circle at center, transparent 0%, ${alpha(
                        theme.palette.primary.main,
                        0.05
                      )} 100%)`,
                    }}
                  />

                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MotionBox
                      animate={{
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ViewInArIcon
                        sx={{
                          fontSize: { xs: 200, md: 280 },
                          color: alpha(theme.palette.primary.main, 0.2),
                          filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.1))",
                        }}
                      />
                    </MotionBox>

                    <MotionBox
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      sx={{
                        position: "absolute",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 8px 32px ${alpha(
                            theme.palette.primary.main,
                            0.5
                          )}`,
                        }}
                      >
                        <PlayCircleOutlineIcon
                          sx={{
                            fontSize: 50,
                            color: "white",
                          }}
                        />
                      </Box>
                    </MotionBox>
                  </Box>
                  <MotionBox
                    animate={{
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    sx={{
                      position: "absolute",
                      top: 40,
                      right: 30,
                      background: alpha(theme.palette.background.paper, 0.98),
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      p: 2,
                      boxShadow: `0 8px 32px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      minWidth: 140,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#00FF00",
                          animation: "blink 2s ease-in-out infinite",
                          "@keyframes blink": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.3 },
                          },
                        }}
                      />
                      <Typography variant="caption" fontWeight={700}>
                        Canlı Demo
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      🎯 İnteraktif Görünüm
                    </Typography>
                  </MotionBox>

                  <MotionBox
                    animate={{
                      y: [0, 12, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      left: 30,
                      background: alpha(theme.palette.background.paper, 0.98),
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      p: 2,
                      boxShadow: `0 8px 32px ${alpha("#5B7FA8", 0.2)}`,
                      border: `1px solid ${alpha("#5B7FA8", 0.1)}`,
                      minWidth: 150,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <SpeedIcon
                        sx={{
                          fontSize: 18,
                          color: "#5B7FA8",
                        }}
                      />
                      <Typography variant="caption" fontWeight={700}>
                        Hızlı Render
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      ⚡ 60 FPS Performans
                    </Typography>
                  </MotionBox>

                  <MotionBox
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 20,
                      transform: "translateY(-50%)",
                      background: alpha(theme.palette.background.paper, 0.98),
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      p: 2,
                      boxShadow: `0 8px 32px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      minWidth: 130,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <ThreeDRotationIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Typography variant="caption" fontWeight={700}>
                        360° Tur
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      🔄 Tam Kontrol
                    </Typography>
                  </MotionBox>
                </MotionBox>

                {[1, 2, 3].map((i) => (
                  <MotionBox
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                    sx={{
                      position: "absolute",
                      width: 100 + i * 50,
                      height: 100 + i * 50,
                      borderRadius: "50%",
                      border: `2px solid ${alpha(
                        i % 2 === 0 ? theme.palette.primary.main : "#5B7FA8",
                        0.3
                      )}`,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  />
                ))}
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 10, md: 20 },
          background: `linear-gradient(180deg, ${
            theme.palette.background.default
          } 0%, ${alpha(theme.palette.primary.main, 0.03)} 50%, ${
            theme.palette.background.default
          } 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            sx={{ textAlign: "center", mb: 10 }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <ThreeDRotationIcon
                sx={{
                  fontSize: 80,
                  color: theme.palette.primary.main,
                  animation: "rotate3d 3s linear infinite",
                  "@keyframes rotate3d": {
                    "0%": { transform: "rotateY(0deg)" },
                    "100%": { transform: "rotateY(360deg)" },
                  },
                }}
              />
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontWeight: 900,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #5B7FA8 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("3DScene.Title")}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 900,
                mx: "auto",
                lineHeight: 1.8,
                mb: 6,
              }}
            >
              {t("3DScene.Subtitle")}
            </Typography>
          </MotionBox>

          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                sx={{
                  position: "relative",
                  height: { xs: 400, md: 600 },
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: `0 20px 60px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, ${alpha("#5B7FA8", 0.1)} 100%)`,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ViewInArIcon
                    sx={{
                      fontSize: 300,
                      color: alpha(theme.palette.primary.main, 0.2),
                      animation: "float 3s ease-in-out infinite",
                      "@keyframes float": {
                        "0%, 100%": {
                          transform: "translateY(0px) rotate(0deg)",
                        },
                        "50%": { transform: "translateY(-20px) rotate(5deg)" },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translate(-50%, -50%) scale(1.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <PlayCircleOutlineIcon
                      sx={{
                        fontSize: 100,
                        color: theme.palette.primary.main,
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                      }}
                    />
                  </Box>
                </Box>

                <MotionBox
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    position: "absolute",
                    top: 30,
                    right: 30,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {t("3DScene.InteractiveBadge")}
                  </Typography>
                </MotionBox>

                <MotionBox
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  sx={{
                    position: "absolute",
                    bottom: 30,
                    left: 30,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {t("3DScene.RealTimeBadge")}
                  </Typography>
                </MotionBox>
              </MotionBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "1.8rem", md: "2.5rem" },
                    fontWeight: 800,
                    mb: 4,
                    color: theme.palette.text.primary,
                  }}
                >
                  {t("3DScene.SectionTitle")}
                </Typography>

                <Grid container spacing={3}>
                  {sceneFeatures.map((feature, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: `0 8px 24px ${alpha(feature.color, 0.3)}`,
                        }}
                        sx={{
                          p: 3,
                          background: theme.palette.card.main,
                          border: `1px solid ${alpha(feature.color, 0.15)}`,
                          borderRadius: 3,
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 2,
                              background: alpha(feature.color, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: feature.color,
                            }}
                          >
                            {feature.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </MotionCard>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ViewInArIcon />}
                    sx={{
                      py: 2,
                      px: 5,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${
                        theme.palette.primary.main
                      } 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                      boxShadow: `0 8px 24px ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 32px ${alpha(
                          theme.palette.primary.main,
                          0.4
                        )}`,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {t("3DScene.TryDemoButton")}
                  </Button>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 15 },
          background: theme.palette.background.default,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            sx={{ textAlign: "center", mb: 8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              {t("InteractiveFeatures.Title")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              {t("InteractiveFeatures.Subtitle")}
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  boxShadow: `0 20px 50px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha("#5B7FA8", 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #5B7FA8 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      color: "white",
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t("InteractiveFeatures.RealTimeRender.Title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {t("InteractiveFeatures.RealTimeRender.Description")}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {[
                      t("InteractiveFeatures.RealTimeRender.Tags.FastLoading"),
                      t(
                        "InteractiveFeatures.RealTimeRender.Tags.SmoothTransitions"
                      ),
                      t(
                        "InteractiveFeatures.RealTimeRender.Tags.OptimizedRender"
                      ),
                    ].map((tag) => (
                      <Box
                        key={tag}
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  boxShadow: `0 20px 50px ${alpha("#5B7FA8", 0.25)}`,
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    "#5B7FA8",
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha("#5B7FA8", 0.1)}`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, #5B7FA8 0%, ${theme.palette.primary.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      color: "white",
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t("InteractiveFeatures.DetailedInfo.Title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {t("InteractiveFeatures.DetailedInfo.Description")}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {[
                      {
                        label: t(
                          "InteractiveFeatures.DetailedInfo.Tags.Gallery"
                        ),
                        color: theme.palette.primary.main,
                      },
                      {
                        label: t(
                          "InteractiveFeatures.DetailedInfo.Tags.FloorPlans"
                        ),
                        color: theme.palette.primary.main,
                      },
                      {
                        label: t(
                          "InteractiveFeatures.DetailedInfo.Tags.VideoTour"
                        ),
                        color: theme.palette.primary.main,
                      },
                    ].map((tag) => (
                      <Box
                        key={tag.label}
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          background: alpha(tag.color, 0.15),
                          color: tag.color,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {tag.label}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  boxShadow: `0 20px 50px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha("#5B7FA8", 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #5B7FA8 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      color: "white",
                    }}
                  >
                    <Typography sx={{ fontSize: 40 }}>🌍</Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t("InteractiveFeatures.MultiLanguage.Title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {t("InteractiveFeatures.MultiLanguage.Description")}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {["Türkçe", "English", "العربية", "Русский"].map((tag) => (
                      <Box
                        key={tag}
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 15 },
          background: `linear-gradient(180deg, ${
            theme.palette.background.default
          } 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            sx={{ textAlign: "center", mb: 8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              {t("AdvancedFeatures.Title")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              {t("AdvancedFeatures.Subtitle")}
            </Typography>
          </MotionBox>

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionCard
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  boxShadow: `0 24px 60px ${alpha("#5B7FA8", 0.25)}`,
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    "#5B7FA8",
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha("#5B7FA8", 0.1)}`,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, #5B7FA8 0%, ${theme.palette.primary.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 4,
                      color: "white",
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t("AdvancedFeatures.LocationMap.Title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("AdvancedFeatures.LocationMap.Description")}
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: "🚇",
                        label: t(
                          "AdvancedFeatures.LocationMap.Points.Transport"
                        ),
                        desc: t(
                          "AdvancedFeatures.LocationMap.Points.TransportDesc"
                        ),
                      },
                      {
                        icon: "🏪",
                        label: t(
                          "AdvancedFeatures.LocationMap.Points.Shopping"
                        ),
                        desc: t(
                          "AdvancedFeatures.LocationMap.Points.ShoppingDesc"
                        ),
                      },
                      {
                        icon: "🏫",
                        label: t(
                          "AdvancedFeatures.LocationMap.Points.Education"
                        ),
                        desc: t(
                          "AdvancedFeatures.LocationMap.Points.EducationDesc"
                        ),
                      },
                      {
                        icon: "🏥",
                        label: t("AdvancedFeatures.LocationMap.Points.Health"),
                        desc: t(
                          "AdvancedFeatures.LocationMap.Points.HealthDesc"
                        ),
                      },
                    ].map((item, index) => (
                      <Grid size={{ xs: 6 }} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha("#5B7FA8", 0.1),
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: alpha("#5B7FA8", 0.2),
                              transform: "translateX(5px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography sx={{ fontSize: 24 }}>
                              {item.icon}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {item.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {item.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MotionCard
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  boxShadow: `0 24px 60px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha("#5B7FA8", 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #5B7FA8 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 4,
                      color: "white",
                    }}
                  >
                    <CompareIcon sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t("AdvancedFeatures.Comparison.Title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("AdvancedFeatures.Comparison.Description")}
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: "🏠",
                        label: t(
                          "AdvancedFeatures.Comparison.Features.UnitTypes"
                        ),
                        desc: t(
                          "AdvancedFeatures.Comparison.Features.UnitTypesDesc"
                        ),
                      },
                      {
                        icon: "💰",
                        label: t(
                          "AdvancedFeatures.Comparison.Features.PriceAnalysis"
                        ),
                        desc: t(
                          "AdvancedFeatures.Comparison.Features.PriceAnalysisDesc"
                        ),
                      },
                      {
                        icon: "📐",
                        label: t("AdvancedFeatures.Comparison.Features.Area"),
                        desc: t(
                          "AdvancedFeatures.Comparison.Features.AreaDesc"
                        ),
                      },
                      {
                        icon: "⭐",
                        label: t(
                          "AdvancedFeatures.Comparison.Features.Properties"
                        ),
                        desc: t(
                          "AdvancedFeatures.Comparison.Features.PropertiesDesc"
                        ),
                      },
                    ].map((item, index) => (
                      <Grid size={{ xs: 6 }} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.1),
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: alpha(
                                theme.palette.primary.main,
                                0.2
                              ),
                              transform: "translateX(5px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography sx={{ fontSize: 24 }}>
                              {item.icon}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {item.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {item.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 10, md: 15 },
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 0%, ${alpha("#5B7FA8", 0.03)} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                    px: 3,
                    py: 1,
                    borderRadius: 10,
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  }}
                >
                  <RequestQuoteIcon />
                  <Typography variant="body2" fontWeight={700}>
                    {t("QuoteSection.Badge")}
                  </Typography>
                </Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2rem", md: "3.5rem" },
                    fontWeight: 900,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  {t("QuoteSection.Title")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8,
                    mb: 4,
                  }}
                >
                  {t("QuoteSection.Description")}
                </Typography>

                <Grid container spacing={2}>
                  {[
                    {
                      icon: "📧",
                      title: t("QuoteSection.Features.Email.Title"),
                      desc: t("QuoteSection.Features.Email.Desc"),
                    },
                    {
                      icon: "📱",
                      title: t("QuoteSection.Features.SMS.Title"),
                      desc: t("QuoteSection.Features.SMS.Desc"),
                    },
                    {
                      icon: "🔔",
                      title: t("QuoteSection.Features.AutoResponse.Title"),
                      desc: t("QuoteSection.Features.AutoResponse.Desc"),
                    },
                  ].map((item, index) => (
                    <Grid size={{ xs: 12 }} key={index}>
                      <MotionBox
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                          p: 2,
                          borderRadius: 2,
                          background: theme.palette.card.main,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: "2rem",
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} mb={0.5}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.desc}
                          </Typography>
                        </Box>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </MotionBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MotionCard
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                sx={{
                  p: 5,
                  background: theme.palette.card.main,
                  borderRadius: 4,
                  boxShadow: `0 20px 60px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight={800}
                  mb={2}
                  color="text.primary"
                >
                  {t("QuoteSection.FormTitle")}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  mb={4}
                  sx={{ lineHeight: 1.8 }}
                >
                  {t("QuoteSection.FormDescription")}
                </Typography>

                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}

                {formSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {tCommon("FormSubmitSuccess")}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmitForm)}
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Controller
                    name="nameSurname"
                    control={control}
                    rules={{
                      required: tCommon("Required") || "Required",
                      minLength: {
                        value: 2,
                        message:
                          tCommon("MinLength2") ||
                          "Minimum 2 characters required",
                      },
                      maxLength: {
                        value: 100,
                        message:
                          tCommon("MaxLength100") ||
                          "Maximum 100 characters allowed",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`${tCommon("NameSurname")} *`}
                        fullWidth
                        disabled={formLoading}
                        variant="outlined"
                        error={!!errors.nameSurname}
                        helperText={errors.nameSurname?.message}
                        inputProps={{ maxLength: 100 }}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: tCommon("Required") || "Required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          tCommon("InvalidEmail") || "Invalid email format",
                      },
                      maxLength: {
                        value: 254,
                        message:
                          tCommon("MaxLength254") ||
                          "Maximum 254 characters allowed",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`${tCommon("Email")} *`}
                        type="email"
                        fullWidth
                        disabled={formLoading}
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        inputProps={{ maxLength: 254 }}
                      />
                    )}
                  />

                  <TelInput
                    name="phoneNumber"
                    control={control}
                    label={`${tCommon("PhoneNumber")} *`}
                    fullWidth
                    disabled={formLoading}
                    variant="outlined"
                    registerOptions={true}
                    error={!!errors.phoneNumber}
                    errorMessage={errors.phoneNumber?.message}
                    setValue={setValue}
                    t={tCommon}
                  />

                  <Controller
                    name="message"
                    control={control}
                    rules={{
                      required: tCommon("Required") || "Required",
                      minLength: {
                        value: 2,
                        message:
                          tCommon("MinLength2") ||
                          "Minimum 2 characters required",
                      },
                      maxLength: {
                        value: 500,
                        message:
                          tCommon("MaxLength500") ||
                          "Maximum 500 characters allowed",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`${tCommon("Message")} *`}
                        multiline
                        rows={4}
                        fullWidth
                        disabled={formLoading}
                        variant="outlined"
                        placeholder={tCommon("RequestDetailsPlaceholder")}
                        error={!!errors.message}
                        helperText={errors.message?.message}
                        inputProps={{ maxLength: 500 }}
                      />
                    )}
                  />

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <Turnstile
                      siteKey={
                        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
                        ""
                      }
                      onSuccess={(token) => setValue("captchaToken", token)}
                      onError={() => setValue("captchaToken", "")}
                      onExpire={() => setValue("captchaToken", "")}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={formLoading || formSuccess}
                    startIcon={
                      formLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <RealEstateAgentIcon />
                      )
                    }
                    sx={{
                      py: 2,
                      mt: 1,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, #2F3D5E 0%, #5B7FA8 50%, #7AA0CC 100%)`,
                      boxShadow: `0 8px 24px ${alpha("#2F3D5E", 0.35)}`,
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                        transition: "left 0.6s ease",
                      },
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 32px ${alpha("#2F3D5E", 0.5)}`,
                        background: `linear-gradient(135deg, #3A4A6F 0%, #6B8FB8 50%, #8FB5DC 100%)`,
                        "&::before": {
                          left: "100%",
                        },
                      },
                      transition: "all 0.4s ease",
                    }}
                  >
                    {formLoading
                      ? tCommon("Sending")
                      : tCommon("Send") || "Teklif Talep Et"}
                  </Button>
                </Box>
              </MotionCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 15 },
          background: theme.palette.background.paper,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            sx={{ textAlign: "center", mb: 8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              {t("Features.Title")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              {t("Features.Subtitle")}
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  sx={{
                    height: "100%",
                    background: theme.palette.card.main,
                    borderRadius: 3,
                    border: `1px solid ${alpha(feature.color, 0.1)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 10px 40px ${alpha(feature.color, 0.2)}`,
                      borderColor: alpha(feature.color, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        background: alpha(feature.color, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 15 },
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            sx={{ textAlign: "center", mb: 8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              {t("PresentationModes.Title")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              {t("PresentationModes.Subtitle")}
            </Typography>
          </MotionBox>

          <Grid container spacing={4} justifyContent="center">
            {presentations.map((presentation, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  sx={{
                    background: theme.palette.card.main,
                    borderRadius: 3,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    "&:hover": {
                      boxShadow: `0 10px 40px ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {presentation.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {presentation.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {presentation.description}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          background: `linear-gradient(135deg, ${
            theme.palette.primary.main
          } 0%, ${alpha("#5B7FA8", 0.95)} 100%)`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ py: 10 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 5 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Image
                      src="/logo-big-white.svg"
                      alt="Fine3D Logo"
                      width={180}
                      height={45}
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: "1rem",
                    }}
                  >
                    {t("Footer.Description")}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mb: 2,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    {t("Footer.FollowUs")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {[
                      { icon: <LinkedInIcon />, label: "LinkedIn" },
                      { icon: <TwitterIcon />, label: "Twitter" },
                      { icon: <FacebookIcon />, label: "Facebook" },
                      { icon: <InstagramIcon />, label: "Instagram" },
                      { icon: <YouTubeIcon />, label: "YouTube" },
                    ].map((item, index) => (
                      <MotionBox
                        key={index}
                        whileHover={{ scale: 1.15, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          {item.icon}
                        </Box>
                      </MotionBox>
                    ))}
                  </Box>
                </MotionBox>
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "white",
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("Footer.Products.Title")}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[
                      "3D Sahne",
                      "Dollhouse",
                      "Sanal Tur",
                      "Medya Galerisi",
                      "Analiz Araçları",
                      "Raporlama",
                    ].map((link, idx) => (
                      <Typography
                        key={link}
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          position: "relative",
                          paddingLeft: 0,
                          "&:hover": {
                            color: "white",
                            paddingLeft: 1.5,
                          },
                          "&:hover::before": {
                            width: 6,
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 0,
                            height: 2,
                            background: "white",
                            transition: "width 0.3s ease",
                          },
                        }}
                      >
                        {link}
                      </Typography>
                    ))}
                  </Box>
                </MotionBox>
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "white",
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("Footer.Company.Title")}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[
                      "Hakkımızda",
                      "Blog",
                      "Kariyer",
                      "İletişim",
                      "Destek",
                      "SSS",
                    ].map((link) => (
                      <Typography
                        key={link}
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          position: "relative",
                          paddingLeft: 0,
                          "&:hover": {
                            color: "white",
                            paddingLeft: 1.5,
                          },
                          "&:hover::before": {
                            width: 6,
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 0,
                            height: 2,
                            background: "white",
                            transition: "width 0.3s ease",
                          },
                        }}
                      >
                        {link}
                      </Typography>
                    ))}
                  </Box>
                </MotionBox>
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "white",
                      fontSize: "1.1rem",
                    }}
                  >
                    {t("Footer.Contact.Title")}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="body1">📧</Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                            mb: 0.3,
                          }}
                        >
                          {t("Footer.Contact.Email")}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {t("Footer.Contact.EmailValue")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="body1">📞</Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                            mb: 0.3,
                          }}
                        >
                          {t("Footer.Contact.Phone")}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {t("Footer.Contact.PhoneValue")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="body1">📍</Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                            mb: 0.3,
                          }}
                        >
                          {t("Footer.Contact.Address")}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {t("Footer.Contact.AddressValue")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </MotionBox>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              py: 4,
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid size={{ xs: 12, md: "auto" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  {t("Footer.Copyright", { year: new Date().getFullYear() })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 2, md: 4 },
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", md: "flex-end" },
                  }}
                >
                  {["Gizlilik Politikası", "Kullanım Şartları", "Çerezler"].map(
                    (link, idx) => (
                      <Typography
                        key={link}
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          position: "relative",
                          "&:hover": {
                            color: "white",
                          },
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: -2,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: "white",
                            transform: "scaleX(0)",
                            transition: "transform 0.3s ease",
                          },
                          "&:hover::after": {
                            transform: "scaleX(1)",
                          },
                        }}
                      >
                        {link}
                      </Typography>
                    )
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
