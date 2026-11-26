// 顾客与订单：3 种食材 × 3 格 = 9 格盘子，45 秒耐心
const config = require("../../config/balance.js");

const O = {
  list: [],
  nextId: 1,
};

function reset() {
  O.list.length = 0;
  O.nextId = 1;
}

function makeOrder(now, recipe) {
  const picked = recipe.kinds.slice();
  while (picked.length < 3) picked.push(config.kinds[0].id);

  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 3; c++) {
      cells.push({ kind: picked[row], filled: false });
    }
  }

  return {
    id: O.nextId++,
    recipe: recipe,
    name: recipe.name,
    mul: recipe.mul || 1,
    cells: cells,
    kinds: picked,
    arr: now,
    patience: config.patience,
    maxPatience: config.patience,
    state: "wait",
    refunded: false,
  };
}

function seated(now) {
  return O.list.filter(function (o) {
    return o.state === "wait" && now >= o.arr;
  });
}

// 正在播放满单动画的订单
function flying() {
  for (let i = 0; i < O.list.length; i++) {
    if (O.list[i].state === "done") return O.list[i];
  }
  return null;
}

function needPool(now) {
  const out = [];
  const s = seated(now);
  for (let i = 0; i < s.length; i++) {
    const o = s[i];
    for (let k = 0; k < o.cells.length; k++) {
      if (!o.cells[k].filled) out.push(o.cells[k].kind);
    }
  }
  return out;
}

function fillCell(order, kind) {
  for (let i = 0; i < order.cells.length; i++) {
    if (order.cells[i].kind === kind && !order.cells[i].filled) {
      order.cells[i].filled = true;
      return true;
    }
  }
  return false;
}

function isComplete(order) {
  for (let i = 0; i < order.cells.length; i++) {
    if (!order.cells[i].filled) return false;
  }
  return true;
}

function patienceRatio(order) {
  return Math.max(0, order.patience / order.maxPatience);
}

function patienceBand(order) {
  const waited = order.maxPatience - order.patience;
  if (waited >= config.patienceRedAt) return "red";
  if (waited >= config.patienceYellowAt) return "yellow";
  return "green";
}

function bandMul(order) {
  const b = patienceBand(order);
  if (b === "red") return config.patienceRed;
  if (b === "yellow") return config.patienceYellow;
  return config.patienceGreen;
}

module.exports = { O, reset, makeOrder, seated, flying, needPool, fillCell, isComplete, patienceRatio, patienceBand, bandMul };