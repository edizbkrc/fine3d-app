import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { IPolygonModel } from "./IPolygonModel";

export interface ITagItem {
  id?: string;
  presentationType?: PresentationTypeEnum;
  order?: number;
  mainFrame?: boolean;
  image?: {
    url?: string | null;
    altText?: string | null;
  };
  /** Linked night image on the same frame (shared polygons). */
  nightImage?: {
    url?: string | null;
    altText?: string | null;
  } | null;
  polygons?: IPolygonModel[];
}
