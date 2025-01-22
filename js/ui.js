export class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 30;
    this.fontFamily = "Creepster";
    this.livesImage = document.getElementById("lives");
    this.buttonState = "normal";
  }
  draw(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "white";
    context.shadowBlur = 0;
    context.font = this.fontSize + "px " + this.fontFamily;
    context.textAlign = "left";
    context.fillStyle = this.game.fontColor;
    //score
    context.fillText("score: " + this.game.score, 20, 50);
    //timer
    context.font = this.fontSize * 0.8 + "px " + this.fontFamily;
    context.fillText("Time: " + (this.game.time * 0.001).toFixed(1), 20, 80);
    //lives
    for (let i = 0; i < this.game.maxLives; i++) {
      let row = Math.floor(i / 20);
      let col = i % 20;

      context.drawImage(this.livesImage, 20 + col * 30, 95 + row * 30, 25, 25);
    }
    //game over msg
    if (this.game.gameover == true) {
      // draw mask
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, this.game.width, this.game.height);
      //set title
      context.textAlign = "center";
      //set large font
      context.font = this.fontSize * 2 + "px " + this.fontFamily;

      context.fillStyle = "rgba(0,0,0,1)";
      context.fillText("The Records!", this.game.width * 0.5, this.game.height * 0.5 - 120);
      //set small font
      context.font = this.fontSize * 0.7 + "px " + this.fontFamily;
      context.fillText(
        `score: ${this.game.score}`,
        this.game.width * 0.5,
        this.game.height * 0.5 - 90
      );
      context.fillText(
        `time: ${(this.game.time * 0.001).toFixed(1)}`,
        this.game.width * 0.5,
        this.game.height * 0.5 - 60
      );
      context.font = this.fontSize * 0.9 + "px " + this.fontFamily;
      context.fillText(
        `Overall score: ${this.game.compositeScore}`,
        this.game.width * 0.5,
        this.game.height * 0.5 - 30
      );
      this.game.beginBtn.style.transition = "none";
      this.game.beginBtn.style.top = 50 + "%";
      this.game.beginBtn.style.opacity = 1;
      this.game.beginBtn.innerHTML = "REGAME!";
    }

    //game begin msg
    if (this.game.gameBegin === false && this.game.gameover !== true) {
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, this.game.width, this.game.height);
    }
    context.restore();
  }
}
