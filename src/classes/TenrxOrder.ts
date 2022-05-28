import TenrxGetDoctorAvailabilityForPatientAPIModel from '../apiModel/TenrxGetDoctorAvailabilityForPatientAPIModel.js';
import TenrxOrderAPIModel from '../apiModel/TenrxOrderAPIModel.js';
import { TenrxShippingType } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxAppointment from '../types/TenrxAppointment.js';
import TenrxMeetingInformation from '../types/TenrxMeetingInformation.js';
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


  /**
   * The shipping speed of the order
   *
   * @type {TenrxShippingType}
   * @memberof TenrxOrder
   */
  public shippingType: TenrxShippingType;

  private internalOrderProducts: TenrxOrderProductEntry[];

  /**
   * Gets the products of the order.
   *
   * @readonly
   * @type {TenrxOrderProductEntry[]}
   * @memberof TenrxOrder
   */
  public get orderProducts(): TenrxOrderProductEntry[] {
    return this.internalOrderProducts;
  }

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
    this.shippingType = 0;
    if (orderData) {
      this.processOrderData(orderData);
    }
  }

  private processOrderData(orderData: TenrxOrderAPIModel) {
    this.orderId = orderData.orderNumber;
    this.orderDate = new Date(orderData.orderDate);
    this.totalPrice = orderData.totalPrice;
    this.shippingType = orderData.shippingType;
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
   * Joins the meeting for this order.
   *
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {Promise<TenrxMeetingInformation>} - The meeting information.
   * @memberof TenrxOrder
   */
  public async joinMeeting(apiEngine = useTenrxApi()): Promise<TenrxMeetingInformation> {
    const result: TenrxMeetingInformation = {
      meetingSuccessful: false,
      meetingMessageDetails: {
        message: '',
        errorMessage: '',
      },
      meetingData: null,
    };
    try {
      const response = await apiEngine.joinMeeting(this.orderId);
      if (response.status === 200) {
        const content = response.content as {
          data: { chimeMeetingResponse: any; chimeAttendeeResponse: any };
          apiStatus: { statusCode: number; message: string; appError: string };
        };
        if (content) {
          if (content.data) {
            const data = content.data;
            const apiStatus = content.apiStatus;
            if (apiStatus) {
              result.meetingMessageDetails.message = apiStatus.message;
              result.meetingMessageDetails.errorMessage = apiStatus.appError;
              if (apiStatus.statusCode === 200) {
                result.meetingSuccessful = true;
                result.meetingData = data;
              } else {
                TenrxLibraryLogger.error('Error joining meeting', apiStatus);
              }
            } else {
              TenrxLibraryLogger.error('The response apiStatus is null.');
              result.meetingMessageDetails.errorMessage = 'The response apiStatus is null.';
            }
          } else {
            TenrxLibraryLogger.error('The response data is null.');
            result.meetingMessageDetails.errorMessage = 'The response data is null.';
          }
        } else {
          TenrxLibraryLogger.error('The response content is null.');
          result.meetingMessageDetails.errorMessage = 'The response content is null.';
        }
      } else {
        TenrxLibraryLogger.error('Error joining meeting', response);
        result.meetingMessageDetails.errorMessage = 'Error joining meeting. Response status is not 200.';
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error joining meeting', error);
      result.meetingMessageDetails.errorMessage = 'Error joining meeting. Unhandled exception.';
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
