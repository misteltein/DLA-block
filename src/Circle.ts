import P5 from "p5";

/**
 * [begin : end] の一様乱数
 * @param {number} begin
 * @param {number} end
 */
const uniformDistBetween = (begin: number, end: number): number => {
    return Math.random() * (end - begin) - begin;
};

/**
 * 平均 0，分散 sigma の正規乱数
 * @param sigma
 */
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

/**
 * 円を書くためのクラス
 */
export default class Circle {
    static R: number;
    static counter = 0;
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

    /**
     * 円を生成する
     */
    constructor() {
        const theta = uniformDistBetween(0.0, 2.0 * Math.PI);
        this.x = Math.sqrt(2.0) * Circle.R * Math.sin(theta);
        this.y = Math.sqrt(2.0) * Circle.R * Math.cos(theta);
        const norm = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.vx = -this.x / norm;
        this.vy = -this.y / norm;
        this.ongoing = true;
        this.r = normalTrunc(7.0, 15, 10.0, 50.0);
        this.updateState(0, []);
        if (!this.ongoing) {
            throw new Error("end");
        }
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
        p5.circle(this.x, this.y, 2.0 * this.r - 1);
    }
}
