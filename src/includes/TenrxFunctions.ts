import bcryptjs from 'bcryptjs';
import isaac from 'isaac';
import { DateTime } from 'luxon';

import { TenrxLogger } from "./TenrxLogger";

import TenrxApiEngine from '../classes/TenrxApiEngine';

import TenrxLoginResponseData from '../types/TenrxLoginResponseData';
import TenrxLoginSecurityQuestion from '../types/TenrxLoginSecurityQuestion';
import TenrxLoginSecurityQuestionAnswer from '../types/TenrxLoginSecurityQuestionAnswer';
import TenrxRegistrationFormData from '../types/TenrxRegistrationFormData';

import TenrxServerError from '../exceptions/TenrxServerError';

import TenrxLoginAPIModel from '../apiModel/TenrxLoginAPIModel';
import TenrxCheckIfEmailExistAPIModel from '../apiModel/TenrxCheckIfEmailExistAPIModel';
import TenrxQuestionAPIModel from '../apiModel/TenrxQuestionAPIModel';
import TenrxRegisterUserParameterAPIModel from '../apiModel/TenrxRegisterUserParameterAPIModel';

/**
 * Initialize the TenrxApiEngine single instance.
 *
 * @param {string} businesstoken - The business token to be used when creating the instance.
 * @param {string} baseapi - The base api to be used when creating the instance.
 */
 export const initializeTenrx = (businesstoken: string, baseapi: string): void => {
    TenrxLogger.info('Initializing Tenrx...');
    TenrxApiEngine.initialize(businesstoken, baseapi);
    bcryptjs.setRandomFallback((len: number) => {
        return Array.from((new Uint8Array(len)).map(() => Math.floor(isaac.random() * 256)));
    });
    TenrxLogger.info('Initialization successful.');
}

/**
 * This function retrieves the Tenrx API engine single instance. It is used when there is no need to have multiple instances of the API engine.
 *
 * @return {*}  {TenrxApiEngine} - The Tenrx API engine single instance.
 */
export const useTenrxApi = (): TenrxApiEngine => {
    return TenrxApiEngine.instance;
}

// This salt is used to hash the password. It should not be changed since it will force everyone to change their password.
const SALT = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmu';

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
export const authenticateTenrx = async (username: string, password: string, language = 'en', apiengine: TenrxApiEngine = useTenrxApi(), macaddress = 'up:da:te:la:te:rr'): Promise<TenrxLoginResponseData> => {
    const loginresponse: TenrxLoginResponseData = {
        accessToken: null,
        expiresIn: null,
        accountData: null,
        securityQuestions: null,
        patientData: null,
        notifications: null,
        firstTimeLogin: false,
        message: null,
        status: -1,
        error: null
    };
    TenrxLogger.info(`Authenticating to Tenrx with username: '${username}'...`);
    TenrxLogger.silly('Hashing password...');
    const saltedpassword = await bcryptjs.hash(password, SALT);
    TenrxLogger.silly('Hashing password successful');
    TenrxLogger.debug('Authenticating with backend servers...');
    const result = await apiengine.login(username, saltedpassword, language, macaddress);
    TenrxLogger.debug('Authentication Response: ', result);
    const content = result.content as TenrxLoginAPIModel;
    loginresponse.status = (!(result.content == null)) ? ((!(content.statusCode == null)) ? content.statusCode : result.status) : result.status;
    if (result.status === 200) {
        if (result.content) {
            if (content.access_token) {
                loginresponse.accessToken = content.access_token;
                loginresponse.expiresIn = content.expires_in;
                loginresponse.accountData = content.data;
                loginresponse.patientData = content.patientData;
                loginresponse.notifications = content.notifications;
                TenrxLogger.info('Authentication successful.');
            } else {
                if (content.statusCode === 200) {
                    TenrxLogger.info('Tenrx server is requesting more information: ', content.message);
                    if (content.data) {
                        if (Array.isArray(content.data) && content.data.length > 0) {
                            loginresponse.securityQuestions = [];
                            for (const rawquestion of content.data) {
                                const securityquestion: TenrxLoginSecurityQuestion = {} as TenrxLoginSecurityQuestion;
                                const question = rawquestion as TenrxQuestionAPIModel;
                                securityquestion.id = question.id;
                                securityquestion.question = question.question;
                                securityquestion.value = question.value;
                                securityquestion.active = question.isActive;
                                loginresponse.securityQuestions.push(securityquestion);
                            }
                        }
                    }
                } else {
                    TenrxLogger.info('Authentication failed: ', content.message);
                }
                loginresponse.message = content.message;
            }
            loginresponse.firstTimeLogin = content.firstTimeLogin;
        } else {
            TenrxLogger.error('Error occurred while authenticating due to content being empty. Error property is: ', result.error);
            loginresponse.error = (result.error) ? result.error : 'Error occurred while authenticating due to content being empty.';
        }
    } else {
        TenrxLogger.error('Error occurred while authenticating:', result.error);
        loginresponse.error = result.error;
    }
    return loginresponse;
}

/**
 * Checks to see if email exists in Tenrx.
 *
 * @param {string} email - The email to check.
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @return {*}  {Promise<boolean>} - Returns true if email exists, false otherwise.
 * @throws {TenrxServerError} - Throws an error if an error occurred while checking if email exists.
 */
export const checkIfEmailExists = async (email: string, apiengine:TenrxApiEngine = useTenrxApi()): Promise<boolean> => {
    TenrxLogger.info(`Checking if email '${email}' exists...`);
    const result = await apiengine.checkIsEmailExists(email);
    TenrxLogger.debug('CheckIfEmailExists Response: ', result);
    if (result.status === 200) {
        if (!(result.content == null)) {
            const content = result.content as TenrxCheckIfEmailExistAPIModel
            if (content.statusCode === 200) {
                TenrxLogger.info(`Email '${email}' exists.`);
                return true;
            } else {
                if (content.statusCode === 404) {
                    TenrxLogger.info(`Email '${email}' does not exist.`);
                    return false;
                } else {
                    TenrxLogger.error(`Error occurred while checking if email '${email}' exists:`, content.message);
                    throw new TenrxServerError(content.message, content.statusCode, result.error);
                }
            }
        } else {
            TenrxLogger.error(`Error occurred while checking if email '${email}' exists:`, result.error);
            // Status code is 200, but content is null. Therefore, we can't tell if email exists or not. So we need to throw an error with status code -1.
            throw new TenrxServerError(`Error occurred while checking if email '${email}' exists.`, -1, result.error);
        }
    } else {
        TenrxLogger.error('Error occurred while checking if email exists: ', result.error);
        throw new TenrxServerError('Error occurred while checking if email exists.', result.status, result.error);
    }
}

/**
 * Log outs from the Tenrx backend servers.
 *
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()] - The api engine to use.
 * @return {*}  {Promise<TenrxLoginResponseData>}
 */
export const logoutTenrx = async (apiengine: TenrxApiEngine = useTenrxApi()): Promise<any> => {
    TenrxLogger.info('Logging out of Tenrx...');
    const result = await apiengine.logout();
    const response: TenrxLoginResponseData = {
        accessToken: null,
        expiresIn: null,
        accountData: null,
        securityQuestions: null,
        patientData: null,
        notifications: null,
        firstTimeLogin: false,
        message: null,
        status: -1,
        error: null
    };
    if (result.status === 200) {
        TenrxLogger.info('Logout successful.');
        const content = result.content as TenrxLoginAPIModel;
        response.status = (!(content == null)) ? ((!(content.statusCode == null)) ? content.statusCode : result.status) : result.status;
    } else {
        TenrxLogger.error('Error occurred while logging out:', result.error);
    }
    return result;
}

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
export const saveSecurityQuestionAnswers = async (username: string, password: string, securityQuestionAnswers: TenrxLoginSecurityQuestionAnswer[], macaddress ='up:da:te:la:te:rr', apiengine: TenrxApiEngine = useTenrxApi()): Promise<TenrxLoginResponseData> => {
    const loginresponse: TenrxLoginResponseData = {
        accessToken: null,
        expiresIn: null,
        accountData: null,
        securityQuestions: null,
        patientData: null,
        notifications: null,
        firstTimeLogin: false,
        message: null,
        status: -1,
        error: null
    };
    TenrxLogger.info('Saving security question answers...');
    TenrxLogger.silly('Hashing password...');
    const saltedpassword = await bcryptjs.hash(password, SALT);
    TenrxLogger.silly('Hashing password successful');
    TenrxLogger.debug('Security Question Answers Info: ', username, password, macaddress, securityQuestionAnswers);
    const result = await apiengine.saveSecurityQuestionAnswers({
        username,
        password: saltedpassword,
        macaddress,
        securityQuestionList: securityQuestionAnswers
    });
    TenrxLogger.debug('Authentication Response: ', result);
    const content = result.content as TenrxLoginAPIModel;
    loginresponse.status = (!(result.content == null)) ? ((!(content.statusCode == null)) ? content.statusCode : result.status) : result.status;
    if (result.status === 200) {
        if (result.content) {
            loginresponse.message = content.message;
            if (content.statusCode === 200) {
                loginresponse.accessToken = content.access_token;
                loginresponse.expiresIn = content.expires_in;
                loginresponse.accountData = content.data;
                loginresponse.patientData = content.patientData;
                loginresponse.notifications = content.notifications;
                TenrxLogger.info('Security question answers were saved successfully.');
            }
        }
    }
    return loginresponse;
}

export const registerUser = async (registrationData: TenrxRegistrationFormData, apiengine: TenrxApiEngine = useTenrxApi()): Promise<TenrxLoginResponseData> => {
    TenrxLogger.info('Registering user...');
    const loginresponse: TenrxLoginResponseData = {
        accessToken: null,
        expiresIn: null,
        accountData: null,
        securityQuestions: null,
        patientData: null,
        notifications: null,
        firstTimeLogin: false,
        message: null,
        status: -1,
        error: null
    };
    TenrxLogger.silly('Initial registration data: ', registrationData);
    const registerAPIData: TenrxRegisterUserParameterAPIModel = {
        id: 0,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        middleName: registrationData.middleName,
        dob: DateTime.fromJSDate(registrationData.dob).toUTC().toISO({ suppressMilliseconds : true }),
        age: 0,
        gender: registrationData.gender,
        password: registrationData.password,
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
        isFaceImage: false
    }
    TenrxLogger.debug('Registering user with data: ', registerAPIData);
    const result = await apiengine.registerUser(registerAPIData);
    const content = result.content as TenrxLoginAPIModel;
    loginresponse.status = (!(result.content == null)) ? ((!(content.statusCode == null)) ? content.statusCode : result.status) : result.status;
    if (result.status === 200) {
        if (result.content) {
            loginresponse.message = content.message;
            if (content.statusCode === 200) {
                loginresponse.accessToken = content.access_token;
                loginresponse.expiresIn = content.expires_in;
                loginresponse.accountData = content.data;
                loginresponse.patientData = content.patientData;
                loginresponse.notifications = content.notifications;
                TenrxLogger.info('Registration was successful.');
            }
        }
    }
    return loginresponse;
}