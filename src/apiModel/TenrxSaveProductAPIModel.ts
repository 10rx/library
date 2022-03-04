export default interface TenrxSaveProductAPIModel {
  statusId?: number;
  paymentId: number;
  totalPrice: number;
  medicationProducts: {
    productName: string;
    productDetails: string;
    quantity: number;
    price: number;
    productId: number;
    strength: string;
  }[];
}
