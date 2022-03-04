import {
  getSampleFullCart,
  Testlogger,
  TEST_ADDRESS,
  TEST_PASSWORD_SUCCESS,
  TEST_USERNAME_EXISTS,
} from './includes/TexrxCommonInclude.js';
import { authenticateTenrx, TenrxProduct } from '../src/index.js';
import TenrxUserAccount from '../src/classes/TenrxUserAccount.js';
import { TenrxLoginAPIModelData } from '../src/apiModel/TenrxLoginAPIModel.js';
import TenrxPatient from '../src/classes/TenrxPatient.js';
import { logoutTenrx, useTenrxPatient } from '../src/includes/TenrxFunctions.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('GetPaymentCards Test Successful', async () => {
  const loginData = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id, loginData.patientData);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.wallet).not.toBeNull();
      expect(patient.wallet.cards.length).toBeGreaterThan(0);
    }
  }
  await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });
});

test('PlaceOrder Test Successful', async () => {
  const sampleProduct = (await TenrxProduct.getProductByID(2290)) as TenrxProduct;
  const cart = getSampleFullCart(sampleProduct);
  await cart.getTaxInformation(TEST_ADDRESS);
  const loginData = await authenticateTenrx('456@xyz.com', 'Password1!');
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id, loginData.patientData);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.wallet).not.toBeNull();
      expect(patient.wallet.cards.length).toBeGreaterThan(0);
      const checkoutResponse = await cart.checkout(accountData.userName, patient.wallet.cards[0], TEST_ADDRESS);
      expect(checkoutResponse).not.toBeNull();
      expect(checkoutResponse.checkoutSuccessful).toBe(true);
    }
  }
  await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });
});

test('PlaceOrder Test Failure', async () => {
  const sampleProduct = (await TenrxProduct.getProductByID(2290)) as TenrxProduct;
  const cart = getSampleFullCart(sampleProduct);
  await cart.getTaxInformation(TEST_ADDRESS);
  const loginData = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id, loginData.patientData);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.wallet).not.toBeNull();
      expect(patient.wallet.cards.length).toBeGreaterThan(0);
      const checkoutResponse = await cart.checkout(accountData.userName, patient.wallet.cards[0], TEST_ADDRESS);
      expect(checkoutResponse).not.toBeNull();
      expect(checkoutResponse.checkoutSuccessful).toBe(false);
    }
  }
  await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });
});
