// 摊位主页：金币 / 等级 / 开摊 / 升级
const D = require("../ui/draw.js");
const progress = require("../core/progress.js");
const recipes = require("../../config/recipes.js");
const config = require("../../config/balance.js");

const GOLD = "#F2C14E";
const INK = "#E8DFD2";
const DIM = "#8A8078";

// 摊子：棚子 / 台面 / 车身 / 锅 / 蒸汽 / 灯
function drawStall(ctx, cx, baseY, T, t) {
  const w = 196;
  const h = 74;
  const top = baseY - h;

  // 地面投影
  ctx.save();
  ctx.translate(cx, baseY + 4);
  ctx.scale(1, 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fill();
  ctx.restore();

  // 车身
  D.fillRound(ctx, cx - w / 2, top, w, h, 8, "#2E251E");
  // 车身木纹
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const yy = top + (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + 6, yy);
    ctx.lineTo(cx + w / 2 - 6, yy);
    ctx.stroke();
  }
  // 轮子
  [cx - w * 0.32, cx + w * 0.32].forEach(function (wx) {
    ctx.beginPath();
    ctx.arc(wx, baseY, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1410";
    ctx.fill();
    ctx.strokeStyle = "#4A3C2E";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 台面
  D.fillRound(ctx, cx - w / 2 - 10, top - 10, w + 20, 12, 4, "#6B5340");
  D.fillRound(ctx, cx - w / 2 - 10, top - 10, w + 20, 4, 2, "rgba(255,255,255,0.12)");

  // 遮阳棚：弧形顶 + 红白条纹
  const awH = 40;
  const awY = top - awH - 4;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 - 16, top - 8);
  ctx.lineTo(cx + w / 2 + 16, top - 8);
  ctx.lineTo(cx + w / 2 + 8, awY);
  ctx.lineTo(cx - w / 2 - 8, awY);
  ctx.closePath();
  ctx.fillStyle = "#C2503E";
  ctx.fill();
  ctx.clip();
  for (let i = 0; i < 7; i++) {
    const x0 = cx - w / 2 - 16 + (w + 32) * (i / 7);
    const x1 = cx - w / 2 - 16 + (w + 32) * ((i + 1) / 7);
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x0, top - 8);
      ctx.lineTo(x1, top - 8);
      ctx.lineTo(x1 - 3, awY);
      ctx.lineTo(x0 + 3, awY);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,246,230,0.9)";
      ctx.fill();
    }
  }
  ctx.restore();
  // 棚檐
  D.fillRound(ctx, cx - w / 2 - 18, top - 10, w + 36, 6, 3, "#A03E30");

  // 灯串
  const lights = [-0.32, 0, 0.32];
  for (let i = 0; i < lights.length; i++) {
    const lx = cx + w * lights[i];
    const ly = awY - 8;
    ctx.beginPath();
    ctx.moveTo(lx, awY);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // 每盏灯错开相位，各自明灭
    const ph = t * 2.4 + i * 2.1;
    const flick = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(ph));  // 0.28 → 1.0，明暗拉大
    const radius = 13 + flick * 18;

    // 灯泡本体（亮的程度跟着变）
    ctx.beginPath();
    ctx.arc(lx, ly + 2, 2.2 + flick * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,233,168," + (0.55 + flick * 0.45) + ")";
    ctx.fill();

    // 灯泡泛光
    const lg = ctx.createRadialGradient(lx, ly + 2, 1, lx, ly + 2, radius);
    lg.addColorStop(0, "rgba(255,224,130," + (0.10 + flick * 0.75) + ")");
    lg.addColorStop(0.45, "rgba(255,200,90," + (0.03 + flick * 0.22) + ")");
    lg.addColorStop(1, "rgba(255,200,90,0)");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly + 2, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 锅：放在台面上，不要和棚子重叠
  const potY = top - 4;
  ctx.beginPath();
  ctx.ellipse(cx + 8, potY, 20, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#241E19";
  ctx.fill();
  ctx.strokeStyle = "#5A4C3E";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 蒸汽
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.42 + i * 0.33) % 1);
    const sy = potY - 4 - ph * 30;
    ctx.beginPath();
    ctx.arc(cx + 8 + Math.sin(ph * 6 + i * 2) * 7, sy, 3 + ph * 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,246,230," + (0.13 * (1 - ph)) + ")";
    ctx.fill();
  }
}

function draw(ctx, L, T, S, t, btns) {
  const g = ctx.createLinearGradient(0, 0, 0, L.H);
  g.addColorStop(0, "#151009");
  g.addColorStop(0.55, "#0D0A07");
  g.addColorStop(1, "#080605");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L.W, L.H);

  // 顶部暖光
  const warm = ctx.createRadialGradient(L.W / 2, L.safeTop + 60, 20, L.W / 2, L.safeTop + 60, 240);
  warm.addColorStop(0, "rgba(242,180,78,0.10)");
  warm.addColorStop(1, "rgba(242,180,78,0)");
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, L.W, L.safeTop + 300);

  const topY = L.safeTop + 34;

  // 金币
  D.text(ctx, "¥" + S.coins, 22, topY + 18, "600 30px sans-serif", GOLD);

  // 右侧统计（两行小字，右对齐）
  D.text(ctx, "累计 " + S.totalServed + " 单", L.W - 22, topY - 4, "12px sans-serif", DIM, "right");
  D.text(ctx, "第 " + S.rounds + " 晚 · 最佳 " + (S.bestStars.max || 0) + " 星", L.W - 22, topY + 14, "12px sans-serif", DIM, "right");

  // 摊子
  const stallBase = L.H * 0.52;
  drawStall(ctx, L.W / 2, stallBase, T, t);

  // 摊名
  D.text(ctx, "奶奶的摊子", L.W / 2, stallBase + 48, "600 23px sans-serif", INK, "center");
  D.text(ctx, "深夜巷口 · 只在晚上开", L.W / 2, stallBase + 70, "11px sans-serif", "rgba(138,128,120,0.65)", "center");

  // 等级行
  const cost = progress.levelCost(S.level);
  const ratio = Math.min(1, S.coins / cost);
  const rowY = stallBase + 106;

  D.text(ctx, "Lv " + S.level, 30, rowY, "600 16px sans-serif", GOLD);
  const barX = 80;
  const barW = L.W - 80 - 96;
  D.fillRound(ctx, barX, rowY - 8, barW, 7, 3.5, "rgba(255,255,255,0.10)");
  D.fillRound(ctx, barX, rowY - 8, Math.max(4, barW * ratio), 7, 3.5, ratio >= 1 ? GOLD : "#C2503E");
  D.text(ctx, ratio >= 1 ? "可升级" : (cost - S.coins) + " 币", L.W - 30, rowY,
    "600 14px sans-serif", ratio >= 1 ? GOLD : DIM, "right");

  // 菜谱
  D.text(ctx, "已解锁菜谱 " + recipes.unlocked(S.level).length + " / " + recipes.RECIPES.length + "  ›",
    L.W / 2, rowY + 30, "12px sans-serif", "rgba(138,128,120,0.85)", "center");

  // 开摊：三层泛光叠加，外圈缓缓呼吸
  const b = btns.open;
  const breath = 0.85 + Math.sin(t * 1.6) * 0.15;

  // 一层铺底大光斑（椭圆）
  const gx = L.W / 2;
  const gy = b.y + b.h / 2;
  const halo = ctx.createRadialGradient(gx, gy, b.w * 0.18, gx, gy, b.w * 0.62);
  halo.addColorStop(0, "rgba(242,193,78," + (0.16 * breath) + ")");
  halo.addColorStop(0.55, "rgba(242,193,78," + (0.07 * breath) + ")");
  halo.addColorStop(1, "rgba(242,193,78,0)");
  ctx.save();
  ctx.translate(gx, gy);
  ctx.scale(1, 0.42);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, b.w * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 三层叠加投影，模糊半径递增、透明度递减
  const layers = [
    { blur: 56, alpha: 0.07 },
    { blur: 30, alpha: 0.12 },
    { blur: 14, alpha: 0.20 },
  ];
  for (let i = 0; i < layers.length; i++) {
    ctx.save();
    ctx.shadowColor = "rgba(255,208,110," + (layers[i].alpha * breath) + ")";
    ctx.shadowBlur = layers[i].blur;
    D.fillRound(ctx, b.x, b.y, b.w, b.h, 16, GOLD);
    ctx.restore();
  }

  // 按钮本体
  const bg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  bg.addColorStop(0, "#FFD66B");
  bg.addColorStop(1, "#F0AE33");
  D.fillRound(ctx, b.x, b.y, b.w, b.h, 16, bg);

  // 顶部一道内高光
  D.fillRound(ctx, b.x + 3, b.y + 2, b.w - 6, b.h * 0.34, 13, "rgba(255,255,255,0.22)");

  D.text(ctx, "开 摊", L.W / 2, b.y + 39, "600 25px sans-serif", "#2A1E12", "center");

  // 升级
  const u = btns.up;
  const can = progress.canLevelUp(S);
  D.fillRound(ctx, u.x, u.y, u.w, u.h, 12, can ? "rgba(242,193,78,0.14)" : "rgba(255,255,255,0.04)");
  D.strokeRound(ctx, u.x, u.y, u.w, u.h, 12, can ? D.hexAlpha(GOLD, 0.55) : "rgba(255,255,255,0.08)", 1.2);
  D.text(ctx, can ? "升级 Lv" + (S.level + 1) + " · " + cost + " 币" : "差 " + Math.max(0, cost - S.coins) + " 币升级",
    L.W / 2, u.y + 27, "600 14px sans-serif", can ? GOLD : DIM, "center");

  // 底部说明
  D.text(ctx, "每晚 90 秒 · 传送带取串 · 拼满九格出餐", L.W / 2, L.H - 40, "11px sans-serif", "rgba(138,128,120,0.55)", "center");
  D.text(ctx, "食材图标 Twemoji · CC-BY 4.0", L.W / 2, L.H - 22, "9px sans-serif", "rgba(138,128,120,0.35)", "center");
}

function buttons(L) {
  return {
    open: { x: 36, y: L.H - 178, w: L.W - 72, h: 64 },
    up: { x: 36, y: L.H - 100, w: L.W - 72, h: 46 },
  };
}

function recipeHit(L) {
  return { x: 30, y: L.H * 0.52 + 96, w: L.W - 60, h: 30 };
}

function closeListHit(L) {
  return { x: 40, y: L.H - 76, w: L.W - 80, h: 46 };
}

function drawRecipeList(ctx, L, T, S, scroll) {
  const shade = ctx.createLinearGradient(0, 0, 0, L.H);
  shade.addColorStop(0, "#0C0A08");
  shade.addColorStop(1, "#080605");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, L.W, L.H);

  const top = L.safeTop + 40;
  const bottom = L.H - 100;
  D.text(ctx, "菜谱", 28, top + 12, "600 26px sans-serif", GOLD);
  D.text(ctx, recipes.unlocked(S.level).length + " / " + recipes.RECIPES.length, L.W - 28, top + 10,
    "13px sans-serif", DIM, "right");

  const rowH = 46;
  const startY = top + 40;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY - 10, L.W, bottom - startY + 10);
  ctx.clip();

  for (let i = 0; i < recipes.RECIPES.length; i++) {
    const r = recipes.RECIPES[i];
    const y = startY + i * rowH - scroll;
    if (y + rowH < startY - 20 || y > bottom + 20) continue;
    const ok = r.lv <= S.level;
    if (ok) D.fillRound(ctx, 20, y, L.W - 40, rowH - 8, 8, "rgba(242,193,78,0.10)");
    D.text(ctx, r.name, 34, y + 24, "600 15px sans-serif", ok ? INK : "rgba(138,128,120,0.55)");
    D.text(ctx, "Lv" + r.lv, L.W - 34, y + 24, "12px sans-serif", ok ? GOLD : "rgba(138,128,120,0.5)", "right");
    D.text(ctx, ok ? "已解锁" : "未解锁", L.W - 76, y + 24, "11px sans-serif",
      ok ? "rgba(242,193,78,0.7)" : "rgba(138,128,120,0.4)", "right");
  }
  ctx.restore();

  D.fillRound(ctx, 40, L.H - 76, L.W - 80, 46, 12, GOLD);
  D.text(ctx, "收起", L.W / 2, L.H - 46, "600 18px sans-serif", "#2A1E12", "center");
}

module.exports = { draw, buttons, drawRecipeList, recipeHit, closeListHit };
