export default interface TenrxGenderCategoryAPIModel {
  id: number;
  name: string;
  isActive: boolean;
  nameEs: string;
  treatmentTypeId: number;
  visitTypeCategoryId: number;
  photoPath: string;
  genderCategories: TenrxGenderCategoryAPIModel[];
  shortDescription?: string;
  description?: string;
}
