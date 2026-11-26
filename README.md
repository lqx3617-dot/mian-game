# 深夜面馆 · 2D 放置经营小游戏

微信小游戏，纯 Canvas，无第三方依赖，无内购，面向 IAA 广告变现。

## 玩法

- 顾客进店坐下，头顶冒需求气泡，带耐心条倒计时
- 点灶台煮面（1.3 秒），煮好后点顾客上菜
- 顾客等太久会生气离开（不给钱）
- 上菜有连击加成，12% 概率爆单 3 倍
- 六种建筑自动产出，离线最多结算 2 小时

## 结构

    game.js              入口，只做组装
    config/balance.js    全部数值
    config/theme.js      三套皮肤 + ACTIVE 开关
    js/audio.js          WebAudio 合成音效（零素材）
    js/core/             storage / economy / state / loop / restaurant
    js/ui/               draw / layout / scene / input / fx / header / shop / modal / restaurant

## 上传

推送到 main 分支后，GitHub Actions 自动跑 miniprogram-ci 上传，
并把预览二维码提交回仓库根目录的 qrcode.jpg。