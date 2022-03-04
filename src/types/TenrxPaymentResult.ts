/**
 * Represents the result of a payment for an order.
 *
 * @export
 * @interface TenrxPaymentResult
 */
export default interface TenrxPaymentResult {
  /**
   * True if the payment was successful. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxPaymentResult
   */
  paymentSuccessful: boolean;

  /**
   * The message received from the payment servers.
   *
   * @type {string}
   * @memberof TenrxPaymentResult
   */
  paymentMessage: string;

  /**
   * The status code received from the payment servers.
   *
   * @type {number}
   * @memberof TenrxPaymentResult
   */
  paymentStatusCode: number;

  /**
   * The payment reference number received from the payment servers.
   *
   * @type {number}
   * @memberof TenrxPaymentResult
   */
  paymentId: number;
}
