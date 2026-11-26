// 动效：取串飞行、放格弹跳、出餐金币
const FX = {
  list: [],
};

function add(type, data) {
  FX.list.push(Object.assign({ type: type, t: 0, dur: 0.32 }, data));
}

function grabFly(fromX, fromY, toX, toY, kind) {
  add("fly", { x0: fromX, y0: fromY, x1: toX, y1: toY, kind: kind, dur: 0.26 });
}

function placePop(idx) {
  add("pop", { idx: idx, dur: 0.24 });
}

function coinFly(fromX, fromY, toX, toY, text) {
  add("coin", { x0: fromX, y0: fromY, x1: toX, y1: toY, text: text, dur: 0.55 });
}

function update(dt) {
  for (let i = FX.list.length - 1; i >= 0; i--) {
    FX.list[i].t += dt;
    if (FX.list[i].t >= FX.list[i].dur) FX.list.splice(i, 1);
  }
}

function popScale(idx) {
  for (let i = 0; i < FX.list.length; i++) {
    const e = FX.list[i];
    if (e.type === "pop" && e.idx === idx) {
      const p = e.t / e.dur;
      return 1 + 0.18 * Math.sin(Math.PI * Math.min(1, p));
    }
  }
  return 1;
}

module.exports = { FX, add, grabFly, placePop, coinFly, update, popScale };
