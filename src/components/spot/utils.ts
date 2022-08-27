function Particle(x, y, c, s) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;

  this.s = s;
  this.c = c;

  this.sx = x;
  this.sy = y;

  this.time = Date.now();
}
Particle.prototype = {
  constructor: Particle,
  update: function () {
    this.x += this.vx;
    this.y += this.vy;

    this.vx = (this.sx - this.x) / 10;
    this.vy = (this.sy - this.y) / 10;
  },
  render: function (context) {
    context.beginPath();
    context.fillStyle = this.c;
    context.fillRect(this.x, this.y, this.s, this.s);
    context.closePath();
  },
};

export default Particle;
