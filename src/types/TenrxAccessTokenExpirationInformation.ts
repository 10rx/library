/**
 * Represents the expiration information of an access token.
 *
 * @export
 * @interface TenrxAccessTokenExpirationInformation
 */
export default interface TenrxAccessTokenExpirationInformation {
  /**
   * The amount of time the access token is valid for in seconds from the expireDateStart.
   *
   * @type {number}
   * @memberof TenrxAccessTokenExpirationInformation
   */
  expiresIn: number;

  /**
   * The date that it starts to be valid.
   *
   * @type {number}
   * @memberof TenrxAccessTokenExpirationInformation
   */
  expireDateStart: number;
}
