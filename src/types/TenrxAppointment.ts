/**
 * Represents a tenrx appointment.
 *
 * @export
 * @interface TenrxAppointment
 */
export default interface TenrxAppointment {
  /**
   * The doctor whom the appointment is for.
   *
   * @type {string}
   * @memberof TenrxAppointment
   */
  doctorName: string;

  /**
   * The date that the appointment is supposed to start.
   *
   * @type {Date}
   * @memberof TenrxAppointment
   */
  startDate: Date;

  /**
   * The date that the appointment is supposed to end.
   *
   * @type {Date}
   * @memberof TenrxAppointment
   */
  endDate: Date;

  /**
   * Order number the appointment is for
   *
   * @type {string}
   * @memberof TenrxAppointment
   */
  orderNumber: string;

  /**
   * The duration of the meeting
   *
   * @type {number}
   * @memberof TenrxAppointment
   */
  defaultDuration: number;

  /**
   * Status code?
   *
   * @type {number}
   * @memberof TenrxAppointment
   */
  appointmentStatusCode: number;

  /**
   * Cancel Type
   *
   * @type {number}
   * @memberof TenrxAppointment
   */
  cancelTypeId: number;

  /**
   * Cancel reason
   *
   * @type {(string | null)}
   * @memberof TenrxAppointment
   */
  cancelReason: string | null;
}
