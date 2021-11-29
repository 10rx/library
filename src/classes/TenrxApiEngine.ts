import fetch from 'node-fetch';
import { TenrxLogger } from "../includes/TenrxLogger";
import TenrxApiResult from '../types/TenrxApiResult';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized';
import TenrxAccessTokenInvalid from '../exceptions/TenrxAccessTokenInvalid';
import TenrxAccessTokenExpired from '../exceptions/TenrxAccessTokenExpired';
import TenrxLoginAPIModel from '../apiModel/TenrxLoginAPIModel';

/**
 * Represents a Tenrx API engine.
 *
 * @export
 * @class TenrxApiEngine - A class that represents a Tenrx API engine.
 */
export default class TenrxApiEngine {
    private businesstoken: string;
    private baseapi: string;
    private accesstoken: string;
    private expiresIn: number;
    private expireDateStart: number;
    
    private static _instance: TenrxApiEngine | null = null;
    
    /**
     * Creates an instance of TenrxApiEngine.
     * 
     * @param {string} businesstoken - The business token to use for the API engine
     * @param {string} baseapi - The base api url to use for the API engine
     * @memberof TenrxApiEngine
     */
    constructor(businesstoken: string, baseapi: string) {
        TenrxLogger.debug('Creating a new TenrxApiEngine: ', { businesstoken, baseapi });
        this.businesstoken = businesstoken;
        this.baseapi = baseapi;
        this.accesstoken = '';
        this.expiresIn = -1;
        this.expireDateStart = 0;
    }

    /**
     * Check to see if email exists in the API.
     *
     * @param {string} email - The email to check
     * @return {*}  {Promise<TenrxApiResult>} - The result of the API call
     * @memberof TenrxApiEngine
     */
    public async checkIsEmailExists(email: string): Promise<TenrxApiResult> {
        TenrxLogger.debug('Checking if email exists: ', email);
        try {
            // API is missing the S in the URL. Therefore it is CheckIsEmailExist instead of CheckIsEmailExists.
            // Also, for some reason, this is a post request instead of a get request.
            const response = await this.post(`${this.baseapi}/Login/CheckIsEmailExist`, {}, {}, { email });
            return response;
        } catch (error) {
            TenrxLogger.error('CheckIsEmailExists() Error: ', error);
            const response: TenrxApiResult = {
                status: 500,
                content: null,
                error
            };
            return response;
        }
    }

    /**
     * Logs out the TenrxApiEngine instance
     *
     * @return {*}  {Promise<TenrxApiResult>}
     * @memberof TenrxApiEngine
     */
    public async logout(): Promise<TenrxApiResult> {
        TenrxLogger.debug('Logging out user from API');
        try {
            const response = await this.authPatch(`${this.baseapi}/Login/Logout`);
            this.accesstoken = '';
            this.expiresIn = -1;
            this.expireDateStart = 0;
            return response;
        } catch (error) {
            TenrxLogger.error('Logout() Error: ', error);
            const response: TenrxApiResult = {
                status: -1,
                content: null,
                error
            };
            return response;
        }
    }

    /**
     * Returns true of the Api engine is authenticated. Otherwise, it returns false.
     *
     * @readonly
     * @type {boolean}
     * @memberof TenrxApiEngine
     */
    public get isAuthenticated(): boolean {
        try {
            this.ensureValidAccessToken();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Ensures that the access token is valid
     *
     * @private
     * @memberof TenrxApiEngine
     * @throws {TenrxAccessTokenInvalid} - Throws an exception if the access token is invalid. The invalid value is contained in the exception.
     * @throws {TenrxAccessTokenExpired} - Throws an exception if the access token is expired. The expired values are contained in the exception.
     */
    private ensureValidAccessToken(): void {
        TenrxLogger.debug('Ensuring valid access token');
        if (this.accesstoken === '') {
            TenrxLogger.silly('Access Token is empty:', this.accesstoken);
            throw new TenrxAccessTokenInvalid('Access Token is empty.', this.accesstoken);
        }
        if (this.expiresIn < 0) {
            TenrxLogger.silly('Expires In is not valid:', this.expiresIn);
            throw new TenrxAccessTokenInvalid('Expires In is not valid.', this.expiresIn);
        }
        if (this.expireDateStart === 0) {
            TenrxLogger.silly('Expire Date Start is not valid:', this.expireDateStart);
            throw new TenrxAccessTokenInvalid('Expire Date Start is not valid.', this.expireDateStart);
        }
        const now: number = Date.now();
        if (now > (this.expireDateStart + this.expiresIn * 1000)) {
            TenrxLogger.silly('Access Token has expired:', {
                'expireDateStart': this.expireDateStart,
                'expiresIn': this.expiresIn,
                now
            });
            throw new TenrxAccessTokenExpired('Access Token has expired.', this.expireDateStart, this.expiresIn, now);
        }
        TenrxLogger.debug('Access Token is valid.');
    }

    /**
     * Authenticates the TenrxApiEngine instance
     *
     * @param {string} username
     * @param {string} password
     * @param {string} [language='en']
     * @param {string} [macaddress='up:da:te:la:te:rr']
     * @return {*}  {Promise<TenrxApiResult>}
     * @memberof TenrxApiEngine
     */
    async login(username: string, password: string, language = 'en', macaddress = 'up:da:te:la:te:rr'): Promise<TenrxApiResult> {
        TenrxLogger.debug('Logging in user to API: ', { username, password, language, macaddress });
        try {
            const response:TenrxApiResult = await this.post(`${this.baseapi}/Login/PatientLogin`,
            {
                username,
                password,
                macaddress,
                language
            });
            if (response.status === 200) {
                TenrxLogger.debug('Login() Response: ', response.content);
                if (response.content) {
                    const content = response.content as TenrxLoginAPIModel;
                    if (content.data){
                        if (content.access_token) {
                            this.accesstoken = content.access_token;
                            this.expiresIn = content.expires_in;
                            this.expireDateStart = Date.now();
                            TenrxLogger.debug('Login() Updated Access Token in API Engine: ', this.accesstoken, ' Expires In: ', this.expiresIn);
                        } else {
                            TenrxLogger.debug('Login() No Access Token in API Response');
                        }
                    } else {
                        TenrxLogger.error('API returned data as null when logging in. Content of error is: ', response.error);
                    }
                } else {
                    TenrxLogger.error('API returned content as null when logging in. Content of error is: ', response.error);
                }
            } else {
                TenrxLogger.error('Login() Error: ', response.error);
            }
            return response;
        } catch (error) {
            TenrxLogger.error('Login() Error: ', error);
            const response: TenrxApiResult = {
                'status': 0,
                'content': null,
                error
            };
            return response;
        }
    }


    /**
     * Gets all the visit types
     *
     * @return {*}  {Promise<TenrxApiResult>} - All the visit types
     * @memberof TenrxApiEngine
     */
    async getVisitTypes(): Promise<TenrxApiResult> {
        TenrxLogger.silly('Getting all the visit types from API');
        try {
            const response = await this.get(`${this.baseapi}/Login/GetVisitTypes`);
            return response;
        } catch (error) {
            TenrxLogger.error('GetVisitTypes() Error: ', error);
            const response: TenrxApiResult = {
                'status': 0,
                'content': null,
                error
            };
            return response;
        }
    }

    /**
     * Gets the product category by id.
     *
     * @return {*}  {Promise<TenrxApiResult>}
     * @memberof TenrxApiEngine
     */
    async getProductCategory(): Promise<TenrxApiResult> {
        TenrxLogger.info('Getting all the product category from API');
        try{
            const response = await this.get(`${this.baseapi}/Login/GetProductCategory`, {
                // This is due to the API requiring this value to be like this.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Id': '1'
              });
            return response;
        } catch (error) {
            TenrxLogger.error('GetProductCategory() Error: ', error);
            const response: TenrxApiResult = {
                'status': 0,
                'content': null,
                error
            };
            return response;
        }    
    }
    
    /**
     * Performs an authenticated GET request to the specified url.
     *
     * @param {string} url - The url to perform the GET request to.
     * @param {Record<string, string>} [params={}] - The parameters to add to the url.
     * @param {object} [headers={}] - The headers to add to the request.
     * @return {*}  {Promise<TenrxApiResult>} - The response of the GET request.
     * @memberof TenrxApiEngine
     */
    async authGet(url: string, params: Record<string, string> = {}, headers: object = {}): Promise<TenrxApiResult> {
        this.ensureValidAccessToken();
        // Needed for the API since the API requires Authorization: {token}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const authHeaders = { ...headers, 'Authorization': `${this.accesstoken}` };
        TenrxLogger.debug('Preparing to execute authenticated GET WebCall.');
        return await this.get(url, params, authHeaders);
    }

    /**
     * Performs a GET request to the specified url
     *
     * @param {string} url - The url to perform the GET request to
     * @param {Record<string, string>} [params={}] - The parameters to pass to the GET request
     * * @param {object} [headers={}] - The headers to pass to the GET request
     * @return {*}  {Promise<TenrxApiResult>} - The result of the GET request
     * @memberof TenrxApiEngine
     */
    async get(url: string, params: Record<string, string> = {}, headers: object = {}): Promise<TenrxApiResult> {
        TenrxLogger.debug('Executing GET WebCall: ', { url, params, headers });
        const internalurl: URL = new URL(url);
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        if (params) {
            Object.keys(params).forEach(key => {
                internalurl.searchParams.append(key, params[key]);
            });
        }
        TenrxLogger.silly('Real GET URL: ', internalurl.toString());
        try {
            const response = await fetch(internalurl.toString(), {
                'method': 'GET',
                'headers': {
                    'businessToken': this.businesstoken,
                    ...headers
                },
            });
            TenrxLogger.silly('GET WebCall Response: ', response);
            returnvalue.status = response.status;
            // Need to find a better way to write this so that we don't have to disable the rule.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            returnvalue.content = await response.json();
        } catch (error) {
            returnvalue.error = error;
            TenrxLogger.silly('GET WebCall Error: ', error);
        }
        return returnvalue;
    }

    /**
     * Performs an authenticated POST request to the specified url.
     *
     * @param {string} url - The url to perform the POST request to.
     * @param {object} params - The parameters to pass to the POST request.
     * @param {object} [headers={}] - The headers to pass to the POST request.
     * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request.
     * @memberof TenrxApiEngine
     */
    async authPost(url: string, params: object, headers: object = {}, queryparams: Record<string, string> = {}): Promise<TenrxApiResult> {
        this.ensureValidAccessToken();
        // Needed for the API since the API requires Authorization: {token}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const authHeaders = { ...headers, 'Authorization': `${this.accesstoken}` };
        TenrxLogger.debug('Preparing to execute authenticated POST WebCall: ');
        return await this.post(url, params, authHeaders, queryparams);
    }

    /**
     * Performs a POST request to the specified url
     *
     * @param {string} url - The url to perform the POST request to
     * @param {object} [params={}] - The parameters to pass to the POST request
     * @param {object} [headers={}] - The headers to pass to the POST request
     * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request
     * @memberof TenrxApiEngine
     */
    async post(url: string, params: object = {}, headers: object = {}, queryparams: Record<string, string> = {}): Promise<TenrxApiResult> {
        TenrxLogger.debug('Executing POST WebCall: ', { url, params, headers, queryparams });
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        const internalurl: URL = new URL(url);
        if (queryparams) {
            Object.keys(queryparams).forEach(key => {
                internalurl.searchParams.append(key, queryparams[key]);
            });
        }
        TenrxLogger.silly('Real POST URL: ', internalurl.toString());
        try {
            const response = await fetch(internalurl, {
                'method': 'POST',
                'headers': {
                    'businessToken': this.businesstoken,
                    // This is a standard HTTP header.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            TenrxLogger.silly('POST WebCall Response: ', response);
            returnvalue.status = response.status;
            // Need to find a better way to write this so that we don't have to disable the rule.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            returnvalue.content = await response.json();
        } catch (error) {
            returnvalue.error = error;
            TenrxLogger.silly('POST WebCall Error: ', error);
        }
        return returnvalue;
    }

    /**
     * Performs an authenticated PUT request to the specified url.
     *
     * @param {string} url - The url to perform the PUT request to.
     * @param {object} params - The parameters to pass to the PUT request.
     * @param {object} [headers={}] - The headers to pass to the PUT request.
     * @return {*}  {Promise<TenrxApiResult>} - The result of the PUT request.
     * @memberof TenrxApiEngine
     */
    async authPut(url: string, params: object, headers: object = {}): Promise<TenrxApiResult> {
        this.ensureValidAccessToken();
        // Needed for the API since the API requires Authorization: {token}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const authHeaders = { ...headers, 'Authorization': `${this.accesstoken}` };
        TenrxLogger.debug('Preparing to execute authenticated PUT WebCall: ');
        return await this.put(url, params, authHeaders);
    }

    /**
     * Performs an PUT request to the specified url.
     *
     * @param {string} url - The url to perform the PUT request to.
     * @param {object} [params={}] - The parameters to pass to the PUT request.
     * @param {object} [headers={}] - The headers to pass to the PUT request.
     * @return {*}  {Promise<TenrxApiResult>} - The result of the PUT request.
     * @memberof TenrxApiEngine
     */
    async put(url: string, params: object = {}, headers: object = {}): Promise<TenrxApiResult> {
        TenrxLogger.debug('Executing PUT WebCall: ', { url, params, headers });
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        try {
            const response = await fetch(url, {
                'method': 'PUT',
                'headers': {
                    'businessToken': this.businesstoken,
                    // This is a standard HTTP header.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            TenrxLogger.silly('PUT WebCall Response: ', response);
            returnvalue.status = response.status;
            // Need to find a better way to write this so that we don't have to disable the rule.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            returnvalue.content = await response.json();            
        } catch (error) {
            returnvalue.error = error;
            TenrxLogger.silly('PUT WebCall Error: ', error);
        }
        return returnvalue;
    }

    /**
     * Performs an authenticated PATCH request to the specified url.
     *
     * @param {string} url - The url to perform the PATCH request to.
     * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the PATCH request.
     * @param {object} [bodyparams={}] - The body parameters to pass to the PATCH request.
     * @param {object} [headers={}] - The headers to pass to the PATCH request.
     * @return {*}  {Promise<TenrxApiResult>} - The result of the PATCH request.
     * @memberof TenrxApiEngine
     */
    async authPatch(url: string, queryparams: Record<string, string> = {}, bodyparams: object = {}, headers: object = {}): Promise<TenrxApiResult> {
        this.ensureValidAccessToken();

        // Needed for the API since the API requires Authorization: {token}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const authHeaders = { ...headers, 'Authorization': `${this.accesstoken}` };
        TenrxLogger.debug('Preparing to execute authenticated PATCH WebCall: ');
        return await this.patch(url, queryparams, bodyparams, authHeaders);
    }

    /**
     * Performs an PATCH request to the specified url.
     *
     * @param {string} url - The url to perform the PATCH request to.
     * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the PATCH request.
     * @param {object} [bodyparams={}] - The body parameters to pass to the PATCH request.
     * @param {object} [headers={}] - The headers to pass to the PATCH request.
     * @return {*}  {Promise<TenrxApiResult>} - The result of the PATCH request.
     * @memberof TenrxApiEngine
     */
    async patch(url: string, queryparams: Record<string, string> = {}, bodyparams: object = {}, headers: object = {}): Promise<TenrxApiResult> {
        TenrxLogger.debug('Executing PATCH WebCall: ', { url, queryparams, bodyparams, headers });
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        const internalurl: URL = new URL(url);
        if (queryparams) {
            Object.keys(queryparams).forEach(key => {
                internalurl.searchParams.append(key, queryparams[key]);
            });
        }
        TenrxLogger.silly('Real PATCH URL: ', internalurl.toString());
        try {
            const response = await fetch(internalurl.toString(), {
                'method': 'PATCH',
                'headers': {
                    'businessToken': this.businesstoken,
                    // This is a standard HTTP header.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(bodyparams), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            TenrxLogger.silly('PATCH WebCall Response: ', response);
            returnvalue.status = response.status;
            // Need to find a better way to write this so that we don't have to disable the rule.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            returnvalue.content = await response.json();
        } catch (error) {
            returnvalue.error = error;
            TenrxLogger.silly('PATCH WebCall Error: ', error);
        }
        return returnvalue;
    }

    /**
     * Gets the TenrxApiEngine instance
     *
     * @readonly
     * @static
     * @type {(TenrxApiEngine)}
     * @memberof TenrxApiEngine
     * @returns {TenrxApiEngine} - The TenrxApiEngine instance
     * @throws {TenrxNotInitialized} - If the TenrxApiEngine instance is not initialized.
     */
    public static get instance(): TenrxApiEngine {
        // This is needed since the actual instance is stored in the _instance static variable
        // eslint-disable-next-line no-underscore-dangle
        if (TenrxApiEngine._instance === null) {
            TenrxLogger.error('TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.');
            throw new TenrxNotInitialized('TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.', 'TenrxApiEngine');
        }
        // eslint-disable-next-line no-underscore-dangle
        return TenrxApiEngine._instance;
    }

    /**
     * Initializes the TenrxApiEngine singleton instance
     *
     * @static
     * @param {string} businesstoken - The business token to use for the API engine
     * @param {string} baseapi - The base api url to use for the API engine
     * @memberof TenrxApiEngine
     */
    public static initialize(businesstoken: string, baseapi: string): void {
        // eslint-disable-next-line no-underscore-dangle
        if (TenrxApiEngine._instance !== null) {
            TenrxLogger.warn('TenrxApiEngine is already initialized. Call TenrxApiEngine.Initialize() only once.');
        }
        // eslint-disable-next-line no-underscore-dangle
        TenrxApiEngine._instance = new TenrxApiEngine(businesstoken, baseapi);
    }

    /**
     * Returns the status of initialization of the TenrxApiEngine singleton instance
     *
     * @static
     * @return {*}  {boolean} - True if the TenrxApiEngine is initialized
     * @memberof TenrxApiEngine
     */
    public static isInstanceInitialized(): boolean {
        // eslint-disable-next-line no-underscore-dangle
        return TenrxApiEngine._instance !== null;
    }
}

