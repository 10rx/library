import { TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_SUCCESS, TEST_PASSWORD_FAILED, Testlogger } from './includes/TexrxCommonInclude';
import { authenticateTenrx, logoutTenrx, useTenrxApi } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

test('Authenticate Test Fail', async () => {
    const result = await authenticateTenrx(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_FAILED);
    expect(result).not.toBeNull();
    expect(result.accessToken).toBeNull();
    expect(result.expiresIn).toBeNull();
    expect(result.accountData).toBeNull();
    expect(result.patientData).toBeNull();
    expect(result.securityQuestions).toBeNull();
    expect(result.error).toBeNull();
});

test('Authenticate Test Security Questions', async () => {
    const result = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS, 'en', useTenrxApi(), 'mu:st:fa:il:th:is');
    expect(result).not.toBeNull();
    expect(result.accessToken).toBeNull();
    expect(result.expiresIn).toBeNull();
    expect(result.accountData).toBeNull();
    expect(result.patientData).toBeNull();
    if (result.securityQuestions) {
        expect(result.securityQuestions).not.toBeNull();
        expect(result.securityQuestions.length).toBeGreaterThan(0);
        expect(result.securityQuestions[0].question.length).toBeGreaterThan(0);
    }
    expect(result.error).toBeNull();
});

test('Authenticate/Logout Test Success', async () => {
    const result = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
    expect(result).not.toBeNull();
    expect(result.accessToken).not.toBeNull();
    expect(result.expiresIn).toBeGreaterThan(0);
    expect(result.accountData).not.toBeNull();
    const accountData = result.accountData as any;
    expect(accountData.id).toBeGreaterThan(0);
    expect(accountData.userName).toBe(TEST_USERNAME_EXISTS);
    expect(result.patientData).not.toBeNull();
    const patientData = result.patientData as any;
    expect(patientData.emailAddress).toBe(TEST_USERNAME_EXISTS);
    expect(result.securityQuestions).toBeNull();
    expect(result.error).toBeNull();
    const result2 = await logoutTenrx();
    expect(result2).not.toBeNull();
    expect(result2.status).toBe(200);
});
