# 孟子皓 · 造物与问道

一个静态的个人主页，也是一间可以慢慢翻看的数字展厅。

页面以「纸、墨、朱砂」为视觉基调：太极、八卦、道家引文是线索，工程与创作是主体。没有框架、没有构建步骤，直接打开 `index.html` 即可。

## 页面结构

| 章节 | 内容 |
| --- | --- |
| 01 原点 | 自我介绍、身份卡、三条做事原则 |
| 02 志趣 | 八种兴趣坐标，可筛选、悬停预览、打开详情 |
| 03 道器 | 八卦互动罗盘，把八种古老目光对应到工程方法 |
| 04 木构档案 | 独立的应县木塔 3D 展厅，内嵌完整交互页面 |
| 05 题解实验室 | 3D 题解系列，当前 EP.01，支持继续添加 |
| 06 电波 | 复制身份卡、分享页面、页脚信息 |

两个 3D 展厅都采用「海报 → 点击进入」的方式加载 iframe，避免页面初次打开就加载两套 3D 场景；同时在窗口条上保留「独立打开」和「全屏」入口。

## 文件结构

```text
.
├── index.html
├── assets/
│   ├── style.css
│   ├── main.js
│   ├── fonts.css              # 自托管 Noto 字体子集（base64 woff2）
│   ├── explainers-data.js     # 题解系列内容登记表
│   ├── pagoda-preview.webp
│   └── explainers/
│       ├── 2026-shanxi-physics-preview.webp
│       └── 2026-shanxi-physics-scene.webp
├── explainers/
│   └── 2026-shanxi-physics.html
└── pagoda/
    ├── index.html
    ├── style.css
    ├── data.js
    ├── scene.js
    ├── app.js
    └── three.min.js
```

## 添加下一道 3D 题解

1. 把新的独立讲解页放进 `explainers/`，例如 `2027-example.html`。
2. 把预览图放进 `assets/explainers/`，建议使用和现有展厅一致的 1302 × 790 截图。
3. 在 `assets/explainers-data.js` 的数组中追加一条：

```js
{
  id: "2027-example",
  episode: "02",
  year: "2027",
  exam: "高考物理 · ……",
  title: "下一道题的标题",
  summary: "一句话说明这道题在 3D 里能看见什么。",
  href: "explainers/2027-example.html",
  preview: "assets/explainers/2027-example-preview.webp",
  image: "assets/explainers/2027-example-scene.webp",
  tags: ["3D 可旋转", "参数可调"],
  status: "live",
  featured: false,
  date: "2027.06"
}
```

首页的展厅、期号、标题、海报和系列进度会自动更新；不需要改 HTML 或 CSS。

## 修改木塔档案

木塔页面被完整保留为一个独立应用，位于 `pagoda/`。页面里的标签页、拆解滑杆、剖视模式、关于此塔与斗拱解剖也都保留。外层主页只负责提供展厅入口、上下文和独立打开链接。

如需调整首页木塔段落，修改 `index.html` 的 `#pagoda` 区块；如需调整 3D 页面本身，修改 `pagoda/` 中的对应文件。

## 字体与素材

- 页面字体为本地子集的 Noto Serif SC / Noto Sans SC，授权见 `FONT-LICENSE.txt`。
- 木塔页面使用 Three.js，授权信息保留在 `pagoda/three.min.js` 中。
- 木塔的模型与说明源自 `yingxian-pagoda` 项目；三维模型是程序化艺术复原，非测绘数据。
- 页面没有外部图片或 CDN 依赖；两张项目海报以 WebP 存储。
