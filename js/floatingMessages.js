export class FloatingMessages {
  constructor(value, x, y, targetX, targetY) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.markedForDeletion = false;
    this.timer = 0;
    this.delayMove = this.value === "level2" || this.value === "level3";
    this.delayTimer = 0;
  }
  update() {
    if (!this.delayMove || this.delayTimer > 100) {
      this.x += (this.targetX - this.x) * 0.03;
      this.y += (this.targetY - this.y) * 0.03;
    } else {
      this.delayTimer += 0.01;
    }
    this.timer++;
    if (this.timer > 100) this.markedForDeletion = true;
  }
  draw(context) {
    if (this.delayMove) {
      context.font = "60px Creepster";
    } else {
      context.font = "20px Creepster";
    }
    context.fillStyle = "white";
    context.fillText(this.value, this.x, this.y);
    //Stagger 2px, create the effect of shadow
    context.fillStyle = "black";
    context.fillText(this.value, this.x - 2, this.y - 2);
  }
}
