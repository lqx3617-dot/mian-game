// 《今晚开摊》数值表：与策划案第 6 章一致
module.exports = {
  // 单局
  duration: 90,          // 一局 90 秒
  beltLen: 12,           // 传送带格数
  shiftEvery: 5.0,       // 每 5 秒补一次（原 6 秒，首单一单太慢）
  shiftAdd: 3,           // 每次补 3 根
  slots: 3,              // 夹子槽
  patience: 45,          // 顾客耐心
  seats: 3,              // 席位
  arrivals: [0, 18, 36, 54, 72],

  // 收益
  price: 12,             // 一级菜品单价
  patienceGreen: 1.0,
  patienceYellow: 0.7,
  patienceRed: 0.4,
  patienceYellowAt: 25,
  patienceRedAt: 38,
  comboStep: 0.1,
  comboMax: 1.5,
  comboWindow: 10,
  perfectBonus: 0.2,

  // 星级
  star1: 10,
  star2: 26,
  star3: 38,

  disturb: 0.10,            // 补给里混入无关食材的比例（原 0.25）

  // 口碑
  repMax: 3,

  // 操作耗时
  grabTime: 1.1,
  placeTime: 0.7,

  // 食材：前 8 种是开局面孔，后面按等级解锁（案子：6 级 10 种、13 级 12 种）
  kinds: [
    { id: "beef",   name: "牛肉", color: "#C2503E", tag: "牛", lv: 1 },
    { id: "corn",   name: "玉米", color: "#E8B93F", tag: "玉", lv: 1 },
    { id: "rice",   name: "年糕", color: "#EDE3D0", tag: "糕", lv: 1 },
    { id: "shrooms",name: "香菇", color: "#8A6A4E", tag: "菇", lv: 1 },
    { id: "wing",   name: "鸡翅", color: "#D98A45", tag: "翅", lv: 1 },
    { id: "tofu",   name: "豆皮", color: "#C9B67A", tag: "皮", lv: 1 },
    { id: "chive",  name: "韭菜", color: "#5E9C55", tag: "韭", lv: 1 },
    { id: "shrimp", name: "虾",   color: "#E5766A", tag: "虾", lv: 1 },
    // 6 级解锁
    { id: "lotus",  name: "藕片", color: "#E4D7BE", tag: "藕", lv: 6 },
    { id: "enoki",  name: "金针菇", color: "#F0E3A8", tag: "金", lv: 6 },
    // 13 级解锁
    { id: "wide",   name: "宽粉", color: "#DCD0B8", tag: "粉", lv: 13 },
    { id: "fishball", name: "鱼丸", color: "#F2EDE4", tag: "丸", lv: 13 },
    { id: "crab",   name: "蟹棒", color: "#F08C6E", tag: "蟹", lv: 13 },
    { id: "lunch",  name: "午餐肉", color: "#DD8E8E", tag: "餐", lv: 13 },
  ],
};