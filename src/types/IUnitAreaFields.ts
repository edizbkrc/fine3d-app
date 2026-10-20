// Projeye özel mülk alanı adları/gizleme ayarı. Hub API'de FineProjects.Config jsonb'deki
// ProjectConfig.UnitAreaFields'ten gelir; presentation init yanıtında data.config.unitAreaFields.
// Anahtarlar entity alan adlarıyla (grossArea/netArea/indoorArea) bilerek aynı tutuldu.
export type UnitAreaFieldKey = "grossArea" | "netArea" | "indoorArea";

export interface IUnitAreaFieldTranslation {
  name?: string | null;
  languageId: number;
}

export interface IUnitAreaField {
  hidden?: boolean;
  translations?: IUnitAreaFieldTranslation[];
}

export type IUnitAreaFields = Partial<
  Record<UnitAreaFieldKey, IUnitAreaField | null>
>;

// Init yanıtındaki proje config'i. Yerelde/eski projelerde config tamamen null gelir.
export interface IPresentationConfig {
  unitAreaFields?: IUnitAreaFields | null;
  mobileViewMode?: number;
  canvasConfig?: string | null;
  muiThemeObject?: string | null;
}
