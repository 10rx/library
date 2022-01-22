import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import TenrxProductCategoryAPIModel from '../apiModel/TenrxProductCategoryAPIModel.js';

/**
 * Represents a Tenrx Product Category
 *
 * @export
 * @class TenrxProductCatagory
 */
export default class TenrxProductCategory {
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
   * Creates an instance of TenrxProductCategory.
   *
   * @param {TenrxProductCategoryAPIModel} data - The data to be used to create the instance.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @memberof TenrxProductCategory
   */
  constructor(data: TenrxProductCategoryAPIModel, language = 'en') {
    this.id = data.id;
    this.name = language === 'en' ? data.name : language === 'es' ? data.nameEs : data.name;
    this.treatmentTypeId = data.treatmentTypeId;
    this.visitTypeCategoryId = data.visitTypeCategoryId;
    this.active = data.isActive;
    this.photoPath = data.photoPath;
    this.productCatagories = [];
    if (data.productCategories) {
      data.productCategories.forEach((element) => {
        this.productCatagories.push(new TenrxProductCategory(element, language));
      });
    }
  }

  /**
   * Gets the product categories by id.
   *
   * @static
   * @param {number} id - The id of the product category.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to be used to create the instance.
   * @return {*}  {(Promise<TenrxProductCategory[] | null>)} - The product categories by id.
   * @memberof TenrxProductCategory
   */
  public static async getProductCategory(
    id: number,
    language = 'en',
    apiEngine = useTenrxApi(),
  ): Promise<TenrxProductCategory[] | null> {
    TenrxLibraryLogger.silly('TenrxVisitType.GetProductCatagory() Started');
    if (apiEngine == null) {
      TenrxLibraryLogger.fatal('TenrxApiEngine is not initialized.');
      return null;
    }
    const result: TenrxProductCategory[] = [];
    TenrxLibraryLogger.info('Retrieving product categories types.');
    const response = await apiEngine.getProductCategory(id);
    if (response.status === 200) {
      TenrxLibraryLogger.debug('GetProductCategory() Response: ', response.content);
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
      TenrxLibraryLogger.error('GetProductCategory() Error: ', response.error);
      return null;
    }
  }
}
