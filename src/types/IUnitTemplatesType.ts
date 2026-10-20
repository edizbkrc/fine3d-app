import { IVirtualItem } from "./IVirtualItem";

export interface IUnitTemplatesType {
  id: number;
  name: string;
  grossArea: number;
  netArea: number;
  virtualTourUrl: string | null;
  unitTypeId: number;
  image: {
    url: string;
    altText: string | null;
  };
  specifications: Array<{
    id: string;
    name: string;
    value: string;
  }>;

  virtualTours: IVirtualItem[];
}
