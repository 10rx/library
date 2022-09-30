import { DateTime } from 'luxon';
import { TenrxLoginAPIModelPatientData } from '../apiModel/TenrxLoginAPIModel.js';
import TenrxOrderAPIModel from '../apiModel/TenrxOrderAPIModel.js';
import TenrxUpdatePatientInfoAPIModel from '../apiModel/TenrxUpdatePatientInfoAPIModel.js';
import TenrxGetAppointmentsForPatientAPIModel from '../apiModel/TenrxGetAppointmentsForPatientAPIModel.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import TenrxSaveError from '../exceptions/TenrxSaveError.js';
import { TenrxEnumCountry, TenrxEnumGender, TenrxEnumState } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxAppointment from '../types/TenrxAppointment.js';
import TenrxStreetAddress from '../types/TenrxStreetAddress.js';
import TenrxOrder from './TenrxOrder.js';
import TenrxWallet from './TenrxWallet.js';

/**
 * Represents the patient. This contains PHI information. Therefore it must never be serialized on the client side. If it needs to be stored on the server side, then it must be encrypted.
 *
 * @export
 * @class TenrxPatient
 */
export default class TenrxPatient {
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
   * Contains the path for their profile picture.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  photoPath: string;

  /**
   * Contains the path for their thumbnail profile picture.
   *
   * @type {string}
   * @memberof TenrxPatient
   */
  photoThumbnailPath: string;

  /**
   * Creates an instance of TenrxPatient.
   *
   * @param {TenrxLoginAPIModelPatientData} [data] - The patient data that is used to create the patient.
   * @memberof TenrxPatient
   */
  constructor(data?: TenrxLoginAPIModelPatientData, wallet?: TenrxWallet) {
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
    this.internalWallet = wallet ? wallet : new TenrxWallet([]);
    this.internalWalletLoaded = wallet ? true : false;
    this.internalOrders = [];
    this.internalOrdersLoaded = false;
    this.internalAppointments = [];
    this.internalAppointmentsLoaded = false;
    this.photoPath = '';
    this.photoThumbnailPath = '';
    if (data) this.processApiData(data);
    this.internalPatientInfoLoaded = data ? true : false;
  }

  private processApiData(data: TenrxLoginAPIModelPatientData): void {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.dob = new Date(data.dob);
    this.emailAddress = data.emailId;
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
    this.photoPath = data.photoPath;
    this.photoThumbnailPath = data.photoThumbnailPath;
  }

  private internalWallet: TenrxWallet;
  private internalWalletLoaded: boolean;
  private internalPatientInfoLoaded: boolean;
  private internalOrders: TenrxOrder[];
  private internalOrdersLoaded: boolean;
  private internalAppointments: TenrxAppointment[];
  private internalAppointmentsLoaded: boolean;

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
   * Gets the patient's order.
   *
   * @readonly
   * @type {TenrxOrder[]}
   * @memberof TenrxPatient
   */
  public get orders(): TenrxOrder[] {
    return this.internalOrders;
  }

  /**
   * Gets the patient's appointments.
   *
   * @readonly
   * @type {TenrxAppointment[]}
   * @memberof TenrxPatient
   */
  public get appointments(): TenrxAppointment[] {
    return this.internalAppointments;
  }

  /**
   * True if patient information has been loaded from backend servers. Otherwise, false.
   *
   * @readonly
   * @type {boolean}
   * @memberof TenrxPatient
   */
  public get loaded(): boolean {
    return (
      this.internalWalletLoaded &&
      this.internalPatientInfoLoaded &&
      this.internalOrdersLoaded &&
      this.internalAppointmentsLoaded
    );
  }

  /**
   * Re-loads the patient's appointment information from the backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   */
  public async refreshAppointments(apiEngine = useTenrxApi()): Promise<void> {
    TenrxLibraryLogger.info('Refreshing appointments.');
    try {
      this.internalAppointments = [];
      const response = await apiEngine.getAppointmentsForPatient();
      if (response.status === 200) {
        if (response.content) {
          const content = response.content as {
            apiStatus: { statusCode: number };
            data: TenrxGetAppointmentsForPatientAPIModel[];
          };
          if (content.apiStatus) {
            if (content.apiStatus.statusCode === 200) {
              if (content.data) {
                for (const appointment of content.data) {
                  this.internalAppointments.push({
                    doctorName: appointment.docotorName,
                    startDate: new Date(appointment.startDateTime),
                    endDate: new Date(appointment.endDateTime),
                    orderNumber: appointment.orderNumber,
                    defaultDuration: appointment.defaultDuration,
                    appointmentStatusCode: appointment.appointmentStatusCode,
                    cancelTypeId: appointment.cancelTypeId,
                    cancelReason: appointment.cancelReason,
                  });
                }
                this.internalAppointmentsLoaded = true;
              } else {
                TenrxLibraryLogger.error('Data is null.');
              }
            } else {
              TenrxLibraryLogger.error('Error getting appointments.', content.apiStatus);
            }
          } else {
            TenrxLibraryLogger.error('ApiStatus is null');
          }
        } else {
          TenrxLibraryLogger.error('Response content is null.', response.error);
        }
      } else {
        TenrxLibraryLogger.error('Error refreshing appointments.', response);
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error while loading appointment data.', error);
      this.internalOrdersLoaded = false;
    }
  }

  /**
   * Re-loads the patient's order information from the backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   */
  public async refreshOrders(apiEngine = useTenrxApi()): Promise<void> {
    TenrxLibraryLogger.info('Refreshing patient order information.');
    try {
      this.internalOrders = [];
      const response = await apiEngine.getPatientOrders();
      if (response) {
        if (response.content) {
          const content = response.content as { data: { patientOrders: TenrxOrderAPIModel[] } };
          if (content) {
            if (content.data) {
              const data = content.data;
              if (data.patientOrders) {
                if (data.patientOrders) {
                  this.internalOrders.push(
                    ...data.patientOrders
                      .filter((order) => order.orderProducts.length)
                      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                      .map((order) => new TenrxOrder(order)),
                  );
                  this.internalOrdersLoaded = true;
                }
              } else {
                TenrxLibraryLogger.error('Error while loading order data: patientOrders is null');
                this.internalOrdersLoaded = false;
              }
            } else {
              TenrxLibraryLogger.error('Error while loading order data: data is null');
              this.internalOrdersLoaded = false;
            }
          }
        } else {
          TenrxLibraryLogger.error('Error while loading order data: content is null');
          this.internalOrdersLoaded = false;
        }
      } else {
        TenrxLibraryLogger.error('Error while loading order data: response is null');
        this.internalOrdersLoaded = false;
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error while loading order data.', error);
      this.internalOrdersLoaded = false;
    }
  }

  /**
   * Re-loads the patient's wallet information from the backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   */
  public async refreshWallet(apiEngine = useTenrxApi()): Promise<void> {
    TenrxLibraryLogger.info('Refreshing patient wallet information.');
    try {
      const wallet = await TenrxWallet.getWallet(apiEngine);
      this.internalWallet = wallet !== null ? wallet : new TenrxWallet([]);
      this.internalWalletLoaded = true;
    } catch (error) {
      TenrxLibraryLogger.error('Error while loading wallet.', error);
      this.internalWalletLoaded = false;
    }
  }

  /**
   * Re-loads the patient's information from the backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   */
  public async refreshPatientInfo(apiEngine = useTenrxApi()): Promise<void> {
    TenrxLibraryLogger.info('Refreshing patient personal information.');
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
          this.internalWalletLoaded = false;
        }
      } else {
        TenrxLibraryLogger.error('Error while loading patient data: content is null.');
        this.internalWalletLoaded = false;
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error while loading patient data.', error);
      this.internalWalletLoaded = false;
    }
  }

  /**
   * Loads patient data from backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<boolean>}
   * @memberof TenrxPatient
   */
  public async load(apiEngine = useTenrxApi()): Promise<boolean> {
    TenrxLibraryLogger.info('Loading patient data.');
    if (!this.internalWalletLoaded) {
      await this.refreshWallet(apiEngine);
    }
    if (!this.internalPatientInfoLoaded) {
      await this.refreshPatientInfo(apiEngine);
    }
    if (!this.internalOrdersLoaded) {
      await this.refreshOrders(apiEngine);
    }
    if (!this.internalAppointmentsLoaded) {
      await this.refreshAppointments();
    }
    return this.loaded;
  }

  /**
   * Refreshes all the patient information.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   */
  public async refreshInfo(apiEngine = useTenrxApi()): Promise<void> {
    TenrxLibraryLogger.info('Refreshing patient data.');
    await this.refreshWallet(apiEngine);
    await this.refreshPatientInfo(apiEngine);
    await this.refreshOrders(apiEngine);
    await this.refreshAppointments();
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
  public static initialize(data?: TenrxLoginAPIModelPatientData, walletData?: TenrxWallet): void {
    if (!TenrxPatient.internalInstance) {
      TenrxPatient.internalInstance = new TenrxPatient(data, walletData);
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

  /**
   * Saves the patient object to the backend servers.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxPatient
   * @throws {TenrxSaveError} - Throws an exception if an errors occur when saving the object.
   */
  public async save(photoBase64: string | null = null, apiEngine = useTenrxApi()): Promise<void> {
    if (this.internalPatientInfoLoaded) {
      try {
        let saveObject: TenrxUpdatePatientInfoAPIModel = {
          patientProfile: {
            userName: this.emailAddress,
            email: this.emailAddress,
            firstName: this.firstName,
            lastName: this.lastName,
            middleName: this.middleName,
            dob: this.dob.toISOString(),
            gender: this.gender,
            phoneNumber: this.phoneNumber,
          },
          patientAddress: {
            address1: this.address.address1,
            address2: this.address.address2 ? this.address.address2 : '',
            city: this.address.city,
            countryId: this.countryId,
            stateId: this.address.stateId,
            zip: this.address.zipCode,
          },
        };
        if (photoBase64) saveObject = { ...saveObject, photoBase64 };
        const patientProfileApiResponse = await apiEngine.updatePatientInfo(saveObject);
        if (patientProfileApiResponse.status !== 200) {
          TenrxLibraryLogger.error('Error while saving patient profile data.', patientProfileApiResponse.error);
          throw new TenrxSaveError(
            'Error while saving patient profile data.',
            'TenrxPatient',
            patientProfileApiResponse.error,
          );
        }
      } catch (error) {
        TenrxLibraryLogger.error('Error while saving patient data.', error);
        throw new TenrxSaveError('Error while saving patient data.', 'TenrxPatient', error);
      }
    }
  }
}
