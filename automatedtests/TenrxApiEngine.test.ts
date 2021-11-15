import { BUSINESS_TOKEN, TEST_API_BASE_URL, Testlogger } from './includes/TexrxCommonInclude';
import { TenrxApiEngine, useTenrxApi } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

const tenrx = useTenrxApi();

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