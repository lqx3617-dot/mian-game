// 顶部 HUD + 顾客卡（头像 + 食材图 + 耐心条）
const D = require("./draw.js");
const kinds = require("./kinds.js");
const L2 = require("./layout.js");
const orders = require("../core/orders.js");
const config = require("../../config/balance.js");

// 顾客头像：6 张，按顾客 id 轮换
const PEOPLE = ["p1", "p2", "p3", "p4", "p5", "p6"];
const AVATARS = {};
let avInited = false;

function initAvatars() {
  if (avInited) return;
  avInited = true;
  if (typeof wx === "undefined" || !wx.createImage) return;
  PEOPLE.forEach(function (id) {
    try {
      const img = wx.createImage();
      img.onload = function () { AVATARS[id] = img; };
      img.src = "images/people/" + id + ".png";
      if (img.width > 0) AVATARS[id] = img;
    } catch (e) {}
  });
}

function avatarFor(orderId) {
  initAvatars();
  const key = PEOPLE[Math.abs(orderId) % PEOPLE.length];
  const im = AVATARS[key];
  return (im && im.width > 0) ? im : null;
}

function draw(ctx, L, T, R) {
  const g = ctx.createLinearGradient(0, 0, 0, L.hudH);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L.W, L.hudH);

  // 时间条
  const tw = L.W - 32;
  const tp = Math.max(0, R.timeLeft / config.duration);
  D.fillRound(ctx, 16, L.safeTop + 18, tw, 6, 3, D.hexAlpha("#FFFFFF", 0.12));
  D.fillRound(ctx, 16, L.safeTop + 18, Math.max(3, tw * tp), 6, 3, tp < 0.2 ? "#E2574C" : "#F2B44E");

  D.text(ctx, Math.ceil(R.timeLeft) + "s", 16, L.safeTop + 46, "600 17px sans-serif", tp < 0.2 ? "#E2574C" : T.text);

  for (let i = 0; i < config.repMax; i++) {
    const cx = 74 + i * 20;
    ctx.beginPath();
    ctx.arc(cx, L.safeTop + 41, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = i < R.rep ? "#E2574C" : D.hexAlpha("#FFFFFF", 0.14);
    ctx.fill();
  }

  if (R.combo > 1.05) {
    D.text(ctx, "x" + R.combo.toFixed(1), 16, L.safeTop + 64, "600 12px sans-serif", "#FFB347");
  }

  D.text(ctx, "¥" + Math.round(R.revenue), L.W - 16, L.safeTop + 58, "600 28px sans-serif", "#FFD07A", "right");

  // 顾客卡
  const seated = orders.seated(R.t);
  const flyingOrder = orders.flying();
  for (let i = 0; i < config.seats; i++) {
    const r = L2.custRect(L, i);
    const o = seated[i];
    const active = !!o && o.id === R.activeId && !flyingOrder;

    D.fillRound(ctx, r.x, r.y, r.w, r.h, 12, o ? D.hexAlpha("#221C16", 0.92) : D.hexAlpha("#FFFFFF", 0.035));
    if (active) {
      D.fillRound(ctx, r.x, r.y, r.w, r.h, 12, D.hexAlpha("#F2B44E", 0.10));
      D.strokeRound(ctx, r.x, r.y, r.w, r.h, 12, "#F2B44E", 2);
    } else if (o) {
      D.strokeRound(ctx, r.x, r.y, r.w, r.h, 12, D.hexAlpha("#FFFFFF", 0.08), 1);
    }

    if (!o) {
      D.text(ctx, "空位", r.x + r.w / 2, r.y + r.h / 2 + 4, T.fonts.tiny, D.hexAlpha("#8A8078", 0.55), "center");
      continue;
    }

    // 头像
    const av = avatarFor(o.id);
    const avS = 28;
    const avX = r.x + 7;
    const avY = r.y + 7;
    ctx.beginPath();
    ctx.arc(avX + avS / 2, avY + avS / 2, avS / 2, 0, Math.PI * 2);
    ctx.fillStyle = D.hexAlpha("#FFFFFF", 0.07);
    ctx.fill();
    if (av) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avX + avS / 2, avY + avS / 2, avS / 2 - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(av, avX, avY, avS, avS);
      ctx.restore();
    }

    // 三种食材（图片）
    const tagS = 20;
    const tagX0 = r.x + r.w - 7 - tagS * 3 - 3 * 2;
    for (let k = 0; k < 3; k++) {
      const kk = kinds.info(o.kinds[k]);
      const tx = tagX0 + k * (tagS + 3);
      const ty = r.y + 9;
      D.fillRound(ctx, tx, ty, tagS, tagS, 5, D.hexAlpha(kk.color, 0.16));
      const im = kinds.getImage(o.kinds[k]);
      if (im) {
        ctx.drawImage(im, tx + 1.5, ty + 1.5, tagS - 3, tagS - 3);
      } else {
        D.text(ctx, kk.tag, tx + tagS / 2, ty + tagS * 0.68, "600 11px sans-serif", D.hexAlpha(kk.color, 0.95), "center");
      }
    }

    // 耐心条
    const pr = orders.patienceRatio(o);
    const band = orders.patienceBand(o);
    const col = band === "red" ? "#E2574C" : band === "yellow" ? "#E8A33D" : "#5BD08A";
    const by = r.y + r.h - 16;
    D.fillRound(ctx, r.x + 8, by, r.w - 16, 6, 3, D.hexAlpha("#FFFFFF", 0.10));
    D.fillRound(ctx, r.x + 8, by, Math.max(4, (r.w - 16) * pr), 6, 3, col);
  }
}

module.exports = { draw };
