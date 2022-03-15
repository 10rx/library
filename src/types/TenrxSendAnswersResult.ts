/**
 * Represents the result of the backend servers after sending the answers to the questionnaire.
 *
 * @export
 * @interface TenrxSendAnswersResult
 */
export default interface TenrxSendAnswersResult {
  /**
   * True if the answers were sent successfully. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxSendAnswersResult
   */
  answersSent: boolean;
  
  /**
   * This is the message from the backend servers.
   *
   * @type {string}
   * @memberof TenrxSendAnswersResult
   */
  answersSentMessage: string;
  
  /**
   * The server response code.
   *
   * @type {number}
   * @memberof TenrxSendAnswersResult
   */
  answersSentStatusCode: number;
}
