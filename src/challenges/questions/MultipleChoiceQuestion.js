import { Question } from './Question.js';

/**
 * Multiple choice vraag met 4 antwoordopties
 */
export class MultipleChoiceQuestion extends Question {
  /**
   * @param {object} data - { question: string, options: string[], correctIndex: number }
   */
  constructor(data) {
    super('multipleChoice', data);
  }

  getPrompt() {
    return this.data.question;
  }

  checkAnswer(answer) {
    // answer is de index van de gekozen optie
    this.answered = true;
    this.correct = answer === this.data.correctIndex;
    return this.correct;
  }

  getInputType() {
    return 'buttons';
  }

  getOptions() {
    return this.data.options;
  }
}
