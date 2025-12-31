import { Challenge } from './Challenge.js';
import { ChallengeUI } from '../ui/ChallengeUI.js';

/**
 * Quiz uitdaging met 5 vragen
 */
export class QuizChallenge extends Challenge {
  /**
   * @param {Phaser.Scene} scene
   * @param {Question[]} questions - Array van 5 Question objecten
   */
  constructor(scene, questions) {
    super(scene, 'quiz');
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.ui = null;
  }

  start() {
    super.start();
    
    // Maak de UI
    this.ui = new ChallengeUI(this.scene, this);
    this.ui.create();
    
    // Toon eerste vraag
    this.showCurrentQuestion();
  }

  showCurrentQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      const question = this.questions[this.currentQuestionIndex];
      this.ui.showQuestion(question, this.currentQuestionIndex + 1, this.questions.length);
    }
  }

  /**
   * Wordt aangeroepen wanneer een antwoord is gegeven
   * @param {any} answer
   */
  submitAnswer(answer) {
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = question.checkAnswer(answer);
    
    if (isCorrect) {
      this.correctAnswers++;
    }

    // Toon feedback
    this.ui.showFeedback(isCorrect, () => {
      this.currentQuestionIndex++;
      
      if (this.currentQuestionIndex >= this.questions.length) {
        // Quiz afgelopen
        this.finishQuiz();
      } else {
        // Volgende vraag
        this.showCurrentQuestion();
      }
    });
  }

  finishQuiz() {
    // Alle vragen moeten goed zijn voor succes
    const passed = this.correctAnswers === this.questions.length;
    
    this.ui.showResults(this.correctAnswers, this.questions.length, passed, () => {
      this.ui.destroy();
      this.ui = null;
      
      if (passed) {
        this.complete();
      } else {
        this.fail();
      }
    });
  }

  onComplete() {
    // Toon succes bericht
    const text = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      '🎉 Uitdaging voltooid!',
      {
        fontSize: '48px',
        fill: '#00ff00',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.scene.time.delayedCall(2000, () => {
      text.destroy();
    });
  }

  onFail() {
    // Reset quiz voor volgende poging
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.questions.forEach(q => {
      q.answered = false;
      q.correct = false;
    });
    
    // Toon fail bericht
    const text = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      '❌ Probeer het nog eens!',
      {
        fontSize: '48px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.scene.time.delayedCall(2000, () => {
      text.destroy();
    });
  }

  destroy() {
    super.destroy();
    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }
  }
}
