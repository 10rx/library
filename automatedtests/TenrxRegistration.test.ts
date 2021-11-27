import { TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, Testlogger } from './includes/TexrxCommonInclude';
import { CheckIfEmailExists } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

test('CheckIfEmailExists Test Success', async () => {
    const result = await CheckIfEmailExists(TEST_USERNAME_EXISTS);
    expect(result).toBe(true);
});

test('CheckIfEmailExists Test Fail', async () => {
    const result = await CheckIfEmailExists(TEST_USERNAME_NOT_EXISTS);
    expect(result).toBe(false);
});