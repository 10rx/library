import TenrxQuestionnaireSurveyResponseAPIModel from './TenrxQuestionnaireSurveyResponsesAPIModel.js';
export default interface TenrxQuestionnaireSaveAnswersAPIModel {
  surveyAnswers: TenrxQuestionnaireSurveyResponseAPIModel[];
  orderNumber: string;
  patientComment: string;
  paymentStatus: boolean;
}
