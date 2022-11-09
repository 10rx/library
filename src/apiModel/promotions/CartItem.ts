export default interface CartItem {
  id: number;
  name: string;
  nameEs: string;
  image: string | null;
  isRx: boolean;
  isFee: boolean;
  strength: string | null;
  price: number;
  quantity: number;
  visitType: number;
  images: string[];
  answers: Answer[];
  hidden: boolean;
  refillID: number | null;
}

interface Answer {
  id: number;
  answer: string;
}
