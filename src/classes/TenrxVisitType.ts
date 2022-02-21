import TenrxApiEngine from './TenrxApiEngine.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import TenrxVisitTypeAPIModel from '../apiModel/TenrxVisitTypeAPIModel.js';
import TenrxProductCategory from './TenrxProductCategory.js';
import TenrxNotLoaded from '../exceptions/TenrxNotLoaded.js';
import TenrxGenderCategory from './TenrxGenderCategory.js';
import TenrxLoadError from '../exceptions/TenrxLoadError.js';

/**
 * Represents a Tenrx visit type.
 *
 * @export
 * @class TenrxVisitType
 */
export default class TenrxVisitType {
  private internalProductCategories: TenrxProductCategory[];
  private internalGenderCategories: TenrxGenderCategory[];

  /**
   * The id of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */

  /**
   * The id of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  id: number;

  /**
   * The name of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  visitType: string;

  /**
   * The display order of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  displayOrder: number;

  /**
   * The id of the parent visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  parentVisitTypeId: number;

  /**
   * The level of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  level: number;

  /**
   * The photo path of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  photoPath: string;

  /**
   * The list of sub visit types.
   *
   * @type {TenrxVisitType[]}
   * @memberof TenrxVisitType
   */
  visitTypeListings: TenrxVisitType[];

  /**
   * True if visit types has loaded all its data from API
   *
   * @type {boolean}
   * @memberof TenrxVisitType
   */
  loaded: boolean;

  /**
   * Gets the short description of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  shortDescription: string;

  /**
   * Gets the description of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  description: string;

  /**
   * Creates an instance of TenrxVisitType.
   *
   * @param {TenrxVisitTypeAPIModel} data - The data to initialize the visit type with.
   * @param {string} [language='en'] - The language to use for the visit type.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to use.
   * @memberof TenrxVisitType
   * @throws {TenrxLoadError} - If the visit type could not be loaded.
   */
  constructor(data: TenrxVisitTypeAPIModel, language = 'en', load = false, apiEngine = useTenrxApi()) {
    this.loaded = false;
    this.id = data.id;
    this.visitType = language === 'en' ? data.visitType : language === 'es' ? data.visitTypeEs : data.visitType;
    this.displayOrder = data.displayOrder;
    this.parentVisitTypeId = data.parentVisitTypeId;
    this.level = data.level;
    this.photoPath = data.photoPath;
    this.visitTypeListings = [];
    this.shortDescription = data.shortDescription ? data.shortDescription : '';
    this.description = data.description ? data.description : '';
    if (data.visitTypeListings) {
      for (const visitTypeListing of data.visitTypeListings) {
        this.visitTypeListings.push(new TenrxVisitType(visitTypeListing, language));
      }
    }
    this.internalProductCategories = [];
    this.internalGenderCategories = [];
    if (load) {
      this.load(language, apiEngine).catch((e) => {
        TenrxLibraryLogger.error(
          `Error while attemping to load visit type with id '${this.id}' and type: '${this.visitType}' in constructor. Exception:`,
          e,
        );
        throw new TenrxLoadError(
          `Error while attemping to load visit type with id '${this.id}' and type: '${this.visitType}' in constructor. Exception:`,
          'TenrxVisitType',
          e,
        );
      });
    }
  }

  /**
   * Gets all the product categories of the visit type
   *
   * @readonly
   * @type {TenrxProductCategory[]}
   * @memberof TenrxVisitType
   * @throws {TenrxNotInitialized} - If the TenrxVisitType has not been loaded yet.
   */
  public get productCategories(): TenrxProductCategory[] {
    if (this.loaded) {
      return this.internalProductCategories;
    } else {
      TenrxLibraryLogger.error(`Visit type with '${this.id}' and type: '${this.visitType}' has not been loaded yet.`);
      throw new TenrxNotLoaded('Visit type has not been loaded yet.', 'TenrxVisitType');
    }
  }

  /**
   * Gets all the gender categories of the visit types
   *
   * @readonly
   * @type {TenrxGenderCategory[]}
   * @memberof TenrxVisitType
   */
  public get genderCategory(): TenrxGenderCategory[] {
    if (this.loaded) {
      return this.internalGenderCategories;
    } else {
      TenrxLibraryLogger.error(`Visit type with '${this.id}' and type: '${this.visitType}' has not been loaded yet.`);
      throw new TenrxNotLoaded('Visit type has not been loaded yet.', 'TenrxVisitType');
    }
  }

  /**
   * Loads the product categories of a visit type data from API.
   *
   * @param {string} [language='en']
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()]
   * @return {*}  {Promise<TenrxVisitType>}
   * @memberof TenrxVisitType
   */
  public async load(language = 'en', apiEngine: TenrxApiEngine = useTenrxApi()): Promise<TenrxVisitType> {
    if (!this.loaded) {
      TenrxLibraryLogger.info(`Loading visit type with id '${this.id}' and type: '${this.visitType}'.`);
      try {
        const responseCat = await TenrxProductCategory.getProductCategories(this.id, language, apiEngine);
        this.internalProductCategories = responseCat ? responseCat : [];
        this.loaded = true;
      } catch (e) {
        TenrxLibraryLogger.error(
          `Error occurred when loading visit type with '${this.id}' and type: '${this.visitType}':`,
          e,
        );
        throw new TenrxLoadError(
          `Error while attempting to load visit type with id '${this.id}' and type: '${this.visitType}' in load.`,
          'TenrxVisitType',
          e,
        );
      }
      try {
        const responseGender = await TenrxGenderCategory.getGenderCategories(this.id, language, apiEngine);
        this.internalGenderCategories = responseGender ? responseGender : [];
      } catch (e) {
        TenrxLibraryLogger.error(
          `Error occurred when loading visit type with '${this.id}' and type: '${this.visitType}':`,
          e,
        );
        throw new TenrxLoadError(
          `Error while attempting to load visit type with id '${this.id}' and type: '${this.visitType}' in load.`,
          'TenrxVisitType',
          e,
        );
      }
      this.loaded = true;
    } else {
      TenrxLibraryLogger.warn(`Visit type with id '${this.id}' and type: '${this.visitType}' has already been loaded.`);
    }
    return this;
  }

  /**
   * Gets all the visit types
   *
   * @static
   * @param {string} [language='en'] - The language to be used when creating the instance.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used when creating the instance.
   * @return {*}  {(Promise<TenrxVisitType[] | null>)}
   * @memberof TenrxVisitType
   */
  public static async getVisitTypes(
    language = 'en',
    apiEngine: TenrxApiEngine = useTenrxApi(),
  ): Promise<TenrxVisitType[] | null> {
    TenrxLibraryLogger.silly('TenrxVisitType.GetVisitTypes() Started');
    if (apiEngine) {
      const result: TenrxVisitType[] = [];
      TenrxLibraryLogger.info('Retrieving visit types.');
      const response = await apiEngine.getVisitTypes();
      if (response.status === 200) {
        TenrxLibraryLogger.debug('Response from API: ', response.content);
        if (response.content) {
          const content = response.content as { data: TenrxVisitTypeAPIModel[] };
          if (content.data) {
            TenrxLibraryLogger.info('Total Visit Types received: ', content.data.length);
            for (const visitType of content.data) {
              result.push(new TenrxVisitType(visitType, language));
            }
            return result;
          } else {
            TenrxLibraryLogger.error(
              'API returned data as null when getting visit types. Content of error is: ',
              response.error,
            );
            return null;
          }
        } else {
          TenrxLibraryLogger.error(
            'API returned content as null when getting visit types. Content of error is: ',
            response.error,
          );
          return null;
        }
      } else {
        TenrxLibraryLogger.error('API returned error: ', response.error);
        return null;
      }
    } else {
      TenrxLibraryLogger.fatal('TenrxApiEngine is not initialized.');
      return null;
    }
  }
}
