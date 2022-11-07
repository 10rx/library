import {
  BUSINESS_TOKEN,
  TEST_API_BASE_URL,
  TEST_USERNAME_EXISTS,
  TEST_USERNAME_NOT_EXISTS,
  TEST_PASSWORD_HASHED_SUCCESS,
  TEST_PASSWORD_HASHED_FAILED,
  Testlogger,
  OFFER_FIFTEEN_PERCENT_OFF_COUPON_CODE,
  OFFER_WRONG_COUPON_CODE,
  PROMOTION_URL,
} from './includes/TexrxCommonInclude.js';
import { TenrxApiEngine, useTenrxApi } from '../src/index.js';
import TenrxLoginAPIModel from '../src/apiModel/TenrxLoginAPIModel.js';
import TenrxQuestionAPIModel from '../src/apiModel/TenrxQuestionAPIModel.js';

Testlogger.setSettings({
  type: 'pretty',
});

const tenrx = useTenrxApi();

jest.setTimeout(30000);

test('GET Test Successful', async () => {
  const response = await tenrx.get(TEST_API_BASE_URL + '/Login/GetVisitTypes');
  expect(response.status).toBe(200);
});

test('GET Test Not Found', async () => {
  expect(tenrx).not.toBeNull();
  const response = await tenrx.get(TEST_API_BASE_URL + '/NONEXISTINGURL');
  expect(response.status).toBe(404);
});

test('GetVisitTypes Test Successful', async () => {
  const response = await tenrx.getVisitTypes();
  expect(response).not.toBeNull();
  expect(response.content).not.toBeNull();
});

test('Singleton Test', async () => {
  const ApiEngine1 = TenrxApiEngine.instance;
  const ApiEngine2 = new TenrxApiEngine(BUSINESS_TOKEN, TEST_API_BASE_URL, PROMOTION_URL);
  expect(tenrx).not.toBeNull();
  expect(ApiEngine1).toBe(tenrx);
  expect(ApiEngine1).not.toBe(ApiEngine2);
});

test('Login API Test Failure', async () => {
  const result = await tenrx.login(TEST_USERNAME_NOT_EXISTS, TEST_PASSWORD_HASHED_FAILED, 'en');
  const content = result.content as TenrxLoginAPIModel;
  expect(content.statusCode).toBe(401);
  expect(content.access_token).toBeNull();
  expect(content.message).toBe('Invalid username or password.');
  expect(content.patientData).toBeNull();
  expect(content.data).toEqual({});
  expect(result.error).toBeNull();
  expect(tenrx.isAuthenticated).toBe(false);
});

// TODO: Reenable test when security questions are ready
// test('Login API Test Security Question', async () => {
//   const result = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, 'en', 'mu:st:fa:il:th:iz');
//   const content = result.content as TenrxLoginAPIModel;
//   expect(content.statusCode).toBe(200);
//   expect(content.access_token).toBeNull();
//   expect(content.data).not.toBeNull();
//   const data = content.data as TenrxQuestionAPIModel[];
//   expect(data.length).toBeGreaterThan(0);
//   expect(content.message).not.toBeNull();
//   expect(content.message.length).toBeGreaterThan(0);
//   expect(content.patientData).toBeNull();
//   expect(result.error).toBeNull();
//   expect(tenrx.isAuthenticated).toBe(false);
// });

test('Login API Test Success', async () => {
  const result = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, 'en');
  const content = result.content as TenrxLoginAPIModel;
  expect(content.statusCode).toBe(200);
  expect(content.access_token).not.toBeNull();
  expect(content.access_token).not.toBe('');
  expect(content.data).not.toBeNull();
  expect(content.data).not.toEqual({});
  const data = content.data as any;
  expect(data.id).not.toBeNull();
  expect(data.id).not.toBe(0);
  expect(data.emailId).toBe(TEST_USERNAME_EXISTS);
  expect(content.patientData).not.toBeNull();
  expect(result.error).toBeNull();
  expect(tenrx.isAuthenticated).toBe(true);
});

test('ProductCategories Test', async () => {
  const response = await tenrx.getProductCategories(1);
  expect(response).not.toBeNull();
});

test('Gender Category Test', async () => {
  const response = await tenrx.getGenderCategories(3);
  expect(response).not.toBeNull();
});

test('Auth GET Test Successful', async () => {
  const logindata = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, 'en');
  Testlogger.info(logindata);
  expect(tenrx.isAuthenticated).toBe(true);
  if (tenrx.isAuthenticated) {
    const content = logindata.content as TenrxLoginAPIModel;
    const data = content.data as any;
    const response = await tenrx.authGet(TEST_API_BASE_URL + '/api/Notification/GetAppSettings', {
      patientId: '123',
    });
    Testlogger.info(response);
    expect(response.status).toBe(200);
  }
});

test('saveUserSecurityQuestion Test Success', async () => {
  const result = await tenrx.saveSecurityQuestionAnswers({
    username: TEST_USERNAME_EXISTS,
    password: TEST_PASSWORD_HASHED_SUCCESS,
    macaddress: 'mu:st:fa:il:th:is',
    securityQuestionList: [
      {
        id: 0,
        questionID: 19,
        answer: 'Test',
      },
    ],
  });
  expect(result).not.toBeNull();
  const content = result.content as any;
  expect(content.statusCode).toBe(200);
});

test('saveUserSecurityQuestion Test Fail', async () => {
  const result = await tenrx.saveSecurityQuestionAnswers({
    username: TEST_USERNAME_EXISTS,
    password: TEST_PASSWORD_HASHED_SUCCESS,
    macaddress: 'mu:st:fa:il:th:is',
    securityQuestionList: [
      {
        id: 0,
        questionID: 1,
        answer: 'Test',
      },
    ],
  });
  expect(result).not.toBeNull();
  const content = result.content as any;
  expect(content.statusCode).toBe(401);
});

//Need to expand this test. Right now it is not checking if call was successful.
test('RegisterUser Test Success', async () => {
  const result = await tenrx.registerUser({
    id: 0,
    firstName: '',
    lastName: '',
    middleName: '',
    dob: '',
    age: 0,
    gender: 0,
    password: '',
    ssn: '',
    mrn: '',
    status: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    countryId: 0,
    stateId: 0,
    zip: '',
    userName: '',
    phoneNumber: '',
    photoBase64: '',
    isContactMethodCall: false,
    isContactMethodVideo: false,
    isContactMethodText: false,
    photoPath: '',
    photoThumbnailPath: '',
    extensionId: 0,
    visitTypesId: 0,
    userId: 0,
    customerId: '',
    isFaceImage: false,
  });
  expect(result).not.toBeNull();
});

test('GetQuestionList Test Success', async () => {
  const result = await tenrx.getQuestionList([{ visitTypeId: 1 }]);
  expect(result).not.toBeNull();
});

test('RefreshToken Test successful', async () => {
  const originalToken = await tenrx.login(TEST_USERNAME_EXISTS, TEST_PASSWORD_HASHED_SUCCESS, 'en');
  Testlogger.info(originalToken);
  expect(tenrx.isAuthenticated).toBe(true);
  if (tenrx.isAuthenticated) {
    const refreshToken = await tenrx.refreshToken();
    Testlogger.info(refreshToken);
    expect(refreshToken).not.toBeNull();
    const originalContent = originalToken.content as { access_token: string };
    const refreshContent = refreshToken.content as { access_token: string };
    expect(originalContent.access_token).not.toBe(refreshContent.access_token);
  }
});

test('GetCouponCode Test successful', async () => {
  const result = await tenrx.getPromotionInformation(OFFER_FIFTEEN_PERCENT_OFF_COUPON_CODE);
  Testlogger.info(result);
  expect(result).not.toBeNull();
  expect(result.content).not.toBeNull();
  const content = result.content as {
    data: { promotionName: string; discountAmount: number; discountPercent: number };
  };
  expect(content.data.promotionName).toBe('15% off Order');
  expect(content.data.discountAmount).toBe(0);
  expect(content.data.discountPercent).toBe(15);
});

test('GetCouponCode Test failure', async () => {
  const result = await tenrx.getPromotionInformation(OFFER_WRONG_COUPON_CODE);
  expect(result).not.toBeNull();
});
