import { BUSINESS_TOKEN, TEST_API_BASE_URL, TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, TEST_PASSWORD_HASHED_FAILED, Testlogger } from './includes/TexrxCommonInclude';
import { TenrxApiEngine, useTenrxApi } from '../src/index';
import TenrxLoginAPIModel from '../src/apiModel/TenrxLoginAPIModel';

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
  const response = await tenrx.getVisitTypes();
  expect(response).not.toBeNull();
  expect(response.content).not.toBeNull();
});

test('Singleton Test', async () => {
  const ApiEngine1 = TenrxApiEngine.instance;
  const ApiEngine2 = new TenrxApiEngine(BUSINESS_TOKEN, TEST_API_BASE_URL);
  expect(tenrx).not.toBeNull();
  expect(ApiEngine1).toBe(tenrx);
  expect(ApiEngine1).not.toBe(ApiEngine2);
});


test('Login API Test Failure', async () => {
  const result = await tenrx.login(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_HASHED_FAILED,'en');
  const content = result.content as TenrxLoginAPIModel;
  expect(content.statusCode).toBe(401);
  expect(content.access_token).toBeNull();
  expect(content.message).toBe('Invalid username or password.');
  expect(content.patientData).toBeNull();
  expect(content.data).toEqual({});
  expect(result.error).toBeNull();
  expect(tenrx.isAuthenticated).toBe(false);
});

test('Login API Test Security Question', async () => {
  const result = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS,'en', 'mu:st:fa:il:th:is');
  const content = result.content as TenrxLoginAPIModel;
  expect(content.statusCode).toBe(200);
  expect(content.access_token).toBeNull();
  expect(content.data).not.toBeNull();
  const data = content.data as any[];
  expect(data.length).toBeGreaterThan(0);
  expect(content.message).not.toBeNull();
  expect(content.message.length).toBeGreaterThan(0);
  expect(content.patientData).toBeNull();
  expect(result.error).toBeNull();
  expect(tenrx.isAuthenticated).toBe(false);
});

test('Login API Test Success', async () => {
  const result = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS,'en');
  const content = result.content as TenrxLoginAPIModel;
  expect(content.statusCode).toBe(200);
  expect(content.access_token).not.toBeNull();
  expect(content.access_token).not.toBe('');
  expect(content.data).not.toBeNull();
  expect(content.data).not.toEqual({});
  const data = content.data as any;
  expect(data.id).not.toBeNull();
  expect(data.id).not.toBe(0);
  expect(data.userName).toBe(TEST_USERNAME_EXISTS);
  expect(content.patientData).not.toBeNull();
  expect(result.error).toBeNull();
  expect(tenrx.isAuthenticated).toBe(true);
});

test('ProductCategory Test', async () => {
  const response = await tenrx.getProductCategory(1);
  expect(response).not.toBeNull();
});

test('Gender Category Test', async () => {
  const response = await tenrx.GetGenderCategory();
  expect(response).not.toBeNull();
});

test('Auth GET Test Successful', async () => {
  const logindata = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS,'en');
  Testlogger.info(logindata);
  expect(tenrx.isAuthenticated).toBe(true);
  if (tenrx.isAuthenticated) {
    const content = logindata.content as TenrxLoginAPIModel;
    const data = content.data as any;
    const response = await tenrx.authGet(TEST_API_BASE_URL + '/api/Notification/GetAppSettings', { 'patientId': data.id });
    Testlogger.info(response);
    expect(response.status).toBe(200);
  }
});