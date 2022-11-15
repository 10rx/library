/* eslint-disable @typescript-eslint/naming-convention */
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
  TenrxShippingType,
  CartItemBasic,
  CheckoutRequest,
  TenrxCreditCard,
  TenrxStreetAddress,
  TenrxExternalPharmacyInformation,
  TenrxPharmacyType,
  TenrxStateIdToStateName,
  TenrxEnumCountry,
  TenrxCartCheckoutResult,
} from '../index.js';

import EventEmitter from 'events';

/* eslint-disable no-underscore-dangle */
export default class TenrxCartEngine extends EventEmitter {
  private static _instance: TenrxCartEngine | null = null;
  private engine: TenrxApiEngine;

  /**
   * Cached cart from server
   *
   * @private
   * @type {CartResponse}
   * @memberof TenrxCartEngine
   */
  private cart: CartResponse = {
    promotionCode: null,
    items: [],
    taxRate: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    discount: 0,
    shipping: 0,
    shippingType: TenrxShippingType.Standard,
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

  public get shippingType() {
    return this.cart.shippingType;
  }

  public get count() {
    return this.cart.items.filter((i) => !i.hidden).reduce((a, b) => a + b.quantity, 0);
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
      this.emit(
        'count',
        this.cart.items.filter((i) => !i.hidden).reduce((a, b) => a + b.quantity, 0),
      );
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
    refresh,
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
    refresh?: boolean;
  }) {
    const items: CartItem[] = [];

    if (item) {
      const strengthMatch =
        strength !== '-1'
          ? item.strengthLevels.find((x) => x.strengthLevel === strength)
          : { strengthLevel: '-1', price: item.price };

      items.push({
        id: item.id,
        name: item.name,
        nameEs: item.name,
        description: item.description,
        image: item.photoPaths[0] || null,
        isRx: item.rx,
        isFee: false,
        strength: strength || null,
        price: strengthMatch ? strengthMatch.price : item.price,
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
          description: null,
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

    const response = await this.engine.promotions.request({
      slug: '/v1/cart',
      method: 'post',
      body: {
        items,
        taxDetails: taxDetails || this.cart.taxDetails,
      },
    });

    if (response.statusCode !== 200) throw new Error(response.message);

    if (refresh !== false) await this.refresh();
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

  public async clear() {
    try {
      const response = await this.engine.promotions.request({
        slug: '/v1/cart/clear',
        method: 'post',
      });

      if (response.statusCode !== 200) TenrxLibraryLogger.error('Error clearing cart', response.message);
      await this.refresh();
    } catch (error) {
      TenrxLibraryLogger.error('Error clearing cart', error);
    }
  }

  public async changeFee(oldFee: TenrxFeeItem, newFee: TenrxFeeItem, visitType?: number) {
    const items: CartItemBasic[] = [];
    const newFees = [];
    for (const item of this.cart.items) {
      if (item.id !== oldFee) continue;
      if (visitType && item.visitType !== visitType) continue;
      items.push({
        id: item.id,
        strength: item.strength,
        visitType: item.visitType,
        quantity: -item.quantity,
      });
      newFees.push(
        this.addItem({
          feeID: newFee,
          quantity: 1,
          visitType: item.visitType,
          refresh: false,
        }),
      );
    }

    if (!items.length) return;

    await this.editItems(items, false);
    await Promise.all(newFees);
  }

  public async editItems(items: CartItemBasic[], refresh = true) {
    await this.engine.promotions.request({
      slug: '/v1/cart/quantity',
      method: 'post',
      body: items,
    });
    if (refresh) await this.refresh();
  }

  public async setShipping({
    shippingType,
    external,
    refresh,
  }: {
    shippingType?: TenrxShippingType;
    external?: boolean;
    refresh?: boolean;
  }) {
    await this.engine.promotions.request({
      slug: '/v1/cart/shipping',
      method: 'post',
      body: {
        externalPharmacy: external ?? this.cart.externalPharmacy,
        shippingType: shippingType ?? this.cart.shippingType,
      },
    });
    if (refresh) await this.refresh();
  }

  public async setPromotion(code: string | null) {
    const response = await this.engine.promotions.request({
      slug: '/v1/cart/promotion',
      method: 'post',
      body: {
        code,
      },
    });
    if (response.statusCode !== 200) return false;
    await this.refresh();
    return true;
  }

  public async checkout({
    paymentNonce,
    card,
    shippingAddress,
    pharmacyInfo,
    timeout,
  }: {
    paymentNonce: string | null;
    card: TenrxCreditCard;
    shippingAddress: TenrxStreetAddress;
    pharmacyInfo: TenrxExternalPharmacyInformation | null;
    timeout?: number;
  }) {
    const request: CheckoutRequest = {
      paymentNonce,
      shippingType: this.shippingType,
      pharmacyType: pharmacyInfo ? TenrxPharmacyType.External : TenrxPharmacyType.Internal,
      couponCode: this.cart.promotionCode || null,
      shippingFees: this.shipping,
      cardDetails: {
        paymentID: card.paymentID,
        firstName: card.firstName,
        lastName: card.lastName,
        brand: card.brand,
        last4: card.last4,
        exp_month: Number(card.expMonth),
        exp_year: Number(card.expYear),
        billingAddress: {
          addressLine1: card.address.address1,
          addressLine2: card.address.address2 || null,
          city: card.address.city,
          state: TenrxStateIdToStateName[card.address.stateId],
          zipCode: card.address.zipCode,
          country: 'US',
        },
      },
      shippingAddress: {
        addressLine1: shippingAddress.address1,
        addressLine2: shippingAddress.address2 ?? null,
        city: shippingAddress.city,
        state: TenrxStateIdToStateName[shippingAddress.stateId],
        zipCode: shippingAddress.zipCode,
        countryID: TenrxEnumCountry.US,
        phoneNumber: shippingAddress.phone ?? '',
      },
      otherPharmacyAddress: pharmacyInfo
        ? {
            addressLine1: pharmacyInfo.address.address1,
            addressLine2: pharmacyInfo.address.address2 ?? null,
            city: pharmacyInfo.address.city,
            state: TenrxStateIdToStateName[pharmacyInfo.address.stateId],
            zipCode: pharmacyInfo.address.zipCode,
            country: 'US',
            pharmacyName: pharmacyInfo.name,
          }
        : null,
      products: this.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        strength: item.strength,
        refillID: item.refillID,
        images: item.images,
        answers: item.answers,
      })),
    };
    const result: TenrxCartCheckoutResult = {
      checkoutSuccessful: false,
      paymentDetails: null,
      orderDetails: null,
      questionnaireDetails: null,
      patientImagesDetails: null,
    };
    try {
      const response = await this.engine.checkout(request, timeout || 1e4);
      const content = response.content as {
        apiStatus: { statusCode: number; message: string };
        data: {
          orderNumber?: string;
        };
      };
      result.paymentDetails = {
        paymentSuccessful: content.apiStatus.statusCode === 200,
        paymentMessage: content.apiStatus.message,
        paymentId: 0,
        paymentStatusCode: content.apiStatus.statusCode,
      };
      result.orderDetails = {
        orderPlacementMessage: '',
        orderPlacementStatusCode: content.apiStatus.statusCode,
        orderPlacementSuccessful: content.apiStatus.statusCode === 200,
        invoiceNumber: content.data.orderNumber ?? '',
      };
      if (result.orderDetails.invoiceNumber) result.checkoutSuccessful = true;
    } catch (error) {
      TenrxLibraryLogger.error('cart.checkout():', error);
    }
    await this.clear();
    return result;
  }

  private constructor(engine = useTenrxApi()) {
    super();
    this.engine = engine;
  }

  public static get instance(): TenrxCartEngine {
    if (TenrxCartEngine._instance === null) {
      TenrxCartEngine._instance = new TenrxCartEngine();
    }
    return TenrxCartEngine._instance;
  }
}
