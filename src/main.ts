// https://editor.p5js.org/misteltein/sketches/pmp6gJ0cV
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

let ongoing = true;

class Particle {
  static R: number;
  static counter = 0;

  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  id: number;

  ongoing: boolean;

  constructor() {
    const theta = uniformDistBetween(0.0, 2.0 * Math.PI);
    this.x = Math.sqrt(2.0) * Particle.R * Math.sin(theta);
    this.y = Math.sqrt(2.0) * Particle.R * Math.cos(theta);
    const norm = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    this.vx = -this.x / norm;
    this.vy = -this.y / norm;
    this.ongoing = true;
    this.id = Particle.counter++;
    this.r = normalTrunc(15.0, 5.0, 65.0);
    this.collapse();
    if (!this.ongoing) {
      ongoing = false;
    }
  }

  collapse() {
    if (this.ongoing) {
      particles.forEach((particle) => {
        if (particle.id !== this.id) {
          if (
            Math.sqrt(
              (particle.x - this.x) * (particle.x - this.x) +
                (particle.y - this.y) * (particle.y - this.y)
            ) <=
            particle.r + this.r
          ) {
            this.ongoing = false;
          }
        }
      });
    }
  }

  evolution() {
    if (this.ongoing) {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  draw(p: P5) {
    p.circle(this.x, this.y, 2.0 * this.r - 1);
  }
}
const particles: Array<Particle> = [];
const colors: Array<P5.Color> = [];

class Square {
  static size: number;
  x: number;
  y: number;
  filled: boolean;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.filled = false;
  }

  update(p5: P5) {
    if (!this.filled) {
      particles.forEach((particle: Particle) => {
        if (!particle.ongoing) {
          const xCenter = this.x + 0.5 * Square.size;
          const yCenter = this.y + 0.5 * Square.size;
          const xParticle = particle.x + 0.5 * p5.width;
          const yParticle = particle.y + 0.5 * p5.height;
          this.filled =
            Math.sqrt(
              Math.pow(xCenter - xParticle, 2) +
                Math.pow(yCenter - yParticle, 2)
            ) <= particle.r;
        }
      });
    }
  }

  draw(p5: P5) {
    p5.rect(this.x, this.y, Square.size, Square.size);
  }
}

const squares: Array<Square> = [];

const sketch = (p5: P5) => {
  p5.preload = () => {
    // 色のリストを作成
    colors.push(p5.color(101, 81, 147));
    colors.push(p5.color(109, 128, 172));
    colors.push(p5.color(252, 71, 51));
    colors.push(p5.color(131, 153, 97));
    colors.push(p5.color(181, 98, 69));
  };
  p5.setup = () => {
    p5.createCanvas(1000, 600);
    Particle.R =
      Math.sqrt(Math.pow(p5.width * 0.5, 2) + Math.pow(p5.height * 0.5, 2)) +
      65;
    const origin: Particle = new Particle();
    origin.x = 0.0;
    origin.y = 0.0;
    origin.r = 10.0;
    origin.ongoing = false;
    particles.push(origin);
    particles.push(new Particle());
    p5.noStroke();
    const resolution = 40;
    const size = Math.max(p5.width, p5.height) / resolution;
    Square.size = size;
    for (let i = 0; i < resolution; ++i) {
      for (let j = 0; j < resolution; ++j) {
        squares.push(new Square(i * Square.size, j * Square.size));
      }
    }
  };

  p5.draw = () => {
    p5.background(0);
    p5.noStroke();
    squares.forEach((square: Square, idx) => {
      if (square.filled) {
        p5.fill(colors[idx % colors.length]);
      } else {
        p5.fill(220);
      }
      square.draw(p5);
    });

    // 円の描画ここから
    p5.push();
    p5.translate(0.5 * p5.width, 0.5 * p5.height);
    p5.stroke(255);
    p5.strokeWeight(1);
    particles.forEach((particle: Particle) => {
      p5.fill(colors[particle.id % colors.length]);
      particle.draw(p5);
      particle.collapse();
      if (ongoing) {
        particle.evolution();
      }
    });
    squares.forEach((square: Square) => {
      square.update(p5);
    });
    p5.pop();

    // 円の描画ここまで
    if (!particles[particles.length - 1].ongoing) {
      particles.push(new Particle());
    }
  };
};

/* eslint-disable no-new */
new P5(sketch);
