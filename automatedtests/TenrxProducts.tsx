import { Testlogger } from './includes/TexrxCommonInclude.js';
import { TenrxVisitType, TenrxProductCategory } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
  minLevel: 'info',
});

test('Product End to End Successful', async () => {
  Testlogger.info('Getting all visit types:');
  const visitTypes = await TenrxVisitType.getVisitTypes();
  Testlogger.debug('Visit Types:', visitTypes);
  expect(visitTypes).not.toBeNull();
  expect(visitTypes!.length).toBeGreaterThan(0);
  if (visitTypes) {
    expect(visitTypes!.length).toBeGreaterThanOrEqual(0);
    for (const visitType of visitTypes) {
      await visitType.load();
      for (const productCategory of visitType.productCategories) {
          await productCategory.load();
      }
    }
  }
});
