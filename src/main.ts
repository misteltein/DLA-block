// https://editor.p5js.org/misteltein/sketches/pmp6gJ0cV
import P5 from "p5";
import Particle from "./Particle";
import Square from "./Square";

const particles: Array<Particle> = [];
const colors: Array<P5.Color> = [];
const squares: Array<Square> = [];
let ongoing = true;

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
      p5.fill(square.filled ? colors[idx % colors.length] : p5.color(220));
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
      particle.collapse(i, particles);
      if (ongoing) {
        particle.evolution();
      }
    });
    squares.forEach((square: Square) => {
      particles.forEach((particle: Particle) => {
        square.update(particle);
      });
    });
    p5.pop();
    // 円の描画ここまで

    // 円の追加
    if (!particles[particles.length - 1].ongoing) {
      try {
        particles.push(new Particle());
      } catch (error) {
        ongoing = false;
      }
    }
  };
};

/* eslint-disable no-new */
new P5(sketch);
