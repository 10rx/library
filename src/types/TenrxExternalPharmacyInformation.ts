import TenrxStreetAddress from './TenrxStreetAddress.js';

/**
 * Represents information regarding an external pharmacy.
 *
 * @export
 * @interface TenrxExternalPharmacyInformation
 */
export default interface TenrxExternalPharmacyInformation {
  /**
   * The name of the pharmacy.
   *
   * @type {string}
   * @memberof TenrxExternalPharmacyInformation
   */
  name: string;

  /**
   * The street address of the pharmacy.
   *
   * @type {TenrxStreetAddress}
   * @memberof TenrxExternalPharmacyInformation
   */
  address: TenrxStreetAddress;
}
