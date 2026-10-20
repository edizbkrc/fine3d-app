import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";
import { localStorageService } from "../Common/localStorageService";
import getAcceptLanguage from "./getAcceptLanguage";

export const getAppLanguage = () => {
  try {
    const language = localStorageService.getItem(LocalStorageKeysEnum.Language);
    return getAcceptLanguage(language);
  } catch (error) {
    return getAcceptLanguage();
  }
};
