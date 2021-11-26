import { TenrxApiEngine } from "./TenrxApiEngine";
import { TenrxLogger } from "../includes/TenrxLogger";
import { useTenrxApi } from "..";

/**
 * Represents a Tenrx visit type.
 *
 * @export
 * @class TenrxVisitType
 */
export class TenrxVisitType {
    /**
     * The id of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitType
     */
    
    /**
     * The id of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitType
     */
    id: number;
    
    /**
     * The name of the visit type.
     *
     * @type {string}
     * @memberof TenrxVisitType
     */
    visitType: string;
    
    /**
     * The display order of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitType
     */
    displayOrder: number;
    
    /**
     * The id of the parent visit type.
     *
     * @type {number}
     * @memberof TenrxVisitType
     */
    parentVisitTypeId: number;
    
    /**
     * The level of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitType
     */
    level: number;
    
    /**
     * The photo path of the visit type.
     *
     * @type {string}
     * @memberof TenrxVisitType
     */
    photoPath: string;
    
    /**
     * The list of sub visit types.
     *
     * @type {TenrxVisitType[]}
     * @memberof TenrxVisitType
     */
    visitTypeListings: TenrxVisitType[];

    /**
     * Creates an instance of TenrxVisitType.
     * @param {number} id - The id of the visit type.
     * @param {string} visitType - The name of the visit type.
     * @param {string} visitTypeEs - The name of the visit type in Spanish.
     * @param {string} shortVisitTypeEs - The short name of the visit type in Spanish.
     * @param {number} displayOrder - The display order of the visit type.
     * @param {number} parentVisitTypeId - The id of the parent visit type.
     * @param {number} level - The level of the visit type.
     * @param {boolean} isVisitAlreadyExist - Indicates if the visit type is already exist.
     * @param {string} photoPath - The photo path of the visit type.
     * @param {TenrxVisitType[]} visitTypeListings - The list of sub visit types.
     * @memberof TenrxVisitType
     */
    constructor(data: any, language: string = 'en') {
        this.id = data.id;
        this.visitType = (language === 'en' ) ? data.visitType : ((language === 'es') ? data.visitTypeEs : data.visitType);
        this.displayOrder = data.displayOrder;
        this.parentVisitTypeId = data.parentVisitTypeId;
        this.level = data.level;
        this.photoPath = data.photoPath;
        this.visitTypeListings = [];
        if (data.visitTypeListings) {
            for (const visitTypeListing of data.visitTypeListings) {
                this.visitTypeListings.push(new TenrxVisitType(visitTypeListing, language));
            }
        }
    }

    /**
     * Gets all the visit types
     *
     * @static
     * @param {string} [language='en']
     * @param {TenrxApiEngine} [apiEngine=useTenrxApi()]
     * @return {*}  {(Promise<TenrxVisitType[] | null>)}
     * @memberof TenrxVisitType
     */
    public static async GetVisitTypes(language: string = 'en', apiEngine: TenrxApiEngine = useTenrxApi()): Promise<TenrxVisitType[] | null> {
        TenrxLogger.silly('TenrxVisitType.GetVisitTypes() Started')
        if (apiEngine) {
            const result: TenrxVisitType[] = [];
            TenrxLogger.info('Retrieving visit types.');
            const response = await apiEngine.GetVisitTypes();
            if (response.status === 200) {
                TenrxLogger.debug('Response from API: ', response.content);
                if (response.content) {
                    if (response.content.data) {
                        TenrxLogger.info('Total Visit Types received: ', response.content.data.length);
                        for (const visitType of response.content.data) {
                            result.push(new TenrxVisitType(visitType, language));
                        }                    
                        return result;
                    } else {
                        TenrxLogger.error('API returned data as null when getting visit types. Content of error is: ', response.error);
                        return null;
                    }
                } else {
                    TenrxLogger.error('API returned content as null when getting visit types. Content of error is: ', response.error);
                    return null;
                }
            } else {
                TenrxLogger.error('API returned error: ', response.error);
                return null;
            }
        } else {
            TenrxLogger.fatal("TenrxApiEngine is not initialized.");
            return null;
        }
    }
}