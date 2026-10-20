declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const analytics = {
  trackPageView: (url: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  },

  trackEvent: (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  },

  trackError: (error: Error, errorInfo?: any) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
        ...errorInfo,
      });
    }
  },
};

export default analytics;
