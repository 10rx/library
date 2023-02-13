export default interface Consultation {
  id: number;
  category: Language;
  categoryID: number;
  price: number;
  image: string;
  options: ConsultationOption[];
}

export interface ConsultationOption {
  id: number;
  visitType: Language;
  visitTypeID: number;
  preferencesTitle: Language;
  preferencesDescription: Language;
  usageTitle: Language;
  products: number[];
}

export interface Language {
  english: string;
  spanish: string;
}
