import TenrxApiEngine from "./TenrxApiEngine";
import { TenrxLogger } from "../includes/TenrxLogger";
/**
 *
 *
 * @export
 * @class TenrxProductCatagory
 */
export class TenrxProductCategory{


    /**
     *
     *
     * @type {number}
     * @memberof TenrxProductCatagory
     */
    id: number;

    /**
     *
     *
     * @type {string}
     * @memberof TenrxProductCatagory
     */
    name: string;

    /**
     *
     *
     * @type {number}
     * @memberof TenrxProductCatagory
     */
    treatmentTypeId: number;
        visitTypeCategoryId: null;
        
        Active: boolean;
        photoPath: string;
      productCatagories : TenrxProductCategory[]

        constructor(data: any, language: string = 'en') {
            this.id = data.id;
            this.name = (language === 'en') ? data.name : ((language === 'es') ? data.nameEs : data.name);
            this.treatmentTypeId = data.treatmentTypeId;
            this.visitTypeCategoryId= data.visitTypeCategoryId;
            this.Active= data.isActive;
            
            this.photoPath= data.photoPath;
            this.productCatagories = data.productCatagories;
        }

        public static async GetProductCategory(): Promise<TenrxProductCategory[] | null> {
            TenrxLogger.silly('TenrxVisitType.GetProductCatagory() Started')
            const apiEngine = TenrxApiEngine.instance;
            if (apiEngine == null) {
                TenrxLogger.error("TenrxApiEngine is not initialized.");
                return null;
                return apiEngine.getProductCategory();       }
            TenrxLogger.info('Retrieving visit types.');
            return apiEngine.getProductCategory();
        }
}