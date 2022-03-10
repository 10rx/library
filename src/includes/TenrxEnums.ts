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
  US = 1,
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
  Arizona,
  Arkansas,
  Colorado,
  Connecticut,
  Delaware,
  DistrictOfColumbia,
  Georgia,
  Hawaii,
  Idaho,
  Illinois,
  Indiana,
  Iowa,
  Kansas,
  Kentucky,
  Louisiana,
  Maine,
  Maryland,
  Massachusetts,
  Michigan,
  Minnesota,
  Mississippi,
  Missouri,
  Montana,
  Nebraska,
  Nevada,
  NewHampshire,
  NewJersey,
  NewMexico,
  NewYork,
  NorthCarolina,
  NorthDakota,
  Ohio,
  Oklahoma,
  Oregon,
  Pennsylvania,
  PuertoRico,
  RhodeIsland,
  SouthCarolina,
  SouthDakota,
  Tennessee,
  Texas,
  Utah,
  Vermont,
  Virginia,
  Washington,
  WestVirginia,
  Wisconsin,
  Wyoming,
  Alabama = 152,
}

/**
 * Represents the status of the chat engine.
 *
 * @export
 * @enum {number}
 */
export enum TenrxChatStatus {
  /**
   * The chat is idle.
   */
  Idle,

  /**
   * The chat is active.
   */
  Active,
}

/**
 * Represents a type of chat event.
 *
 * @export
 * @enum {number}
 */
export enum TenrxChatEventType {
  ChatStarted,
  ChatEnded,
  ChatMessage,
  ChatTypingStarted,
  ChatTypingEnded,
  ChatError,
  ChatParticipantJoined,
  ChatParticipantLeft,
}

/**
 * Represents the type of a answer for a question in the questionnaire.
 *
 * @export
 * @enum {number}
 */
export enum TenrxQuestionnaireAnswerType {
  /**
   * Answer is a free form text.
   */
  TEXT,
  
  /**
   * Answer is a yes/no answer.
   */
  YESORNO,
  
  /**
   * Answer is a single choice answer out of multiple choices.
   */
  MULTIPLECHOICE,
  
  /**
   * Answer can be multiple choice answers out of multiple choices.
   */
  MULTIPLESELECT,
  
  /**
   * Answer must be a US state.
   */
  STATEPICKER,
}