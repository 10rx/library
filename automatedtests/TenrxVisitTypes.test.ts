import { Testlogger } from './includes/TexrxCommonInclude.js';
import { TenrxVisitType } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('VisitTypes Test Successful', async () => {
  const response = await TenrxVisitType.getVisitTypes();
  expect(response).not.toBeNull();
  expect(response!.length).toBeGreaterThan(0);
});

test('VisitType by Id 1 Test Successful', async () => {
  const response = await TenrxVisitType.getVisitTypeById(1);
  expect(response).not.toBeNull();
  expect(response!.id).toBe(1);
});
