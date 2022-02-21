/**
 * Represents an error when a object have not been initialized.
 *
 * @export
 * @class TenrxNotInitialized
 * @extends {Error}
 */
export default class TenrxNotInitialized extends Error {
  /**
   * The name of the object that has not been initialized.
   *
   * @type {string}
   * @memberof TenrxNotInitialized
   */
  objectName: string;

  /**
   * Creates an instance of TenrxNotInitialized.
   *
   * @param {string} message - The error message.
   * @param {string} objectName - The name of the object that has not been initialized.
   * @memberof TenrxNotInitialized
   */
  constructor(message: string, objectName: string) {
    super(message);
    Object.setPrototypeOf(this, TenrxNotInitialized.prototype);
    this.name = 'TenrxNotInitialized';
    this.objectName = objectName;
  }
}
