import { IconButton, styled } from "@mui/material";

const OpsIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: "10px",
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(249, 250, 252, 0.8)"
      : "rgba(32, 33, 36, 0.8)",
  color: theme.palette.primary.main,
  ":hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(249, 250, 252, 0.8)"
        : "rgba(32, 33, 36, 0.8)",
    color: theme.palette.primary.dark,
  },
}));

export default OpsIconButton;
