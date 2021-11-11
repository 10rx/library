import fetch from 'node-fetch';
import { TenrxApiResult } from './TenrxApiResult';
import { TenrxLogger } from "../includes/TenrxLogger";

/**
 * Represents a Tenrx API engine.
 *
 * @export
 * @class TenrxApiEngine - A class that represents a Tenrx API engine.
 */
export class TenrxApiEngine {
    private _businesstoken: string = '';
    private _baseapi: string = '';
    
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
     * Gets all the visit types
     *
     * @return {*}  {Promise<any>} - All the visit types
     * @memberof TenrxApiEngine
     */
    async GetVisitTypes(): Promise<any> {
        TenrxLogger.info('Getting all the visit types from API');        
        const response = await this.get(`${this._baseapi}/Login/GetVisitTypes`);
        if (response.status === 200) {
            TenrxLogger.debug('GetVisitTypes() Response: ', response.content);
            return response.content;
        } else {
            TenrxLogger.error('GetVisitTypes() Error: ', response.error);
            return response.error;
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
        const returnvalue: TenrxApiResult = new TenrxApiResult();
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
        const returnvalue: TenrxApiResult = new TenrxApiResult();
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
}

