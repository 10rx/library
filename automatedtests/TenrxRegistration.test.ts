import {
  TEST_USERNAME_EXISTS,
  TEST_USERNAME_NOT_EXISTS,
  TEST_PASSWORD_SUCCESS,
  Testlogger,
  MakeRandomString,
} from './includes/TexrxCommonInclude.js';
import {
  checkIfEmailExists,
  saveSecurityQuestionAnswers,
  registerUser,
  TenrxRegistrationFormData,
  TenrxEnumGender,
  TenrxEnumState,
  TenrxEnumCountry,
  TenrxGuestRegistrationFormData,
} from '../src/index.js';
import { registerGuest } from '../src/includes/TenrxFunctions.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(120000);

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
    },
  ]);
  expect(result).not.toBeNull();
  expect(result.status).toBe(200);
});

test('Registration Test Success', async () => {
  jest.setTimeout(60000);
  const accountName = 'unittest_' + MakeRandomString(12) + '@yopmail.com';
  const password = TEST_PASSWORD_SUCCESS;
  const dob: Date = new Date(new Date().getFullYear() - 18, 0, 1);
  const registrationInfo: TenrxRegistrationFormData = {
    email: accountName,
    password: password,
    firstName: 'Unit',
    lastName: 'Test',
    middleName: 'Registration',
    gender: TenrxEnumGender.Other,
    dob: dob,
    phoneNumber: '9548675309',
    address1: '123 Main St',
    address2: '',
    city: 'Fort Lauderdale',
    stateId: TenrxEnumState.Florida,
    zip: '33309',
    countryId: TenrxEnumCountry.US,
    photoBase64: '',
  };
  const result = await registerUser(registrationInfo);
  expect(result).not.toBeNull();
  expect(result.error).toBeNull();
  expect(result.status).toBe(200);
  expect(result.accountData).not.toBeNull();
});

test('Guest Registration Test Success', async () => {
  jest.setTimeout(60000);
  const accountName = 'unittest_' + MakeRandomString(12) + '@yopmail.com';
  const registrationInfo: TenrxGuestRegistrationFormData = {
    email: accountName,
    firstName: 'Unit',
    lastName: 'Test',
    middleName: 'Registration',
    phoneNumber: '954-867-5309',
    address1: '123 Main St',
    address2: '',
    city: 'City',
    stateId: TenrxEnumState.Florida,
    zip: '33309',
  };
  const result = await registerGuest(registrationInfo);
  expect(result).not.toBeNull();
  expect(result.error).toBeNull();
  expect(result.status).toBe(200);
});
