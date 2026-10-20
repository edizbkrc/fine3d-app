export interface IBaseResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  messages: {
    key: string | null;
    message: string | null;
    type: string;
  }[];
  data: T;
}
