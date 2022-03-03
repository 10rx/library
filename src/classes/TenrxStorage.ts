import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Base class for all storage classes. This class is not intended to be used directly. Instead, use the derived classes.
 *
 * @export
 * @abstract
 * @class TenrxBaseStorage
 */
export default abstract class TenrxStorage {
  /**
   * Saves the data to the storage asynchronous.
   *
   * @abstract - This method must be implemented by the derived classes.
   * @template T - The type of the data to be saved.
   * @param {TenrxStorageScope} scope - The scope of the data to be saved.
   * @param {'string'} key - The key of the data to be saved.
   * @param {T} data - The data to be saved.
   * @return {*}  {Promise<void>} - A promise that resolves when the data is saved.
   * @memberof TenrxBaseStorage
   */
  public abstract save<T>(scope: TenrxStorageScope, key: string, data: T): Promise<void>;

  /**
   * Loads the data from the storage asynchronous.
   *
   * @abstract - This method must be implemented by the derived classes.
   * @template T - The type of the data to be loaded.
   * @param {TenrxStorageScope} scope - The scope of the data to be loaded.
   * @param {'string'} key - The key of the data to be loaded.
   * @return {*}  {Promise<T>} - A promise that resolves when the data is loaded.
   * @memberof TenrxBaseStorage
   */
  public abstract load<T>(scope: TenrxStorageScope, key: string): Promise<T>;

  /**
   * Removes the key from the storage asynchronous.
   *
   * @abstract
   * @param {TenrxStorageScope} scope - The scope of the data to be removed.
   * @param {string} key - The key of the data to be removed.
   * @return {*}  {Promise<void>} - A promise that resolves when the key has been removed.
   * @memberof TenrxStorage
   */
  public abstract removeKey(scope: TenrxStorageScope, key: string): Promise<void>;

  /**
   * Saves the data to the storage synchronous.
   *
   * @abstract - This method must be implemented by the derived classes.
   * @template T - The type of the data to be saved.
   * @param {TenrxStorageScope} scope - The scope of the data to be saved.
   * @param {'string'} key - The key of the data to be saved.
   * @param {T} data - The data to be saved.
   * @memberof TenrxStorage
   */
  public abstract saveSync<T>(scope: TenrxStorageScope, key: string, data: T): void;

  /**
   * Loads the data from the storage synchronous.
   *
   * @abstract - This method must be implemented by the derived classes.
   * @template T - The type of the data to be loaded.
   * @param {TenrxStorageScope} scope - The scope of the data to be loaded.
   * @param {'string'} key - The key of the data to be loaded.
   * @return {*}  {T}
   * @memberof TenrxStorage
   */
  public abstract loadSync<T>(scope: TenrxStorageScope, key: string): T;

  /**
   * Removes the key from the storage synchronous.
   *
   * @abstract
   * @param {TenrxStorageScope} scope - The scope of the data to be removed.
   * @param {string} key - The key of the data to be removed.
   * @return {*}  {Promise<void>} - A promise that resolves when the key has been removed.
   * @memberof TenrxStorage
   */
   public abstract removeKeySync(scope: TenrxStorageScope, key: string): Promise<void>;

  /**
   * Contains the singleton instance of the storage.
   *
   * @private
   * @static
   * @type {TenrxStorage}
   * @memberof TenrxStorage
   */
  private static internalInstance: TenrxStorage;

  /**
   * Initializes the singleton instance of the storage.
   *
   * @static
   * @param {TenrxStorage} instance
   * @memberof TenrxStorage
   */
  public static initialize(instance: TenrxStorage): void {
    if (!TenrxStorage.internalInstance) {
      TenrxStorage.internalInstance = instance;
    } else {
      TenrxLibraryLogger.warn(`TenrxStorage has already been initialized. Call TenrxStorage.initialize() only once.`);
    }
  }

  /**
   * Gets the singleton instance of the storage.
   *
   * @readonly
   * @static
   * @type {TenrxStorage}
   * @memberof TenrxStorage
   * @returns {TenrxStorage} - The TenrxApiEngine instance
   * @throws {TenrxNotInitialized} - If the TenrxStorage instance is not initialized.
   */
  public static get instance(): TenrxStorage {
    if (TenrxStorage.internalInstance === null) {
      TenrxLibraryLogger.error('TenrxStorage is not initialized. Call TenrxStorage.initialize() first.');
      throw new TenrxNotInitialized(
        'TenrxStorage is not initialized. Call TenrxStorage.initialize() first.',
        'TenrxStorage',
      );
    }
    return TenrxStorage.internalInstance;
  }
}

export type TenrxStorageScope = 'persistent' | 'session';
