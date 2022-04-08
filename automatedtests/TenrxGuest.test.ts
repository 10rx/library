import { TenrxLoginAPIModelData } from '../src/apiModel/TenrxLoginAPIModel';
import TenrxPatient from '../src/classes/TenrxPatient';
import TenrxUserAccount from '../src/classes/TenrxUserAccount';
import { authenticateTenrx, logoutTenrx, registerGuest, useTenrxPatient } from '../src/includes/TenrxFunctions';
import { Testlogger, TEST_PASSWORD_SUCCESS, TEST_USERNAME_EXISTS } from './includes/TexrxCommonInclude';
import { TenrxEnumState } from '../src/includes/TenrxEnums';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('Guest Test Successful', async () => {
  const loginData = await registerGuest({
    email: 'lol@yopmail.com',
    firstName: 'Guest',
    lastName: 'Lastname',
    middleName: 'lol',
    phoneNumber: '9541231234',
    address1: '132 Main St',
    address2: '',
    city: 'Fort Lauderdale',
    stateId: TenrxEnumState.Florida,
    zip: '33309',
  });

  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize();
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
  /*await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });*/
});
