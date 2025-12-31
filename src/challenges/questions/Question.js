/**
 * Abstracte base class voor alle vraag types
 */
export class Question {
  constructor(type, data) {
    this.type = type;  // 'multipleChoice', 'calculation', 'clock', 'spelling'
    this.data = data;
    this.answered = false;
    this.correct = false;
  }

  /**
   * Geeft de vraag tekst terug
   * @returns {string}
   */
  getPrompt() {
    throw new Error('getPrompt() moet worden geïmplementeerd in subclass');
  }

  /**
   * Controleert of het antwoord correct is
   * @param {any} answer - Het gegeven antwoord
   * @returns {boolean}
   */
  checkAnswer(answer) {
    throw new Error('checkAnswer() moet worden geïmplementeerd in subclass');
  }

  /**
   * Geeft het type input terug dat nodig is
   * @returns {string} 'buttons' | 'text'
   */
  getInputType() {
    throw new Error('getInputType() moet worden geïmplementeerd in subclass');
  }

  /**
   * Geeft opties terug voor multiple choice vragen
   * @returns {string[]|null}
   */
  getOptions() {
    return null;
  }

  /**
   * Geeft extra render data terug (bijv. afbeelding voor spelling, klok voor clock)
   * @returns {object|null}
   */
  getRenderData() {
    return null;
  }
}
