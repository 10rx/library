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

  /**
   * The id of the questionnaire that this answer belongs to.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  questionnaireMasterId: number;

  /**
   * The actual value of the answer option.
   *
   * @type {string}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  optionValue: string;

  /**
   * Any information regarding the answer option..
   *
   * @type {string}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  optionInfo: string;

  /**
   * Any numeric value that the answer might or might not have.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  numericValue: number;

  /**
   * Any specific display order. If display order is the same, then the order is random.
   *
   * @type {number}
   * @memberof TenrxQuestionnaireAnswerOption
   */
  displayOrder: number;
}
