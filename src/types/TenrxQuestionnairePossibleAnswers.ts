import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';
import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';
import { QuestionType } from '../index.js';

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
  questionID: number;

  /**
   * The id of the type of the question.
   *
   * @type {QuestionType}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  questionType: QuestionType;

  /**
   * The actual possible answers to a question.
   *
   * @type {(TenrxQuestionnaireAnswerOption[] | null)}
   * @memberof TenrxQuestionnairePossibleAnswers
   */
  possibleAnswers: TenrxQuestionnaireAnswerOption[] | null;
}
