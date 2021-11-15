import { TenrxApiEngine } from "./TenrxApiEngine";
import { TenrxLogger } from "../includes/TenrxLogger";

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
     * The name of the visit type in Spanish.
     *
     * @type {string}
     * @memberof TenrxVisitType
     */
    visitTypeEs: string;
    
    /**
     * The short name of the visit type in Spanish.
     *
     * @type {string}
     * @memberof TenrxVisitType
     */
    shortVisitTypeEs: string;
    
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
     * Indicates if the visit type is already exist.
     *
     * @type {boolean}
     * @memberof TenrxVisitType
     */
    isVisitAlreadyExist: boolean;
    
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
    constructor(data: any) {
        this.id = data.id;
        this.visitType = data.visitType;
        this.visitTypeEs = data.visitTypeEs;
        this.shortVisitTypeEs = data.shortVisitTypeEs;
        this.displayOrder = data.displayOrder;
        this.parentVisitTypeId = data.parentVisitTypeId;
        this.level = data.level;
        this.isVisitAlreadyExist = data.isVisitAlreadyExist;
        this.photoPath = data.photoPath;
        this.visitTypeListings = data.visitTypeListings;
    }

    /**
     * Gets all the visit types
     *
     * @static
     * @return {*}  {(Promise<TenrxVisitType[] | null>)}
     * @memberof TenrxVisitType
     */
    public static async GetVisitTypes(): Promise<TenrxVisitType[] | null> {
        TenrxLogger.silly('TenrxVisitType.GetVisitTypes() Started')
        const apiEngine = TenrxApiEngine.Instance;
        if (apiEngine == null) {
            TenrxLogger.error("TenrxApiEngine is not initialized.");
            return null;
        }
        TenrxLogger.info('Retrieving visit types.');
        return apiEngine.GetVisitTypes();
    }
}