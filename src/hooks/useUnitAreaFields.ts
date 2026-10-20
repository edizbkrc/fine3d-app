"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@redux/hooks";
import { UnitAreaFieldKey } from "@/types/IUnitAreaFields";

// Hub içerik dilleri yalnız tr-TR (21) ve en-US (22). Fine3D'de locale → languageId eşlemesi
// yoktu (VirtualTourViewer sabit 1 kullanıyor); API alan adlarını yalnız 21/22 ile üretir.
const LANGUAGE_ID_BY_LOCALE: Record<string, number> = { tr: 21, en: 22 };

const DEFAULT_LABEL_KEY: Record<UnitAreaFieldKey, string> = {
  grossArea: "GrossArea",
  netArea: "NetArea",
  indoorArea: "IndoorArea",
};

/**
 * Projeye özel alan etiketi ve gizleme bilgisi.
 * Ayar yoksa (config null) Common.* varsayılan çevirisi ve "görünür" döner; yani bugünkü
 * davranış birebir korunur. Diller arası geri düşüş bilinçli olarak YOK: EN arayüzde
 * yalnız TR adı girilmişse TR metin değil, EN varsayılanı gösterilir (panel ile aynı kural).
 */
export const useUnitAreaFields = () => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const fields = useAppSelector(
    (state) => state.AppReducer.presentationInitResponse?.config?.unitAreaFields,
  );

  // Bilinmeyen locale'de özel ad aranmaz, varsayılan çeviri kullanılır.
  const languageId: number | undefined = LANGUAGE_ID_BY_LOCALE[locale];

  // Yalnız projeye özel ad; yoksa null. Varsayılanı "Common.*Area" dışında kısa bir metin olan
  // yerler (ör. liste başlığındaki "Brüt") kendi varsayılanını korumak için bunu kullanır.
  const customLabel = useCallback(
    (key: UnitAreaFieldKey): string | null => {
      const custom = fields?.[key]?.translations
        ?.find((tr) => tr?.languageId === languageId)
        ?.name?.trim();
      return custom ? custom : null;
    },
    [fields, languageId],
  );

  const label = useCallback(
    (key: UnitAreaFieldKey): string =>
      customLabel(key) ?? t(DEFAULT_LABEL_KEY[key]),
    [customLabel, t],
  );

  const isHidden = useCallback(
    (key: UnitAreaFieldKey): boolean => fields?.[key]?.hidden === true,
    [fields],
  );

  return { label, customLabel, isHidden };
};
