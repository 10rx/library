import { TenrxLoginAPIModelData } from '../src/apiModel/TenrxLoginAPIModel';
import TenrxPatient from '../src/classes/TenrxPatient';
import TenrxUserAccount from '../src/classes/TenrxUserAccount';
import { authenticateTenrx, logoutTenrx, useTenrxPatient } from '../src/includes/TenrxFunctions';
import { Testlogger, TEST_PASSWORD_SUCCESS, TEST_USERNAME_EXISTS } from './includes/TexrxCommonInclude';

Testlogger.setSettings({
  type: 'pretty',
});

test('Patient Orders Test Successful', async () => {
  const loginData = await authenticateTenrx('456@xyz.com', 'Password1!');
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.orders.length).toBeGreaterThan(0);
      await logoutTenrx((success: boolean) => {
        expect(success).toBe(true);
      });
    }
  }
});

test('Patient Empty Orders Test Successful', async () => {
  const loginData = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
        const accountData = loginData.accountData as TenrxLoginAPIModelData;
        TenrxUserAccount.initialize(accountData);
        TenrxPatient.initialize(accountData.id);
        const patient = useTenrxPatient();
        await patient.load();
        expect(patient.orders.length).toBe(0);
        await logoutTenrx((success: boolean) => {
          expect(success).toBe(true);
        });
      }
  }
});

test('Patient Order Join Meeting Test Failure', async () => {
  const loginData = await authenticateTenrx('456@xyz.com', 'Password1!');
  if (loginData.status === 200) {
    if (loginData.patientData && loginData.accountData) {
      const accountData = loginData.accountData as TenrxLoginAPIModelData;
      TenrxUserAccount.initialize(accountData);
      TenrxPatient.initialize(accountData.id);
      const patient = useTenrxPatient();
      await patient.load();
      expect(patient.orders.length).toBeGreaterThan(0);
      const order = patient.orders[0];
      const meetingInformation = await order.joinMeeting();
      expect(meetingInformation.meetingSuccessful).toBe(false);
      expect(meetingInformation.meetingData).toBeNull();
      expect(meetingInformation.meetingMessageDetails).not.toBeNull();
      await logoutTenrx((success: boolean) => {
        expect(success).toBe(true);
      });
    }
  }
});