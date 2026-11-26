// 盘子（三态写死）+ 夹子槽 + 两行传送带
const D = require("./draw.js");
const kinds = require("./kinds.js");
const L2 = require("./layout.js");
const orders = require("../core/orders.js");
const beltCore = require("../core/belt.js");
const fx = require("./fx.js");
const config = require("../../config/balance.js");

const GOLD = "#F2C14E";
const DASH = [5, 4];

function dashRect(ctx, x, y, w, h, r, color, lw) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.setLineDash(DASH);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
}

function checkMark(ctx, cx, cy, s, color) {
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy);
  ctx.lineTo(cx - s * 0.1, cy + s * 0.4);
  ctx.lineTo(cx + s * 0.55, cy - s * 0.45);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, s * 0.22);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawPlate(ctx, L, T, R) {
  const fly = orders.flying();
  const o = fly || require("../core/round.js").activeOrder();
  const pad = 5;
  const isFull = !!fly;

  // 满单：整盘转金 + 缩小飞走
  const flyP = isFull ? Math.min(1, (fly.flyT || 0) / 0.4) : 0;
  const scale = isFull ? (1 - flyP * 0.35) : 1;
  const alpha = isFull ? (1 - flyP * 0.9) : 1;

  ctx.save();
  if (isFull) {
    ctx.globalAlpha = alpha;
    ctx.translate(L.plateX + L.plateW / 2, L.plateY + L.plateW / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(L.plateX + L.plateW / 2), -(L.plateY + L.plateW / 2));
  }

  // 盘身
  const frameCol = isFull ? GOLD : D.hexAlpha("#FFFFFF", 0.10);
  D.fillRound(ctx, L.plateX - 10, L.plateY - 10, L.plateW + 20, L.plateW + 20, 26, D.hexAlpha("#000000", 0.22));
  D.fillRound(ctx, L.plateX - 14, L.plateY - 14, L.plateW + 28, L.plateW + 28, 28, D.hexAlpha("#FFFFFF", 0.04));
  D.strokeRound(ctx, L.plateX - 14, L.plateY - 14, L.plateW + 28, L.plateW + 28, 28, frameCol, isFull ? 2.5 : 1.5);

  for (let i = 0; i < 9; i++) {
    const r = L2.plateCellRect(L, i);
    const cell = o ? o.cells[i] : null;
    const sc = fx.popScale(i);
    const cw = (r.w - pad * 2) * sc;
    const ch = (r.h - pad * 2) * sc;
    const bx = r.x + pad + ((r.w - pad * 2) - cw) / 2;
    const by = r.y + pad + ((r.h - pad * 2) - ch) / 2;

    if (!cell) {
      D.fillRound(ctx, r.x + pad, r.y + pad, r.w - pad * 2, r.h - pad * 2, 10, D.hexAlpha("#FFFFFF", 0.03));
      continue;
    }

    if (cell.filled) {
      // 已放态：实底 + 右上角对勾 + 内缩 2pt
      kinds.draw(ctx, cell.kind, bx + 2, by + 2, cw - 4, "filled", T);
      const ccx = r.x + r.w - 15;
      const ccy = r.y + 15;
      ctx.beginPath();
      ctx.arc(ccx, ccy, 8, 0, Math.PI * 2);
      ctx.fillStyle = D.hexAlpha("#1A1410", 0.55);
      ctx.fill();
      checkMark(ctx, ccx, ccy, 7, "#FFFFFF");
    } else {
      // 需求态：交给 kinds 统一画（底色 + 虚线 + 图标/字），这里只补右下角 ×3
      kinds.draw(ctx, cell.kind, bx, by, cw, "empty", T);
      const col = kinds.info(cell.kind).color;
      D.text(ctx, "×3", bx + cw - 6, by + ch - 7, "10px sans-serif", D.hexAlpha(col, 0.75), "right");
    }
  }

  ctx.restore();

  // 盘顶：菜名 + 进度（菜名让玩家感知到菜谱在变）
  if (o && !isFull) {
    const filled = o.cells.filter(function (c) { return c.filled; }).length;
    D.text(ctx, o.name, L.plateX + L.plateW / 2 - 22, L.plateY - 18,
      "600 14px sans-serif", "#F2C14E", "center");
    D.text(ctx, filled + "/9", L.plateX + L.plateW / 2 + 46, L.plateY - 18,
      "600 13px sans-serif", D.hexAlpha("#C9BFB2", 0.95), "center");
  }
  if (isFull) {
    D.text(ctx, "完成", L.plateX + L.plateW / 2, L.plateY - 18, "600 13px sans-serif", GOLD, "center");
  }
}

function drawSlots(ctx, L, T, R) {
  D.fillRound(ctx, L.slotsX, L.slotsY - 6, L.slotsW, L.slotCell + 12, 14, D.hexAlpha("#000000", 0.3));
  D.fillRound(ctx, L.slotsX + 2, L.slotsY - 4, L.slotsW - 4, L.slotCell + 8, 12, D.hexAlpha("#221C16", 0.9));
  D.text(ctx, "手上", L.slotsX - 10, L.slotsY + L.slotCell / 2 + 4, "10px sans-serif", D.hexAlpha("#8A8078", 0.6), "right");

  for (let i = 0; i < config.slots; i++) {
    const r = L2.slotRect(L, i);
    const s = R.slots[i];
    if (s) {
      kinds.draw(ctx, s.item.kind, r.x, r.y, r.w, "filled", T);
    } else {
      D.fillRound(ctx, r.x, r.y, r.w, r.h, 12, D.hexAlpha("#FFFFFF", 0.04));
      D.strokeRound(ctx, r.x, r.y, r.w, r.h, 12, D.hexAlpha("#FFFFFF", 0.07), 1);
    }
  }
}

function drawBelt(ctx, L, T, R) {
  const totalH = L.beltRowH * 2;

  // 带体
  D.fillRound(ctx, L.beltX - 10, L.beltY - 12, L.beltW + 20, totalH + 20, 16, "#1A1512");
  D.fillRound(ctx, L.beltX - 10, L.beltY - 12, L.beltW + 20, 5, 3, D.hexAlpha("#FFFFFF", 0.13));
  D.fillRound(ctx, L.beltX - 10, L.beltY + totalH + 3, L.beltW + 20, 5, 3, D.hexAlpha("#000000", 0.5));

  D.text(ctx, "补给 " + (config.shiftEvery - beltCore.BELT.shiftT).toFixed(1) + "s",
    L.beltX + L.beltW, L.beltY - 20, "11px sans-serif", D.hexAlpha("#8A8078", 0.9), "right");
  D.text(ctx, "‹ 滑走方向", L.beltX - 10, L.beltY - 20, "11px sans-serif", D.hexAlpha("#8A8078", 0.7));

  // 滑动补间：内容立刻到位（不再整体右移，否则新补给会被裁到带外）
  // 只做两件小事：最左 3 根向左滑出，最右 3 根从右侧滑入
  const slide = beltCore.slideOffset();
  const step = L.beltCell + L.beltGap;
  const newFrom = config.beltLen - config.shiftAdd;

  ctx.save();
  ctx.beginPath();
  ctx.rect(L.beltX - 6, L.beltY - 6, L.beltW + 12, totalH + 12);
  ctx.clip();

  for (let i = 0; i < config.beltLen; i++) {
    const r = L2.beltRect(L, i);
    const it = beltCore.BELT.cells[i];
    const fade = 0.55 + 0.45 * (i / config.beltLen);
    const x = r.x + (i >= newFrom ? step * 0.45 * slide : 0);

    if (it) {
      ctx.globalAlpha = fade * (i >= newFrom ? (1 - slide * 0.5) : 1);
      kinds.draw(ctx, it.kind, x, r.y, r.w, "filled", T);
      ctx.globalAlpha = 1;
    } else {
      D.fillRound(ctx, x + 2, r.y + 2, r.w - 4, r.h - 4, 8, D.hexAlpha("#000000", 0.3));
    }
  }

  // 滑走的 3 根：从原位向左移出并淡出
  if (slide > 0.001 && beltCore.BELT.outgoing) {
    const p = 1 - slide;
    for (let k = 0; k < beltCore.BELT.outgoing.length; k++) {
      const it = beltCore.BELT.outgoing[k];
      if (!it) continue;
      const r0 = L2.beltRect(L, k);
      ctx.globalAlpha = slide * 0.9;
      kinds.draw(ctx, it.kind, r0.x - step * 3.2 * p, r0.y, r0.w, "filled", T);
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();

  // 两行之间的分隔线
  const sepY = L.beltY + L.beltRowH - 4;
  ctx.beginPath();
  ctx.moveTo(L.beltX - 4, sepY);
  ctx.lineTo(L.beltX + L.beltW + 4, sepY);
  ctx.strokeStyle = D.hexAlpha("#000000", 0.45);
  ctx.lineWidth = 3;
  ctx.stroke();
}

function draw(ctx, L, T, R) {
  drawPlate(ctx, L, T, R);
  drawSlots(ctx, L, T, R);
  drawBelt(ctx, L, T, R);
}

module.exports = { draw, drawPlate, drawSlots, drawBelt };