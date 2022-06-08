import { TenrxOrderStatusID, TenrxProductStatusID, TenrxShippingType } from '../includes/TenrxEnums';

export default interface TenrxOrderDetailsResult {
  tax: number;
  subtotal: number;
  shippingFee: number;
  orderStatus: TenrxOrderStatusID;
  shippingType: TenrxShippingType;
  last4: string;
  shippingAddress: {
    address1: string;
    address2: string | null;
    city: string;
    zipCode: string;
  };
  tracking: {
    id: string | null;
    carrier: string | null;
  };
  products: {
    name: string;
    status: TenrxProductStatusID;
    subtotal: number;
    tax: number;
  }[];
  error?: string;
}
