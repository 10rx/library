import { TenrxEnumState } from '../includes/TenrxEnums.js';

/**
 * Represents the necessary information to register a guest in Tenrx.
 *
 * @export
 * @interface TenrxGuestRegistrationFormData
 */
export default interface TenrxGuestRegistrationFormData {
  /**
   * The email of the user.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  email: string;

  /**
   * The first name of the user.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  firstName: string;

  /**
   * The last name of the user.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  lastName: string;

  /**
   * The middle name of the user.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  middleName: string;

  /**
   * The phone number of the user.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  phoneNumber: string;

  /**
   * The first line of the user's address. This is usually the street name.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  address1: string;

  /**
   * The second line of the user's address. This is usually the apartment number.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  address2: string;

  /**
   * The city of the user's address.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  city: string;

  /**
   * The state of the user's address.
   *
   * @type {TenrxEnumState}
   * @memberof TenrxGuestRegistrationFormData
   */
  stateId: TenrxEnumState;

  /**
   * The zip code of the user's address.
   *
   * @type {string}
   * @memberof TenrxGuestRegistrationFormData
   */
  zip: string;
}
