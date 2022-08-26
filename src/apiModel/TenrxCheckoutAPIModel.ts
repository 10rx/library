/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxCheckoutAPIModel {
  userName: string;
  cardId: number;
  stripeToken: string;
  status: number;
  shippingType: number;
  pharmacyType: number;
  couponCode: string | null;
  orderId: number;
  paymentCardDetails: {
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
    country: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  price: {
    price: number;
  }[];
  amount: number;
  totalTax: number;
  taxPrice: number;
  subtotal: number;
  shippingFees: number;
  patientProducts: {
    medicationProducts: {
      productName: string;
      productDetails: string;
      quantity: number;
      price: number;
      productId: number;
      strength: string;
    }[];
    totalPrice: number;
    visitTypeId: number;
    userName: string;
    couponCode: string | null;
    externalPharmacyAddress: {
      apartmentNumber: string | null;
      address1: string;
      address2: string | null;
      city: string;
      stateName: string;
      zipCode: string;
      country: string;
      pharmacyName: string;
    } | null;
  };
  orderShippingAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    countryID: number;
    phoneNumber: string | null;
  };
}
