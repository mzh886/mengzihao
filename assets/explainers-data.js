/* =========================================================
   EXPLAINER SERIES — content registry
   ---------------------------------------------------------
   Add a new 3D lesson by appending an object to this array.
   Set `featured: true` on the one that should fill the large
   feature card; every live episode also appears in the series
   log automatically.

   status: "live" | "soon"
   titleLines: rendered one per line; the first line is cream,
               later lines are highlighted.
   href / image: paths relative to the site root (index.html).
   ========================================================= */

window.EXPLAINER_SERIES = [
  {
    id: "2026-shanxi-physics",
    episode: "01",
    year: "2026",
    exam: "高考物理 · 陕晋青宁卷（山西）第 15 题",
    title: "复合场中的粒子轨迹",
    titleLines: ["复合场中的", "粒子轨迹"],
    summary:
      "粒子穿过小孔，在磁场中折返，被 Q 弹回，再击中 P。拖动视角、调节电压，看见两条轨迹如何随 U 改变。",
    summaryLines: [
      "粒子穿过小孔，在磁场中折返，被 Q 弹回，再击中 P。",
      "拖动视角、调节电压，看见两条轨迹如何随 U 改变。",
    ],
    href: "explainers/2026-shanxi-physics.html",
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
  // Example — add the next 3D lesson like this:
  // {
  //   id: "2027-example",
  //   episode: "02",
  //   year: "2027",
  //   exam: "高考物理 · ……",
  //   title: "下一道题的标题",
  //   titleLines: ["第一行", "高亮部分"],
  //   summary: "一句话说明这道题在 3D 里能看见什么。",
  //   href: "explainers/2027-example.html",
  //   image: "assets/explainers/2027-example-scene.webp",
  //   tags: ["3D 可旋转", "参数可调"],
  //   specs: [
  //     { label: "设问", value: "03" },
  //     { label: "轨迹", value: "02" },
  //     { label: "临界值", value: "…" },
  //   ],
  //   status: "live",
  //   featured: false,
  //   date: "2027.06",
  // },
];
