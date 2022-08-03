export default interface TenrxUploadPatientAffectedImagesAPIModel {
  orderNumber: string;
  visitTypeId: number;
  patientImages: {
    data: string;
    ext: string;
    fileName: string;
    type: string;
  }[];
}
