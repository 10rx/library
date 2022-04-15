export default interface TenrxUploadPatientAffectedImagesAPIModel {
  visitTypeId: number;
  patientImages: {
    data: string;
    ext: string;
    fileName: string;
    type: string;
  }[];
}
