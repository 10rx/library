import { TenrxChatEventType } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxChatEvent, {
  TenrxChatMessageMetadata,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
} from '../types/TenrxChatEvent.js';
import TenrxChatInterface from './TenrxChatInterface.js';

/**
 * Represents a chat interface that interacts with the patient. It contains events that can be connected to any frontend framework.
 *
 * @export
 * @class TenrxPatientChatInterface
 * @extends {TenrxChatInterface}
 */
export default class TenrxPatientChatInterface extends TenrxChatInterface {
  public participantId: string;
  public participants: Record<string, TenrxChatParticipantJoinedPayload>;
  public nickName: string;
  public avatar: string;
  public onChatEnded: ((chatInterface: TenrxPatientChatInterface) => void) | undefined;
  public onChatStarted: ((chatInterface: TenrxPatientChatInterface, participantsList: string[]) => void) | undefined;
  public onParticipantJoined: ((chatInterface: TenrxPatientChatInterface, participantId: string) => void) | undefined;
  public onParticipantLeft: ((chatInterface: TenrxPatientChatInterface, participantId: string) => void) | undefined;
  public onMessageReceived:
    | ((
        chatInterface: TenrxPatientChatInterface,
        participantId: string | null,
        message: string,
        metadata: TenrxChatMessageMetadata,
      ) => void)
    | undefined;
  public onTypingStarted: ((chatInterface: TenrxPatientChatInterface, participantId: string) => void) | undefined;
  public onTypingEnded: ((chatInterface: TenrxPatientChatInterface, participantId: string) => void) | undefined;
  public onUnknownEvent: ((chatInterface: TenrxPatientChatInterface, event: TenrxChatEvent) => void) | undefined;
  public onEvent(event: TenrxChatEvent) {
    TenrxLibraryLogger.silly('TenrxPatientChatInterface: Received chat event:', event);
    switch (event.type) {
      case TenrxChatEventType.ChatEnded:
        TenrxLibraryLogger.debug('TenrxPatientChatInterface: Chat ended');
        if (this.onChatEnded) this.onChatEnded(this);
        break;
      case TenrxChatEventType.ChatStarted:
        TenrxLibraryLogger.debug('TenrxPatientChatInterface: Chat started');
        const startedPayload = event.payload as TenrxChatStartedPayload;
        const participantsIds: string[] = [];
        startedPayload.forEach((participant) => {
          this.participants[participant.id] = participant;
          participantsIds.push(participant.id);
          TenrxLibraryLogger.debug(`${participant.nickName} has joined the chat.`);
        });
        if (this.onChatStarted) this.onChatStarted(this, participantsIds);
        break;
      case TenrxChatEventType.ChatParticipantJoined:
        const participantJoinedPayload = event.payload as TenrxChatParticipantJoinedPayload;
        this.participants[participantJoinedPayload.id] = participantJoinedPayload;
        TenrxLibraryLogger.debug(`${participantJoinedPayload.nickName} has joined the chat.`);
        if (this.onParticipantJoined) this.onParticipantJoined(this, participantJoinedPayload.id);
        break;
      case TenrxChatEventType.ChatParticipantLeft:
        if (event.senderId) {
          const participantId = event.senderId;
          if (this.participants[participantId]) {
            if (this.onParticipantLeft) this.onParticipantLeft(this, participantId);
            const nickName = this.participants[participantId] ? this.participants[participantId].nickName : 'Unknown';
            TenrxLibraryLogger.debug(`${nickName} has participant left the chat.`);
            delete this.participants[event.senderId];
          } else {
            TenrxLibraryLogger.warn(`Unknown participant has left the chat. Id: ${participantId}`);
          }
        } else {
          TenrxLibraryLogger.warn('TenrxPatientChatInterface: Participant left the chat without id.');
        }
        break;
      case TenrxChatEventType.ChatMessage:
        const message = event.payload as TenrxChatMessagePayload;
        const senderMessage = event.senderId ? this.participants[event.senderId].nickName : 'Unknown';
        TenrxLibraryLogger.debug(`${senderMessage}: ${message.message}`);
        if (this.onMessageReceived) this.onMessageReceived(this, event.senderId, message.message, message.metadata);
        break;
      case TenrxChatEventType.ChatTypingStarted:
        const senderTyping = event.senderId ? this.participants[event.senderId].nickName : 'Unknown';
        TenrxLibraryLogger.debug(`${senderTyping} started typing`);
        if (event.senderId) {
          if (this.onTypingStarted) this.onTypingStarted(this, event.senderId);
        } else {
          TenrxLibraryLogger.warn('TenrxPatientChatInterface: Participant started typing without id.');
        }
        break;
      case TenrxChatEventType.ChatTypingEnded:
        const senderTypingEnded = event.senderId ? this.participants[event.senderId].nickName : 'Unknown';
        TenrxLibraryLogger.debug(`${senderTypingEnded} stopped typing`);
        if (event.senderId) {
          if (this.onTypingEnded) this.onTypingEnded(this, event.senderId);
        } else {
          TenrxLibraryLogger.warn('TenrxPatientChatInterface: Participant stopped typing without id.');
        }
        break;
      default:
        TenrxLibraryLogger.warn('TenrxPatientChatInterface: Unknown event', event);
        if (this.onUnknownEvent) this.onUnknownEvent(this, event);
    }
  }
  constructor(nickName: string, avatar: string, id?: string) {
    super(id);
    this.nickName = nickName;
    this.participantId = '';
    this.participants = {};
    this.avatar = avatar;
  }

  /**
   * Enters the chat session.
   *
   * @memberof TenrxPatientChatInterface
   */
  public enterChat() {
    TenrxLibraryLogger.debug('TenrxPatientChatInterface: Entering chat.');
    if (this.chatEngine) {
      this.participantId = this.chatEngine.addParticipant(this.id, this.nickName, this.avatar);
      TenrxLibraryLogger.debug('TenrxPatientChatInterface: Participant id:', this.participantId);
    }
  }

  /**
   * Leaves the chat session.
   *
   * @memberof TenrxPatientChatInterface
   */
  public leaveChat() {
    TenrxLibraryLogger.debug('TenrxPatientChatInterface: Leaving chat.');
    if (this.chatEngine) {
      this.chatEngine.removeParticipant(this.participantId, this.id);
      this.participantId = '';
    }
  }

  /**
   * Sends a message to the chat session. Most interfaces will automatically assume that after each sendMessage call, that the user stopped typing.
   *
   * @param {string} message - The message to be sent.
   * @param {TenrxChatMessageMetadata} metadata - The metadata to be sent.
   * @param {string} [receipentId] - The receipent id if the message is targeted to someone. If set to null or undefined, the message will be sent to all participants.
   * @memberof TenrxPatientChatInterface
   */
  public sendMessage(message: string, metadata: TenrxChatMessageMetadata, receipentId?: string) {
    TenrxLibraryLogger.debug('TenrxPatientChatInterface: Sending message.');
    if (this.chatEngine) {
      this.chatEngine.sendMessage(this.participantId, { message, metadata }, receipentId);
    }
  }

  /**
   * Notifies the chat session that the user is typing.
   *
   * @memberof TenrxPatientChatInterface
   */
  public startTyping() {
    TenrxLibraryLogger.debug('TenrxPatientChatInterface: Start typing.');
    if (this.chatEngine) {
      this.chatEngine.startTyping(this.participantId);
    }
  }

  /**
   * Notifies the chat session that the user stopped typing.
   *
   * @memberof TenrxPatientChatInterface
   */
  public stopTyping() {
    TenrxLibraryLogger.debug('TenrxPatientChatInterface: Stop typing.');
    if (this.chatEngine) {
      this.chatEngine.stopTyping(this.participantId);
    }
  }
}
