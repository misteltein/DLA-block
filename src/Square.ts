import P5 from "p5";
import Particle from "./Particle";

export default class Square {
  static size: number;

  xCenter: number;
  yCenter: number;
  filled: boolean;

  constructor(x: number, y: number) {
    this.xCenter = x+ 0.5 * Square.size;
    this.yCenter = y+ 0.5 * Square.size;
    this.filled = false;
  }

  update(particle: Particle) {
    if (this.filled || particle.ongoing) return;
    const xParticle: number = particle.getX();
    const yParticle: number = particle.getY();
    this.filled =
      Math.sqrt(
        Math.pow(this.xCenter - xParticle, 2) + Math.pow(this.yCenter - yParticle, 2)
      ) <= particle.r;
  }

  draw(p5: P5) {
    p5.rectMode(p5.CENTER)
    p5.rect(this.xCenter, this.yCenter, Square.size, Square.size);
  }
}
