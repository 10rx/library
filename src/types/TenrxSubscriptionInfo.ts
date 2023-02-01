import { DateTime } from 'luxon';
import { TenrxSubscriptionUnitType } from "../includes/TenrxEnums.js";

/**
 * Represents a Subscription Information.
 *
 * @export
 * @interface TenrxSubscriptionInfo
 */
export default interface TenrxSubscriptionInfo {
  /**
   * The id of the product to be subscribed.
   *
   * @type {number}
   * @memberof TenrxSubscriptionInfo
   */
  subscriptionProductId: number;

  /**
   * The id of the strength of the product to be subscribed to.
   *
   * @type {number}
   * @memberof TenrxSubscriptionInfo
   */
  subscriptionStrenghtId: number;

  /**
   * The number of days or months between subscription orders
   *
   * @type {string}
   * @memberof TenrxSubscriptionInfo
   */
  length: string;


  /**
   * Represents the unit in days or months.
   *
   * @type {TenrxSubscriptionUnitType}
   * @memberof TenrxSubscriptionInfo
   */
  unit: TenrxSubscriptionUnitType;

  /**
   * Represents the start date of the subscription.
   *
   * @type {string}
   * @memberof TenrxSubscriptionInfo
   */
  startDate: DateTime;

  /**
   * Represents how many orders for the subscription.
   *
   * @type {string}
   * @memberof TenrxSubscriptionInfo
   */
  totalOcurrences?: string;

  /**
   * 
   *
   * @type {string}
   * @memberof TenrxSubscriptionInfo
   */

  trialOcurrences?: string;
  
  /**
   * 
   *
   * @type {string}
   * @memberof TenrxSubscriptionInfo
   */
  trialPrice?: number;
}
