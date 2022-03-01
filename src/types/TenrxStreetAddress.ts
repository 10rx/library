import { TenrxEnumState } from '../includes/TenrxEnums.js';

/**
 * Represents a Street Address.
 *
 * @export
 * @interface TenrxStreetAddress
 */
export default interface TenrxStreetAddress {
  /**
   * The apartment number. This is optional
   *
   * @type {string}
   * @memberof TenrxStreetAddress
   */
  aptNumber?: string;

  /**
   * The first line of the address.
   *
   * @type {string}
   * @memberof TenrxStreetAddress
   */
  address1: string;

  /**
   * The second line of the address. This is optional
   *
   * @type {string}
   * @memberof TenrxStreetAddress
   */
  address2?: string;

  /**
   * The city of the address.
   *
   * @type {string}
   * @memberof TenrxStreetAddress
   */
  city: string;

  /**
   * The state id of the address.
   *
   * @type {TenrxEnumState}
   * @memberof TenrxStreetAddress
   */
  stateId: TenrxEnumState;

  /**
   * The zip code of the address.
   *
   * @type {string}
   * @memberof TenrxStreetAddress
   */
  zipCode: string;
}
