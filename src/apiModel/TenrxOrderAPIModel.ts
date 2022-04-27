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
  externalPharmacyAddress: any;
}
