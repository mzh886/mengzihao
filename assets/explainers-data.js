/* =========================================================
   EXPLAINER SERIES — content registry
   ---------------------------------------------------------
   Add the next 3D lesson by appending one object below.
   The homepage viewer, episode bar and series log update
   automatically. Only `status: "live"` entries are shown.

   Required:
   id / episode / year / exam / title / href
   Optional:
   summary, preview, image, tags, specs, featured, date
   ========================================================= */

window.EXPLAINER_SERIES = [
  {
    id: "2026-shanxi-physics",
    episode: "01",
    year: "2026",
    exam: "高考物理 · 陕晋青宁卷（山西）第 15 题",
    title: "复合场中的粒子轨迹",
    summary: "粒子穿过小孔，在磁场中折返，被 Q 弹回，再击中 P。拖动视角、调节电压，看见两条轨迹如何随 U 改变。",
    href: "explainers/2026-shanxi-physics.html",
    preview: "assets/explainers/2026-shanxi-physics-preview.webp",
    image: "assets/explainers/2026-shanxi-physics-scene.webp",
    tags: ["3D 可旋转", "电压实时可调", "三幕拆解"],
    specs: [
      { label: "设问", value: "03" },
      { label: "轨迹", value: "02" },
      { label: "临界值", value: "8/17" },
    ],
    status: "live",
    featured: true,
    date: "2026.11",
  },

  // Next lesson — copy this skeleton when a new 3D page is ready.
  // {
  //   id: "2027-example",
  //   episode: "02",
  //   year: "2027",
  //   exam: "高考物理 · ……",
  //   title: "下一道题的标题",
  //   summary: "一句话说明这道题在 3D 里能看见什么。",
  //   href: "explainers/2027-example.html",
  //   preview: "assets/explainers/2027-example-preview.webp",
  //   image: "assets/explainers/2027-example-scene.webp",
  //   tags: ["3D 可旋转", "参数可调"],
  //   status: "live",
  //   featured: false,
  //   date: "2027.06",
  // },
];
