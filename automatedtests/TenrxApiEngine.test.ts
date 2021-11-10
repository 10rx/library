import { BUSINESS_TOKEN, TEST_API_BASE_URL } from './includes/TexrxCommonInclude';
import { TenrxApiEngine } from '../src/index';

const tenrx = new TenrxApiEngine(BUSINESS_TOKEN, TEST_API_BASE_URL);

test('GET Test Successful', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/Login/GetVisitTypes', { lol: 'lol' });
  expect(response.status).toBe(200);
});

test('GET Test Not Found', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/NONEXISTINGURL');
  expect(response.status).toBe(404);
});