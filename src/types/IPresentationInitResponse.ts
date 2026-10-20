"use client";
import { PresentationTypeEnum } from "@enums/PresentationTypeEnum";
import { IUnitState } from "./IUnitState";
import { IUnitTemplatesType } from "./IUnitTemplatesType";
import { IUnitTypeModel } from "./IUnitTypeModel";
import { IVirtualItem } from "./IVirtualItem";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { IPresentationConfig } from "./IUnitAreaFields";

export interface IPresentationInitResponse {
  startingEntity: EntityTypeEnum;
  projectId: number;
  projectName: string;
  projectSlogan: string;
  initialStageId: number | null;
  startMode: PresentationTypeEnum;
  themeObject: any;
  canvasConfig: any;
  compassInitialDegree: any;
  companyName: string;
  unitStates: IUnitState[];
  unitTemplates: IUnitTemplatesType[];
  unitTypes: IUnitTypeModel[];
  companyLogo: any;
  showUnitPricesInFine3d: boolean;
  projectVirtualTours?: IVirtualItem[];
  minimapId: string | null;
  // Proje config'i (alan adları vb.); ayarsız projede null.
  config?: IPresentationConfig | null;
}
