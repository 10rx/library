import { TenrxLibraryLogger, useTenrxStorage } from '../index.js';
import TenrxCartEntry from '../types/TenrxCartEntry.js';
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
  private internalTaxRate: number;
  private internalTaxAmount: number;
  private internalSubTotal: number;
  private internalSubHiddenTotal: number;

  /**
   * Creates an instance of TenrxCart.
   *
   * @param {TenrxCartEntry[]} [data=[]]
   * @memberof TenrxCart
   */
  constructor(data: TenrxCartEntry[] = []) {
    this.internalCartEntries = data;
    this.internalTaxRate = 0.06;
    this.internalTaxAmount = -1;
    this.internalSubTotal = -1;
    this.internalSubHiddenTotal = -1;
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
    if (this.internalTaxAmount === -1) {
      this.internalTaxAmount = this.internalCartEntries.reduce((acc, curr) => {
        if (curr.taxable) {
          return acc + curr.price * this.internalTaxRate;
        }
        return acc;
      }, 0);
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
    if (this.internalSubTotal === -1) {
      this.internalSubTotal = this.internalCartEntries.reduce((acc, curr) => {
        if (!curr.hidden) {
          return acc + curr.price * curr.quantity;
        }
        return acc;
      }, 0);
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
    if (this.internalSubHiddenTotal === -1) {
      this.internalSubHiddenTotal = this.internalCartEntries.reduce((acc, curr) => {
        if (curr.hidden) {
          return acc + curr.price * curr.quantity;
        }
        return acc;
      }, 0);
    }
    return this.internalSubHiddenTotal;
  }

  /**
   * Gets the total of the cart including both visible and invisible items plus tax.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get total(): number {
    return this.subTotal + this.tax + this.subHiddenTotal;
  }

  /**
   * Gets the total of the cart including only visible items plus tax
   *
   * @readonly
   * @type {number}
   * @memberof TenrxCart
   */
  public get totalVisible(): number {
    return this.subTotal + this.tax;
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
    }
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
    }
  }
}
