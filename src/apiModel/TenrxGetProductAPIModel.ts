export default interface TenrxGetProductAPIModel {
  id: number;
  name: string;
  nameEs: string;
  visitType: number;
  category: number;
  gender: number;
  isRx: boolean;
  questionnaireID: number;
  images: string[];
  description: string;
  descriptionEs: string;
  precautions: string;
  precautionsEs: string;
  variants: Variant[];
}

interface Variant {
  strength: string | null;
  price: number;
  description: string | null;
  descriptionEs: string | null;
}
