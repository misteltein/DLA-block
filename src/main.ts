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
    this.collapse();
    if (!this.ongoing) {
      ongoing = false;
    }
  }

  getX() {
    return this.dX + Particle.OX;
  }

  getY() {
    return this.dY + Particle.OY;
  }

  collapse(idx: number) {
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
const particles: Array<Particle> = [];
const colors: Array<P5.Color> = [];

class Square {
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

  // Todo: particles に依存しないように修正
  update() {
    if (!this.filled) {
      particles.forEach((particle: Particle) => {
        if (!particle.ongoing) {
          const xCenter = this.x + 0.5 * Square.size;
          const yCenter = this.y + 0.5 * Square.size;
          const xParticle = particle.getX();
          const yParticle = particle.getY();
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
    const RESOLUTION = 40;
    p5.createCanvas(1000, 600);
    Particle.OX = p5.width * 0.5;
    Particle.OY = p5.height * 0.5;
    Particle.R =
      Math.sqrt(Math.pow(p5.width * 0.5, 2) + Math.pow(p5.height * 0.5, 2)) +
      65;
    const origin: Particle = new Particle();
    origin.dX = 0.0;
    origin.dY = 0.0;
    origin.r = 10.0;
    origin.ongoing = false;
    particles.push(origin);
    particles.push(new Particle());

    p5.noStroke();

    Square.size = Math.max(p5.width, p5.height) / RESOLUTION;
    for (let i = 0; i < RESOLUTION; ++i) {
      for (let j = 0; j < RESOLUTION; ++j) {
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
    p5.translate(Particle.OX, Particle.OY);
    p5.stroke(255);
    p5.strokeWeight(1);
    particles.forEach((particle: Particle, i: number) => {
      p5.fill(colors[i % colors.length]);
      particle.draw(p5);
      particle.collapse(i);
      if (ongoing) {
        particle.evolution();
      }
    });
    squares.forEach((square: Square) => {
      square.update();
    });
    p5.pop();
    // 円の描画ここまで

    // 円の追加
    if (!particles[particles.length - 1].ongoing) {
      particles.push(new Particle());
    }
  };
};

/* eslint-disable no-new */
new P5(sketch);
