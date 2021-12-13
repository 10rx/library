/**
 * Represents a Tenrx Login Security Question Answer
 *
 * @export
 * @interface TenrxLoginSecurityQuestionAnswer
 */
export default interface TenrxLoginSecurityQuestionAnswer {
    
    /**
     * The id. This should always be set to zero at the moment.
     *
     * @type {number} - This should always be zero.
     * @memberof TenrxLoginSecurityQuestionAnswer
     */
    id: number;

    /**
     * The security question Id. This value should come from a call to {@link authenticateTenrx} or from {@link TenrxLoginSecurityQuestion}
     *
     * @type {number}
     * @memberof TenrxLoginSecurityQuestionAnswer
     */
    questionID: number;
    
    /**
     * Contains the answer to the security question.
     *
     * @type {(string | null)}
     * @memberof TenrxLoginSecurityQuestionAnswer
     */
    answer: string | null;
}