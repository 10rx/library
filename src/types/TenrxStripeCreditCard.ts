import TenrxStreetAddress from './TenrxStreetAddress.js';
import { TenrxEnumCountry } from '../includes/TenrxEnums.js';

/**
 * Represents a credit card
 *
 * @export
 * @interface TenrxCreditCard
 */
export default interface TenrxStripeCreditCard {
  /**
   * The id of the credit card. This is normally the stripe token.
   *
   * @type {string}
   * @memberof TenrxCreditCard
   */
  cardId: string;

  /**
   * The payment method. This is usually from Stripe.
   *
   * @type {string}
   * @memberof TenrxCreditCard
   */
  paymentMethod: string;

  /**
   * The name on the card.
   *
   * @type {string}
   * @memberof TenrxStripeCreditCard
   */
  nameOnCard: string;

  /**
   * The last four digits of the credit card.
   *
   * @type {string}
   * @memberof TenrxStripeCreditCard
   */
  last4: string;

  /**
   * The card's expiration month.
   *
   * @type {string}
   * @memberof TenrxStripeCreditCard
   */
  expMonth: string;

  /**
   * The card's expiration year.
   *
   * @type {string}
   * @memberof TenrxStripeCreditCard
   */
  expYear: string;

  /**
   * The brand of the card. (e.g. Visa, Mastercard, Discover, etc.)
   *
   * @type {string}
   * @memberof TenrxStripeCreditCard
   */
  brand: string;

  /**
   * The billing address of the card.
   *
   * @type {TenrxStreetAddress}
   * @memberof TenrxStripeCreditCard
   */
  address: TenrxStreetAddress;

  /**
   * The country of the card.
   *
   * @type {TenrxEnumCountry}
   * @memberof TenrxStripeCreditCard
   */
  country: TenrxEnumCountry;
}
