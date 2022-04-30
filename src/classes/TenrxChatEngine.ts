import { DateTime } from 'luxon';
import TenrxChatInternalError from '../exceptions/TenrxChatInternalError.js';
import TenrxChatNotActive from '../exceptions/TenrxChatNotActive.js';
import { TenrxChatEventType, TenrxChatStatus } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../index.js';
import TenrxChatEvent, { TenrxChatParticipantJoinedPayload, TenrxChatMessagePayload } from '../types/TenrxChatEvent.js';
import TenrxChatInterface from './TenrxChatInterface.js';

/**
 * Represents the chat engine.
 *
 * @export
 * @class TenrxChatEngine
 */
export default class TenrxChatEngine {
  private internalChatParticipants: Record<string, { nickName: string; avatar: string; interfaceId: string }>;
  private internalChatStatus: TenrxChatStatus;
  private internalInterfaces: Record<string, TenrxChatInterface>;

  /**
   * Creates an instance of TenrxChatEngine.
   *
   * @memberof TenrxChatEngine
   */
  constructor() {
    this.internalInterfaces = {};
    this.internalChatParticipants = {};
    this.internalChatStatus = TenrxChatStatus.Idle;
  }

  /**
   * Stops the chat engine. It doesn't clear the chat participants or interfaces.
   *
   * @memberof TenrxChatEngine
   */
  public stopChat(): void {
    this.internalChatStatus = TenrxChatStatus.Idle;
    this.notifyInterfaces({
      timestamp: DateTime.now().toJSDate(),
      type: TenrxChatEventType.ChatEnded,
      payload: null,
      senderId: null,
      recipientId: null,
    });
  }

  /**
   * Stops the chat engine and clears the chat participants and interfaces.
   *
   * @memberof TenrxChatEngine
   */
  public cleanupChat(): void {
    this.stopChat();
    this.internalChatParticipants = {};
    this.internalInterfaces = {};
  }

  /**
   * Gets the status of the chat engine.
   *
   * @return {*}  {TenrxChatStatus}
   * @memberof TenrxChatEngine
   */
  public getChatStatus(): TenrxChatStatus {
    return this.internalChatStatus;
  }

  /**
   * Starts the engine. All interfaces will be notified about this with a {TenrxChatEventType.ChatStarted} event.
   *
   * @memberof TenrxChatEngine
   */
  public startChat(): void {
    this.internalChatStatus = TenrxChatStatus.Active;
    const payload: TenrxChatParticipantJoinedPayload[] = [];
    Object.keys(this.internalChatParticipants).forEach((id) => {
      payload.push({
        id,
        nickName: this.internalChatParticipants[id].nickName,
        avatar: this.internalChatParticipants[id].avatar,
      });
    });
    this.notifyInterfaces({
      timestamp: DateTime.now().toJSDate(),
      type: TenrxChatEventType.ChatStarted,
      payload,
      senderId: null,
      recipientId: null,
    });
  }

  private notifyParticipants(event: TenrxChatEvent, excludeParticipant?: string): void {
    setTimeout(() => {
      if (this.internalChatStatus === TenrxChatStatus.Active) {
        Object.keys(this.internalChatParticipants).forEach((id) => {
          if (excludeParticipant !== id) {
            const actualEvent = { ...event, recipientId: event.recipientId ? event.recipientId : id };
            this.internalInterfaces[this.internalChatParticipants[id].interfaceId].onEvent(actualEvent);
          }
        });
      } else {
        TenrxLibraryLogger.error(`Unable to notify participants. Chat is not active.`);
        throw new TenrxChatNotActive(`Unable to notify participants. Chat is not active.`, 'TenrxChatEngine');
      }
    }, 0);
  }

  private notifyInterfaces(event: TenrxChatEvent, excludeInterface?: string): void {
    setTimeout(() => {
      Object.keys(this.internalInterfaces).forEach((id) => {
        if (excludeInterface !== id) {
          const actualEvent = { ...event, recipientId: event.recipientId ? event.recipientId : id };
          this.internalInterfaces[id].onEvent(actualEvent);
        }
      });
    }, 0);
  }

  /**
   * Binds an interface to the chat engine.
   *
   * @param {TenrxChatInterface} chatInterface - The interface to bind.
   * @return {*}  {string} - The id of the interface.
   * @memberof TenrxChatEngine
   */
  public bindInterface(chatInterface: TenrxChatInterface): string {
    const index = TenrxChatEngine.getRandomId();
    this.internalInterfaces[index] = chatInterface;
    chatInterface.id = index;
    chatInterface.chatEngine = this;
    return index;
  }

  /**
   * Unbinds an interface from the chat engine.
   *
   * @param {string} id - The id of the interface to unbind.
   * @memberof TenrxChatEngine
   */
  public unbindInterface(id: string): void {
    if (this.internalChatParticipants[id]) {
      delete this.internalInterfaces[id];
    } else {
      TenrxLibraryLogger.error(`Unable to unbind interface with id '${id}'. Interface is not bound.`);
      throw new TenrxChatInternalError(
        `Unable to unbind interface with id '${id}'. Interface is not bound.`,
        'TenrxChatEngine',
      );
    }
  }

  /**
   * Adds a participant to the chat engine.
   *
   * @param {string} interfaceId - The id of the interface where this participant is.
   * @param {string} nickName - The nick name of the participant.
   * @param {string} [avatar=''] - The avatar of the participant.
   * @return {*}  {string} - The id of the participant.
   * @memberof TenrxChatEngine
   */
  public addParticipant(interfaceId: string, nickName: string, avatar = ''): string {
    TenrxLibraryLogger.debug(`Adding participant with nickName '${nickName}'`);
    if (this.internalChatStatus === TenrxChatStatus.Active) {
      const id = TenrxChatEngine.getRandomId();
      const payload: TenrxChatParticipantJoinedPayload = {
        nickName,
        id,
        avatar,
      };
      console.log('CHAT ENGINE create participant', payload)
      this.internalChatParticipants[id] = {
        nickName,
        avatar,
        interfaceId,
      };
      this.notifyInterfaces(
        {
          timestamp: DateTime.now().toJSDate(),
          senderId: id,
          recipientId: null,
          type: TenrxChatEventType.ChatParticipantJoined,
          payload,
        },
        interfaceId,
      );
      return id;
    } else {
      TenrxLibraryLogger.error(`Unable to add ${nickName} to the chat. Chat is not active.`);
      throw new TenrxChatNotActive(`Unable to add ${nickName} to the chat. Chat is not active.`, 'TenrxChatEngine');
    }
  }

  /**
   * Removes a participant from the chat engine.
   *
   * @param {string} participantId - The id of the participant to remove.
   * @param {string} interfaceId - The id of the interface where this participant is.
   * @memberof TenrxChatEngine
   */
  public removeParticipant(participantId: string, interfaceId: string): void {
    TenrxLibraryLogger.debug(`Removing participant with id '${participantId}'`);
    if (this.internalChatParticipants[participantId]) {
      delete this.internalChatParticipants[participantId];
      this.notifyInterfaces(
        {
          timestamp: DateTime.now().toJSDate(),
          senderId: participantId,
          recipientId: null,
          type: TenrxChatEventType.ChatParticipantLeft,
          payload: null,
        },
        interfaceId,
      );
    } else {
      TenrxLibraryLogger.error(`Unable to remove participant with id '${participantId}' to the chat.`);
      throw new TenrxChatInternalError(
        `Unable to remove participant with id '${participantId}' to the chat.`,
        'TenrxChatEngine',
      );
    }
  }

  /**
   * Sends a message to participants in the chat engine.
   *
   * @param {string} interfaceId - The id of the sending interface.
   * @param {TenrxChatMessagePayload} message - The message to send.
   * @param {string} [participantId] - The id of the recipient.
   * @param {string} [senderId] - The id of the sender
   * @memberof TenrxChatEngine
   */
  public sendMessage(interfaceId: string, message: TenrxChatMessagePayload, participantId?: string, senderId?: string): void {
    this.notifyInterfaces(
      {
        timestamp: DateTime.now().toJSDate(),
        senderId: senderId ?? interfaceId, // This so for socket messages
        recipientId: participantId ? participantId : null, // sending to all users
        type: TenrxChatEventType.ChatMessage,
        payload: message,
      },
      interfaceId,
    );
  }

  /**
   * Sends the start typing event to participants in the chat engine.
   *
   * @param {string} senderId - The id of the sender.
   * @param {string} [participantId] - The id of the recipient.
   * @memberof TenrxChatEngine
   */
  public startTyping(senderId: string, participantId?: string): void {
    this.notifyInterfaces(
      {
        timestamp: DateTime.now().toJSDate(),
        senderId,
        recipientId: participantId ? participantId : null, // sending to all users
        type: TenrxChatEventType.ChatTypingStarted,
        payload: null,
      },
      senderId,
    );
  }

  /**
   * Sends the stop typing event to participants in the chat engine.
   *
   * @param {string} senderId - The id of the sender.
   * @param {string} [participantId] - The id of the recipient.
   * @memberof TenrxChatEngine
   */
  public stopTyping(senderId: string, participantId?: string): void {
    this.notifyInterfaces(
      {
        timestamp: DateTime.now().toJSDate(),
        senderId,
        recipientId: participantId ? participantId : null, // sending to all users
        type: TenrxChatEventType.ChatTypingEnded,
        payload: null,
      },
      senderId,
    );
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
