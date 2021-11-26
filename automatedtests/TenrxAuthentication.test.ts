import { TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_SUCCESS, TEST_PASSWORD_FAILED, Testlogger } from './includes/TexrxCommonInclude';
import { AuthenticateTenrx, LogoutTenrx, useTenrxApi } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

test('Authenticate Test Fail', async () => {
    const result = await AuthenticateTenrx(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_FAILED);
    Testlogger.info(result);
    expect(result).not.toBeNull();
    expect(result.access_token).toBeNull();
    expect(result.expires_in).toBeNull();
    expect(result.accountdata).toBeNull();
    expect(result.patientdata).toBeNull();
    expect(result.security_questions).toBeNull();
    expect(result.error).toBeNull();
});

test('Authenticate Test Security Questions', async () => {
    const result = await AuthenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS, 'en', useTenrxApi(), 'mu:st:fa:il:th:is');
    expect(result).not.toBeNull();
    expect(result.access_token).toBeNull();
    expect(result.expires_in).toBeNull();
    expect(result.accountdata).toBeNull();
    expect(result.patientdata).toBeNull();
    if (result.security_questions) {
        expect(result.security_questions).not.toBeNull();
        expect(result.security_questions.length).toBeGreaterThan(0);
        expect(result.security_questions[0].question.length).toBeGreaterThan(0);
    }
    expect(result.error).toBeNull();
});

test('Authenticate/Logout Test Success', async () => {
    const result = await AuthenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
    expect(result).not.toBeNull();
    expect(result.access_token).not.toBeNull();
    expect(result.expires_in).toBeGreaterThan(0);
    expect(result.accountdata).not.toBeNull();
    expect(result.accountdata.id).toBeGreaterThan(0);
    expect(result.accountdata.userName).toBe(TEST_USERNAME_EXISTS);
    expect(result.patientdata).not.toBeNull();
    expect(result.patientdata.emailAddress).toBe(TEST_USERNAME_EXISTS);
    expect(result.security_questions).toBeNull();
    expect(result.error).toBeNull();
    const result2 = await LogoutTenrx();
    expect(result2).not.toBeNull();
    expect(result2.status).toBe(200);
});
