import TenrxGetCouponCodeAPIModel from '../apiModel/TenrxGetCouponCodeAPIModel.js';
import { tenrxRoundTo, useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Represents a tenrx promotion.
 *
 * @export
 * @class TenrxPromotion
 */
export default class TenrxPromotion {
  /**
   * The name of the promotion.
   *
   * @type {string}
   * @memberof TenrxPromotion
   */
  public name: string;

  /**
   * The coupon code of this promotion.
   *
   * @type {string}
   * @memberof TenrxPromotion
   */
  public couponCode: string;

  /**
   * Creates an instance of TenrxPromotion.
   *
   * @param {string} couponCode - The coupon code of this promotion.
   * @param {TenrxGetCouponCodeAPIModel} data - The data of this promotion.
   * @memberof TenrxPromotion
   */
  constructor(couponCode: string, data: TenrxGetCouponCodeAPIModel) {
    this.name = data.promotionName;
    this.couponCode = couponCode;
    // Disabling discount amount and harcoding it to 0 since we don't currently support it.
    // this.discountAmount = data.discountAmount;
    this.discountAmount = 0;
    this.discountPercent = tenrxRoundTo(data.discountPercent / 100);
  }

  private discountAmount: number;
  private discountPercent: number;

  /**
   * Calculates the discount amount of this promotion for the entire order.
   *
   * @param {number} total - The total price of the order.
   * @return {*}  {number} - The discount amount.
   * @memberof TenrxPromotion
   */
  public calculateOrderDiscount(total: number): number {
    if (this.discountAmount) {
      return this.discountAmount;
    } else if (this.discountPercent) {
      return total * this.discountPercent;
    } else {
      return 0;
    }
  }

  /**
   * Gets the promotion information of a given coupon code.
   *
   * @static
   * @param {string} couponCode - The coupon code of the promotion.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {(Promise<TenrxPromotion | null>)} - The promise that resolves to the promotion information.
   * @memberof TenrxPromotion
   */
  public static async getPromotionInformation(
    couponCode: string,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxPromotion | null> {
    try {
      const result = await apiEngine.getPromotionInformation(couponCode);
      if (result.status === 200) {
        if (result.content) {
          const content = result.content as {
            apiStatus: { statusCode: number; message: string; appError: string };
            data: TenrxGetCouponCodeAPIModel;
          };
          if (content.apiStatus) {
            const apiStatus = content.apiStatus;
            if (apiStatus.statusCode === 200) {
              if (content.data) {
                return new TenrxPromotion(couponCode, content.data);
              } else {
                TenrxLibraryLogger.error('The response data is null.');
              }
            } else {
              TenrxLibraryLogger.error('Error getting promotion information', apiStatus);
            }
          } else {
            TenrxLibraryLogger.error('The api status is null.');
          }
        } else {
          TenrxLibraryLogger.error('The response content is null.', result);
        }
      } else {
        TenrxLibraryLogger.error('TenrxPromotion.getPromotionInformation() failed', result.error);
      }
    } catch (error) {
      TenrxLibraryLogger.error(error);
    }
    return null;
  }
}
