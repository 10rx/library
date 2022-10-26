import TenrxStreetAddress from './TenrxStreetAddress.js';
import { TenrxEnumCountry } from '../includes/TenrxEnums.js';

/**
 * Represents a credit card
 *
 * @export
 * @interface TenrxCreditCard
 */
export default interface TenrxCreditCard {
  /**
   * Stripe card ID
   *
   * @type {string | null}
   * @memberof TenrxCreditCard
   */
  cardId: string | null;

  /**
   * Stripe payment method ID
   *
   * @type {string | null}
   * @memberof TenrxCreditCard
   */
  paymentMethod: string | null;

  /**
   * Authorize.net payment ID
   *
   * @type {(string | null)}
   * @memberof TenrxCreditCard
   */
  paymentID: string | null;

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
