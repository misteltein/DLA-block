import P5 from "p5";

const sketch = (p: P5) => {
  p.setup = () => {
    p.createCanvas(300, 300);
    p.background(51);
  };
};

/* eslint-disable no-new */
new P5(sketch);
