import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxGenderCategory } from '../src/classes/TenrxGenderCategory.js';

Testlogger.setSettings({
  type: 'pretty',
});

test('Gender Category Test Successful', async () => {
  const response = await TenrxGenderCategory.getGenderCategory(3);
  expect(response).not.toBeNull();
  expect(response!.length).toBeGreaterThan(0);
});
