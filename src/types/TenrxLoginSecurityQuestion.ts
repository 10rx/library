/**
 * Represents a Tenrx login security question.
 *
 * @export
 * @interface TenrxLoginSecurityQuestion
 */
export default interface TenrxLoginSecurityQuestion {
  /**
   * The security question id.
   *
   * @type {number}
   * @memberof TenrxLoginSecurityQuestion
   */
  id: number;

  /**
   * The actual security question text.
   *
   * @type {string}
   * @memberof TenrxLoginSecurityQuestion
   */
  question: string;

  /**
   * The possible answers to the security question or the actual security answer text.
   *
   * @type {string}
   * @memberof TenrxLoginSecurityQuestion
   */
  value: string;

  /**
   * True if the security question is active.
   *
   * @type {boolean}
   * @memberof TenrxLoginSecurityQuestion
   */
  active: boolean;
}
