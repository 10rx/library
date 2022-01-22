import TenrxLoginSecurityQuestion from './TenrxLoginSecurityQuestion';
/**
 * Representation of the Tenrx login response data.
 *
 * @export
 * @interface TenrxLoginResponseData
 */
export default interface TenrxLoginResponseData {
  /**
   * The access token of the user.
   *
   * @type {string}
   * @memberof TenrxLoginResponseData
   */
  accessToken: string | null;

  /**
   * The expiration time of the access token in seconds.
   *
   * @type {number}
   * @memberof TenrxLoginResponseData
   */
  expiresIn: number | null;

  /**
   * The account information of the user.
   *
   * @type {unknown}
   * @memberof TenrxLoginResponseData
   */
  accountData: unknown;

  /**
   *
   *
   * @type {TenrxLoginSecurityQuestion[]}
   * @memberof TenrxLoginResponseData
   */
  securityQuestions: TenrxLoginSecurityQuestion[] | null;

  /**
   * The data of the patient.
   *
   * @type {unknown}
   * @memberof TenrxLoginResponseData
   */
  patientData: unknown;

  /**
   * Represents any notifications that the user needs to be aware of.
   *
   * @type {*}
   * @memberof TenrxLoginResponseData
   */
  notifications: any;

  /**
   * True if this is the first time the user logins in. Otherwise, false.
   *
   * @type {boolean}
   * @memberof TenrxLoginResponseData
   */
  firstTimeLogin: boolean;

  /**
   * Message from the Tenrx server
   *
   * @type {(string | null)}
   * @memberof TenrxLoginResponseData
   */
  message: string | null;

  /**
   * Represents the status code of the login request.
   *
   * @type {number}
   * @memberof TenrxLoginResponseData
   */
  status: number;

  /**
   * Contains information in case of an error.
   *
   * @type {unknown}
   * @memberof TenrxLoginResponseData
   */
  error: unknown;
}
