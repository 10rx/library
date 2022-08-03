export default interface TenrxTreatmentProductListAPIModel {
  id: number;
  name: string;
  nameEs: string;
  defaultPrice: string;
  totalRecords: number;
  photoPaths: string[];
  subCategoryIcon: string;
  treatementType: string;
  isActive: boolean;
  isRx: boolean;
  subCategory: string | null;
  quantity: number;
  expiryDate: string;
  treatmentTypeId: number;
  categoryId: number;
  genderId: number;
}
