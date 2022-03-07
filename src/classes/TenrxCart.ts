import { TenrxStateIdToStateName } from '../includes/TenrxStates.js';
import {
  TenrxEnumCountry,
  TenrxLibraryLogger,
  TenrxPaymentResult,
  tenrxRoundTo,
  TenrxStripeCreditCard,
  useTenrxApi,
  useTenrxStorage,
} from '../index.js';
import TenrxCartCheckoutResult from '../types/TenrxCartCheckoutResult.js';
import TenrxCartEntry from '../types/TenrxCartEntry.js';
import TenrxOrderPlacementResult from '../types/TenrxOrderPlacementResult.js';
import TenrxStreetAddress from '../types/TenrxStreetAddress.js';
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

  /**
   * Creates an instance of TenrxCart.
   *
   * @param {TenrxCartEntry[]} [data=[]]
   * @memberof TenrxCart
   */
  constructor(data: TenrxCartEntry[] = []) {
    this.internalCartTotalItems = -1;
    this.internalCartEntries = data;
    this.internalTaxRate = 0.06;
    this.internalTaxAmount = -1;
    this.internalSubTotal = -1;
    this.internalSubHiddenTotal = -1;
    this.internalLoaded = false;
    this.internalShippingCost = 0;
  }

  /**
   * Clears the contents of the cart.
   *
   * @memberof TenrxCart
   */
  public clearCart(): void {
    this.internalCartEntries = [];
    this.forceRecalculate();
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
   * Adds an entry to the cart.
   *
   * @param {TenrxCartEntry} item - The entry to add to the cart.
   * @memberof TenrxCart
   */
  public addEntry(item: TenrxCartEntry): void {
    this.internalCartEntries.push(item);
    this.forceRecalculate();
  }

  /**
   * Adds a product to the cart.
   *
   * @param {TenrxProduct} item - The product to add to the cart.
   * @param {number} quantity - The quantity of the product to add to the cart.
   * @param {string} [strength=''] - The strength of the product to add to the cart.
   * @param {boolean} [hasPrescriptionAttached=false] - Whether or not the product has a prescription attached.
   * @param {boolean} [hidden=false] - Whether or not the product is hidden.
   * @memberof TenrxCart
   */
  public addItem(item: TenrxProduct, quantity: number, strength = '', hidden = false): void {
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
    });
  }

  // Linter is disabled because there is currently no API to get the tax information
  /**
   * Calculates the tax for the cart. Gets the tax rate and determines if each item is taxable or not.
   *
   * @param {TenrxStreetAddress} address - The address where the item is being shipped. This is used to calculate the tax and determine if each item is taxable or not.
   * @return {*}  {Promise<void>}
   * @memberof TenrxCart
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getTaxInformation(address: TenrxStreetAddress): Promise<void> {
    // TODO - Implement this using API.
    TenrxLibraryLogger.info('Getting tax information for items in cart.');
    TenrxLibraryLogger.silly(address); // This needs to be removed when the tax information is implemented using API calls.
    this.internalTaxRate = 0.06;
    this.internalCartEntries.forEach((entry) => {
      entry.taxable = entry.rx ? false : true;
    });
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
    if (this.internalSubHiddenTotal < -1) {
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
    if (!isGuest) {
      try {
        const paymentResponse = await apiEngine.authSavePaymentDetails({
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
        });
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
    }
    return result;
  }

  /**
   * Proceeds to checkout the cart. It calls both sendPayment and placeOrder functions in the correct order.
   *
   * @param {string} userName - The user name of the user who is paying for the cart.
   * @param {TenrxStripeCreditCard} card - The credit card information of the user who is paying for the cart.
   * @param {TenrxStreetAddress} shippingAddress - The shipping address of the user who is paying for the cart.
   * @param {boolean} [isGuest=false] - Whether or not the user is a guest.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxCartCheckoutResult>}
   * @memberof TenrxCart
   */
  public async checkout(
    userName: string,
    card: TenrxStripeCreditCard,
    shippingAddress: TenrxStreetAddress,
    isGuest = false,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxCartCheckoutResult> {
    TenrxLibraryLogger.info('Checking out cart.');
    const result: TenrxCartCheckoutResult = {
      checkoutSuccessful: false,
      paymentDetails: null,
      orderDetails: null,
    };
    try {
      result.paymentDetails = await this.sendPayment(userName, card, shippingAddress, isGuest, apiEngine);
    } catch (error) {
      TenrxLibraryLogger.error('cart.checkout().sendPayment(): ', error);
    }
    if (result.paymentDetails) {
      if (result.paymentDetails.paymentSuccessful) {
        try {
          result.orderDetails = await this.placeOrder(result.paymentDetails.paymentId, shippingAddress, isGuest);
          if (result.orderDetails.orderPlacementSuccessful) {
            result.checkoutSuccessful = true;
          }
        } catch (error) {
          TenrxLibraryLogger.error('cart.checkout().placeOrder():', error);
        }
      }
    }
    return result;
  }

  /**
   * Places an order for the cart's content to the backend servers.
   *
   * @param {number} paymentId - The payment id of the payment that is being used to place the order.
   * @param {TenrxStreetAddress} shippingAddress - The shipping address of the user who is placing the order.
   * @param {boolean} [isGuest=false] - Whether or not the user is a guest.
   * @param {*} [apiEngine=useTenrxApi()] - The API engine to use.
   * @return {*}  {Promise<TenrxOrderPlacementResult>}
   * @memberof TenrxCart
   */
  public async placeOrder(
    paymentId: number,
    shippingAddress: TenrxStreetAddress,
    isGuest = false,
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
    if (!isGuest) {
      try {
        const orderDetails = await apiEngine.authSaveProduct({
          paymentId,
          totalPrice: this.total,
          medicationProducts: medicationProduct,
        });
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
