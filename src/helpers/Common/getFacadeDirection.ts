import { IUnitItem } from "@/types/IUnitItem";

interface FacadeDirectionResult {
  text: string;
  count: number;
  facades: number[];
}

export const getFacadeDirection = (
  unit: IUnitItem | null | undefined,
  t: (key: string) => string
): string => {
  if (!unit?.facades || unit.facades.length === 0) {
    return t("Unknown");
  }

  const facadeNames = unit.facades
    .map((facade) => t(`Facades.${facade}`) || t("Unknown"))
    .filter((name) => name !== t("Unknown"));

  if (facadeNames.length === 0) {
    return t("Unknown");
  }

  return facadeNames.join(", ");
};
