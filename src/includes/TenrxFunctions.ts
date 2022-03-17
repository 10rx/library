import bcryptjs from 'bcryptjs';
import isaac from 'isaac';
import { DateTime } from 'luxon';
import { ISettingsParam } from 'tslog';

import { TenrxLibraryLogger } from './TenrxLogging.js';

import TenrxApiEngine from '../classes/TenrxApiEngine.js';
import TenrxLogger from '../classes/TenrxLogger.js';

import TenrxLoginResponseData from '../types/TenrxLoginResponseData.js';
import TenrxLoginSecurityQuestion from '../types/TenrxLoginSecurityQuestion.js';
import TenrxLoginSecurityQuestionAnswer from '../types/TenrxLoginSecurityQuestionAnswer.js';
import TenrxRegistrationFormData from '../types/TenrxRegistrationFormData.js';

import TenrxServerError from '../exceptions/TenrxServerError.js';

import TenrxLoginAPIModel from '../apiModel/TenrxLoginAPIModel.js';
import TenrxCheckIfEmailExistAPIModel from '../apiModel/TenrxCheckIfEmailExistAPIModel.js';
import TenrxRegisterUserParameterAPIModel from '../apiModel/TenrxRegisterUserParameterAPIModel.js';

import TenrxStorage from '../classes/TenrxStorage.js';
import TenrxUserAccount from '../classes/TenrxUserAccount.js';
import TenrxPatient from '../classes/TenrxPatient.js';
import TenrxCart from '../classes/TenrxCart.js';
import TenrxAccessToken from '../types/TenrxAccessToken.js';
import TenrxAccessTokenExpirationInformation from '../types/TenrxAccessTokenExpirationInformation.js';
import { TenrxEnumState } from './TenrxEnums.js';
import { TenrxStateNameToStateId } from './TenrxStates.js';

/**
 * Initialize the TenrxApiEngine single instance.
 *
 * @param {string} businesstoken - The business token to be used when creating the instance.
 * @param {string} baseapi - The base api to be used when creating the instance.
 * @param {TenrxStorage} storage - The storage to be used when creating the instance.
 * @param {(theStorage: TenrxStorage) => void} [onInit] - The callback to be called after the instance is initialized.
 * @param {ISettingsParam} [loggerSetting] - The settings for the logger.
 */
export const initializeTenrx = (
  businesstoken: string,
  baseapi: string,
  storage: TenrxStorage,
  onInit?: (theStorage: TenrxStorage) => void,
  loggerSettings?: ISettingsParam,
): void => {
  TenrxLibraryLogger.info('Initializing Tenrx...');
  TenrxApiEngine.initialize(businesstoken, baseapi);
  // eslint-disable-next-line import/no-named-as-default-member
  bcryptjs.setRandomFallback((len: number) => {
    // eslint-disable-next-line import/no-named-as-default-member
    return Array.from(new Uint8Array(len).map(() => Math.floor(isaac.random() * 256)));
  });
  TenrxLogger.initialize(
    loggerSettings
      ? loggerSettings
      : {
          name: 'TenrxNoname',
          minLevel: 'fatal',
          type: 'hidden',
        },
  );
  TenrxStorage.initialize(storage);
  if (onInit) {
    onInit(TenrxStorage.instance);
  }
  TenrxLibraryLogger.info('Initialization successful.');
};

/**
 * This function retrieves the Tenrx API engine single instance. It is used when there is no need to have multiple instances of the API engine.
 *
 * @return {*}  {TenrxApiEngine} - The Tenrx API engine single instance.
 */
export const useTenrxApi = (): TenrxApiEngine => {
  return TenrxApiEngine.instance;
};

/**
 * This function retrieves the Tenrx Logger single instance. It is used when there is no need to have multiple instances of the Logger.
 *
 * @return {*}  {TenrxLogger} - The Tenrx Logger single instance.
 */
export const useTenrxLogger = (): TenrxLogger => {
  return TenrxLogger.instance;
};

/**
 * This function retrieves the TenrxStorage single instance. It is used when there is no need to have multiple instances of the TenrxStorage.
 *
 * @return {*}  {TenrxStorage}
 */
export const useTenrxStorage = (): TenrxStorage => {
  return TenrxStorage.instance;
};

/**
 * This functions retrieves the TenrxUserAccount single instance. It is used when there is no need to have multiple instances of the TenrxUserAccount.
 *
 * @return {*}  {TenrxUserAccount}
 */
export const useTenrxUserAccount = (): TenrxUserAccount => {
  return TenrxUserAccount.instance;
};

/**
 * This functions retrieves the TenrxPatient single instance. It is used when there is no need to have multiple instances of the TenrxPatient.
 *
 * @return {*}  {TenrxPatient}
 */
export const useTenrxPatient = (): TenrxPatient => {
  return TenrxPatient.instance;
};

/**
 * This functions retrieves the TenrxCart single instance. It is used when there is no need to have multiple instances of the TenrxCart.
 *
 * @return {*}  {TenrxCart}
 */
export const useTenrxCart = (): TenrxCart => {
  return TenrxCart.instance;
};

// This salt is used to hash the password. It should not be changed since it will force everyone to change their password.
const SALT = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmu';

/**
 * Returns a list of state ids that are valid to issue prescriptions.
 *
 * @param {*} [apiEngine=useTenrxApi()] - The api engine to be used.
 * @return {*}  {(Promise<TenrxEnumState[] | null>)} - The list of state ids that are valid to issue prescriptions. Null is returned if the request failed.
 */
export const getStatesValidForTenrx = async (apiEngine = useTenrxApi()): Promise<TenrxEnumState[] | null> => {
  const result: TenrxEnumState[] = [];
  const response = await apiEngine.getStatesValidForRx();
  if (response.status === 200) {
    if (response.content) {
      const content = response.content as { data: { stateName: string; stateCode: string }[] };
      if (content.data) {
        if (content.data.length > 0) {
          for (const state of content.data) {
            result.push(TenrxStateNameToStateId[state.stateName]);
          }
        } else {
          TenrxLibraryLogger.warn('There are no states valid for prescriptions.');
        }
      } else {
        TenrxLibraryLogger.error('No data in response.');
        return null;
      }
    } else {
      TenrxLibraryLogger.error('No content in response.');
      return null;
    }
  } else {
    TenrxLibraryLogger.error(`Backend returned status code: ${response.status}`);
    return null;
  }
  return result;
};

/**
 * Refreshes the current token that the api engine has.
 *
 * @param {string} [language='en'] - The language to use.
 * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
 * @return {*}  {(Promise<TenrxAccessToken | null>)} - The promise that resolves to the new token or null if the token could not be refreshed.
 */
export const refreshTokenTenrx = async (apiEngine = useTenrxApi()): Promise<TenrxAccessToken | null> => {
  try {
    TenrxLibraryLogger.info('Refreshing token...');
    const response = await apiEngine.refreshToken();
    TenrxLibraryLogger.debug('Refresh token response:', response);
    if (response.status === 200) {
      // Disabling linter due to the api returning this object.
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const content = response.content as { access_token: string; expires_in: number };
      if (content) {
        const expiringInformation: TenrxAccessTokenExpirationInformation =
          apiEngine.getAccessTokenExpirationInformation();
        TenrxLibraryLogger.info('Token refreshed successfully.');
        return {
          accessToken: content.access_token,
          expiresIn: expiringInformation.expiresIn,
          expireDateStart: expiringInformation.expireDateStart,
        };
      }
      TenrxLibraryLogger.error('Token refresh failed: content is null.');
      return null;
    }
    TenrxLibraryLogger.error('Token refresh failed:', response.error);
    return null;
  } catch (error) {
    TenrxLibraryLogger.error('Error refreshing token:', error);
    return null;
  }
};

/**
 * Authenticates to the Tenrx backend servers.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {string} [language='en'] - The language to use.
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @param {string} [macaddress='up:da:te:la:te:rr'] - The mac address of the device.
 * @return {*}  {Promise<TenrxLoginResponseData>}
 */
export const authenticateTenrx = async (
  username: string,
  password: string,
  language = 'en',
  apiengine: TenrxApiEngine = useTenrxApi(),
  macaddress = 'up:da:te:la:te:rr',
): Promise<TenrxLoginResponseData> => {
  const loginresponse: TenrxLoginResponseData = {
    accessToken: null,
    expiresIn: null,
    accountData: {},
    securityQuestions: null,
    patientData: null,
    notifications: null,
    firstTimeLogin: false,
    message: null,
    status: -1,
    error: null,
  };
  TenrxLibraryLogger.info(`Authenticating to Tenrx with username: '${username}'...`);
  TenrxLibraryLogger.silly('Hashing password...');
  // eslint-disable-next-line import/no-named-as-default-member
  const saltedpassword = await bcryptjs.hash(password, SALT);
  TenrxLibraryLogger.silly('Hashing password successful');
  TenrxLibraryLogger.debug('Authenticating with backend servers...');
  const result = await apiengine.login(username, saltedpassword, language, macaddress);
  TenrxLibraryLogger.debug('Authentication Response: ', result);
  const content = result.content as TenrxLoginAPIModel;
  loginresponse.status = !(result.content == null)
    ? !(content.statusCode == null)
      ? content.statusCode
      : result.status
    : result.status;
  if (result.status === 200) {
    if (result.content) {
      if (content.access_token) {
        loginresponse.accessToken = content.access_token;
        loginresponse.expiresIn = content.expires_in;
        loginresponse.accountData = content.data;
        loginresponse.patientData = content.patientData?.data ? content.patientData.data : null;
        loginresponse.notifications = content.notifications;
        TenrxLibraryLogger.info('Authentication successful.');
      } else {
        if (content.statusCode === 200) {
          TenrxLibraryLogger.info('Tenrx server is requesting more information: ', content.message);
          if (content.data) {
            if (Array.isArray(content.data) && content.data.length > 0) {
              loginresponse.securityQuestions = [];
              for (const rawquestion of content.data) {
                const securityquestion: TenrxLoginSecurityQuestion = {} as TenrxLoginSecurityQuestion;
                const question = rawquestion;
                securityquestion.id = question.id;
                securityquestion.question = question.question;
                securityquestion.value = question.value;
                securityquestion.active = question.isActive;
                loginresponse.securityQuestions.push(securityquestion);
              }
            }
          }
        } else {
          TenrxLibraryLogger.info('Authentication failed: ', content.message);
        }
        loginresponse.message = content.message;
      }
      loginresponse.firstTimeLogin = content.firstTimeLogin;
    } else {
      TenrxLibraryLogger.error(
        'Error occurred while authenticating due to content being empty. Error property is: ',
        result.error,
      );
      loginresponse.error = result.error
        ? result.error
        : 'Error occurred while authenticating due to content being empty.';
    }
  } else {
    TenrxLibraryLogger.error('Error occurred while authenticating:', result.error);
    loginresponse.error = result.error;
  }
  return loginresponse;
};

/**
 * Checks to see if email exists in Tenrx.
 *
 * @param {string} email - The email to check.
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @return {*}  {Promise<boolean>} - Returns true if email exists, false otherwise.
 * @throws {TenrxServerError} - Throws an error if an error occurred while checking if email exists.
 */
export const checkIfEmailExists = async (
  email: string,
  apiengine: TenrxApiEngine = useTenrxApi(),
): Promise<boolean> => {
  TenrxLibraryLogger.info(`Checking if email '${email}' exists...`);
  const result = await apiengine.checkIsEmailExists(email);
  TenrxLibraryLogger.debug('CheckIfEmailExists Response: ', result);
  if (result.status === 200) {
    if (!(result.content == null)) {
      const content = result.content as TenrxCheckIfEmailExistAPIModel;
      if (content.statusCode === 200) {
        TenrxLibraryLogger.info(`Email '${email}' exists.`);
        return true;
      } else {
        if (content.statusCode === 404) {
          TenrxLibraryLogger.info(`Email '${email}' does not exist.`);
          return false;
        } else {
          TenrxLibraryLogger.error(`Error occurred while checking if email '${email}' exists:`, content.message);
          throw new TenrxServerError(content.message, content.statusCode, result.error);
        }
      }
    } else {
      TenrxLibraryLogger.error(`Error occurred while checking if email '${email}' exists:`, result.error);
      // Status code is 200, but content is null. Therefore, we can't tell if email exists or not. So we need to throw an error with status code -1.
      throw new TenrxServerError(`Error occurred while checking if email '${email}' exists.`, -1, result.error);
    }
  } else {
    TenrxLibraryLogger.error('Error occurred while checking if email exists: ', result.error);
    throw new TenrxServerError('Error occurred while checking if email exists.', result.status, result.error);
  }
};

/**
 * Log outs from the Tenrx backend servers.
 *
 * @param {(success: boolean) => void} onLogout - The callback to call when logout is executed. True is passed to callback if logout was successful, false otherwise.
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @return {*}  {Promise<void>}
 */
export const logoutTenrx = async (
  onLogout: (success: boolean) => void,
  apiengine: TenrxApiEngine = useTenrxApi(),
): Promise<void> => {
  TenrxLibraryLogger.info('Logging out of Tenrx...');
  const userAccountLogout = await TenrxUserAccount.logout(apiengine);
  if (userAccountLogout) {
    TenrxPatient.logout();
    if (onLogout) {
      onLogout(userAccountLogout);
    }
    TenrxLibraryLogger.info('Logout successful.');
  } else {
    if (onLogout) {
      onLogout(userAccountLogout);
    }
    TenrxLibraryLogger.error('Error occurred while logging out');
  }
};

/**
 * Saves the security questions answers for the user.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {TenrxLoginSecurityQuestionAnswer[]} securityQuestionAnswers - The security questions and answers to save.
 * @param {string} [macaddress='up:da:te:la:te:rr'] - The mac address of the user.
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @return {*}  {Promise<TenrxLoginResponseData>} - Returns the login response data.
 */
export const saveSecurityQuestionAnswers = async (
  username: string,
  password: string,
  securityQuestionAnswers: TenrxLoginSecurityQuestionAnswer[],
  macaddress = 'up:da:te:la:te:rr',
  apiengine: TenrxApiEngine = useTenrxApi(),
): Promise<TenrxLoginResponseData> => {
  const loginresponse: TenrxLoginResponseData = {
    accessToken: null,
    expiresIn: null,
    accountData: {},
    securityQuestions: null,
    patientData: null,
    notifications: null,
    firstTimeLogin: false,
    message: null,
    status: -1,
    error: null,
  };
  TenrxLibraryLogger.info('Saving security question answers...');
  TenrxLibraryLogger.silly('Hashing password...');
  // eslint-disable-next-line import/no-named-as-default-member
  const saltedpassword = await bcryptjs.hash(password, SALT);
  TenrxLibraryLogger.silly('Hashing password successful');
  TenrxLibraryLogger.debug('Security Question Answers Info: ', username, password, macaddress, securityQuestionAnswers);
  const result = await apiengine.saveSecurityQuestionAnswers({
    username,
    password: saltedpassword,
    macaddress,
    securityQuestionList: securityQuestionAnswers,
  });
  TenrxLibraryLogger.debug('Authentication Response: ', result);
  const content = result.content as TenrxLoginAPIModel;
  loginresponse.status = !(result.content == null)
    ? !(content.statusCode == null)
      ? content.statusCode
      : result.status
    : result.status;
  if (result.status === 200) {
    if (result.content) {
      loginresponse.message = content.message;
      if (content.statusCode === 200) {
        loginresponse.accessToken = content.access_token;
        loginresponse.expiresIn = content.expires_in;
        loginresponse.accountData = content.data;
        loginresponse.patientData = content.patientData?.data ? content.patientData.data : null;
        loginresponse.notifications = content.notifications;
        TenrxLibraryLogger.info('Security question answers were saved successfully.');
      }
    }
  }
  return loginresponse;
};

/**
 * Register user with Tenrx.
 *
 * @param {TenrxRegistrationFormData} registrationData
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()]
 * @return {*}  {Promise<TenrxLoginResponseData>}
 */
export const registerUser = async (
  registrationData: TenrxRegistrationFormData,
  apiengine: TenrxApiEngine = useTenrxApi(),
): Promise<TenrxLoginResponseData> => {
  TenrxLibraryLogger.info('Registering user...');
  const loginresponse: TenrxLoginResponseData = {
    accessToken: null,
    expiresIn: null,
    accountData: {},
    securityQuestions: null,
    patientData: null,
    notifications: null,
    firstTimeLogin: false,
    message: null,
    status: -1,
    error: null,
  };
  TenrxLibraryLogger.silly('Initial registration data: ', registrationData);
  TenrxLibraryLogger.silly('Hashing password...');
  // eslint-disable-next-line import/no-named-as-default-member
  const saltedpassword = await bcryptjs.hash(registrationData.password, SALT);
  TenrxLibraryLogger.silly('Hashing password successful');
  const registerAPIData: TenrxRegisterUserParameterAPIModel = {
    id: 0,
    firstName: registrationData.firstName,
    lastName: registrationData.lastName,
    middleName: registrationData.middleName,
    dob: DateTime.fromJSDate(registrationData.dob).toUTC().toISO({ suppressMilliseconds: true }),
    age: 0,
    gender: registrationData.gender,
    password: saltedpassword,
    ssn: '',
    mrn: '',
    status: '',
    phone: registrationData.phoneNumber,
    email: registrationData.email,
    address1: registrationData.address1,
    address2: registrationData.address2,
    city: registrationData.city,
    countryId: registrationData.countryId,
    stateId: registrationData.stateId,
    zip: registrationData.zip,
    userName: registrationData.email,
    phoneNumber: registrationData.phoneNumber,
    photoBase64: registrationData.photoBase64,
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
  };
  TenrxLibraryLogger.debug('Registering user with data: ', registerAPIData);
  const result = await apiengine.registerUser(registerAPIData);
  const content = result.content as TenrxLoginAPIModel;
  loginresponse.status = !(result.content == null)
    ? !(content.statusCode == null)
      ? content.statusCode
      : result.status
    : result.status;
  if (result.status === 200) {
    if (result.content) {
      loginresponse.message = content.message;
      if (content.statusCode === 200) {
        loginresponse.accessToken = content.access_token;
        loginresponse.expiresIn = content.expires_in;
        loginresponse.accountData = content.data;
        loginresponse.patientData = content.patientData?.data ? content.patientData.data : null;
        loginresponse.notifications = content.notifications;
        TenrxLibraryLogger.info('Registration was successful.');
      }
    }
  }
  return loginresponse;
};

/**
 * Rounds number to specified number of decimal places.
 *
 * @param {number} num - The number to round.
 * @param {number} [decimals=2] - The number of decimal places to round to.
 * @return {*}  {number}
 */
export const tenrxRoundTo = (num: number, decimals = 2): number => {
  return Number(Math.round(Number(`${num}e+${decimals}`)).toString() + `e-${decimals}`);
};

/**
 * Returns true if this script is being executed in the browser. Otherwise, it returns false.
 *
 * @type {boolean}
 */
export const isBrowser: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Returns true if this script is being executed in node. Otherwise, it returns false.
 *
 * @type {boolean}
 */
export const isNode: boolean =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * Returns true if this script is being executed in a Web Worker. Otherwise, it returns false.
 *
 * @type {boolean}
 */
export const isWebWorker: boolean =
  typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';

/**
 * Returns true if this script is being executed in JSDOM. Otherwise, it returns false.
 *
 * @type {boolean}
 */
export const isJsDom: boolean =
  (typeof window !== 'undefined' && window.name === 'nodejs') ||
  (typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom')));
