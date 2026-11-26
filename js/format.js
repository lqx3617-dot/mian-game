// 大数字格式化：1.2K / 3.4M / 5.6B … 一路到天文单位不卡住
const SUFFIX = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd"];

function fmt(n) {
  if (!isFinite(n)) return "∞";
  if (n < 1000) {
    if (n === Math.floor(n)) return String(n);
    return n < 100 ? n.toFixed(1) : String(Math.floor(n));
  }
  let v = n;
  let i = 0;
  while (v >= 1000 && i < SUFFIX.length - 1) {
    v /= 1000;
    i++;
  }
  return v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0) + SUFFIX[i];
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  if (m < 60) return m + " 分钟";
  const h = Math.floor(m / 60);
  return h + " 小时 " + (m % 60) + " 分";
}

module.exports = { fmt, fmtTime };
