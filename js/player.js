import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from "./playerStates.js";
import { CollisionAnimation } from "./collisionAnimation.js";
import { FloatingMessages } from "./floatingMessages.js";
import { store, getRandomName } from "./leaderboard.js";
//定义角色类
export default class Player {
  constructor(game) {
    //指向游戏类
    this.game = game;
    //角色的大小
    this.width = 100;
    this.height = 91.3;
    //坐标
    this.x = 0;
    this.y = this.game.height - this.height - this.game.groundMargin;
    //垂直方向上的速度
    this.vy = 0;
    //重量，通过这个属性模拟重力对对象的影响
    this.weight = 1;
    //角色的图像
    this.image = document.getElementById("player");
    this.imageWidth = 575;
    this.imageHeight = 523;
    //速度
    this.speed = 0;
    this.maxSpeed = 10;

    //精灵图中移动帧
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 5;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    //状态集
    this.states = [
      new Sitting(this.game),
      new Running(this.game),
      new Jumping(this.game),
      new Falling(this.game),
      new Rolling(this.game),
      new Diving(this.game),
      new Hit(this.game)
    ];
    this.currentState = null;
    this.rollingDuration = 0;
    this.isRolling = false;
  }
  update(input, deltaTime) {
    this.checkCollision();
    this.currentState.handlerInput(input);
    //水平移动
    this.x += this.speed;
    if (input.includes("ArrowRight") && this.currentState !== this.states[6])
      this.speed = this.maxSpeed;
    else if (input.includes("ArrowLeft") && this.currentState !== this.states[6])
      this.speed = -this.maxSpeed;
    else this.speed = 0;
    //左右越界判断
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
    if (input.includes("ArrowUp") && this.onGround())
      //垂直移动
      this.vy = -30;
    this.y += this.vy;
    if (!this.onGround()) {
      this.vy += this.weight;
    } else {
      this.vy = 0;
    }
    if (this.y > this.game.height - this.height - this.game.groundMargin)
      this.y = this.game.height - this.height - this.game.groundMargin;

    //精灵图动画
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      if (!isNaN(deltaTime)) {
        this.frameTimer += deltaTime;
      }
    }

    if (this.game.level2 && !this.game.level2MessageShown) {
      this.game.floatingMessages.push(
        new FloatingMessages("level2", this.game.width * 0.5, 80, this.game.width * 0.5, -80)
      );
      this.game.level2 = false;
      this.game.level2MessageShown = true;
    } else if (this.game.level3 && !this.game.level3MessageShown) {
      this.game.floatingMessages.push(
        new FloatingMessages("level3", this.game.width * 0.5, 80, this.game.width * 0.5, -80)
      );
      this.game.level3 = false;
      this.game.level3MessageShown = true;
    }
    //ROLLING only can continue 2s
    if (this.isRolling && this.currentState == this.states[4]) {
      this.rollingDuration += deltaTime;
      if (this.rollingDuration >= 2000) {
        this.setState(6, 0);
        this.isRolling = false;
        this.rollingDuration = 0;
      }
    }
  }
  draw(context) {
    //如果是调试状态，显示碰撞盒子
    if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    context.drawImage(
      this.image,
      this.frameX * this.imageWidth,
      this.frameY * this.imageHeight,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  //辅助方法
  onGround() {
    //如果当前角色的y坐标大于等于整个游戏的画布高度 - 角色的高度，则返回true
    return this.y >= this.game.height - this.height - this.game.groundMargin;
  }
  //设置状态
  setState(state, speed) {
    this.currentState = this.states[state];
    this.game.speed = this.game.maxSpeed * speed;
    this.currentState.enter();
    if (state === 4) {
      this.isRolling = true;
      this.rollingDuration = 0;
    }
  }
  //检查碰撞
  checkCollision() {
    this.game.enemies.forEach((enemy) => {
      if (
        enemy.x < this.x + this.width &&
        enemy.x + enemy.width > this.x &&
        enemy.y < this.y + this.height &&
        this.y < enemy.y + enemy.height
      ) {
        enemy.markedForDeletion = true;
        this.game.collisions.push(
          new CollisionAnimation(
            this.game,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
        if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
          this.game.floatingMessages.push(
            new FloatingMessages("defeat +1", enemy.x, enemy.y, 90, 40)
          );
          this.game.score++;
        } else {
          this.setState(6, 0);
          this.game.maxLives--;
          if (this.game.maxLives <= 0) {
            this.game.compositeScore = this.game.evaluate(
              this.game.score,
              (this.game.time * 0.001).toFixed(1)
            );
            console.log(this.game.compositeScore);
            store(getRandomName(), this.game.compositeScore);
            this.game.gameover = true;
            this.game.gameBegin = false;
          }
        }
      }
    });
  }
}
