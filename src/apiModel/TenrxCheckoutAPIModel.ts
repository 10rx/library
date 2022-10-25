/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxCheckoutAPIModel {
  paymentNonce: string | null;
  userName: string;
  status: number;
  shippingType: number;
  pharmacyType: number;
  couponCode: string | null;
  shippingFees: number;
  cardDetails: CardDetails;
  shippingAddress: ShippingAddress;
  products: Product[];
  otherPharmacyAddress: OtherPharmacyAddress | null;
  images: string[];
}

interface OtherPharmacyAddress {
  pharmacyName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Product {
  productId: number;
  quantity: number;
  strength: string;
  refillID: number | null;
}

interface ShippingAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  countryID: number;
  phoneNumber: string;
}

interface CardDetails {
  name: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  paymentID: string | null;
  billingAddress: BillingAddress;
}

interface BillingAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
