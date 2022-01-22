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
    for (const visitType of visitTypes) {
      Testlogger.info('Getting categories for Visit Type:', visitType.visitType);
      const products = await TenrxProductCategory.getProductCategory(visitType.id);
      expect(products).not.toBeNull();
      Testlogger.debug('Products Category:', products);
    }
  }
});
