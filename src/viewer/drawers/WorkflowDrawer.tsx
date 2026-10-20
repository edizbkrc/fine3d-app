"use client";
import React from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Chip,
  useTheme,
  LinearProgress,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { closeWorkflowDrawer } from "@redux/appSlice";

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

const WorkflowDrawer: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations("Common");
  const dispatch = useAppDispatch();

  const { workflowDrawerOpen, projectBlockContent, currentEntityId } =
    useAppSelector((state) => state.AppReducer);

  const handleClose = () => {
    dispatch(closeWorkflowDrawer());
  };

  const currentBlock = projectBlockContent?.find(
    (block: BlockData) => block?.id === Number(currentEntityId)
  );

  const workflow = currentBlock?.workflow;

  if (!workflow) {
    return null;
  }

  const sortedPhases = [...workflow.phases].sort((a, b) => a.order - b.order);
  const completedCount = sortedPhases.filter((phase) => phase.done).length;
  const totalCount = sortedPhases.length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={workflowDrawerOpen}
      onClose={handleClose}
      sx={{
        zIndex: 999999,
        "& .MuiDrawer-paper": {
          width:  "100vw",
          height: "100vh",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountTreeIcon sx={{ fontSize: 28, color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {currentBlock?.name} {t("Block")} - {workflow.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  {workflow.description}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box sx={{ mt: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                {t("Progress")}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "success.main",
                  }}
                >
                  %{workflow.calculatedPercent.toFixed(0)}
                </Typography>
                <Chip
                  label={`${completedCount}/${totalCount} ${t("Phase")}`}
                  size="small"
                  sx={{
                    bgcolor: "success.main",
                    color: "#fff",
                    fontWeight: 600,
                    height: 28,
                  }}
                />
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={workflow.calculatedPercent}
              color="success"
              sx={{
                height: 10,
                borderRadius: 2,
                bgcolor: theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            p: 2,
            pr: 1,
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
              },
            },
          }}
        >
          <Timeline
            position="right"
            sx={{
              p: 0,
              m: 0,
              "& .MuiTimelineItem-root": {
                minHeight: 100,
              },
              "& .MuiTimelineItem-root:before": {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {sortedPhases.map((phase, index) => {
              const isCompleted = phase.done;
              const isLast = index === sortedPhases.length - 1;
              const completionDate = formatDate(phase.completionDate);

              return (
                <TimelineItem key={phase.id}>
                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        background: isCompleted
                          ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
                          : theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
                          : "linear-gradient(135deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.04) 100%)",
                        boxShadow: isCompleted
                          ? "0 0 0 4px rgba(76, 175, 80, 0.2), 0 4px 12px rgba(76, 175, 80, 0.3)"
                          : theme.shadows[1],
                        p: isCompleted ? 1.2 : 1,
                        border: isCompleted ? "none" : "2px solid",
                        borderColor: theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 20, color: "white" }}
                        />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{
                            fontSize: 20,
                            color: theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.3)"
                              : "action.disabled"
                          }}
                        />
                      )}
                    </TimelineDot>
                    {!isLast && (
                      <TimelineConnector
                        sx={{
                          background: isCompleted
                            ? "linear-gradient(180deg, #4caf50 0%, rgba(76, 175, 80, 0.5) 100%)"
                            : theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.12)",
                          minHeight: 40,
                          width: 3,
                        }}
                      />
                    )}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: 2, px: 2 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: isCompleted
                          ? theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)"
                            : "linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(76, 175, 80, 0.05) 100%)"
                          : theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
                          : "linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)",
                        border: "1px solid",
                        borderColor: isCompleted
                          ? theme.palette.mode === "dark"
                            ? "rgba(76, 175, 80, 0.3)"
                            : "success.light"
                          : theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "divider",
                        transition: "all 0.3s ease",
                        boxShadow: isCompleted ? theme.shadows[1] : "none",
                        "&:hover": {
                          boxShadow: theme.shadows[4],
                          transform: "translateY(-4px) scale(1.02)",
                          borderColor: isCompleted ? "success.main" : "primary.main",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: phase.description ? 1 : 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: isCompleted ? "success.dark" : "text.primary",
                          }}
                        >
                          {phase.name}
                        </Typography>
                        {completionDate && (
                          <Typography
                            variant="caption"
                            sx={{ color: "success.main", fontSize: "10px", flexShrink: 0, ml: 1 }}
                          >
                            {completionDate}
                          </Typography>
                        )}
                      </Stack>
                      {phase.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontSize: "13px",
                            lineHeight: 1.6,
                          }}
                        >
                          {phase.description}
                        </Typography>
                      )}
                      {phase.progressImpact > 0 && (
                        <Chip
                          icon={
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor:  isCompleted ? "success.main" : "primary.main",
                                ml: 1,
                              }}
                            />
                          }
                          label={`${t("Impact")}: %${phase.progressImpact}`}
                          size="small"
                          sx={{
                            mt: 1.5,
                            fontSize: "11px",
                            height: 26,
                            fontWeight: 600,
                            bgcolor: isCompleted
                              ? theme.palette.mode === "dark"
                                ? "rgba(76, 175, 80, 0.15)"
                                : "rgba(76, 175, 80, 0.08)"
                              : theme.palette.mode === "dark"
                              ? "rgba(25, 118, 210, 0.15)"
                              : "rgba(25, 118, 210, 0.08)",
                            color: isCompleted ? "success.main" : "primary.main",
                            border: "1px solid",
                            borderColor: isCompleted
                              ? theme.palette.mode === "dark"
                                ? "rgba(76, 175, 80, 0.3)"
                                : "rgba(76, 175, 80, 0.2)"
                              : theme.palette.mode === "dark"
                              ? "rgba(25, 118, 210, 0.3)"
                              : "rgba(25, 118, 210, 0.2)",
                          }}
                        />
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>

          {sortedPhases.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                bgcolor: theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "transparent",
                borderRadius: 2,
              }}
            >
              <AccountTreeIcon
                sx={{
                  fontSize: 64,
                  color: "action.disabled",
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                {t("NoPhases")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                {t("NoPhasesDescription")}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default WorkflowDrawer;
