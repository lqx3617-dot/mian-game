// 竖屏布局（v3）：传送带改两行各 6 格，格宽 ≥44pt
function compute(W, H, safeTop) {
  const hudH = safeTop + 68;   // 顶部留出安全余量，别贴着状态栏

  const custY = hudH + 6;
  const custH = 76;

  const cell = Math.min(88, Math.floor((W - 56) / 3));
  const plateW = cell * 3;
  const plateX = Math.floor((W - plateW) / 2);
  const plateY = custY + custH + 26;   // 上方留出「3/9」的位置

  const slotsY = plateY + plateW + 18;
  const slotCell = 66;
  const slotsW = slotCell * 3 + 16;
  const slotsX = Math.floor((W - slotsW) / 2);

  // 两行 × 6 格，格宽按 44 下限反推
  const perRow = 6;
  const gap = 5;
  const sideMargin = 12;
  const avail = W - sideMargin * 2 - gap * (perRow - 1);
  const beltCell = Math.max(44, Math.floor(avail / perRow));
  const beltW = beltCell * perRow + gap * (perRow - 1);
  const beltX = Math.floor((W - beltW) / 2);
  const beltY = slotsY + slotCell + 30;
  const rowH = beltCell + 8;

  const revenueW = 118;             // 右侧营业额固定占位，时间条不再压上去
  const timeBarW = W - 16 - revenueW - 20;

  return {
    W: W, H: H, safeTop: safeTop,
    hudH: hudH,
    revenueW: revenueW,
    timeBarW: timeBarW,
    custY: custY, custH: custH,
    plateX: plateX, plateY: plateY, plateW: plateW, cell: cell,
    slotsX: slotsX, slotsY: slotsY, slotCell: slotCell, slotsW: slotsW,
    beltX: beltX, beltY: beltY, beltCell: beltCell, beltW: beltW,
    beltGap: gap, beltRowH: rowH, perRow: perRow,
    footerY: beltY + rowH * 2 + 22,
    refundBtn: { x: 26, y: beltY + rowH * 2 + 56, w: W - 52, h: 46 },
  };
}

function plateCellRect(L, idx) {
  const r = Math.floor(idx / 3);
  const c = idx % 3;
  return { x: L.plateX + c * L.cell, y: L.plateY + r * L.cell, w: L.cell, h: L.cell };
}

function plateCellAt(L, px, py) {
  if (px < L.plateX || py < L.plateY) return -1;
  const c = Math.floor((px - L.plateX) / L.cell);
  const r = Math.floor((py - L.plateY) / L.cell);
  if (r < 0 || r > 2 || c < 0 || c > 2) return -1;
  return r * 3 + c;
}

function custRect(L, i) {
  const gap = 8;
  const w = (L.W - 24 - gap * 2) / 3;
  return { x: 12 + i * (w + gap), y: L.custY, w: w, h: L.custH };
}

function slotRect(L, i) {
  return { x: L.slotsX + 8 + i * L.slotCell, y: L.slotsY, w: L.slotCell, h: L.slotCell };
}

// 传送带两行：index 0-5 在上行，6-11 在下行
function beltRect(L, i) {
  const row = i < L.perRow ? 0 : 1;
  const col = i % L.perRow;
  return {
    x: L.beltX + col * (L.beltCell + L.beltGap),
    y: L.beltY + row * L.beltRowH,
    w: L.beltCell,
    h: L.beltCell,
  };
}

function beltIndexAt(L, px, py) {
  for (let i = 0; i < 12; i++) {
    const r = beltRect(L, i);
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

module.exports = { compute, plateCellRect, plateCellAt, custRect, slotRect, beltRect, beltIndexAt, inRect };
