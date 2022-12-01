/**
 * Represents an answer option in general to the questionnaire. It is not tied to a specific question.
 *
 * @export
 * @interface TenrxQuestionnaireAnswerOption
 */
export default interface TenrxQuestionnaireAnswerOption {
  /**
   * The id of the answer option.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  id: number;

  option: string;

}
