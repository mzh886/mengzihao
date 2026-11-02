# 孟子皓 · 造物与问道

![页面预览](preview.jpg)

一个关于孟子皓的单页个人主页。原生 HTML / CSS / JavaScript，无框架、无构建步骤、无外部依赖，也可以完全离线打开。

## 打开方式

直接双击 `index.html` 即可。

字体已作为 base64 子集内嵌在 `assets/fonts.css` 中，因此从本地文件打开时也不会出现字体加载失败。页面没有引用任何外部图片、CDN 或网络接口。

如果希望通过本地 HTTP 服务预览或部署：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 可以玩的地方

- **互动星盘**：拖动旋转，点击中心依次切换「造物者 / 问道者 / 游戏者」。
- **八个兴趣坐标**：按「造物 / 感知 / 问道」筛选，点击卡片打开详情弹窗；弹窗里可以跳到相邻坐标。
- **随机探索**：按键盘 `R`，或点击「随机打开一个兴趣」。
- **八卦罗盘**：点击任意卦象、使用左右按钮或键盘方向键，切换八卦与当代工程语境的对应解读。
- **身份卡**：复制身份卡信息，或通过系统分享 / 复制链接分享页面。
- **移动端**：独立菜单、触摸友好的布局；窄屏下星盘提示会切换为「TAP THE CORE」。
- **降低动态效果**：遵循系统的 `prefers-reduced-motion` 设置。

## 文件结构

```
index.html             页面结构与全部文案
assets/style.css       视觉系统、响应式布局、动画
assets/fonts.css       内嵌再子集化的思源宋体 / 思源黑体（Noto Serif/Sans SC）
assets/main.js         星盘、粒子场、弹窗、筛选、八卦等交互
preview.jpg            页面预览图
FONT-LICENSE.txt       Noto CJK 字体授权（SIL Open Font License 1.1）
```

## 修改指南

- **基本文案**：都在 `index.html` 里，按注释和区块名称搜索即可。
- **兴趣详情与八卦解读**：`assets/main.js` 顶部的 `interestData` 和 `daoData`。
- **色彩与排版**：`assets/style.css` 开头的 `:root` 变量。主强调色是 `--signal`，次强调色是 `--sage`。
- **联系方式**：联系区目前使用「复制身份卡」和「分享此页」，没有放虚构的邮箱或社交账号。要补真实邮箱 / 微信，可以在 `index.html` 的 `contact-actions` 中新增链接。

字体是从本机 Noto CJK 字体中提取的当前页面字符子集，以保证离线体积较小。若未来加入大量新文字，个别新字符会自动回退到系统字体；需要完全一致时可替换 `assets/fonts.css` 中的字体数据。

## 兼容性

已在 Chromium / Edge 中验证，覆盖 1440、1024、768、390、320 像素宽度。使用了 `IntersectionObserver`、CSS 变量、`clip-path`、`color-mix()`、Web Animations API 等现代特性；建议使用较新的 Chrome、Edge、Safari 或 Firefox。

## 字体授权

Noto Serif SC / Noto Sans SC 由 Google 与 Adobe 开发，采用 SIL Open Font License 1.1 授权。授权全文见 `FONT-LICENSE.txt`。
