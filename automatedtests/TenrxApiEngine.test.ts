import { BUSINESS_TOKEN, TEST_API_BASE_URL, Testlogger } from './includes/TexrxCommonInclude';
import { TenrxApiEngine } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

const tenrx = new TenrxApiEngine(BUSINESS_TOKEN, TEST_API_BASE_URL);

test('GET Test Successful', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/Login/GetVisitTypes');
  expect(response.status).toBe(200);
});

test('GET Test Not Found', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/NONEXISTINGURL');
  expect(response.status).toBe(404);
});

test('GetVisitTypes Test Successful', async () => {
  const response = await tenrx.GetVisitTypes();
  expect(response).not.toBeNull();
  expect(response!.length).toBeGreaterThan(0);
});