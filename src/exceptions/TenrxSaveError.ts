/**
 * Represents an error that occurs when saving a Tenrx object.
 *
 * @export
 * @class TenrxSaveError
 * @extends {Error}
 */
export default class TenrxSaveError extends Error {
  /**
   * The name of the object that was being saved.
   *
   * @type {string}
   * @memberof TenrxSaveError
   */
  objectName: string;

  /**
   * The inner exception.
   *
   * @type {unknown}
   * @memberof TenrxSaveError
   */
  innerException: unknown;

  /**
   * Creates an instance of TenrxSaveError.
   *
   * @param {string} message - The error message.
   * @param {string} objectName - The name of the object that was being saved.
   * @param {unknown} innerException - The inner exception.
   * @memberof TenrxSaveError
   */
  constructor(message: string, objectName: string, innerException: unknown) {
    super(message);
    Object.setPrototypeOf(this, TenrxSaveError.prototype);
    this.name = 'TenrxSaveError';
    this.objectName = objectName;
    this.innerException = innerException;
  }
}
