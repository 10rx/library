/**
 * Represents an access token.
 *
 * @export
 * @interface TenrxAccessToken
 */
export default interface TenrxAccessToken {
  /**
   * The access token.
   *
   * @type {string}
   * @memberof TenrxAccessToken
   */
  accessToken: string;

  /**
   * The amount of time the access token is valid for in seconds from the expireDateStart.
   *
   * @type {number}
   * @memberof TenrxAccessToken
   */
  expiresIn: number;

  /**
   * The date that it starts to be valid.
   *
   * @type {number}
   * @memberof TenrxAccessToken
   */
  expireDateStart: number;
}
