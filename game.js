// ============================================================
//  今晚开摊 · 入口与场景调度
//  场景：home（摊位） ↔ round（单局）
// ============================================================
wx.setEnableDebug({ enableDebug: true });

const info = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()) || {};
const W = info.windowWidth || 375;
const H = info.windowHeight || 667;
const DPR = Math.min(info.pixelRatio || 2, 3);
const SAFE_TOP = Math.max(40, (info.safeArea && info.safeArea.top) || 24);  // 兜底：别贴状态栏

const canvas = wx.createCanvas();
canvas.width = Math.floor(W * DPR);
canvas.height = Math.floor(H * DPR);
const ctx = canvas.getContext("2d");
ctx.scale(DPR, DPR);

const { THEMES, ACTIVE } = require("./config/theme.js");
const layout = require("./js/ui/layout.js");
const hud = require("./js/ui/hud.js");
const board = require("./js/ui/board.js");
const overlay = require("./js/ui/overlay.js");
const round = require("./js/core/round.js");
const orders = require("./js/core/orders.js");
const audio = require("./js/audio.js");
const D = require("./js/ui/draw.js");
const config = require("./config/balance.js");
const fx = require("./js/ui/fx.js");
const saveCore = require("./js/core/save.js");
const progress = require("./js/core/progress.js");
const homeScene = require("./js/scenes/home.js");
const recipes = require("./config/recipes.js");

const T = THEMES[ACTIVE];
const L = layout.compute(W, H, SAFE_TOP);

let S = saveCore.load();
let scene = "home";
let settled = false;
let downAt = 0, downX = 0, downY = 0, downSeat = -1;
let showRecipes = false;
let listScroll = 0;

function startRound() {
  round.reset(S.level);
  scene = "round";
  settled = false;
  fx.FX.list.length = 0;
}

function settle() {
  if (settled) return;
  settled = true;
  const gain = Math.round(round.R.revenue);
  S.coins += gain;
  S.totalServed += round.R.doneCount;
  S.totalRevenue += round.R.revenue;
  S.rounds += 1;
  S.bestStars.max = Math.max(S.bestStars.max || 0, round.R.stars);
  const k = saveCore.today();
  if (S.todayKey !== k) { S.todayKey = k; S.todayServed = 0; }
  S.todayServed += round.R.doneCount;
  saveCore.save(S);
}

wx.onTouchStart(function (e) {
  const t = e.touches[0];
  if (!t) return;
  downAt = Date.now();
  downX = t.clientX;
  downY = t.clientY;
  downSeat = -1;

  // ── 主页
  if (scene === "home") {
    // 菜谱浮层优先
    if (showRecipes) {
      if (layout.inRect(t.clientX, t.clientY, homeScene.closeListHit(L))) {
        showRecipes = false;
      }
      return;
    }
    if (layout.inRect(t.clientX, t.clientY, homeScene.recipeHit(L))) {
      showRecipes = true;
      listScroll = 0;
      audio.buy();
      return;
    }
    const b = homeScene.buttons(L);
    if (layout.inRect(t.clientX, t.clientY, b.open)) {
      audio.ready();
      startRound();
      return;
    }
    if (layout.inRect(t.clientX, t.clientY, b.up)) {
      if (progress.levelUp(S)) {
        saveCore.save(S);
        audio.coin(true);
      } else {
        audio.leave();
      }
      return;
    }
    return;
  }

  // ── 单局
  if (round.R.over) {
    if (layout.inRect(t.clientX, t.clientY, overlay.againHit(L))) {
      settle();
      scene = "home";
      audio.ready();
    }
    return;
  }

  if (layout.inRect(t.clientX, t.clientY, L.refundBtn)) {
    const o = round.activeOrder();
    if (o && round.refund(o)) audio.leave();
    return;
  }

  for (let i = 0; i < config.seats; i++) {
    if (layout.inRect(t.clientX, t.clientY, layout.custRect(L, i))) {
      downSeat = i;
      return;
    }
  }

  const bi = layout.beltIndexAt(L, t.clientX, t.clientY);
  if (bi >= 0) {
    const before = round.R.slots.length;
    if (round.grab(bi)) {
      audio.start();
      const br = layout.beltRect(L, bi);
      const sr = layout.slotRect(L, before);
      fx.grabFly(br.x + br.w / 2, br.y + br.h / 2, sr.x + sr.w / 2, sr.y + sr.h / 2, 0);
    } else {
      audio.leave();
    }
    return;
  }

  const ci = layout.plateCellAt(L, t.clientX, t.clientY);
  if (ci >= 0) {
    const o = round.activeOrder();
    if (o) {
      if (round.place(o, ci)) { audio.serve(); fx.placePop(ci); }
      else audio.leave();
    }
  }
});

let listDownY = 0;
wx.onTouchMove(function (e) {
  if (scene !== "home" || !showRecipes) return;
  const tt = e.touches[0];
  if (!tt) return;
  if (listDownY === 0) listDownY = tt.clientY;
  const dy = tt.clientY - listDownY;
  if (Math.abs(dy) > 6) {
    listScroll = Math.max(0, Math.min(20 * 46 - (L.H - 220), listScroll - dy * 0.6));
    listDownY = tt.clientY;
  }
});

wx.onTouchEnd(function (e) {
  listDownY = 0;
  const t = e.changedTouches && e.changedTouches[0];
  if (!t || scene !== "round" || round.R.over) return;
  const moved = Math.abs(t.clientX - downX) + Math.abs(t.clientY - downY) > 20;
  const held = Date.now() - downAt;
  if (downSeat >= 0 && !moved) {
    if (held > 320) {
      const seated = orders.seated(round.R.t);
      if (round.refund(seated[downSeat])) audio.leave();
    } else {
      round.selectSeat(downSeat);
      audio.buy();
    }
    downSeat = -1;
  }
});

function drainEvents() {
  const evs = round.consumeEvents();
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    if (ev.type === "serve") audio.coin(ev.combo > 1.2);
    else if (ev.type === "timeout" || ev.type === "refund") audio.leave();
    else if (ev.type === "spawn") audio.ready();
  }
}

function drawFooter() {
  const y = L.footerY;
  D.text(ctx, "点传送带取串 → 点盘格放料", L.W / 2, y + 4, T.fonts.tiny, D.hexAlpha(T.dim, 0.8), "center");

  const b = L.refundBtn;
  const o = round.activeOrder();
  const can = !!(o && o.state === "wait");
  D.fillRound(ctx, b.x, b.y, b.w, b.h, 12, can ? D.hexAlpha("#E2574C", 0.16) : D.hexAlpha(T.text, 0.05));
  D.strokeRound(ctx, b.x, b.y, b.w, b.h, 12, can ? D.hexAlpha("#E2574C", 0.55) : D.hexAlpha(T.line, 0.7), 1.2);
  D.text(ctx, can ? "放弃这一单（口碑 -1）" : "没有可退的单", L.W / 2, b.y + 28,
    T.fonts.title, can ? "#E08A80" : D.hexAlpha(T.dim, 0.6), "center");
}

let last = Date.now();
function loop() {
  const now = Date.now();
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.2) dt = 0.2;
  const t = now / 1000;

  if (scene === "home") {
    const g = ctx.createLinearGradient(0, 0, 0, L.H);
    g.addColorStop(0, "#14100C");
    g.addColorStop(1, "#080605");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, L.W, L.H);
    homeScene.draw(ctx, L, T, S, t, homeScene.buttons(L));
    if (showRecipes) homeScene.drawRecipeList(ctx, L, T, S, listScroll);
    requestAnimationFrame(loop);
    return;
  }

  round.tick(dt);
  drainEvents();
  fx.update(dt);

  const g2 = ctx.createLinearGradient(0, 0, 0, L.H);
  g2.addColorStop(0, T.bgTop);
  g2.addColorStop(1, T.bgBottom);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, L.W, L.H);

  hud.draw(ctx, L, T, round.R);
  board.draw(ctx, L, T, round.R);
  drawFooter();
  overlay.draw(ctx, L, T, round.R);

  requestAnimationFrame(loop);
}

loop();

wx.onHide(function () {
  if (scene === "round" && round.R.over) settle();
  saveCore.save(S);
});