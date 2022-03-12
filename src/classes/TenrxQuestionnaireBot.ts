import { DateTime } from 'luxon';
import TenrxQuestionnaireQuestionAPIModel from '../apiModel/TenrxQuestionnaireQuestionAPIModel.js';
import {
  TenrxChatEventType,
  TenrxChatStatus,
  TenrxQuestionnaireAnswerType,
  TenrxQuestionnaireBotStatus,
} from '../includes/TenrxEnums.js';
import {
  TenrxChatEvent,
  TenrxChatMessageMetadata,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
  TenrxLibraryLogger,
  TenrxQuestionnaireAnswerOption,
  TenrxQuestionnaireError,
  TenrxQuestionnaireQuestion,
  useTenrxApi,
} from '../index.js';
import TenrxChatEngine from './TenrxChatEngine.js';
import TenrxChatInterface from './TenrxChatInterface.js';

const defaultWelcomeMessage = 'Welcome to 10rx!';
const defaultEndMessage = 'Thank you for your time!';
const defaultTypingDelay = 1000;

export default class TenrxQuestionnaireBot extends TenrxChatInterface {
  public questionnaireBotOptions: TenrxQuestionnaireBotOptions;

  public currentQuestion: number;

  private internalState: TenrxQuestionnaireBotStatus;
  private internalQuestions: TenrxQuestionnaireQuestion[];

  private participants: Record<string, TenrxChatParticipantJoinedPayload>;

  private internalParticipantId: string;

  private internalAnswers: TenrxQuestionnaireAnswerOption[];

  public onEvent(event: TenrxChatEvent, engine: TenrxChatEngine): void {
    TenrxLibraryLogger.silly('TenrxQuestionnaireBot.onEvent', event);
    if (this.internalState === TenrxQuestionnaireBotStatus.READY) {
      switch (event.type) {
        case TenrxChatEventType.ChatEnded:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Chat ended');
          break;
        case TenrxChatEventType.ChatStarted:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Chat started.');
          this.handleChatStarted(event.payload as TenrxChatStartedPayload, engine);
          break;
        case TenrxChatEventType.ChatParticipantJoined:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Participant joined');
          this.handleParticipantJoined(event.payload as TenrxChatParticipantJoinedPayload, engine);
          break;
        case TenrxChatEventType.ChatParticipantLeft:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Participant left');
          break;
        case TenrxChatEventType.ChatMessage:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Message received');
          this.handleReceivedMessage(event.senderId, event.payload as TenrxChatMessagePayload, event.timestamp, engine);
          break;
        default:
          TenrxLibraryLogger.warn('Unknown event type', event);
      }
    }
    // TODO explore if we just reschedule this event for processing
  }

  private handleParticipantJoined(payload: TenrxChatParticipantJoinedPayload, engine: TenrxChatEngine) {
    this.participants[payload.id] = payload;
    TenrxLibraryLogger.debug('Adding Participant: "' + payload.nickName + '" wit id: ' + payload.id);
    if (Object.keys(this.participants).length > 0) {
      if (this.currentQuestion < 0) {
        this.currentQuestion = 0;
        this.sendMessage(
          this.questionnaireBotOptions.welcomeMessage
            ? this.questionnaireBotOptions.welcomeMessage
            : defaultWelcomeMessage,
          null,
          engine,
        );
        this.askQuestion(this.currentQuestion, engine);
      }
    }
  }

  private handleChatStarted(payload: TenrxChatStartedPayload, engine: TenrxChatEngine) {
    payload.forEach((participant) => {
      this.participants[participant.id] = participant;
      TenrxLibraryLogger.debug('Adding Participant: "' + participant.nickName + '" wit id: ' + participant.id);
    });
    const nickName = this.questionnaireBotOptions.nickName
      ? this.questionnaireBotOptions.nickName
      : 'Questionnaire bot';
    this.internalParticipantId = engine.addParticipant(this.id, nickName, this.questionnaireBotOptions.avatar);
    TenrxLibraryLogger.silly(`TenrxQuestionnaireBot participant id is: ${this.internalParticipantId}`);
    if (Object.keys(this.participants).length > 0) {
      if (this.currentQuestion < 0) {
        this.currentQuestion = 0;
        this.sendMessage(
          this.questionnaireBotOptions.welcomeMessage
            ? this.questionnaireBotOptions.welcomeMessage
            : defaultWelcomeMessage,
          { kind: 'QuestionnaireStart', data: null },
          engine,
        );
        this.askQuestion(this.currentQuestion, engine);
      }
    }
  }

  private askQuestion(index: number, engine: TenrxChatEngine): void {
    TenrxLibraryLogger.debug('Asking question: ' + index.toString());
    if (index < this.internalQuestions.length) {
      const question = this.internalQuestions[index];
      this.sendMessage(
        question.question,
        {
          kind: 'QuestionnairePossibleAnswers',
          data: { answerType: question.answerType, possibleAnswers: question.possibleAnswers },
        },
        engine,
      );
    } else {
      this.sendMessage(
        this.questionnaireBotOptions.endMessage ? this.questionnaireBotOptions.endMessage : defaultEndMessage,
        { kind: 'QuestionnaireEnd', data: null },
        engine,
      );
    }
  }

  private sendMessage(message: string, metadata: TenrxChatMessageMetadata, engine: TenrxChatEngine): void {
    if (engine.getChatStatus() === TenrxChatStatus.Active) {
      const delayTyping =
        this.questionnaireBotOptions.delayTyping !== undefined
          ? this.questionnaireBotOptions.delayTyping
          : defaultTypingDelay;
      engine.startTyping(this.internalParticipantId);
      if (delayTyping > 0) {
        setTimeout(() => {
          if (engine.getChatStatus() === TenrxChatStatus.Active) {
            engine.sendMessage(this.internalParticipantId, {
              message,
              metadata,
            });
          } else {
            TenrxLibraryLogger.warn('Questionnaire: Chat is no longer active. Unable to send message.', message);
          }
        }, delayTyping);
      } else {
        engine.sendMessage(this.internalParticipantId, {
          message,
          metadata,
        });
      }
    }
  }

  private handleReceivedMessage(
    senderId: string | null,
    messagePayload: TenrxChatMessagePayload,
    timestamp: DateTime,
    engine: TenrxChatEngine,
  ) {
    if (senderId === null) {
      return;
    }
    const participant = this.participants[senderId];
    TenrxLibraryLogger.debug(`${participant.nickName} (${timestamp.toString()}): ${messagePayload.message}`);
    if (messagePayload.metadata != null) {
      // TODO save answer that is in metadata. Then ask next question.
      if (messagePayload.metadata.kind === 'QuestionnaireAnswer') {
        this.internalAnswers.push(messagePayload.metadata.data as TenrxQuestionnaireAnswerOption);
        this.currentQuestion++;
        this.askQuestion(this.currentQuestion, engine);
      } else {
        this.sendMessage(`I am sorry ${participant.nickName}, could you please repeat that?`, null, engine);
      }
    } else {
    this.sendMessage(`I'm sorry ${participant.nickName}, I didn't understand that.`, null, engine);
    this.askQuestion(this.currentQuestion, engine);
    }
    
  }

  constructor(
    nickName: string,
    avatar: string,
    visitTypeId: number,
    options?: TenrxQuestionnaireBotOptions,
    id?: string,
  ) {
    super(id);
    this.internalState = TenrxQuestionnaireBotStatus.NOTREADY;
    this.internalQuestions = [];
    this.currentQuestion = -1;
    this.internalParticipantId = '';
    this.participants = {};
    this.questionnaireBotOptions = {
      welcomeMessage: defaultWelcomeMessage,
      endMessage: defaultEndMessage,
      delayTyping: defaultTypingDelay,
      ...options,
      nickName,
      avatar,
      visitTypeId,
    };
    this.internalAnswers = [];
  }

  public setOptions(options: TenrxQuestionnaireBotOptions): void {
    this.questionnaireBotOptions = { ...this.questionnaireBotOptions, ...options };
  }

  private translateQuestionTypeCodeToAnswerType(questionTypeCode: string): TenrxQuestionnaireAnswerType {
    switch (questionTypeCode) {
      case 'PLAINTEXT':
        return TenrxQuestionnaireAnswerType.TEXT;
      case 'YESORNO':
        return TenrxQuestionnaireAnswerType.YESORNO;
      case 'MULTISELECT':
        return TenrxQuestionnaireAnswerType.MULTIPLESELECT;
      case 'MULTICHOICE':
        return TenrxQuestionnaireAnswerType.MULTIPLECHOICE;
      default:
        return TenrxQuestionnaireAnswerType.TEXT;
    }
  }

  public async start(language = 'en', engine = useTenrxApi()): Promise<boolean> {
    if (this.internalState !== TenrxQuestionnaireBotStatus.READY) {
      try {
        const visitTypeId = this.questionnaireBotOptions.visitTypeId ? this.questionnaireBotOptions.visitTypeId : 0;
        const response = await engine.getQuestionList([{ visitTypeId }]);
        if (response) {
          if (response.content) {
            const content = response.content as {
              data: { questionnaireTemplateList: { questionLists: TenrxQuestionnaireQuestionAPIModel[] }[] }[];
            };
            const data = content.data;
            if (data) {
              if (data.length > 0) {
                const questionnaireTemplateList = data[0].questionnaireTemplateList;
                if (questionnaireTemplateList) {
                  if (questionnaireTemplateList.length > 0) {
                    if (questionnaireTemplateList[0].questionLists) {
                      if (questionnaireTemplateList[0].questionLists.length > 0) {
                      for (const question of questionnaireTemplateList[0].questionLists) {
                        const possibleAnswers: TenrxQuestionnaireAnswerOption[] = [];
                        if (question.answers) {
                          for (const answer of question.answers) {
                            possibleAnswers.push({
                              id: answer.questionnaireOptionsID,
                              questionnaireId: question.questionnaireMasterID,
                              optionValue:
                                language === 'en'
                                  ? answer.optionValue
                                  : language === 'es'
                                  ? answer.optionValueEs
                                  : answer.optionValue,
                              optionInfo:
                                language === 'en'
                                  ? answer.optionInfo
                                  : language === 'es'
                                  ? answer.optionInfoEs
                                  : answer.optionInfo,
                              numericValue: answer.numericValue,
                              displayOrder: answer.displayOrder,
                            });
                          }
                        }
                        this.internalQuestions.push({
                          questionId: question.questionnaireMasterID,
                          question:
                            language === 'en'
                              ? question.question
                              : language === 'es'
                              ? question.questionEs
                              : question.question,
                          answerType: this.translateQuestionTypeCodeToAnswerType(question.questionTypeCode),
                          answerValue: '',
                          possibleAnswers,
                          conditionValue1: question.conditionValue1 ? question.conditionValue1 : '',
                          conditionValue2: question.conditionValue2 ? question.conditionValue2 : '',
                          conditionValue3: question.conditionValue3 ? question.conditionValue3 : '',
                        });
                      }
                      this.internalState = TenrxQuestionnaireBotStatus.READY;
                    } else {
                      throw new TenrxQuestionnaireError('No questions found: Questionnaire question list length is 0.');
                    }
                    } else {
                      throw new TenrxQuestionnaireError('No questions found: Questionnaire question list is null.');
                    }
                  } else {
                    throw new TenrxQuestionnaireError('No questions found: Questionnaire template length is 0.');
                  }
                } else {
                  throw new TenrxQuestionnaireError('No questions found: Questionnaire template list is null.');
                }
              } else {
                throw new TenrxQuestionnaireError('No questions found: data length is 0');
              }
            } else {
              throw new TenrxQuestionnaireError('No questions found: data is null');
            }
          } else {
            throw new TenrxQuestionnaireError('No questions found: content is null');
          }
        } else {
          throw new TenrxQuestionnaireError('No questions found: response is null');
        }
      } catch (error) {
        TenrxLibraryLogger.error('Error getting question list', error);
        throw new TenrxQuestionnaireError('Error getting question list', error);
      }
    }
    return this.internalState === TenrxQuestionnaireBotStatus.READY;
  }

  public get status(): TenrxQuestionnaireBotStatus {
    return this.internalState;
  }
}

export type TenrxQuestionnaireBotOptions = {
  nickName?: string;
  avatar?: string;
  visitTypeId?: number;
  welcomeMessage?: string;
  endMessage?: string;
  delayTyping?: number;
};
