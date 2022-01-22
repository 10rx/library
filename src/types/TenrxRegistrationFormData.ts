import { TenrxEnumGender, TenrxEnumCountry, TenrxEnumState } from '../includes/TenrxEnums.js';

/**
 * Represents the necessary information to register a patient in Tenrx.
 *
 * @export
 * @interface TenrxRegistrationFormData
 */
export default interface TenrxRegistrationFormData {
  /**
   * The email of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  email: string;

  /**
   * The password of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  password: string;

  /**
   * The first name of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  firstName: string;

  /**
   * The last name of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  lastName: string;

  /**
   * The middle name of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  middleName: string;

  /**
   * The gender of the user.
   *
   * @type {TenrxGender}
   * @memberof TenrxRegistrationFormData
   */
  gender: TenrxEnumGender;

  /**
   * The date of birth of the user.
   *
   * @type {Date}
   * @memberof TenrxRegistrationFormData
   */
  dob: Date;

  /**
   * The phone number of the user.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  phoneNumber: string;

  /**
   * The first line of the user's address. This is usually the street name.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  address1: string;

  /**
   * The second line of the user's address. This is usually the apartment number.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  address2: string;

  /**
   * The city of the user's address.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  city: string;

  /**
   * The state of the user's address.
   *
   * @type {TenrxEnumState}
   * @memberof TenrxRegistrationFormData
   */
  stateId: TenrxEnumState;

  /**
   * The zip code of the user's address.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  zip: string;

  /**
   * The country of the user's address.
   *
   * @type {TenrxCountry}
   * @memberof TenrxRegistrationFormData
   */
  countryId: TenrxEnumCountry;

  /**
   * The profile picture of the user encoded as a base64 string.
   *
   * @type {string}
   * @memberof TenrxRegistrationFormData
   */
  photoBase64: string;
}
