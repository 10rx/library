/* eslint-disable no-console */
import { io, Socket } from 'socket.io-client';

import { TenrxChatEventType } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxChatEvent, {
  TenrxChatMessageMetadata,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
} from '../types/TenrxChatEvent.js';
import TenrxSocketPacket, {
  PacketPayload,
  PacketType,
  TenrxSocketJoinChatPayload,
  TenrxSocketLeaveChatPayload,
  TenrxSocketMessagePayload,
  TenrxSocketReplyJoinChatPayload,
  TenrxSocketReplyPayload,
  TenrxSocketServerDisconnectPayload,
  TenrxSocketTypingPayload,
} from '../types/TenrxSocketPacket.js';
import TenrxChatInterface from './TenrxChatInterface.js';
import uuid from 'react-native-uuid';

/**
 * Represents a chat interface that interacts with the patient. It contains events that can be connected to any frontend framework.
 *
 * @export
 * @class TenrxLiveChatInterface
 * @extends {TenrxChatInterface}
 */
export default class TenrxLiveChatInterface extends TenrxChatInterface {
  /**
   * The participant id of the patient in the chat engine.
   *
   * @type {string}
   * @memberof TenrxLiveChatInterface
   */
  public participantId: string;

  /**
   * List of participants in the chat session.
   *
   * @type {Record<string, { nickName: string; avatar: string; socketID: string; chatEngineID: string; }>}
   * @memberof TenrxLiveChatInterface
   */
  public participants: Record<
    string,
    {
      nickName: string;
      avatar: string;
      socketID: string | null;
      chatEngineID: string;
    }
  >;

  /**
   * The id of the patients interface in the chat engine.
   * this is to make my life easier but will not work if the chat allows more than 2 people in a chat
   *
   * @private
   * @type {(string | null)}
   * @memberof TenrxLiveChatInterface
   */
  private patientID: string | null;

  /**
   * Packets waiting for replies
   *
   * @private
   * @type {{ [packet: string]: { retries: number; type: PacketType; timer: NodeJS.Timeout; packet: TenrxSocketPacket; }; }}
   * @memberof TenrxLiveChatInterface
   */
  private waiting: {
    [packet: string]: {
      retries: number;
      type: PacketType;
      timer: NodeJS.Timeout;
      packet: TenrxSocketPacket;
    };
  };

  /**
   * ID given by server for the connection
   *
   * @private
   * @memberof TenrxLiveChatInterface
   */
  private socketID: string;

  /**
   * Keep alive packet timer
   *
   * @private
   * @type {(NodeJS.Timeout | null)}
   * @memberof TenrxLiveChatInterface
   */
  private aliveTimer: NodeJS.Timeout | null;

  /**
   * Chat session ID
   *
   * @private
   * @type {string}
   * @memberof TenrxLiveChatInterface
   */
  private sessionID: string;

  /**
   * Chat session key
   *
   * @private
   * @type {string}
   * @memberof TenrxLiveChatInterface
   */
  private sessionKey: string;

  /**
   * The socket connection to the chat server
   *
   * @private
   * @type {Socket}
   * @memberof TenrxLiveChatInterface
   */
  private socket: Socket;

  /**
   * Event when socket is connected
   *
   * @memberof TenrxLiveChatInterface
   */
  public onConnected: (() => void) | undefined;

  /**
   * Event when socket is disconnected
   *
   * @memberof TenrxLiveChatInterface
   */
  public onDisconnected: ((reason: string) => void) | undefined;

  /**
   * Ready event
   *
   * @memberof TenrxLiveChatInterface
   */
  public onReady?: () => void;

  /**
   * Is the patient typing
   *
   * @private
   * @type {boolean}
   * @memberof TenrxLiveChatInterface
   */
  private isTyping: boolean;

  /**
   * Has the server acknowledged that we joined the chat?
   *
   * @private
   * @type {boolean}
   * @memberof TenrxLiveChatInterface
   */
  private gotFirstReply = false;

  /**
   * This is the main event handler for the chat interface. It will be called by the chat engine when an event is received.
   *
   * @param {TenrxChatEvent} event - The event that was received.
   * @memberof TenrxLiveChatInterface
   */
  public onEvent(event: TenrxChatEvent) {
    TenrxLibraryLogger.silly('TenrxLiveChatInterface: Received chat event:', event);
    switch (event.type) {
      case TenrxChatEventType.ChatEnded:
        TenrxLibraryLogger.debug('TenrxLiveChatInterface: Chat ended');
        this.socket.disconnect();
        break;
      case TenrxChatEventType.ChatStarted:
        TenrxLibraryLogger.debug('TenrxLiveChatInterface: Chat started');
        const startedPayload = event.payload as TenrxChatStartedPayload;
        const participantsIds: string[] = [];
        startedPayload.forEach((participant) => {
          this.participants[participant.id] = {
            nickName: participant.nickName,
            avatar: participant.avatar,
            chatEngineID: participant.id,
            socketID: null,
          };
          participantsIds.push(participant.id);
          TenrxLibraryLogger.debug(`${participant.nickName} has joined the chat.`);
        });
        break;
      case TenrxChatEventType.ChatParticipantJoined:
        const participantJoinedPayload = event.payload as TenrxChatParticipantJoinedPayload;
        this.participants[participantJoinedPayload.id] = {
          nickName: participantJoinedPayload.nickName,
          avatar: participantJoinedPayload.avatar,
          chatEngineID: participantJoinedPayload.id,
          socketID: null,
        };

        if (!this.patientID) this.patientID = participantJoinedPayload.id;

        this.preparePacket(
          this.createPacket('JOIN', {
            nickName: participantJoinedPayload.nickName,
            avatar: participantJoinedPayload.avatar,
          }),
        );

        TenrxLibraryLogger.debug(`${participantJoinedPayload.nickName} has joined the chat.`);
        break;
      case TenrxChatEventType.ChatParticipantLeft:
        if (event.senderId) {
          const participantId = event.senderId;
          if (participantId === this.patientID)
            this.preparePacket(
              this.createPacket('LEAVE', {
                participantID: this.socketID,
              }),
            );

          if (this.participants[participantId]) {
            const nickName = this.participants[participantId] ? this.participants[participantId].nickName : 'Unknown';
            TenrxLibraryLogger.debug(`${nickName} has participant left the chat.`);
            delete this.participants[event.senderId];
          } else {
            TenrxLibraryLogger.warn(`Unknown participant has left the chat. Id: ${participantId}`);
          }
        } else {
          TenrxLibraryLogger.warn('TenrxLiveChatInterface: Participant left the chat without id.');
        }
        break;
      case TenrxChatEventType.ChatMessage:
        const message = event.payload as TenrxChatMessagePayload;

        this.preparePacket(
          this.createPacket('MESSAGE', {
            message: message.message,
            metadata: message.metadata,
            timestamp: Date.now(),
            sender: this.socketID,
          }),
        );

        break;
      case TenrxChatEventType.ChatTypingStarted:
        const senderTyping = (event.senderId && this.participants[event.senderId].nickName) ?? 'Unknown';
        TenrxLibraryLogger.debug(`${senderTyping} started typing`);
        if (event.senderId) {
          if (!this.isTyping) {
            this.isTyping = true;
            this.preparePacket(
              this.createPacket('TYPING', {
                typing: true,
                participantID: this.socketID,
              }),
            );
          }
        } else {
          TenrxLibraryLogger.warn('TenrxLiveChatInterface: Participant started typing without id.');
        }
        break;
      case TenrxChatEventType.ChatTypingEnded:
        const senderTypingEnded = (event.senderId && this.participants[event.senderId].nickName) ?? 'Unknown';
        TenrxLibraryLogger.debug(`${senderTypingEnded} stopped typing`);
        if (event.senderId) {
          this.isTyping = false;
          this.preparePacket(
            this.createPacket('TYPING', {
              typing: false,
              participantID: this.socketID,
            }),
          );
        } else {
          TenrxLibraryLogger.warn('TenrxLiveChatInterface: Participant stopped typing without id.');
        }
        break;
      default:
        TenrxLibraryLogger.warn('TenrxLiveChatInterface: Unknown event', event);
    }
  }

  /**
   * Creates an instance of TenrxLiveChatInterface.
   *
   * @param {{ url: string; sessionID: string; sessionKey: string; }} socketInfo - Info the socket needs to connect
   * @param {string} [id] - The id of the interface in the chat. This is usually created by the chatengine.
   * @memberof TenrxLiveChatInterface
   */
  constructor(
    sessionInfo: {
      url: string;
      sessionID: string;
      sessionKey: string;
    },
    id?: string,
  ) {
    super(id);
    this.participantId = '';
    this.participants = {};
    this.patientID = null;

    // socket stuff spoopy oOOOooOO
    this.waiting = {};
    this.socketID = '';
    this.aliveTimer = null;

    this.isTyping = false;

    this.sessionID = sessionInfo.sessionID;
    this.sessionKey = sessionInfo.sessionKey;

    this.socket = io(sessionInfo.url);

    this.socket.onAny((_event: string, packet: TenrxSocketPacket) => void this.handlePacket(packet));

    this.socket.on('disconnect', (reason) => {
      if (this.onDisconnected) this.onDisconnected(reason);
      if (this.aliveTimer) {
        clearTimeout(this.aliveTimer);
        this.aliveTimer = null;
      }
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        for (const participant of Object.keys(this.participants)) {
          this.leaveChat(participant);
        }
      } else TenrxLibraryLogger.warn('TenrxLiveChatInterface: Socket disconnect reason:', reason, 'reconnecting...');
    });

    this.socket.on('connect', () => {
      if (!this.aliveTimer)
        this.aliveTimer = setInterval(() => {
          this.preparePacket(this.createPacket('ALIVE', {}));
        }, 15e3);
      TenrxLibraryLogger.debug('TenrxLiveChatInterface: Socket connected');
      if (this.onConnected) this.onConnected();
    });
  }

  /**
   * Is the interface ready for chat
   *
   * @readonly
   * @memberof TenrxLiveChatInterface
   */
  public get isReady() {
    return this.socket.connected && !!this.chatEngine && !!this.id && this.gotFirstReply;
  }

  /**
   * Send a packet to the chat server
   *
   * @private
   * @param {string} event
   * @param {TenrxSocketPacket} packet
   * @return {*}
   * @memberof TenrxLiveChatInterface
   */
  private sendPacket(event: string, packet: TenrxSocketPacket) {
    if (!this.socket.connected) return null;
    this.socket.emit(event, packet);
  }

  /**
   * Create a fully formed packet
   *
   * @private
   * @param {PacketType} type
   * @param {PacketPayload} payload
   * @return {*}  {TenrxSocketPacket}
   * @memberof TenrxLiveChatInterface
   */
  private createPacket(type: PacketType, payload: PacketPayload): TenrxSocketPacket {
    return {
      // eslint-disable-next-line
      // @ts-ignore
      id: uuid.default ? uuid.default.v4() : uuid.v4(), //  eslint-disable-line
      sessionID: this.sessionID,
      sessionKey: this.sessionKey,
      type,
      payload,
    };
  }

  /**
   * Create the retry logic for a packet then send the packet
   *
   * @private
   * @param {TenrxSocketPacket} packet
   * @memberof TenrxLiveChatInterface
   */
  private preparePacket(packet: TenrxSocketPacket) {
    this.waiting[packet.id] = {
      type: packet.type,
      packet,
      retries: 0,
      timer: setTimeout(this.resendPacket.bind(this), 5e3, packet.id),
    };
    this.sendPacket('PACKET', packet);
  }

  /**
   * Handle the retry logic for a packet
   *
   * @private
   * @param {number} id
   * @return {*}
   * @memberof TenrxLiveChatInterface
   */
  private resendPacket(id: string) {
    const packet = this.waiting[id];
    if (!packet) return; // ? Resend timer executed but packet got a response already
    if (packet.retries < 2) {
      packet.retries++;
      this.sendPacket('PACKET', packet.packet);
      packet.timer = setTimeout(this.resendPacket.bind(this), 5e3, packet.packet.id);
    } else delete this.waiting[id]; // ! Packet was retried 3 times, considered failed
  }

  /**
   * Get the participant from socket ID
   *
   * @private
   * @param {string} id
   * @return {*}
   * @memberof TenrxLiveChatInterface
   */
  private getParticipant(id: string) {
    for (const key in this.participants) {
      if (this.participants[key].socketID === id) return this.participants[key];
    }
  }

  /**
   * Handle incoming packets from the chat server
   *
   * @private
   * @param {TenrxSocketPacket} packet
   * @return {*}
   * @memberof TenrxLiveChatInterface
   */
  private async handlePacket(packet: TenrxSocketPacket) {
    switch (packet.type.toUpperCase()) {
      case 'TYPING': {
        const payload = packet.payload as TenrxSocketTypingPayload;
        const participant = this.getParticipant(payload.participantID);
        if (participant) {
          if (payload.typing) {
            this.startTyping(participant.chatEngineID);
          } else this.stopTyping(participant.chatEngineID);
        }

        break;
      }
      case 'JOIN': {
        const payload = packet.payload as TenrxSocketJoinChatPayload;
        if (!payload.participantID) break;

        const chatParticipants = this.chatEngine?.participants;

        const socketToEngine: Record<string, string> = {};

        if (chatParticipants) {
          for (const ID of Object.keys(chatParticipants)) {
            const participant = chatParticipants[ID];
            if (participant.customID) socketToEngine[participant.customID] = ID;
          }
        }

        let engineID: string | null = socketToEngine[payload.participantID];

        if (!engineID) {
          engineID = await this.enterChat(payload.nickName, payload.avatar, false, payload.participantID);
        } else if (chatParticipants?.[engineID])
          this.chatEngine?.pseudoNotify(this.id, engineID, TenrxChatEventType.ChatParticipantJoined, {
            nickName: chatParticipants[engineID].nickName,
            id: engineID,
            avatar: chatParticipants[engineID].avatar,
            silent: false,
          });

        if (engineID) {
          this.participants[engineID] = {
            socketID: payload.participantID,
            avatar: payload.avatar,
            nickName: payload.nickName,
            chatEngineID: engineID,
          };
        }

        break;
      }
      case 'LEAVE': {
        const payload = packet.payload as TenrxSocketLeaveChatPayload;
        const participant = this.getParticipant(payload.participantID);
        if (participant) this.leaveChat(participant.chatEngineID, false);
        break;
      }
      case 'MESSAGE': {
        const payload = packet.payload as TenrxSocketMessagePayload;
        const participant = this.getParticipant(payload.sender);
        if (participant?.chatEngineID)
          this.sendMessage(
            participant.chatEngineID,
            payload.message,
            payload.metadata as TenrxChatMessageMetadata,
            undefined,
          );
        break;
      }
      case 'REPLY':
        void this.handleReply(packet);
        return;
      case 'SDISCONNECT': {
        const payload = packet.payload as TenrxSocketServerDisconnectPayload;
        this.socket.disconnect();
        if (this.onDisconnected) this.onDisconnected(payload.reason);
        return;
      }
    }

    // ? Reply to the server saying we got the packet
    this.socket.emit(
      'PACKET',
      this.createPacket('REPLY', {
        packetID: packet.id,
        status: 'SUCCESS',
        errorMessage: null,
        data: null,
      }),
    );
  }

  /**
   * Handle reply packets sent from the server
   *
   * @private
   * @param {TenrxSocketPacket} packet
   * @return {*}
   * @memberof TenrxLiveChatInterface
   */
  private async handleReply(packet: TenrxSocketPacket) {
    const payload = packet.payload as TenrxSocketReplyPayload;
    if (!this.waiting[payload.packetID]) return;
    const { type } = this.waiting[payload.packetID];

    // Clear the resend timer cause we got a reply
    clearTimeout(this.waiting[payload.packetID].timer);
    delete this.waiting[payload.packetID];

    if (payload.status !== 'SUCCESS') return; // TODO: Handle a non successful reply
    switch (type.toUpperCase()) {
      case 'JOIN': {
        const data = payload.data as TenrxSocketReplyJoinChatPayload;

        this.socketID = data.participantID;

        const chatParticipants = this.chatEngine?.participants;

        const socketToEngine: Record<string, string> = {};

        if (chatParticipants) {
          for (const engineID of Object.keys(chatParticipants)) {
            const participant = chatParticipants[engineID];
            if (participant.customID) socketToEngine[participant.customID] = engineID;
          }
        }

        for (const participant of data.participants) {
          if (participant.participantID === this.socketID) continue;
          let engineID: string | null = socketToEngine[participant.participantID];
          if (!socketToEngine[participant.participantID]) {
            engineID = await this.enterChat(
              participant.participantNickName,
              participant.participantAvatar,
              !participant.active,
              participant.participantID,
            );
          }

          if (engineID) {
            this.participants[engineID] = {
              socketID: participant.participantID,
              avatar: participant.participantAvatar,
              nickName: participant.participantNickName,
              chatEngineID: engineID,
            };
          }
        }

        this.gotFirstReply = true;
        if (this.onReady) this.onReady();

        const lookup: {
          [key: string]: string | undefined;
        } = {};

        // very jank because chat engine doesnt make this easy
        if (!this.chatEngine) return;
        for (const message of data.messages) {
          if (message.sender === data.participantID) {
            if (this.patientID) {
              // ? Message sent by patient
              this.sendMessage(
                this.patientID,
                message.message,
                message.metadata as TenrxChatMessageMetadata,
                undefined,
              );
            }
          } else {
            let sender = lookup[message.sender];
            // incase sender wasnt sent in participants from server
            if (!sender)
              lookup[message.sender] = sender = this.getParticipant(message.sender)?.chatEngineID ?? undefined;
            if (sender) {
              // ? Message sent by doctors/etc
              this.sendMessage(sender, message.message, message.metadata as TenrxChatMessageMetadata, undefined);
            } else console.warn('Unable to send message because there is no chat engine id for them', message);
          }
        }
      }
    }
  }

  /**
   * Enters the chat session.
   *
   * @param {string} nickName
   * @param {string} avatar
   * @param {boolean} silent
   * @return {*} {Promise<string | null>}
   * @memberof TenrxLiveChatInterface
   */
  public enterChat(
    nickName: string,
    avatar: string,
    silent = false,
    customID: string | null = null,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      TenrxLibraryLogger.debug('TenrxLiveChatInterface: Entering chat.');
      if (this.chatEngine) {
        resolve(this.chatEngine.addParticipant(this.id, nickName, avatar, silent, customID));
      } else resolve(null);
    });
  }

  /**
   * Leaves the chat session.
   *
   * @memberof TenrxLiveChatInterface
   */
  public leaveChat(participant: string, remove = true) {
    TenrxLibraryLogger.debug('TenrxLiveChatInterface: Leaving chat.');
    if (this.chatEngine) {
      this.chatEngine.removeParticipant(participant, this.id, remove);
      delete this.participants[participant];
    }
  }

  /**
   * Sends a message to the chat session. Most interfaces will automatically assume that after each sendMessage call, that the user stopped typing.
   *
   * @param {string} message - The message to be sent.
   * @param {TenrxChatMessageMetadata} metadata - The metadata to be sent.
   * @param {string} [receipentId] - The receipent id if the message is targeted to someone. If set to null or undefined, the message will be sent to all participants.
   * @memberof TenrxLiveChatInterface
   */
  public sendMessage(sender: string, message: string, metadata: TenrxChatMessageMetadata, receipentId?: string) {
    TenrxLibraryLogger.debug('TenrxLiveChatInterface: Sending message.');
    if (this.chatEngine) {
      this.chatEngine.sendMessage(sender, { message, metadata }, receipentId, this.id);
    }
  }

  /**
   * Notifies the chat session that the user is typing.
   *
   * @memberof TenrxLiveChatInterface
   */
  public startTyping(participant: string) {
    TenrxLibraryLogger.debug('TenrxLiveChatInterface: Start typing.');
    if (this.chatEngine) {
      this.chatEngine.startTyping(participant);
    }
  }

  /**
   * Notifies the chat session that the user stopped typing.
   *
   * @memberof TenrxLiveChatInterface
   */
  public stopTyping(participant: string) {
    TenrxLibraryLogger.debug('TenrxLiveChatInterface: Stop typing.');
    if (this.chatEngine) {
      this.chatEngine.stopTyping(participant);
    }
  }
}
