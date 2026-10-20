import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { ITagItem } from "./ITagItem";

export interface IPresentationResponse {
  tags: ITagItem[];
  presentationTypes: PresentationTypeEnum[];
}
