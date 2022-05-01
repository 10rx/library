/**
 * Represents a socket packet
 *
 * @export
 * @interface TenrxSocketPacket
 */
export default interface TenrxSocketPacket {
  /**
   * The packets unique id
   *
   * @type {string}
   * @memberof TenrxSocketPacket
   */
  id: string;

  /**
   * The session this packet is for
   *
   * @type {number}
   * @memberof TenrxSocketPacket
   */
  sessionID: number;

  /**
   * The auth key for the session
   *
   * @type {(string | null)}
   * @memberof TenrxSocketPacket
   */
  sessionKey: string | null;

  /**
   * The type of the packet
   *
   * @type {PacketType}
   * @memberof TenrxSocketPacket
   */
  type: PacketType;

  /**
   * The payload of the packet
   *
   * @type {PacketPayload}
   * @memberof TenrxSocketPacket
   */
  payload: PacketPayload | Record<string, never>;
}

export type PacketType = 'JOIN' | 'LEAVE' | 'MESSAGE' | 'TYPING' | 'REPLY' | 'ALIVE' | 'SDISCONNECT';

export type PacketPayload =
  | TenrxSocketReplyPayload
  | TenrxSocketJoinChatPayload
  | TenrxSocketLeaveChatPayload
  | TenrxSocketMessagePayload
  | TenrxSocketTypingPayload
  | TenrxSocketServerDisconnectPayload
  | Record<string, unknown>;

/**
 * Payload for JOIN
 *
 * @export
 * @interface TenrxSocketJoinChatPayload
 */
export interface TenrxSocketJoinChatPayload {
  /**
   * Name of the chatter
   *
   * @type {string}
   * @memberof TenrxSocketJoinChatPayload
   */
  nickName: string;

  /**
   * Avatar of chatter
   *
   * @type {string}
   * @memberof TenrxSocketJoinChatPayload
   */
  avatar: string;

  /**
   * ID of the chatter joining
   * #### Only present if sent from server
   *
   * @type {string}
   * @memberof TenrxSocketJoinChatPayload
   */
  participantID?: string;
}

/**
 * Payload for LEAVE
 *
 * @export
 * @interface TenrxSocketLeaveChatPayload
 */
export interface TenrxSocketLeaveChatPayload {
  /**
   * ID of chatter leaving the chat
   *
   * @type {string}
   * @memberof TenrxSocketLeaveChatPayload
   */
  participantID: string;

  /**
   * Timestamp of event
   * #### Only present if sent from server
   *
   * @type {number}
   * @memberof TenrxSocketLeaveChatPayload
   */
  timestamp?: number;
}

/**
 * Payload for MESSAGE
 *
 * @export
 * @interface TenrxSocketMessagePayload
 */
export interface TenrxSocketMessagePayload {
  message: string;
  metadata: any | null;
  timestamp: number;
  sender: string;
}

/**
 * Payload for TYPING
 *
 * @export
 * @interface TenrxSocketTypingStartPayload
 */
export interface TenrxSocketTypingPayload {
  participantID: string;
  typing: boolean;
}

/**
 * Payload for server telling us to disconnect
 *
 * @export
 * @interface TenrxSocketServerDisconnectPayload
 */
export interface TenrxSocketServerDisconnectPayload {
  reason: string;
}

/**
 * Payload for JOIN sent by server when someone joins
 *
 * @export
 * @interface TenrxSocketServiceJoinPayload
 */
export interface TenrxSocketServiceJoinPayload {
  nickName: string;
  participantID: string;
}

// ? Start of reply packet and payloads

/**
 * Represents a reply packet from the server
 *
 * @export
 * @interface ReplyPayload
 */
export interface TenrxSocketReplyPayload {
  /**
   * The packet ID this reply is meant for
   *
   * @type {number}
   * @memberof ReplyPayload
   */
  packetID: number;

  /**
   * Status of the reply
   *
   * @type {("SUCCESS" | "BUSY" | "ERROR")}
   * @memberof ReplyPayload
   */
  status: 'SUCCESS' | 'BUSY' | 'ERROR';

  /**
   * Error message
   *
   * @type {(string | null)}
   * @memberof ReplyPayload
   */
  errorMessage: string | null;

  /**
   * Data of the reply
   *
   * @type {(ReplyData | null)}
   * @memberof ReplyPayload
   */
  data: ReplyData | null;
}

export type ReplyData = TenrxSocketReplyJoinChatPayload;

/**
 * Payload for servers reply to JOIN
 *
 * @export
 * @interface TenrxSocketReplyJoinChatPayload
 */
export interface TenrxSocketReplyJoinChatPayload {
  participantID: string;
  messages: TenrxSocketMessagePayload[];
  participants: {
    participantID: string;
    participantNickName: string;
    participantAvatar: string;
    active: boolean;
  }[];
}
