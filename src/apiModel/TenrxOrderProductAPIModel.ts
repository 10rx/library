export default interface TenrxOrderProductAPIModel {
  productId: number;
  productName: string;
  productDetails: string;
  quantity: number;
  price: string;
  amount: number;
  strength: string;
  category: string;
  treatmentType: string;
  status: string;
  photoPaths: string[];
  photoThumbnailPath: string;
  isRx: boolean;
}
