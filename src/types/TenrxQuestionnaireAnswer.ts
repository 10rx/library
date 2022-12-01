import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';

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
  questionID: number;

  /**
   * The actual answer to the question.
   *
   * @type {TenrxQuestionnaireAnswerOption[]}
   * @memberof TenrxQuestionnaireAnswer
   */
  options?: TenrxQuestionnaireAnswerOption[];

  answer?: string;
}
