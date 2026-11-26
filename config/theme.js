// 主题层：三套皮肤，所有颜色 / 字体 / 圆角 / 骨架风格都在这里
// 切皮肤只需改 ACTIVE，绘制层会自动跟着变
const THEMES = {
  // ── A. 深夜食摊：暖黄灯光、暗背景、卡片式菜单板
  night: {
    id: "night",
    name: "深夜食摊",
    bg: "#0F0D0B",
    bgTop: "#221A12",
    bgBottom: "#0A0806",
    panel: "#1E1A16",
    panelAlt: "#141110",
    line: "#352C24",
    accent: "#FFC65C",
    accent2: "#FF7A45",
    crit: "#FF8A3D",
    text: "#F7F0E6",
    dim: "#9C8F82",
    ok: "#5BD08A",
    onAccent: "#2B1B08",
    radius: 14,
    bowl: "lamp",
    list: "card",
    fonts: {
      huge: "bold 42px sans-serif",
      num: "bold 17px sans-serif",
      title: "bold 15px sans-serif",
      body: "13px sans-serif",
      tiny: "11px sans-serif",
    },
    glow: 0.24,
    shakeScale: 1,
  },

  // ── B. 街机房：高饱和霓虹、硬边方块、发光描边
  arcade: {
    id: "arcade",
    name: "街机房",
    bg: "#0B0016",
    bgTop: "#25063F",
    bgBottom: "#07000F",
    panel: "#1C0A31",
    panelAlt: "#120024",
    line: "#3E1A69",
    accent: "#00E5FF",
    accent2: "#FF2E88",
    crit: "#FF2E88",
    text: "#F0E6FF",
    dim: "#8E7BB0",
    ok: "#3DFF9E",
    onAccent: "#0B0016",
    radius: 6,
    bowl: "arcade",
    list: "tile",
    fonts: {
      huge: "bold 42px sans-serif",
      num: "bold 17px sans-serif",
      title: "bold 15px sans-serif",
      body: "13px sans-serif",
      tiny: "11px sans-serif",
    },
    glow: 0.5,
    shakeScale: 1.4,
  },

  // ── C. 记账本：米白纸、细线、朱红点缀、衬线数字
  paper: {
    id: "paper",
    name: "记账本",
    bg: "#F3EEE4",
    bgTop: "#FBF8F2",
    bgBottom: "#E7DFD0",
    panel: "#FBF8F2",
    panelAlt: "#F0EADC",
    line: "#D6CCBA",
    accent: "#C8402F",
    accent2: "#1F1B16",
    crit: "#C8402F",
    text: "#1F1B16",
    dim: "#8A8070",
    ok: "#3F7A4F",
    onAccent: "#FBF8F2",
    radius: 3,
    bowl: "line",
    list: "table",
    fonts: {
      huge: "bold 40px serif",
      num: "bold 16px serif",
      title: "bold 15px serif",
      body: "13px serif",
      tiny: "11px serif",
    },
    glow: 0,
    shakeScale: 0.6,
  },
};

// 已选定：A 深夜食摊。想试别的皮肤，把这里改成 "arcade" 或 "paper" 即可，
// 三套骨架都实现了，不需要改任何绘制代码。
const ACTIVE = "night";

module.exports = { THEMES, ACTIVE };