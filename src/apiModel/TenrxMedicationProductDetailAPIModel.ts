export default interface TenrxMedicationProductDetailAPIModel {
  id: number;
  name: string;
  nameEs: string;
  defaultPrice: string;
  photoPaths: string[];
  treatementType: string;
  isActive: boolean;
  isRx: boolean;
  subCategory: string | null;
  quantity: number;
  expiryDate: string;
  treatmentTypeId: number;
  categoryId: number;
  genderId: number;
  description: string;
  descriptionEs: string;
  precautions: string;
  precautionsEs: string;
  sellingPrice: string;
  medicationQuantityDetails: [
    {
      medicationName: string;
      productName: {
        description: string;
        descriptionEs: string;
      };
      price: number;
      barcode: string;
    },
  ];
}
