import { generateSignature } from "./generateSignature";
import { analytics } from "./analytics";

const detectPlatform = (): string => {
  if (typeof navigator === "undefined") return "server";

  const ua = navigator.userAgent;

  if (/windows phone/i.test(ua)) return "Windows Phone";
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";

  return "unknown";
};

export const logClientError = async (error: {
  message?: string;
  stack?: string;
  name?: string;
  componentStack?: string | null;
  errorBoundary?: boolean;
  [key: string]: any;
}): Promise<void> => {
  if (process.env.NODE_ENV === "development") {
    console.error("Client Error:", error);
    return;
  }

  try {
    const payload = {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      componentStack: error?.componentStack,
      errorBoundary: error?.errorBoundary,
      url: typeof window !== "undefined" ? window.location.href : "",
      path: typeof window !== "undefined" ? window.location.pathname : "",
      search: typeof window !== "undefined" ? window.location.search : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      language: typeof navigator !== "undefined" ? navigator.language : "",
      platform: detectPlatform(),
      screenWidth: typeof window !== "undefined" ? window.screen?.width : 0,
      screenHeight: typeof window !== "undefined" ? window.screen?.height : 0,
      hardwareConcurrency:
        typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 0,
      maxTouchPoints:
        typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0,
      devicePixelRatio:
        typeof window !== "undefined" ? window.devicePixelRatio : 1,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      errorType: "client",
      time: new Date().toISOString(),
      performanceNow:
        typeof performance !== "undefined" ? performance.now() : 0,
    };

    analytics.trackError(new Error(error.message || "Unknown error"), {
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
    });

    const signature = await generateSignature(
      payload,
      process.env.NEXT_PUBLIC_LOG_API_SECRET!
    );

    if (process.env.NODE_ENV !== "production") {
      console.log("Client Error Log:", payload, signature);
    }

    await fetch("/api/client-log", {
      method: "POST",
      body: JSON.stringify({ payload, signature }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (logError) {
    console.error("Failed to log client error:", logError);
  }
};
