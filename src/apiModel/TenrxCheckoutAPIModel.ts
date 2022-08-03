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
    addressLine2?: string;
    addressState: string;
    addressZip: string;
    brand: string;
    country: string;
    last4: string;
    exp_month: string;
    exp_year: string;
  };
  price: {
    price: number;
  }[];
  amount: number;
  totalTax: number;
  subtotal: number;
  shippingFees: number;
  patientProducts: {
    medicationProducts: {
      id: number;
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
      apartmentNumber?: string;
      address1: string;
      address2?: string;
      city: string;
      stateName: string;
      zipCode: string;
      country: string;
      pharmacyName: string;
    } | null;
    shippingAddress: {
      apartmentNumber?: string;
      address1: string;
      address2?: string;
      city: string;
      stateName: string;
      zipCode: string;
      country: string;
    };
  };
}
