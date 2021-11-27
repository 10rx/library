import { TenrxApiEngine } from "./TenrxApiEngine";
import { TenrxLogger } from "../includes/TenrxLogger";

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
genderCatagory : TenrxGenderCategory[];


/**
 * Creates an instance of TenrxGenderCategory.
 * @param {*} data
 * @param {string} [language='en']
 * @memberof TenrxGenderCategory
 */
constructor(data: any, language: string = 'en') {
        this.id = data.id;
        this.name = (language === 'en') ? data.name : ((language === 'es') ? data.nameEs : data.name);
        this.treatmentTypeId = data.treatmentTypeId;
       
        this.photoPath= data.photoPath;
        this.genderCatagory = data.genderCatagory;
    }

    /**
     *
     *
     * @static
     * @return {*}  {(Promise<TenrxGenderCategory[] | null>)}
     * @memberof TenrxGenderCategory
     */
    public static async GetProductCatagory(): Promise<TenrxGenderCategory[] | null> {
        TenrxLogger.silly('TenrxVisitType.GetGenderCatagory() Started')
        const apiEngine = TenrxApiEngine.Instance;
        if (apiEngine == null) {
            TenrxLogger.error("TenrxApiEngine is not initialized.");
            return null;
            return apiEngine.GetGenderCategory();       }
        TenrxLogger.info('Retrieving gender types.');
        return apiEngine.GetGenderCategory();
    }
}