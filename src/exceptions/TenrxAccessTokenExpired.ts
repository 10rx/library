/**
 * Represents an exception thrown when the Tenrx access token has expired.
 *
 * @export
 * @class TenrxAccessTokenExpired
 * @extends {Error}
 */
export default class TenrxAccessTokenExpired extends Error {

    /**
     * The date when the token was created.
     *
     * @type {number}
     * @memberof TenrxAccessTokenExpired
     */
    tokenStartDate: number;
    
    /**
     * The valid duration in seconds of the token after the start date.
     *
     * @type {number}
     * @memberof TenrxAccessTokenExpired
     */
    tokenExpiresIn: number;

    /**
     * The current time in seconds. This time is grabbed the moment the token is validated in order to determine if the token has expired.
     *
     * @type {number}
     * @memberof TenrxAccessTokenExpired
     */
    currentTime: number;

    /**
     * Creates an instance of TenrxAccessTokenExpired.
     * 
     * @param {string} message - The error message.
     * @param {number} tokenStartDate - The date when the token was created.
     * @param {number} tokenExpiresIn - The valid duration in seconds of the token after the start date.
     * @param {number} currentTime - The current time in seconds. This time is grabbed the moment the token is validated in order to determine if the token has expired.
     * @memberof TenrxAccessTokenExpired
     */
    constructor(message: string, tokenStartDate: number, tokenExpiresIn: number, currentTime: number) {
        super(message);
        Object.setPrototypeOf(this, TenrxAccessTokenExpired.prototype);
        this.name = "TenrxAccessTokenExpired";
        this.tokenStartDate = tokenStartDate;
        this.tokenExpiresIn = tokenExpiresIn;
        this.currentTime = currentTime;
    }
}