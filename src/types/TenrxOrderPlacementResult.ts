/**
 * Represents the result of placing an order.
 *
 * @export
 * @interface TenrxOrderPlacementResult
 */
export default interface TenrxOrderPlacementResult {
  /**
   * True if the order was placed successfully. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxOrderPlacementResult
   */
  orderPlacementSuccessful: boolean;

  /**
   * The message received from the backend servers.
   *
   * @type {string}
   * @memberof TenrxOrderPlacementResult
   */
  orderPlacementMessage: string;

  /**
   * The status code received from the backend servers.
   *
   * @type {number}
   * @memberof TenrxOrderPlacementResult
   */
  orderPlacementStatusCode: number;

  /**
   * The order reference number received from the backend servers aka the order number.
   *
   * @type {string}
   * @memberof TenrxOrderPlacementResult
   */
  invoiceNumber: string;
}
