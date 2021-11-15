import { BUSINESS_TOKEN, TEST_API_BASE_URL, Testlogger } from './includes/TexrxCommonInclude';
import { useTenrxApi, InitializeTenrx } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

InitializeTenrx(BUSINESS_TOKEN, TEST_API_BASE_URL);
const tenrx = useTenrxApi();

test('VisitTypes Test Successful', async () => {
    const response = await tenrx.GetVisitTypes();
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });