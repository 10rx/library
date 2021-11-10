/**
 * Represents the result of a Tenrx API call.
 *
 * @export
 * @class TenrxApiResult
 */
export class TenrxApiResult {
    
    /**
     * The status code of the API call.
     *
     * @type {number} - The status code of the API call.
     * @memberof TenrxApiResult
     */
    public status: number;
    
    /**
     * The content of the API call.
     *
     * @type {*} - The content of the API call.
     * @memberof TenrxApiResult
     */
    public content: any;
    
    
    /**
     * The error of the API call.
     *
     * @type {*} - The error of the API call.
     * @memberof TenrxApiResult
     */
    public error: any; 
    
    /**
     * Creates an instance of TenrxApiResult.
     * @param {number} [status=0] - The status code of the API call.
     * @param {*} [content=null] - The content of the API call.
     * @param {*} [error=null] - The error of the API call.
     * @memberof TenrxApiResult
     */
    constructor(status: number = 0, content: any = null, error: any = null) {
        this.status = status;
        this.content = content;
        this.error = error;
    }
}