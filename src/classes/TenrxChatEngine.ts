import TenrxChatNotActive from '../exceptions/TenrxChatNotActive.js';
import { TenrxChatEventType, TenrxChatStatus } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../index.js';
import TenrxChatEvent, { TenrxChatParticipantJoinedPayload, TenrxChatMessagePayload } from '../types/TenrxChatEvent.js';
import TenrxChatInterface from './TenrxChatInterface.js';

export default class TenrxChatEngine {
  private internalChatParticipants: Record<string, { nickName: string; chatInterface: TenrxChatInterface }>;
  private internalChatStatus: TenrxChatStatus;
  private internalInterfaces: TenrxChatInterface[];

  constructor() {
    this.internalInterfaces = [];
    this.internalChatParticipants = {};
    this.internalChatStatus = TenrxChatStatus.Idle;
  }

  public restartChat(unbindInterfaces = false): void {
    this.notifyInterfaces({
      type: TenrxChatEventType.ChatEnded,
      payload: null,
      senderId: null,
      recipientId: null,
    });
    this.internalChatParticipants = {};
    if (unbindInterfaces) this.internalInterfaces = [];
    this.internalChatStatus = TenrxChatStatus.Idle;
  }

  public getChatStatus(): TenrxChatStatus {
    return this.internalChatStatus;
  }

  public startChat(): void {
    this.internalChatStatus = TenrxChatStatus.Active;
    this.notifyInterfaces({
      type: TenrxChatEventType.ChatStarted,
      payload: null,
      senderId: null,
      recipientId: null,
    });
  }

  private notifyParticipants(event: TenrxChatEvent, excludeParticipant?: string): void {
    if (this.internalChatStatus === TenrxChatStatus.Active) {
      Object.keys(this.internalChatParticipants).forEach((id) => {
        if (excludeParticipant !== id) {
          const actualEvent = { ...event, recepentId: id };
          this.internalChatParticipants[id].chatInterface.onEvent(actualEvent, this);
        }
      });
    } else {
      TenrxLibraryLogger.error(`Unable to notify participants. Chat is not active.`);
      throw new TenrxChatNotActive(`Unable to notify participants. Chat is not active.`, 'TenrxChatEngine');
    }
  }

  private notifyInterfaces(event: TenrxChatEvent): void {
    this.internalInterfaces.forEach((chatInterface) => {
      chatInterface.onEvent(event, this);
    });
  }

  public bindInterface(chatInterface: TenrxChatInterface): void {
    const index = this.internalInterfaces.indexOf(chatInterface);
    if (index < 0) {
      this.internalInterfaces.push(chatInterface);
    }
  }

  public unbindInterface(chatInterface: TenrxChatInterface): void {
    const index = this.internalInterfaces.indexOf(chatInterface);
    if (index > -1) {
      this.internalInterfaces.splice(index, 1);
    }
  }

  public addParticipant(chatInterface: TenrxChatInterface, nickName: string, avatar = ''): string {
    if (this.internalChatStatus === TenrxChatStatus.Active) {
      const id = TenrxChatEngine.getRandomId();
      const payload: TenrxChatParticipantJoinedPayload = {
        nickName,
        id,
        avatar,
      };
      this.notifyParticipants({
        senderId: id,
        recipientId: null,
        type: TenrxChatEventType.ChatParticipantJoined,
        payload,
      });
      this.internalChatParticipants[id] = {
        nickName,
        chatInterface,
      };
      return id;
    } else {
      TenrxLibraryLogger.error(`Unable to add ${nickName} to the chat. Chat is not active.`);
      throw new TenrxChatNotActive(`Unable to add ${nickName} to the chat. Chat is not active.`, 'TenrxChatEngine');
    }
  }

  public removeParticipant(id: string): void {
    if (this.internalChatParticipants[id]) {
      delete this.internalChatParticipants[id];
      this.notifyParticipants({
        senderId: id,
        recipientId: null,
        type: TenrxChatEventType.ChatParticipantLeft,
        payload: null,
      });
    } else {
      TenrxLibraryLogger.error(`Unable to remove participant with id '${id}' to the chat. Chat is not active.`);
      throw new TenrxChatNotActive(
        `Unable to remove participant with id '${id}' to the chat. Chat is not active.`,
        'TenrxChatEngine',
      );
    }
  }

  public sendMessage(senderId: string, message: TenrxChatMessagePayload): void {
    if (this.internalChatStatus === TenrxChatStatus.Active) {
      this.notifyParticipants({
        senderId,
        recipientId: null, // sending to all users
        type: TenrxChatEventType.ChatMessage,
        payload: message,
      }, senderId);
    } else {
      TenrxLibraryLogger.error('Unable to send message to all recipients. Chat is not active.');
      throw new TenrxChatNotActive('Unable to send message to all recipients. Chat is not active.', 'TenrxChatEngine');
    }
  }

  /**
   * Generates a random id.
   *
   * @private
   * @static
   * @return {*}  {string} - The random id.
   * @memberof TenrxChatEngine
   */
  private static getRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
