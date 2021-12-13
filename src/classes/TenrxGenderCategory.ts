import { TenrxLogger } from "../includes/TenrxLogger";
import { useTenrxApi } from "..";
import TenrxGenderCategoryAPIModel from "../apiModel/TenrxGenderCategoryAPIModel";

/**
 * Represents a Tenrx Gender Category
 *
 * @export
 * @class TenrxGenderCategory
 */
export class TenrxGenderCategory{
/**
 * The id of the gender category.
 *
 * @type {number}
 * @memberof TenrxGenderCategory
 */
id: number;

/**
 * The name of gender category.
 *
 * @type {string}
 * @memberof TenrxGenderCategory
 */
name: string;

/**
 * Treatment type id.
 *
 * @type {number}
 * @memberof TenrxGenderCategory
 */
treatmentTypeId: number;
   
/**
 * The path of the photo for the category.
 *
 * @type {string}
 * @memberof TenrxGenderCategory
 */
photoPath: string;

/**
 * Contains the list of sub categories.
 *
 * @type {TenrxGenderCategory[]}
 * @memberof TenrxGenderCategory
 */
 genderCategories : TenrxGenderCategory[];


  
  /**
   * Creates an instance of TenrxGenderCategory.
   * 
   * @param {TenrxGenderCategoryAPIModel} data - The data to be used to create the instance.
   * @param {string} [language='en'] - The language to be used to create the instance.
   * @memberof TenrxGenderCategory
   */
  constructor(data: TenrxGenderCategoryAPIModel, language = 'en') {
        this.id = data.id;
        this.name = (language === 'en') ? data.name : ((language === 'es') ? data.nameEs : data.name);
        this.treatmentTypeId = data.treatmentTypeId;
        this.photoPath= data.photoPath;
        this.genderCategories = [];
        if (data.genderCategories) {
            data.genderCategories.forEach(element => {
                this.genderCategories.push(new TenrxGenderCategory(element, language));
            });
        }
    }
    /**
     * Gets the gender categories by id.
     *
     * @static
     * 
     * @param {number} id - The id of the gender category.
     * @param {string} [language='en'] - The language to be used to create the instance.
     * @param {*} [apiEngine=useTenrxApi()] - The api engine to be used to create the instance.
     * @return {*}  {(Promise<TenrxGenderCategory[] | null>)}
     * @memberof TenrxGenderCategory
     */
     public static async getGenderCategory(id: number, language = 'en', apiEngine = useTenrxApi()): Promise<TenrxGenderCategory[] | null> {
        TenrxLogger.silly('TenrxVisitType.GetGenderCatagory() Started')            
        if (apiEngine == null) {
            TenrxLogger.fatal("TenrxApiEngine is not initialized.");
            return null;
        }
        const result: TenrxGenderCategory[] = [];
        TenrxLogger.info('Retrieving Gender categories types.');
        const response = await apiEngine.getGenderCategory(id);
        if (response.status === 200) {
            TenrxLogger.debug('GetGenderCategory() Response: ', response.content);
            const content = response.content as { data: TenrxGenderCategoryAPIModel[] };
            if (content) {
                if (content.data) {
                    TenrxLogger.info('Total Gender Catagory received from API: ', content.data.length);
                    for (const genderCategory of content.data) {
                        result.push(new TenrxGenderCategory(genderCategory, language));
                    }                    
                    return result;
                } else {
                    TenrxLogger.error('API returned data as null when getting Gender Category. Content of error is: ', response.error);
                    return null;
                }
            } else {
                TenrxLogger.error('API returned content as null when getting Gender Category. Content of error is: ', response.error);
                return null;
            }
        } else {
            TenrxLogger.error('GetGenderCategory() Error: ', response.error);
            return null;
        }
    }
}