import { TenrxLoginAPIModelData } from '../apiModel/TenrxLoginAPIModel.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Represents a Tenrx user account.
 *
 * @export
 * @class TenrxUserAccount
 */
export default class TenrxUserAccount {
  /**
   * The id of the user account.
   *
   * @type {number}
   * @memberof TenrxUserAccount
   */
  id: number;

  /**
   * This is the id of the patient. The actual patient information is PHI a must not be permanently stored in the client.
   *
   * @type {number}
   * @memberof TenrxUserAccount
   */
  patientId: number;

  /**
   * The id of the organization that the user belongs.
   *
   * @type {number}
   * @memberof TenrxUserAccount
   */
  organizationId: number;

  /**
   * The id of the role that the user belongs.
   *
   * @type {number}
   * @memberof TenrxUserAccount
   */
  roleId: number;

  /**
   * The user name of the user account.
   *
   * @type {string}
   * @memberof TenrxUserAccount
   */
  userName: string;

  /**
   * The id of the location that the user belongs.
   *
   * @type {number}
   * @memberof TenrxUserAccount
   */
  locationId: number;

  /**
   * The path of the photo for the user account.
   *
   * @type {string}
   * @memberof TenrxUserAccount
   */
  photoPath: string;

  /**
   * Creates an instance of TenrxUserAccount.
   * 
   * @param {TenrxLoginAPIModelData} data - The data to be used to create the instance.
   * @memberof TenrxUserAccount
   */
  constructor(data: TenrxLoginAPIModelData) {
    this.id = data.userID;
    this.patientId = data.id;
    this.roleId = data.roleID;
    this.organizationId = data.organizationID;
    this.userName = data.userName;
    this.locationId = data.locationID;
    this.photoPath = data.photoThumbNailPath;
  }

  /**
   * Creates an instance of the TenrxUserAccount class from a JSON string.
   *
   * @static
   * @param {string} data - The JSON string to be used to create the instance.
   * @return {*}  {TenrxUserAccount}
   * @memberof TenrxUserAccount
   */
  public static fromJSON(data: string): TenrxUserAccount {
    return Object.setPrototypeOf(JSON.parse(data), TenrxUserAccount.prototype) as TenrxUserAccount;
  }

  private static internalInstance: TenrxUserAccount;

  /**
   * Gets the TenrxUserAccount singleton class.
   *
   * @readonly
   * @static
   * @type {TenrxUserAccount}
   * @memberof TenrxUserAccount
   * @throws {TenrxNotInitialized} - Throws an exception if the class has not been initialized.
   */
  public static get instance(): TenrxUserAccount {
    if (TenrxUserAccount.internalInstance === null) {
      TenrxLibraryLogger.error('TenrxUserAccount is not initialized. Call TenrxUserAccount.initialize() first.');
      throw new TenrxNotInitialized(
        'TenrxUserAccount is not initialized. Call TenrxUserAccount.initialize() first.',
        'TenrxUserAccount',
      );
    }
    return TenrxUserAccount.internalInstance;
  }

  /**
   * Initializes the TenrxUserAccount singleton class.
   *
   * @static
   * @param {TenrxLoginAPIModelData} data - The data to be used to create the instance.
   * @memberof TenrxUserAccount
   */
  public static initialize(data: TenrxLoginAPIModelData): void {
    if (!TenrxUserAccount.internalInstance) {
      TenrxUserAccount.internalInstance = new TenrxUserAccount(data);
    } else {
      TenrxLibraryLogger.warn(
        `TenrxUserAccount has already been initialized. Call TenrxUserAccount.initialize() only once.`,
      );
    }
  }
}
