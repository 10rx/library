import { TenrxLoginAPIModelData } from '../src/apiModel/TenrxLoginAPIModel';
import TenrxPatient from '../src/classes/TenrxPatient';
import TenrxUserAccount from '../src/classes/TenrxUserAccount';
import { authenticateTenrx, logoutTenrx, useTenrxPatient } from '../src/includes/TenrxFunctions';
import { Testlogger, TEST_PASSWORD_SUCCESS, TEST_USERNAME_EXISTS } from './includes/TexrxCommonInclude';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('Patient Test Successful', async () => {
  const loginData = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.wallet).not.toBeNull();
      expect(patient.wallet.cards.length).toBeGreaterThan(0);
      expect(patient.firstName).toBe(loginData.patientData.firstName);
      expect(patient.lastName).toBe(loginData.patientData.lastName);
      expect(patient.emailAddress).toBe(loginData.patientData.emailId);
      // TODO we need to do more field validations between patient and loginData.patientData
    }
  }
  await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });
});
