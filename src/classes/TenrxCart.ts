import TenrxQuestionnaireSurveyResponseAPIModel from '../apiModel/TenrxQuestionnaireSurveyResponsesAPIModel.js';
import TenrxUploadPatientAffectedImagesAPIModel from '../apiModel/TenrxUploadPatientAffectedImagesAPIModel.js';
import { TenrxStateIdToStateName } from '../includes/TenrxStates.js';
import {
  TenrxApiResult,
  TenrxChargeAPIModel,
  TenrxEnumCountry,
  TenrxLibraryLogger,
  TenrxLoadError,
  TenrxPaymentResult,
  TenrxPromotion,
  TenrxPromotionError,
  TenrxQuestionnaireAnswer,
  TenrxQuestionnaireAnswerType,
  tenrxRoundTo,
  TenrxSaveProductAPIModel,
  TenrxSendAnswersResult,
  TenrxStripeCreditCard,
  useTenrxApi,
  useTenrxStorage,
} from '../index.js';
import TenrxCartCheckoutResult from '../types/TenrxCartCheckoutResult.js';
import TenrxCartEntry from '../types/TenrxCartEntry.js';
import TenrxOrderPlacementResult from '../types/TenrxOrderPlacementResult.js';
import TenrxPatientImage from '../types/TenrxPatientImage.js';
import TenrxSendPatientImagesResult from '../types/TenrxSendPatientImagesResult.js';
import TenrxStreetAddress from '../types/TenrxStreetAddress.js';
import TenrxExternalPharmacyInformation from '../types/TenrxExternalPharmacyInformation.js';
import TenrxProduct from './TenrxProduct.js';
import { TenrxStorageScope } from './TenrxStorage.js';

/**
 * Represents the tenrx cart for products, and any other information. If entries are modified directly, then forceRecalculate must be manually called in order to keep everything in sync.
 *
 * @export
 * @class TenrxCart
 */
export default class TenrxCart {
  private internalCartEntries: TenrxCartEntry[];
  private internalCartTotalItems: number;
  private internalTaxRate: number;
  private internalTaxAmount: number;
  private internalSubTotal: number;
  private internalSubHiddenTotal: number;
  private internalLoaded: boolean;
  private internalShippingCost: number;
  private internalAnswers: Record<string, TenrxQuestionnaireAnswer[]>;
  private internalPatientImages: Record<string, TenrxPatientImage[]>;
  private internalPromotions: TenrxPromotion[];

  /**
   * Creates an instance of TenrxCart.
   *
   * @param {TenrxCartEntry[]} [data=[]]
   * @memberof TenrxCart
   */
  constructor(data: TenrxCartEntry[] = []) {
    this.internalCartTotalItems = -1;
    this.internalCartEntries = data;
    this.internalTaxRate = 0.07;
    this.internalTaxAmount = -1;
    this.internalSubTotal = -1;
    this.internalSubHiddenTotal = -1;
    this.internalLoaded = false;
    this.internalShippingCost = 0;
    this.internalAnswers = {};
    this.internalPatientImages = {};
    this.internalPromotions = [];
  }

  /**
   * Clears the entire contents of the cart.
   *
   * @memberof TenrxCart
   */
  public clearCart(): void {
    this.clearAnswers();
    this.clearPatientImages();
    this.clearProducts();
    this.clearPromotions();
  }

  /**
   * Only clears the promotions from the cart.
   *
   * @memberof TenrxCart
   */
  public clearPromotions(): void {
    this.internalPromotions = [];
    this.forceRecalculate();
  }

  /**
   * Only clears the products from the cart.
   *
   * @memberof TenrxCart
   */
  public clearProducts(): void {
    this.internalCartEntries = [];
    this.forceRecalculate();
  }

  /**
   * Only clears the questionnaire answers from the cart.
   *
   * @memberof TenrxCart
   */
  public clearAnswers(): void {
    this.internalAnswers = {};
  }

  /**
   * Only clears the patient images from the cart.
   *
   * @memberof TenrxCart
   */
  public clearPatientImages(): void {
    this.internalPatientImages = {};
  }

  /**
   * Gets all the promotions currently applied to the cart.
   *
   * @readonly
   * @type {TenrxPromotion[]}
   * @memberof TenrxCart
   */
  public get promotions(): TenrxPromotion[] {
    return this.internalPromotions;
  }

  /**
   * Applies a promotion to the cart.
   *
   * @param {TenrxPromotion} promotion - The promotion to apply.
   * @memberof TenrxCart
   */
  public applyPromotion(promotion: TenrxPromotion) {
    this.internalPromotions.push(promotion);
    this.forceRecalculate();
  }

  /**
   * Applies a coupon to the cart using a coupon code. This function is async because it performs a call to the tenrx api to get the promotion information.
   *
   * @param {string} couponCode - The coupon code to apply.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<boolean>} - True if the coupon was applied, false if it was not.
   * @throws {TenrxPromotionError} - Throws an error if an error occurred while trying to get information regarding the promotion.
   * @memberof TenrxCart
   */
  public async applyCouponCode(couponCode: string, apiEngine = useTenrxApi()): Promise<boolean> {
    try {
      const promotion = await TenrxPromotion.getPromotionInformation(couponCode, apiEngine);
      if (promotion != null) {
        this.applyPromotion(promotion);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      TenrxLibraryLogger.error('Failed to apply coupon code', error);
      throw new TenrxPromotionError('Failed to apply coupon code.', error);
    }
  }

  /**
   * Gets the total number of items in the cart.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get cartTotalItems(): number {
    if (this.internalTaxAmount < 0) {
      this.internalCartTotalItems = this.internalCartEntries.reduce((acc, cur) => acc + cur.quantity, 0);
    }
    return this.internalCartTotalItems;
  }

  /**
   * Removes an entry from the cart.
   *
   * @param {number} index - The index of the entry to remove.
   * @memberof TenrxCart
   */
  public removeEntry(index: number): void {
    this.internalCartEntries.splice(index, 1);
    this.forceRecalculate();
  }

  /**
   * Removes a promotion at a given index from the cart.
   *
   * @param {number} index
   * @memberof TenrxCart
   */
  public removePromotion(index: number): void {
    this.internalPromotions.splice(index, 1);
    this.forceRecalculate();
  }

  /**
   * Gets the cart entries.
   *
   * @readonly
   * @type {TenrxCartEntry[]}
   * @memberof TenrxCart
   */
  public get items(): TenrxCartEntry[] {
    return this.internalCartEntries;
  }

  /**
   * Adds a product to the cart using an cart entry object.
   *
   * @param {TenrxCartEntry} item - The entry to add to the cart.
   * @memberof TenrxCart
   */
  public addEntry(item: TenrxCartEntry): void {
    this.internalCartEntries.push(item);
    this.forceRecalculate();
  }

  /**
   * Adds a product to the cart using a product class.
   *
   * @param {TenrxProduct} item - The product to add to the cart.
   * @param {number} quantity - The quantity of the product to add to the cart.
   * @param {string} [strength=''] - The strength of the product to add to the cart.
   * @param {boolean} [hasPrescriptionAttached=false] - Whether or not the product has a prescription attached.
   * @param {boolean} [hidden=false] - Whether or not the product is hidden.
   * @param {boolean} [shipToExternalPharmacy=false] - Whether or not to ship the product to an external pharmacy.
   * @memberof TenrxCart
   */
  public addItem(
    item: TenrxProduct,
    quantity: number,
    strength = '',
    hidden = false,
    shipToExternalPharmacy = false,
  ): void {
    const strengthMatch = strength !== '' ? item.strengthLevels.find((x) => x.strengthLevel === strength) : undefined;
    this.addEntry({
      productId: item.id,
      productName: item.name,
      productDetails: item.description,
      quantity,
      price: strengthMatch ? strengthMatch.price : item.price,
      strength,
      rx: item.rx,
      taxable: true, // This will be handled later when calculating the tax. Tax depends on zip code.
      photoPath: item.photoPath,
      hidden,
      shipToExternalPharmacy,
    });
  }

  /**
   * Calculates the tax for the cart. Gets the tax rate and determines if each item is taxable or not.
   *
   * @param {TenrxStreetAddress} address - The address where the item is being shipped. This is used to calculate the tax and determine if each item is taxable or not.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<void>}
   * @throws {TenrxLoadError} - Thrown if there is an issue with the API.
   * @memberof TenrxCart
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getTaxInformation(address: TenrxStreetAddress, apiEngine = useTenrxApi()): Promise<void> {
    // TODO - Implement additive tax.
    TenrxLibraryLogger.info('Getting tax information for items in cart.');
    const productsForTaxCalculaitons: {
      productId: number;
      price: number;
    }[] = [];
    this.internalCartEntries.forEach((entry) => {
      productsForTaxCalculaitons.push({
        productId: entry.productId,
        price: entry.price,
      });
    });
    const taxInformation = await apiEngine.getProductTax({
      productsForTaxCalculaitons,
      shipingAddress: {
        apartmentNumber: address.aptNumber,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        stateName: TenrxStateIdToStateName[address.stateId],
        country: 'US',
        zipCode: address.zipCode,
      },
    });
    if (taxInformation.status === 200) {
      if (taxInformation.content) {
        const content = taxInformation.content as {
          apiStatus: { statusCode: number; message: string };
          data: {
            productTaxResponse: { productId: number; isTaxable: boolean }[];
            totalTax: number;
            additiveTax: number;
            taxRate: number;
          };
        };
        if (content.apiStatus) {
          if (content.apiStatus.statusCode === 200) {
            if (content.data) {
              if (content.data.totalTax) {
                this.internalTaxRate = content.data.taxRate;
                TenrxLibraryLogger.warn(this.internalTaxRate);
              } else {
                TenrxLibraryLogger.error('No tax rate found.', content.data);
                throw new TenrxLoadError('No tax rate found.', 'TenrxCart', null);
              }
              if (content.data.productTaxResponse) {
                this.internalCartEntries.forEach((entry) => {
                  const taxResponse = content.data.productTaxResponse.find((x) => x.productId === entry.productId);
                  if (taxResponse) {
                    entry.taxable = taxResponse.isTaxable;
                  }
                });
                this.forceRecalculate();
              } else {
                TenrxLibraryLogger.error('No product tax response found.', content.data);
                throw new TenrxLoadError('No product tax response found.', 'TenrxCart', null);
              }
            } else {
              TenrxLibraryLogger.error('No tax data found.', content);
              throw new TenrxLoadError('No tax data found.', 'TenrxCart', null);
            }
          } else {
            TenrxLibraryLogger.error('Error getting tax information.', content.apiStatus);
            throw new TenrxLoadError('Error getting tax information.', 'TenrxCart', null);
          }
        } else {
          TenrxLibraryLogger.error('Tax information apiStatus is null.', content);
          throw new TenrxLoadError('Tax information apiStatus is null.', 'TenrxCart', taxInformation.error);
        }
      } else {
        TenrxLibraryLogger.error('Tax information content is null.');
        throw new TenrxLoadError('Tax information content is null.', 'TenrxCart', taxInformation.error);
      }
    } else {
      TenrxLibraryLogger.error('Error getting tax information for items in cart. Status is not 200.', taxInformation);
      throw new TenrxLoadError(
        'Error getting tax information for items in cart. Status is not 200.',
        'TenrxCart',
        taxInformation.error,
      );
    }
  }

  /**
   * Calculates the amount of tax that has to be paid for the cart.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get tax(): number {
    if (this.internalTaxAmount < 0) {
      this.internalTaxAmount = tenrxRoundTo(
        this.internalCartEntries.reduce((acc, curr) => {
          if (curr.taxable) {
            return acc + curr.price * this.internalTaxRate;
          }
          return acc;
        }, 0),
      );
    }
    return this.internalTaxAmount;
  }

  /**
   * Calculates the subtotal of the visible items in the cart.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get subTotal(): number {
    if (this.internalSubTotal < 0) {
      this.internalSubTotal = tenrxRoundTo(
        this.internalCartEntries.reduce((acc, curr) => {
          if (!curr.hidden) {
            return acc + curr.price * curr.quantity;
          }
          return acc;
        }, 0),
      );
      if (this.internalPromotions.length > 0) {
        this.internalSubTotal = tenrxRoundTo(
          this.internalSubTotal - this.internalPromotions[0].calculateOrderDiscount(this.internalSubTotal),
        );
        if (this.internalSubTotal < 0) {
          this.internalSubTotal = 0;
        }
      }
    }
    return this.internalSubTotal;
  }

  /**
   * Calculates the subtotal of the cart, but only for the hidden items.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get subHiddenTotal(): number {
    if (this.internalSubHiddenTotal < 0) {
      this.internalSubHiddenTotal = tenrxRoundTo(
        this.internalCartEntries.reduce((acc, curr) => {
          if (curr.hidden) {
            return acc + curr.price * curr.quantity;
          }
          return acc;
        }, 0),
      );
    }
    return this.internalSubHiddenTotal;
  }

  /**
   * Gets the total of the cart including both visible and invisible items plus tax and shipping cost.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get total(): number {
    return this.subTotal + this.tax + this.subHiddenTotal + this.shippingCost;
  }

  /**
   * Gets the total of the cart including only visible items plus tax and shipping cost.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get totalVisible(): number {
    return this.subTotal + this.tax + this.shippingCost;
  }

  /**
   * Forces the recalculation of the cart.
   *
   * @memberof TenrxCart
   */
  public forceRecalculate(): void {
    this.internalTaxAmount = -1;
    this.internalSubTotal = -1;
    this.internalSubHiddenTotal = -1;
    this.internalCartTotalItems = -1;
  }

  /**
   * Gets the cart content of the cart.
   *
   * @readonly
   * @type {TenrxCartEntry[]}
   * @memberof TenrxCart
   */
  public get cartEntries(): TenrxCartEntry[] {
    return this.internalCartEntries;
  }
  /**
   * Gets the shipping cost.
   *
   * @type {number}
   * @memberof TenrxCart
   */
  public get shippingCost(): number {
    return this.internalShippingCost;
  }

  /**
   * Sets the shipping cost.
   *
   * @memberof TenrxCart
   */
  public set shippingCost(value: number) {
    this.internalShippingCost = value;
  }

  /**
   * Sends payment for the cart's content.
   *
   * @param {string} userName - The user name of the user who is paying for the cart.
   * @param {TenrxStripeCreditCard} card - The credit card information of the user who is paying for the cart.
   * @param {boolean} [isGuest=false] - Whether or not the user is a guest.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxPaymentResult>}
   * @memberof TenrxCart
   */
  public async sendPayment(
    userName: string,
    card: TenrxStripeCreditCard,
    shippingAddress: TenrxStreetAddress,
    isGuest = false,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxPaymentResult> {
    const result: TenrxPaymentResult = {
      paymentMessage: 'Unable to process payment.',
      paymentSuccessful: false,
      paymentStatusCode: 500,
      paymentId: 0,
    };
    TenrxLibraryLogger.info('Sending payment details to backend servers.');
    try {
      const charge: TenrxChargeAPIModel = {
        userName,
        cardId: 0,
        stripeToken: card.cardId,
        status: 0,
        paymentCardDetails: {
          cardId: card.cardId,
          paymentMethod: card.paymentMethod,
          name: card.nameOnCard,
          addressCity: card.address.city,
          addressCountry: TenrxEnumCountry[TenrxEnumCountry.US],
          addressLine1: card.address.address1,
          addressLine2: card.address.address2 ? card.address.address2 : '',
          addressState: TenrxStateIdToStateName[card.address.stateId],
          addressZip: card.address.zipCode,
          brand: card.brand,
          country: TenrxEnumCountry[TenrxEnumCountry.US],
          last4: card.last4,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          exp_month: card.expMonth,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          exp_year: card.expYear,
        },
        price: [],
        amount: this.total,
      };
      let paymentResponse: TenrxApiResult;
      if (isGuest) {
        paymentResponse = await apiEngine.savePaymentDetails(charge);
      } else {
        paymentResponse = await apiEngine.authSavePaymentDetails(charge);
      }
      if (paymentResponse.content) {
        const content = paymentResponse.content as {
          apiStatus: { statusCode: number; message: string };
          data: number;
        };
        if (content.apiStatus) {
          TenrxLibraryLogger.info('Payment servers responded: ' + content.apiStatus.message);
          result.paymentMessage = content.apiStatus.message;
          result.paymentStatusCode = content.apiStatus.statusCode;
          result.paymentId = content.data;
          if (content.apiStatus.statusCode === 200) {
            result.paymentSuccessful = true;
          }
        } else {
          TenrxLibraryLogger.error('sendPayment() apiStatus is null:', content);
        }
      } else {
        TenrxLibraryLogger.error('sendPayment() content is null:', paymentResponse.error);
      }
    } catch (error) {
      TenrxLibraryLogger.error('sendPayment(): ', error);
      result.paymentMessage = 'Exception has occurred when processing checkout: ' + JSON.stringify(error);
    }

    return result;
  }

  /**
   * Proceeds to checkout the cart. It calls both sendPayment and placeOrder functions in the correct order.
   *
   * @param {string} userName - The user name of the user who is paying for the cart.
   * @param {TenrxStripeCreditCard} card - The credit card information of the user who is paying for the cart.
   * @param {TenrxStreetAddress} shippingAddress - The shipping address of the user who is paying for the cart.
   * @param {number} patientId - The patient id of the user who is paying for the cart.
   * @param {boolean} [isGuest=false] - Whether or not the user is a guest.
   * @param {(TenrxExternalPharmacyInformation | null)} [shipToExternalPharmacy=null] - The external pharmacy information the user wishes to ships their rx products.
   * @param {number} [patientComment=''] - The patient comment of the user who answered the questionnaire.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxCartCheckoutResult>}
   * @memberof TenrxCart
   */
  public async checkout(
    userName: string,
    card: TenrxStripeCreditCard,
    shippingAddress: TenrxStreetAddress,
    patientId: number,
    isGuest = false,
    shipToExternalPharmacy: TenrxExternalPharmacyInformation | null = null,
    patientComment = '',
    apiEngine = useTenrxApi(),
  ): Promise<TenrxCartCheckoutResult> {
    TenrxLibraryLogger.info('Checking out cart.');
    const result: TenrxCartCheckoutResult = {
      checkoutSuccessful: false,
      paymentDetails: null,
      orderDetails: null,
      questionnaireDetails: null,
      patientImagesDetails: null,
    };
    try {
      result.paymentDetails = await this.sendPayment(userName, card, shippingAddress, isGuest, apiEngine);
    } catch (error) {
      TenrxLibraryLogger.error('cart.checkout().sendPayment(): ', error);
    }
    if (result.paymentDetails) {
      if (result.paymentDetails.paymentSuccessful) {
        try {
          result.orderDetails = await this.placeOrder(
            result.paymentDetails.paymentId,
            userName,
            shippingAddress,
            isGuest,
            shipToExternalPharmacy,
            apiEngine,
          );
        } catch (error) {
          TenrxLibraryLogger.error('cart.checkout().placeOrder():', error);
        }
        if (result.orderDetails) {
          if (result.orderDetails.orderPlacementSuccessful) {
            if (!isGuest) {
              if (Object.keys(this.internalAnswers).length > 0) {
                result.questionnaireDetails = await this.sendAnswers(
                  result.orderDetails.invoiceNumber,
                  patientComment,
                  result.paymentDetails.paymentSuccessful,
                  apiEngine,
                );
              }
              if (Object.keys(this.internalPatientImages).length > 0) {
                result.patientImagesDetails = await this.sendPatientImages(patientId, apiEngine);
              }
            }
            // TODO this next section needs to be cleaned up. We need to find a more clean logic for this.
            if (result.patientImagesDetails && result.questionnaireDetails) {
              if (result.patientImagesDetails.patientImagesSent && result.questionnaireDetails.answersSent) {
                result.checkoutSuccessful = true;
              }
            } else {
              if (result.patientImagesDetails == null && result.questionnaireDetails == null) {
                result.checkoutSuccessful = true;
              } else {
                if (result.questionnaireDetails == null) {
                  result.checkoutSuccessful = result.patientImagesDetails
                    ? result.patientImagesDetails.patientImagesSent
                    : true;
                } else {
                  result.checkoutSuccessful = result.questionnaireDetails.answersSent;
                }
              }
            }
          }
        }
      }
    }
    if (result.checkoutSuccessful) {
      this.clearCart();
    }
    return result;
  }

  /**
   * Places an order for the cart's content to the backend servers.
   *
   * @param {number} paymentId - The payment id of the payment that is being used to place the order.
   * @param {string} userName - The username of the person placing the order.
   * @param {TenrxStreetAddress} shippingAddress - The shipping address of the user who is placing the order.
   * @param {boolean} [isGuest=false]  - Whether or not the user is a guest.
   * @param {(TenrxExternalPharmacyInformation | null)} [shipToExternalPharmacy=null] - The external pharmacy information the user wishes to ships their rx products.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxOrderPlacementResult>}
   * @memberof TenrxCart
   */
  public async placeOrder(
    paymentId: number,
    userName: string,
    shippingAddress: TenrxStreetAddress,
    isGuest = false,
    shipToExternalPharmacy: TenrxExternalPharmacyInformation | null = null,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxOrderPlacementResult> {
    TenrxLibraryLogger.info('Placing order.');
    const result: TenrxOrderPlacementResult = {
      orderPlacementMessage: 'Unable to place order.',
      orderPlacementSuccessful: false,
      orderPlacementStatusCode: 500,
      invoiceNumber: '',
    };
    const medicationProduct: {
      id: number;
      productName: string;
      productDetails: string;
      quantity: number;
      price: number;
      productId: number;
      strength: string;
    }[] = [];
    this.cartEntries.forEach((entry) => {
      medicationProduct.push({
        id: 0,
        productName: entry.productName,
        productDetails: entry.productDetails,
        quantity: entry.quantity,
        price: entry.price,
        productId: entry.productId,
        strength: entry.strength,
      });
    });
    try {
      const order: TenrxSaveProductAPIModel = {
        paymentId,
        totalPrice: this.total,
        medicationProducts: medicationProduct,
        userName,
        shippingAddress: {
          apartmentNumber: shippingAddress.aptNumber,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          stateName: TenrxStateIdToStateName[shippingAddress.stateId],
          zipCode: shippingAddress.zipCode,
          country: 'US',
        },
      };
      if (this.internalPromotions.length > 0) {
        // TODO backend needs to support multiple promotions. Right now, we grab the first one and that's it.
        order.couponCode = this.internalPromotions[0].couponCode;
      }
      if (shipToExternalPharmacy)
        order.externalPharmacyAddress = {
          apartmentNumber: shipToExternalPharmacy.address.aptNumber,
          address1: shipToExternalPharmacy.address.address1,
          address2: shipToExternalPharmacy.address.address2,
          city: shipToExternalPharmacy.address.city,
          stateName: TenrxStateIdToStateName[shipToExternalPharmacy.address.stateId],
          zipCode: shipToExternalPharmacy.address.zipCode,
          country: 'US',
          pharmacyName: shipToExternalPharmacy.name,
        };
      let orderDetails: TenrxApiResult;
      if (isGuest) {
        orderDetails = await apiEngine.saveProduct(order);
      } else {
        orderDetails = await apiEngine.authSaveProduct(order);
      }
      if (orderDetails.content) {
        const content = orderDetails.content as {
          apiStatus: { statusCode: number; message: string };
          data: { invoiceNumber: string };
        };
        if (content.apiStatus) {
          TenrxLibraryLogger.info('Order servers responded: ' + content.apiStatus.message);
          result.orderPlacementMessage = content.apiStatus.message;
          result.orderPlacementStatusCode = content.apiStatus.statusCode;
          if (content.apiStatus.statusCode === 200) {
            if (content.data) {
              result.invoiceNumber = content.data.invoiceNumber;
              result.orderPlacementSuccessful = true;
            } else {
              TenrxLibraryLogger.error('placeOrder() data is null:', content);
            }
          }
        } else {
          TenrxLibraryLogger.error('placeOrder() apiStatus is null:', content);
        }
      } else {
        TenrxLibraryLogger.error('placeOrder() content is null:', orderDetails.error);
      }
    } catch (error) {
      TenrxLibraryLogger.error('placeOrder(): ', error);
      result.orderPlacementMessage = 'Exception has occurred when placing the order: ' + JSON.stringify(error);
    }
    return result;
  }

  /**
   * Returns true if there is an answer for a specific visit type id. Otherwise, false
   *
   * @param {number} visitTypeId - The visit type id to check.
   * @return {*}  {boolean} - True if there is an answer for the visit type id, otherwise false.
   * @memberof TenrxCart
   */
  public isThereAnAnswerForVisitTypeId(visitTypeId: number): boolean {
    let result = false;
    if (this.internalAnswers) {
      if (this.internalAnswers[visitTypeId]) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Attaches a single patient image to the cart for the specified visit type id.
   *
   * @param {number} visitTypeId - The visit type id to attach the image to.
   * @param {TenrxPatientImage} image - The image to attach.
   * @memberof TenrxCart
   */
  public attachSinglePatientImage(visitTypeId: number, image: TenrxPatientImage): void {
    if (this.internalPatientImages) {
      if (this.internalPatientImages[visitTypeId]) {
        this.internalPatientImages[visitTypeId].push(image);
      } else {
        this.internalPatientImages[visitTypeId] = [image];
      }
    }
  }

  /**
   * Attaches a list of patient images to the cart for the specified visit type id.
   *
   * @param {number} visitTypeId - The visit type id to attach the images to.
   * @param {TenrxPatientImage[]} images - The images to attach.
   * @memberof TenrxCart
   */
  public attachPatientImages(visitTypeId: number, images: TenrxPatientImage[]): void {
    if (this.internalPatientImages) {
      if (this.internalPatientImages[visitTypeId]) {
        this.internalPatientImages[visitTypeId].concat(images);
      } else {
        this.internalPatientImages[visitTypeId] = images;
      }
    }
  }

  /**
   * Attaches the answers of the questionnaires to the cart per visit type.
   *
   * @param {number} visitTypeId
   * @param {TenrxQuestionnaireAnswerOption[]} answers
   * @memberof TenrxCart
   */
  public attachAnswers(visitTypeId: number, answers: TenrxQuestionnaireAnswer[]) {
    this.internalAnswers[visitTypeId] = answers;
  }

  /**
   * Sends the patient images to the backend servers.
   *
   * @param {number} patientId - The id of the patient who is sending the images.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxSendPatientImagesResult>} - The result of the sending of the images.
   * @memberof TenrxCart
   */
  public async sendPatientImages(patientId: number, apiEngine = useTenrxApi()): Promise<TenrxSendPatientImagesResult> {
    const result: TenrxSendPatientImagesResult = {
      patientImagesSentMessage: 'Unable to send patient images.',
      patientImagesSent: false,
      patientImagesSentStatusCode: 500,
    };
    if (this.internalPatientImages) {
      const patientImagesApiPayloads: TenrxUploadPatientAffectedImagesAPIModel[] = [];
      try {
        Object.keys(this.internalPatientImages).forEach((visitTypeId) => {
          if (this.internalPatientImages[visitTypeId] && this.internalPatientImages[visitTypeId].length > 0) {
            patientImagesApiPayloads.push({
              patientId,
              visitTypeId: Number(visitTypeId),
              patientImages: this.internalPatientImages[visitTypeId],
            });
          }
        });

        if (patientImagesApiPayloads.length > 0) {
          for (const patientImagesApiPayload of patientImagesApiPayloads) {
            const sendPatientImagesResult = await apiEngine.uploadPatientAffectedImages(patientImagesApiPayload);
            if (sendPatientImagesResult.content) {
              const content = sendPatientImagesResult.content as {
                apiStatus: { statusCode: number; message: string };
              };
              if (content.apiStatus) {
                TenrxLibraryLogger.info('sendPatientImages() servers responded: ' + content.apiStatus.message);
                result.patientImagesSentMessage = content.apiStatus.message;
                result.patientImagesSentStatusCode = content.apiStatus.statusCode;
                if (content.apiStatus.statusCode === 200) {
                  result.patientImagesSent = true;
                } else {
                  break;
                }
              } else {
                TenrxLibraryLogger.error('sendPatientImages() apiStatus is null:', content);
              }
            } else {
              TenrxLibraryLogger.error('sendPatientImages() content is null:', sendPatientImagesResult.error);
            }
          }
        }
      } catch (error) {
        TenrxLibraryLogger.error('sendPatientImages(): ', error);
        result.patientImagesSentMessage =
          'Exception has occurred when sending patient images: ' + JSON.stringify(error);
      }
    }
    return result;
  }

  /**
   * Sends the answers of the questionnaires to the backend servers.
   *
   * @param {string} orderNumber - The order number of the order that this questionnaire answers belong to.
   * @param {string} patientComment - The patient comment of the order that this questionnaire answers belong to.
   * @param {boolean} paymentStatus - The payment status of the order that this questionnaire answers belong to. True if the payment is successful, false otherwise.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxSendAnswersResult>} - The result of the sending of the answers.
   * @memberof TenrxCart
   */
  public async sendAnswers(
    orderNumber: string,
    patientComment: string,
    paymentStatus: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    apiEngine = useTenrxApi(), // Disabling linter to avoid compile issues
  ): Promise<TenrxSendAnswersResult> {
    TenrxLibraryLogger.info('Sending answers.');
    const result: TenrxSendAnswersResult = {
      answersSent: false,
      answersSentMessage: 'Unable to send answers.',
      answersSentStatusCode: 500,
    };
    if (Object.keys(this.internalAnswers).length > 0) {
      try {
        const visitTypeIds: { visitTypeId: number }[] = [];
        const answers: TenrxQuestionnaireSurveyResponseAPIModel[] = [];
        Object.keys(this.internalAnswers).forEach((visitTypeId) => {
          visitTypeIds.push({ visitTypeId: Number(visitTypeId) });
          this.internalAnswers[visitTypeId].forEach((answer) => {
            const baseAnswer: TenrxQuestionnaireSurveyResponseAPIModel = {
              answerValue: 'Invalid response',
              questionMasterId: answer.questionId,
            };
            switch (answer.questionType) {
              case TenrxQuestionnaireAnswerType.TEXT:
                baseAnswer.answerValue =
                  answer.answers.length > 0 ? answer.answers[0].optionValue : 'Invalid response.';
                answers.push(baseAnswer);
                break;
              case TenrxQuestionnaireAnswerType.YESORNO:
              case TenrxQuestionnaireAnswerType.MULTIPLECHOICE:
                baseAnswer.answerValue =
                  answer.answers.length > 0 ? answer.answers[0].optionValue : 'Invalid response.';
                answers.push(baseAnswer);
                break;
              case TenrxQuestionnaireAnswerType.MULTIPLESELECT:
                answer.answers.forEach((answerOption) => {
                  const answerCopy = Object.assign({}, baseAnswer);
                  answerCopy.answerValue = answerOption.optionValue;
                  answers.push(answerCopy);
                });
                break;
            }
          });
        });
        const sendAnswers = await apiEngine.saveAnswers(orderNumber, patientComment, paymentStatus, answers);
        if (sendAnswers.content) {
          const content = sendAnswers.content as {
            apiStatus: {
              message: string;
              statusCode: number;
            };
          };
          const apiStatus = content.apiStatus;
          if (apiStatus) {
            TenrxLibraryLogger.info('Answers servers responded: ' + apiStatus.message);
            result.answersSentMessage = apiStatus.message;
            result.answersSentStatusCode = apiStatus.statusCode;
            if (apiStatus.statusCode === 200) {
              result.answersSent = true;
            }
          } else {
            TenrxLibraryLogger.error('Answers apiStatus is null:', content);
          }
        } else {
          TenrxLibraryLogger.error('sendAnswers() content is null:', sendAnswers.error);
        }
      } catch (error) {
        TenrxLibraryLogger.error('sendAnswers(): ', error);
        result.answersSentMessage = 'Exception has occurred when sending answers: ' + JSON.stringify(error);
      }
    }
    return result;
  }

  /**
   * Returns true if the cart has been loaded by calling either load or loadAsync functions. Otherwise returns false.
   *
   * @readonly
   * @type {boolean}
   * @memberof TenrxCart
   */
  public get loaded(): boolean {
    return this.internalLoaded;
  }

  /**
   * Saves the cart to the local storage asynchronous.
   *
   * @param {TenrxStorageScope} [scope='persistent'] - The scope of the storage.
   * @param {*} [storage=useTenrxStorage()] - The storage to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxCart
   */
  public async save(scope: TenrxStorageScope = 'session', storage = useTenrxStorage()): Promise<void> {
    TenrxLibraryLogger.info('Saving cart entries asynchronous.');
    await storage.save(scope, 'cart', this.internalCartEntries);
  }

  /**
   * Loads the cart from the local storage asynchronous.
   *
   * @param {TenrxStorageScope} [scope='session'] - The scope of the storage.
   * @param {*} [storage=useTenrxStorage()] - The storage to use.
   * @return {*}  {Promise<void>}
   * @memberof TenrxCart
   */
  public async load(scope: TenrxStorageScope = 'session', storage = useTenrxStorage()): Promise<void> {
    TenrxLibraryLogger.info('Loading cart entries asynchronous.');
    const cartEntries = await storage.load<TenrxCartEntry[]>(scope, 'cart');
    if (cartEntries) {
      this.internalCartEntries = cartEntries;
    } else {
      this.internalCartEntries = [];
    }
    this.internalLoaded = true;
  }

  /**
   * Saves the cart to the local storage synchronous.
   *
   * @param {TenrxStorageScope} [scope='session'] - The scope of the storage.
   * @param {*} [storage=useTenrxStorage()] - The storage to use.
   * @memberof TenrxCart
   */
  public saveSync(scope: TenrxStorageScope = 'session', storage = useTenrxStorage()): void {
    TenrxLibraryLogger.info('Saving cart entries synchronous.');
    storage.saveSync(scope, 'cart', this.internalCartEntries);
  }

  /**
   * Loads the cart from the local storage synchronous.
   *
   * @param {TenrxStorageScope} [scope='session'] - The scope of the storage.
   * @param {*} [storage=useTenrxStorage()] - The storage to use.
   * @memberof TenrxCart
   */
  public loadSync(scope: TenrxStorageScope = 'session', storage = useTenrxStorage()): void {
    TenrxLibraryLogger.info('Loading cart entries synchronous.');
    const cartEntries = storage.loadSync<TenrxCartEntry[]>(scope, 'cart');
    if (cartEntries) {
      this.internalCartEntries = cartEntries;
    } else {
      this.internalCartEntries = [];
    }
    this.internalLoaded = true;
  }

  private static internalInstance: TenrxCart | null;

  /**
   * Gets the singleton instance of the cart.
   *
   * @readonly
   * @static
   * @type {TenrxCart}
   * @memberof TenrxCart
   */
  public static get instance(): TenrxCart {
    if (!TenrxCart.internalInstance) {
      TenrxCart.internalInstance = new TenrxCart();
    }
    return TenrxCart.internalInstance;
  }
}
