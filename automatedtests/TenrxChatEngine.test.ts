import { Testlogger } from './includes/TexrxCommonInclude.js';
import {
  TenrxChatEngine,
  TenrxChatEvent,
  TenrxChatEventType,
  TenrxChatInterface,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
  TenrxChatStatus,
  TenrxLibraryLogger,
} from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
  minLevel: 'info',
});

class DummyChatInterface extends TenrxChatInterface {
  public dummyNumber: string;
  private participantId: string;
  private participants: Record<string, TenrxChatParticipantJoinedPayload>;
  public onEvent(event: TenrxChatEvent, engine: TenrxChatEngine) {
    Testlogger.silly(event);
    switch (event.type) {
      case TenrxChatEventType.ChatEnded:
        Testlogger.info(`${this.dummyNumber}: Chat ended`);
        break;
      case TenrxChatEventType.ChatStarted:
        Testlogger.info(`${this.dummyNumber}: Chat started`);
        const startedPayload = event.payload as TenrxChatStartedPayload;
        startedPayload.forEach((participant) => {
          this.participants[participant.id] = participant;
          Testlogger.info('Adding Participant:', participant);
        });
        this.participantId = engine.addParticipant(
          this.id,
          `Dummy-${this.dummyNumber}`,
          `Dummy-${this.dummyNumber}.jpg`,
        );
        break;
      case TenrxChatEventType.ChatParticipantJoined:
        const participantJoinedPayload = event.payload as TenrxChatParticipantJoinedPayload;
        this.participants[participantJoinedPayload.id] = participantJoinedPayload;
        Testlogger.info(`${this.dummyNumber}: ${participantJoinedPayload.nickName} has joined the chat.`);
        if (participantJoinedPayload.nickName === 'Dummy-2') {
          engine.removeParticipant(this.participantId, this.id);
        }
        break;
      case TenrxChatEventType.ChatParticipantLeft:
        if (event.senderId) {
          const participantId = event.senderId;
          const nickName = this.participants[participantId] ? this.participants[participantId].nickName : 'Unknown';
          Testlogger.info(`${this.dummyNumber}: ${nickName} has participant left the chat.`);
          delete this.participants[event.senderId];
        }
        break;
      default:
        Testlogger.info(`${this.dummyNumber}: Unknown event`);
    }
  }
  constructor(dummyNumber: string) {
    super();
    this.dummyNumber = dummyNumber;
    this.participantId = '';
    this.participants = {};
  }
}

test('TenrxChatEngine Test Successful', async () => {
  const chatEngine = new TenrxChatEngine();
  const chatInterfaceOne = new DummyChatInterface('1');
  const chatInterfaceTwo = new DummyChatInterface('2');
  chatInterfaceOne.id = chatEngine.bindInterface(chatInterfaceOne);
  chatInterfaceTwo.id = chatEngine.bindInterface(chatInterfaceTwo);
  chatEngine.startChat();
  expect(chatEngine.getChatStatus()).toBe(TenrxChatStatus.Active);
  chatEngine.cleanupChat();
});
