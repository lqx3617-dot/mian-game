// 结算页：一屏一个主角（再来一晚），营业额退成配角
const D = require("./draw.js");
const config = require("../../config/balance.js");

const PANEL_H = 392;

function panelRect(L) {
  const w = Math.min(L.W - 56, 340);
  const h = PANEL_H;
  return { x: (L.W - w) / 2, y: (L.H - h) / 2, w: w, h: h };
}

function draw(ctx, L, T, R) {
  if (!R.over) return;

  ctx.fillStyle = "rgba(0,0,0,0.74)";
  ctx.fillRect(0, 0, L.W, L.H);

  const p = panelRect(L);
  const cx = p.x + p.w / 2;

  D.fillRound(ctx, p.x, p.y, p.w, p.h, 20, "#1E1915");
  D.strokeRound(ctx, p.x, p.y, p.w, p.h, 20, D.hexAlpha("#F2C14E", 0.35), 1.5);

  // 标题
  D.text(ctx, R.overReason === "reputation" ? "口碑见底" : R.overReason === "cleared" ? "全场清空" : "打烊",
    cx, p.y + 52, "600 32px sans-serif", "#F2C14E", "center");

  // 星级：三颗，实心金 / 空心
  const starY = p.y + 94;
  for (let i = 0; i < 3; i++) {
    const sx = cx + (i - 1) * 44;
    const on = i < R.stars;
    ctx.beginPath();
    ctx.arc(sx, starY, 14, 0, Math.PI * 2);
    ctx.fillStyle = on ? "#F2C14E" : "rgba(255,255,255,0.07)";
    ctx.fill();
    if (!on) {
      D.strokeRound(ctx, sx - 14, starY - 14, 28, 28, 14, "rgba(255,255,255,0.12)", 1);
    }
  }

  // 四项数据
  const rows = [
    ["完成单数", R.doneCount + " 单"],
    ["超时", R.lostCount + " 位"],
    ["退单", R.refundCount + " 次"],
    R.clearBonus > 0
      ? ["收摊奖励", "+" + R.clearBonus + " 币"]
      : ["最高连击", "x" + R.bestCombo.toFixed(1)],
  ];
  const left = p.x + 30;
  const right = p.x + p.w - 30;
  for (let i = 0; i < rows.length; i++) {
    const ry = p.y + 146 + i * 30;
    D.text(ctx, rows[i][0], left, ry, "15px sans-serif", "#8A8078");
    D.text(ctx, rows[i][1], right, ry, "600 16px sans-serif", "#E8DFD2", "right");
  }

  // 分隔：一条实心细带（不用线）
  D.fillRound(ctx, left, p.y + 268, p.w - 60, 1, 0.5, "rgba(255,255,255,0.08)");

  // 营业额：小标签 + 中等数字
  D.text(ctx, "营业额", left, p.y + 296, "13px sans-serif", "#8A8078");
  D.text(ctx, "¥" + Math.round(R.revenue), right, p.y + 300, "600 30px sans-serif", "#F2C14E", "right");

  // 主按钮：整页唯一的大色块
  const bw = p.w - 60;
  const bx = p.x + 30;
  const by = p.y + p.h - 66;
  D.fillRound(ctx, bx, by, bw, 48, 12, "#F2C14E");
  D.text(ctx, "收摊回店", cx, by + 31, "600 21px sans-serif", "#2A1E12", "center");
}

function againHit(L) {
  const p = panelRect(L);
  return { x: p.x + 30, y: p.y + p.h - 66, w: p.w - 60, h: 48 };
}

module.exports = { draw, againHit, panelRect };