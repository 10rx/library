import TenrxMedicationProductDetailAPIModel from '../apiModel/TenrxMedicationProductDetailAPIModel.js';
import TenrxTreatmentProductListAPIModel from '../apiModel/TenrxTreatmentProductListAPIModel.js';
import TenrxLoadError from '../exceptions/TenrxLoadError.js';
import TenrxMedicationStrength from '../types/TenrxMedicationStrength.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Represents a Tenrx product.
 *
 * @export
 * @class TenrxProduct
 */
export default class TenrxProduct {
  /**
   * Contains the id of the product.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  id: number;

  /**
   * Contains the category id of the product.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  categoryId: number;

  /**
   * Returns true if the product is active. Otherwise, returns false.
   *
   * @type {boolean}
   * @memberof TenrxProduct
   */
  active: boolean;

  /**
   * Returns true if the product is a rx and requires prescription. Otherwise, returns false.
   *
   * @type {boolean}
   * @memberof TenrxProduct
   */
  rx: boolean;

  /**
   * Contains the visit type id of the product.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  treatmentTypeId: number;

  /**
   * Contains the gender id of the product.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  genderId: number;

  /**
   * Contains the name of the product.
   *
   * @type {string}
   * @memberof TenrxProduct
   */
  name: string;

  /**
   * Contains the path(s) of the picture(s) of the product.
   *
   * @type {(string | string[])}
   * @memberof TenrxProduct
   */
  photoPath: string | string[];

  /**
   * Contains the default price of the product.
   *
   * @type {string}
   * @memberof TenrxProduct
   */
  defaultPrice: string;

  /**
   * Returns true if the product has been loaded completely from the api. Otherwise, returns false.
   *
   * @type {boolean}
   * @memberof TenrxProduct
   */
  loaded: boolean;

  /**
   * Contains the description of the product.
   *
   * @type {string}
   * @memberof TenrxProduct
   */
  description: string;

  /**
   * Contains the precautions of the product.
   *
   * @type {string}
   * @memberof TenrxProduct
   */
  precautions: string;

  /**
   * Contains the actual selling price of the product.
   *
   * @type {string}
   * @memberof TenrxProduct
   */
  sellingPrice: string;

  /**
   * Returns true if the product is out of stock. Otherwise, returns false.
   *
   * @type {boolean}
   * @memberof TenrxProduct
   */
  outOfStock: boolean;

  /**
   * Contains the strength levels of the product if any. Otherwise, an empty array is returned.
   *
   * @type {TenrxMedicationStrength[]}
   * @memberof TenrxProduct
   */
  strengthLevels: TenrxMedicationStrength[];

  /**
   * Creates an instance of TenrxProduct.
   *
   * @param {TenrxTreatmentProductListAPIModel} data - The data to be used to create the instance.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @param {boolean} [load=false] - Indicates if the product should be loaded from api.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used to load the instance.
   * @memberof TenrxProduct
   * @throws {TenrxLoadError} - Throws an error if the product is not loaded.
   */
  constructor(
    data: TenrxTreatmentProductListAPIModel | null,
    language = 'en',
    load = false,
    apiEngine = useTenrxApi(),
  ) {
    if (data) {
      this.id = data.id;
      this.categoryId = data.categoryId;
      this.active = data.isActive;
      this.rx = data.isRx;
      this.treatmentTypeId = data.treatmentTypeId;
      this.genderId = data.genderId;
      this.name = language === 'en' ? data.name : language === 'es' ? data.nameEs : data.name;
      this.photoPath = data.photoPath;
      this.defaultPrice = data.defaultPrice;
    } else {
      this.id = 0;
      this.categoryId = 0;
      this.active = false;
      this.rx = false;
      this.treatmentTypeId = 0;
      this.genderId = 0;
      this.name = '';
      this.photoPath = '';
      this.defaultPrice = '';
    }
    this.outOfStock = false;
    this.loaded = false;
    this.strengthLevels = [];
    this.description = '';
    this.precautions = '';
    this.sellingPrice = '';
    if (load) {
      this.load(language, apiEngine).catch((e) => {
        throw new TenrxLoadError(
          `Error while attempting to load product category with '${this.id}'.`,
          'TenrxProduct',
          e,
        );
      });
    }
  }

  /**
   * Loads the product from the api.
   *
   * @param {string} [language='en']
   * @param {*} [apiEngine=useTenrxApi()]
   * @memberof TenrxProduct
   * @throws {TenrxLoadError} - Throws an error if the product could not be loaded.
   */
  public async load(language = 'en', apiEngine = useTenrxApi()) {
    if (!this.loaded) {
      TenrxLibraryLogger.info('Loading product with id: ' + String(this.id));
      try {
        const response = await apiEngine.getMedicationProductDetail(this.id);
        if (response.status === 200) {
          const content = response.content as {
            data: TenrxMedicationProductDetailAPIModel;
            statusCode: number;
            message: string;
          };
          if (content) {
            if (this.id === 2330) {
              TenrxLibraryLogger.info(`Product failing ${this.id} with name ${this.name}:`, content);
            }
            if (content.statusCode === 200) {
              const data = content.data;
              if (data) {
                this.name = language === 'en' ? data.name : language === 'es' ? data.nameEs : data.name;
                this.description =
                  language === 'en' ? data.description : language === 'es' ? data.descriptionEs : data.description;
                this.precautions =
                  language === 'en' ? data.precautions : language === 'es' ? data.precautionsEs : data.precautions;
                this.categoryId = data.categoryId;
                this.active = data.isActive;
                this.rx = data.isRx;
                this.treatmentTypeId = data.treatmentTypeId;
                this.genderId = data.genderId;
                this.photoPath = data.photoPath;
                this.defaultPrice = data.defaultPrice;
                this.sellingPrice = data.sellingPrice;
                if (data.medicationQuantityDetails) {
                  if (data.medicationQuantityDetails.length > 0) {
                    data.medicationQuantityDetails.forEach((strength) => {
                      this.strengthLevels.push({
                        strengthLevel: strength.medicationName,
                        description:
                          language === 'en'
                            ? strength.productName.description
                            : language === 'es'
                            ? strength.productName.descriptionEs
                            : strength.productName.description,
                        price: strength.price,
                        barcode: strength.barcode,
                      });
                    });
                  }
                }
                this.loaded = true;
              } else {
                TenrxLibraryLogger.error(`Error while loading product with id: ${this.id}: No data.`);
                throw new TenrxLoadError(
                  `Error while loading product with id: ${this.id}: No data.`,
                  'TenrxProduct',
                  null,
                );
              }
            } else {
              TenrxLibraryLogger.error(
                `Error while attempting to load product with id: '${this.id}': ${content.message}`,
              );
              throw new TenrxLoadError(
                `Error while attempting to load product with id: '${this.id}': ${content.message}`,
                'TenrxProduct',
                null,
              );
            }
          } else {
            TenrxLibraryLogger.error(`Error while loading product with id: '${this.id})':`, response.error);
            throw new TenrxLoadError(`Error while loading product with id: ${this.id}`, 'TenrxProduct', response.error);
          }
        } else {
          TenrxLibraryLogger.error(`Error while loading product with id: '${this.id})':`, response.error);
          throw new TenrxLoadError(`Error while loading product with id: ${this.id}`, 'TenrxProduct', response.error);
        }
      } catch (e) {
        TenrxLibraryLogger.error(`Error while attempting to load product with id: '${this.id}'.`, e);
        throw new TenrxLoadError(`Error while attempting to load product with id: '${this.id}'.`, 'TenrxProduct', e);
      }
    } else {
      TenrxLibraryLogger.warn('Product already loaded with id: ' + String(this.id));
    }
  }

  /**
   * Gets the price of the product. If the product has strength levels, then the price of the base item is returned.
   *
   * @readonly
   * @type {number}
   * @memberof TenrxProduct
   */
  public get price(): number {
    return this.sellingPrice !== '' && this.sellingPrice != null
      ? Number(this.sellingPrice)
      : Number(this.defaultPrice);
  }

  /**
   * Gets an instance of a {TenrxProduct} with the given id.
   *
   * @static
   * @param {number} id
   * @param {string} [language='en']
   * @param {*} [apiEngine=useTenrxApi()]
   * @return {*}  {(Promise<TenrxProduct | null>)}
   * @memberof TenrxProduct
   */
  public static async getProductByID(
    id: number,
    language = 'en',
    apiEngine = useTenrxApi(),
  ): Promise<TenrxProduct | null> {
    const product = new TenrxProduct(null, language, false, apiEngine);
    product.id = id;
    try {
      await product.load(language, apiEngine);
      return product;
    } catch (e) {
      TenrxLibraryLogger.error(`Error while attempting to load product with id: '${id}'.`, e);
      return null;
    }
  }

  /**
   * Gets all products from the API.
   *
   * @static
   * @param {string} [language='en'] - The language to use for the product names.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {(Promise<TenrxTreatmentProductListAPIModel[] | null>)}
   * @memberof TenrxProduct
   */
  public static async getAllProducts(
    language = 'en',
    apiEngine = useTenrxApi(),
  ): Promise<TenrxTreatmentProductListAPIModel[] | null> {
    try {
      const response = await apiEngine.getTreatmentProductList(0, 0, 0, 0, '', true, 1, 500, '', '', language);
      if (response.status === 200) {
        if (response.content) {
          const content = response.content as {
            data: TenrxTreatmentProductListAPIModel[];
          };
          if (content.data) {
            return content.data;
          } else {
            TenrxLibraryLogger.error(`Error while loading products: No data.`);
            return null;
          }
        } else {
          TenrxLibraryLogger.error('Error while loading products: response.content is null');
          return null;
        }
      } else {
        TenrxLibraryLogger.error('Error while loading products:', response.error);
        return null;
      }
    } catch (e) {
      TenrxLibraryLogger.error('Error while attempting to get all:', e);
      return null;
    }
  }
}
