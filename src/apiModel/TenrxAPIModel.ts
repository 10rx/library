export default interface TenrxAPIModel<T> {
  apiStatus: {
    message: string;
    statusCode: number;
    appError: string;
  };
  data: T;
}
