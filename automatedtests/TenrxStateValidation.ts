import { getStatesValidForTenrx } from '../src/includes/TenrxFunctions';
import { Testlogger } from './includes/TexrxCommonInclude';

Testlogger.setSettings({
  type: 'pretty',
});

test('State Validation Test Successful', async () => {
  const validStatesForRx = await getStatesValidForTenrx();
  expect(validStatesForRx).not.toBeNull();
  if (validStatesForRx) {
    expect(validStatesForRx.length).toBeGreaterThan(0);
  }
});
