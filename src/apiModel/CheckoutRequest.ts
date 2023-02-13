/* eslint-disable @typescript-eslint/naming-convention */
import { CardType, TenrxPharmacyType, TenrxShippingType } from '../index.js';
import TenrxSubscriptionInfo from '../types/TenrxSubscriptionInfo.js';

export default interface CheckoutRequest {
  paymentNonce: string | null;
  shippingType: TenrxShippingType;
  pharmacyType: TenrxPharmacyType;
  couponCode: string | null;
  shippingFees: number;
  cardDetails: CardDetails;
  shippingAddress: ShippingAddress;
  products: Product[];
  otherPharmacyAddress: OtherPharmacyAddress | null;
  subscriptionInfo: TenrxSubscriptionInfo | null;
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
  strength: string | null;
  refillID: number | null;
  answers: Answer[];
  images: string[];
}

interface Answer {
  questionID: number;
  questionnaireID: number;
  answer: string;
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
  type: CardType;
  code?: string;
  firstName?: string;
  lastName?: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  paymentID?: string | null;
  billingAddress?: BillingAddress;
}

interface BillingAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
