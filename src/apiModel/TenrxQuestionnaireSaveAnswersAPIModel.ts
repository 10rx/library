import TenrxQuestionnaireSurveyResponseAPIModel from './TenrxQuestionnaireSurveyResponsesAPIModel.js';
export default interface TenrxQuestionnaireSaveAnswersAPIModel {
  surveyResponses: TenrxQuestionnaireSurveyResponseAPIModel[];
  paymentId: number;
  appointmentId: number;
  visitTypeId: {
    visitTypeId: number;
  }[];
  guestMasterId: number;
  surgeryMasterId: number;
  patientId: number;
  userId: number;
  patientComment: string;
  paymentStatus: boolean;
  patientEncounterId: number;
  isClientAccepted: boolean;
  isSurgeryRequest: boolean;
}
