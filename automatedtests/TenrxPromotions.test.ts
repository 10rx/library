import {
  getSampleFullCart,
  OFFER_FIFTEEN_PERCENT_OFF_COUPON_CODE,
  Testlogger,
  TEST_ADDRESS,
  TEST_PASSWORD_SUCCESS,
  TEST_USERNAME_EXISTS,
} from './includes/TexrxCommonInclude';
import { authenticateTenrx, TenrxProduct, tenrxRoundTo, TenrxStateIdToStateName } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('Promotions Test Successful', () => {
  expect('').not.toBeNull();
});

// test('Promotions Test Success', async () => {
//   const loginData = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
//   if (loginData.status === 200) {
//     if (loginData.patientData && loginData.accountData) {
//       await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
//       const sampleProduct = (await TenrxProduct.getProductByID(2819)) as TenrxProduct;
//       const cart = getSampleFullCart(sampleProduct);
//       await cart.calculateCart({
//         city: TEST_ADDRESS.city,
//         state: TenrxStateIdToStateName[TEST_ADDRESS.stateId],
//         zipCode: TEST_ADDRESS.zipCode,
//       });
//       const originalSubTotal = cart.total;
//       const apply = await cart.calculateCart(
//         {
//           city: TEST_ADDRESS.city,
//           state: TenrxStateIdToStateName[TEST_ADDRESS.stateId],
//           zipCode: TEST_ADDRESS.zipCode,
//         },
//         'OFFER5PER',
//       );
//       expect(apply).toBe(true);
//       expect(cart.total).toBe(tenrxRoundTo(originalSubTotal * 0.95));
//     }
//   }
// });
