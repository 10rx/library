import { Testlogger } from './includes/TexrxCommonInclude.js';
import {
  TenrxChatEngine,
  TenrxChatEvent,
  TenrxChatEventType,
  TenrxChatInterface,
  TenrxChatMessageMetadata,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
  TenrxChatStatus,
  TenrxLibraryLogger,
  TenrxPatientChatInterface,
  TenrxQuestionnaireAnswerOption,
  TenrxQuestionnaireBot,
  TenrxQuestionnaireBotStatus,
  TenrxQuestionnairePossibleAnswers,
} from '../src/index.js';
import TenrxQuestionnaireAnswer from '../src/types/TenrxQuestionnaireAnswer.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

test('Questionnaire Test Successful', async () => {
  const onChatStarted = (chatInterface: TenrxPatientChatInterface, participantsList: string[]): void => {
    Testlogger.info('Chat started');
    chatInterface.enterChat();
  };
  const onChatEnded = (chatInterface: TenrxPatientChatInterface): void => {
    Testlogger.info('Chat ended');
  };
  const onChatMessage = (
    chatInterface: TenrxPatientChatInterface,
    participantId: string | null,
    message: string,
    metadata: TenrxChatMessageMetadata,
  ): void => {
    if (participantId) {
      const participant = chatInterface.participants[participantId];
      Testlogger.info(`${participant.nickName}: ${message}`);
      if (metadata && metadata.kind === 'QuestionnairePossibleAnswers') {
        const possibleAnswers = metadata.data as TenrxQuestionnairePossibleAnswers;
        const answer: TenrxQuestionnaireAnswer = {
          questionID: possibleAnswers.questionID,
          options: possibleAnswers.possibleAnswers || [{ id: 0, option: 'answer' }],
        };
        chatInterface.sendMessage('', {
          kind: 'QuestionnaireAnswer',
          data: answer,
        });
      }
    }
  };
  const onChatTypingStarted = (chatInterface: TenrxPatientChatInterface, participantId: string): void => {
    const participant = chatInterface.participants[participantId];
    Testlogger.info(`${participant.nickName} started typing`);
  };
  const onChatParticipantJoined = (chatInterface: TenrxPatientChatInterface, participantId: string): void => {
    const participant = chatInterface.participants[participantId];
    Testlogger.info(`${participant.nickName} has joined the chat.`);
  };
  const onChatParticipantLeft = (chatInterface: TenrxPatientChatInterface, participantId: string): void => {
    const participant = chatInterface.participants[participantId];
    Testlogger.info(`${participant.nickName} has participant left the chat.`);
  };
  const chatEngine = new TenrxChatEngine();
  const human = new TenrxPatientChatInterface('Patient', '');
  human.onChatStarted = onChatStarted;
  human.onChatEnded = onChatEnded;
  human.onMessageReceived = onChatMessage;
  human.onTypingStarted = onChatTypingStarted;
  human.onParticipantJoined = onChatParticipantJoined;
  human.onParticipantLeft = onChatParticipantLeft;
  const questionnaireBot = new TenrxQuestionnaireBot('Questionnaire Bot', '', 7, true, {
    delayTyping: 0,
    questionnaireID: 7,
    isVisitType: true,
    language: 'en',
  });
  try {
    const ready = await questionnaireBot.start();
    expect(ready).toBe(true);
    if (ready) {
      questionnaireBot.id = chatEngine.bindInterface(questionnaireBot);
      chatEngine.bindInterface(human);
      chatEngine.startChat();
      expect(chatEngine.getChatStatus()).toBe(TenrxChatStatus.Active);
      expect(questionnaireBot.status).toBe(TenrxQuestionnaireBotStatus.COMPLETED);
      chatEngine.stopChat();
      expect(questionnaireBot.answers).not.toBeNull();
      if (questionnaireBot.answers) {
        expect(questionnaireBot.answers.length).toBeGreaterThan(0);
      }
    }
  } catch (error) {
    Testlogger.error(error);
  }
});
