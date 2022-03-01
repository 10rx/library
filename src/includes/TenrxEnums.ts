/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-shadow */
// Disabling no-shadow due to a bug in eslint and enums.

/**
 * Translates gender to values.
 *
 * @export
 * @enum {number}
 */
export enum TenrxEnumGender {
  /**
   * Male Gender
   */
  Male = 1,

  /**
   * Female Gender
   */
  Female,

  /**
   * Other Gender
   */
  Other,
}

/**
 * Translate country to values
 *
 * @export
 * @enum {number}
 */
export enum TenrxEnumCountry {
  USA = 1,
  Canada,
}

/**
 * Translate state to values
 *
 * @export
 * @enum {number}
 */
export enum TenrxEnumState {
  California = 1,
  Florida,
  Alaska = 6,
  Arizona = 7,
}
