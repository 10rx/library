/**
 * Represents a Tenrx server error.
 *
 * @export
 * @class TenrxServerError
 * @extends {Error}
 */
export default class TenrxServerError extends Error {
  /**
   * The status code of the error.
   *
   * @type {number}
   * @memberof TenrxServerError
   */
  statusCode: number;

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
   * @param {number} statusCode - The status code of the error.
   * @memberof TenrxServerError
   */
  constructor(message: string, statusCode: number, innerException: unknown = null) {
    super(message);
    Object.setPrototypeOf(this, TenrxServerError.prototype);
    this.name = 'TenrxServerError';
    this.statusCode = statusCode;
    this.innerException = innerException;
  }
}
