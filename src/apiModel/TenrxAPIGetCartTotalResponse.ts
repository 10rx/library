export default interface TenrxAPIGetCartTotalResponse {
  taxRate: number;
  taxPrice: number;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  couponDetails: CouponDetails;
}

interface CouponDetails {
  amount: number;
  percent: number;
  applied: boolean;
}
