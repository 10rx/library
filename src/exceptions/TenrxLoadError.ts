/**
 * Represents an error when a object failed to load.
 *
 * @export
 * @class TenrxLoadError
 * @extends {Error}
 */
export default class TenrxLoadError extends Error {
  /**
   * The name of the object that has not been loaded.
   *
   * @type {string}
   * @memberof TenrxLoadError
   */
  objectName: string;

  /**
   * Contains the inner error.
   *
   * @type {unknown}
   * @memberof TenrxLoadError
   */
  innerException: unknown;

  /**
   * Creates an instance of TenrxLoadError.
   *
   * @param {string} message - The error message.
   * @param {string} objectName - The name of the object that failed to load.
   * @param {unknown} innerException - The inner exception that caused the object to failed to load.
   * @memberof TenrxLoadError
   */
  constructor(message: string, objectName: string, innerException: unknown) {
    super(message);
    Object.setPrototypeOf(this, TenrxLoadError.prototype);
    this.name = 'TenrxLoadError';
    this.objectName = objectName;
    this.innerException = innerException;
  }
}
