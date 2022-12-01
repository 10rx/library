import { QuestionEnd } from '../../index.js';

export interface Question {
  id: number;
  questionnaireID: number;
  type: number;
  position: number;
  english: string;
  spanish: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  english: string;
  spanish: string;
  nextQuestion: number | null;
  endQuestionnaire: QuestionEnd;
  position: number;
}
