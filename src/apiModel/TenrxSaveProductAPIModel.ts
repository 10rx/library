export default interface TenrxSaveProductAPIModel {
  statusId?: number;
  paymentId: number;
  totalPrice: number;
  userName: string;
  visitTypeId?: number;
  medicationProducts: {
    productName: string;
    productDetails: string;
    quantity: number;
    price: number;
    productId: number;
    strength: string;
  }[];
  externalPharmacyAddress?: {
    apartmentNumber?: string;
    address1: string;
    address2?: string;
    city: string;
    stateName: string;
    zipCode: string;
    country: string;
    pharmacyName: string;
  };
}
