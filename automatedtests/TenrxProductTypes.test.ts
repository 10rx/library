import { Testlogger } from './includes/TexrxCommonInclude.js';
import TenrxProductCategory from '../src/classes/TenrxProductCategory.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('Product Categories Test Successful', async () => {
  const response = await TenrxProductCategory.getProductCategories(1);
  expect(response).not.toBeNull();
  expect(response!.length).toBeGreaterThan(0);
});
