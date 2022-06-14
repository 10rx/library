export default interface TenrxVisitTypeAPIModel {
  id: number;
  visitType: string;
  visitTypeEs: string;
  displayOrder: number;
  level: number;
  parentVisitTypeId: number;
  photoPaths: string[];
  visitTypeListings: TenrxVisitTypeAPIModel[];
  shortDescription?: string;
  description?: string;
}
