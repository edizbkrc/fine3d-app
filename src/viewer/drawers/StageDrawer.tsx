"use client";
import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Typography,
  Stack,
  Divider,
  Card,
  Paper,
  useTheme,
} from "@mui/material";
import { useAppSelector } from "@redux/hooks";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";
import useViewer from "@/hooks/useViewer";

interface StageItem {
  id: number;
  name: string;
  blockCount: number;
  unitCount: number;
}

const StageDrawer: React.FC = () => {
  const theme = useTheme();
  const { presentationContentResponse, currentEntityType } = useAppSelector(
    (state) => state.AppReducer
  );
  const { handleChangePresentation } = useViewer();
  const t = useTranslations("Common");

  const stages: StageItem[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );

  if (currentEntityType !== EntityTypeEnum.Project) {
    return null;
  }

  const renderStageItem = (stage: StageItem, index: number) => (
    <Box key={stage.id}>
      <Card
        elevation={0}
        onClick={() =>
          handleChangePresentation(EntityTypeEnum.ProjectStage, stage.id)
        }
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "card.main",
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
              "0px 12px 28px rgba(47, 61, 94, 0.15), 0px 2px 8px rgba(47, 61, 94, 0.08)",
            borderColor: "primary.main",
            "&:before": {
              opacity: 1,
            },
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "primary.main",
              fontSize: "22px",
              letterSpacing: "-0.5px",
              mb: 1,
            }}
          >
            {stage.name}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 2,
              borderRadius: 1,
              bgcolor: "primary.main",
              mx: "auto",
              opacity: 0.8,
            }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Box
            sx={{
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)"
                  : "linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)",
              color: theme.palette.text.primary,
              px: 3,
              py: 2.5,
              borderRadius: 3,
              textAlign: "center",
              flex: 1,
              position: "relative",
              boxShadow: theme.shadows[4],
              transition: "all 0.3s ease",
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                transform: "translateY(-3px) scale(1.02)",
                boxShadow: theme.shadows[8],
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #3A3A3A 0%, #4A4A4A 100%)"
                    : "linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)",
              },
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <BusinessIcon
                sx={{
                  fontSize: 24,
                  filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))",
                }}
              />
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ fontSize: "20px", lineHeight: 1 }}
                >
                  {stage.blockCount}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "11px",
                    opacity: 0.9,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 500,
                  }}
                >
                  {t("Block")}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              background:
                "linear-gradient(135deg, rgba(47, 61, 94, 0.8) 0%, rgba(47, 61, 94, 0.6) 100%)",
              color: "primary.contrastText",
              px: 3,
              py: 2.5,
              borderRadius: 3,
              textAlign: "center",
              flex: 1,
              position: "relative",
              boxShadow: "0px 4px 12px rgba(47, 61, 94, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 16px rgba(47, 61, 94, 0.4)",
                background:
                  "linear-gradient(135deg, rgba(47, 61, 94, 0.9) 0%, rgba(47, 61, 94, 0.7) 100%)",
              },
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <HomeIcon
                sx={{
                  fontSize: 24,
                  filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))",
                }}
              />
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ fontSize: "20px", lineHeight: 1 }}
                >
                  {stage.unitCount}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "11px",
                    opacity: 0.9,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 500,
                  }}
                >
                  {t("Unit")}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      {index < stages.length - 1 && (
        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          <Box
            sx={{
              flex: 1,
              height: 1,
              bgcolor: "divider",
              opacity: 0.5,
            }}
          />
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              mx: 2,
              opacity: 0.8,
            }}
          />
          <Box
            sx={{
              flex: 1,
              height: 1,
              bgcolor: "divider",
              opacity: 0.5,
            }}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: "100%", overflow: "auto" }} data-tour="stage-drawer">
      <Box
        sx={{
          p: 4,
          pb: 3,
          bgcolor: "card2.main",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: "primary.main",
            opacity: 0.8,
          },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(145deg, #3A3A3A 0%, #4A4A4A 100%)"
                  : "linear-gradient(145deg, #E0E0E0 0%, #F5F5F5 100%)",
              boxShadow: theme.shadows[6],
              border: `1px solid ${theme.palette.divider}`,
              position: "relative",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-3px) scale(1.05)",
                boxShadow: theme.shadows[12],
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, #4A4A4A 0%, #5A5A5A 100%)"
                    : "linear-gradient(145deg, #F5F5F5 0%, #FFFFFF 100%)",
              },
            }}
          >
            <BusinessIcon
              sx={{
                fontSize: 30,
                color: theme.palette.text.primary,
                filter:
                  theme.palette.mode === "dark"
                    ? "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
                    : "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))",
                transition: "all 0.3s ease",
              }}
            />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: "primary.main",
                fontSize: "26px",
                letterSpacing: "-0.5px",
                mb: 1,
              }}
            >
              {t("ProjectStages")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              {t("StageCount", { count: stages.length })}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 4, py: 3 }} data-tour="stage-drawer-items">
        <Stack spacing={0}>
          {stages.map((stage, index) => renderStageItem(stage, index))}
        </Stack>
      </Box>

      {stages.length === 0 && (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <Box
            sx={{
              p: 4,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(226, 232, 240, 0.1) 0%, rgba(148, 163, 184, 0.1) 100%)",
              border: "2px dashed rgba(203, 213, 225, 0.5)",
              mb: 3,
            }}
          >
            <BusinessIcon
              sx={{
                fontSize: 48,
                color: "text.disabled",
                opacity: 0.6,
              }}
            />
          </Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              color: theme.palette.text.secondary,
              mb: 1,
            }}
          >
            {t("NoStagesFound")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 300,
              lineHeight: 1.6,
            }}
          >
            {t("NoStagesDescription")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StageDrawer;
