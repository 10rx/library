import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxProductCatagory } from '../src/classes/TenrxProductCatagory';

Testlogger.setSettings({
  type: 'pretty',
})

test('Product Catagory Test Successful', async () => {
    const response = await TenrxProductCatagory.GetProductCatagory();
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });