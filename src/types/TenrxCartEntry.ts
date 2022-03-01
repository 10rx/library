/**
 * Represents a Tenrx cart entry.
 *
 * @export
 * @interface TenrxCartEntry
 */
export default interface TenrxCartEntry {
  /**
   * The id of the product.
   *
   * @type {number}
   * @memberof TenrxCartEntry
   */
  productId: number;

  /**
   * The name of the product.
   *
   * @type {string}
   * @memberof TenrxCartEntry
   */
  productName: string;

  /**
   * A short description of the product.
   *
   * @type {string}
   * @memberof TenrxCartEntry
   */
  productDetails: string;

  /**
   * The number of units to be purchased of the product.
   *
   * @type {number}
   * @memberof TenrxCartEntry
   */
  quantity: number;

  /**
   * The actual price of the product.
   *
   * @type {number}
   * @memberof TenrxCartEntry
   */
  price: number;

  /**
   * The strength of the product if any. It can be set to empty string if no strength is set.
   *
   * @type {string}
   * @memberof TenrxCartEntry
   */
  strength: string;

  /**
   * True if the product is an RX product and requires a prescription. False otherwise.
   *
   * @type {boolean}
   * @memberof TenrxCartEntry
   */
  rx: boolean;

  /**
   * The photo path of the product.
   *
   * @type {(string | string[])}
   * @memberof TenrxCartEntry
   */
  photoPath: string | string[];

  /**
   * True if the product is taxable.
   *
   * @type {boolean}
   * @memberof TenrxCartEntry
   */
  taxable: boolean;

  /**
   * True if the element should be hidden. Otherwise, false.
   *
   * @type {boolean}
   * @memberof TenrxCartEntry
   */
  hidden: boolean;

  // TODO add prescription connection.
}
