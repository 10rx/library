import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';
import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';

export default interface TenrxQuestionnairePossibleAnswers {
  questionId: number;
  questionTypeId: number;
  answerType: TenrxQuestionnaireAnswerType;
  possibleAnswers: TenrxQuestionnaireAnswerOption[] | null;
}
