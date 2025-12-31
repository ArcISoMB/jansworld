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
    this.incorrectQuestions = [];  // Vragen die fout beantwoord zijn
    this.isRetryRound = false;     // Of we in de retry ronde zitten
    this.ui = null;
  }

  start() {
    super.start();
    
    // Reset state
    this.currentQuestionIndex = 0;
    this.incorrectQuestions = [];
    this.isRetryRound = false;
    this.questions.forEach(q => {
      q.answered = false;
      q.correct = false;
    });
    
    // Maak de UI
    this.ui = new ChallengeUI(this.scene, this);
    this.ui.create();
    
    // Toon eerste vraag
    this.showCurrentQuestion();
  }

  /**
   * Sluit de quiz zonder te voltooien (gebruiker annuleert)
   */
  cancel() {
    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }
    this.fail();
  }

  showCurrentQuestion() {
    const questionsToShow = this.isRetryRound ? this.incorrectQuestions : this.questions;
    
    if (this.currentQuestionIndex < questionsToShow.length) {
      const question = questionsToShow[this.currentQuestionIndex];
      const displayNum = this.currentQuestionIndex + 1;
      const totalDisplay = questionsToShow.length;
      
      // Toon retry indicator als we in retry modus zijn
      const prefix = this.isRetryRound ? 'Herkansing: ' : '';
      this.ui.showQuestion(question, displayNum, totalDisplay, prefix);
    }
  }

  /**
   * Wordt aangeroepen wanneer een antwoord is gegeven
   * @param {any} answer
   */
  submitAnswer(answer) {
    const questionsToShow = this.isRetryRound ? this.incorrectQuestions : this.questions;
    const question = questionsToShow[this.currentQuestionIndex];
    const isCorrect = question.checkAnswer(answer);
    
    if (!isCorrect && !this.isRetryRound) {
      // Eerste ronde: sla foute vragen op voor retry
      this.incorrectQuestions.push(question);
    }

    // Toon feedback
    this.ui.showFeedback(isCorrect, () => {
      this.currentQuestionIndex++;
      
      if (this.currentQuestionIndex >= questionsToShow.length) {
        // Ronde afgelopen
        this.finishRound();
      } else {
        // Volgende vraag
        this.showCurrentQuestion();
      }
    });
  }

  finishRound() {
    if (this.isRetryRound) {
      // Retry ronde is klaar, check of alle vragen nu goed zijn
      const allCorrectNow = this.incorrectQuestions.every(q => q.correct);
      
      if (allCorrectNow) {
        this.showFinalResults(true);
      } else {
        // Nog steeds foute antwoorden, filter voor volgende retry
        this.incorrectQuestions = this.incorrectQuestions.filter(q => !q.correct);
        this.currentQuestionIndex = 0;
        
        // Toon tussenresultaat en start nieuwe retry
        this.ui.showRetryMessage(this.incorrectQuestions.length, () => {
          this.showCurrentQuestion();
        });
      }
    } else {
      // Eerste ronde klaar
      if (this.incorrectQuestions.length === 0) {
        // Alles goed in eerste poging!
        this.showFinalResults(true);
      } else {
        // Er zijn foute antwoorden, start retry ronde
        this.isRetryRound = true;
        this.currentQuestionIndex = 0;
        
        // Reset de foute vragen voor retry
        this.incorrectQuestions.forEach(q => {
          q.answered = false;
          q.correct = false;
        });
        
        this.ui.showRetryMessage(this.incorrectQuestions.length, () => {
          this.showCurrentQuestion();
        });
      }
    }
  }

  showFinalResults(passed) {
    const totalQuestions = this.questions.length;
    const correctFirst = totalQuestions - this.incorrectQuestions.length;
    
    this.ui.showResults(totalQuestions, totalQuestions, passed, () => {
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
    // Toon fail bericht
    const text = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      '❌ Gestopt met uitdaging',
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
