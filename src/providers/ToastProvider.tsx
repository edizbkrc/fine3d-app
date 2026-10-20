"use client";

import React from "react";
import { closeSnackbar, SnackbarProvider } from "notistack";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={3000}
      action={(snackbarId) => (
        <IconButton
          onClick={() => closeSnackbar(snackbarId)}
          data-cy="ops-snackbar-close-button"
        >
          <Close sx={{ color: "white" }} />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};

export default ToastProvider;
