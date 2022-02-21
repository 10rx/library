/**
 * Represents an error when a object have not been loaded.
 *
 * @export
 * @class TenrxNotLoaded
 * @extends {Error}
 */
export default class TenrxNotLoaded extends Error {
  /**
   * The name of the object that has not been loaded.
   *
   * @type {string}
   * @memberof TenrxNotLoaded
   */
  objectName: string;

  /**
   * Creates an instance of TenrxNotLoaded.
   *
   * @param {string} message - The error message.
   * @param {string} objectName - The name of the object that has not been loaded.
   * @memberof TenrxNotLoaded
   */
  constructor(message: string, objectName: string) {
    super(message);
    Object.setPrototypeOf(this, TenrxNotLoaded.prototype);
    this.name = 'TenrxNotLoaded';
    this.objectName = objectName;
  }
}
