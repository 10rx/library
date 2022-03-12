export default interface TenrxQuestionnaireAnswerOption {
  id: number;
  questionnaireId: number;
  optionValue: string;
  optionInfo: string;
  numericValue: number;
  displayOrder: number;
}
