import { Question } from './Question.js';

/**
 * Rekenvraag met een integer antwoord
 */
export class CalculationQuestion extends Question {
  /**
   * @param {object} data - { question: string, answer: number }
   */
  constructor(data) {
    super('calculation', data);
  }

  getPrompt() {
    return this.data.question;
  }

  checkAnswer(answer) {
    this.answered = true;
    // Parse het antwoord als integer en vergelijk
    const parsedAnswer = parseInt(answer, 10);
    this.correct = !isNaN(parsedAnswer) && parsedAnswer === this.data.answer;
    return this.correct;
  }

  getInputType() {
    return 'text';
  }

  /**
   * Hint voor het invoerveld
   */
  getPlaceholder() {
    return 'Typ je antwoord (getal)...';
  }
}
