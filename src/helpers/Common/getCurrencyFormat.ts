import { CurrencyEnum } from "@helpers/types/CurrencyEnum";
import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";
import { localStorageService } from "./localStorageService";

export const getCurrencyFormat = (value?: number, symbol?: string) => {
  const currency = getCurrencyString();
  const currencyLanguage = getCurrencyLanguage();
  const formatter = new Intl.NumberFormat(currencyLanguage, {
    style: "currency",
    currency: symbol || currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value || 0);
};

function getCurrencyString() {
  try {
    const SystemInfo = JSON.parse(
      localStorageService.getItem(LocalStorageKeysEnum.SystemInfo)
    );
    const currency = SystemInfo?.currency;
    switch (currency) {
      case CurrencyEnum.TRY:
        return "TRY";
      case CurrencyEnum.USD:
        return "USD";
      default:
        return "TRY";
    }
  } catch (error) {
    return "TRY";
  }
}

export function getCurrencySymbol(symbol?: string) {
  switch (symbol) {
    case "₺":
      return "TRY";
    case "$":
      return "USD";
    case "€":
      return "EUR";
    case "£":
      return "GBP";
    case "₩":
      return "KRW";
    case "¥":
      return "JPY";
    default:
      return "TRY";
  }
}

function getCurrencyLanguage() {
  try {
    const SystemInfo = JSON.parse(
      localStorageService.getItem(LocalStorageKeysEnum.SystemInfo)
    );
    const language = SystemInfo?.language;
    switch (language) {
      case "tr":
        return "tr-TR";
      case "en":
        return "en-US";
      default:
        return "tr-TR";
    }
  } catch (error) {
    return "tr-TR";
  }
}
