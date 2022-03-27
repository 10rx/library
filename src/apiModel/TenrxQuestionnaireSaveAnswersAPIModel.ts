import TenrxQuestionnaireSurveyResponseAPIModel from './TenrxQuestionnaireSurveyResponsesAPIModel.js';
export default interface TenrxQuestionnaireSaveAnswersAPIModel {
  surveyResponses: TenrxQuestionnaireSurveyResponseAPIModel[];
  orderNumber: string;
  patientComment: string;
  paymentStatus: boolean;
}
