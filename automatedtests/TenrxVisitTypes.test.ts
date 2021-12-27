import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxVisitType } from '../dist/commonjs/index.js';

Testlogger.setSettings({
  type: 'pretty',
})

test('VisitTypes Test Successful', async () => {
    const response = await TenrxVisitType.getVisitTypes();
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });