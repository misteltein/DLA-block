import P5 from "p5";
import Circle from "./Circle";

/**
 * 正方形のクラス
 */
export default class Square {
  // 幅
  static SIZE: number;
  // 中心座標（デフォルトの座標系）
  xCenter: number;
  yCenter: number;
  // 色で塗られているか
  filled: boolean;

  /**
   * 正方形をつくる
   * @param x - 左上の角の x 座標
   * @param y - 右上の角の y 座標
   */
  constructor(x: number, y: number) {
    this.xCenter = x + 0.5 * Square.SIZE;
    this.yCenter = y + 0.5 * Square.SIZE;
    this.filled = false;
  }

  /**
   * Circle が正方形の中心を含むときは塗りつぶすためのサブルーチン
   * @param {Circle} circle
   */
  updateState(circle: Circle) {
    if (this.filled || circle.ongoing) return;
    const xCircle: number = circle.getX();
    const yCircle: number = circle.getY();
    this.filled =
      Math.sqrt(
        Math.pow(this.xCenter - xCircle, 2) +
          Math.pow(this.yCenter - yCircle, 2)
      ) <= circle.r;
  }

  /**
   * 描画
   * @param {P5} p5
   */
  draw(p5: P5) {
    p5.rectMode(p5.CENTER);
    p5.rect(this.xCenter, this.yCenter, Square.SIZE, Square.SIZE);
  }
}
