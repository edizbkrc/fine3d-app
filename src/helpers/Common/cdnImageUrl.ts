/**
 * Localde CDN CORS sadece production origin'e açık.
 * Ayrıca /mobile/ path'leri Next image optimizer (node UA) için 403 dönüyor.
 * Localhost'ta same-origin proxy kullan.
 */
function isLocalRuntime(): boolean {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (
    base.includes("localhost") ||
    base.includes("127.0.0.1") ||
    base.startsWith("http://192.") ||
    base.startsWith("http://10.")
  ) {
    return true;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return false;
}

export function resolveCdnImageUrl(
  url?: string | null,
  options?: { preferMobile?: boolean },
): string {
  if (!url) return "";

  let resolved = url;

  // Localde mobile path + next/image = 403; production'da mobilde küçültülmüş path kullan
  if (options?.preferMobile && !isLocalRuntime()) {
    resolved = resolved.replace("/tenants/", "/mobile/tenants/");
  }

  if (isLocalRuntime()) {
    if (resolved.includes("://cdn.finegroup.com.tr")) {
      return resolved.replace(
        /^https?:\/\/cdn\.finegroup\.com\.tr/i,
        "/cdn-proxy",
      );
    }
    // Local Hub STORAGE_CDN_ACCESS_URL=https://localhost/cdn
    if (/^https?:\/\/localhost\/cdn/i.test(resolved)) {
      return resolved.replace(/^https?:\/\/localhost\/cdn/i, "/cdn-proxy");
    }
    // Sanal tur tile'ları CloudFront'ta
    if (resolved.includes("://dpjvxmlb5zg94.cloudfront.net")) {
      return resolved.replace(
        /^https?:\/\/dpjvxmlb5zg94\.cloudfront\.net/i,
        "/vt-proxy",
      );
    }
    // Workspace kareleri ayrı CloudFront dağıtımında; CORS localhost'a kapalı
    if (resolved.includes("://dacr5dzw4p130.cloudfront.net")) {
      return resolved.replace(
        /^https?:\/\/dacr5dzw4p130\.cloudfront\.net/i,
        "/ws-proxy",
      );
    }
  }

  return resolved;
}

/** Marzipano tile base URL'lerini localde same-origin proxy'ye çevir */
export function resolveVirtualTourBaseUrl(url?: string | null): string {
  if (!url) return "";
  return resolveCdnImageUrl(url);
}
