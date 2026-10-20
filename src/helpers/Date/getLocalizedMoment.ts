import moment from "moment";
import "moment/locale/tr";
import { localStorageService } from "../Common/localStorageService";
import { LocalStorageKeysEnum } from "@/enums/LocalStorageKeysEnum";

export default function getLocalizedMoment(value: any) {
  const lang = localStorageService.getItem(LocalStorageKeysEnum.Language);
  return moment(value).locale(lang);
}
