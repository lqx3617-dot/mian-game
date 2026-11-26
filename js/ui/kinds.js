// 食材图标：优先用图片（Twemoji，CC-BY 4.0），加载失败回落色块+字
const config = require("../../config/balance.js");
const D = require("./draw.js");

const MAP = {};
config.kinds.forEach(function (k) { MAP[k.id] = k; });

const IMGS = {};
let inited = false;

function init() {
  if (inited) return;
  inited = true;
  if (typeof wx === "undefined" || !wx.createImage) return;
  config.kinds.forEach(function (k) {
    try {
      const img = wx.createImage();
      img.onload = function () { IMGS[k.id] = img; };
      img.onerror = function () {};
      img.src = "images/food/" + k.id + ".png";
      // 同步加载的环境（本地渲染）不会触发 onload，这里补一次
      if (img.width > 0) IMGS[k.id] = img;
    } catch (e) {}
  });
}

function info(id) {
  return MAP[id] || config.kinds[0];
}

function hasImage(id) {
  const im = IMGS[id];
  return !!(im && im.width > 0);
}

// mode: filled（已放） / empty（需求态） / ghost（袋子里的）
function draw(ctx, kindId, x, y, s, mode, T) {
  init();
  const k = info(kindId);
  const r = Math.max(4, s * 0.18);
  const img = IMGS[kindId];

  if (mode === "filled") {
    if (img && img.width > 0) {
      ctx.drawImage(img, x + s * 0.04, y + s * 0.04, s * 0.92, s * 0.92);
    } else {
      D.fillRound(ctx, x, y, s, s, r, k.color);
      D.text(ctx, k.tag, x + s / 2, y + s * 0.64, "bold " + Math.round(s * 0.44) + "px sans-serif", "#2A1E12", "center");
    }
    return;
  }

  if (mode === "empty") {
    // 需求态：20% 底色 + 虚线框 + 中央图标
    D.fillRound(ctx, x, y, s, s, r, D.hexAlpha(k.color, 0.18));
    if (img && img.width > 0) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, x + s * 0.16, y + s * 0.16, s * 0.68, s * 0.68);
      ctx.globalAlpha = 1;
    } else {
      D.text(ctx, k.tag, x + s / 2, y + s * 0.58, "bold " + Math.round(s * 0.4) + "px sans-serif", D.hexAlpha(k.color, 0.9), "center");
    }
    // 虚线描边
    const rr = Math.min(r, s / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + s, y, x + s, y + s, rr);
    ctx.arcTo(x + s, y + s, x, y + s, rr);
    ctx.arcTo(x, y + s, x, y, rr);
    ctx.arcTo(x, y, x + s, y, rr);
    ctx.closePath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = D.hexAlpha(k.color, 0.8);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  // ghost
  if (img && img.width > 0) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(img, x, y, s, s);
    ctx.globalAlpha = 1;
  } else {
    D.fillRound(ctx, x, y, s, s, r, D.hexAlpha(k.color, 0.3));
  }
}

function getImage(id) {
  init();
  const im = IMGS[id];
  return (im && im.width > 0) ? im : null;
}

module.exports = { draw, info, MAP, init, getImage };
