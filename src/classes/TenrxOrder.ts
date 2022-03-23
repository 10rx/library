import TenrxOrderAPIModel from '../apiModel/TenrxOrderAPIModel.js';
import TenrxOrderProductEntry from '../types/TenrxOrderProductEntry.js';

/**
 * Represents a product order.
 *
 * @export
 * @class TenrxOrder
 */
export default class TenrxOrder {
  /**
   * The order id. This is also is known as invoice number
   *
   * @type {string}
   */
  public orderId: string;

  /**
   * The date that the order was placed.
   *
   * @type {Date}
   * @memberof TenrxOrder
   */
  public orderDate: Date;

  /**
   * The total price of the order.
   *
   * @type {number}
   * @memberof TenrxOrder
   */
  public totalPrice: number;

  private internalOrderProducts: TenrxOrderProductEntry[];

  /**
   * Creates an instance of TenrxOrder.
   *
   * @param {TenrxOrderAPIModel} orderData - The data of the order.
   * @memberof TenrxOrder
   */
  constructor(orderData?: TenrxOrderAPIModel) {
    this.internalOrderProducts = [];
    this.orderId = '';
    this.orderDate = new Date();
    this.totalPrice = 0;
    if (orderData) {
      this.processOrderData(orderData);
    }
  }

  private processOrderData(orderData: TenrxOrderAPIModel) {
    this.orderId = orderData.order;
    this.orderDate = new Date(orderData.orderDate);
    this.totalPrice = orderData.totalPrice;
    if (orderData.orderProducts && orderData.orderProducts.length > 0) {
      orderData.orderProducts.forEach((orderProduct) => {
        this.internalOrderProducts.push({
          productId: orderProduct.productId,
          productName: orderProduct.productName,
          productDetails: orderProduct.productDetails,
          quantity: orderProduct.quantity,
          price: Number(orderProduct.price),
          amount: orderProduct.amount,
          strength: orderProduct.strength,
          rx: orderProduct.isRx,
          category: orderProduct.category,
          treatmentType: orderProduct.treatmentType,
          status: orderProduct.status,
          photoPath: orderProduct.photoPath,
          photoThumbnailPath: orderProduct.photoThumbnailPath,
        });
      });
    }
  }

  /**
   * The status of the order.
   *
   * @type {string}
   * @memberof TenrxOrder
   */
  public get status(): string {
    return 'processing';
  }
}
