import fetch from 'node-fetch';
import { TenrxLogger } from "../includes/TenrxLogger";
import { TenrxVisitType } from './TenrxVisitType';
import { TenrxApiResult } from '../types/TenrxApiResult';

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
    private _expires_in: number = 0;
    
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
        const response: TenrxApiResult = {
            'status': 0,
            'content': null,
            'error': null
        };
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
                            this._expires_in = response.content.expires_in;
                            TenrxLogger.debug('Login() Updated Access Token in API Engine: ', this._accesstoken, ' Expires In: ', this._expires_in);
                        } else {
                            TenrxLogger.debug('Login() No Access Token in API Response');
                        }
                    } else {
                        TenrxLogger.error('API returned data as null when logging in. Content of error is: ', response.error);
                    }
                } else
                {
                    TenrxLogger.error('API returned content as null when logging in. Content of error is: ', response.error);
                }
                
            } else {
                TenrxLogger.error('Login() Error: ', response.error);
            }
            return response;
        } catch (error) {
            TenrxLogger.error('Login() Error: ', error);
            response.error = error;
            return response;
        }
    }


    /**
     * Gets all the visit types
     *
     * @return {Promise<TenrxVisitType[]>}  {Promise<TenrxVisitType[]>} - All the visit types
     * @memberof TenrxApiEngine
     */
    async GetVisitTypes(): Promise<TenrxVisitType[] | null> {
        TenrxLogger.info('Getting all the visit types from API');
        try{
            const response = await this.get(`${this._baseapi}/Login/GetVisitTypes`);
            if (response.status === 200) {
                TenrxLogger.debug('GetVisitTypes() Response: ', response.content);
                if (response.content) {
                    if (response.content.data){
                        TenrxLogger.info('Total Visit Types received from API: ', response.content.data.length);
                        const result: TenrxVisitType[] = [];
                        for (const visitType of response.content.data) {
                            result.push(new TenrxVisitType(visitType));
                        }                    
                        return result;
                    } else {
                        TenrxLogger.error('API returned data as null when getting visit types. Content of error is: ', response.error);
                        return null;
                    }
                } else
                {
                    TenrxLogger.error('API returned content as null when getting visit types. Content of error is: ', response.error);
                    return null;
                }
                
            } else {
                TenrxLogger.error('GetVisitTypes() Error: ', response.error);
                return null;
            }
        } catch (error) {
            TenrxLogger.error('GetVisitTypes() Error: ', error);
            return null;
        }
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

