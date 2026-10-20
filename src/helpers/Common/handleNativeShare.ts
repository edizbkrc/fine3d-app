import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import { setGeneralLoading } from "@redux/appSlice";
import { store } from "@redux/store";
import { enqueueSnackbar } from "notistack";

interface ShareOptions {
  unitName?: string;
  projectName?: string;
  text?: string;
  url?: string;
  t: (key: string) => string;
  presentationInitResponse?: any;
}

export const handleNativeShare = async ({
  unitName,
  projectName,
  text,
  url,
  t,
  presentationInitResponse,
}: ShareOptions): Promise<void> => {
  store.dispatch(setGeneralLoading(true));
  const response = await axiosInstance.post(OpsApiRoutes.Applink, {
    url: url || (typeof window !== "undefined" ? window.location.href : ""),
    tenantId: presentationInitResponse?.tenantId || "",
    projectId: presentationInitResponse?.projectId || "",
    projectSlug: presentationInitResponse?.projectSlug || "",
  });
  store.dispatch(setGeneralLoading(false));
  const shareUrl = response?.data?.data;
  url || (typeof window !== "undefined" ? window.location.href : "");

  let shareTitle = "Fine3D";
  if (unitName) {
    shareTitle = `${unitName} ${t("ViewUnit") || "Dairesine Bakın!"}`;
  } else if (projectName) {
    shareTitle = `${projectName} - Fine3D`;
  }

  const shareText = text || shareTitle;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        enqueueSnackbar(t("ShareFailed") || "Failed to share", {
          variant: "error",
        });
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      enqueueSnackbar(t("LinkCopied") || "Link copied to clipboard!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(t("CopyFailed") || "Failed to copy link", {
        variant: "error",
      });
    }
  }
};
