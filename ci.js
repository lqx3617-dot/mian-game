// ============================================================
//  无电脑上传：node ci.js
//  前置：同目录放 private.key（后台“小程序代码上传”下载的密钥）
// ============================================================
const ci = require("miniprogram-ci");
const path = require("path");

const APPID = "wx9a2959e942efff0f"; // 不是测试号那个 wx425c5d0413ba72f7

const project = new ci.Project({
  appid: APPID,
  type: "miniGame",
  projectPath: __dirname,
  privateKeyPath: path.join(__dirname, "private.key"),
  ignores: ["node_modules/**/*", "ci.js", "*.md", "qrcode.jpg", "_render.js"],
});

const VERSION = "1.0." + (process.env.BUILD_NO || "0");

(async () => {
  console.log("开始上传 " + VERSION + " ...");
  await ci.upload({
    project,
    version: VERSION,
    desc: "面馆 v" + VERSION,
    setting: { es6: true, minify: true },
    onProgressUpdate: (t) => console.log("[upload]", t && t._msg ? t._msg : t),
  });
  console.log("上传完成");

  await ci.preview({
    project,
    desc: "预览 v" + VERSION,
    setting: { es6: true, minify: true },
    qrcodeFormat: "image",
    qrcodeOutputDest: path.join(__dirname, "qrcode.jpg"),
  });
  console.log("二维码已生成：qrcode.jpg");
})().catch((e) => {
  console.error("失败：", e && e.message ? e.message : e);
  process.exit(1);
});
