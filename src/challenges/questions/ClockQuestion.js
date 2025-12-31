import { Question } from './Question.js';

/**
 * Klok vraag waar spelers een analoge klok moeten aflezen
 */
export class ClockQuestion extends Question {
  /**
   * @param {object} data - { hours: number, minutes: number }
   */
  constructor(data) {
    super('clock', data);
  }

  getPrompt() {
    return 'Hoe laat is het? Geef je antwoord in UU:MM formaat (bijv. 14:30)';
  }

  checkAnswer(answer) {
    this.answered = true;
    
    // Verwacht formaat: HH:MM
    const match = answer.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      this.correct = false;
      return false;
    }

    const givenHours = parseInt(match[1], 10);
    const givenMinutes = parseInt(match[2], 10);

    // Accepteer zowel 12-uurs als 24-uurs notatie
    const correctHours = this.data.hours;
    const correctMinutes = this.data.minutes;

    // Check of uren kloppen (accepteer 12-uurs equivalent)
    const hoursMatch = givenHours === correctHours || 
                       givenHours === (correctHours % 12) ||
                       (givenHours === 12 && correctHours === 0) ||
                       (givenHours === 0 && correctHours === 12);
    
    this.correct = hoursMatch && givenMinutes === correctMinutes;
    return this.correct;
  }

  getInputType() {
    return 'text';
  }

  getPlaceholder() {
    return 'UU:MM';
  }

  getRenderData() {
    return {
      type: 'clock',
      hours: this.data.hours,
      minutes: this.data.minutes
    };
  }
}
