import TenrxGetDoctorAvailabilityForPatientAPIModel from '../apiModel/TenrxGetDoctorAvailabilityForPatientAPIModel.js';
import TenrxOrderAPIModel from '../apiModel/TenrxOrderAPIModel.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxAppointment from '../types/TenrxAppointment.js';
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

  /**
   * Gets the possibles appointment date of the order giving a date range.
   *
   * @param {Date} startDate - The start date of the range.
   * @param {Date} endDate - The end date of the range.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {TenrxAppointment[]} - The list of possible appointment dates.
   * @memberof TenrxOrder
   */
  public async getPossibleAppointmentDates(
    startDate: Date,
    endDate: Date,
    apiEngine = useTenrxApi(),
  ): Promise<TenrxAppointment[]> {
    const result: TenrxAppointment[] = [];
    try {
      const response = await apiEngine.getDoctorAvailabilityForPatient(this.orderId, startDate, endDate);
      if (response.status === 200) {
        const content = response.content as { data: TenrxGetDoctorAvailabilityForPatientAPIModel; statusCode: number };
        if (content) {
          if (content.data) {
            if (content.statusCode === 200) {
              const doctorName = content.data.doctorName;
              if (content.data.appointmentSlots && content.data.appointmentSlots.length > 0) {
                content.data.appointmentSlots.forEach((appointment) => {
                  result.push({
                    doctorName,
                    startDate: new Date(appointment.slotStartTime),
                    endDate: new Date(appointment.slotEndTime),
                  });
                });
              }
            } else {
              TenrxLibraryLogger.error('Error getting possible appointment dates', content.data);
            }
          } else {
            TenrxLibraryLogger.error('The response content is null.');
          }
        } else {
          TenrxLibraryLogger.error('The response content is null.');
        }
      } else {
        TenrxLibraryLogger.error(`Error getting possible appointment dates for order ${this.orderId}`, response);
      }
    } catch (error) {
      TenrxLibraryLogger.error(`Error getting possible appointment dates for order ${this.orderId}`, error);
    }
    return result;
  }

  /**
   * Schedules an appointment for the order.
   *
   * @param {TenrxAppointment} appointment - The appointment to schedule.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @memberof TenrxOrder
   */
  public async scheduleAppointment(appointment: TenrxAppointment, apiEngine = useTenrxApi()): Promise<void> {
    try {
      const response = await apiEngine.createAppointment(this.orderId, appointment.startDate);
      if (response.status === 200) {
        const content = response.content as { statusCode: number };
        if (content) {
          if (content.statusCode === 200) {
            TenrxLibraryLogger.info('Appointment scheduled.');
          } else {
            TenrxLibraryLogger.error('Error scheduling appointment.', content);
          }
        } else {
          TenrxLibraryLogger.error('The response content is null.');
        }
      } else {
        TenrxLibraryLogger.error('Error scheduling appointment.', response);
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error scheduling appointment.', error);
    }
  }
}
