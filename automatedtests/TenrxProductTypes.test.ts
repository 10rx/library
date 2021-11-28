import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxProductCategory } from '../src/classes/TenrxProductCategory';

Testlogger.setSettings({
  type: 'pretty',
})

test('Product Category Test Successful', async () => {
    const response = await TenrxProductCategory.GetProductCategory();
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });