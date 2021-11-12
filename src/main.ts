// https://editor.p5js.org/misteltein/sketches/pmp6gJ0cV
import P5 from "p5";
import Circle from "./Circle";
import Square from "./Square";

// setup / draw で繰り返し使用する配列
const colors: Array<P5.Color> = [];
const circles: Array<Circle> = [];
const squares: Array<Square> = [];

// 画面いっぱいに図形が充填されるまで継続するためのフラグ
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
    p5.createCanvas(1000, 600);
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

    // 正方形を敷き詰めるように生成
    const RESOLUTION = 40;
    Square.SIZE = Math.max(p5.width, p5.height) / RESOLUTION;
    for (let i = 0; i < RESOLUTION; ++i) {
      for (let j = 0; j < RESOLUTION; ++j) {
        squares.push(new Square(i * Square.SIZE, j * Square.SIZE));
      }
    }
  };

  p5.draw = () => {
    // 正方形の描画（デフォルトの座標系）
    p5.noStroke();
    squares.forEach((square: Square, idx) => {
      p5.fill(square.filled ? colors[idx % colors.length] : p5.color(220));
      square.draw(p5);
    });

    // 円の描画（カンバスを中心とする座標系）ここから
    p5.push();
    p5.translate(Circle.OX, Circle.OY);
    p5.stroke(255);
    p5.strokeWeight(1);
    circles.forEach((circle: Circle, i: number) => {
      p5.fill(colors[i % colors.length]);
      circle.draw(p5);
      circle.updateState(i, circles);
      if (ongoing) {
        circle.evolution();
      }
    });
    p5.pop();
    // 円の描画ここまで

    // 正方形の色を更新
    squares.forEach((square: Square) => {
      circles.forEach((circle: Circle) => {
        square.updateState(circle);
      });
    });

    // 最後に追加した円が静止したら新しく円を追加
    if (!circles[circles.length - 1].ongoing) {
      try {
        // 追加してすぐに接触していたら例外が発生するので描画を停止させる
        circles.push(new Circle());
      } catch (error) {
        ongoing = false;
      }
    }
  };
};

/* eslint-disable no-new */
new P5(sketch);
