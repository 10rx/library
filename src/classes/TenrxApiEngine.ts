import fetch from 'node-fetch';

export class TenrxApiEngine {
    private _businesstoken: string = '';
    constructor(businesstoken: string) {
        this._businesstoken = businesstoken;
    }
    async get(url: string, params: Record<string, string> = {}) {
        let internalurl: URL = new URL(url);
        /*if (params) {
            Object.keys(params).forEach(key => {
                internalurl.searchParams.append(key, params[key]);
            });
        }*/
        try {
            const response = await fetch(internalurl.toString(), {
                method: 'GET',
                headers: {
                    'businessToken': this._businesstoken,
                },
            });
            let json = await response.json();
            return json;
        } catch (error) {
            return error;
        }
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

