// 单局状态机：计时、口碑、营业额、连击、结算
const config = require("../../config/balance.js");
const orders = require("./orders.js");
const belt = require("./belt.js");
const progress = require("./progress.js");
const recipes = require("../../config/recipes.js");

const R = {
  t: 0,
  timeLeft: config.duration,
  rep: config.repMax,
  revenue: 0,
  doneCount: 0,
  lostCount: 0,
  refundCount: 0,
  combo: 1.0,
  lastServeAt: -99,
  slots: [],
  activeId: 0,     // 记住「选中了哪位顾客」，用 id 不用索引
  running: false,
  over: false,
  overReason: "",
  spawnIdx: 0,
  events: [],
  stars: 0,
  perfect: true,
  bestCombo: 1.0,
  clearBonus: 0,
};

// 当前等级允许出现的食材
function kindPoolForLevel(lv) {
  const out = [];
  for (let i = 0; i < config.kinds.length; i++) {
    const k = config.kinds[i];
    if ((k.lv || 1) <= lv) out.push(k.id);
  }
  return out;
}

function push(type, extra) {
  R.events.push(Object.assign({ type: type }, extra || {}));
}

function reset(level) {
  const lv = Math.max(1, Math.min(20, level || 1));
  R.level = lv;
  R.price = progress.unitPrice(lv);
  R.slotsMax = progress.slotCount(lv);
  R.t = 0;
  R.timeLeft = config.duration;
  R.rep = config.repMax;
  R.revenue = 0;
  R.doneCount = 0;
  R.lostCount = 0;
  R.refundCount = 0;
  R.combo = 1.0;
  R.lastServeAt = -99;
  R.slots.length = 0;
  R.activeId = 0;
  R.running = true;
  R.over = false;
  R.overReason = "";
  R.spawnIdx = 0;
  R.events.length = 0;
  R.stars = 0;
  R.perfect = true;
  R.bestCombo = 1.0;
  R.clearBonus = 0;

  orders.reset();
  belt.reset();

  // 开局：先落单，再按这一单的缺口铺带子（7 成有用、3 成杂串）
  const first = spawnCustomer(0);
  const need = first ? orders.needPool(0) : [];
  const startPool = kindPoolForLevel(lv);
  for (let i = 0; i < config.beltLen; i++) {
    let kind;
    if (need.length > 0 && Math.random() > 0.30) {
      kind = need[Math.floor(Math.random() * need.length)];
    } else {
      kind = startPool[Math.floor(Math.random() * startPool.length)];
    }
    belt.BELT.cells[i] = belt.makeItem(kind);
  }
}

function spawnCustomer(now) {
  if (R.spawnIdx >= config.arrivals.length) return null;
  if (orders.seated(now).length >= config.seats) return null;
  const rec = recipes.pick(R.level || 1);
  const o = orders.makeOrder(now, rec);
  orders.O.list.push(o);
  R.spawnIdx++;
  push("spawn", { id: o.id });
  return o;
}

// 当前查看的订单：用 id 定位，队列前移也不会串人
function activeOrder() {
  const s = orders.seated(R.t);
  if (s.length === 0) return null;
  for (let i = 0; i < s.length; i++) {
    if (s[i].id === R.activeId) return s[i];
  }
  R.activeId = s[0].id;
  return s[0];
}

// 按席位号取订单（顾客卡用）
function orderAtSeat(i) {
  const s = orders.seated(R.t);
  return s[i] || null;
}

function selectSeat(i) {
  const o = orderAtSeat(i);
  if (o) R.activeId = o.id;
}

function grab(index) {
  if (!R.running || R.over) return false;
  if (R.slots.length >= R.slotsMax) {
    push("slotfull");
    return false;
  }
  const item = belt.take(index);
  if (!item) return false;
  R.slots.push({ item: item, at: R.t });
  push("grab", { kind: item.kind });
  return true;
}

function place(order, cellIndex) {
  if (!R.running || R.over || !order) return false;
  const cell = order.cells[cellIndex];
  if (!cell || cell.filled) return false;

  let si = -1;
  for (let i = 0; i < R.slots.length; i++) {
    if (R.slots[i].item.kind === cell.kind) { si = i; break; }
  }
  if (si < 0) {
    push("nogoods");
    return false;
  }

  R.slots.splice(si, 1);
  cell.filled = true;
  push("place", { kind: cell.kind });

  if (orders.isComplete(order)) serve(order);
  return true;
}

// 点整盘：槽里有哪种就填哪种
function autoPlace(order) {
  if (!order) return false;
  for (let i = 0; i < R.slots.length; i++) {
    const kind = R.slots[i].item.kind;
    for (let c = 0; c < order.cells.length; c++) {
      if (!order.cells[c].filled && order.cells[c].kind === kind) {
        return place(order, c);
      }
    }
  }
  push("nogoods");
  return false;
}

function serve(order) {
  order.state = "done";
  const mul = orders.bandMul(order);
  // 连击：10 秒内连续出餐，每次 +0.1，上限 1.5；断档回到 1.0
  if (R.t - R.lastServeAt < config.comboWindow) {
    const base = (typeof R.combo === "number" && isFinite(R.combo)) ? R.combo : 1.0;
    R.combo = Math.min(base + config.comboStep, config.comboMax);
  } else {
    R.combo = 1.0;
  }
  R.lastServeAt = R.t;
  if (R.combo > R.bestCombo) R.bestCombo = R.combo;

  let gain = R.price * (order.mul || 1) * mul * R.combo;
  if (R.perfect) gain *= (1 + config.perfectBonus);
  if (!isFinite(gain) || gain < 0) gain = 0;   // 任何一项异常都不能污染营业额

  R.revenue += gain;
  R.doneCount++;
  order.flyT = 0;
  push("serve", { gain: gain, combo: R.combo, band: orders.patienceBand(order) });

  // 立刻把焦点交给还坐着的下一位，避免这 0.4 秒里点到别人的格子
  R.activeId = 0;
  // 补位放到飞走之后（见 tick），避免盘子还在时顾客卡就换了人
}

function refund(order) {
  if (!R.running || R.over || !order || order.state !== "wait") return false;
  order.state = "left";
  order.refunded = true;
  R.rep -= 1;
  R.refundCount++;
  R.perfect = false;
  push("refund");
  if (R.rep <= 0) endRound("reputation");
  return true;
}

function tick(dt) {
  if (!R.running || R.over) return;

  // 满单态：整盘转金、停表、0.4 秒后飞走
  let flying = false;
  for (let i = 0; i < orders.O.list.length; i++) {
    const o = orders.O.list[i];
    if (o.state === "done") {
      o.flyT = (o.flyT || 0) + dt;
      flying = true;
      if (o.flyT >= 0.4) {
        o.state = "gone";
        spawnCustomer(R.t);
      }
    }
  }
  if (flying) return;   // 停表：这一帧不推进任何计时

  R.t += dt;
  R.timeLeft = Math.max(0, config.duration - R.t);

  belt.update(dt);
  belt.BELT.shiftT += dt;
  if (belt.BELT.shiftT >= config.shiftEvery) {
    belt.BELT.shiftT = 0;
    belt.shift(orders.needPool(R.t), config.disturb, kindPoolForLevel(R.level));
  }

  const list = orders.seated(R.t);
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    o.patience -= dt;
    if (o.patience <= 0) {
      o.state = "left";
      R.lostCount++;
      R.rep -= 1;
      R.perfect = false;
      push("timeout");
      if (R.rep <= 0) endRound("reputation");
    }
  }

  const next = config.arrivals[R.spawnIdx];
  if (next !== undefined && R.t >= next) spawnCustomer(R.t);

  // ── 全场清空后的两种处理
  const waiting = orders.seated(R.t).length;
  const moreToCome = R.spawnIdx < config.arrivals.length;
  const animating = !!orders.flying();

  if (waiting === 0 && !animating) {
    if (!moreToCome) {
      // 所有客人做完：提前收摊，剩余时间折算成奖励
      if (R.doneCount > 0) {
        const bonus = Math.round(R.timeLeft * 0.35);
        R.clearBonus = bonus;
        R.revenue += bonus;
        endRound("cleared");
      }
    } else {
      // 还有客人没到：直接把他们叫来，不干等
      const nx = config.arrivals[R.spawnIdx];
      if (nx !== undefined && R.t < nx) {
        R.t = nx;
        R.timeLeft = Math.max(0, config.duration - R.t);
        spawnCustomer(R.t);
        push("skip", { to: nx });
      }
    }
  }

  if (R.timeLeft <= 0) endRound("time");
}

function endRound(reason) {
  if (R.over) return;
  R.over = true;
  R.running = false;
  R.overReason = reason;
  R.stars = R.revenue >= config.star3 ? 3 : R.revenue >= config.star2 ? 2 : R.revenue >= config.star1 ? 1 : 0;
  push("over", { reason: reason });
}

function consumeEvents() {
  const e = R.events.slice();
  R.events.length = 0;
  return e;
}

module.exports = { R, reset, tick, grab, place, autoPlace, refund, activeOrder, orderAtSeat, selectSeat, spawnCustomer, endRound, consumeEvents };