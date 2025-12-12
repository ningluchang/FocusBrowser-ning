# VOID: A Minimalist Self-Discipline Browser 🧘‍♂️🚫🧠

> “当你忘记你已经自律了多少天，那才是真正的自由。”

VOID 是一款极简、不可破防、自律优先的 Android 浏览器，适合那些渴望减少诱惑、创造专注空间的人。

它不是浏览器的替代品，而是你内心「守门人」。

---

## ✨ 功能特色

- 🔒 自定义网址黑名单，一键锁定
- 🚫 锁定后不可更改、无提前解锁方式
- ⏳ 按时长倒计时自动解锁（支持1小时/1天/7天 等）
- 📃 支持关键词搜索 / 正常网页访问（Bing/百度/谷歌引擎）
- 📋 历史记录可清除、可回访
- 💬 每次拦截显示一条鼓励语（可定制）
- 🧘‍♂️ 极简 UI，无广告、无分心元素

---

## 📦 环境要求

| 工具或平台 | 版本 |
|------------|------|
| Node.js    | `20.19.6`（推荐用 nvm 固定） |
| React Native | `0.82.1` |
| React         | `19.1.1` |
| 包管理器       | [`pnpm`](https://pnpm.io/) |

---

## 🧰 快速开始开发（开发者）

安装依赖：
```bash
pnpm install
```

打包 APK:
```bash
cd android
./gradlew assembleRelease
```

打包成功后可在：`android/app/build/outputs/apk/release/app-release.apk` 找到

📚 License

本项目 currently holds **All Rights Reserved** by the author.  
请勿用于商业行为，后续可能开放开源协议。
ningluchang17@gmail.com