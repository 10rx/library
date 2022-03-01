/**
 * Represents a Tenrx medication strength entry of a product.
 *
 * @export
 * @interface TenrxMedicationStrength
 */
export default interface TenrxMedicationStrength {
  /**
   * Represents the strength of the medication.
   *
   * @type {string}
   * @memberof TenrxMedicationStrength
   */
  strengthLevel: string;
  /**
   * Represents the description of the product at this strength.
   *
   * @type {string}
   * @memberof TenrxMedicationStrength
   */
  description: string;
  /**
   * Represents the price of the product at this strength.
   *
   * @type {number}
   * @memberof TenrxMedicationStrength
   */
  price: number;
  /**
   * Represents the barcode of a product at this strength.
   *
   * @type {string}
   * @memberof TenrxMedicationStrength
   */
  barcode: string;
}
