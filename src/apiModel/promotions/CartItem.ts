export default interface CartItem {
  id: number;
  name: string;
  nameEs: string;
  description: string | null;
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
  questionID: number;
  questionnaireID: number;
  answer: string;
}
