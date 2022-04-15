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
  photoPath: string;
  photoThumbnailPath: string;
  isRx: boolean;
}
