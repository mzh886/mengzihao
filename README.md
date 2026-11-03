# 孟子皓 · 造物与问道

一个关于孟子皓的单页个人主页。原生 HTML / CSS / JavaScript，无框架、无构建步骤、无外部依赖，也可以完全离线打开。

## 打开方式

直接双击 `index.html` 即可。字体已作为 base64 子集内嵌在 `assets/fonts.css` 中，因此从本地文件打开时也不会出现字体加载失败。

如果希望通过本地 HTTP 服务预览或部署：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 页面结构

1. **原点**：星盘、身份卡与个人坐标。
2. **志趣**：八个兴趣坐标，可按「造物 / 感知 / 问道」筛选，支持详情弹窗与随机探索。
3. **道器**：八卦罗盘，把八种古老目光转译成当代工程语境。
4. **木塔**：应县木塔的独立 3D 档案，与题解实验室并列的一级项目板块。
5. **题解**：数据驱动的 3D 题解系列，当前为 EP.01「2026 山西物理压轴题 · 复合场中的粒子轨迹」。
6. **电波**：身份卡复制、页面分享与结尾。

「木塔」和「题解」使用同一套项目卡片规格，并共享一个全屏 3D 展台：点击项目卡片即可在页内打开对应的独立 3D 页面，也可以从展台右上角单独打开；关闭后回到原页面。没有 JavaScript 时，卡片会直接作为链接打开独立页面。

## 文件结构

```text
index.html                           页面结构、六个板块与全部文案
assets/style.css                     原深色视觉系统、响应式布局与动画
assets/project-viewer.css            木塔暖色强调与全屏 3D 展台
assets/fonts.css                     内嵌再子集化的思源宋体 / 思源黑体
assets/main.js                       星盘、粒子场、弹窗、筛选、八卦、题解板块等交互
assets/project-viewer.js             两个项目共用的全屏 3D iframe 展台
assets/explainers-data.js            3D 题解系列的数据登记表
assets/explainers/                   3D 题解场景与预览图
assets/pagoda-feature.webp           首页木塔项目卡片图
assets/pagoda-preview.webp           木塔 3D 页面分享图
explainers/2026-shanxi-physics.html  首期 3D 题解的完整页面
pagoda/                              应县木塔 3D 木构档案（独立页面）
preview.jpg                          旧版页面预览图
FONT-LICENSE.txt                     Noto CJK 字体授权（SIL Open Font License 1.1）
```

`pagoda/` 使用扁平结构：`index.html`、`style.css`、`data.js`、`scene.js`、`app.js`、`three.min.js`。木塔页面内部的「个人主页」链接会以 `_top` 回到本页 `#pagoda`。

## 添加下一道 3D 题解

题解板块是数据驱动的，不需要改首页结构。添加新一期时：

1. 把新的 3D 讲解页放进 `explainers/`，例如 `explainers/2027-example.html`。页面顶部可以复制首期页面的「返回个人主页」链接。
2. 把 16:9 或方形预览图放进 `assets/explainers/`，推荐 WebP。
3. 打开 `assets/explainers-data.js`，按文件里的示例追加一项：

```js
{
  id: "2027-example",
  episode: "02",
  year: "2027",
  exam: "高考物理 · ……",
  title: "题目名称",
  titleLines: ["标题第一行", "高亮第二行"],
  summaryLines: ["第一段说明。", "第二段说明。"],
  href: "explainers/2027-example.html",
  image: "assets/explainers/2027-example-scene.webp",
  tags: ["3D 可旋转", "参数可调"],
  specs: [
    { label: "设问", value: "03" },
    { label: "轨迹", value: "02" },
    { label: "临界值", value: "…" }
  ],
  status: "live",
  featured: false,
  date: "2027.06"
}
```

4. 把想要主推的一期设为 `featured: true`；所有 `status: "live"` 的条目会自动出现在系列进度里，数量也会同步更新。
5. 重新部署后即可访问。

## 修改指南

- **基本文案**：都在 `index.html` 里，按注释和区块名称搜索即可。
- **木塔板块**：结构在 `index.html` 的 `#pagoda`，视觉强调色在 `assets/project-viewer.css` 的 `.pagoda` 规则内。
- **全屏 3D 展台**：`assets/project-viewer.js`；任何带 `data-project` 的项目卡片，或页内 `.series-row`，都会自动接入。
- **兴趣详情与八卦解读**：`assets/main.js` 顶部的 `interestData` 和 `daoData`。
- **色彩与排版**：`assets/style.css` 开头的 `:root` 变量。主强调色是 `--signal`，题解次级强调色是 `--lab`，木塔板块在 `project-viewer.css` 中覆盖为暖金色。
- **联系方式**：联系区目前使用「复制身份卡」和「分享此页」，没有放虚构的邮箱或社交账号。要补真实邮箱 / 微信，可以在 `index.html` 的 `contact-actions` 中新增链接。

字体是从本机 Noto CJK 字体中提取的当前页面字符子集。若未来加入大量新文字，个别新字符会自动回退到系统字体；需要完全一致时可替换 `assets/fonts.css` 中的字体数据。

## 兼容性

已在 Chromium / Edge 中验证，覆盖桌面与 390 / 320 像素窄屏。使用了 `IntersectionObserver`、CSS 变量、`clip-path`、`color-mix()`、Web Animations API 等现代特性；建议使用较新的 Chrome、Edge、Safari 或 Firefox。

## 字体授权

Noto Serif SC / Noto Sans SC 由 Google 与 Adobe 开发，采用 SIL Open Font License 1.1 授权。授权全文见 `FONT-LICENSE.txt`。
