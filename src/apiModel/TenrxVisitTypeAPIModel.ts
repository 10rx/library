/**
 * Represents the structure of the VisitType API response.
 *
 * @export
 * @interface TenrxVisitTypeAPIModel
 */
export default interface TenrxVisitTypeAPIModel {
    
    /**
     * The id of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitTypeAPIModel
     */
    id: number;
    
    /**
     * The name of the visit type.
     *
     * @type {string}
     * @memberof TenrxVisitTypeAPIModel
     */
    visitType: string;
    
    /**
     * The name of the visit type in spanish
     *
     * @type {string}
     * @memberof TenrxVisitTypeAPIModel
     */
    visitTypeEs: string;
    
    /**
     * The display order of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitTypeAPIModel
     */
    displayOrder: number;
    
    /**
     * The level of the visit type.
     *
     * @type {number}
     * @memberof TenrxVisitTypeAPIModel
     */
    level: number;
    
    /**
     * The id of the parent visit type.
     *
     * @type {number}
     * @memberof TenrxVisitTypeAPIModel
     */
    parentVisitTypeId: number;
    
    /**
     * The photo path of the visit type.
     *
     * @type {string}
     * @memberof TenrxVisitTypeAPIModel
     */
    photoPath: string;
    
    /**
     * The list of sub visit types.
     *
     * @type {TenrxVisitTypeAPIModel[]}
     * @memberof TenrxVisitTypeAPIModel
     */
    visitTypeListings: TenrxVisitTypeAPIModel[];
}