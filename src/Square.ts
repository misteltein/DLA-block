import P5 from "p5";
import Particle from "./Particle";

export default class Square {
  static size: number;
  // 座標ではなく，グリッド番号にしたらいいことある？ x が角の座標だって分かるかな？
  x: number;
  y: number;
  filled: boolean;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.filled = false;
  }

  update(particle: Particle) {
    if (this.filled || particle.ongoing) return;
    const xCenter = this.x + 0.5 * Square.size;
    const yCenter = this.y + 0.5 * Square.size;
    const xParticle: number = particle.getX();
    const yParticle: number = particle.getY();
    this.filled =
      Math.sqrt(
        Math.pow(xCenter - xParticle, 2) + Math.pow(yCenter - yParticle, 2)
      ) <= particle.r;
  }

  draw(p5: P5) {
    p5.rect(this.x, this.y, Square.size, Square.size);
  }
}
