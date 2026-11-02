/* =========================================================
   MENG ZIHAO — interaction layer
   ========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const hasWAAPI = "animate" in Element.prototype;

  const body = document.body;
  const loader = $("#loader");
  const loaderCount = $("#loaderCount");
  const loaderBar = $("#loaderBar");
  const header = $("#siteHeader");
  const progressBar = $("#progressBar");
  const clock = $("#clock");
  const footerClock = $("#footerClock");

  /* ---------------------------------------------------------
     content: eight coordinates
     --------------------------------------------------------- */

  const interestData = {
    mcu: {
      num: "01",
      title: "单片机",
      en: "Embedded Systems",
      category: "MAKE · 造物",
      accent: "#ff5b35",
      glyph: "芯",
      desc:
        "喜欢看代码穿过芯片，变成灯、声音和动作。单片机大概是最接近「造物」的入口：一行代码下去，现实世界真的会回应你。",
      why:
        "它把抽象的代码变成可触摸的反馈。从 GPIO、传感器到电机，每个小模块都像一块乐高，等着被拼成有生命的系统。",
      next:
        "从开发板和传感器起步，慢慢补嵌入式 C、电路基础与 PCB，希望做一块真正属于自己的小控制板。",
      tags: ["嵌入式 C", "GPIO / 传感器", "电路基础", "PCB"],
      links: ["threed", "game"],
    },
    ai: {
      num: "02",
      title: "人工智能",
      en: "Artificial Intelligence",
      category: "MAKE · 造物",
      accent: "#ff5b35",
      glyph: "智",
      desc:
        "对「机器如何学会理解」着迷。关注神经网络、生成模型与多模态，想亲手训练出一点真正有趣、也真正有用的东西。",
      why:
        "它像一种新的语言：人类用数据描述世界，模型从里面长出规律。最吸引我的，是那些既合理又出乎意料的瞬间。",
      next:
        "补数学与代码的底子，从经典模型和开源项目入手，尝试把 AI 做成能放进具体场景里的小工具。",
      tags: ["神经网络", "生成模型", "多模态", "学习原理"],
      links: ["threed", "mcu"],
    },
    threed: {
      num: "03",
      title: "三维建模",
      en: "3D Modelling",
      category: "MAKE · 造物",
      accent: "#ff5b35",
      glyph: "维",
      desc:
        "喜欢在软件里搭建现实不存在的东西。从硬表面到场景光影，享受把一个世界从线框一点点推到成片的过程。",
      why:
        "建模是另一种写代码：每个顶点、材质和光都参与叙事。它同时需要结构感和审美直觉，刚好是我喜欢的那种平衡。",
      next:
        "继续练习硬表面与场景搭建，研究材质、灯光和镜头，把想象中的空间做成可以进入的画面。",
      tags: ["硬表面", "场景搭建", "材质 / 光影", "渲染"],
      links: ["game", "ai"],
    },
    game: {
      num: "04",
      title: "独立游戏",
      en: "Indie Game Development",
      category: "MAKE · 造物",
      accent: "#ff5b35",
      glyph: "游",
      desc:
        "独立游戏是代码、美术、叙事与规则的交汇处。想做一个能把东方神话装进玩法里的小宇宙，让玩家在规则里遇见故事。",
      why:
        "游戏是少数能把技术、视觉、音乐和情感全部放进同一个容器的媒介。它不只是被观看，而是邀请人去行动。",
      next:
        "从很小的原型开始，摸清引擎、玩法循环和关卡节奏，然后做一个真的能玩、也真的有人愿意玩下去的作品。",
      tags: ["玩法原型", "游戏引擎", "叙事设计", "东方神话"],
      links: ["myth", "threed"],
    },
    video: {
      num: "05",
      title: "视频剪辑",
      en: "Video Editing",
      category: "SEE · 感知",
      accent: "#e8dfcb",
      glyph: "剪",
      desc:
        "相信节奏是第二叙事。喜欢把素材重新排列，让画面与音乐在某个瞬间同时击中，把时间剪成一种情绪。",
      why:
        "剪辑是在做选择：留下什么、删掉什么、什么时候呼吸。它很像工程里的减法，只不过目标是让感受变得更准确。",
      next:
        "继续练习节奏、声音和色彩，把拍摄与剪辑连成完整的表达，而不是只停留在技术操作。",
      tags: ["节奏", "叙事", "声音设计", "调色"],
      links: ["photo", "game"],
    },
    photo: {
      num: "06",
      title: "摄影",
      en: "Photography",
      category: "SEE · 感知",
      accent: "#e8dfcb",
      glyph: "光",
      desc:
        "习惯带着相机观察日常。比起打卡式的记录，更在意光线落在物体上的那一秒，以及画面里没有说出口的部分。",
      why:
        "镜头会让人慢下来。它要求你在一个普通场景里找到结构、秩序和情绪，这种训练也会悄悄反哺设计和技术。",
      next:
        "多拍、多回头看，找到自己真正想记录的母题；继续理解光、构图与色彩，也保留偶然和失误。",
      tags: ["光线", "构图", "街拍 / 日常", "色彩"],
      links: ["video", "myth"],
    },
    myth: {
      num: "07",
      title: "神话研究",
      en: "Mythology Studies",
      category: "ASK · 问道",
      accent: "#bccbae",
      glyph: "山海",
      desc:
        "从《山海经》到希腊史诗，收集人类反复讲述的原型与隐喻，再把它们拆解成可以继续生长的创作素材。",
      why:
        "神话不是过时的故事，而是人类最早的世界模型。它保存了关于恐惧、欲望、秩序和未知的答案，也留下很多没有答案的入口。",
      next:
        "沿着主题阅读，梳理不同文化中的重复母题；试着把神话的叙事结构放进游戏、影像和三维场景里。",
      tags: ["《山海经》", "原型批评", "比较神话", "叙事"],
      links: ["game", "tao"],
    },
    tao: {
      num: "08",
      title: "道教文化",
      en: "Taoist Culture",
      category: "ASK · 问道",
      accent: "#bccbae",
      glyph: "道",
      desc:
        "读《道德经》，也读道教文化中的宇宙观与修炼想象。不是寻找标准答案，而是练习换一种尺度看世界。",
      why:
        "道教文化里有一种特别的目光：它同时承认秩序与变化、可名与不可名。它提醒我，把问题拆开之后，也要为不可解的部分留一点位置。",
      next:
        "继续读原典与注释，把道德经、八卦、丹道等概念放回历史脉络里理解；也把这种目光带进工程与创作。",
      tags: ["《道德经》", "八卦", "宇宙观", "留白"],
      links: ["myth", "mcu"],
    },
  };

  const daoData = {
    qian: {
      num: "01",
      symbol: "☰",
      name: "乾",
      pinyin: "QIAN",
      theme: "创造",
      desc:
        "从无到有，先把东西做出来。世界也许不会因为一个想法改变，但会被一个真正跑起来的原型轻轻推动。",
      tech: "游戏原型 · 硬件立项 · 从 0 到 1",
    },
    dui: {
      num: "02",
      symbol: "☱",
      name: "兑",
      pinyin: "DUI",
      theme: "连接",
      desc:
        "把自己打开，让不同的频率互相听见。好的作品往往不是独白，而是一场刚刚好的共振。",
      tech: "交互设计 · 用户反馈 · 协作",
    },
    li: {
      num: "03",
      symbol: "☲",
      name: "离",
      pinyin: "LI",
      theme: "洞察",
      desc:
        "看清结构，也看清光落在哪里。表达不是装饰，而是让复杂的东西突然变得可以理解。",
      tech: "数据可视化 · 影像表达 · 调试",
    },
    zhen: {
      num: "04",
      symbol: "☳",
      name: "震",
      pinyin: "ZHEN",
      theme: "启动",
      desc:
        "真正的开始，往往只需要一次通电。先让事情发生，再在噪声里慢慢找到秩序。",
      tech: "第一行代码 · 第一次点亮 · 快速试错",
    },
    xun: {
      num: "05",
      symbol: "☴",
      name: "巽",
      pinyin: "XUN",
      theme: "渗透",
      desc:
        "用持续的小改动，进入系统的缝隙。最柔软的方式，有时最能改变一个庞然大物。",
      tech: "迭代优化 · 渐进式改造 · 更新",
    },
    kan: {
      num: "06",
      symbol: "☵",
      name: "坎",
      pinyin: "KAN",
      theme: "深潜",
      desc:
        "在问题最深的地方保持耐心。真正难的部分通常藏在表面之下，也最值得多待一会儿。",
      tech: "Debug · 底层原理 · 数学基础",
    },
    gen: {
      num: "07",
      symbol: "☶",
      name: "艮",
      pinyin: "GEN",
      theme: "知止",
      desc:
        "知道何时停下，是另一种能力。为系统设边界，也为自己留一点呼吸的空间。",
      tech: "工程边界 · 取舍 · 稳定性",
    },
    kun: {
      num: "08",
      symbol: "☷",
      name: "坤",
      pinyin: "KUN",
      theme: "承载",
      desc:
        "让看不见的基础，托住所有想象。可靠的电源、干净的代码、稳定的情绪，都是世界的底座。",
      tech: "系统架构 · 电源与地 · 长期主义",
    },
  };

  const daoOrder = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"];

  /* ---------------------------------------------------------
     loader
     --------------------------------------------------------- */

  let pageReady = false;
  let loaderFinished = false;
  let loadProgress = 0;

  function updateLoader(value) {
    loadProgress = clamp(Math.round(value), 0, 100);
    if (loaderCount) loaderCount.textContent = String(loadProgress).padStart(3, "0");
    if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
  }

  function finishLoader() {
    if (loaderFinished) return;
    loaderFinished = true;
    updateLoader(100);
    window.setTimeout(() => {
      if (loader) loader.classList.add("is-done");
      body.classList.remove("is-loading");
      body.classList.add("is-ready");
      pageReady = true;
      startPage();
      window.setTimeout(() => {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 1350);
    }, prefersReducedMotion ? 80 : 240);
  }

  function bootLoader() {
    if (!loader) {
      body.classList.remove("is-loading");
      body.classList.add("is-ready");
      pageReady = true;
      startPage();
      return;
    }

    if (prefersReducedMotion) {
      finishLoader();
      return;
    }

    const startedAt = performance.now();
    const minimumTime = 1450;
    let pageLoaded = document.readyState === "complete";

    if (!pageLoaded) {
      window.addEventListener(
        "load",
        () => {
          pageLoaded = true;
        },
        { once: true }
      );
    }

    const safety = window.setTimeout(finishLoader, 4300);

    function animateLoader(now) {
      if (loaderFinished) return;
      const elapsed = now - startedAt;
      const eased = 1 - Math.pow(1 - clamp(elapsed / 1700, 0, 1), 3);
      updateLoader(eased * 96);

      if (elapsed >= minimumTime && pageLoaded) {
        window.clearTimeout(safety);
        finishLoader();
        return;
      }
      if (elapsed > 3600) {
        window.clearTimeout(safety);
        finishLoader();
        return;
      }
      requestAnimationFrame(animateLoader);
    }

    requestAnimationFrame(animateLoader);
  }

  /* ---------------------------------------------------------
     clocks & header
     --------------------------------------------------------- */

  const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  function updateClocks() {
    const time = timeFormatter.format(new Date());
    if (clock) clock.textContent = time;
    if (footerClock) footerClock.textContent = time;
  }

  let lastScrollY = window.scrollY || 0;
  let scrollTicking = false;

  function handleScroll() {
    lastScrollY = window.scrollY || 0;
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        scrollTicking = false;
        updateScrollUI();
      });
      scrollTicking = true;
    }
  }

  function updateScrollUI() {
    if (header) header.classList.toggle("is-scrolled", lastScrollY > 24);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? clamp(lastScrollY / max, 0, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
  }

  function initNavObserver() {
    const links = $$(".nav-link");
    if (!("IntersectionObserver" in window) || !links.length) return;

    const map = new Map(links.map((link) => [link.dataset.nav, link]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const isActive = link.dataset.nav === entry.target.id;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
    );

    map.forEach((link, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => link.classList.remove("is-active"));
            links.forEach((link) => link.removeAttribute("aria-current"));
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    const top = document.getElementById("top");
    if (top) heroObserver.observe(top);
  }

  /* ---------------------------------------------------------
     mobile menu
     --------------------------------------------------------- */

  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  let menuOpen = false;

  function openMenu() {
    if (!mobileMenu || menuOpen) return;
    menuOpen = true;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "关闭菜单");
    }
    const firstLink = $("a", mobileMenu);
    if (firstLink) window.setTimeout(() => firstLink.focus(), 350);
  }

  function closeMenu(restoreFocus = true) {
    if (!mobileMenu || !menuOpen) return;
    menuOpen = false;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "打开菜单");
      if (restoreFocus) menuToggle.focus({ preventScroll: true });
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      if (menuOpen) closeMenu();
      else openMenu();
    });

    $$("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) closeMenu();
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920 && menuOpen) closeMenu(false);
  }, { passive: true });

  /* ---------------------------------------------------------
     reveal observer
     --------------------------------------------------------- */

  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initCardEntrance() {
    const grid = $("#interestGrid");
    if (!grid || !hasWAAPI || prefersReducedMotion) return;
    if (!("IntersectionObserver" in window)) return;

    const cards = $$(".interest-card", grid);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        cards.forEach((card, index) => {
          card.animate(
            [
              { opacity: 0, transform: "translateY(23px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 780,
              delay: index * 48,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "backwards",
            }
          );
        });
      },
      { threshold: 0.04 }
    );
    observer.observe(grid);
  }

  /* ---------------------------------------------------------
     counters
     --------------------------------------------------------- */

  function animateCounters() {
    const counters = $$(".counter");
    counters.forEach((counter) => {
      const target = Number(counter.dataset.target || 0);
      if (prefersReducedMotion) {
        counter.textContent = String(target).padStart(2, "0");
        return;
      }
      const duration = 1500;
      const startedAt = performance.now();

      function frame(now) {
        const progress = clamp((now - startedAt) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        counter.textContent = String(Math.round(target * eased)).padStart(2, "0");
        if (progress < 1) requestAnimationFrame(frame);
      }
      window.setTimeout(() => requestAnimationFrame(frame), 520);
    });
  }

  /* ---------------------------------------------------------
     main page startup
     --------------------------------------------------------- */

  function startPage() {
    initReveals();
    initCardEntrance();
    initNavObserver();
    animateCounters();
    initCanvasField();
    initHeroArtifact();
    initBagua();
    initCursor();
    initMagnetic();
    initTiltCards();
    initScrollEffects();
  }

  function initScrollEffects() {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateScrollUI();
  }

  /* ---------------------------------------------------------
     custom cursor, magnetic controls & pointer light
     --------------------------------------------------------- */

  function initCursor() {
    if (!finePointer || prefersReducedMotion) return;
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    const glow = $(".pointer-glow");
    if (!dot || !ring) return;

    body.classList.add("has-custom-cursor");
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let started = false;

    function renderCursor() {
      if (!started) return;
      ringX = lerp(ringX, mouseX, 0.19);
      ringY = lerp(ringY, mouseY, 0.19);
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      if (glow) glow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (!started) {
          started = true;
          ringX = mouseX;
          ringY = mouseY;
          renderCursor();
        }

        const interactive = event.target.closest("a, button, [role='button'], kbd");
        const openable = event.target.closest("[data-cursor='open']");
        ring.classList.toggle("is-open", Boolean(openable));
        ring.classList.toggle("is-hover", Boolean(interactive) && !openable);
      },
      { passive: true }
    );

    document.addEventListener("pointerdown", () => ring.classList.add("is-down"));
    document.addEventListener("pointerup", () => ring.classList.remove("is-down"));
    document.documentElement.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.documentElement.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  }

  function initMagnetic() {
    if (!finePointer || prefersReducedMotion) return;
    $$(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.setProperty("--mx", `${clamp(x * 0.16, -8, 8)}px`);
        element.style.setProperty("--my", `${clamp(y * 0.22, -6, 6)}px`);
        element.classList.add("is-pulling");
      });
      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--mx", "0px");
        element.style.setProperty("--my", "0px");
        element.classList.remove("is-pulling");
      });
    });
  }

  function initTiltCards() {
    if (!finePointer || prefersReducedMotion) return;
    const card = $("#idCard");
    if (!card) return;

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const rx = (0.5 - y) * 5.2;
      const ry = (x - 0.5) * 7;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "0%");
    });

    $$(".interest-card").forEach((interestCard) => {
      interestCard.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = interestCard.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        interestCard.style.setProperty("--mx", `${x}%`);
        interestCard.style.setProperty("--my", `${y}%`);
      });
    });
  }

  /* ---------------------------------------------------------
     canvas field
     --------------------------------------------------------- */

  let fieldInitialized = false;

  function initCanvasField() {
    if (fieldInitialized) return;
    const canvas = $("#field");
    const hero = $(".hero");
    if (!canvas || !hero) return;
    fieldInitialized = true;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let motes = [];
    let heroVisible = true;
    let running = true;
    const pointer = { x: -9999, y: -9999, active: false };

    function createScene() {
      const count = clamp(Math.round((width * height) / 19000), 42, 96);
      const moteCount = clamp(Math.round((width * height) / 11000), 75, 180);
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.1 + 0.45,
        warm: Math.random() > 0.84,
      }));
      motes = Array.from({ length: moteCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 0.8 + 0.2,
        alpha: Math.random() * 0.3 + 0.05,
        drift: Math.random() * 0.06 + 0.012,
      }));
    }

    function resizeCanvas() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createScene();
      if (prefersReducedMotion) drawScene(true);
    }

    function drawScene(staticFrame = false) {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(240, 236, 225, 0.9)");
      gradient.addColorStop(1, "rgba(240, 236, 225, 0.55)");

      motes.forEach((mote) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(240, 236, 225, ${mote.alpha})`;
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
        if (!staticFrame) {
          mote.y -= mote.drift;
          mote.x += mote.drift * 0.22;
          if (mote.y < -5) {
            mote.y = height + 5;
            mote.x = Math.random() * width;
          }
          if (mote.x > width + 5) mote.x = -5;
        }
      });

      points.forEach((point) => {
        if (!staticFrame) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.x < -20) point.x = width + 20;
          if (point.x > width + 20) point.x = -20;
          if (point.y < -20) point.y = height + 20;
          if (point.y > height + 20) point.y = -20;

          if (pointer.active) {
            const dx = point.x - pointer.x;
            const dy = point.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 170 && dist > 0.001) {
              const force = ((170 - dist) / 170) * 0.055;
              point.x += (dx / dist) * force;
              point.y += (dy / dist) * force;
            }
          }
        }
      });

      const linkDistance = width < 700 ? 105 : 138;
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.115;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(240, 236, 225, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const distToPointer = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (distToPointer < 200) {
            const alpha = (1 - distToPointer / 200) * 0.23;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 91, 53, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      points.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = point.warm ? "rgba(255, 91, 53, 0.65)" : gradient;
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (pointer.active && !staticFrame) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 91, 53, 0.28)";
        ctx.lineWidth = 0.8;
        ctx.arc(pointer.x, pointer.y, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 91, 53, 0.8)";
        ctx.arc(pointer.x, pointer.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      if (heroVisible && !document.hidden) drawScene(false);
      requestAnimationFrame(loop);
    }

    function updatePointer(event) {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    }

    hero.addEventListener("pointermove", updatePointer, { passive: true });
    hero.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroVisible = entry.isIntersecting;
            if (heroVisible) drawScene(prefersReducedMotion);
          });
        },
        { threshold: 0 }
      );
      observer.observe(hero);
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 160);
    });

    resizeCanvas();
    if (prefersReducedMotion) {
      drawScene(true);
      running = false;
    } else {
      requestAnimationFrame(loop);
    }
  }

  /* ---------------------------------------------------------
     hero artifact
     --------------------------------------------------------- */

  const coreStates = [
    {
      glyph: "孟",
      label: "造物者",
      en: "BUILDER",
      state: "01 / 03 · 造物者",
      note: "把想象，变成可以运行的东西。",
    },
    {
      glyph: "道",
      label: "问道者",
      en: "ASKER",
      state: "02 / 03 · 问道者",
      note: "在答案之外，为未知留一盏灯。",
    },
    {
      glyph: "游",
      label: "游戏者",
      en: "PLAYER",
      state: "03 / 03 · 游戏者",
      note: "认真造物，也认真保留一点顽皮。",
    },
  ];

  let artifactInitialized = false;

  function initHeroArtifact() {
    if (artifactInitialized) return;
    const artifact = $("#artifact");
    const stage = $("#artifactStage");
    const svg = $("#artifactSvg");
    const coreBtn = $("#coreBtn");
    const glyph = $("#coreGlyph");
    const label = $("#coreLabel");
    const en = $("#coreEn");
    const stateText = $("#coreState");
    const note = $("#artifactNote");
    if (!artifact || !stage || !svg || !coreBtn) return;
    artifactInitialized = true;

    let angle = 0;
    let coreIndex = 0;
    let dragging = false;
    let dragMoved = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastPointerType = "mouse";
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let pointerInside = false;
    let lastInteraction = performance.now();
    let lastArtifactFrame = performance.now();
    const stageRect = () => artifact.getBoundingClientRect();

    const hero = $(".hero");
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch" || prefersReducedMotion) return;
        const rect = stageRect();
        const nx = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
        const ny = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
        targetRotY = nx * 8.6;
        targetRotX = ny * -6.2;
        pointerInside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
      },
      { passive: true }
    );

    if (hero) {
      hero.addEventListener("pointerleave", () => {
        targetRotX = 0;
        targetRotY = 0;
        pointerInside = false;
      });
    }

    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;
      if (event.target.closest("button")) return;
      dragging = true;
      dragMoved = false;
      lastPointerType = event.pointerType;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      stage.classList.add("is-dragging");
      if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      if (Math.abs(event.clientX - startX) > 2 || Math.abs(event.clientY - startY) > 2) {
        dragMoved = true;
      }
      angle += dx * 0.35;
      lastX = event.clientX;
      lastInteraction = performance.now();
      if (dragMoved) event.preventDefault();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      dragMoved = false;
      stage.classList.remove("is-dragging");
      lastInteraction = performance.now();
    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("lostpointercapture", endDrag);

    coreBtn.addEventListener("click", () => {
      coreIndex = (coreIndex + 1) % coreStates.length;
      const next = coreStates[coreIndex];
      coreBtn.classList.remove("is-pulsing");
      void coreBtn.offsetWidth;
      coreBtn.classList.add("is-pulsing");
      glyph.classList.add("is-changing");
      note.classList.add("is-changing");
      window.setTimeout(() => {
        glyph.textContent = next.glyph;
        label.textContent = next.label;
        en.textContent = next.en;
        stateText.textContent = next.state;
        note.textContent = next.note;
        glyph.classList.remove("is-changing");
        note.classList.remove("is-changing");
      }, 190);
      window.setTimeout(() => coreBtn.classList.remove("is-pulsing"), 1200);
    });

    function animateArtifact(now) {
      if (!prefersReducedMotion) {
        const delta = Math.min(now - lastArtifactFrame, 48);
        lastArtifactFrame = now;
        if (!dragging) {
          const idle = now - lastInteraction;
          const speed = idle > 2100 ? 0.0032 : 0.0009;
          angle += speed * delta;
        }
        currentRotX = lerp(currentRotX, targetRotX, 0.055);
        currentRotY = lerp(currentRotY, targetRotY, 0.055);
        stage.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(
          3
        )}deg) rotateY(${currentRotY.toFixed(3)}deg)`;
        svg.style.transform = `rotate(${angle.toFixed(3)}deg)`;
      }
      requestAnimationFrame(animateArtifact);
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(animateArtifact);
    } else {
      svg.style.transform = "rotate(-14deg)";
    }

    // A subtle readout update for pointer interaction.
    artifact.addEventListener("mouseenter", () => {
      if (prefersReducedMotion) return;
      pointerInside = true;
    });
  }

  /* ---------------------------------------------------------
     interest cards + modal
     --------------------------------------------------------- */

  const modal = $("#interestModal");
  const modalPanel = $(".modal-panel", modal);
  const modalVisual = $("#modalVisual");
  const modalArt = $("#modalArt");
  const modalIndex = $("#modalIndex");
  const modalGlyph = $("#modalGlyph");
  const modalCategory = $("#modalCategory");
  const modalNumber = $("#modalNumber");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalWhy = $("#modalWhy");
  const modalNext = $("#modalNext");
  const modalTags = $("#modalTags");
  const modalLinks = $("#modalLinks");
  const modalClose = $("#modalClose");
  const modalContent = $(".modal-content", modal);

  let modalIsOpen = false;
  let lastFocusedElement = null;
  let activeInterest = null;

  const interestCards = $$(".interest-card");
  const filterButtons = $$(".filter-btn");

  function getCard(key) {
    return interestCards.find((card) => card.dataset.key === key);
  }

  function renderModal(key) {
    const data = interestData[key];
    const sourceCard = getCard(key);
    if (!data || !sourceCard) return;

    activeInterest = key;
    if (modalPanel) {
      modalPanel.style.setProperty("--accent", data.accent);
    }
    if (modalIndex) modalIndex.textContent = `${data.num} / 08`;
    if (modalNumber) modalNumber.textContent = data.num;
    if (modalGlyph) modalGlyph.textContent = data.glyph;
    if (modalCategory) modalCategory.textContent = data.category;
    if (modalTitle) {
      modalTitle.textContent = `${data.title} `;
      const em = document.createElement("em");
      em.textContent = data.en;
      modalTitle.appendChild(em);
      modalTitle.setAttribute("tabindex", "-1");
    }
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalWhy) modalWhy.textContent = data.why;
    if (modalNext) modalNext.textContent = data.next;

    if (modalTags) {
      modalTags.innerHTML = "";
      data.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        modalTags.appendChild(span);
      });
    }

    if (modalLinks) {
      modalLinks.innerHTML = "";
      data.links.forEach((linkedKey) => {
        const linked = interestData[linkedKey];
        if (!linked) return;
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.targetInterest = linkedKey;
        const num = document.createElement("span");
        num.textContent = `${linked.num} / ${linked.title}`;
        button.appendChild(num);
        const arrow = document.createElement("i");
        arrow.textContent = "↗";
        arrow.style.fontStyle = "normal";
        arrow.style.color = "inherit";
        button.appendChild(arrow);
        button.addEventListener("click", () => {
          renderModal(linkedKey);
          if (modalContent) modalContent.scrollTop = 0;
          if (modalTitle) modalTitle.focus({ preventScroll: true });
        });
        modalLinks.appendChild(button);
      });
    }

    if (modalArt) {
      modalArt.innerHTML = "";
      const art = $(".card-art", sourceCard);
      if (art) {
        const clone = art.cloneNode(true);
        clone.removeAttribute("aria-hidden");
        clone.setAttribute("aria-hidden", "true");
        modalArt.appendChild(clone);
      }
    }
  }

  function openModal(key, trigger) {
    if (!modal || !interestData[key]) return;
    if (menuOpen) closeMenu(false);
    lastFocusedElement = trigger || document.activeElement;
    renderModal(key);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    modalIsOpen = true;
    if (modalContent) modalContent.scrollTop = 0;
    window.setTimeout(() => {
      if (modalClose) modalClose.focus({ preventScroll: true });
    }, 70);
  }

  function closeModal() {
    if (!modal || !modalIsOpen) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    modalIsOpen = false;
    activeInterest = null;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  if (modal) {
    $$("[data-close]", modal).forEach((element) => {
      element.addEventListener("click", closeModal);
    });
    if (modalClose) modalClose.addEventListener("click", closeModal);
  }

  interestCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      openModal(card.dataset.key, event.currentTarget);
    });
  });

  function randomInterest(trigger) {
    const keys = Object.keys(interestData);
    let key = keys[Math.floor(Math.random() * keys.length)];
    if (keys.length > 1 && key === activeInterest) {
      key = keys[(keys.indexOf(key) + 1) % keys.length];
    }
    openModal(key, trigger || null);
  }

  const randomButtons = [$("#randomInterest"), $("#randomInterest2")].filter(Boolean);
  randomButtons.forEach((button) => {
    button.addEventListener("click", () => randomInterest(button));
  });

  /* filtering with a lightweight FLIP transition */
  function setFilter(category) {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const firstRects = new Map();
    interestCards.forEach((card) => {
      if (!card.hidden) firstRects.set(card, card.getBoundingClientRect());
    });

    interestCards.forEach((card) => {
      const matches = category === "all" || card.dataset.category === category;
      card.hidden = !matches;
      card.classList.toggle("is-filtered", !matches);
      if (matches) card.removeAttribute("aria-hidden");
      else card.setAttribute("aria-hidden", "true");
    });

    if (!hasWAAPI || prefersReducedMotion) return;

    requestAnimationFrame(() => {
      interestCards.forEach((card) => {
        if (card.hidden) return;
        const oldRect = firstRects.get(card);
        const newRect = card.getBoundingClientRect();
        if (oldRect) {
          const dx = oldRect.left - newRect.left;
          const dy = oldRect.top - newRect.top;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            card.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: "translate(0, 0)" },
              ],
              {
                duration: 550,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              }
            );
          }
        } else {
          card.animate(
            [
              { opacity: 0, transform: "translateY(14px) scale(0.985)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            {
              duration: 500,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            }
          );
        }
      });
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  function trapModalFocus(event) {
    if (!modalIsOpen || event.key !== "Tab") return;
    const focusables = Array.from(
      modal.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => !element.disabled && element.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------
     bagua
     --------------------------------------------------------- */

  let baguaReady = false;

  function initBagua() {
    if (baguaReady) return;
    const bagua = $("#bagua");
    if (!bagua) return;
    baguaReady = true;

    const trigramButtons = $$(".trigram", bagua);
    const marker = $("#baguaMarker");
    const glyph = $("#baguaGlyph");
    const name = $("#baguaName");
    const en = $("#baguaEn");
    const reading = $(".dao-reading");
    const index = $("#daoIndex");
    const symbol = $("#daoSymbol");
    const daoName = $("#daoName");
    const daoEn = $("#daoEn");
    const daoDesc = $("#daoDesc");
    const daoTech = $("#daoTech");
    const progress = $("#daoProgress");
    const part = $("#daoPart");
    const prev = $("#daoPrev");
    const next = $("#daoNext");
    let current = 0;
    let switchingTimer = 0;

    function updateRadius() {
      const width = bagua.clientWidth;
      if (width) bagua.style.setProperty("--radius", `${width * 0.378}px`);
    }

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(updateRadius);
      observer.observe(bagua);
    } else {
      window.addEventListener("resize", updateRadius);
    }
    updateRadius();

    function applyIndex(nextIndex) {
      const key = daoOrder[nextIndex];
      const data = daoData[key];
      if (!data) return;
      current = nextIndex;

      trigramButtons.forEach((button) => {
        const active = button.dataset.key === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const activeButton = trigramButtons.find((button) => button.dataset.key === key);
      if (marker) marker.style.setProperty("--angle", `${Number(activeButton?.dataset.angle || 0)}deg`);

      if (reading) reading.classList.add("is-changing");
      if (glyph) glyph.classList.add("is-changing");

      window.clearTimeout(switchingTimer);
      switchingTimer = window.setTimeout(() => {
        if (glyph) glyph.textContent = data.symbol;
        if (name) name.textContent = data.name;
        if (en) en.textContent = data.pinyin;
        if (index) index.textContent = `${data.num} / 08`;
        if (symbol) symbol.textContent = data.symbol;
        if (daoName) daoName.textContent = data.name;
        if (daoEn) daoEn.textContent = `${data.pinyin} · ${data.theme}`;
        if (daoDesc) daoDesc.textContent = data.desc;
        if (daoTech) daoTech.textContent = data.tech;
        if (progress) progress.style.width = `${((nextIndex + 1) / daoOrder.length) * 100}%`;
        if (part) {
          part.textContent = `${String(nextIndex + 1).padStart(2, "0")} — 08`;
        }
        if (reading) reading.classList.remove("is-changing");
        if (glyph) glyph.classList.remove("is-changing");
      }, prefersReducedMotion ? 0 : 175);
    }

    trigramButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.key;
        const index = daoOrder.indexOf(key);
        if (index >= 0) applyIndex(index);
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        applyIndex((current - 1 + daoOrder.length) % daoOrder.length);
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        applyIndex((current + 1) % daoOrder.length);
      });
    }

    bagua.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (event.key === "ArrowLeft") applyIndex((current - 1 + daoOrder.length) % daoOrder.length);
      else applyIndex((current + 1) % daoOrder.length);
    });

    applyIndex(0);
  }

  /* ---------------------------------------------------------
     contact actions
     --------------------------------------------------------- */

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
    }
    textarea.remove();
    return success;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        return fallbackCopy(text);
      }
    }
    return fallbackCopy(text);
  }

  const identityText = [
    "孟子皓 · MENG ZIHAO",
    "天津大学 · 电气自动化与信息工程学院 · 大一",
    "20 岁 · 天津",
    "单片机 / 人工智能 / 三维建模 / 独立游戏 / 视频剪辑 / 摄影 / 神话研究 / 道教文化",
    "“在 0 与 1 之间，造物，也问道。”",
  ].join("\n");

  const feedback = $("#contactFeedback");
  let feedbackTimer = 0;

  function showFeedback(message) {
    if (!feedback) return;
    window.clearTimeout(feedbackTimer);
    feedback.textContent = message;
    feedback.classList.add("is-visible");
    feedbackTimer = window.setTimeout(() => feedback.classList.remove("is-visible"), 4200);
  }

  const contact = $("#contact");
  const copyButton = $("#copyIdentity");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const copied = await copyText(identityText);
      if (contact) {
        contact.classList.remove("is-signal");
        void contact.offsetWidth;
        contact.classList.add("is-signal");
      }
      showFeedback(
        copied
          ? "身份卡已复制 · 下一次信号，也许就从这里开始。"
          : "复制没有成功，但故事仍在这里。"
      );
    });
  }

  const shareButton = $("#sharePage");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: "孟子皓 · 造物与问道",
        text: "在 0 与 1 之间，造物，也问道。",
        url: window.location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showFeedback("分享成功 · 感谢你把信号传出去。");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }
      const copied = await copyText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      showFeedback(
        copied ? "页面链接已复制 · 去分享给一个有趣的人吧。" : "分享没有完成，请复制浏览器地址。"
      );
    });
  }

  /* ---------------------------------------------------------
     global keyboard
     --------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modalIsOpen) {
        closeModal();
        return;
      }
      if (menuOpen) {
        closeMenu();
        return;
      }
    }

    if (modalIsOpen) {
      trapModalFocus(event);
      return;
    }

    if (menuOpen && event.key === "Tab" && mobileMenu) {
      const menuLinks = $$("a, button", mobileMenu).filter(
        (element) => element.offsetParent !== null
      );
      const menuFocusables = menuToggle ? [menuToggle, ...menuLinks] : menuLinks;
      if (menuFocusables.length) {
        const first = menuFocusables[0];
        const last = menuFocusables[menuFocusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    const target = event.target;
    const isTyping =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable);

    if (
      !isTyping &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      (event.key === "r" || event.key === "R")
    ) {
      if (menuOpen) closeMenu(false);
      event.preventDefault();
      randomInterest(document.activeElement);
    }
  });

  /* ---------------------------------------------------------
     go
     --------------------------------------------------------- */

  updateClocks();
  window.setInterval(updateClocks, 1000);
  window.addEventListener("resize", updateScrollUI, { passive: true });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("load", finishLoader, { once: true });
  }

  bootLoader();
})();
