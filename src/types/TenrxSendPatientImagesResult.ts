/**
 * Represents the result of the backend servers after sending the patient images.
 *
 * @export
 * @interface TenrxSendPatientImagesResult
 */
export default interface TenrxSendPatientImagesResult {
  /**
   * True if the patient Images were sent successfully. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxSendAnswersResult
   */
  patientImagesSent: boolean;

  /**
   * This is the message from the backend servers.
   *
   * @type {string}
   * @memberof TenrxSendAnswersResult
   */
  patientImagesSentMessage: string;

  /**
   * The server response code.
   *
   * @type {number}
   * @memberof TenrxSendAnswersResult
   */
  patientImagesSentStatusCode: number;
}
