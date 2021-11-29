import { TenrxLogger } from "../includes/TenrxLogger";
import { useTenrxApi } from "..";
import TenrxProductCategoryAPIModel from "../apiModel/TenrxProductCategoryAPIModel";
/**
 *
 *
 * @export
 * @class TenrxProductCatagory
 */
export class TenrxProductCategory {


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
    visitTypeCategoryId: number | null;
        
    active: boolean;
    photoPath: string;
    productCatagories : TenrxProductCategory[]

        constructor(data: TenrxProductCategoryAPIModel, language = 'en') {
            this.id = data.id;
            this.name = (language === 'en') ? data.name : ((language === 'es') ? data.nameEs : data.name);
            this.treatmentTypeId = data.treatmentTypeId;
            this.visitTypeCategoryId= data.visitTypeCategoryId;
            this.active= data.isActive;
            this.photoPath= data.photoPath;
            this.productCatagories = [];
            if (data.productCategories) {
                data.productCategories.forEach(element => {
                    this.productCatagories.push(new TenrxProductCategory(element, language));
                });
            }
        }

        public static async getProductCategory(language = 'en', apiEngine = useTenrxApi()): Promise<TenrxProductCategory[] | null> {
            TenrxLogger.silly('TenrxVisitType.GetProductCatagory() Started')            
            if (apiEngine == null) {
                TenrxLogger.fatal("TenrxApiEngine is not initialized.");
                return null;
            }
            const result: TenrxProductCategory[] = [];
            TenrxLogger.info('Retrieving product categories types.');
            const response = await apiEngine.getProductCategory();
            if (response.status === 200) {
                TenrxLogger.debug('GetProductCategory() Response: ', response.content);
                const content = response.content as { data: TenrxProductCategoryAPIModel[] };
                if (content) {
                    if (content.data){
                        TenrxLogger.info('Total Product Catagory received from API: ', content.data.length);
                        for (const productCategory of content.data) {
                            result.push(new TenrxProductCategory(productCategory, language));
                        }                    
                        return result;
                    } else {
                        TenrxLogger.error('API returned data as null when getting Product Category. Content of error is: ', response.error);
                        return null;
                    }
                } else
                {
                    TenrxLogger.error('API returned content as null when getting Product Category. Content of error is: ', response.error);
                    return null;
                }
                
            } else {
                TenrxLogger.error('GetProductCategory() Error: ', response.error);
                return null;
            }
        }
}