export default interface TenrxRefillModel {
  id: number;
  orderNumber: string;
  productID: number;
  productName: string;
  productImage: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  refillsLeft: number;
  totalRefills: number;
  lastFill: string;
  prescribed: string;
}
