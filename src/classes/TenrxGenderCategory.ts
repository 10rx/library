import { TenrxLogger } from "../includes/TenrxLogger";
import { useTenrxApi } from "..";
import TenrxGenderCategoryAPIModel from "../apiModel/TenrxGenderCategoryAPIModel";

/**
 *
 *
 * @export
 * @class TenrxGenderCategory
 */
export class TenrxGenderCategory{
/**
 *
 *
 * @type {number}
 * @memberof TenrxGenderCategory
 */
id: number;

/**
 *
 *
 * @type {string}
 * @memberof TenrxGenderCategory
 */
name: string;

/**
 *
 *
 * @type {number}
 * @memberof TenrxGenderCategory
 */
treatmentTypeId: number;
   
/**
 *
 *
 * @type {string}
 * @memberof TenrxGenderCategory
 */
photoPath: string;

/**
 *
 *
 * @type {TenrxGenderCategory[]}
 * @memberof TenrxGenderCategory
 */
 genderCategories : TenrxGenderCategory[];



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
     *
     *
     * @static
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