export default interface TenrxVisitTypeAPIModel {
    id: number;
    visitType: string;
    visitTypeEs: string;
    displayOrder: number;
    level: number;
    parentVisitTypeId: number;
    photoPath: string;
    visitTypeListings: TenrxVisitTypeAPIModel[];
}