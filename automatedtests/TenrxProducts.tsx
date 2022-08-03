import { Testlogger } from './includes/TexrxCommonInclude.js';
import { TenrxVisitType, TenrxProductCategory } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
  minLevel: 'warn',
});
jest.setTimeout(30000);
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
      if (visitType.productCategories) {
        for (const productCategory of visitType.productCategories) {
          await productCategory.load();
          Testlogger.debug('Product Category:', productCategory);
          if (productCategory.products.length > 0) {
            const product = productCategory.products[0];
            await product.load();
            Testlogger.debug('Product:', product);
            expect(product.name).not.toBeNull();
            expect(product.description).not.toBeNull();
          }
        }
      }
    }
  }
  jest.setTimeout(10000);
});
