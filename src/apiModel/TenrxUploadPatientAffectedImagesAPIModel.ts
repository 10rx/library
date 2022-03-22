export default interface TenrxUploadPatientAffectedImagesAPIModel {
  patientId: number;
  visitTypeId: number;
  patientImages: {
    data: string;
    ext: string;
    fileName: string;
    type: string;
  }[];
}
