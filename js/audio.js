// 音效层：WebAudio 代码合成，零素材、零加载
// 不支持时静默降级，绝不因音效崩溃
let ac = null;
let muted = false;
let unlocked = false;

function ctx() {
  if (ac === null) {
    try {
      ac = wx.createWebAudioContext ? wx.createWebAudioContext() : false;
    } catch (e) {
      ac = false;
    }
  }
  return ac || null;
}

function blip(freq, dur, type, vol) {
  if (muted) return;
  const a = ctx();
  if (!a) return;
  try {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, a.currentTime);
    g.gain.setValueAtTime(vol || 0.1, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur + 0.02);
  } catch (e) {}
}

// 上菜
function serve() {
  blip(880, 0.1, "triangle", 0.09);
  setTimeout(function () { blip(1180, 0.08, "triangle", 0.07); }, 60);
}

// 收钱
function coin(crit) {
  blip(crit ? 1568 : 1318, 0.07, "square", 0.06);
  setTimeout(function () { blip(crit ? 2093 : 1760, 0.1, "square", 0.05); }, 55);
}

// 面煮好了
function ready() {
  blip(523, 0.09, "sine", 0.08);
  setTimeout(function () { blip(784, 0.12, "sine", 0.07); }, 70);
}

// 开始煮
function start() {
  blip(392, 0.08, "sine", 0.06);
}

// 顾客离开
function leave() {
  blip(240, 0.22, "sawtooth", 0.045);
  setTimeout(function () { blip(180, 0.26, "sawtooth", 0.04); }, 90);
}

// 买建筑
function buy() {
  blip(660, 0.06, "square", 0.05);
  setTimeout(function () { blip(990, 0.09, "square", 0.045); }, 50);
}

function toggle() {
  muted = !muted;
  return muted;
}
function isMuted() {
  return muted;
}

module.exports = { serve, coin, ready, start, leave, buy, toggle, isMuted };
