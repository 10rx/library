import { tenrxApiEngine } from '../src/index';
test('POSITIVE GET Test', async () => {
  expect(await tenrxApiEngine.get('https://10rxapi.csscloudservices.com/Login/GetVisitTypes')).toBe('changeme');
});