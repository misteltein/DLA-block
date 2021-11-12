import P5 from "p5";

const uniformDistBetween = (begin: number, end: number): number => {
  return Math.random() * (end - begin) - begin;
};

const normalDist = (sigma: number): number => {
  let res = 0.0;
  for (let i = 0; i < 12; ++i) {
    res += uniformDistBetween(0.0, 1.0);
  }
  return (res - 6.0) * sigma;
};

// Todo: 中心を (truncMin+truncMax)/2 にするべきでは？
const normalTrunc = (
  sigma: number,
  truncMin: number,
  truncMax: number
): number => {
  const res = Math.abs(normalDist(sigma));
  if (res < truncMin || truncMax < res) {
    return normalTrunc(sigma, truncMin, truncMax);
  }
  return res;
};

export default class Particle {
  static R: number;
  static counter = 0;
  static OX: number;
  static OY: number;

  dX: number;
  dY: number;
  vx: number;
  vy: number;
  r: number;

  ongoing: boolean;

  constructor() {
    const theta = uniformDistBetween(0.0, 2.0 * Math.PI);
    this.dX = Math.sqrt(2.0) * Particle.R * Math.sin(theta);
    this.dY = Math.sqrt(2.0) * Particle.R * Math.cos(theta);
    const norm = Math.sqrt(Math.pow(this.dX, 2) + Math.pow(this.dY, 2));
    this.vx = -this.dX / norm;
    this.vy = -this.dY / norm;
    this.ongoing = true;
    this.r = normalTrunc(15.0, 5.0, 65.0);
    this.collapse(0, []);
    if (!this.ongoing) {
      throw new Error("end");
    }
  }

  getX() {
    return this.dX + Particle.OX;
  }

  getY() {
    return this.dY + Particle.OY;
  }

  collapse(idx: number, particles: Array<Particle>) {
    particles.forEach((particle: Particle, j: number) => {
      if (this.ongoing && idx !== j) {
        if (
          Math.sqrt(
            (particle.dX - this.dX) * (particle.dX - this.dX) +
              (particle.dY - this.dY) * (particle.dY - this.dY)
          ) <=
          particle.r + this.r
        ) {
          this.ongoing = false;
        }
      }
    });
  }

  evolution() {
    if (this.ongoing) {
      this.dX += this.vx;
      this.dY += this.vy;
    }
  }

  draw(p: P5) {
    p.circle(this.dX, this.dY, 2.0 * this.r - 1);
  }
}
