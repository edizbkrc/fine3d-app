"use client";

import { useEffect } from "react";
import NotFoundComponent from "@/components/NotFoundComponent";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("NotFound");

  useEffect(() => {
    console.error("Page Error:", error?.message, error?.digest, error);
  }, [error]);

  return (
    <NotFoundComponent
      title={t("errorLoadingPresentation")}
      message={
        error?.message ||
        (error?.digest ? `digest: ${error.digest}` : undefined) ||
        t("message")
      }
      showHomeButton={true}
      showRefreshButton={true}
      onRetry={reset}
    />
  );
}
