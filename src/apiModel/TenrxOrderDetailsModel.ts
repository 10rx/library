export default interface TenrxOrderDetailsModel {
  address1: string;
  address2: string | null;
  city: string;
  zipCode: string;
  last4: string;
  createdDate: string;
  productName: string;
  productStatusId: number;
  orderStatus: number;
  shippingType: number;
  shippingFees: number;
  totalTax: number;
  subtotal: number;
  trackingNumber: string | null;
  carrier: string | null;
}
