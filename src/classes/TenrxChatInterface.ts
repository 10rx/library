import TenrxChatEvent from '../types/TenrxChatEvent.js';
import TenrxChatEngine from './TenrxChatEngine.js';

/**
 * Represents a chat interface. This is an abstract class that must be implemented at client level.
 *
 * @export
 * @abstract
 * @class TenrxChatInterface
 */
export default abstract class TenrxChatInterface {
  /**
   * The id of the interface.
   *
   * @type {string}
   * @memberof TenrxChatInterface
   */
  public id: string;
  
  /**
   * Handles the chat events.
   *
   * @abstract
   * @param {TenrxChatEvent} event - The chat event.
   * @param {TenrxChatEngine} engine - The chat engine.
   * @memberof TenrxChatInterface
   */
  public abstract onEvent(event: TenrxChatEvent, engine: TenrxChatEngine): void;
  
  /**
   * Creates an instance of TenrxChatInterface.
   * 
   * @param {string} [id] - The id of the interface.
   * @memberof TenrxChatInterface
   */
  constructor(id?: string) {
    this.id = id ? id : '';
  }
}
