/**
 * Represents an exception where the chat is not active.
 *
 * @export
 * @class TenrxChatNotActive
 * @extends {Error}
 */
export default class TenrxChatNotActive extends Error {
  /**
   * The name of the object that has not been initialized.
   *
   * @type {string}
   * @memberof TenrxChatNotActive
   */
  objectName: string;

  /**
   * Creates an instance of TenrxChatNotActive.
   *
   * @param {string} message - The error message.
   * @param {string} objectName - The name of the object that is not active.
   * @memberof TenrxChatNotActive
   */
  constructor(message: string, objectName: string) {
    super(message);
    Object.setPrototypeOf(this, TenrxChatNotActive.prototype);
    this.name = 'TenrxChatNotActive';
    this.objectName = objectName;
  }
}
