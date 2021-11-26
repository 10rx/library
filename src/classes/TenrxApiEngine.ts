import fetch from 'node-fetch';
import { TenrxLogger } from "../includes/TenrxLogger";
import { TenrxApiResult } from '../types/TenrxApiResult';
import { TenrxProductCatagory} from '../classes/TenrxProductCatagory'

/**
 * Represents a Tenrx API engine.
 *
 * @export
 * @class TenrxApiEngine - A class that represents a Tenrx API engine.
 */
export class TenrxApiEngine {
    private _businesstoken: string = '';
    private _baseapi: string = '';
    private _accesstoken: string = '';
    private _expiresIn: number = -1;
    private _expireDateStart: number = 0;
    
    private static _instance: TenrxApiEngine | null = null;
    
    /**
     * Creates an instance of TenrxApiEngine.
     * @param {string} businesstoken - The business token to use for the API engine
     * @param {string} baseapi - The base api url to use for the API engine
     * @memberof TenrxApiEngine
     */
    constructor(businesstoken: string, baseapi: string) {
        TenrxLogger.debug('Creating a new TenrxApiEngine: ', { 'businesstoken': businesstoken, 'baseapi': baseapi });
        this._businesstoken = businesstoken;
        this._baseapi = baseapi;
    }

    /**
     * Logs out the TenrxApiEngine instance
     *
     * @return {*}  {Promise<TenrxApiResult>}
     * @memberof TenrxApiEngine
     */
    public async Logout(): Promise<TenrxApiResult> {
        TenrxLogger.debug('Logging out user from API');
        try {
            const response = await this.auth_patch(`${this._baseapi}/Login/Logout`);
            this._accesstoken = '';
            this._expiresIn = -1;
            this._expireDateStart = 0;
            return response;
        } catch (error) {
            TenrxLogger.error('Logout() Error: ', error);
            const response: TenrxApiResult = {
                status: -1,
                content: null,
                error: error
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
    public get IsAuthenticated(): boolean {
        try {
            this._ensureValidAccessToken();
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
     */
    private _ensureValidAccessToken(): void {
        TenrxLogger.debug('Ensuring valid access token');
        if (this._accesstoken === '') {
            TenrxLogger.silly('Access Token is empty:', this._accesstoken);
            throw new Error('Access Token is empty.');
        }
        if (this._expiresIn < 0) {
            TenrxLogger.silly('Expires In is not valid:', this._expiresIn);
            throw new Error('Expires In is not valid.');
        }
        if (this._expireDateStart === 0) {
            TenrxLogger.silly('Expire Date Start is not valid:', this._expireDateStart);
            throw new Error('Expire Date Start is not valid.');
        }
        const now: number = Date.now();
        if (now > (this._expireDateStart + this._expiresIn * 1000)) {
            TenrxLogger.silly('Access Token has expired:', {
                'expireDateStart': this._expireDateStart,
                'expiresIn': this._expiresIn,
                'now': now
            });
            throw new Error('Access Token has expired.');
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
    async Login(username: string, password: string, language: string = 'en', macaddress: string = 'up:da:te:la:te:rr'): Promise<TenrxApiResult> {
        TenrxLogger.debug('Logging in user to API: ', { 'username': username, 'password': password, 'language': language, 'macaddress': macaddress });
        try {
            const response:TenrxApiResult = await this.post(`${this._baseapi}/Login/PatientLogin`,
            {
                'username': username,
                'password': password,
                'macaddress': macaddress,
                'Language': language
            });
            if (response.status === 200) {
                TenrxLogger.debug('Login() Response: ', response.content);
                if (response.content) {
                    if (response.content.data){
                        if (response.content.access_token) {
                            this._accesstoken = response.content.access_token;
                            this._expiresIn = response.content.expires_in;
                            this._expireDateStart = Date.now();
                            TenrxLogger.debug('Login() Updated Access Token in API Engine: ', this._accesstoken, ' Expires In: ', this._expiresIn);
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
                'error': error
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
    async GetVisitTypes(): Promise<TenrxApiResult> {
        TenrxLogger.silly('Getting all the visit types from API');
        try {
            const response = await this.get(`${this._baseapi}/Login/GetVisitTypes`);
            return response;
        } catch (error) {
            TenrxLogger.error('GetVisitTypes() Error: ', error);
            const response: TenrxApiResult = {
                'status': 0,
                'content': null,
                'error': error
            };
            return response;
        }
    }



    async GetProductCatagory(): Promise<TenrxProductCatagory[] | null> {
        TenrxLogger.info('Getting all the product catagory from API');
        try{
            const response = await this.get(`${this._baseapi}/Login/GetProductCategory`, {
                'Id': '1'
              });
            if (response.status === 200) {
                TenrxLogger.debug('GetProductCatagory() Response: ', response.content);
                if (response.content) {
                    if (response.content.data){
                        TenrxLogger.info('Total Product Catagory received from API: ', response.content.data.length);
                        const result: TenrxProductCatagory[] = [];
                        for (const productCatagory of response.content.data) {
                            result.push(new TenrxProductCatagory(productCatagory));
                        }                    
                        return result;
                    } else {
                        TenrxLogger.error('API returned data as null when getting Product Catagory. Content of error is: ', response.error);
                        return null;
                    }
                } else
                {
                    TenrxLogger.error('API returned content as null when getting Product Catagory. Content of error is: ', response.error);
                    return null;
                }
                
            } else {
                TenrxLogger.error('GetProductCatagory() Error: ', response.error);
                return null;
            }
        } catch (error) {
            TenrxLogger.error('GetProductCatagory() Error: ', error);
            return null;
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
    async auth_get(url: string, params: Record<string, string> = {}, headers: object = {}): Promise<TenrxApiResult> {
        this._ensureValidAccessToken();
        const authHeaders = { ...headers, 'Authorization': `${this._accesstoken}` };
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
        TenrxLogger.debug('Executing GET WebCall: ', { 'url': url, 'params': params, 'headers': headers });
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
                    'businessToken': this._businesstoken,
                    ...headers
                },
            });
            returnvalue.status = response.status;
            returnvalue.content = await response.json();
            TenrxLogger.silly('GET WebCall Response: ', returnvalue);
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
    async auth_post(url: string, params: object, headers: object = {}): Promise<TenrxApiResult> {
        this._ensureValidAccessToken();
        const authHeaders = { ...headers, 'Authorization': `${this._accesstoken}` };
        TenrxLogger.debug('Preparing to execute authenticated POST WebCall: ');
        return await this.post(url, params, authHeaders);
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
    async post(url: string, params: object = {}, headers: object = {}): Promise<TenrxApiResult> {
        TenrxLogger.debug('Executing POST WebCall: ', { 'url': url, 'params': params, 'headers': headers });
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        try {
            const response = await fetch(url, {
                'method': 'POST',
                'headers': {
                    'businessToken': this._businesstoken,
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            returnvalue.status = response.status;
            returnvalue.content = await response.json();
            TenrxLogger.silly('POST WebCall Response: ', returnvalue);
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
    async auth_put(url: string, params: object, headers: object = {}): Promise<TenrxApiResult> {
        this._ensureValidAccessToken();
        const authHeaders = { ...headers, 'Authorization': `${this._accesstoken}` };
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
        TenrxLogger.debug('Executing PUT WebCall: ', { 'url': url, 'params': params, 'headers': headers });
        const returnvalue: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
        try {
            const response = await fetch(url, {
                'method': 'PUT',
                'headers': {
                    'businessToken': this._businesstoken,
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            returnvalue.status = response.status;
            returnvalue.content = await response.json();
            TenrxLogger.silly('PUT WebCall Response: ', returnvalue);
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
    async auth_patch(url: string, queryparams: Record<string, string> = {}, bodyparams: object = {}, headers: object = {}): Promise<TenrxApiResult> {
        this._ensureValidAccessToken();
        const authHeaders = { ...headers, 'Authorization': `${this._accesstoken}` };
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
        TenrxLogger.debug('Executing PATCH WebCall: ', { 'url': url, 'queryparams': queryparams, 'bodyparams': bodyparams, 'headers': headers });
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
        try {
            const response = await fetch(internalurl.toString(), {
                'method': 'PATCH',
                'headers': {
                    'businessToken': this._businesstoken,
                    'Content-Type': 'application/json',
                    ...headers
                },
                'body': JSON.stringify(bodyparams), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
            });
            returnvalue.status = response.status;
            returnvalue.content = await response.json();
            TenrxLogger.silly('PATCH WebCall Response: ', returnvalue);
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
     */
    public static get Instance(): TenrxApiEngine {
        if (TenrxApiEngine._instance === null) {
            TenrxLogger.error('TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.');
            throw new Error('TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.');
        }
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
    public static Initialize(businesstoken: string, baseapi: string): void {
        if (TenrxApiEngine._instance !== null) {
            TenrxLogger.warn('TenrxApiEngine is already initialized. Call TenrxApiEngine.Initialize() only once.');
        }
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
        return TenrxApiEngine._instance !== null;
    }
}

