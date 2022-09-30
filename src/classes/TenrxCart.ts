/* eslint-disable @typescript-eslint/naming-convention */
import TenrxQuestionnaireSurveyResponseAPIModel from '../apiModel/TenrxQuestionnaireSurveyResponsesAPIModel.js';
import TenrxUploadPatientAffectedImagesAPIModel from '../apiModel/TenrxUploadPatientAffectedImagesAPIModel.js';
import { TenrxStateIdToStateName } from '../includes/TenrxStates.js';
import {
  TenrxCheckoutAPIModel,
  TenrxEnumCountry,
  TenrxLibraryLogger,
  TenrxLoadError,
  TenrxPromotion,
  TenrxPromotionError,
  TenrxQuestionnaireAnswer,
  TenrxQuestionnaireAnswerType,
  tenrxRoundTo,
  TenrxSendAnswersResult,
  TenrxStripeCreditCard,
  useTenrxApi,
  useTenrxStorage,
  TenrxUploadStagingImage,
  TenrxAPIModel,
} from '../index.js';
import TenrxCartCheckoutResult from '../types/TenrxCartCheckoutResult.js';
import TenrxCartEntry from '../types/TenrxCartEntry.js';
import TenrxPatientImage from '../types/TenrxPatientImage.js';
import TenrxSendPatientImagesResult from '../types/TenrxSendPatientImagesResult.js';
import TenrxStreetAddress from '../types/TenrxStreetAddress.js';
import TenrxExternalPharmacyInformation from '../types/TenrxExternalPharmacyInformation.js';
import TenrxProduct from './TenrxProduct.js';
import { TenrxStorageScope } from './TenrxStorage.js';
import { TenrxPharmacyType, TenrxShippingType } from '../includes/TenrxEnums.js';

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
  private internalDiscountAmount: number;
  private internalSubHiddenTotal: number;
  private internalLoaded: boolean;
  private internalShippingCost: number;
  private internalAnswers: Record<string, TenrxQuestionnaireAnswer[]>;
  private internalPatientImages: Record<string, TenrxPatientImage[]>;
  private internalPromotions: TenrxPromotion[];
  private internalExternalPharmacy = false;
  private internalStagingImages: { key: string; productID: number }[];
  private internalShippingType: TenrxShippingType;

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
    this.internalDiscountAmount = 0;
    this.internalStagingImages = [];
    this.internalShippingType = TenrxShippingType.Standard;
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
    this.clearStagingImages();
  }

  /**
   * Only clears the promotions from the cart.
   *
   * @memberof TenrxCart
   */
  public clearPromotions(): void {
    this.internalPromotions = [];
    this.internalDiscountAmount = 0;
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
  public clearAnswers(treatmentID?: number): void {
    if (treatmentID) {
      delete this.internalAnswers[treatmentID];
    } else this.internalAnswers = {};
  }

  /**
   * Only clears the patient images from the cart.
   *
   * @memberof TenrxCart
   */
  public clearPatientImages(treatmentID?: number): void {
    if (treatmentID) {
      delete this.internalPatientImages[treatmentID];
    } else this.internalPatientImages = {};
  }

  /**
   * Clear all staging images
   *
   * @memberof TenrxCart
   */
  public clearStagingImages() {
    this.internalStagingImages = [];
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
    const product = this.internalCartEntries[index];
    if (product)
      this.internalStagingImages = this.internalStagingImages.filter((i) => i.productID !== product.productId);
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
   * @param {boolean} [taxable=true] - Whether or not the item is taxable
   * @param {boolean} [addInstead=false] - Should a new entry be made instead of changing quantity
   * @param {boolean} [shipToExternalPharmacy=false] - Whether or not to ship the product to an external pharmacy.
   * @param {number} [refillID=null] - ID of prescription to refill
   * @memberof TenrxCart
   */
  public addItem(
    item: TenrxProduct,
    quantity: number,
    strength = '',
    hidden = false,
    taxable = true,
    addInstead = false,
    shipToExternalPharmacy = false,
    refillID: number | null = null,
  ): void {
    const strengthMatch = strength !== '' ? item.strengthLevels.find((x) => x.strengthLevel === strength) : undefined;

    const exists = this.internalCartEntries.find(
      (product) => product.productId === item.id && product.strength === strength,
    );

    if (exists && !addInstead) {
      exists.quantity += quantity;
    } else {
      this.addEntry({
        productId: item.id,
        productName: item.name,
        productDetails: item.description,
        treatmentTypeId: item.treatmentTypeId,
        quantity,
        price: strengthMatch ? strengthMatch.price : item.price,
        strength,
        rx: item.rx,
        taxable,
        photoPaths: item.photoPaths.filter((img) => img.length),
        hidden,
        shipToExternalPharmacy,
        refillID,
      });
    }
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
    // This is now handled by the backend.
    TenrxLibraryLogger.info('Getting tax information for items in cart.');
    const productsForTaxCalculaitons: {
      productId: number;
      quantity: number;
    }[] = [];
    this.internalCartEntries.forEach((entry) => {
      if (entry.taxable)
        productsForTaxCalculaitons.push({
          productId: entry.productId,
          quantity: entry.quantity,
        });
    });
    const taxInformation = await apiEngine.getProductTax({
      productsForTaxCalculaitons,
      shippingAddress: {
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
            totalTax: number;
            taxRate: number;
          };
        };
        if (content.apiStatus) {
          if (content.apiStatus.statusCode === 200) {
            if (content.data) {
              if (content.data.totalTax || content.data.totalTax === 0) {
                this.internalTaxRate = content.data.taxRate;
                this.internalTaxAmount = content.data.totalTax;
              } else {
                TenrxLibraryLogger.error('No tax rate found.', content.data);
                throw new TenrxLoadError('No tax rate found.', 'TenrxCart', null);
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
    // Backend now handles this logic
    if (this.internalTaxAmount < 0) {
      this.internalTaxAmount = tenrxRoundTo(
        this.internalCartEntries.reduce((acc, curr) => {
          if (!curr.taxable || (this.internalExternalPharmacy && curr.rx)) return acc;
          let price: number = curr.price;
          if (this.internalPromotions.length > 0) {
            price = price - this.internalPromotions[0].calculateOrderDiscount(price);
          }
          return acc + price * this.internalTaxRate * curr.quantity;
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
          if (curr.hidden || (this.internalExternalPharmacy && curr.rx)) return acc;
          return acc + curr.price * curr.quantity;
        }, 0),
      );
      this.internalDiscountAmount = 0;
      if (this.internalPromotions.length > 0) {
        this.internalDiscountAmount = tenrxRoundTo(
          this.internalPromotions[0].calculateOrderDiscount(this.internalSubTotal),
        );
        this.internalSubTotal = tenrxRoundTo(this.internalSubTotal - this.internalDiscountAmount);
        if (this.internalSubTotal < 0) {
          this.internalSubTotal = 0;
        }
      }
    }
    return this.internalSubTotal;
  }

  /**
   * Gets the amount discounted.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get discountAmount(): number {
    if (this.internalSubTotal < 0) {
      TenrxLibraryLogger.silly('Calculating discount amount. Forcing recalculation.', this.subTotal);
    }
    return this.internalDiscountAmount;
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
    let cost = 0;
    switch (this.internalShippingType) {
      case TenrxShippingType.Expedited:
        cost = 45;
        break;
    }
    return cost;
  }

  public get shippingType(): TenrxShippingType {
    return this.internalShippingType;
  }

  public set shippingType(value: TenrxShippingType) {
    this.internalShippingType = value;
  }

  /**
   * Proceeds to checkout the cart.
   *
   * @param {string} userName - The user name of the user who is paying for the cart.
   * @param {TenrxStripeCreditCard} card - The credit card information of the user who is paying for the cart.
   * @param {TenrxStreetAddress} shippingAddress - The shipping address of the user who is paying for the cart.
   * @param {(TenrxExternalPharmacyInformation | null)} [shipToExternalPharmacy=null] - The external pharmacy information the user wishes to ships their rx products.
   * @param {number} [timeout=10000] - How long the timeout on the request should be
   * @param {string} [patientComment=''] - The patient comment of the user who answered the questionnaire.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxCartCheckoutResult>}
   * @memberof TenrxCart
   */
  public async checkout(
    userName: string,
    card: TenrxStripeCreditCard,
    shippingAddress: TenrxStreetAddress,
    shipToExternalPharmacy: TenrxExternalPharmacyInformation | null = null,
    timeout = 10000,
    patientComment = '',
    apiEngine = useTenrxApi(),
  ) {
    const body: TenrxCheckoutAPIModel = {
      userName,
      cardId: 0,
      stripeToken: card.cardId,
      paymentCardDetails: {
        cardId: card.cardId,
        paymentMethod: card.paymentMethod,
        name: card.nameOnCard,
        addressCity: card.address.city,
        addressCountry: 'US',
        addressLine1: card.address.address1,
        addressLine2: card.address.address2 ?? null,
        addressState: TenrxStateIdToStateName[card.address.stateId],
        addressZip: card.address.zipCode,
        brand: card.brand,
        last4: card.last4,
        exp_month: Number(card.expMonth),
        exp_year: Number(card.expYear),
      },
      status: 0,
      shippingType: this.internalShippingType,
      pharmacyType: shipToExternalPharmacy ? TenrxPharmacyType.External : TenrxPharmacyType.Internal,
      couponCode: this.internalPromotions[0]?.couponCode || null,
      orderId: 0,
      shippingFees: this.shippingCost,
      patientProducts: this.cartEntries.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        strength: p.strength,
        refillID: p.refillID,
      })),
      orderShippingAddress: {
        addressLine1: shippingAddress.address1,
        addressLine2: shippingAddress.address2 ?? null,
        city: shippingAddress.city,
        state: TenrxStateIdToStateName[shippingAddress.stateId],
        zipCode: shippingAddress.zipCode,
        countryID: TenrxEnumCountry.US,
        phoneNumber: shippingAddress.phone ?? '',
      },
      externalPharmacyAddress: shipToExternalPharmacy
        ? {
            apartmentNumber: shipToExternalPharmacy.address.aptNumber ?? null,
            address1: shipToExternalPharmacy.address.address1,
            address2: shipToExternalPharmacy.address.address2 ?? null,
            city: shipToExternalPharmacy.address.city,
            stateName: TenrxStateIdToStateName[shipToExternalPharmacy.address.stateId],
            zipCode: shipToExternalPharmacy.address.zipCode,
            country: 'US',
            pharmacyName: shipToExternalPharmacy.name,
          }
        : null,
      images: this.internalStagingImages.map((image) => image.key),
    };

    const result: TenrxCartCheckoutResult = {
      checkoutSuccessful: false,
      paymentDetails: null,
      orderDetails: null,
      questionnaireDetails: null,
      patientImagesDetails: null,
    };
    try {
      const res = await apiEngine.authSavePaymentDetails(body, timeout);
      const content = res.content as {
        apiStatus: { statusCode: number; message: string };
        data: {
          orderNumber?: string;
        };
      };
      result.paymentDetails = {
        paymentSuccessful: content.apiStatus.statusCode === 200,
        paymentMessage: content.apiStatus.message,
        paymentId: 0,
        paymentStatusCode: content.apiStatus.statusCode,
      };
      result.orderDetails = {
        orderPlacementMessage: '',
        orderPlacementStatusCode: content.apiStatus.statusCode,
        orderPlacementSuccessful: content.apiStatus.statusCode === 200,
        invoiceNumber: content.data.orderNumber ?? '',
      };
    } catch (error) {
      TenrxLibraryLogger.error('cart.checkout():', error);
    }

    if (result.orderDetails?.orderPlacementSuccessful) {
      if (Object.keys(this.internalAnswers).length > 0) {
        result.questionnaireDetails = await this.sendAnswers(
          result.orderDetails.invoiceNumber,
          patientComment,
          result.orderDetails.orderPlacementSuccessful,
          apiEngine,
        );
      }
      if (Object.keys(this.internalPatientImages).length > 0) {
        result.patientImagesDetails = await this.sendPatientImages(result.orderDetails.invoiceNumber, apiEngine);
      }

      if (
        (result.patientImagesDetails?.patientImagesSent && result.questionnaireDetails?.answersSent) ||
        (!result.patientImagesDetails && !result.questionnaireDetails)
      ) {
        result.checkoutSuccessful = true;
      } else
        result.checkoutSuccessful = result.questionnaireDetails
          ? result.questionnaireDetails.answersSent
          : result.patientImagesDetails
          ? result.patientImagesDetails.patientImagesSent
          : true;
    }
    if (result.checkoutSuccessful) {
      this.clearCart();
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
        this.internalPatientImages[visitTypeId] = this.internalPatientImages[visitTypeId].concat(images);
      } else {
        this.internalPatientImages[visitTypeId] = images;
      }
    }
  }

  /**
   * Upload images to staging
   *
   * @param {TenrxUploadStagingImage[]} images
   * @param {*} [apiEngine=useTenrxApi()]
   * @return {*}
   * @memberof TenrxCart
   */
  public async uploadStagingImages(images: TenrxUploadStagingImage[], apiEngine = useTenrxApi()) {
    try {
      const response = await apiEngine.uploadStagingImages(images);
      const content = response.content as TenrxAPIModel<{ success: string[]; fail: string[] }>;
      if (content.data.success.length) {
        this.internalStagingImages.push(
          ...content.data.success.map((key) => ({ key, productID: images[0].productID })),
        );
      }
      return content.data;
    } catch (error) {
      throw error;
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
   * @param {string} orderNumber - The order number associated
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxSendPatientImagesResult>} - The result of the sending of the images.
   * @memberof TenrxCart
   */
  public async sendPatientImages(
    orderNumber: string,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxSendPatientImagesResult> {
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
              orderNumber,
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

  /**
   * Set if the order will be going to external pharmacy
   *
   * @memberof TenrxCart
   */
  public set externalPharmacy(value: boolean) {
    this.internalExternalPharmacy = value;
  }
}
