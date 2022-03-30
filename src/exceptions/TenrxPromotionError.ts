/**
 * Represents a Tenrx promotion error.
 *
 * @export
 * @class TenrxServerError
 * @extends {Error}
 */
export default class TenrxPromotionError extends Error {
  /**
   * Contains the underlying exception that caused the error. This is usually the original error that was thrown.
   *
   * @type {unknown}
   * @memberof TenrxServerError
   */
  innerException: unknown;

  /**
   * Creates an instance of TenrxServerError.
   *
   * @param {string} message - The error message.
   * @param {unknown} innerException - The inner exception that caused the promotion to fail.
   * @memberof TenrxServerError
   */
  constructor(message: string, innerException: unknown = null) {
    super(message);
    Object.setPrototypeOf(this, TenrxPromotionError.prototype);
    this.name = 'TenrxPromotionError';
    this.innerException = innerException;
  }
}
