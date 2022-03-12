import TenrxQuestionnaireAnswerAPIModel from './TenrxQuestionnaireAnswerAPIModel.js';

export default interface TenrxQuestionnaireQuestionAPIModel {
  questionnaireMasterID: number;
  question: string;
  questionEs: string;
  conditionValue1: string | null;
  conditionValue2: string | null;
  conditionValue3: string | null;
  questionTypeCode: string;
  questionTypeID: number;
  answers: TenrxQuestionnaireAnswerAPIModel[];
}
