import { getSampleFullCart, OFFER_FIFTEEN_PERCENT_OFF_COUPON_CODE, Testlogger } from './includes/TexrxCommonInclude';
import { TenrxProduct } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
});

test('Promotions Test Success', async () => {
  const sampleProduct = (await TenrxProduct.getProductByID(2290)) as TenrxProduct;
  const cart = getSampleFullCart(sampleProduct);
  const originalSubTotal = cart.subTotal;
  const apply = await cart.applyCouponCode(OFFER_FIFTEEN_PERCENT_OFF_COUPON_CODE);
  expect(apply).toBe(true);
  expect(cart.subTotal).toBe(originalSubTotal - (originalSubTotal * 0.15));
});
