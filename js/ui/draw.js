// 绘制工具：所有场景共用的底层绘制原语
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fillRound(ctx, x, y, w, h, r, color) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeRound(ctx, x, y, w, h, r, color, lw) {
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 1;
  ctx.stroke();
}

function text(ctx, str, x, y, font, color, align, baseline) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align || "left";
  ctx.textBaseline = baseline || "alphabetic";
  ctx.fillText(str, x, y);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function radialGlow(ctx, cx, cy, r, color, inner) {
  const g = ctx.createRadialGradient(cx, cy, r * (inner || 0.15), cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function verticalGrad(ctx, x, y, w, h, top, bottom) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  return g;
}

function clipRect(ctx, x, y, w, h, fn) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  fn();
  ctx.restore();
}

function hexAlpha(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

module.exports = { roundRect, fillRound, strokeRound, text, radialGlow, verticalGrad, clipRect, hexAlpha };
