import fetch from 'node-fetch';
import { TenrxApiResult } from './TenrxApiResult';

export class TenrxApiEngine {
    private _businesstoken: string = '';
    private _baseapi: string = '';
    constructor(businesstoken: string, baseapi: string) {
        this._businesstoken = businesstoken;
        this._baseapi = baseapi;
    }
    async get(url: string, params: Record<string, string> = {}): Promise<TenrxApiResult> {
        let internalurl: URL = new URL(url);
        let returnvalue: TenrxApiResult = new TenrxApiResult();
        if (params) {
            Object.keys(params).forEach(key => {
                internalurl.searchParams.append(key, params[key]);
            });
        }
        try {
            const response = await fetch(internalurl.toString(), {
                method: 'GET',
                headers: {
                    'businessToken': this._businesstoken,
                },
            });
            returnvalue.status = response.status;
            returnvalue.content = await response.json();
        } catch (error) {
            returnvalue.error = error;
        }
        return returnvalue;
    }
    async post(url: string, params: object) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'businessToken': this._businesstoken,
            },
            body: JSON.stringify(params),
        });
        return await response.json();
    }
}

