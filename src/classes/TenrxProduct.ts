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
  id: number;
  categoryId: number;
  active: boolean;
  rx: boolean;
  treatmentTypeId: number;
  genderId: number;
  name: string;
  photoPath: string;
  defaultPrice: string;
  loaded: boolean;
  description: string;
  precautions: string;
  sellingPrice: string;
  outOfStock: boolean;
  strengthLevels: TenrxMedicationStrength[];

  /**
   * Creates an instance of TenrxProduct.
   *
   * @param {TenrxTreatmentProductListAPIModel} data - The data to be used to create the instance.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @param {boolean} [load=false] - Indicates if the product should be loaded from api.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used to load the instance.
   * @memberof TenrxProduct
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
            if (this.id === 2330) { TenrxLibraryLogger.info(`Product failing ${this.id} with name ${this.name}:`, content) }
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
  /*
    public static async getProductByID(id: number):Promise<TenrxProduct | null> {
        
    } */
}
