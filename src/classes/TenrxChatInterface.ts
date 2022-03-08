import TenrxChatEvent from "../types/TenrxChatEvent.js";
import TenrxChatEngine from "./TenrxChatEngine.js";

export default abstract class TenrxChatInterface {
  public abstract onEvent(event: TenrxChatEvent, engine: TenrxChatEngine): void;
}
