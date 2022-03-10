/**
 * Represents an exception where the chat is not active.
 *
 * @export
 * @class TenrxChatInternalError
 * @extends {Error}
 */
 export default class TenrxChatInternalError extends Error {
    /**
     * The name of the object that has not been initialized.
     *
     * @type {string}
     * @memberof TenrxChatInternalError
     */
    objectName: string;
  
    /**
     * Creates an instance of TenrxChatInternalError.
     *
     * @param {string} message - The error message.
     * @param {string} objectName - The name of the object that is not active.
     * @memberof TenrxChatInternalError
     */
    constructor(message: string, objectName: string) {
      super(message);
      Object.setPrototypeOf(this, TenrxChatInternalError.prototype);
      this.name = 'TenrxChatInternalError';
      this.objectName = objectName;
    }
  }
  