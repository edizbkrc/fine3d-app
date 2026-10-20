"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export function useStorageListenerLogout() {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        event.oldValue &&
        event.newValue === null &&
        pathname !== "/tr" &&
        pathname !== "/en" &&
        pathname !== "/"
      ) {
        window.location.href = `/${locale}`;
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname]);
}
