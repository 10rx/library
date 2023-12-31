import { DateTime } from 'luxon';
import TenrxAPIModel from '../apiModel/TenrxAPIModel.js';
import TenrxGetDoctorAvailabilityForPatientAPIModel from '../apiModel/TenrxGetDoctorAvailabilityForPatientAPIModel.js';
import TenrxOrderAPIModel from '../apiModel/TenrxOrderAPIModel.js';
import TenrxOrderDetailsModel from '../apiModel/TenrxOrderDetailsModel.js';
import { TenrxShippingType, TenrxFeeItem, TenrxOrderStatusID, TenrxOrderStatus } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxMeetingInformation from '../types/TenrxMeetingInformation.js';
import TenrxOrderDetailsResult from '../types/TenrxOrderDetailsResult.js';
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
   * External pharmacy address
   */
  public externalPharmacyAddress: {
    pharmacyName: string;
    apartmentNumber: string;
    address1: string;
    address2: string;
    city: string;
    stateName: string;
    zipCode: string;
    country: string;
  } | null = null;

  private internalStatusID: TenrxOrderStatusID;

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
    this.internalStatusID = 0;
    if (orderData) {
      this.processOrderData(orderData);
    }
  }

  private processOrderData(orderData: TenrxOrderAPIModel) {
    this.orderId = orderData.orderNumber;
    this.orderDate = new Date(orderData.orderDate);
    this.totalPrice = orderData.totalPrice;
    this.shippingType = orderData.shippingType;
    this.externalPharmacyAddress = orderData.externalPharmacyAddress;
    this.internalStatusID = orderData.orderStatusId;
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
          photoPaths: orderProduct.photoPaths
            ? orderProduct.photoPaths.filter((img) => img.length)
            : orderProduct.photoPath?.length
            ? [orderProduct.photoPath]
            : [],
          photoThumbnailPath: orderProduct.photoThumbnailPath,
          isFee: Object.values(TenrxFeeItem).includes(orderProduct.productId),
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
    return TenrxOrderStatus[this.internalStatusID];
  }

  /**
   * The status ID of the order
   *
   * @readonly
   * @type {TenrxOrderStatusID}
   * @memberof TenrxOrder
   */
  public get statusID(): TenrxOrderStatusID {
    return this.internalStatusID;
  }

  /**
   * Gets the possibles appointment date of the order giving a date range.
   *
   * @param {Date} startDate - The start date of the range.
   * @param {Date} endDate - The end date of the range.
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @return {*}  {{
      doctorName: string;
      startDate: Date;
      endDate: Date;
    }[]} - The list of possible appointment dates.
   * @memberof TenrxOrder
   */
  public async getPossibleAppointmentDates(
    startDate: Date,
    endDate: Date,
    apiEngine = useTenrxApi(),
  ): Promise<
    {
      doctorName: string;
      startDate: Date;
      endDate: Date;
    }[]
  > {
    const result: {
      doctorName: string;
      startDate: Date;
      endDate: Date;
    }[] = [];
    try {
      const response = await apiEngine.getDoctorAvailabilityForPatient(this.orderId, startDate, endDate);
      if (response.status === 200) {
        const content = response.content as TenrxAPIModel<TenrxGetDoctorAvailabilityForPatientAPIModel>;
        if (content) {
          if (content.data) {
            if (content.apiStatus.statusCode === 200) {
              const doctorName = content.data.doctorName;
              if (content.data.appointmentSlots && content.data.appointmentSlots.length > 0) {
                content.data.appointmentSlots.forEach((appointment) => {
                  result.push({
                    doctorName,
                    startDate: DateTime.fromFormat(appointment.slotStartTime, 'MM/dd/yyyy HH:mm:ss', {
                      zone: 'utc',
                    }).toJSDate(),
                    endDate: DateTime.fromFormat(appointment.slotEndTime, 'MM/dd/yyyy HH:mm:ss', {
                      zone: 'utc',
                    }).toJSDate(),
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
   * @param {Date} startDate - The time for the appointment to be scheduled
   * @param {*} [apiEngine=useTenrxApi()] - The api engine to use.
   * @memberof TenrxOrder
   */
  public async scheduleAppointment(startDate: Date, apiEngine = useTenrxApi()): Promise<{ error: string | null }> {
    try {
      const response = await apiEngine.createAppointment(this.orderId, startDate);
      const value: { error: string | null } = { error: null };
      if (response.status === 200) {
        const content = response.content as TenrxAPIModel<undefined>;
        if (content) {
          if (content.apiStatus.statusCode === 200) {
            TenrxLibraryLogger.info('Appointment scheduled.');
          } else {
            value.error = content.apiStatus.message;
            TenrxLibraryLogger.error('Error scheduling appointment.', content);
          }
        } else {
          value.error = 'No response from server';
          TenrxLibraryLogger.error('The response content is null.');
        }
      } else {
        value.error = `Server responded with ${response.status}`;
        TenrxLibraryLogger.error('Error scheduling appointment.', response);
      }
      return value;
    } catch (error) {
      TenrxLibraryLogger.error('Error scheduling appointment.', error);
      return { error: 'Error scheduling appointment' };
    }
  }

  public static async getOrderDetails(orderID: string): Promise<TenrxOrderDetailsResult | { error: string }> {
    try {
      const response = await useTenrxApi().getOrderDetails(orderID);
      const content = response.content as TenrxAPIModel<TenrxOrderDetailsModel>;

      if (!response.content || content.apiStatus.statusCode === 500) return { error: 'Server error' };
      if (content.apiStatus.statusCode === 404) return { error: 'Unknown order' };

      const orderDetails: TenrxOrderDetailsResult = {
        tax: content.data.tax,
        total: content.data.total,
        datePlaced: new Date(content.data.datePlaced),
        subtotal: content.data.subtotal,
        shippingFee: content.data.shippingCost,
        orderStatus: content.data.status,
        shippingType: content.data.shippingType,
        discount: content.data.discount,
        last4: content.data.last4,
        tracking: {
          id: content.data.trackingNumber,
          carrier: content.data.trackingCarrier,
        },
        doctor: {
          name: content.data.doctorName,
          email: content.data.doctorEmail,
        },
        shippingAddress: {
          address1: content.data.address.address1,
          address2: content.data.address.address2,
          city: content.data.address.city,
          zipCode: content.data.address.zip,
        },
        products: content.data.products,
      };

      return orderDetails;
    } catch (error) {
      TenrxLibraryLogger.error('Error getting order details: ', error);
      return { error: 'Error getting order details' };
    }
  }
}
