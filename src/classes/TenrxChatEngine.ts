import TenrxChatNotActive from '../exceptions/TenrxChatNotActive.js';
import { TenrxChatStatus } from '../includes/TenrxEnums.js';
import { TenrxLibraryLogger } from '../index.js';
import TenrxChatParticipant from './TenrxChatParticipant.js';

export default class TenrxChatEngine {
  private internalChatParticipants: Record<string, TenrxChatParticipant>;
  private internalChatStatus: TenrxChatStatus;

  constructor() {
    this.internalChatParticipants = {};
    this.internalChatStatus = TenrxChatStatus.Idle;
  }

  public restartChat(): void {
    this.internalChatParticipants = {};
    this.internalChatStatus = TenrxChatStatus.Idle;
  }

  public getChatStatus(): TenrxChatStatus {
    return this.internalChatStatus;
  }

  public startChat(): void {
    this.internalChatStatus = TenrxChatStatus.Active;
  }

  /**
   * Adds a participant to the chat.
   *
   * @param {TenrxChatParticipant} participant - The participant to add.
   * @return {*}  {string} - The id of the participant.
   * @memberof TenrxChatEngine
   * @throws {TenrxChatNotActive} - Throws an exception when the chat is not active.
   */
  public addParticipant(participant: TenrxChatParticipant): string {
    if (this.internalChatStatus === TenrxChatStatus.Active) {
      const id = TenrxChatEngine.getRandomId();
      Object.entries(this.internalChatParticipants).forEach(([key, value]) => {
        TenrxLibraryLogger.silly(
          `Notifying ${value.nickName} with id '${key}' that ${participant.nickName} has joined the chat.`,
        );
        
      });
      this.internalChatParticipants[id] = participant;
      return id;
    } else {
      TenrxLibraryLogger.error(`Unable to add ${participant.nickName} to the chat. Chat is not active.`);
      throw new TenrxChatNotActive(
        `Unable to add ${participant.nickName} to the chat. Chat is not active.`,
        'TenrxChatEngine',
      );
    }
  }

  public removeParticipant(id: string): void {
    if (this.internalChatParticipants[id]) {
      delete this.internalChatParticipants[id];
    } else {
      TenrxLibraryLogger.error(`Unable to remove participant with id '${id}' to the chat. Chat is not active.`);
      throw new TenrxChatNotActive(
        `Unable to remove participant with id '${id}' to the chat. Chat is not active.`,
        'TenrxChatEngine',
      );
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
