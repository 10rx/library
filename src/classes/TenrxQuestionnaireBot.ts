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
  TenrxQuestionnairePossibleAnswers,
  TenrxQuestionnaireQuestion,
  useTenrxApi,
} from '../index.js';
import TenrxQuestionnaireAnswer from '../types/TenrxQuestionnaireAnswer.js';
import TenrxChatInterface from './TenrxChatInterface.js';

const defaultWelcomeMessage = 'Welcome to 10rx!';
const defaultEndMessage = 'Thank you for your time!';
const defaultUnableToUnderstandMessage = "I'm sorry, I didn't understand that.";
const defaultCouldYouRepeatThatMessage = "I'm sorry. Could you repeat that?";
const defaultTypingDelay = 1000;

export default class TenrxQuestionnaireBot extends TenrxChatInterface {
  public questionnaireBotOptions: TenrxQuestionnaireBotOptions;

  public currentQuestion: number;

  private internalState: TenrxQuestionnaireBotStatus;
  private internalQuestions: TenrxQuestionnaireQuestion[];

  private participants: Record<string, TenrxChatParticipantJoinedPayload>;

  private internalParticipantId: string;

  private internalAnswers: TenrxQuestionnaireAnswer[];

  public get answers(): TenrxQuestionnaireAnswer[] {
    return this.internalAnswers;
  }

  public onEvent(event: TenrxChatEvent): void {
    TenrxLibraryLogger.silly('TenrxQuestionnaireBot.onEvent', event);
    if (this.internalState === TenrxQuestionnaireBotStatus.READY) {
      switch (event.type) {
        case TenrxChatEventType.ChatEnded:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Chat ended');
          break;
        case TenrxChatEventType.ChatStarted:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Chat started.');
          this.handleChatStarted(event.payload as TenrxChatStartedPayload);
          break;
        case TenrxChatEventType.ChatParticipantJoined:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Participant joined');
          this.handleParticipantJoined(event.payload as TenrxChatParticipantJoinedPayload);
          break;
        case TenrxChatEventType.ChatParticipantLeft:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Participant left');
          break;
        case TenrxChatEventType.ChatMessage:
          TenrxLibraryLogger.debug('TenrxQuestionnaireBot.onEvent: Message received');
          this.handleReceivedMessage(event.senderId, event.payload as TenrxChatMessagePayload, event.timestamp);
          break;
        default:
          TenrxLibraryLogger.warn('Unknown event type', event);
      }
    }
    // TODO explore if we just reschedule this event for processing
  }

  private handleParticipantJoined(payload: TenrxChatParticipantJoinedPayload) {
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
        );
        this.askQuestion(this.currentQuestion);
      }
    }
  }

  private handleChatStarted(payload: TenrxChatStartedPayload) {
    payload.forEach((participant) => {
      this.participants[participant.id] = participant;
      TenrxLibraryLogger.debug('Adding Participant: "' + participant.nickName + '" wit id: ' + participant.id);
    });
    if (this.chatEngine) {
      const nickName = this.questionnaireBotOptions.nickName
        ? this.questionnaireBotOptions.nickName
        : 'Questionnaire bot';
      this.internalParticipantId = this.chatEngine.addParticipant(
        this.id,
        nickName,
        this.questionnaireBotOptions.avatar,
      );
      TenrxLibraryLogger.silly(`TenrxQuestionnaireBot participant id is: ${this.internalParticipantId}`);
      if (Object.keys(this.participants).length > 0) {
        if (this.currentQuestion < 0) {
          this.currentQuestion = 0;
          this.sendMessage(
            this.questionnaireBotOptions.welcomeMessage
              ? this.questionnaireBotOptions.welcomeMessage
              : defaultWelcomeMessage,
            { kind: 'QuestionnaireStart', data: null },
          );
          this.askQuestion(this.currentQuestion);
        }
      }
    } else {
      TenrxLibraryLogger.warn('Questionnaire (handleChatStarted): Chat does not exists.');
    }
  }

  private askQuestion(index: number): void {
    TenrxLibraryLogger.debug('Asking question: ' + index.toString());
    if (index < this.internalQuestions.length) {
      const question = this.internalQuestions[index];
      const data: TenrxQuestionnairePossibleAnswers = {
        questionId: question.questionId,
        questionTypeId: question.questionTypeId,
        answerType: question.answerType,
        possibleAnswers: question.possibleAnswers,
      };
      this.sendMessage(question.question, {
        kind: 'QuestionnairePossibleAnswers',
        data,
      });
    } else {
      this.internalState = TenrxQuestionnaireBotStatus.COMPLETED;
      this.sendMessage(
        this.questionnaireBotOptions.endMessage ? this.questionnaireBotOptions.endMessage : defaultEndMessage,
        { kind: 'QuestionnaireEnd', data: null },
      );
    }
  }

  private sendMessage(message: string, metadata: TenrxChatMessageMetadata): void {
    if (this.chatEngine) {
      if (this.chatEngine.getChatStatus() === TenrxChatStatus.Active) {
        const delayTyping =
          this.questionnaireBotOptions.delayTyping !== undefined
            ? this.questionnaireBotOptions.delayTyping
            : defaultTypingDelay;
        this.chatEngine.startTyping(this.internalParticipantId);
        if (delayTyping > 0) {
          setTimeout(() => {
            if (this.chatEngine) {
              if (this.chatEngine.getChatStatus() === TenrxChatStatus.Active) {
                this.chatEngine.sendMessage(this.internalParticipantId, {
                  message,
                  metadata,
                });
              } else {
                TenrxLibraryLogger.warn('Questionnaire: Chat is no longer active. Unable to send message.', message);
              }
            } else {
              TenrxLibraryLogger.warn('Questionnaire: Chat is no longer exists. Unable to send message.', message);
            }
          }, delayTyping);
        } else {
          this.chatEngine.sendMessage(this.internalParticipantId, {
            message,
            metadata,
          });
        }
      }
    }
  }

  private handleReceivedMessage(senderId: string | null, messagePayload: TenrxChatMessagePayload, timestamp: DateTime) {
    if (senderId === null) {
      return;
    }
    const participant = this.participants[senderId];
    TenrxLibraryLogger.debug(`${participant.nickName} (${timestamp.toString()}): ${messagePayload.message}`);
    if (messagePayload.metadata != null) {
      if (messagePayload.metadata.kind === 'QuestionnaireAnswer') {
        this.internalAnswers.push(messagePayload.metadata.data as TenrxQuestionnaireAnswer);
        this.currentQuestion++;
        this.askQuestion(this.currentQuestion);
      } else {
        this.sendMessage(
          this.questionnaireBotOptions.couldYouRepeatThatMessage
            ? this.questionnaireBotOptions.couldYouRepeatThatMessage
            : defaultCouldYouRepeatThatMessage,
          null,
        );
      }
    } else {
      this.sendMessage(
        this.questionnaireBotOptions.unableToUnderstandMessage
          ? this.questionnaireBotOptions.unableToUnderstandMessage
          : defaultUnableToUnderstandMessage,
        null,
      );
      this.askQuestion(this.currentQuestion);
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
      unableToUnderstandMessage: defaultUnableToUnderstandMessage,
      couldYouRepeatThatMessage: defaultCouldYouRepeatThatMessage,
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
                                questionnaireMasterId: question.questionnaireMasterID,
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
                            questionTypeId: question.questionTypeID,
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
                        throw new TenrxQuestionnaireError(
                          'No questions found: Questionnaire question list length is 0.',
                        );
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
  unableToUnderstandMessage?: string;
  couldYouRepeatThatMessage?: string;
  delayTyping?: number;
};
