import { TenrxOrderStatusID, TenrxProductStatusID, TenrxShippingType } from '../includes/TenrxEnums';

export default interface TenrxOrderDetailsResult {
  tax: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  datePlaced: Date;
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
    quantity: number;
    price: number;
    total: number;
    status: TenrxProductStatusID;
  }[];
  error?: string;
  doctor: {
    name: string | null;
    email: string | null;
  };
}
