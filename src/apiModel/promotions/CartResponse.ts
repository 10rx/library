import { CartItem, CartTaxDetails, TenrxShippingType } from '../../index.js';

export default interface CartResponse {
  id?: number;
  promotionCode: string | null;
  items: CartItem[];
  created?: string;
  taxDetails: CartTaxDetails;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  shipping: number;
  shippingType: TenrxShippingType;
  externalPharmacy: boolean;
}
