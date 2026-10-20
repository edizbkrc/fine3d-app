import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { ITagItem } from "@/types/ITagItem";

export const tagHasNightImage = (tag: ITagItem): boolean =>
  Boolean(tag?.nightImage?.url);

export const tagsHaveLinkedNight = (tags: ITagItem[]): boolean =>
  Boolean(tags?.some(tagHasNightImage));

export const getUniquePresentationTypesFromTags = (
  tags: ITagItem[]
): PresentationTypeEnum[] => {
  if (!tags?.length) return [];

  const uniqueTypes = new Set<PresentationTypeEnum>();

  tags.forEach((tag) => {
    if (tag.presentationType) {
      uniqueTypes.add(tag.presentationType);
    }
    // Dual-image frame: same tag supports day + night without a separate NightLight row.
    if (tagHasNightImage(tag)) {
      uniqueTypes.add(PresentationTypeEnum.DayLight);
      uniqueTypes.add(PresentationTypeEnum.NightLight);
    }
  });

  return Array.from(uniqueTypes);
};

export const shouldShowPresentationTypeToggle = (
  presentationTypes: PresentationTypeEnum[],
  tags: ITagItem[]
): boolean => {
  if (!presentationTypes?.length || presentationTypes.length < 2) {
    // Project may still expose NightMode feature types; dual images alone are enough.
    return tagsHaveLinkedNight(tags);
  }

  const tagTypes = getUniquePresentationTypesFromTags(tags);
  return tagTypes.length > 1 || tagsHaveLinkedNight(tags);
};

/**
 * Dual-image tags stay in the list for both day and night (shared polygons).
 * Legacy separate NightLight / DayLight rows keep the old type filter.
 */
export const filterTagsByPresentationType = (
  tags: ITagItem[],
  currentPresentationType: PresentationTypeEnum | null
): ITagItem[] => {
  if (!currentPresentationType || !tags?.length) {
    return tags || [];
  }

  return tags.filter((tag) => {
    if (tagHasNightImage(tag)) {
      return true;
    }

    if (!tag.presentationType) {
      return true;
    }

    return Number(tag.presentationType) === Number(currentPresentationType);
  });
};

/** Texture URL for the current day/night mode on one frame. */
export const resolveTagImageUrl = (
  tag: ITagItem | null | undefined,
  presentationType: PresentationTypeEnum | null
): string => {
  if (!tag) return "";
  if (
    Number(presentationType) === Number(PresentationTypeEnum.NightLight) &&
    tag.nightImage?.url
  ) {
    return tag.nightImage.url;
  }
  return tag.image?.url ?? "";
};

export const useFilteredTags = (
  tags: ITagItem[],
  currentPresentationType: PresentationTypeEnum | null
) => {
  return filterTagsByPresentationType(tags, currentPresentationType);
};
