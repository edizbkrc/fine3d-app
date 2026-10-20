"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Box, Card, Stack, Typography, LinearProgress, useTheme } from "@mui/material";

interface BlockWorkflowPhase {
  name: string;
  description: string | null;
  progressImpact: number;
  done: boolean;
  order: number;
  completionDate: string | null;
  id: string;
}

interface BlockWorkflow {
  name: string;
  description: string;
  calculatedPercent: number;
  phases: BlockWorkflowPhase[];
  translations: any[];
  id: string;
}

interface BlockData {
  name: string;
  positionImage: {
    url: string;
    altText: string | null;
  } | null;
  stageId: number;
  workflow: BlockWorkflow | null;
  id: number;
}

interface BlockHoverCardProps {
  block: BlockData;
  position: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
}

const BlockHoverCard: React.FC<BlockHoverCardProps> = ({
  block,
  position,
  containerWidth,
  containerHeight,
}) => {
  const t = useTranslations("Common");
  const theme = useTheme();

  const cardWidth = 300;
  const cardMinHeight = 140;

  const adjustedX = Math.min(
    Math.max(position.x + 15, 10),
    containerWidth - cardWidth - 10
  );

  const adjustedY = Math.min(
    Math.max(position.y - 60, 10),
    containerHeight - cardMinHeight - 10
  );

  const hasValidWorkflow =
    block.workflow &&
    block.workflow.id !== "00000000-0000-0000-0000-000000000000" &&
    block.workflow.phases &&
    block.workflow.phases.length > 0;

  return (
    <Card
      sx={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        width: cardWidth,
        bgcolor: "background.paper",
        color: "text.primary",
        backdropFilter: "blur(20px)",
        zIndex: 999999,
        pointerEvents: "none",
        transform: "translateZ(0)",
        boxShadow: theme.shadows[8],
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        opacity: 0,
        animation: "blockCardFadeIn 0.2s ease-out forwards",
        "@keyframes blockCardFadeIn": {
          "0%": {
            opacity: 0,
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "text.primary",
            mb: 1.5,
          }}
        >
          {block.name} {t("Block")}
        </Typography>
        {hasValidWorkflow ? (
          <Stack spacing={1.5}>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}
                >
                  {block.workflow!.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary" }}
                >
                  %{block.workflow!.calculatedPercent.toFixed(0)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={block.workflow!.calculatedPercent}
                color="success"
                sx={{
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: theme.palette.action.hover,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {block.workflow!.description && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  fontStyle: "italic",
                  display: "block",
                }}
              >
                {block.workflow!.description}
              </Typography>
            )}

            {block.workflow!.phases.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ position: "relative", pl: 3 }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 5,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      bgcolor: theme.palette.divider,
                      borderRadius: 1,
                    }}
                  />
                  <Stack spacing={1.5}>
                    {[...block.workflow!.phases]
                      .sort((a, b) => a.order - b.order)
                      .map((phase) => (
                        <Stack
                          key={phase.id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: phase.done
                                ? "success.main"
                                : theme.palette.background.paper,
                              border: `2px solid ${phase.done
                                ? theme.palette.success.main
                                : theme.palette.divider}`,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "11px",
                              color: phase.done ? "success.main" : "text.secondary",
                              fontWeight: phase.done ? 600 : 400,
                              lineHeight: 1,
                            }}
                          >
                            {phase.name}
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "12px", color: "text.secondary", fontStyle: "italic" }}
            >
              {t("NoWorkflowInfo")}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default BlockHoverCard;
