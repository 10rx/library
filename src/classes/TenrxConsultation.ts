/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/naming-convention */
import { Consultation, ConsultationOption, Language, TenrxLoadError, TenrxProduct, useTenrxApi } from '../index.js';

export default class TenrxConsultation {
  readonly ID: number;
  readonly options: TenrxConsultationOption[];
  selected: number | null = null;

  constructor(data: Consultation) {
    this.ID = data.id;
    this.options = data.options.map((option) => new TenrxConsultationOption(option));
  }

  static async load(ID: number, engine = useTenrxApi()) {
    const consultation = await engine.getConsultation(ID);
    if (!consultation.data)
      throw new TenrxLoadError('No consultation found', 'TenrxConsultation', 'No consultation found');
    return new TenrxConsultation(consultation.data);
  }

  static async loadAll(engine = useTenrxApi()) {
    const consultations = await engine.getConsultations();
    if (!consultations.data.length)
      throw new TenrxLoadError('No consultations found', 'TenrxConsultation', 'No consultations found');
    return consultations.data.map((consultation) => new TenrxConsultation(consultation));
  }

  getSelected() {
    return this.options.find((option) => option.ID === this.selected);
  }
}

class TenrxConsultationOption {
  readonly ID: number;
  readonly visitType: Language;
  readonly visitTypeID: number;
  readonly preferencesTitle: Language;
  readonly preferencesDescription: Language;
  readonly usageTitle: Language;
  readonly productIDs: number[];
  products: TenrxProduct[] = [];

  constructor(data: ConsultationOption) {
    this.ID = data.id;
    this.visitType = data.visitType;
    this.visitTypeID = data.visitTypeID;
    this.preferencesTitle = data.preferencesTitle;
    this.preferencesDescription = data.preferencesDescription;
    this.usageTitle = data.usageTitle;
    this.productIDs = data.products;
  }

  async loadProducts() {
    this.products = (await Promise.all(this.productIDs.map((ID) => TenrxProduct.getProductByID(ID)))).filter(
      (product) => product !== null,
    ) as TenrxProduct[];
  }
}
