import { TenrxLoginAPIModelPatientData } from '../apiModel/TenrxLoginAPIModel.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { TenrxEnumCountry, TenrxEnumGender, TenrxEnumState } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxStreetAddress from '../types/TenrxStreetAddress.js';
import TenrxWallet from './TenrxWallet.js';

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
   * The first line of the patient address.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  address: TenrxStreetAddress;

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
  constructor(id: number, data?: TenrxLoginAPIModelPatientData, wallet?: TenrxWallet) {
    this.id = id;
    this.firstName = data ? data.firstName : '';
    this.lastName = data ? data.lastName : '';
    this.middleName = data ? data.middleName : '';
    this.dob = data ? new Date(data.dateOfBirth) : new Date();
    this.emailAddress = data ? data.emailAddress : '';
    this.ssn = data ? data.ssn : '';
    this.mrn = data ? data.mrn : '';
    this.address = {
      aptNumber: data ? data.aptnumber : undefined,
      address1: data ? data.address1 : '',
      address2: data ? data.address2 : undefined,
      city: data ? data.city : '',
      stateId: data ? data.stateId : TenrxEnumState.Florida,
      zipCode: data ? data.zipCode : '',
    };
    this.phoneNumber = data ? data.phoneNumber : '';
    this.countryId = data ? data.countryId : TenrxEnumCountry.US;
    this.gender = data ? data.gender : TenrxEnumGender.Other;
    this.internalWallet = wallet ? wallet : new TenrxWallet([]);
    this.internalWalletLoaded = wallet ? true : false;
    this.internalAddressLoaded = data ? true : false;
  }

  private internalWallet: TenrxWallet;
  private internalWalletLoaded: boolean;
  private internalAddressLoaded: boolean;

  public get wallet(): TenrxWallet {
    return this.internalWallet;
  }

  public get loaded(): boolean {
    return this.internalWalletLoaded && this.internalAddressLoaded;
  }

  public async load(): Promise<void> {
    if (!this.internalWalletLoaded) {
      try {
        const wallet = await TenrxWallet.getWallet();
        this.internalWallet = wallet !== null ? wallet : new TenrxWallet([]);
        this.internalWalletLoaded = true;
      } catch (error) {
        TenrxLibraryLogger.error('Error while loading wallet.', error);
      }
      if (!this.internalAddressLoaded) {
        try {
          this.internalAddressLoaded = true;
        } catch (error) {
          TenrxLibraryLogger.error('Error while loading address.', error);
        }
      }
    }
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
      TenrxLibraryLogger.warn(`TenrxPatient has already been initialized. Call TenrxPatient.initialize() only once.`);
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
