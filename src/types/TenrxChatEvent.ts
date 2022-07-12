import { TenrxChatEventType } from '../includes/TenrxEnums.js';

/**
 * Represents a chat event.
 *
 * @export
 * @interface TenrxChatEvent
 */
export default interface TenrxChatEvent {
  /**
   * The id of the sender of the event.
   *
   * @type {(string | null)}
   * @memberof TenrxChatEvent
   */
  senderId: string | null;

  /**
   * The intended recipient of the event. If null, the event is broadcasted to all participants.
   *
   * @type {(string | null)}
   * @memberof TenrxChatEvent
   */
  recipientId: string | null;

  /**
   * The type of the event.
   *
   * @type {TenrxChatEventType}
   * @memberof TenrxChatEvent
   */
  type: TenrxChatEventType;

  /**
   * The payload of the event. Set to null if there is no payload.
   *
   * @type {(TenrxChatEventPayload | null)}
   * @memberof TenrxChatEvent
   */
  payload: TenrxChatEventPayload | null;

  /**
   * The timestamp of the event.
   *
   * @type {Date}
   * @memberof TenrxChatEvent
   */
  timestamp: Date;
}

/**
 * Represents the payload of a participant joined event.
 *
 * @export
 * @interface TenrxChatParticipantJoinedPayload
 */
export interface TenrxChatParticipantJoinedPayload {
  /**
   * The nickname of the participant.
   *
   * @type {string}
   * @memberof TenrxChatParticipantJoinedPayload
   */
  nickName: string;

  /**
   * The id of the participant.
   *
   * @type {string}
   * @memberof TenrxChatParticipantJoinedPayload
   */
  id: string;

  /**
   * The avatar of the participant.
   *
   * @type {string}
   * @memberof TenrxChatParticipantJoinedPayload
   */
  avatar: string;

  /**
   * Should the event be silent
   *
   * @type {boolean}
   * @memberof TenrxChatParticipantJoinedPayload
   */
  silent: boolean;
}

/**
 * Represents the payload of a participant leave event
 *
 * @export
 * @interface TenrxChatParticipantLeftPayload
 */
export interface TenrxChatParticipantLeftPayload {
  /**
   * Should the participant be removed
   *
   * @type {boolean}
   * @memberof TenrxChatParticipantLeftPayload
   */
  remove: boolean;
}

/**
 * Represents the payload of a chat message.
 *
 * @export
 * @interface TenrxChatMessagePayload
 */
export interface TenrxChatMessagePayload {
  /**
   * The actual message.
   *
   * @type {string}
   * @memberof TenrxChatMessagePayload
   */
  message: string;

  /**
   * Any additional data.
   *
   * @type {({
   * kind: string;
   * data: unknown;
   * } | null)}
   * @memberof TenrxChatMessagePayload
   */
  metadata: TenrxChatMessageMetadata | null;
}

export type TenrxChatMessageMetadata = {
  /**
   * The kind of metadata.
   *
   * @type {string}
   */
  kind: string;

  /**
   * The actual metadata.
   *
   * @type {unknown}
   */
  data: unknown;
} | null;

export type TenrxChatStartedPayload = TenrxChatParticipantJoinedPayload[];

export type TenrxChatEventPayload =
  | TenrxChatParticipantJoinedPayload
  | TenrxChatParticipantLeftPayload
  | TenrxChatMessagePayload
  | TenrxChatStartedPayload;
