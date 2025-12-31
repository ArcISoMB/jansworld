/**
 * UI voor quiz uitdagingen
 */
export class ChallengeUI {
  constructor(scene, challenge) {
    this.scene = scene;
    this.challenge = challenge;
    this.elements = [];
    this.inputElement = null;
  }

  create() {
    // Donkere overlay
    this.overlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.8
    ).setScrollFactor(0).setDepth(500);
    this.elements.push(this.overlay);

    // Quiz container achtergrond
    this.container = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      800,
      500,
      0x333366,
      1
    ).setScrollFactor(0).setDepth(501);
    this.elements.push(this.container);

    // Rand
    this.border = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      804,
      504,
      0x6666ff,
      1
    ).setScrollFactor(0).setDepth(500);
    this.elements.push(this.border);
  }

  showQuestion(question, questionNum, totalQuestions) {
    // Verwijder vorige vraag elementen
    this.clearQuestionElements();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Vraagnummer
    const progressText = this.scene.add.text(
      centerX,
      centerY - 200,
      `Vraag ${questionNum} van ${totalQuestions}`,
      {
        fontSize: '24px',
        fill: '#aaaaff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(progressText);

    // Render extra data (klok of afbeelding)
    const renderData = question.getRenderData();
    if (renderData) {
      if (renderData.type === 'clock') {
        this.renderClock(centerX, centerY - 80, renderData.hours, renderData.minutes);
      } else if (renderData.type === 'image') {
        this.renderImage(centerX, centerY - 80, renderData.image);
      }
    }

    // Vraag tekst
    const promptY = renderData ? centerY + 20 : centerY - 100;
    const promptText = this.scene.add.text(
      centerX,
      promptY,
      question.getPrompt(),
      {
        fontSize: '28px',
        fill: '#ffffff',
        wordWrap: { width: 700 },
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(promptText);

    // Input type
    const inputType = question.getInputType();
    
    if (inputType === 'buttons') {
      this.renderButtons(question.getOptions(), centerX, centerY + 80);
    } else {
      this.renderTextInput(centerX, centerY + 100, question.getPlaceholder ? question.getPlaceholder() : '');
    }
  }

  renderButtons(options, centerX, startY) {
    const buttonWidth = 340;
    const buttonHeight = 50;
    const gap = 15;

    options.forEach((option, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = centerX + (col === 0 ? -buttonWidth/2 - gap/2 : buttonWidth/2 + gap/2);
      const y = startY + row * (buttonHeight + gap);

      // Button achtergrond
      const button = this.scene.add.rectangle(
        x, y, buttonWidth, buttonHeight, 0x4444aa, 1
      ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });
      
      button.on('pointerover', () => button.setFillStyle(0x5555cc));
      button.on('pointerout', () => button.setFillStyle(0x4444aa));
      button.on('pointerdown', () => {
        this.challenge.submitAnswer(index);
      });
      
      this.elements.push(button);

      // Button tekst
      const buttonText = this.scene.add.text(x, y, option, {
        fontSize: '20px',
        fill: '#ffffff',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
      this.elements.push(buttonText);
    });
  }

  renderTextInput(centerX, centerY, placeholder) {
    // Maak HTML input element voor tekst invoer
    const inputWidth = 300;
    const inputHeight = 40;
    
    // Bereken screen positie
    const canvas = this.scene.game.canvas;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / this.scene.cameras.main.width;
    const scaleY = canvasRect.height / this.scene.cameras.main.height;
    
    const screenX = canvasRect.left + centerX * scaleX;
    const screenY = canvasRect.top + centerY * scaleY;

    // Maak input element
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = placeholder;
    this.inputElement.style.cssText = `
      position: absolute;
      left: ${screenX - (inputWidth * scaleX) / 2}px;
      top: ${screenY - (inputHeight * scaleY) / 2}px;
      width: ${inputWidth * scaleX}px;
      height: ${inputHeight * scaleY}px;
      font-size: ${20 * scaleY}px;
      padding: 5px 10px;
      border: 2px solid #6666ff;
      border-radius: 5px;
      background: #222244;
      color: #ffffff;
      text-align: center;
      z-index: 1000;
    `;
    document.body.appendChild(this.inputElement);
    this.inputElement.focus();

    // Submit knop (verder naar beneden om overlap te voorkomen)
    const submitButton = this.scene.add.rectangle(
      centerX,
      centerY + 120,
      150,
      45,
      0x44aa44,
      1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    submitButton.on('pointerover', () => submitButton.setFillStyle(0x55cc55));
    submitButton.on('pointerout', () => submitButton.setFillStyle(0x44aa44));
    submitButton.on('pointerdown', () => {
      if (this.inputElement) {
        this.challenge.submitAnswer(this.inputElement.value);
      }
    });
    this.elements.push(submitButton);

    const submitText = this.scene.add.text(centerX, centerY + 120, 'Bevestig', {
      fontSize: '22px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(submitText);

    // Enter toets support
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.challenge.submitAnswer(this.inputElement.value);
      }
    });
  }

  renderClock(centerX, centerY, hours, minutes) {
    const radius = 70;
    
    // Klok achtergrond
    const clockBg = this.scene.add.circle(centerX, centerY, radius, 0xffffff, 1)
      .setScrollFactor(0).setDepth(502);
    this.elements.push(clockBg);

    // Klok rand
    const clockBorder = this.scene.add.circle(centerX, centerY, radius + 3, 0x333333, 1)
      .setScrollFactor(0).setDepth(501);
    this.elements.push(clockBorder);

    // Uur markeringen
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const innerR = i % 3 === 0 ? radius - 15 : radius - 10;
      const outerR = radius - 5;
      
      const line = this.scene.add.line(
        centerX, centerY,
        Math.cos(angle) * innerR,
        Math.sin(angle) * innerR,
        Math.cos(angle) * outerR,
        Math.sin(angle) * outerR,
        0x333333
      ).setLineWidth(i % 3 === 0 ? 3 : 1).setScrollFactor(0).setDepth(503);
      this.elements.push(line);
    }

    // Urenwijzer
    const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
    const hourHand = this.scene.add.line(
      centerX, centerY,
      0, 0,
      Math.cos(hourAngle) * (radius * 0.5),
      Math.sin(hourAngle) * (radius * 0.5),
      0x333333
    ).setLineWidth(4).setScrollFactor(0).setDepth(504);
    this.elements.push(hourHand);

    // Minutenwijzer
    const minuteAngle = (minutes * 6 - 90) * Math.PI / 180;
    const minuteHand = this.scene.add.line(
      centerX, centerY,
      0, 0,
      Math.cos(minuteAngle) * (radius * 0.75),
      Math.sin(minuteAngle) * (radius * 0.75),
      0x333333
    ).setLineWidth(2).setScrollFactor(0).setDepth(504);
    this.elements.push(minuteHand);

    // Centrum punt
    const centerDot = this.scene.add.circle(centerX, centerY, 5, 0x333333, 1)
      .setScrollFactor(0).setDepth(505);
    this.elements.push(centerDot);
  }

  renderImage(centerX, centerY, imageKey) {
    // Placeholder voor afbeelding - gebruik een tekst als de afbeelding niet bestaat
    if (this.scene.textures.exists(imageKey)) {
      const image = this.scene.add.image(centerX, centerY, imageKey)
        .setScrollFactor(0).setDepth(502);
      // Schaal naar max 150x150
      const maxSize = 150;
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      image.setScale(scale);
      this.elements.push(image);
    } else {
      // Fallback: toon placeholder
      const placeholder = this.scene.add.rectangle(centerX, centerY, 150, 150, 0x666666, 1)
        .setScrollFactor(0).setDepth(502);
      this.elements.push(placeholder);
      
      const placeholderText = this.scene.add.text(centerX, centerY, '🖼️', {
        fontSize: '64px'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
      this.elements.push(placeholderText);
    }
  }

  showFeedback(isCorrect, callback) {
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Verwijder input element
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }

    // Feedback overlay
    const feedbackBg = this.scene.add.rectangle(
      centerX, centerY, 300, 100,
      isCorrect ? 0x226622 : 0x662222, 1
    ).setScrollFactor(0).setDepth(510);
    this.elements.push(feedbackBg);

    const feedbackText = this.scene.add.text(
      centerX, centerY,
      isCorrect ? '✓ Goed!' : '✗ Fout!',
      {
        fontSize: '36px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(511);
    this.elements.push(feedbackText);

    // Na korte delay, ga verder
    this.scene.time.delayedCall(1000, () => {
      feedbackBg.destroy();
      feedbackText.destroy();
      callback();
    });
  }

  showResults(correct, total, passed, callback) {
    this.clearQuestionElements();

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Resultaat tekst
    const resultTitle = this.scene.add.text(
      centerX, centerY - 80,
      passed ? '🎉 Gefeliciteerd!' : '😢 Helaas...',
      {
        fontSize: '42px',
        fill: passed ? '#44ff44' : '#ff4444'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(resultTitle);

    const scoreText = this.scene.add.text(
      centerX, centerY,
      `Je had ${correct} van de ${total} vragen goed.`,
      {
        fontSize: '28px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(scoreText);

    const statusText = this.scene.add.text(
      centerX, centerY + 50,
      passed ? 'Je hebt de uitdaging gehaald!' : 'Probeer het later nog eens.',
      {
        fontSize: '24px',
        fill: '#aaaaaa'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(502);
    this.elements.push(statusText);

    // Sluit knop
    const closeButton = this.scene.add.rectangle(
      centerX, centerY + 130, 150, 50, 0x4444aa, 1
    ).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    closeButton.on('pointerover', () => closeButton.setFillStyle(0x5555cc));
    closeButton.on('pointerout', () => closeButton.setFillStyle(0x4444aa));
    closeButton.on('pointerdown', callback);
    this.elements.push(closeButton);

    const closeText = this.scene.add.text(centerX, centerY + 130, 'Sluiten', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
    this.elements.push(closeText);
  }

  clearQuestionElements() {
    // Verwijder alles behalve overlay en container
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
    
    // Bewaar alleen de eerste 3 elementen (overlay, border, container)
    while (this.elements.length > 3) {
      const element = this.elements.pop();
      if (element && element.destroy) {
        element.destroy();
      }
    }
  }

  destroy() {
    if (this.inputElement) {
      this.inputElement.remove();
      this.inputElement = null;
    }
    
    this.elements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.elements = [];
  }
}
