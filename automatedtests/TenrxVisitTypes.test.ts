import { Testlogger } from './includes/TexrxCommonInclude';
import { TenrxVisitType } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

test('VisitTypes Test Successful', async () => {
    const response = await TenrxVisitType.GetVisitTypes();
    expect(response).not.toBeNull();
    expect(response!.length).toBeGreaterThan(0);
  });