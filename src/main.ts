// https://editor.p5js.org/misteltein/sketches/pmp6gJ0cV
import P5 from "p5";
import Circle from "./Circle";

class Link {
  termA: number;
  termB: number;
  highlight: boolean;

  constructor(termA: number, termB: number, highlight = false) {
    this.termA = Math.min(termA, termB);
    this.termB = Math.max(termA, termB);
    this.highlight = highlight;
  }
}

// setup / draw で繰り返し使用する配列
const colors: Array<P5.Color> = [];
const circles: Array<Circle> = [];
let fronts: Array<number> = [];
const links: Array<Link> = [];

// 画面いっぱいに図形が充填されるまで継続するためのフラグ
let growth = true;
let radiusKillLine: number;

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
    p5.frameRate(30);
    // Circle の座標系の原点をカンバスの中心に
    Circle.OX = p5.width * 0.5;
    Circle.OY = p5.height * 0.5;
    // Circle を生成するリングの半径
    Circle.R =
      Math.sqrt(Math.pow(p5.width * 0.5, 2) + Math.pow(p5.height * 0.5, 2)) +
      65;
    // カンバス中心に，止まった円を生成
    const origin: Circle = new Circle();
    origin.x = 0.0;
    origin.y = 0.0;
    origin.r = 10.0;
    origin.ongoing = false;
    circles.push(origin);
    // １つめの動く円を生成
    circles.push(new Circle());
    growth = true;
    radiusKillLine = Math.min(p5.width, p5.height) * 0.5;
  };

  let step = 0;
  let beatStep = 0;
  p5.draw = () => {
    step++;
    p5.background(0);

    // 円の描画（カンバスを中心とする座標系）ここから
    p5.push();
    p5.translate(Circle.OX, Circle.OY);
    p5.stroke(255);
    p5.strokeWeight(1);
    circles.forEach((circle: Circle, i: number) => {
      p5.fill(colors[i % colors.length]);
      circle.draw(p5);
      const neighbors = circle.computeNeighbors(circles);
      neighbors.forEach((j) => {
        const hit: Link | undefined = links.find((link: Link) => {
          return (
            link.termA === Math.min(circle.index, j) &&
            link.termB === Math.max(circle.index, j)
          );
        });
        if (!hit) {
          links.push(new Link(circle.index, j));
        }
      });
      if (neighbors.length === 0) {
        circle.evolution();
      } else {
        circle.ongoing = false;
      }
    });

    if (beatStep % 5 === 0) {
      const newFronts: Array<number> = [];
      links.forEach((link) => {
        if (fronts.includes(link.termA)) {
          newFronts.push(link.termB);
        }
      });
      fronts = newFronts;
    }

    if (beatStep % Math.floor(2.25 * 30) === 0) {
      fronts.push(0);
    }

    links.forEach((link: Link) => {
      if (fronts.includes(link.termA)) {
        link.highlight = true;
      } else {
        link.highlight = false;
      }
      p5.push();
      p5.stroke(255);
      p5.strokeWeight(link.highlight ? 6 : 4);
      p5.line(
        circles[link.termA].x,
        circles[link.termA].y,
        circles[link.termB].x,
        circles[link.termB].y
      );
      p5.pop();
    });
    p5.pop();
    // 円の描画ここまで

    let intersectX0 = false;
    let intersectY0 = false;
    let intersectXW = false;
    let intersectYH = false;
    circles.forEach((circle) => {
      if (!circle.ongoing) {
        intersectX0 = intersectX0 || Math.abs(circle.getX()) < circle.r;
        intersectY0 = intersectY0 || Math.abs(circle.getY()) < circle.r;
        intersectXW =
          intersectXW || Math.abs(circle.getX() - p5.width) < circle.r;
        intersectYH =
          intersectYH || Math.abs(circle.getY() - p5.height) < circle.r;
      }
    });

    if(intersectX0 && intersectY0 && intersectXW && intersectYH){
      growth=false;
    }
    console.log(growth)

    // 新しく円を追加
    // if (growth && step % 60 === 0) {
    if (growth && step % 30 === 0) {
      circles.push(new Circle());
    }

    if (links.length !== 0) {
      beatStep++;
    }
  };
};

/* eslint-disable no-new */
new P5(sketch);
