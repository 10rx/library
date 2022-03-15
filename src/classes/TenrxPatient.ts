import { TenrxLoginAPIModelPatientData } from '../apiModel/TenrxLoginAPIModel.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { TenrxEnumCountry, TenrxEnumGender, TenrxEnumState } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
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
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.dob = new Date();
    this.emailAddress = '';
    this.ssn = '';
    this.mrn = '';
    this.address = {
      aptNumber: undefined,
      address1: '',
      address2: undefined,
      city: '',
      stateId: TenrxEnumState.Florida,
      zipCode: '',
    };
    this.phoneNumber = '';
    this.countryId = TenrxEnumCountry.US;
    this.gender = TenrxEnumGender.Other;
    if (data) this.processApiData(data);
    this.internalWallet = wallet ? wallet : new TenrxWallet([]);
    this.internalWalletLoaded = wallet ? true : false;
    this.internalPatientInfoLoaded = data ? true : false;
  }

  private processApiData(data: TenrxLoginAPIModelPatientData): void {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.dob = new Date(data.dateOfBirth);
    this.emailAddress = data.emailAddress;
    this.ssn = data.ssn;
    this.mrn = data.mrn;
    this.address = {
      aptNumber: data.aptnumber,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      stateId: data.stateId,
      zipCode: data.zipCode,
    };
    this.phoneNumber = data.phoneNumber;
    this.countryId = data.countryId;
    this.gender = data.gender;
  }

  private internalWallet: TenrxWallet;
  private internalWalletLoaded: boolean;
  private internalPatientInfoLoaded: boolean;

  /**
   * Gets the patient's wallet information.
   *
   * @readonly
   * @type {TenrxWallet}
   * @memberof TenrxPatient
   */
  public get wallet(): TenrxWallet {
    return this.internalWallet;
  }

  /**
   * True if patient information has been loaded from backend servers. Otherwise, false.
   *
   * @readonly
   * @type {boolean}
   * @memberof TenrxPatient
   */
  public get loaded(): boolean {
    return this.internalWalletLoaded && this.internalPatientInfoLoaded;
  }

  /**
   * Loads patient data from backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<boolean>}
   * @memberof TenrxPatient
   */
  public async load(apiEngine = useTenrxApi()): Promise<boolean> {
    if (!this.internalWalletLoaded) {
      try {
        const wallet = await TenrxWallet.getWallet(apiEngine);
        this.internalWallet = wallet !== null ? wallet : new TenrxWallet([]);
        this.internalWalletLoaded = true;
      } catch (error) {
        TenrxLibraryLogger.error('Error while loading wallet.', error);
      }
      if (!this.internalPatientInfoLoaded) {
        try {
          const patientProfileApiResponse = await apiEngine.getPatientProfileData();
          if (patientProfileApiResponse.content) {
            const content = patientProfileApiResponse.content as { data: TenrxLoginAPIModelPatientData };
            if (content.data) {
              const data: TenrxLoginAPIModelPatientData = content.data;
              this.processApiData(data);
              this.internalPatientInfoLoaded = true;
            } else {
              TenrxLibraryLogger.error('Error while loading patient profile data: data is null');
            }
          } else {
            TenrxLibraryLogger.error('Error while loading patient data: content is null.');
          }
        } catch (error) {
          TenrxLibraryLogger.error('Error while loading address.', error);
        }
      }
    }
    return this.loaded;
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
   * @param {TenrxLoginAPIModelPatientData} [data] - The patient data that is used to create the patient.
   * @memberof TenrxPatient
   */
  public static initialize(id: number, data?: TenrxLoginAPIModelPatientData): void {
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
