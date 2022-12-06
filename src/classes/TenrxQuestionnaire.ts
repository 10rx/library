import { Answer, Question, QuestionEnd, QuestionType, TenrxAPIModel, useTenrxApi } from '../index.js';

export default class TenrxQuestionnaire {
  public readonly questionnaireID: number | null;
  public readonly visitType: number | null;
  public readonly language: 'en' | 'es';
  public questions: Question[] = [];
  public answers: Answer[] = [];
  public index = -1;
  private sideQuestions = new Set<number>();

  constructor({
    questionnaireID,
    visitType,
    language,
  }: {
    questionnaireID?: number;
    visitType?: number;
    language: 'en' | 'es';
  }) {
    if (!questionnaireID && !visitType) throw new Error('No questionnaire ID or visit type provided');
    this.questionnaireID = questionnaireID || null;
    this.visitType = visitType || null;
    this.language = language || 'en';
  }

  private get filteredQuestions() {
    return this.questions.filter((q) => !this.sideQuestions.has(q.id));
  }

  public async load(engine = useTenrxApi()) {
    if (!this.questionnaireID && !this.visitType) throw new Error('No questionnaire ID or visit type set');
    const response = await engine.getQuestionnaire(
      (this.questionnaireID || this.visitType) as number,
      !!this.visitType,
    );

    const content = response.content as TenrxAPIModel<Question[]>;
    if (content.apiStatus.statusCode !== 200)
      throw new Error(`Server returned ${content.apiStatus.statusCode} ${content.apiStatus.message}`);

    this.questions = content.data;

    for (const question of content.data) {
      for (const option of question.options) {
        if (option.nextQuestion) this.sideQuestions.add(option.nextQuestion);
      }
    }
  }

  public saveAnswer({ questionID, options, answer }: { questionID: number; options?: number[]; answer?: string }): {
    next: number | null;
    end: QuestionEnd;
  } {
    if ((!options || !options.length) && !answer) throw new Error('No options or answer provided');

    const question = this.questions.find((q) => q.id === questionID);
    if (!question) throw new Error('Answer to unknown question');

    let next: number | null = null;
    let end: QuestionEnd = QuestionEnd.No;

    const existingAnswer = this.answers.find((a) => a.questionID === question.id);

    if (question.type === QuestionType.Text && answer) {
      if (existingAnswer) {
        existingAnswer.answer = answer;
      } else this.answers.push({ questionID: question.id, questionnaireID: question.questionnaireID, answer });
    } else if (question.type === QuestionType.Choice && options?.length) {
      const selectedOption = question.options.find((o) => o.id === options[0]);
      if (!selectedOption) throw new Error('Option not found');

      const str = this.language === 'es' ? selectedOption.spanish : selectedOption.english;

      if (existingAnswer) {
        existingAnswer.answer = str;
      } else
        this.answers.push({
          questionID: question.id,
          questionnaireID: question.questionnaireID,
          answer: str,
        });

      next = selectedOption.nextQuestion;
      end = selectedOption.endQuestionnaire;
    } else if (question.type === QuestionType.Multiple && options?.length) {
      const selectedOptions = question.options.filter((o) => options.includes(o.id));
      if (!selectedOptions.length) throw new Error('Options not found');

      const str =
        this.language === 'es'
          ? selectedOptions.map((o) => o.spanish).join('|')
          : selectedOptions.map((o) => o.english).join('|');

      if (existingAnswer) {
        existingAnswer.answer = str;
      } else
        this.answers.push({
          questionID: question.id,
          questionnaireID: question.questionnaireID,
          answer: str,
        });
    } else throw new Error('Answer does not fit the question');

    // ? No more questions
    if (!next && !end && this.index + 1 === this.filteredQuestions.length) {
      end = QuestionEnd.Success;
    }

    return { next, end };
  }

  public nextQuestion(id?: number): Question | null {
    let question: Question | undefined;

    // ? Get specific question. Fallback to next question
    if (id) {
      question = this.questions.find((q) => q.id === id);
      if (question) return question;
    }

    const questions = this.filteredQuestions;

    this.index++;

    // ? No more questions left
    if (this.index === questions.length) return null;

    question = questions[this.index];

    // ? This should never happen
    if (!question) throw new Error('Unable to get next question');
    return question;
  }

  public get totalQuestions() {
    return this.filteredQuestions.length;
  }
}
