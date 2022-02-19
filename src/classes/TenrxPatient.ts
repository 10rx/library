import { TenrxLoginAPIModelPatientData } from '../apiModel/TenrxLoginAPIModel.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { TenrxEnumCountry, TenrxEnumGender, TenrxEnumState } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Represents the patient. This contains PHI information. Therefore it must never be serialized on the client side. If it needs to be stored on the server side, then it must be encrypted.
 *
 * @export
 * @class TenrxPatient
 */
export default class TenrxPatient {
  /**
   * The id of the patient.
   *
   * @type {number}
   * @memberof TenrxPatient
   */
  id: number;

  /**
   * The first name of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  firstName: string;

  /**
   * The last name of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  lastName: string;

  /**
   * The middle name of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  middleName: string;

  /**
   * The date of birth of the patient.
   *
   * @type {Date}
   * @memberof TenrxPatient
   */
  dob: Date;

  /**
   * The patient's email address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  emailAddress: string;

  /**
   * The social security number of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  ssn: string;

  /**
   * The medical record number of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  mrn: string;

  /**
   * The apartment number of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  aptNumber: string;

  /**
   * The first line of the patient address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  address1: string;

  /**
   * The second line of the patient address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  address2: string;

  /**
   * The city of the patient address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  city: string;

  /**
   * The zip code the patient address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  zipCode: string;

  /**
   * The phone number of the patient.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  phoneNumber: string;

  /**
   * The country where there patient is.
   *
   * @type {TenrxEnumCountry}
   * @memberof TenrxPatient
   */
  countryId: TenrxEnumCountry;

  /**
   * The state where the patient is.
   *
   * @type {TenrxEnumState}
   * @memberof TenrxPatient
   */
  stateId: TenrxEnumState;

  /**
   * The gender of the patient.
   *
   * @type {TenrxEnumGender}
   * @memberof TenrxPatient
   */
  gender: TenrxEnumGender;

  /**
   * Creates an instance of TenrxPatient.
   *
   * @param {number} id - The patient's id.
   * @param {TenrxLoginAPIModelPatientData} [data] - The patient data that is used to create the patient.
   * @memberof TenrxPatient
   */
  constructor(id: number, data?: TenrxLoginAPIModelPatientData) {
    this.id = id;
    this.firstName = data ? data.firstName : '';
    this.lastName = data ? data.lastName : '';
    this.middleName = data ? data.middleName : '';
    this.dob = data ? new Date(data.dateOfBirth) : new Date();
    this.emailAddress = data ? data.emailAddress : '';
    this.ssn = data ? data.ssn : '';
    this.mrn = data ? data.mrn : '';
    this.aptNumber = data ? data.aptnumber : '';
    this.address1 = data ? data.address1 : '';
    this.address2 = data ? data.address2 : '';
    this.city = data ? data.city : '';
    this.zipCode = data ? data.zipCode : '';
    this.phoneNumber = data ? data.phoneNumber : '';
    this.countryId = data ? data.countryId : TenrxEnumCountry.USA;
    this.stateId = data ? data.stateId : TenrxEnumState.Florida;
    this.gender = data ? data.gender : TenrxEnumGender.Other;
  }

  private static internalInstance: TenrxPatient | null;

  /**
   * Gets the singleton instance of TenrxPatient.
   *
   * @readonly
   * @static
   * @type {TenrxPatient}
   * @memberof TenrxPatient
   * @throws {TenrxNotInitialized} - Throws an exception if the singleton instance is not initialized.
   */
  public static get instance(): TenrxPatient {
    if (TenrxPatient.internalInstance === null) {
      TenrxLibraryLogger.error('TenrxPatient is not initialized. Call TenrxPatient.initialize() first.');
      throw new TenrxNotInitialized(
        'TenrxPatient is not initialized. Call TenrxPatient.initialize() first.',
        'TenrxPatient',
      );
    }
    return TenrxPatient.internalInstance;
  }

  /**
   * Initializes the singleton instance of TenrxPatient.
   *
   * @static
   * @param {number} id - The patient's id.
   * @param {TenrxLoginAPIModelPatientData} data - The patient data that is used to create the patient.
   * @memberof TenrxPatient
   */
  public static initialize(id: number, data: TenrxLoginAPIModelPatientData): void {
    if (!TenrxPatient.internalInstance) {
        TenrxPatient.internalInstance = new TenrxPatient(id, data);
    } else {
      TenrxLibraryLogger.warn(
        `TenrxPatient has already been initialized. Call TenrxPatient.initialize() only once.`,
      );
    }
  }
  
  /**
   * Logs out the current patient stored in the singleton instance.
   *
   * @static
   * @memberof TenrxPatient
   */
  public static logout(): void {
    TenrxPatient.internalInstance = null;
  }

  // TODO implement call to updatePatientAddress. Figure out how to pull patient data from API.
}
