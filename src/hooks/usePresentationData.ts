"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { filterTagsByPresentationType } from "@helpers/Common/tagFilters";
import { usePresentationType } from "./usePresentationType";

export const usePresentationData = () => {
  const { currentPresentationType, availablePresentationTypes, canToggle } =
    usePresentationType();

  const {
    presentationInitResponse,
    presentationResponse,
    tabBarContentResponse,
    presentationContentResponse,
  } = useSelector((state: RootState) => state.AppReducer);

  const filteredTags = useMemo(() => {
    const tags = presentationResponse?.tags || [];
    return filterTagsByPresentationType(tags, currentPresentationType);
  }, [presentationResponse?.tags, currentPresentationType]);

  const isPresentationTypeSupported = useMemo(() => {
    return availablePresentationTypes.length > 0;
  }, [availablePresentationTypes]);

  return {
    presentationInitResponse,
    presentationResponse,
    tabBarContentResponse,
    presentationContentResponse,
    filteredTags,
    currentPresentationType,
    availablePresentationTypes,
    canToggle,
    isPresentationTypeSupported,
    getTotalTagCount: () => presentationResponse?.tags?.length || 0,
    getFilteredTagCount: () => filteredTags.length,
  };
};
