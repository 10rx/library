/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxQuestionnaireSurveyResponseAPIModel {
  questionnaireMasterID: number;
  id: number;
  answerMasterServerId: number;
  answerOptionServerId: number;
  answerValue: string;
  categoryId: number;
  patientAppointmentId: number;
  patientEncrytedId: string;
  patientId: number;
  questionMasterId: number;
  questionMatrixDetailsId: number;
  questionMatrixDetailsServerId: number;
  questionMatrixMasterId: 0;
  questionMatrixMasterServerId: number;
  questionOptionId: number;
  questionTypeId: number;
  templateMasterId: number;
  userID: number;
  visitTypeId: number;
  isDeleted: boolean;
  access_token: 'string';
}
