"use client";

import { Component, ReactNode } from "react";
import { logClientError } from "@helpers/Common/clientLogger";
import { Box, Typography, Button } from "@mui/material";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
  }>;
}

export class ClientErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logClientError({
      ...error,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          gap={2}
          p={3}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            We&apos;re sorry, but something unexpected happened. Our team has
            been notified.
          </Typography>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <Box
              component="pre"
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                maxWidth: "100%",
                overflow: "auto",
                fontSize: "0.75rem",
              }}
            >
              {this.state.error.message}
            </Box>
          )}
          <Button variant="contained" onClick={this.resetError} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
