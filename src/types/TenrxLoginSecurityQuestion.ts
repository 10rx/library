/**
 * Represents a Tenrx login security question.
 *
 * @export
 * @interface TenrxLoginSecurityQuestion
 */
export interface TenrxLoginSecurityQuestion {
    
    /**
     * The security question id.
     *
     * @type {number}
     * @memberof TenrxLoginSecurityQuestion
     */
    Id: number;
    
    /**
     * The actual security question text.
     *
     * @type {string}
     * @memberof TenrxLoginSecurityQuestion
     */
    Question: string;
    
    /**
     * The possible answers to the security question or the actual security answer text.
     *
     * @type {string}
     * @memberof TenrxLoginSecurityQuestion
     */
    Value: string;
    
    /**
     * True if the security question is active.
     *
     * @type {boolean}
     * @memberof TenrxLoginSecurityQuestion
     */
    Active: boolean;
}