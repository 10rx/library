import { TenrxQuestionnaireAnswerType } from '../includes/TenrxEnums.js';
import TenrxQuestionnaireAnswerOption from './TenrxQuestionnaireAnswerOption.js';

export default interface TenrxQuestionnaireQuestion {
  questionId: number;
  question: string;
  answerType: TenrxQuestionnaireAnswerType;
  answerValue: string;
  possibleAnswers: TenrxQuestionnaireAnswerOption[];
  conditionValue1: string;
  conditionValue2: string;
  conditionValue3: string;
}
