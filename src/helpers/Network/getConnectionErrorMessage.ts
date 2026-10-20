import { store } from "@redux/store";
import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";
import { localStorageService } from "../Common/localStorageService";

export const getConnectionErrorMessage = () => {
  const langCode: "tr" | "en" =
    (localStorageService.getItem(LocalStorageKeysEnum.Language) as
      | "tr"
      | "en") || "en";
  return (
    store.getState().AppReducer?.connectionErrorMessages?.[langCode] ||
    "You have no internet connection. Please check your connection."
  );
};
