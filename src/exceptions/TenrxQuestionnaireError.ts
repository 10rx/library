/**
 * Represents a Tenrx questionnaire error.
 *
 * @export
 * @class TenrxQuestionnaireError
 * @extends {Error}
 */
export default class TenrxQuestionnaireError extends Error {
  /**
   * Contains the underlying exception that caused the error. This is usually the original error that was thrown.
   *
   * @type {unknown}
   * @memberof TenrxQuestionnaireError
   */
  innerException: unknown;

  /**
   * Creates an instance of TenrxQuestionnaireError.
   *
   * @param {string} message - The error message.
   * @param {unknown} [innerException=null] - The inner exception.
   * @memberof TenrxQuestionnaireError
   */
  constructor(message: string, innerException: unknown = null) {
    super(message);
    Object.setPrototypeOf(this, TenrxQuestionnaireError.prototype);
    this.name = 'TenrxQuestionnaireError';
    this.innerException = innerException;
  }
}
