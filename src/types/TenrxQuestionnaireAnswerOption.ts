export default interface TenrxQuestionnaireAnswerOption {
  id: number;
  questionnaireMasterId: number;
  optionValue: string;
  optionInfo: string;
  numericValue: number;
  displayOrder: number;
}
