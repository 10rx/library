import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';
import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';

/**
 * Represents an answer to a specific question determined by questionId.
 *
 * @export
 * @interface TenrxQuestionnaireAnswer
 */
export default interface TenrxQuestionnaireAnswer {
  /**
   * The id of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswer
   */
  questionId: number;
  
  /**
   * The id of the type of the question.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswer
   */
  questionTypeId: number;
  
  /**
   * The type of the question.
   *
   * @type {TenrxQuestionnaireAnswerType}
   * @memberof TenrxQuestionnaireAnswer
   */
  questionType: TenrxQuestionnaireAnswerType;
  
  /**
   * The actual answer to the question.
   *
   * @type {TenrxQuestionnaireAnswerOption[]}
   * @memberof TenrxQuestionnaireAnswer
   */
  answers: TenrxQuestionnaireAnswerOption[];
}
