/**
 * Represents the result of a Tenrx API call.
 *
 * @export
 * @interface TenrxApiResult
 */
export default interface TenrxApiResult {
    
    /**
     * The status code of the API call.
     *
     * @type {number} - The status code of the API call.
     * @memberof TenrxApiResult
     */
    status: number;
    
    /**
     * The content of the API call.
     *
     * @type {*} - The content of the API call.
     * @memberof TenrxApiResult
     */
    content: any;
    
    
    /**
     * The error of the API call.
     *
     * @type {*} - The error of the API call.
     * @memberof TenrxApiResult
     */
    error: any; 
}