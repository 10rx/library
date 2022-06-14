export default interface TenrxProductCategoryAPIModel {
  id: number;
  name: string;
  isActive: boolean;
  nameEs: string;
  treatmentTypeId: number;
  visitTypeCategoryId: number;
  photoPaths: string[];
  productCategories: TenrxProductCategoryAPIModel[];
  shortDescription?: string;
  description?: string;
}
