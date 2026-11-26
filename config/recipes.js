// 20 道菜谱：越往后的菜用到越高等级才解锁的食材
const K = {
  beef: "beef", corn: "corn", rice: "rice", shrooms: "shrooms",
  wing: "wing", tofu: "tofu", chive: "chive", shrimp: "shrimp",
  lotus: "lotus", enoki: "enoki", wide: "wide",
  fishball: "fishball", crab: "crab", lunch: "lunch",
};

const RECIPES = [
  // ── 1-2 级：只用开局 8 种
  { id: "r01", name: "清汤面",     lv: 1,  kinds: [K.beef, K.corn, K.rice],       mul: 1.00 },
  { id: "r02", name: "双拼面",     lv: 1,  kinds: [K.beef, K.shrooms, K.chive],   mul: 1.00 },
  { id: "r03", name: "素三样",     lv: 2,  kinds: [K.tofu, K.chive, K.corn],      mul: 1.03 },
  { id: "r04", name: "香菇鸡",     lv: 2,  kinds: [K.shrooms, K.wing, K.rice],    mul: 1.04 },

  // ── 3-5 级：还是 8 种，但组合更刁
  { id: "r05", name: "虾滑面",     lv: 3,  kinds: [K.shrimp, K.tofu, K.chive],    mul: 1.06 },
  { id: "r06", name: "玉米浓汤面", lv: 3,  kinds: [K.corn, K.rice, K.tofu],       mul: 1.07 },
  { id: "r07", name: "鸡翅年糕",   lv: 4,  kinds: [K.wing, K.rice, K.shrooms],    mul: 1.09 },
  { id: "r08", name: "麻辣烫",     lv: 4,  kinds: [K.wing, K.chive, K.tofu],      mul: 1.10 },
  { id: "r09", name: "虾兵蟹将",   lv: 5,  kinds: [K.shrimp, K.beef, K.chive],    mul: 1.12 },
  { id: "r10", name: "全家福",     lv: 5,  kinds: [K.beef, K.shrimp, K.wing],     mul: 1.13 },

  // ── 6 级起：藕片、金针菇登场
  { id: "r11", name: "藕片菌菇锅", lv: 6,  kinds: [K.lotus, K.enoki, K.shrooms],  mul: 1.15 },
  { id: "r12", name: "脆藕牛腩面", lv: 7,  kinds: [K.lotus, K.beef, K.rice],      mul: 1.17 },
  { id: "r13", name: "金针肥牛",   lv: 8,  kinds: [K.enoki, K.beef, K.chive],     mul: 1.19 },
  { id: "r14", name: "双菇会",     lv: 9,  kinds: [K.shrooms, K.enoki, K.tofu],   mul: 1.21 },
  { id: "r15", name: "藕夹双拼",   lv: 10, kinds: [K.lotus, K.wing, K.shrimp],    mul: 1.23 },
  { id: "r16", name: "金菇虾滑",   lv: 11, kinds: [K.enoki, K.shrimp, K.rice],    mul: 1.25 },
  { id: "r17", name: "老客特调",   lv: 12, kinds: [K.lotus, K.enoki, K.wing],     mul: 1.27 },

  // ── 13 级起：宽粉、鱼丸、蟹棒、午餐肉
  { id: "r18", name: "宽粉肥牛",   lv: 13, kinds: [K.wide, K.beef, K.chive],      mul: 1.30 },
  { id: "r19", name: "鱼丸蟹棒锅", lv: 15, kinds: [K.fishball, K.crab, K.corn],   mul: 1.34 },
  { id: "r20", name: "收摊绝唱",   lv: 18, kinds: [K.lunch, K.crab, K.wide],      mul: 1.40 },
];

// 同一单里若出现重复食材，换成同池的其他食材
function normalize(recipe) {
  const pool = ["beef", "corn", "rice", "shrooms", "wing", "tofu", "chive", "shrimp", "lotus", "enoki", "wide", "fishball", "crab", "lunch"];
  const seen = [];
  const out = [];
  for (let i = 0; i < recipe.kinds.length; i++) {
    let k = recipe.kinds[i];
    if (seen.indexOf(k) >= 0) {
      k = pool.find(function (x) { return seen.indexOf(x) < 0; });
    }
    seen.push(k);
    out.push(k);
  }
  return Object.assign({}, recipe, { kinds: out });
}

const CLEAN = RECIPES.map(normalize);

function unlocked(level) {
  return CLEAN.filter(function (r) { return r.lv <= level; });
}

function pick(level) {
  const pool = unlocked(level);
  if (pool.length === 0) return CLEAN[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { RECIPES: CLEAN, unlocked, pick };
