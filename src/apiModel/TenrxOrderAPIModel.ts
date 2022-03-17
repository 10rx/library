import TenrxOrderProductAPIModel from './TenrxOrderProductAPIModel.js';

export default interface TenrxOrderAPIModel {
  order: string;
  orderDate: string;
  totalPrice: number;
  shippingType: number;
  orderProducts: TenrxOrderProductAPIModel[];
}
