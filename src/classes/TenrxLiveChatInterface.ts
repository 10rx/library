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
import { v4 as uuid } from 'uuid';

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
   * @type {number}
   * @memberof TenrxLiveChatInterface
   */
  private sessionID: number;

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
   * Event when chat session has ended.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onChatEnded: ((chatInterface: TenrxLiveChatInterface) => void) | undefined;

  /**
   * Event when chat session is started.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onChatStarted: ((chatInterface: TenrxLiveChatInterface, participantsList: string[]) => void) | undefined;

  /**
   * Event when a participant joins the chat session.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onParticipantJoined: ((chatInterface: TenrxLiveChatInterface, participantId: string) => void) | undefined;

  /**
   * Evenet when a participant leaves the chat session.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onParticipantLeft: ((chatInterface: TenrxLiveChatInterface, participantId: string) => void) | undefined;

  /**
   * Event when a message is received from the chat session.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onMessageReceived:
    | ((
        chatInterface: TenrxLiveChatInterface,
        participantId: string | null,
        message: string,
        metadata: TenrxChatMessageMetadata,
      ) => void)
    | undefined;

  /**
   * Event when a participant starts typing.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onTypingStarted: ((chatInterface: TenrxLiveChatInterface, participantId: string) => void) | undefined;

  /**
   * Event when a participant stops typing.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onTypingEnded: ((chatInterface: TenrxLiveChatInterface, participantId: string) => void) | undefined;

  /**
   * An unknown event has been received from the chat engine. This is usually a bug in the engine.
   *
   * @memberof TenrxLiveChatInterface
   */
  public onUnknownEvent: ((chatInterface: TenrxLiveChatInterface, event: TenrxChatEvent) => void) | undefined;

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
        if (this.onChatEnded) this.onChatEnded(this);
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
        if (this.onChatStarted) this.onChatStarted(this, participantsIds);
        break;
      case TenrxChatEventType.ChatParticipantJoined:
        const participantJoinedPayload = event.payload as TenrxChatParticipantJoinedPayload;
        this.participants[participantJoinedPayload.id] = {
          nickName: participantJoinedPayload.nickName,
          avatar: participantJoinedPayload.avatar,
          chatEngineID: participantJoinedPayload.id,
          socketID: null,
        };
        console.log(participantJoinedPayload, 'joined via chat engine');
        // ? Easiest way I thought of
        // TODO: Make this work with more than one other interface
        if (!this.patientID) this.patientID = participantJoinedPayload.id;

        this.preparePacket(
          this.createPacket('JOIN', {
            nickName: participantJoinedPayload.nickName,
            avatar: participantJoinedPayload.avatar,
          }),
        );

        TenrxLibraryLogger.debug(`${participantJoinedPayload.nickName} has joined the chat.`);
        if (this.onParticipantJoined) this.onParticipantJoined(this, participantJoinedPayload.id);
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
            if (this.onParticipantLeft) this.onParticipantLeft(this, participantId);
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
        console.log('chat engine message received', message, this.participants);

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
          // TODO: Set a delay or timer or something so this doesnt fire when every single character gets pressed
          // this.preparePacket(
          //   this.createPacket('TYPING', {
          //     typing: true,
          //     participantID: this.socketID,
          //   }),
          // );
          if (this.onTypingStarted) this.onTypingStarted(this, event.senderId);
        } else {
          TenrxLibraryLogger.warn('TenrxLiveChatInterface: Participant started typing without id.');
        }
        break;
      case TenrxChatEventType.ChatTypingEnded:
        const senderTypingEnded = (event.senderId && this.participants[event.senderId].nickName) ?? 'Unknown';
        TenrxLibraryLogger.debug(`${senderTypingEnded} stopped typing`);
        if (event.senderId) {
          this.preparePacket(
            this.createPacket('TYPING', {
              typing: false,
              participantID: this.socketID,
            }),
          );
          if (this.onTypingEnded) this.onTypingEnded(this, event.senderId);
        } else {
          TenrxLibraryLogger.warn('TenrxLiveChatInterface: Participant stopped typing without id.');
        }
        break;
      default:
        TenrxLibraryLogger.warn('TenrxLiveChatInterface: Unknown event', event);
        if (this.onUnknownEvent) this.onUnknownEvent(this, event);
    }
  }

  /**
   * Creates an instance of TenrxLiveChatInterface.
   *
   * @param {{ url: string; sessionID: number; sessionKey: string; }} socketInfo - Info the socket needs to connect
   * @param {string} [id] - The id of the interface in the chat. This is usually created by the chatengine.
   * @memberof TenrxLiveChatInterface
   */
  constructor(
    sessionInfo: {
      url: string;
      sessionID: number;
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

    this.sessionID = sessionInfo.sessionID;
    this.sessionKey = sessionInfo.sessionKey;

    this.socket = io(sessionInfo.url);

    this.socket.onAny((_event: string, packet: TenrxSocketPacket) => void this.handlePacket(packet));

    this.socket.on('disconnect', (reason) => {
      if (this.aliveTimer) {
        clearTimeout(this.aliveTimer);
        this.aliveTimer = null;
      }
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.log('full disconnect');
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
      console.log('connected', this.socket.connected, this.waiting);
      TenrxLibraryLogger.info('TenrxLiveChatInterface: Socket connected');
    });
  }

  /**
   * Is the interface ready for chat
   *
   * @readonly
   * @memberof TenrxLiveChatInterface
   */
  public get isReady() {
    return this.socket.connected && !!this.chatEngine && !!this.id;
  }

  // /**
  //  * Initiate the connection to the chat server
  //  *
  //  * @memberof TenrxLiveChatInterface
  //  */
  // start() {
  //   this.socket.connect();
  // }

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
      id: uuid(),
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
    console.log('SENDING PACKET', packet);
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
    console.log(`packet retry ${packet.retries} for packet ${packet.type} - ${packet.packet.id}`);
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
    console.log('got packet', packet);
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
        console.log('someone joined', payload);
        const engineID = await this.enterChat(payload.nickName, payload.avatar);
        if (engineID) {
          this.participants[engineID] = {
            socketID: payload.participantID,
            avatar: payload.avatar,
            nickName: payload.nickName,
            chatEngineID: engineID,
          };
          console.log('Created chat engine participant', this.participants[engineID]);
        }

        break;
      }
      case 'LEAVE': {
        const payload = packet.payload as TenrxSocketLeaveChatPayload;
        const participant = this.getParticipant(payload.participantID);
        if (participant) this.leaveChat(participant.chatEngineID);
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
        // TODO: Do something with the reason
        const payload = packet.payload as TenrxSocketServerDisconnectPayload;
        console.log('server disconnect reason:', payload.reason);
        this.socket.disconnect();
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
    if (!this.waiting[payload.packetID])
      return console.log(`packet ${payload.packetID} got reply but is not in waiting`);

    const { type } = this.waiting[payload.packetID];

    if (this.waiting[payload.packetID].type !== 'ALIVE')
      console.log(`packet ${payload.packetID} got a reply with payload`, payload);

    // Clear the resend timer cause we got a reply
    clearTimeout(this.waiting[payload.packetID].timer);
    delete this.waiting[payload.packetID];

    if (payload.status !== 'SUCCESS') return; // TODO: Handle a non successful reply
    switch (type.toUpperCase()) {
      case 'JOIN': {
        const data = payload.data as TenrxSocketReplyJoinChatPayload;

        this.socketID = data.participantID;
        console.log('ID assigned by server', this.socketID);

        for (const participant of data.participants) {
          const engineID = await this.enterChat(participant.participantNickName, participant.participantAvatar);
          if (engineID) {
            this.participants[engineID] = {
              socketID: participant.participantID,
              avatar: participant.participantAvatar,
              nickName: participant.participantNickName,
              chatEngineID: engineID,
            };
            console.log('Created participant in chat engine', this.participants[engineID]);
          } else console.error('Didnt created participant in chat engine', participant.participantID);
        }

        const lookup: {
          [key: string]: string | undefined;
        } = {};

        // very jank because chat engine doesnt make this easy
        if (!this.chatEngine) return;
        for (const message of data.messages) {
          if (message.sender === data.participantID) {
            if (this.patientID) {
              console.log('sending message as patient');
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
              console.log('sending message as', message.sender, lookup[message.sender]);
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
   * @return {*} {Promise<string | null>}
   * @memberof TenrxLiveChatInterface
   */
  public enterChat(nickName: string, avatar: string): Promise<string | null> {
    return new Promise((resolve) => {
      TenrxLibraryLogger.debug('TenrxLiveChatInterface: Entering chat.');
      console.log('chat engine exists?', !!this.chatEngine);
      if (this.chatEngine) {
        resolve(this.chatEngine.addParticipant(this.id, nickName, avatar));
      } else resolve(null);
    });
  }

  /**
   * Leaves the chat session.
   *
   * @memberof TenrxLiveChatInterface
   */
  public leaveChat(participant: string) {
    TenrxLibraryLogger.debug('TenrxLiveChatInterface: Leaving chat.');
    if (this.chatEngine) {
      this.chatEngine.removeParticipant(participant, this.id);
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
      console.log('Sending message to chat engine', {
        sender,
        interface: this.id,
        message,
        receipentId,
      });
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
