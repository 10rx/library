import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxProductCategory } from '../src/classes/TenrxProductCategory.js';

Testlogger.setSettings({
  type: 'pretty',
})

test('Product Category Test Successful', async () => {
    const response = await TenrxProductCategory.getProductCategory(1);
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });