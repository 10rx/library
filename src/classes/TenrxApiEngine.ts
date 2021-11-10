import fetch from 'node-fetch';
import { TenrxApiResult } from './TenrxApiResult';

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
        this._businesstoken = businesstoken;
        this._baseapi = baseapi;
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
        const internalurl: URL = new URL(url);
        const returnvalue: TenrxApiResult = new TenrxApiResult();
        if (params) {
            Object.keys(params).forEach(key => {
                internalurl.searchParams.append(key, params[key]);
            });
        }
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
        } catch (error) {
            returnvalue.error = error;
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
        } catch (error) {
            returnvalue.error = error;
        }
        return returnvalue;
    }
}

