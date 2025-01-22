import Player from "./player.js";
import InputHandler from "./input.js";
import Background from "./background.js";
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from "./enemies.js";
import { UI } from "./ui.js";
import { showRankLists, rankListsSort } from "./leaderboard.js";
import config from "../config.js";
window.addEventListener("load", function () {
  // get canvas object
  const canvas = document.getElementById("canvas1");
  // The width is different at large and small resolutions
  const changeWidth = Number(window.getComputedStyle(canvas).width.match(/[0-9]/g).join(""));
  // get canvas 2d context
  const ctx = canvas.getContext("2d");
  // canvas width and height
  canvas.width = changeWidth;
  canvas.height = 700;
  // define Game class
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.groundMargin = 115;
      this.speed = 0;
      this.maxSpeed = config.speed;
      this.background = new Background(this);
      this.player = new Player(this);
      this.inputHandler = new InputHandler(this);
      this.UI = new UI(this);
      this.particles = [];
      this.maxParticles = 50;
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = config.enemyInterval;
      this.collisions = [];
      this.maxLives = config.lives;
      this.floatingMessages = [];
      // debug   show collision Volume
      this.debug = false;
      this.score = 0;
      this.time = 0;
      //composite score
      this.compositeScore = 0;
      //The unit is `ms`
      // this.maxTime = 300000;
      this.fontColor = "black";
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
      this.gameover = false;
      this.gameBegin = false;
      this.beginBtn = document.querySelector(".game_begin");
      this.level2Time = config.level2Time * 1000;
      this.level3Time = config.level3Time * 1000;
      this.level2 = false;
      this.level3 = false;
      this.level2MessageShown = false;
      this.level3MessageShown = false;
    }
    //update
    update(deltaTime) {
      if (!isNaN(deltaTime) && this.gameBegin) this.time += deltaTime;
      if (this.time > this.level2Time && this.time < this.level3Time) {
        this.enemyInterval = config.enemyInterval2;
        this.level2 = true;
      } else if (this.time > this.level3Time) {
        this.enemyInterval = config.enemyInterval3;
        this.level3 = true;
      }
      this.background.update();
      // Argument is a collection of all keys currently pressed (all storage)
      this.player.update(this.inputHandler.keys, deltaTime);
      if (this.enemyTimer > this.enemyInterval) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        if (!isNaN(deltaTime)) this.enemyTimer += deltaTime;
      }
      //handle enemy
      this.enemies.forEach((enemy) => {
        enemy.update(deltaTime);
      });
      //Filter enemies that are marked for deletion
      this.enemies = this.enemies.filter((enemies) => !enemies.markedForDeletion);
      //handle messages
      this.floatingMessages.forEach((message) => {
        message.update();
      });
      this.floatingMessages = this.floatingMessages.filter((message) => !message.markedForDeletion);
      //handle particles
      this.particles.forEach((particle, index) => {
        particle.update();
      });
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }
      this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
      });
      this.collisions = this.collisions.filter((collision) => !collision.markedForDeletion);
    }
    //draw
    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.collisions.forEach((collision) => {
        collision.draw(context);
      });
      this.floatingMessages.forEach((message) => {
        message.draw(context);
      });

      this.UI.draw(context);
    }
    //add Enemy
    addEnemy() {
      if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
      else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
      this.enemies.push(new FlyingEnemy(this));
    }
    //reset
    reset() {
      //score reset
      this.score = 0;
      //time reset
      this.time = 0;
      //lives reset
      this.maxLives = config.lives;
      //clear enemies
      this.enemies = [];
      //reset player position
      this.player.x = 0;
      this.player.y = this.height - this.player.height - this.groundMargin;
      //reset game state
      this.gameBegin = true;
      this.gameover = false;
      //reset particles
      this.particles = [];
      //reset collisions
      this.collisions = [];
      this.enemyInterval = config.enemyInterval;
      this.level2 = false;
      this.level3 = false;
      this.level2MessageShown = false;
      this.level3MessageShown = false;
    }
    //evaluate score and time
    evaluate(
      score,
      time,
      scoreWeight = 0.7,
      timeWeight = 0.3,
      scoreFactor = 2000,
      timeFactor = 1000
    ) {
      //The time and score are nomarlized
      let nomarlizedScore = score / (1 + score / scoreFactor);
      let nomarlizedTime = (time * 0.001).toFixed(1) / (1 + (time * 0.001).toFixed(1) / timeFactor);
      //return composite score
      return (nomarlizedTime * timeWeight + nomarlizedScore * scoreWeight).toFixed(2);
    }
  }
  // create game object
  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  animate();
  showRankLists(rankListsSort());
  // draw animate function canvas
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    if (game.gameBegin && !game.gameover) {
      requestAnimationFrame(animate);
    } else {
      game.draw(ctx);
      game.beginBtn.addEventListener("click", function () {
        if (
          game.beginBtn.innerHTML === "Click Begin Game!" ||
          game.beginBtn.innerHTML === "REGAME!"
        ) {
          beginGame();
          showRankLists(rankListsSort());
        }
      });
    }
  }

  //begin game
  function beginGame() {
    game.beginBtn.innerHTML = "3";
    let i = 2;
    const timer = setInterval(() => {
      if (i == 0) {
        game.beginBtn.innerHTML = "GO!";
        clearInterval(timer);
        game.reset();
        animate();
        game.beginBtn.style.transition = "all 0.2s";
        game.beginBtn.style.top = -500 + "px";
        game.beginBtn.style.opacity = 0;
      } else {
        game.beginBtn.innerHTML = `${i}`;
      }
      i--;
    }, 1000);
  }
});
