import TenrxGetProductAPIModel from '../apiModel/TenrxGetProductAPIModel.js';
import TenrxTreatmentProductListAPIModel from '../apiModel/TenrxTreatmentProductListAPIModel.js';
import TenrxGetProductsAPIModel from '../apiModel/TenrxGetProductsAPIModel.js';
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
   * @type {string[]}
   * @memberof TenrxProduct
   */
  photoPaths: string[];

  /**
   * Contains the default price of the product.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  defaultPrice: number;

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
   * @type {number}
   * @memberof TenrxProduct
   */
  sellingPrice: number;

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
   * Maximum amount of product that can be purchased. 0 means unlimited.
   *
   * @type {number}
   * @memberof TenrxProduct
   */
  maxQuantityPurchasable: number;

  /**
   * The ID to use for the questionnaire
   *
   * @type {(number | null)}
   * @memberof TenrxProduct
   */
  questionnaireID: number | null;

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
      this.photoPaths = data.photoPaths.filter((img) => img.length);
      this.defaultPrice = Number(data.defaultPrice);
      this.questionnaireID = data.questionnaireID;
    } else {
      this.id = 0;
      this.categoryId = 0;
      this.active = false;
      this.rx = false;
      this.treatmentTypeId = 0;
      this.genderId = 0;
      this.name = '';
      this.photoPaths = [];
      this.defaultPrice = 0;
      this.questionnaireID = null;
    }
    this.outOfStock = false;
    this.loaded = false;
    this.strengthLevels = [];
    this.description = '';
    this.precautions = '';
    this.sellingPrice = 0;
    this.maxQuantityPurchasable = 0;
    this.load = this.load.bind(this);
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
  public async load(language = 'en', apiEngine = useTenrxApi()): Promise<void> {
    if (!this.loaded) {
      TenrxLibraryLogger.info('Loading product with id: ' + String(this.id));
      try {
        const response = await apiEngine.getProduct(this.id);
        if (response.status === 200) {
          const content = response.content as {
            apiStatus: {
              message: string;
              statusCode: number;
            };
            data: TenrxGetProductAPIModel;
          };
          if (content) {
            if (this.id === 2330) {
              TenrxLibraryLogger.info(`Product failing ${this.id} with name ${this.name}:`, content);
            }
            if (content.apiStatus.statusCode === 200) {
              const data = content.data;
              if (data) {
                // ? If product has no variants than default is strength null
                const defaultVariant = data.variants.find((v) => !v.strength);

                this.name = language === 'es' ? data.nameEs : data.name;
                this.description = language === 'es' ? data.descriptionEs : data.description;
                this.precautions = language === 'es' ? data.precautionsEs : data.precautions;
                this.categoryId = data.category;
                this.active = true;
                this.rx = data.isRx;
                this.treatmentTypeId = data.visitType;
                this.genderId = data.gender;
                this.photoPaths = data.images;
                this.defaultPrice = defaultVariant?.price || 0;
                this.sellingPrice = defaultVariant?.price || 0;
                this.maxQuantityPurchasable = this.rx ? 10 : 0; // TODO This needs to come from the API
                this.strengthLevels = data.variants
                  .filter((v) => v.strength)
                  .map((v) => ({
                    strengthLevel: v.strength as string,
                    description: language === 'es' ? data.descriptionEs : data.description,
                    price: v.price,
                    barcode: '',
                  }));

                this.questionnaireID = data.questionnaireID;
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
                `Error while attempting to load product with id: '${this.id}': ${content.apiStatus.message}`,
              );
              throw new TenrxLoadError(
                `Error while attempting to load product with id: '${this.id}': ${content.apiStatus.message}`,
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
    return this.sellingPrice;
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
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {(Promise<TenrxGetProductsAPIModel[] | null>)}
   * @memberof TenrxProduct
   */
  public static async getAllProducts(apiEngine = useTenrxApi()): Promise<TenrxGetProductsAPIModel[] | null> {
    try {
      TenrxLibraryLogger.info('Getting all products.');
      const response = await apiEngine.getProducts();
      if (response.status === 200) {
        if (response.content) {
          const content = response.content as {
            data: TenrxGetProductsAPIModel[];
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
