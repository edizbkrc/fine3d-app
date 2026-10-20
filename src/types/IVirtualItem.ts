export interface ITranslation {
  name?: string | null;
  languageId: number;
}

interface ISceneTranslation {
  name?: string | null;
  description?: string | null;
  languageId: number;
}

interface IHotspotTranslation {
  title?: string | null;
  content?: string | null;
  text?: string | null;
  languageId: number;
}

interface IImage {
  id?: string | null;
  url?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileVersion: number;
  order: number;
  altText?: string | null;
}

interface IHotspot {
  id: string;
  translations: IHotspotTranslation[];
  type: string;
  yaw: number;
  pitch: number;
  rotation?: number | null;
  targetScene: string;
}

interface IInitialViewParameters {
  yaw: number;
  pitch: number;
  fov: number;
}

export interface IScene {
  id: string;
  translations: ISceneTranslation[];
  image: IImage;
  /** Optional night panorama (equirect) when workspace is in night mode. */
  nightImage?: IImage | null;
  tilesBaseUrl?: string | null;
  tileConfigUrl?: string | null;
  fileName?: string | null;
  faceSize?: number | null;
  hotspots: IHotspot[];
  initialViewParameters: IInitialViewParameters;
}

export interface IViewerSettings {
  mouseViewMode: string;
  autorotateEnabled: boolean;
  fullscreenButton: boolean;
  viewControlButtons: boolean;
  initialSceneId?: string | null;
}

export interface IAuditInfo {
  creationDate?: string | null;
  creatorUserName?: string | null;
  lastModificationDate?: string | null;
  lastModifierUserName?: string | null;
}

export interface IVirtualItem {
  id: string;
  name: string;
  translations: ITranslation[];
  imagesBasePath?: string | null;
  scenes: IScene[];
  viewerSettings: IViewerSettings;
  unitTemplateId: number;
  auditInfo: IAuditInfo;
}
