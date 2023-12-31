import TenrxOrderPlacementResult from './TenrxOrderPlacementResult.js';
import TenrxPaymentResult from './TenrxPaymentResult.js';
import TenrxSendAnswersResult from './TenrxSendAnswersResult.js';
import TenrxSendPatientImagesResult from './TenrxSendPatientImagesResult.js';

/**
 * Represents the result of checking out the cart.
 *
 * @export
 * @interface TenrxCartCheckoutResult
 */
export default interface TenrxCartCheckoutResult {
  /**
   * True if the checkout was successful. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxCartCheckoutResult
   */
  checkoutSuccessful: boolean;

  /**
   * The payment details from the checkout.
   *
   * @type {(TenrxPaymentResult | null)}
   * @memberof TenrxCartCheckoutResult
   */
  paymentDetails: TenrxPaymentResult | null;

  /**
   * The order details from the checkout.
   *
   * @type {(TenrxOrderPlacementResult | null)}
   * @memberof TenrxCartCheckoutResult
   */
  orderDetails: TenrxOrderPlacementResult | null;

  /**
   * The answers sent from the checkout.
   *
   * @type {(TenrxSendAnswersResult | null)}
   * @memberof TenrxCartCheckoutResult
   */
  questionnaireDetails: TenrxSendAnswersResult | null;

  /**
   * The images sent from the checkout.
   *
   * @type {(TenrxSendPatientImagesResult | null)}
   * @memberof TenrxCartCheckoutResult
   */
  patientImagesDetails: TenrxSendPatientImagesResult | null;
}
