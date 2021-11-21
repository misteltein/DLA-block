import MersenneTwister = require("mersenne-twister");
import P5 from "p5";
const mt = new MersenneTwister(Math.floor(Math.random() * 297562793562));

/**
 * 一様乱数
 * @param {number} truncMin - 区間始め
 * @param {number} truncMin - 区間終わり
 */
const uniformDistBetween = (truncMin: number, truncMax: number): number => {
  return mt.random() * (truncMax - truncMin) + truncMin;
};

/**
 * 正規乱数
 * @param {number} sigma - 分散
 */
const normalDist = (sigma: number): number => {
  let res = 0.0;
  for (let i = 0; i < 12; ++i) {
    res += uniformDistBetween(0.0, 1.0);
  }
  return (res - 6.0) * sigma;
};

/**
 * 切断正規分布
 * @param sigma - 分散
 * @param mu - 平均
 * @param truncMin - 区間始め
 * @param truncMax - 区間終わり
 */
const normalTrunc = (
  sigma: number,
  mu: number,
  truncMin: number,
  truncMax: number
): number => {
  const res = normalDist(sigma) + mu;
  if (res < truncMin || truncMax < res) {
    return normalTrunc(sigma, mu, truncMin, truncMax);
  }
  return res;
};

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * 円を書くためのクラス
 */
export default class Circle {
  static counter = 0;

  // 生成するリングの半径
  static R: number;

  // デフォルトの座標系での円を表すための座標系の原点
  static OX: number;
  static OY: number;

  // この座標系での円の座標
  x: number;
  y: number;
  // 移動速度
  vx: number;
  vy: number;
  // 半径
  r: number;
  // 動いているか
  ongoing: boolean;

  index: number;

  /**
   * 円を生成する
   */
  constructor() {
    this.index = Circle.counter++;

    const theta = uniformDistBetween(0.0, 2.0 * Math.PI);
    this.x = Circle.R * Math.sin(theta);
    this.y = Circle.R * Math.cos(theta);
    const norm = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    this.vx = -this.x / norm;
    this.vy = -this.y / norm;
    this.ongoing = true;
    this.r = normalTrunc(5.0, 15.0, 5.0, 30.0);
    this.updateState(0, []);
  }

  /**
   * デフォルトの座標系での x 座標
   * @return {number} x 座標
   */
  getX(): number {
    return this.x + Circle.OX;
  }

  /**
   * デフォルトの座標系での y 座標
   * @return {number} y 座標
   */
  getY(): number {
    return this.y + Circle.OY;
  }

  /**
   * 他の静止している円と接触したら静止させるためのサブルーチン
   * @param {number} idx - circles における，この円のインデックス
   * @param {Array<Circle>} circles - すべての円を含む配列
   */
  updateState(idx: number, circles: Array<Circle>) {
    circles.forEach((particle: Circle, j: number) => {
      if (this.ongoing && idx !== j) {
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

  computeNeighbors(circles: Array<Circle>) {
    const res: Array<number> = [];
    circles.forEach((circle) => {
      if (this.index !== circle.index && !circle.ongoing) {
        const d = distance(this.x, this.y, circle.x, circle.y);
        if (d < this.r + circle.r) {
          res.push(circle.index);
        }
      }
    });
    return res;
  }

  /**
   * 位置の更新
   */
  evolution() {
    if (this.ongoing) {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  /**
   * 描画
   * @param {P5} p5
   */
  draw(p5: P5) {
    p5.noStroke();
    if (this.ongoing) {
      p5.fill(255);
    } else {
      p5.fill(100);
    }
    p5.circle(this.x, this.y, 2.0 * this.r);
  }
}
