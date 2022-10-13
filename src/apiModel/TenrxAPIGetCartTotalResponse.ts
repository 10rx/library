export default interface TenrxAPIGetCartTotalResponse {
  taxRate: number;
  taxPrice: number;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  couponApplied: boolean;
}
