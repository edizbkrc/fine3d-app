"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RootState } from "@redux/store";
import { setCurrentPresentationType } from "@redux/appSlice";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import {
  shouldShowPresentationTypeToggle,
  getUniquePresentationTypesFromTags,
  tagsHaveLinkedNight,
} from "@helpers/Common/tagFilters";

export const usePresentationType = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPresentationType = useSelector(
    (state: RootState) => state.AppReducer.currentPresentationType
  );

  const presentationResponse = useSelector(
    (state: RootState) => state.AppReducer.presentationResponse
  );

  const presentationInitResponse = useSelector(
    (state: RootState) => state.AppReducer.presentationInitResponse
  );

  const availablePresentationTypes =
    presentationResponse?.presentationTypes || [];

  const tags = presentationResponse?.tags || [];

  const cycleTypes = useMemo(() => {
    const fromTags = getUniquePresentationTypesFromTags(tags);
    if (fromTags.length > 1) return fromTags;
    if (tagsHaveLinkedNight(tags)) {
      return [PresentationTypeEnum.DayLight, PresentationTypeEnum.NightLight];
    }
    return availablePresentationTypes;
  }, [tags, availablePresentationTypes]);

  const canToggle = shouldShowPresentationTypeToggle(
    availablePresentationTypes,
    tags
  );

  // Honor URL ?presentationType= and init startMode once types are known.
  useEffect(() => {
    if (!cycleTypes.length) return;

    const fromUrl = searchParams.get("presentationType");
    if (fromUrl) {
      const parsed = Number(fromUrl) as PresentationTypeEnum;
      if (cycleTypes.includes(parsed) && parsed !== currentPresentationType) {
        dispatch(setCurrentPresentationType(parsed));
        return;
      }
    }

    const startMode = presentationInitResponse?.startMode;
    if (
      startMode &&
      cycleTypes.includes(startMode) &&
      currentPresentationType == null
    ) {
      dispatch(setCurrentPresentationType(startMode));
    }
  }, [
    cycleTypes,
    searchParams,
    presentationInitResponse?.startMode,
    currentPresentationType,
    dispatch,
  ]);

  const changePresentationType = useCallback(
    (newType: PresentationTypeEnum) => {
      if (
        availablePresentationTypes.length > 0 &&
        !availablePresentationTypes.includes(newType) &&
        !tagsHaveLinkedNight(tags)
      ) {
        return;
      }

      dispatch(setCurrentPresentationType(newType));

      const params = new URLSearchParams(searchParams.toString());
      params.set("presentationType", newType.toString());
      router.replace(`${pathname}?${params.toString()}`);
    },
    [
      dispatch,
      router,
      pathname,
      searchParams,
      availablePresentationTypes,
      tags,
    ]
  );

  const togglePresentationType = useCallback(() => {
    if (!canToggle || !currentPresentationType) return;

    const typesToCycle = cycleTypes.length > 0 ? cycleTypes : availablePresentationTypes;

    if (typesToCycle.length <= 1) return;

    const currentIndex = typesToCycle.indexOf(currentPresentationType);
    const nextIndex = (currentIndex + 1) % typesToCycle.length;
    const nextType = typesToCycle[nextIndex];

    changePresentationType(nextType);
  }, [
    canToggle,
    currentPresentationType,
    availablePresentationTypes,
    changePresentationType,
    cycleTypes,
  ]);

  return {
    currentPresentationType,
    availablePresentationTypes,
    canToggle,
    changePresentationType,
    togglePresentationType,
  };
};
