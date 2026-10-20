export interface IGeoPoint {
  latitude: number;
  longitude: number;
}

export interface IMapMark {
  name: string;
  geoPoint: IGeoPoint;
  emoji: string | null;
  id: string;
  /** Panelden yüklenen özel ikon: URL, /hubapi/v1/map-icons/... yolu ya da data-URI. */
  customIcon?: string | null;
  /** true → ad haritada tıklamadan hep görünür. Eski API yanıtlarında hiç gelmeyebilir. */
  showLabel?: boolean;
  /** Kalıcı etiket rengi (#RRGGBB); null → varsayılan turuncu. */
  labelColor?: string | null;
}

export interface IMapData {
  geoPoint: IGeoPoint;
  zoom: number;
  marks: IMapMark[];
}

export interface IMapResponse {
  isSuccess: boolean;
  statusCode: number;
  messages: Array<{
    key: string;
    message: string;
    type: number;
  }>;
  data: IMapData;
  metadatas: any[];
}
