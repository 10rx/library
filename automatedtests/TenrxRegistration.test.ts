import { TEST_USERNAME_EXISTS, TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_SUCCESS, Testlogger } from './includes/TexrxCommonInclude';
import { checkIfEmailExists, saveSecurityQuestionAnswers } from '../src/index';

Testlogger.setSettings({
  type: 'pretty',
})

test('CheckIfEmailExists Test Success', async () => {
    const result = await checkIfEmailExists(TEST_USERNAME_EXISTS);
    expect(result).toBe(true);
});

test('CheckIfEmailExists Test Fail', async () => {
    const result = await checkIfEmailExists(TEST_USERNAME_NOT_EXISTS);
    expect(result).toBe(false);
});

test('SaveSecurityAnswers Test Success', async () => {
    const result = await saveSecurityQuestionAnswers(TEST_USERNAME_EXISTS, TEST_PASSWORD_SUCCESS, [
      {
        id: 0,
        questionID: 19,
        answer: 'Smith',
      },
      {
        id: 0,
        questionID: 20,
        answer: 'Darky',
      },
      {
        id: 0,
        questionID: 21,
        answer: 'Mark',
      }
    ]);
    expect(result).not.toBeNull();
    expect(result.status).toBe(200);
});