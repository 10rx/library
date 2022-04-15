/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxChargeAPIModel {
  userName: string;
  cardId: number;
  stripeToken: string;
  status: number;
  paymentCardDetails: {
    cardId: number | string;
    paymentMethod: string;
    name: string;
    addressCity: string;
    addressCountry: string;
    addressLine1: string;
    addressLine2: string;
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
}
