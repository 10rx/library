import { Testlogger } from './includes/TexrxCommonInclude.js';
import {
  TenrxChatEngine,
  TenrxChatEvent,
  TenrxChatEventType,
  TenrxChatInterface,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
  TenrxChatStatus,
  TenrxLibraryLogger,
  TenrxQuestionnaireAnswerOption,
  TenrxQuestionnaireBot,
} from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
  minLevel: 'info',
});

class PatientChatInterface extends TenrxChatInterface {
  private participantId: string;
  private participants: Record<string, TenrxChatParticipantJoinedPayload>;
  private nickName: string;
  public onEvent(event: TenrxChatEvent, engine: TenrxChatEngine) {
    Testlogger.silly(event);
    switch (event.type) {
      case TenrxChatEventType.ChatEnded:
        Testlogger.info('Chat ended');
        break;
      case TenrxChatEventType.ChatStarted:
        Testlogger.info('Chat started');
        const startedPayload = event.payload as TenrxChatStartedPayload;
        startedPayload.forEach((participant) => {
          this.participants[participant.id] = participant;
          Testlogger.info(`${participant.nickName} has joined the chat.`);
        });
        this.participantId = engine.addParticipant(this.id, this.nickName, '');
        break;
      case TenrxChatEventType.ChatParticipantJoined:
        const participantJoinedPayload = event.payload as TenrxChatParticipantJoinedPayload;
        this.participants[participantJoinedPayload.id] = participantJoinedPayload;
        Testlogger.info(`${participantJoinedPayload.nickName} has joined the chat.`);
        break;
      case TenrxChatEventType.ChatParticipantLeft:
        if (event.senderId) {
          const participantId = event.senderId;
          const nickName = this.participants[participantId] ? this.participants[participantId].nickName : 'Unknown';
          Testlogger.info(`${nickName} has participant left the chat.`);
          delete this.participants[event.senderId];
        }
        break;
      case TenrxChatEventType.ChatMessage:
        const message = event.payload as TenrxChatMessagePayload;
        const senderone = event.senderId ? this.participants[event.senderId].nickName : 'Unknown';
        Testlogger.info(`${senderone}: ${message.message}`);
        if (message.metadata && message.metadata.kind === 'QuestionnairePossibleAnswers') {
          const possibleAnswers = message.metadata.data as TenrxQuestionnaireAnswerOption[];
          engine.sendMessage(this.participantId, {
            message: '',
            metadata: {
              kind: 'QuestionnaireAnswer',
              data: possibleAnswers[0],
            },
          });
        }
        break;
      case TenrxChatEventType.ChatTypingStarted:
        const sender = event.senderId ? this.participants[event.senderId].nickName : 'Unknown';
        Testlogger.info(`${sender} started typing`);
        break;
      default:
        Testlogger.info(`Unknown event`, event);
    }
  }
  constructor(nickName: string) {
    super();
    this.nickName = nickName;
    this.participantId = '';
    this.participants = {};
  }
}

test('Questionnaire Test Successful', async () => {
  const chatEngine = new TenrxChatEngine();
  const human = new PatientChatInterface('BotOne');
  const questionnaireBot = new TenrxQuestionnaireBot('Questionnaire Bot', '', 2, { delayTyping: 0 });
  try {
    const ready = await questionnaireBot.start();
    expect(ready).toBe(true);
    if (ready) {
      questionnaireBot.id = chatEngine.bindInterface(questionnaireBot);
      human.id = chatEngine.bindInterface(human);
      chatEngine.startChat();
      expect(chatEngine.getChatStatus()).toBe(TenrxChatStatus.Active);
    }
  } catch (error) {
    Testlogger.error(error);
    fail(error);
  }
});
