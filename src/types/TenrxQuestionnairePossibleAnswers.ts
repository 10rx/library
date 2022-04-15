import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';
import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';

/**
 * Represents the possible answers to a specific question determined by questionId.
 *
 * @export
 * @interface TenrxQuestionnairePossibleAnswers
 */
export default interface TenrxQuestionnairePossibleAnswers {
  /**
   * The id of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  questionId: number;

  /**
   * The id of the type of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  questionTypeId: number;

  /**
   * The type of answers it can be.
   *
   * @type {TenrxQuestionnaireAnswerType}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  answerType: TenrxQuestionnaireAnswerType;

  /**
   * The actual possible answers to a question.
   *
   * @type {(TenrxQuestionnaireAnswerOption[] | null)}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  possibleAnswers: TenrxQuestionnaireAnswerOption[] | null;
}
