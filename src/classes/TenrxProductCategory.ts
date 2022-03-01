import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import TenrxProductCategoryAPIModel from '../apiModel/TenrxProductCategoryAPIModel.js';
import TenrxProduct from './TenrxProduct.js';
import TenrxNotLoaded from '../exceptions/TenrxNotLoaded.js';
import TenrxLoadError from '../exceptions/TenrxLoadError.js';
import TenrxTreatmentProductListAPIModel from '../apiModel/TenrxTreatmentProductListAPIModel.js';

/**
 * Represents a Tenrx Product Category
 *
 * @export
 * @class TenrxProductCatagory
 */
export default class TenrxProductCategory {
  private internalProducts: TenrxProduct[];
  /**
   * The id of the product category.
   *
   * @type {number}
   * @memberof TenrxProductCatagory
   */
  id: number;

  /**
   * The name of the product category.
   *
   * @type {string}
   * @memberof TenrxProductCatagory
   */
  name: string;

  /**
   * The treatment type id.
   *
   * @type {number}
   * @memberof TenrxProductCatagory
   */
  treatmentTypeId: number;

  /**
   * The visit type category id.
   *
   * @type {(number | null)}
   * @memberof TenrxProductCategory
   */
  visitTypeCategoryId: number | null;

  /**
   * Returns true if the product category is active. Otherwise, returns false.
   *
   * @type {boolean}
   * @memberof TenrxProductCategory
   */
  active: boolean;

  /**
   * The path of the photo for the category.
   *
   * @type {string}
   * @memberof TenrxProductCategory
   */
  photoPath: string;

  /**
   * Contains the list of sub categories.
   *
   * @type {TenrxProductCategory[]}
   * @memberof TenrxProductCategory
   */
  productCatagories: TenrxProductCategory[];

  /**
   * True if visit types has loaded all its data from API
   *
   * @type {boolean}
   * @memberof TenrxProductCategory
   */
  loaded: boolean;

  /**
   * Gets the short description of the product category.
   *
   * @type {string}
   * @memberof TenrxProductCategory
   */
  shortDescription: string;

  /**
   * Gets the description of the product category.
   *
   * @type {string}
   * @memberof TenrxProductCategory
   */
  description: string;

  /**
   * Creates an instance of TenrxProductCategory.
   *
   * @param {TenrxProductCategoryAPIModel} data - The data to be used to create the instance.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used to create the instance.
   * @memberof TenrxProductCategory
   * @throws {TenrxLoadError} - Throws an error if the instance could not be created.
   */
  constructor(data: TenrxProductCategoryAPIModel, language = 'en', load = false, apiEngine = useTenrxApi()) {
    this.id = data.id;
    this.name = language === 'en' ? data.name : language === 'es' ? data.nameEs : data.name;
    this.treatmentTypeId = data.treatmentTypeId;
    this.visitTypeCategoryId = data.visitTypeCategoryId;
    this.active = data.isActive;
    this.photoPath = data.photoPath;
    this.loaded = false;
    this.productCatagories = [];
    this.internalProducts = [];
    this.shortDescription = data.shortDescription ? data.shortDescription : '';
    this.description = data.description ? data.description : '';
    if (load) {
      this.load(language, apiEngine).catch((e) => {
        throw new TenrxLoadError(
          `Error while attempting to load product category with '${this.id}' and visit Id: '${this.treatmentTypeId}'.`,
          'TenrxVisitType',
          e,
        );
      });
    }
    if (data.productCategories) {
      data.productCategories.forEach((element) => {
        this.productCatagories.push(new TenrxProductCategory(element, language));
      });
    }
  }

  /**
   * Loads the products for this category
   *
   * @param {string} [language='en'] - The language to be used to load the instance.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used to load the instance.
   * @return {TenrxProductCategory} - The same instance after it has been loaded.
   * @memberof TenrxProductCategory
   * @throws {TenrxLoadError} - Throws an error if the instance could not be loaded.
   */
  public async load(language = 'en', apiEngine = useTenrxApi()) {
    if (!this.loaded) {
      TenrxLibraryLogger.info(`Loading product category with '${this.id}' and visit Id: '${this.treatmentTypeId}'`);
      try {
        const response = await apiEngine.getTreatmentProductList(this.treatmentTypeId, this.id);
        if (response.status === 200) {
          TenrxLibraryLogger.debug('getProductCategories() Response: ', response.content);
          const content = response.content as { data: TenrxTreatmentProductListAPIModel[] };
          if (content.data) {
            content.data.forEach((element) => {
              try {
                this.internalProducts.push(new TenrxProduct(element, language));
              } catch (e) {
                TenrxLibraryLogger.error(`Error while attempting to load product with '${element.id}':`, e);
              }
            });
            this.loaded = true;
            TenrxLibraryLogger.info(
              `A total of '${this.internalProducts.length}' products were loaded for product category with '${this.id}' and visit Id: '${this.treatmentTypeId}'`,
            );
          } else {
            TenrxLibraryLogger.info(
              `No products found for product category with '${this.id}' and visit Id: '${this.treatmentTypeId}'`,
            );
          }
        } else {
          TenrxLibraryLogger.error('getProductCategories() Error: ', response.error);
        }
      } catch (e) {
        TenrxLibraryLogger.error(
          `Error occurred when loading product category with '${this.id}' and visit Id: '${this.treatmentTypeId}':`,
          e,
        );
        throw new TenrxLoadError(
          `Error while attempting to load product category with '${this.id}' and visit Id: '${this.treatmentTypeId}'.`,
          'TenrxVisitType',
          e,
        );
      }
      this.loaded = true;
    } else {
      TenrxLibraryLogger.warn(
        `Product Category with '${this.id}' and visit Id: '${this.treatmentTypeId}' has already been loaded.`,
      );
    }
    return this;
  }

  /**
   * Gets the products for this category.
   *
   * @readonly
   * @type {TenrxProduct[]}
   * @memberof TenrxProductCategory
   * @throws {TenrxNotLoaded} - Throws an error if the instance has not been loaded.
   */
  public get products(): TenrxProduct[] {
    if (this.loaded) {
      return this.internalProducts;
    } else {
      TenrxLibraryLogger.error(
        `Product Category with '${this.id}' and visit Id: '${this.treatmentTypeId}' has not been loaded yet.`,
      );
      throw new TenrxNotLoaded('Product Category has not been loaded yet.', 'TenrxProductCategory');
    }
  }

  /**
   * Gets the product categories by visit type id.
   *
   * @static
   * @param {number} id - The id of the visit type where the category belongs.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to be used to create the instance.
   * @return {*}  {(Promise<TenrxProductCategory[] | null>)} - The product categories by id.
   * @memberof TenrxProductCategory
   */
  public static async getProductCategories(
    visitId: number,
    language = 'en',
    apiEngine = useTenrxApi(),
  ): Promise<TenrxProductCategory[] | null> {
    TenrxLibraryLogger.silly('TenrxVisitType.getProductCategories() Started');
    if (apiEngine == null) {
      TenrxLibraryLogger.fatal('TenrxApiEngine is not initialized.');
      return null;
    }
    const result: TenrxProductCategory[] = [];
    TenrxLibraryLogger.info('Retrieving product categories types.');
    const response = await apiEngine.getProductCategories(visitId);
    if (response.status === 200) {
      TenrxLibraryLogger.debug('getProductCategories() Response: ', response.content);
      const content = response.content as { data: TenrxProductCategoryAPIModel[] };
      if (content) {
        if (content.data) {
          TenrxLibraryLogger.info('Total Product Catagory received from API: ', content.data.length);
          for (const productCategory of content.data) {
            result.push(new TenrxProductCategory(productCategory, language));
          }
          return result;
        } else {
          TenrxLibraryLogger.error(
            'API returned data as null when getting Product Category. Content of error is: ',
            response.error,
          );
          return null;
        }
      } else {
        TenrxLibraryLogger.error(
          'API returned content as null when getting Product Category. Content of error is: ',
          response.error,
        );
        return null;
      }
    } else {
      TenrxLibraryLogger.error('getProductCategories() Error: ', response.error);
      return null;
    }
  }
}
