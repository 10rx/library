import {
  Answer,
  TenrxChatEvent,
  TenrxChatMessageMetadata,
  TenrxChatMessagePayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatStartedPayload,
  TenrxLibraryLogger,
  TenrxQuestionnaire,
  TenrxQuestionnaireError,
  TenrxQuestionnairePossibleAnswers,
  QuestionEnd,
  TenrxChatEventType,
  TenrxChatStatus,
  TenrxQuestionnaireAnswerType,
  TenrxQuestionnaireBotStatus,
  TenrxQuestionnaireAnswer,
  TenrxChatInterface,
} from '../index.js';

const defaultWelcomeMessage = 'Welcome to 10rx!';
const defaultEndMessage = 'Thank you for your time!';
const defaultUnableToUnderstandMessage = "I'm sorry, I didn't understand that.";
const defaultCouldYouRepeatThatMessage = "I'm sorry. Could you repeat that?";
const defaultTypingDelay = 1000;

export default class TenrxQuestionnaireBot extends TenrxChatInterface {
  public questionnaireBotOptions: TenrxQuestionnaireBotOptions;

  public currentQuestion: number;

  private internalState: TenrxQuestionnaireBotStatus;

  private participants: Record<string, TenrxChatParticipantJoinedPayload>;

  private internalParticipantId: string;

  private questionnaire: TenrxQuestionnaire;

  /**
   * Gets all the answers currently submitted to the bot.
   *
   * @readonly
   * @type {Answer[]}
   * @memberof TenrxQuestionnaireBot
   */
  public get answers(): Answer[] {
    return this.questionnaire.answers;
  }

  public get totalQuestions() {
    return this.questionnaire.totalQuestions;
  }

  /**
   * This is the event handler of the bot. This is primarily used by the chat engine when events are sent.
   *
   * @param {TenrxChatEvent} event - The event that is being handled.
   * @memberof TenrxQuestionnaireBot
   */
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

  private askQuestion(index?: number): void {
    const question = this.questionnaire.nextQuestion(index);
    if (question) {
      const data: TenrxQuestionnairePossibleAnswers = {
        questionID: question.id,
        questionType: question.type,
        questionNumber: this.questionnaire.index + 1,
        possibleAnswers: question.options.map((o) => ({
          id: o.id,
          option: this.questionnaireBotOptions.language === 'es' ? o.spanish : o.english,
        })),
      };
      this.sendMessage(this.questionnaireBotOptions.language === 'es' ? question.spanish : question.english, {
        kind: 'QuestionnairePossibleAnswers',
        data,
      });
    } else {
      this.end();
    }
  }

  // TODO: Make a failure option
  private end() {
    this.internalState = TenrxQuestionnaireBotStatus.COMPLETED;
    this.sendMessage(
      this.questionnaireBotOptions.endMessage ? this.questionnaireBotOptions.endMessage : defaultEndMessage,
      { kind: 'QuestionnaireEnd', data: null },
    );
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

  private handleReceivedMessage(senderId: string | null, messagePayload: TenrxChatMessagePayload, timestamp: Date) {
    if (senderId === null) {
      return;
    }
    const participant = this.participants[senderId];
    TenrxLibraryLogger.debug(`${participant.nickName} (${timestamp.toString()}): ${messagePayload.message}`);
    if (messagePayload.metadata != null) {
      if (messagePayload.metadata.kind === 'QuestionnaireAnswer') {
        const data = messagePayload.metadata.data as TenrxQuestionnaireAnswer;
        const next = this.questionnaire.saveAnswer({
          questionID: data.questionID,
          options: data.options ? data.options.map((o) => o.id) : undefined,
          answer: data.answer,
        });
        if (next.end === QuestionEnd.No) {
          this.askQuestion(next.next || undefined);
        } else {
          this.end();
        }
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
      this.askQuestion(this.questionnaire.index);
    }
  }

  public updateAnswer(data: TenrxQuestionnaireAnswer) {
    try {
      this.questionnaire.saveAnswer({
        questionID: data.questionID,
        options: data.options ? data.options.map((o) => o.id) : undefined,
        answer: data.answer,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates an instance of TenrxQuestionnaireBot.
   *
   * @param {string} nickName - The nickname of the bot.
   * @param {string} avatar - The avatar of the bot.
   * @param {number} visitTypeId - The visit type id of the bot.
   * @param {TenrxQuestionnaireBotOptions} [options] - The options of the bot.
   * @param {string} [id] - The id of the bot. This is usually generated by the TenrxChatEngine.
   * @memberof TenrxQuestionnaireBot
   */
  constructor(
    nickName: string,
    avatar: string,
    questionnaireID: number,
    isVisitType: boolean,
    options?: TenrxQuestionnaireBotOptions,
    id?: string,
  ) {
    super(id);
    this.internalState = TenrxQuestionnaireBotStatus.NOTREADY;
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
      questionnaireID,
      isVisitType,
      language: options?.language || 'en',
    };
    if (isVisitType) {
      this.questionnaire = new TenrxQuestionnaire({
        visitType: questionnaireID,
        language: this.questionnaireBotOptions.language,
      });
    } else
      this.questionnaire = new TenrxQuestionnaire({
        questionnaireID,
        language: this.questionnaireBotOptions.language,
      });
  }

  /**
   * Sets the questionnaire options for the bot.
   *
   * @param {TenrxQuestionnaireBotOptions} options - The options to configure the bot.
   * @memberof TenrxQuestionnaireBot
   */
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

  /**
   * Starts the bot. This will pull the questionnaire from the Tenrx server and start the bot.
   *
   * @param {string} [language='en'] - The language of the bot.
   * @param {*} [engine=useTenrxApi()] - The chat engine to use.
   * @return {*}  {Promise<boolean>}
   * @memberof TenrxQuestionnaireBot
   */
  public async start(): Promise<boolean> {
    if (this.internalState !== TenrxQuestionnaireBotStatus.READY) {
      try {
        await this.questionnaire.load();
        this.internalState = TenrxQuestionnaireBotStatus.READY;
      } catch (error) {
        TenrxLibraryLogger.error('Error getting question list', error);
        throw new TenrxQuestionnaireError('Error getting question list', error);
      }
    }
    return this.internalState === TenrxQuestionnaireBotStatus.READY;
  }

  /**
   * Gets the status of the boat.
   *
   * @readonly
   * @type {TenrxQuestionnaireBotStatus}
   * @memberof TenrxQuestionnaireBot
   */
  public get status(): TenrxQuestionnaireBotStatus {
    return this.internalState;
  }
}

export type TenrxQuestionnaireBotOptions = {
  nickName?: string;
  avatar?: string;
  questionnaireID: number;
  isVisitType: boolean;
  welcomeMessage?: string;
  endMessage?: string;
  unableToUnderstandMessage?: string;
  couldYouRepeatThatMessage?: string;
  delayTyping?: number;
  language: 'en' | 'es';
};
