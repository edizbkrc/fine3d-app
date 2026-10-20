export interface IImage {
  url: string | null;
  altText: string | null;
}

export interface IInfoCardItem {
  id: string;
  name: string | null;
  description: string | null;
  displayOrder: number;
  image: IImage;
}

export interface IInfoCard {
  id: any;
  name: string | null;
  displayOrder: number;
  items: IInfoCardItem[];
}
