"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function GATracker() {
  const params = useParams();

  useEffect(() => {
    if (typeof window !== "undefined" && params?.tenantId) {
      const tenantId = decodeURIComponent(params.tenantId as string);
      const gtag = (window as any).gtag;

      if (gtag) {

        gtag("set", "user_properties", {
          tenant_id: tenantId,
        });

        gtag("config", "G-9Q1W7B7PB0", {
          tenant_id: tenantId,
        });

        gtag("event", "tenant_view", {
          tenant_id: tenantId,
        });
      }
    }
  }, [params?.tenantId]);

  return null;
}
