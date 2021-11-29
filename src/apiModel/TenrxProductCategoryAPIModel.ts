export default interface TenrxProductCategoryAPIModel {
    id: number;
    name: string;
    isActive: boolean;
    nameEs: string;
    treatmentTypeId: number;
    visitTypeCategoryId: number;
    photoPath: string;
    productCategories: TenrxProductCategoryAPIModel[];
}