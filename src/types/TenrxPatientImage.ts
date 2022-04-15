/**
 * Represents an image of a patient. It can be picture of affected area, but also driver license, passport, photo of self, etc.
 *
 * @export
 * @interface TenrxPatientImage
 */
export default interface TenrxPatientImage {
  /**
   * The actual image. It needs to be encoded in base64.
   *
   * @type {string}
   * @memberof TenrxPatientImage
   */
  data: string;

  /**
   * The extension of the image. (e.g. jpg, png, etc.)
   *
   * @type {string}
   * @memberof TenrxPatientImage
   */
  ext: string;

  /**
   * The file name of the image.
   *
   * @type {string}
   * @memberof TenrxPatientImage
   */
  fileName: string;

  /**
   * The format of the image (e.g. jpg, png, etc.)
   *
   * @type {string}
   * @memberof TenrxPatientImage
   */
  type: string;
}
