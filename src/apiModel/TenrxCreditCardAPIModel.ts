/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxCreditCardAPIModel {
  cardId: string | null;
  paymentMethod: string | null;
  name: string;
  last4: string;
  brand: string;
  exp_month: string;
  exp_year: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry: string;
  paymentID: string | null;
}
