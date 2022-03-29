/**
 * Represents the meeting information.
 *
 * @export
 * @interface TenrxMeetingInformation
 */
export default interface TenrxMeetingInformation {
  /**
   * True if the meeting information is valid. Otherwise false.
   *
   * @type {boolean}
   * @memberof TenrxMeetingInformation
   */
  meetingSuccessful: boolean;

  /**
   * Contains information from the backend servers regarding the meeting.
   *
   * @type {{
   * message: string;
   * errorMessage: string;
   * }}
   * @memberof TenrxMeetingInformation
   */
  meetingMessageDetails: {
    /**
     * Any message from the backend server.
     *
     * @type {string}
     */
    message: string;

    /**
     * Any error message from the backend server.
     *
     * @type {string}
     */
    errorMessage: string;
  };

  /**
   * The actual meeting data. This is used by the caller to join the meeting.
   *
   * @type {*}
   * @memberof TenrxMeetingInformation
   */
  meetingData: any;
}
