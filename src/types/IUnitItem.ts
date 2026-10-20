export interface IUnitItem {
  name: string;
  price: number;
  grossArea: number;
  netArea: number;
  indoorArea: number;
  virtualTourUrl: string | null;
  unitTypeId: number;
  unitNumber: number;
  facades: number[] | null;
  balconies: {
    name: string;
    image: {
      url: string;
      altText: string | null;
    };
    /** Opsiyonel gece panoraması (API: BalconyPresentationDto.nightImage). */
    nightImage?: {
      url: string;
      altText: string | null;
    } | null;
    displayOrder: number;
    id: string;
  }[];
  currentStateId: number | null;
  templateId: number;
  floor: {
    name: string;
    number: number;
    id: number;
  };
  block: {
    name: string;
    id: number;
  };
  stage: {
    name: string;
    id: number;
  };
  id: number;
  dollhouseId: number | null;
}
