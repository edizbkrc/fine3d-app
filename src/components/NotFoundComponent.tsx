"use client";

import { Box, Button, Typography, Container, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import NotFoundLottie from "@/assets/lottie/notfound.json";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

interface NotFoundComponentProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
  onRetry?: () => void;
  customAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotFoundComponent({
  title,
  message,
  showHomeButton = true,
  showRefreshButton = true,
  onRetry,
  customAction,
}: NotFoundComponentProps) {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("NotFound");
  const theme = useTheme();

  const handleGoHome = () => {
    const locale =
      typeof params?.locale === "string" ? params.locale : "tr";
    // Localde marketing'e atmadan locale köküne dön
    router.push(`/${locale}`);
  };

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1E1E1E 0%, #121212 100%)"
            : "linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(178, 208, 201, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(178, 208, 201, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            animation: "fadeIn 0.8s ease-in-out",
            "@keyframes fadeIn": {
              from: {
                opacity: 0,
                transform: "translateY(20px)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <Box
            sx={{
              mb: 4,
              animation: "float 3s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": {
                  transform: "translateY(0px)",
                },
                "50%": {
                  transform: "translateY(-20px)",
                },
              },
            }}
          >
            <Player
              autoplay
              loop
              src={NotFoundLottie}
              style={{
                height: "300px",
                width: "300px",
                margin: "0 auto",
              }}
            />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              mb: 2,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              fontSize: {
                xs: "2rem",
                sm: "2.5rem",
                md: "3rem",
              },
            }}
          >
            {title || t("title")}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              mb: 4,
              px: 2,
              lineHeight: 1.6,
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
              },
            }}
          >
            {message || t("message")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              mt: 4,
            }}
          >
            {showHomeButton && (
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  backgroundColor: "#B2D0C9",
                  color: theme.palette.mode === "dark" ? "#1E1E1E" : "#2F3D5E",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  minWidth: { xs: "200px", sm: "auto" },
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#a0c4bd",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  },
                }}
              >
                {t("goHome")}
              </Button>
            )}

            {showRefreshButton && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  minWidth: { xs: "200px", sm: "auto" },
                  borderWidth: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t("refresh")}
              </Button>
            )}

            {customAction && (
              <Button
                variant="outlined"
                size="large"
                onClick={customAction.onClick}
                sx={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  minWidth: { xs: "200px", sm: "auto" },
                  borderWidth: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {customAction.label}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
