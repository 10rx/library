import { BUSINESS_TOKEN, TEST_API_BASE_URL, TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, TEST_PASSWORD_HASHED_FAILED, Testlogger } from './includes/TexrxCommonInclude';
import { TenrxApiEngine, useTenrxApi } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

const tenrx = useTenrxApi();

jest.setTimeout(30000);

test('GET Test Successful', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/Login/GetVisitTypes');
  expect(response.status).toBe(200);
});

test('GET Test Not Found', async () => {
  expect(tenrx).not.toBeNull();
  const response = await tenrx.get(TEST_API_BASE_URL + '/NONEXISTINGURL');
  expect(response.status).toBe(404);
});

test('GetVisitTypes Test Successful', async () => {
  const response = await tenrx.GetVisitTypes();
  expect(response).not.toBeNull();
  expect(response!.length).toBeGreaterThan(0);
});

test('Singleton Test', async () => {
  const ApiEngine1 = TenrxApiEngine.Instance;
  const ApiEngine2 = new TenrxApiEngine(BUSINESS_TOKEN, TEST_API_BASE_URL);
  expect(tenrx).not.toBeNull();
  expect(ApiEngine1).toBe(tenrx);
  expect(ApiEngine1).not.toBe(ApiEngine2);
});


test('Login API Test Failure', async () => {
  const result = await tenrx.Login(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_HASHED_FAILED,'en');
  expect(result.content.statusCode).toBe(401);
  expect(result.content.access_token).toBeNull();
  expect(result.content.message).toBe('Invalid username or password.');
  expect(result.content.patientData).toBeNull();
  expect(result.content.data).toEqual({});
  expect(result.error).toBeNull();
});

test('Login API Test Security Question', async () => {
  const result = await tenrx.Login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS,'en', 'mu:st:fa:il:th:is');
  expect(result.content.statusCode).toBe(200);
  expect(result.content.access_token).toBeNull();
  expect(result.content.data).not.toBeNull();
  expect(result.content.data.length).toBeGreaterThan(0);
  expect(result.content.message).not.toBeNull();
  expect(result.content.message.length).toBeGreaterThan(0);
  expect(result.content.patientData).toBeNull();
  expect(result.error).toBeNull();
});

test('Login API Test Success', async () => {
  const result = await tenrx.Login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS,'en');
  expect(result.content.statusCode).toBe(200);
  expect(result.content.access_token).not.toBeNull();
  expect(result.content.access_token).not.toBe('');
  expect(result.content.data).not.toBeNull();
  expect(result.content.data).not.toEqual({});
  expect(result.content.data.id).not.toBeNull();
  expect(result.content.data.id).not.toBe(0);
  expect(result.content.data.userName).toBe(TEST_USERNAME_EXISTS);
  expect(result.content.patientData).not.toBeNull();
  expect(result.error).toBeNull();
});
