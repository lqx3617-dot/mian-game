// 传送带：右进左出，每 shiftEvery 秒补 shiftAdd 根
const B = require("../../config/balance.js");

const BELT = {
  cells: [],
  nextId: 1,
  shiftT: 0,
  outgoing: [],     // 刚滑走的 3 根，用来画滑出动画
  slideT: 0,        // 滑动补间剩余时间
  slideDur: 0.26,
};

function reset() {
  BELT.cells.length = 0;
  for (let i = 0; i < B.beltLen; i++) BELT.cells.push(null);
  BELT.nextId = 1;
  BELT.shiftT = 0;
  BELT.outgoing.length = 0;
  BELT.slideT = 0;
}

function makeItem(kind) {
  return { id: BELT.nextId++, kind: kind };
}

// pool: 当前等级允许出现的食材 id 数组
function refill(needPool, disturb, pool) {
  for (let i = 0; i < B.shiftAdd; i++) {
    let kind;
    if (needPool.length > 0 && Math.random() > disturb) {
      kind = needPool[Math.floor(Math.random() * needPool.length)];
    } else {
      const usable = (pool && pool.length) ? pool : B.kinds.map(function (k) { return k.id; });
      kind = usable[Math.floor(Math.random() * usable.length)];
    }
    BELT.cells[B.beltLen - 1 - i] = makeItem(kind);
  }
}

// 左移 3 格：左边 3 根滑出（存起来做动画），右边补 3 根新的
function shift(needPool, disturb, pool) {
  BELT.outgoing = [BELT.cells[0], BELT.cells[1], BELT.cells[2]];
  for (let i = 0; i < B.shiftAdd; i++) BELT.cells.shift();
  for (let i = 0; i < B.shiftAdd; i++) BELT.cells.push(null);
  refill(needPool, disturb, pool);
  BELT.slideT = BELT.slideDur;
}

function take(index) {
  const it = BELT.cells[index];
  if (!it) return null;
  BELT.cells[index] = null;
  return it;
}

function pushBack(item) {
  for (let i = BELT.cells.length - 1; i >= 0; i--) {
    if (!BELT.cells[i]) {
      BELT.cells[i] = item;
      return true;
    }
  }
  return false;
}

// 滑动进度：1 表示刚补给完（内容右移 3 格），0 表示到位
function slideOffset() {
  if (BELT.slideT <= 0) return 0;
  const p = BELT.slideT / BELT.slideDur;   // 1 → 0
  return p * p;                            // 缓出：开头快、末尾慢
}

function update(dt) {
  if (BELT.slideT > 0) {
    BELT.slideT -= dt;
    if (BELT.slideT < 0) BELT.slideT = 0;
  }
}

module.exports = { BELT, reset, shift, take, pushBack, makeItem, update, slideOffset };