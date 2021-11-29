/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Represents the API response of the Login API.
 *
 * @export
 * @interface TenrxLoginAPIModel
 */
export default interface TenrxLoginAPIModel {
    
    
    /**
     * The access token of the user.
     *
     * @type {string}
     * @memberof TenrxLoginAPIModel
     * This comes from the API. There is nothing much we can do about it.
     * 
     */
    access_token: string;
    
    /**
     * The time in seconds until the access token expires.
     *
     * @type {number}
     * @memberof TenrxLoginAPIModel
     */
    expires_in: number;

    /**
     * Contains the data payload of the Login API.
     *
     * @type {*}
     * @memberof TenrxLoginAPIModel
     */
    data: any

    message: string;

    statusCode: number;

    patientData: any;

    notifications: any;

    firstTimeLogin: boolean;
}