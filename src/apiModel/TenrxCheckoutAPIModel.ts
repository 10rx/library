/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxCheckoutAPIModel {
  userName: string;
  cardId: number;
  stripeToken: string;
  paymentCardDetails: PaymentCardDetails;
  status: number;
  shippingType: number;
  pharmacyType: number;
  couponCode: string | null;
  orderId: number;
  shippingFees: number;
  patientProducts: PatientProduct[];
  orderShippingAddress: OrderShippingAddress;
  externalPharmacyAddress: ExternalPharmacyAddress | null;
}

interface ExternalPharmacyAddress {
  apartmentNumber: string | null;
  address1: string;
  address2: string | null;
  city: string;
  stateName: string;
  zipCode: string;
  country: string;
  pharmacyName: string;
}

interface OrderShippingAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  countryID: number;
  phoneNumber: string;
}

interface PatientProduct {
  productId: number;
  quantity: number;
  strength: string;
}

interface PaymentCardDetails {
  cardId: string;
  paymentMethod: string;
  name: string;
  addressCity: string;
  addressCountry: string;
  addressLine1: string;
  addressLine2: string | null;
  addressState: string;
  addressZip: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}
