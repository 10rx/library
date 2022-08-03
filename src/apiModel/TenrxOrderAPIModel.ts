import TenrxOrderProductAPIModel from './TenrxOrderProductAPIModel.js';

export default interface TenrxOrderAPIModel {
  orderDate: string;
  totalPrice: number;
  shippingType: number;
  orderProducts: TenrxOrderProductAPIModel[];
  orderNumber: string;
  pharmacyType: number;
  orderStatusId: number;
  orderStatus: string;
  externalPharmacyAddress: {
    pharmacyName: string;
    apartmentNumber: string;
    address1: string;
    address2: string;
    city: string;
    stateName: string;
    zipCode: string;
    country: string;
  } | null;
}
