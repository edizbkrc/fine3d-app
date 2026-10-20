import { resolveCdnImageUrl } from "./cdnImageUrl";

/** Hub panelinin varsayılan etiket rengi (marka turuncusu) — panel önizlemesiyle aynı. */
export const DEFAULT_MAP_LABEL_COLOR = "#F26522";

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * MapMarker.customIcon'u tarayıcının yükleyebileceği adrese çevirir.
 *
 * Hub API özel ikonu diske yazıp "/hubapi/v1/map-icons/{projectId}/{dosya}" gibi
 * KÖK-GÖRELİ bir yol döndürüyor; bu yol panelde Next rewrite'ıyla çalışıyor ama
 * Fine3D başka origin'de (localde :3001, canlıda app.fine3d.com.tr) olduğundan
 * kendi origin'ine çözülüp 404 olur. Bu yüzden API taban adresine bağlıyoruz.
 * Google Maps işaret ikonu düz <img> olarak yüklendiği için CORS gerekmez; proxy
 * yalnızca CDN adreslerinde (resolveCdnImageUrl) devreye girer.
 */
export function resolveMapMarkerIconUrl(customIcon?: string | null): string {
  const value = typeof customIcon === "string" ? customIcon.trim() : "";
  if (!value) return "";

  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (/^https?:\/\//i.test(value)) return resolveCdnImageUrl(value);

  if (value.startsWith("/hubapi/")) {
    // NEXT_PUBLIC_API_URL zaten ".../hubapi" ile bitiyor; öneki tekrarlamamak için kesiyoruz.
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    if (apiBase) return apiBase + value.slice("/hubapi".length);
  }

  if (value.startsWith("/")) {
    const imageBase = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").replace(/\/+$/, "");
    return imageBase ? imageBase + value : value;
  }

  // Tanınmayan biçim (ör. eski kayıtlarda yalnız dosya adı) — tahmin yürütmek
  // yanlış görsel gösterebilir; çağıran emoji ikonuna düşsün.
  return "";
}

/** Geçersiz/boş rengi varsayılana çevirir — serbest metin CSS'e enjekte edilmesin. */
export function normalizeLabelColor(color?: string | null): string {
  const value = typeof color === "string" ? color.trim() : "";
  return HEX_COLOR.test(value) ? value : DEFAULT_MAP_LABEL_COLOR;
}

/**
 * Etiket arka planına göre okunur metin rengi. Varsayılan beyaz; kullanıcı sarı
 * gibi açık bir renk seçerse beyaz metin kaybolacağı için koyu metne geçilir.
 */
export function labelTextColor(background: string): string {
  let hex = background.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "#fff";
  // YIQ parlaklık eşiği: basit ve harita etiketleri için yeterince doğru.
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 170 ? "#1a1a1a" : "#fff";
}
