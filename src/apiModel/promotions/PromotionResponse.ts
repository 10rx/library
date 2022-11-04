export default interface PromotionResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
