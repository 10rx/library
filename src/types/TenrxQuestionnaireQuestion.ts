import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';
import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';

/**
 * Represents a question in the questionnaire.
 *
 * @export
 * @interface TenrxQuestionnaireQuestion
 */
export default interface TenrxQuestionnaireQuestion {
  /**
   * The id of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireQuestion
   */
  questionId: number;

  /**
   * The actual question.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireQuestion
   */
  question: string;

  /**
   * The id of the type of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireQuestion
   */
  questionTypeId: number;

  /**
   * The type of answers it can have.
   *
   * @type {TenrxQuestionnaireAnswerType}
   * @memberof TenrxQuestionnaireQuestion
   */
  answerType: TenrxQuestionnaireAnswerType;

  /**
   * The answer value.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireQuestion
   */
  answerValue: string;

  /**
   * The list of possible answer options for this question.
   *
   * @type {TenrxQuestionnaireAnswerOption[]}
   * @memberof TenrxQuestionnaireQuestion
   */
  possibleAnswers: TenrxQuestionnaireAnswerOption[];

  /**
   * Conditions for this question.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireQuestion
   */
  conditionValue1: string;

  /**
   * Conditions for this question.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireQuestion
   */
  conditionValue2: string;

  /**
   * Conditions for this question.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireQuestion
   */
  conditionValue3: string;
}
