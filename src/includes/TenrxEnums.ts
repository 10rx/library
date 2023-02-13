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
  /**
   * Chat session has started.
   */
  ChatStarted,

  /**
   * Chat session has ended.
   */
  ChatEnded,

  /**
   * Chat message has been received.
   */
  ChatMessage,

  /**
   * Participant has started typing.
   */
  ChatTypingStarted,

  /**
   * Participant has stopped typing.
   */
  ChatTypingEnded,

  /**
   * A chat error has occurred in session.
   */
  ChatError,

  /**
   * Participant has joined the session.
   */
  ChatParticipantJoined,

  /**
   * Participant has left the session.
   */
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

/**
 * Represents the status of the questionnaire bot.
 *
 * @export
 * @enum {number}
 */
export enum TenrxQuestionnaireBotStatus {
  /**
   * Questionnaire bot is not ready.
   */
  NOTREADY,

  /**
   * Questionnaire bot is ready to either send questions or received responses.
   */
  READY,

  /**
   * Questionnaire bot is busy processing a task.
   */
  BUSY,

  /**
   * Questionnaire bot finished sending all questions and received all answers.
   */
  COMPLETED,

  /**
   * Questionnaire bot has encountered an error.
   */
  ERROR,
}

/**
 * Represents the shipping speed of the order.
 *
 * @export
 * @enum {number}
 */
export enum TenrxShippingType {
  /**
   * Standard shipping speed.
   */
  Standard = 1,

  /**
   * Expedited shipping speed.
   */
  Expedited,

  /**
   * Not being shipped and instead being sent to external pharmacy
   */
  External,
}

export enum TenrxOrderStatusID {
  Requested = 1,
  StaffReviewed,
  PendingDoctor,
  DoctorAssigned,
  DoctorReviewed,
  PrescriptionIssued,
  PrescriptionReviewed,
  PrescriptionFulfilled,
  Shipped,
  Completed,
  Hold,
  Rejected,
  AppointmentRequested,
  AppointmentScheduled,
}

export const TenrxOrderStatus = {
  [TenrxOrderStatusID.Requested]: 'Requested',
  [TenrxOrderStatusID.StaffReviewed]: 'Staff Reviewed',
  [TenrxOrderStatusID.PendingDoctor]: 'Pending Doctor Assignment',
  [TenrxOrderStatusID.DoctorAssigned]: 'Doctor Assigned',
  [TenrxOrderStatusID.DoctorReviewed]: 'Doctor Reviewed',
  [TenrxOrderStatusID.PrescriptionIssued]: 'Prescription Issued',
  [TenrxOrderStatusID.PrescriptionReviewed]: 'Prescription Reviewed',
  [TenrxOrderStatusID.PrescriptionFulfilled]: 'Prescription Fulfilled',
  [TenrxOrderStatusID.Shipped]: 'Shipped',
  [TenrxOrderStatusID.Completed]: 'Completed',
  [TenrxOrderStatusID.Hold]: 'Hold',
  [TenrxOrderStatusID.Rejected]: 'Rejected',
  [TenrxOrderStatusID.AppointmentRequested]: 'Appointment Requested',
  [TenrxOrderStatusID.AppointmentScheduled]: 'Appointment Scheduled',
};

export enum TenrxProductStatusID {
  Ready = 1,
  Verified,
  Filled,
  Shipped,
  OnOrder,
  PartialOrder,
}

export const TenrxProductStatus = {
  [TenrxProductStatusID.Ready]: 'Ready',
  [TenrxProductStatusID.Verified]: 'Verified',
  [TenrxProductStatusID.Filled]: 'Filled',
  [TenrxProductStatusID.Shipped]: 'Shipped',
  [TenrxProductStatusID.OnOrder]: 'On Order',
  [TenrxProductStatusID.PartialOrder]: 'Partial Order',
};

export enum TenrxPharmacyType {
  Internal = 1,
  External,
}

/**
 * Roles an image can have
 *
 * @export
 * @enum {number}
 */
export enum TenrxImageRoles {
  ID = 1,
  Selfie,
  Prescription,
  Extra,
}

/**
 * Product IDs of fee items
 *
 * @export
 * @enum {number}
 */
export enum TenrxFeeItem {
  DoctorFree = 2466,
  DoctorPaid = 2821,
  Consultation = 2469,
  ConsultationFree = 2831,
}

export const TenrxFeeNames = {
  [TenrxFeeItem.DoctorFree]: 'Doctor Fee Free',
  [TenrxFeeItem.DoctorPaid]: 'Doctor Fee Paid',
  [TenrxFeeItem.Consultation]: 'Consultation Fee',
  [TenrxFeeItem.ConsultationFree]: 'Consultation Free',
};

export const TenrxFeeCost = {
  [TenrxFeeItem.DoctorFree]: 0,
  [TenrxFeeItem.DoctorPaid]: 45,
  [TenrxFeeItem.Consultation]: 45,
  [TenrxFeeItem.ConsultationFree]: 0,
};

export const TenrxCardBrands = {
  other: 'Other',
  jcb: 'JCB',
  amex: 'Amex',
  diners: 'Diners',
  visa: 'Visa',
  discover: 'Discover',
  mastercard: 'MasterCard',
  maestro: 'Maestro',
};

export enum QuestionType {
  Text,
  Choice,
  Multiple,
}

export enum QuestionEnd {
  No,
  Fail,
  Success,
}

export enum CardType {
  CreditCard,
  GiftCard,
}

export enum TenrxSubscriptionUnitType {
  Months = 'months',
  Days = 'days',
}
