import { TenrxLogger } from "../includes/TenrxLogger";
import { useTenrxApi } from "..";
import TenrxProductCategoryAPIModel from "../apiModel/TenrxProductCategoryAPIModel";

/**
 * Represents a Tenrx Product Category
 *
 * @export
 * @class TenrxProductCatagory
 */
export class TenrxProductCategory {


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
    productCatagories : TenrxProductCategory[]

    /**
     * Creates an instance of TenrxProductCategory.
     * 
     * @param {TenrxProductCategoryAPIModel} data - The data to be used to create the instance.
     * @param {string} [language='en'] - The language to be used to create the instance.
     * @memberof TenrxProductCategory
     */
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
    public static async getProductCategory(id: number, language = 'en', apiEngine = useTenrxApi()): Promise<TenrxProductCategory[] | null> {
        TenrxLogger.silly('TenrxVisitType.GetProductCatagory() Started')            
        if (apiEngine == null) {
            TenrxLogger.fatal("TenrxApiEngine is not initialized.");
            return null;
        }
        const result: TenrxProductCategory[] = [];
        TenrxLogger.info('Retrieving product categories types.');
        const response = await apiEngine.getProductCategory(id);
        if (response.status === 200) {
            TenrxLogger.debug('GetProductCategory() Response: ', response.content);
            const content = response.content as { data: TenrxProductCategoryAPIModel[] };
            if (content) {
                if (content.data) {
                    TenrxLogger.info('Total Product Catagory received from API: ', content.data.length);
                    for (const productCategory of content.data) {
                        result.push(new TenrxProductCategory(productCategory, language));
                    }                    
                    return result;
                } else {
                    TenrxLogger.error('API returned data as null when getting Product Category. Content of error is: ', response.error);
                    return null;
                }
            } else {
                TenrxLogger.error('API returned content as null when getting Product Category. Content of error is: ', response.error);
                return null;
            }
        } else {
            TenrxLogger.error('GetProductCategory() Error: ', response.error);
            return null;
        }
    }
}