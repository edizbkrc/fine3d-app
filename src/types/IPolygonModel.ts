import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { NavigationTypeEnum } from "@enums/NavigationTypeEnum";
import { PolygonTypeEnum } from "@enums/PolygonTypeEnum";
import { ShapeTypeEnum } from "@enums/ShapeTypeEnum";

export interface ISvgPoint {
  x: number;
  y: number;
}

export interface IPolygonModel {
  id: string;
  type?: PolygonTypeEnum;
  typeDescription: string | null;
  entityType?: EntityTypeEnum;
  entityTypeDescription: string | null;
  relatedEntityId?: number | null;
  navigationType?: NavigationTypeEnum;
  navigationTypeDescription: string | null;
  /** Sanal tur id'si 2^53'ten büyükse string gelir (bkz. entityId.ts). */
  navigationId?: number | string | null;
  navigationValue?: string | null;
  /** Blok/etap etiketi — poligon tepesine göre kaydırma (çizim uzayı). */
  labelOffsetX?: number | null;
  labelOffsetY?: number | null;
  points: ISvgPoint[];
  shapeType?: ShapeTypeEnum;
}
