import { Question } from './Question.js';

/**
 * Spelling vraag waar spelers een object moeten benoemen
 */
export class SpellingQuestion extends Question {
  /**
   * @param {object} data - { image: string, answer: string, hint?: string }
   */
  constructor(data) {
    super('spelling', data);
  }

  getPrompt() {
    return this.data.hint || 'Wat zie je op de afbeelding? Typ het woord correct.';
  }

  checkAnswer(answer) {
    this.answered = true;
    
    // Case-insensitive vergelijking, trim whitespace
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = this.data.answer.toLowerCase();
    
    this.correct = normalizedAnswer === correctAnswer;
    return this.correct;
  }

  getInputType() {
    return 'text';
  }

  getPlaceholder() {
    return 'Typ het woord...';
  }

  getRenderData() {
    return {
      type: 'image',
      image: this.data.image
    };
  }
}
