import { TenrxQuestionnaireSurveyResponsesAPIModel } from '../index.js';
export default interface TenrxQuestionnaireSaveAnswersAPIModel {
  surveyAnswers: TenrxQuestionnaireSurveyResponsesAPIModel[];
  orderNumber: string;
  patientComment: string;
  paymentStatus: boolean;
}
