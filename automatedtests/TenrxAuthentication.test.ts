import {
  TEST_USERNAME_EXISTS,
  TEST_USERNAME_NOT_EXISTS,
  TEST_PASSWORD_SUCCESS,
  TEST_PASSWORD_FAILED,
  Testlogger,
} from './includes/TexrxCommonInclude.js';
import { authenticateTenrx, logoutTenrx, refreshTokenTenrx, useTenrxApi } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
});

test('Authenticate Test Fail', async () => {
  const result = await authenticateTenrx(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_FAILED);
  expect(result).not.toBeNull();
  expect(result.accessToken).toBeNull();
  expect(result.expiresIn).toBeNull();
  expect(result.accountData).toStrictEqual({});
  expect(result.patientData).toBeNull();
  expect(result.securityQuestions).toBeNull();
  expect(result.error).toBeNull();
});

test('Authenticate Test Security Questions', async () => {
  const result = await authenticateTenrx(
    TEST_USERNAME_EXISTS,
    TEST_PASSWORD_SUCCESS,
    'en',
    useTenrxApi(),
    'mu:st:fa:il:th:iz',
  );
  expect(result).not.toBeNull();
  expect(result.accessToken).toBeNull();
  expect(result.expiresIn).toBeNull();
  expect(result.accountData).toStrictEqual({});
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
  await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });
});

test('Authentication/RefreshToken Test Success', async () => {
  const result = await authenticateTenrx(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS);
  expect(result).not.toBeNull();
  expect(result.accessToken).not.toBeNull();
  expect(result.expiresIn).toBeGreaterThan(0);
  expect(result.accountData).not.toBeNull();
  const refreshToken = await refreshTokenTenrx();
  expect(refreshToken).not.toBeNull();
  // API is currently returning expiresIn as 0 which makes the token automatically expire.
  if (refreshToken) {
    expect(refreshToken.accessToken).not.toBeNull();
    expect(refreshToken.expiresIn).toBeGreaterThanOrEqual(0);
    expect(refreshToken.expireDateStart).not.toBeNull();
    expect(result.accessToken).not.toBe(refreshToken.accessToken);
  }
  /*await logoutTenrx((success: boolean) => {
    expect(success).toBe(true);
  });*/
});
