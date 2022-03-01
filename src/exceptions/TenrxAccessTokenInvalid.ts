/**
 * Represents an exception thrown when the access token is invalid.
 *
 * @export
 * @class TenrxAccessTokenInvalid
 * @extends {Error}
 */
export default class TenrxAccessTokenInvalid extends Error {
  /**
   * Contains the value that is invalid.
   *
   * @type {*}
   * @memberof TenrxAccessTokenInvalid
   */
  invalidValue: any;

  /**
   * Creates an instance of TenrxAccessTokenInvalid.
   *
   * @param {string} message - The error message.
   * @param {*} invalidValue - The value that is invalid.
   * @memberof TenrxAccessTokenInvalid
   */
  constructor(message: string, invalidValue: any) {
    super(message);
    Object.setPrototypeOf(this, TenrxAccessTokenInvalid.prototype);
    this.name = 'TenrxAccessTokenInvalid';
    // Disabling linter because we are assigning an any value to another any value. Need to investigate how to do this without the need to disable the linter for this line.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.invalidValue = invalidValue;
  }
}
