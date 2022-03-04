import TenrxOrderPlacementResult from "./TenrxOrderPlacementResult.js";
import TenrxPaymentResult from "./TenrxPaymentResult.js";

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
}