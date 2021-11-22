import { TenrxLoginSecurityQuestion } from './TenrxLoginSecurityQuestion';
/**
 * Representation of the Tenrx login response data.
 *
 * @export
 * @interface TenrxLoginResponseData
 */
export interface TenrxLoginResponseData {
    /**
     * The access token of the user.
     *
     * @type {string}
     * @memberof TenrxLoginResponseData
     */
    access_token: string | null;
    
    /**
     * The expiration time of the access token in seconds.
     *
     * @type {number}
     * @memberof TenrxLoginResponseData
     */
    expires_in: number | null;

    /**
     * The account information of the user.
     *
     * @type {*}
     * @memberof TenrxLoginResponseData
     */
    accountdata: any;

    /**
     * 
     *
     * @type {TenrxLoginSecurityQuestion[]}
     * @memberof TenrxLoginResponseData
     */
    security_questions: TenrxLoginSecurityQuestion[] | null;

    /**
     * The data of the patient.
     *
     * @type {*}
     * @memberof TenrxLoginResponseData
     */
    patientdata: any;

    /**
     * Represents any notifications that the user needs to be aware of.
     *
     * @type {*}
     * @memberof TenrxLoginResponseData
     */
    notifications: any;
    
    /**
     * True if this is the first time the user logins in. Otherwise, false.
     *
     * @type {boolean}
     * @memberof TenrxLoginResponseData
     */
    firstTimeLogin: boolean;

    /**
     * Message from the Tenrx server
     *
     * @type {(string | null)}
     * @memberof TenrxLoginResponseData
     */
    message: string | null;
    
    /**
     * Contains information in case of an error.
     *
     * @type {*}
     * @memberof TenrxLoginResponseData
     */
    error: any;
}
