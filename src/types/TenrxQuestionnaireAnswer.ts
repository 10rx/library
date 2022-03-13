import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';
import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';

export default interface TenrxQuestionnaireAnswer {
  questionId: number;
  questionTypeId: number;
  questionType: TenrxQuestionnaireAnswerType;
  answers: TenrxQuestionnaireAnswerOption[];
}
