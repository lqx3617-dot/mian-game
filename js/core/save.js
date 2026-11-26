// 存档：金币 / 等级 / 菜谱 / 战绩
const KEY = "kaitan_save_v1";

const DEFAULT = {
  v: 1,
  coins: 0,
  level: 1,
  totalServed: 0,
  totalRevenue: 0,
  bestStars: {},
  rounds: 0,
  todayKey: "",
  todayServed: 0,
};

function today() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function load() {
  let raw = null;
  try {
    raw = wx.getStorageSync(KEY);
  } catch (e) {
    raw = null;
  }
  const S = Object.assign({}, DEFAULT, { bestStars: {} });
  if (!raw || typeof raw !== "object") {
    S.todayKey = today();
    return S;
  }
  try {
    S.coins = Math.max(0, Math.floor(Number(raw.coins) || 0));
    S.level = Math.min(20, Math.max(1, Math.floor(Number(raw.level) || 1)));
    S.totalServed = Math.max(0, Math.floor(Number(raw.totalServed) || 0));
    S.totalRevenue = Math.max(0, Number(raw.totalRevenue) || 0);
    S.rounds = Math.max(0, Math.floor(Number(raw.rounds) || 0));
    if (raw.bestStars && typeof raw.bestStars === "object") S.bestStars = raw.bestStars;
    S.todayKey = raw.todayKey || today();
    S.todayServed = Math.max(0, Math.floor(Number(raw.todayServed) || 0));
    if (S.todayKey !== today()) {
      S.todayKey = today();
      S.todayServed = 0;
    }
  } catch (e) {
    try { wx.setStorageSync(KEY + "_backup", raw); } catch (e2) {}
  }
  return S;
}

function save(S) {
  try {
    wx.setStorageSync(KEY, {
      v: 1,
      coins: S.coins,
      level: S.level,
      totalServed: S.totalServed,
      totalRevenue: S.totalRevenue,
      bestStars: S.bestStars,
      rounds: S.rounds,
      todayKey: S.todayKey,
      todayServed: S.todayServed,
    });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { load, save, KEY, today };
