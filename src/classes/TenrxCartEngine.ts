import {
  useTenrxApi,
  TenrxApiEngine,
  CartResponse,
  TenrxLibraryLogger,
  CartItem,
  CartTaxDetails,
  TenrxFeeItem,
  TenrxFeeNames,
  TenrxFeeCost,
  TenrxProduct,
  TenrxAPIModel,
  TenrxUploadStagingImage,
} from '../index.js';

/* eslint-disable no-underscore-dangle */
export default class TenrxCartEngine {
  private static _instance: TenrxCartEngine | null = null;
  private engine: TenrxApiEngine;
  private cart: CartResponse = {
    promotionCode: null,
    items: [],
    taxRate: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    discount: 0,
    shipping: 0,
    externalPharmacy: false,
    taxDetails: {
      zip: null,
      state: null,
      city: null,
    },
  };

  public get subtotal() {
    return this.cart.subtotal;
  }

  public get total() {
    return this.cart.total;
  }

  public get discount() {
    return this.cart.discount;
  }

  public get shipping() {
    return this.cart.shipping;
  }

  public get tax() {
    return this.cart.tax;
  }

  public get taxRate() {
    return this.cart.taxRate;
  }

  public get items() {
    return this.cart.items;
  }

  /**
   * Fetch the cart from the server
   *
   * @return {*}
   * @memberof TenrxCartEngine
   */
  public async refresh() {
    try {
      const response = await this.engine.promotions.request<CartResponse>({
        slug: '/v1/cart',
        method: 'get',
      });

      if (response.statusCode !== 200) {
        TenrxLibraryLogger.error('Error refreshing cart', response.message);
        return;
      }

      this.cart = response.data;
    } catch (error) {
      TenrxLibraryLogger.error('Error refreshing cart', error);
    }
  }

  public async addItem({
    item,
    taxDetails,
    feeID,
    visitType,
    strength,
    quantity,
    images,
    answers,
    refillID,
  }: {
    item?: TenrxProduct;
    taxDetails?: CartTaxDetails;
    feeID?: TenrxFeeItem;
    visitType?: number;
    strength?: string | null;
    quantity?: number;
    images?: string[];
    answers?: CartItem['answers'];
    refillID?: number;
  }) {
    const items: CartItem[] = [];

    if (item) {
      items.push({
        id: item.id,
        name: item.name,
        nameEs: item.name,
        image: item.photoPaths[0] || null,
        isRx: item.rx,
        isFee: false,
        strength: strength || null,
        price: item.price,
        quantity: quantity || 1,
        visitType: item.treatmentTypeId,
        images: images || [],
        answers: answers || [],
        hidden: false,
        refillID: refillID || null,
      });
    }

    if (feeID) {
      const exists = this.cart.items.find((p) =>
        visitType ? p.id === feeID && p.visitType === visitType : p.id === feeID,
      );
      if (!exists) {
        const isConsultation = feeID === TenrxFeeItem.Consultation || feeID === TenrxFeeItem.ConsultationFree;
        items.push({
          id: feeID,
          name: TenrxFeeNames[feeID],
          nameEs: TenrxFeeNames[feeID],
          image: isConsultation ? '/consultWithADoctor.png' : null,
          isRx: true,
          isFee: true,
          strength: null,
          price: TenrxFeeCost[feeID],
          quantity: 1,
          visitType: visitType as number,
          images: !item && images?.length ? images : [],
          answers: !item && answers?.length ? answers : [],
          hidden: !isConsultation,
          refillID: null,
        });
      }
    }

    if (!items.length) return;

    const response = await this.engine.promotions.request<unknown>({
      slug: '/v1/cart',
      method: 'post',
      body: {
        items,
        taxDetails: taxDetails || this.cart.taxDetails,
      },
    });

    if (response.statusCode !== 200) throw new Error(response.message);

    await this.refresh();
  }

  public async uploadStagingImages(images: TenrxUploadStagingImage[], apiEngine = useTenrxApi()) {
    try {
      const response = await apiEngine.uploadStagingImages(images);
      const content = response.content as TenrxAPIModel<{ success: string[]; fail: string[] }>;
      return content.data;
    } catch (error) {
      throw error;
    }
  }

  private constructor(engine = useTenrxApi()) {
    this.engine = engine;
  }

  public static get instance(): TenrxCartEngine {
    if (TenrxCartEngine._instance === null) {
      TenrxCartEngine._instance = new TenrxCartEngine();
    }
    return TenrxCartEngine._instance;
  }
}
