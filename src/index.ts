import { TenrxApiEngine } from './classes/TenrxApiEngine';
import { TenrxLogger } from "./includes/TenrxLogger";
import { TenrxLoginResponseData } from './types/TenrxLoginResponseData';
import bcryptjs from 'bcryptjs';
import isaac from 'isaac';
import { TenrxLoginSecurityQuestion } from './types/TenrxLoginSecurityQuestion';

export { TenrxApiEngine } from "./classes/TenrxApiEngine";
export { TenrxApiResult } from "./types/TenrxApiResult";
export { TenrxVisitType } from "./classes/TenrxVisitType";
export { TenrxLogger } from "./includes/TenrxLogger";

export const InitializeTenrx = (businesstoken: string, baseapi: string): void => {
    TenrxLogger.info('Initializing Tenrx...');
    TenrxApiEngine.Initialize(businesstoken, baseapi);
    bcryptjs.setRandomFallback((len: number) => {
        return Array.from((new Uint8Array(len)).map(() => Math.floor(isaac.random() * 256)));
    });
    TenrxLogger.info('Initialization successful.');
}

export const useTenrxApi = (): TenrxApiEngine => {
    return TenrxApiEngine.Instance;
}

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
export const AuthenticateTenrx = async (username: string, password: string, language: string = 'en', apiengine: TenrxApiEngine = useTenrxApi(), macaddress: string = 'up:da:te:la:te:rr'): Promise<TenrxLoginResponseData> => {
    const loginresponse: TenrxLoginResponseData = {
        access_token: null,
        expires_in: null,
        accountdata: null,
        security_questions: null,
        patientdata: null,
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
    const result = await apiengine.Login(username, saltedpassword, language, macaddress);
    TenrxLogger.debug('Authentication Response: ', result);
    loginresponse.status = (!(result.content == null)) ? ((!(result.content.statusCode == null)) ? result.content.statusCode : result.status) : result.status;
    if (result.status === 200) {
        if (result.content) {
            const content = result.content;
            if (content.access_token) {
                loginresponse.access_token = content.access_token;
                loginresponse.expires_in = content.expires_in;
                loginresponse.accountdata = content.data;
                loginresponse.patientdata = content.patientData;
                loginresponse.notifications = content.notifications;
                TenrxLogger.info('Authentication successful.');
            } else {
                if (content.statusCode === 200) {
                    TenrxLogger.info('Tenrx server is requesting more information: ', content.message);
                    if (content.data) {
                        if (Array.isArray(content.data) && content.data.length > 0) {
                            loginresponse.security_questions = [];
                            for (const question of content.data) {
                                let securityquestion: TenrxLoginSecurityQuestion = {} as TenrxLoginSecurityQuestion;
                                securityquestion.Id = question.id;
                                securityquestion.Question = question.question;
                                securityquestion.Value = question.value;
                                securityquestion.Active = question.isActive;
                                loginresponse.security_questions.push(securityquestion);
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
 * Log outs from the Tenrx backend servers.
 *
 * @param {TenrxApiEngine} [apiengine=useTenrxApi()]
 * @return {*}  {Promise<TenrxLoginResponseData>}
 */
export const LogoutTenrx = async (apiengine: TenrxApiEngine = useTenrxApi()): Promise<any> => {
    TenrxLogger.info('Logging out of Tenrx...');
    const result = await apiengine.Logout();
    const response: TenrxLoginResponseData = {
        access_token: null,
        expires_in: null,
        accountdata: null,
        security_questions: null,
        patientdata: null,
        notifications: null,
        firstTimeLogin: false,
        message: null,
        status: -1,
        error: null
    };
    if (result.status === 200) {
        TenrxLogger.info('Logout successful.');
        response.status = (!(result.content == null)) ? ((!(result.content.statusCode == null)) ? result.content.statusCode : result.status) : result.status;
    } else {
        TenrxLogger.error('Error occurred while logging out:', result.error);
    }
    return result;
}