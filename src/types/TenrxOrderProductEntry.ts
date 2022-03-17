/**
 * Represents an entry of a product in an order.
 *
 * @export
 * @interface TenrxOrderProductEntry
 */
export default interface TenrxOrderProductEntry {
  /**
   * The product id.
   *
   * @type {number}
   * @memberof TenrxOrderProductEntry
   */
  productId: number;

  /**
   * The name of the product.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  productName: string;

  /**
   * A short description of the product.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  productDetails: string;

  /**
   * The number of units to be purchased of the product.
   *
   * @type {number}
   * @memberof TenrxOrderProductEntry
   */
  quantity: number;

  /**
   * The actual price of a single unit of the product.
   *
   * @type {number}
   * @memberof TenrxOrderProductEntry
   */
  price: number;

  /**
   * Total price of the product. This is price times quantity.
   *
   * @type {number}
   * @memberof TenrxOrderProductEntry
   */
  amount: number;

  /**
   * The strength of the product if any. It can be set to empty string if no strength is set.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  strength: string;

  /**
   * The category of which this product belongs to.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  category: string;

  /**
   * The treatment type of the product.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  treatmentType: string;

  /**
   * The status of the product in the order.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  status: string;

  /**
   * The photo of the actual product.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  photoPath: string;

  /**
   * The photo thumbnail path of the product.
   *
   * @type {string}
   * @memberof TenrxOrderProductEntry
   */
  photoThumbnailPath: string;

  /**
   * True if the product is a RX product and requires a prescription. False otherwise.
   *
   * @type {boolean}
   * @memberof TenrxOrderProductEntry
   */
  rx: boolean;
}
