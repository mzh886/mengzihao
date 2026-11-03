(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[character];
    });

  /* ---------------------------------------------------------
     CONTENT / INTERESTS
     --------------------------------------------------------- */
  const interestData = {
    mcu: {
      num: "01",
      title: "单片机",
      en: "Embedded Systems",
      category: "MAKE · 造物",
      glyph: "芯",
      desc: "喜欢看代码穿过芯片，变成灯、声音和动作。单片机大概是最接近「造物」的入口：一行代码下去，现实世界真的会回应你。",
      why: "它把抽象的代码变成可触摸的反馈。从 GPIO、传感器到电机，每个小模块都像一块乐高，等着被拼成有生命的系统。",
      next: "从开发板和传感器起步，慢慢补嵌入式 C、电路基础与 PCB，希望做一块真正属于自己的小控制板。",
      tags: ["嵌入式 C", "GPIO / 传感器", "电路基础", "PCB"],
      links: ["threed", "game"],
    },
    ai: {
      num: "02",
      title: "人工智能",
      en: "Artificial Intelligence",
      category: "MAKE · 造物",
      glyph: "智",
      desc: "对「机器如何学会理解」着迷。关注神经网络、生成模型与多模态，想亲手训练出一点真正有趣、也真正有用的东西。",
      why: "它像一种新的语言：人类用数据描述世界，模型从里面长出规律。最吸引我的，是那些既合理又出乎意料的瞬间。",
      next: "补数学与代码的底子，从经典模型和开源项目入手，尝试把 AI 做成能放进具体场景里的小工具。",
      tags: ["神经网络", "生成模型", "多模态", "学习原理"],
      links: ["threed", "mcu"],
    },
    threed: {
      num: "03",
      title: "三维建模",
      en: "3D Modelling",
      category: "MAKE · 造物",
      glyph: "维",
      desc: "喜欢在软件里搭建现实不存在的东西。从硬表面到场景光影，享受把一个世界从线框一点点推到成片的过程。",
      why: "建模是另一种写代码：每个顶点、材质和光都参与叙事。它同时需要结构感和审美直觉，刚好是我喜欢的那种平衡。",
      next: "继续练习硬表面与场景搭建，研究材质、灯光和镜头，把想象中的空间做成可以进入的画面。",
      tags: ["硬表面", "场景搭建", "材质 / 光影", "渲染"],
      links: ["game", "ai"],
    },
    game: {
      num: "04",
      title: "独立游戏",
      en: "Indie Game Development",
      category: "MAKE · 造物",
      glyph: "游",
      desc: "独立游戏是代码、美术、叙事与规则的交汇处。想做一个能把东方神话装进玩法里的小宇宙，让玩家在规则里遇见故事。",
      why: "游戏是少数能把技术、视觉、音乐和情感全部放进同一个容器的媒介。它不只是被观看，而是邀请人去行动。",
      next: "从很小的原型开始，摸清引擎、玩法循环和关卡节奏，然后做一个真的能玩、也真的有人愿意玩下去的作品。",
      tags: ["玩法原型", "游戏引擎", "叙事设计", "东方神话"],
      links: ["myth", "threed"],
    },
    video: {
      num: "05",
      title: "视频剪辑",
      en: "Video Editing",
      category: "SEE · 感知",
      glyph: "剪",
      desc: "相信节奏是第二叙事。喜欢把素材重新排列，让画面与音乐在某个瞬间同时击中，把时间剪成一种情绪。",
      why: "剪辑是在做选择：留下什么、删掉什么、什么时候呼吸。它很像工程里的减法，只不过目标是让感受变得更准确。",
      next: "继续练习节奏、声音和色彩，把拍摄与剪辑连成完整的表达，而不是只停留在技术操作。",
      tags: ["节奏", "叙事", "声音设计", "调色"],
      links: ["photo", "game"],
    },
    photo: {
      num: "06",
      title: "摄影",
      en: "Photography",
      category: "SEE · 感知",
      glyph: "光",
      desc: "习惯带着相机观察日常。比起打卡式的记录，更在意光线落在物体上的那一秒，以及画面里没有说出口的部分。",
      why: "镜头会让人慢下来。它要求你在一个普通场景里找到结构、秩序和情绪，这种训练也会悄悄反哺设计和技术。",
      next: "多拍、多回头看，找到自己真正想记录的母题；继续理解光、构图与色彩，也保留偶然和失误。",
      tags: ["光线", "构图", "街拍 / 日常", "色彩"],
      links: ["video", "myth"],
    },
    myth: {
      num: "07",
      title: "神话研究",
      en: "Mythology Studies",
      category: "ASK · 问道",
      glyph: "山海",
      desc: "从《山海经》到希腊史诗，收集人类反复讲述的原型与隐喻，再把它们拆解成可以继续生长的创作素材。",
      why: "神话不是过时的故事，而是人类最早的世界模型。它保存了关于恐惧、欲望、秩序和未知的答案，也留下很多没有答案的入口。",
      next: "沿着主题阅读，梳理不同文化中的重复母题；试着把神话的叙事结构放进游戏、影像和三维场景里。",
      tags: ["《山海经》", "原型批评", "比较神话", "叙事"],
      links: ["game", "tao"],
    },
    tao: {
      num: "08",
      title: "道教文化",
      en: "Taoist Culture",
      category: "ASK · 问道",
      glyph: "道",
      desc: "读《道德经》，也读道教文化中的宇宙观与修炼想象。不是寻找标准答案，而是练习换一种尺度看世界。",
      why: "道教文化里有一种特别的目光：它同时承认秩序与变化、可名与不可名。它提醒我，把问题拆开之后，也要为不可解的部分留一点位置。",
      next: "继续读原典与注释，把道德经、八卦、丹道等概念放回历史脉络里理解；也把这种目光带进工程与创作。",
      tags: ["《道德经》", "八卦", "宇宙观", "留白"],
      links: ["myth", "mcu"],
    },
  };

  const interestOrder = Object.keys(interestData);

  /* ---------------------------------------------------------
     CONTENT / TRIGRAMS
     --------------------------------------------------------- */
  const daoData = {
    qian: { num: "01", name: "乾", pinyin: "QIAN", theme: "创造", desc: "从无到有，先把东西做出来。世界也许不会因为一个想法改变，但会被一个真正跑起来的原型轻轻推动。", tech: "游戏原型 · 硬件立项 · 从 0 到 1" },
    dui: { num: "02", name: "兑", pinyin: "DUI", theme: "连接", desc: "把自己打开，让不同的频率互相听见。好的作品往往不是独白，而是一场刚刚好的共振。", tech: "交互设计 · 用户反馈 · 协作" },
    li: { num: "03", name: "离", pinyin: "LI", theme: "洞察", desc: "看清结构，也看清光落在哪里。表达不是装饰，而是让复杂的东西突然变得可以理解。", tech: "数据可视化 · 影像表达 · 调试" },
    zhen: { num: "04", name: "震", pinyin: "ZHEN", theme: "启动", desc: "真正的开始，往往只需要一次通电。先让事情发生，再在噪声里慢慢找到秩序。", tech: "第一行代码 · 第一次点亮 · 快速试错" },
    xun: { num: "05", name: "巽", pinyin: "XUN", theme: "渗透", desc: "用持续的小改动，进入系统的缝隙。最柔软的方式，有时最能改变一个庞然大物。", tech: "迭代优化 · 渐进式改造 · 更新" },
    kan: { num: "06", name: "坎", pinyin: "KAN", theme: "深潜", desc: "在问题最深的地方保持耐心。真正难的部分通常藏在表面之下，也最值得多待一会儿。", tech: "Debug · 底层原理 · 数学基础" },
    gen: { num: "07", name: "艮", pinyin: "GEN", theme: "知止", desc: "知道何时停下，是另一种能力。为系统设边界，也为自己留一点呼吸的空间。", tech: "工程边界 · 取舍 · 稳定性" },
    kun: { num: "08", name: "坤", pinyin: "KUN", theme: "承载", desc: "让看不见的基础，托住所有想象。可靠的电源、干净的代码、稳定的情绪，都是世界的底座。", tech: "系统架构 · 电源与地 · 长期主义" },
  };
  const daoOrder = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"];

  // Top-to-bottom line patterns. 1 = solid, 0 = broken.
  const trigramPatterns = {
    qian: [1, 1, 1],
    dui: [0, 1, 1],
    li: [1, 0, 1],
    zhen: [0, 0, 1],
    xun: [1, 1, 0],
    kan: [0, 1, 0],
    gen: [1, 0, 0],
    kun: [0, 0, 0],
  };

  function trigramSVG(key) {
    const pattern = trigramPatterns[key] || trigramPatterns.qian;
    const bars = pattern
      .map((solid, index) => {
        const y = 4 + index * 7;
        return solid
          ? `<path d="M1 ${y}h30"/>`
          : `<path d="M1 ${y}h12M19 ${y}h12"/>`;
      })
      .join("");
    return `<svg viewBox="0 0 32 22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${bars}</svg>`;
  }

  /* ---------------------------------------------------------
     CLOCK / SCROLL / NAV
     --------------------------------------------------------- */
  const header = $("#siteHeader");
  const progressBar = $("#progressBar");
  const headerClock = $("#headerClock");
  const footerClock = $("#footerClock");
  const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  function updateClocks() {
    const time = timeFormatter.format(new Date());
    if (headerClock) headerClock.textContent = time.slice(0, 5);
    if (footerClock) footerClock.textContent = time;
  }

  function initClocks() {
    updateClocks();
    window.setInterval(updateClocks, 1000);
  }

  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function updateScrollUI() {
    const y = Math.max(0, window.scrollY || 0);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? clamp((y / max) * 100, 0, 100) : 0}%`;
    if (header) header.classList.toggle("is-scrolled", y > 12);

    let current = "";
    const marker = y + (header?.offsetHeight || 76) + window.innerHeight * 0.26;
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });
    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === current;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    lastScrollY = y;
    scrollTicking = false;
  }

  function initScrollUI() {
    updateScrollUI();
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollUI);
      },
      { passive: true }
    );
    window.addEventListener("resize", updateScrollUI, { passive: true });
  }

  /* ---------------------------------------------------------
     REVEALS / TILT
     --------------------------------------------------------- */
  function initReveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-in"));
      return;
    }

    $$(".principles article").forEach((item, index) => item.style.setProperty("--delay", `${index * 0.08}s`));
    $$(".pagoda-facts > div").forEach((item, index) => item.style.setProperty("--delay", `${index * 0.06}s`));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -7% 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initTilt() {
    if (!finePointer || reduceMotion) return;

    const bindTilt = (element, setX, setY) => {
      let frame = 0;
      const onMove = (event) => {
        const rect = element.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
        const y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => setX(x, y));
      };
      const onLeave = () => {
        if (frame) cancelAnimationFrame(frame);
        setX(0, 0);
        setY();
      };
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
    };

    const card = $("#idCard");
    if (card) {
      bindTilt(
        card,
        (x, y) => {
          card.style.setProperty("--card-ry", `${x * 5.5}deg`);
          card.style.setProperty("--card-rx", `${-y * 4.5}deg`);
        },
        () => {}
      );
    }

    const disc = $("#discWrap");
    const art = $("[data-hero-art]");
    if (disc && art) {
      let frame = 0;
      art.addEventListener("pointermove", (event) => {
        const rect = art.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
        const y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          disc.style.setProperty("--ry", `${x * 7}deg`);
          disc.style.setProperty("--rx", `${-y * 6}deg`);
        });
      });
      art.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);
        disc.style.setProperty("--ry", "0deg");
        disc.style.setProperty("--rx", "0deg");
      });
    }
  }

  function initIdentityCore() {
    const core = $("#discCore");
    const state = $("#identityState");
    const note = $("#identityNote");
    if (!core || !state || !note) return;
    const states = [
      ["01 / 03 · 造物者", "把想象，变成可以运行的东西。"],
      ["02 / 03 · 观察者", "先看见，再决定要改变什么。"],
      ["03 / 03 · 问道者", "给未知，留一点位置。"],
    ];
    let index = 0;
    core.addEventListener("click", () => {
      index = (index + 1) % states.length;
      state.textContent = states[index][0];
      note.style.opacity = "0";
      window.setTimeout(() => {
        note.textContent = states[index][1];
        note.style.opacity = "1";
      }, 130);
    });
  }

  /* ---------------------------------------------------------
     MOBILE MENU
     --------------------------------------------------------- */
  function initMenu() {
    const toggle = $("#menuToggle");
    const menu = $("#mobileMenu");
    if (!toggle || !menu) return;
    let lastFocus = null;
    const focusableSelector = 'a[href], button:not([disabled])';

    const open = () => {
      lastFocus = document.activeElement;
      document.body.classList.add("menu-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "关闭菜单");
      window.requestAnimationFrame(() => {
        const first = $(focusableSelector, menu);
        if (first) first.focus({ preventScroll: true });
      });
    };

    const close = (restoreFocus = true) => {
      document.body.classList.remove("menu-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开菜单");
      if (restoreFocus && lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
    };

    toggle.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) close();
      else open();
    });
    $$("[data-menu-close]", menu).forEach((button) => button.addEventListener("click", () => close()));
    $$("a", menu).forEach((link) => link.addEventListener("click", () => close(false)));
    document.addEventListener("keydown", (event) => {
      if (!document.body.classList.contains("menu-open")) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = $$(focusableSelector, menu).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     INTERESTS / MODAL
     --------------------------------------------------------- */
  let previewTimer = 0;
  let previewKey = "mcu";
  let activeFilter = "all";
  let modalLastFocus = null;
  let currentModalKey = null;

  function setPreview(key, animated = true) {
    const data = interestData[key];
    if (!data) return;
    previewKey = key;
    const preview = $("#signalPreview");
    if (!preview) return;
    window.clearTimeout(previewTimer);
    const apply = () => {
      const index = $("#previewIndex");
      const category = $("#previewCategory");
      const glyph = $("#previewGlyph");
      const title = $("#previewTitle");
      const en = $("#previewEn");
      const desc = $("#previewDesc");
      const num = $("#previewNum");
      if (index) index.textContent = `${data.num} / 08`;
      if (category) category.textContent = data.category;
      if (glyph) {
        glyph.textContent = data.glyph;
        glyph.classList.toggle("is-long", data.glyph.length > 1);
      }
      if (title) title.textContent = data.title;
      if (en) en.textContent = data.en;
      if (desc) desc.textContent = data.desc;
      if (num) num.textContent = data.num;
      $$(".signal-row").forEach((row) => {
        const active = row.dataset.key === key;
        row.classList.toggle("is-previewed", active);
      });
    };

    if (animated) {
      preview.classList.add("is-changing");
      previewTimer = window.setTimeout(() => {
        apply();
        preview.classList.remove("is-changing");
      }, 160);
    } else {
      preview.classList.remove("is-changing");
      apply();
    }
  }

  function fillModal(key) {
    const data = interestData[key];
    if (!data) return;
    currentModalKey = key;
    const index = $("#modalIndex");
    const glyph = $("#modalGlyph");
    const category = $("#modalCategory");
    const eyebrow = $("#modalEyebrow");
    const title = $("#modalTitle");
    const desc = $("#modalDesc");
    const why = $("#modalWhy");
    const next = $("#modalNext");
    const tags = $("#modalTags");
    const links = $("#modalLinks");

    if (index) index.textContent = `${data.num} / 08`;
    if (glyph) glyph.textContent = data.glyph;
    if (category) category.textContent = data.category;
    if (eyebrow) eyebrow.textContent = `SIGNAL / ${data.num}`;
    if (title) title.innerHTML = `${escapeHTML(data.title)} <em id="modalEn">${escapeHTML(data.en)}</em>`;
    if (desc) desc.textContent = data.desc;
    if (why) why.textContent = data.why;
    if (next) next.textContent = data.next;
    if (tags) tags.innerHTML = data.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
    if (links) {
      links.innerHTML = data.links
        .map((linkedKey) => {
          const linked = interestData[linkedKey];
          if (!linked) return "";
          return `<button type="button" data-goto="${escapeHTML(linkedKey)}">相邻坐标 · ${escapeHTML(linked.title)} ↗</button>`;
        })
        .join("");
    }
    setPreview(key, false);
  }

  function openModal(key) {
    const modal = $("#interestModal");
    if (!modal || !interestData[key]) return;
    fillModal(key);
    modalLastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => {
      const close = $(".modal-close", modal);
      if (close) close.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    const modal = $("#interestModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (modalLastFocus instanceof HTMLElement) modalLastFocus.focus({ preventScroll: true });
  }

  function initInterests() {
    const rows = $$(".signal-row");
    const filters = $$(".filter");
    const modal = $("#interestModal");
    const modalLinks = $("#modalLinks");

    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => {
        if (row.hidden) return;
        if (modal?.classList.contains("is-open")) return;
        setPreview(row.dataset.key);
      });
      row.addEventListener("focus", () => {
        if (!row.hidden) setPreview(row.dataset.key, false);
      });
      row.addEventListener("click", () => openModal(row.dataset.key));
    });

    const applyFilter = (filter) => {
      activeFilter = filter;
      filters.forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      rows.forEach((row) => {
        const visible = filter === "all" || row.dataset.category === filter;
        row.hidden = !visible;
      });
      const first = rows.find((row) => !row.hidden);
      if (first) setPreview(first.dataset.key);
    };

    filters.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter)));

    if (modal) {
      $$("[data-close-modal]", modal).forEach((button) => button.addEventListener("click", closeModal));
      if (modalLinks) {
        modalLinks.addEventListener("click", (event) => {
          const button = event.target.closest("[data-goto]");
          if (!button) return;
          fillModal(button.dataset.goto);
          $(".modal-close", modal)?.focus({ preventScroll: true });
        });
      }
      document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          closeModal();
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = $$('a[href], button:not([disabled])', modal).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    const random = () => {
      const pool = rows.filter((row) => !row.hidden);
      if (!pool.length) return;
      const row = pool[Math.floor(Math.random() * pool.length)];
      openModal(row.dataset.key);
    };
    const randomButton = $("#randomInterest");
    if (randomButton) randomButton.addEventListener("click", random);

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== "r") return;
      if (document.body.classList.contains("modal-open") || document.body.classList.contains("menu-open")) return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
      event.preventDefault();
      random();
    });

    setPreview("mcu", false);
  }

  /* ---------------------------------------------------------
     BAGUA
     --------------------------------------------------------- */
  function initBagua() {
    const ring = $("#baguaRing");
    if (!ring) return;
    const centerIcon = $("#daoCenterIcon");
    const centerName = $("#daoCenterName");
    const centerEn = $("#daoCenterEn");
    const largeIcon = $("#daoIconLarge");
    const name = $("#daoName");
    const en = $("#daoEn");
    const desc = $("#daoDesc");
    const tech = $("#daoTech");
    const index = $("#daoIndex");
    const progress = $("#daoProgress");
    const reader = $(".dao-reader");

    daoOrder.forEach((key, i) => {
      const item = daoData[key];
      const angle = (-90 + i * 45) * (Math.PI / 180);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "trigram";
      button.dataset.key = key;
      button.style.left = `${50 + Math.cos(angle) * 38}%`;
      button.style.top = `${50 + Math.sin(angle) * 38}%`;
      button.setAttribute("aria-label", `${item.name}卦，${item.theme}`);
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = `${trigramSVG(key)}<em>${item.name}</em>`;
      button.addEventListener("click", () => setDao(key));
      ring.appendChild(button);
    });

    const buttons = $$(".trigram", ring);
    let currentIndex = 0;

    function setDao(key) {
      const data = daoData[key];
      if (!data) return;
      currentIndex = daoOrder.indexOf(key);
      buttons.forEach((button) => {
        const active = button.dataset.key === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      const icon = trigramSVG(key);
      if (centerIcon) centerIcon.innerHTML = icon;
      if (largeIcon) largeIcon.innerHTML = icon;
      if (centerName) centerName.textContent = data.name;
      if (centerEn) centerEn.textContent = `${data.pinyin} / ${data.theme}`;
      if (name) name.textContent = data.name;
      if (en) en.textContent = `${data.pinyin} · ${data.theme}`;
      if (desc) desc.textContent = data.desc;
      if (tech) tech.textContent = data.tech;
      if (index) index.textContent = `${data.num} / 08`;
      if (progress) progress.style.width = `${((currentIndex + 1) / daoOrder.length) * 100}%`;
      if (reader) {
        reader.classList.add("is-changing");
        window.setTimeout(() => reader.classList.remove("is-changing"), 260);
      }
    }

    $("#daoPrev")?.addEventListener("click", () => setDao(daoOrder[(currentIndex - 1 + daoOrder.length) % daoOrder.length]));
    $("#daoNext")?.addEventListener("click", () => setDao(daoOrder[(currentIndex + 1) % daoOrder.length]));
    setDao("qian");
  }

  /* ---------------------------------------------------------
     EXHIBITS / 3D FRAMES
     --------------------------------------------------------- */
  function initExhibits() {
    const exhibits = $$("[data-exhibit]");
    if (!exhibits.length) return;

    const load = (exhibit) => {
      const stage = $(".exhibit-stage", exhibit);
      if (!stage) return;
      let iframe = $("iframe", stage);
      const src = exhibit.dataset.src;
      if (!src) return;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.setAttribute("allow", "fullscreen; autoplay");
        iframe.setAttribute("allowfullscreen", "");
        iframe.title = exhibit.dataset.title || "3D 互动展品";
        iframe.addEventListener("load", () => {
          exhibit.classList.remove("is-loading");
          stage.setAttribute("aria-busy", "false");
        });
        stage.appendChild(iframe);
      }
      exhibit.classList.add("is-live", "is-loading");
      stage.setAttribute("aria-busy", "true");
      iframe.title = exhibit.dataset.title || "3D 互动展品";
      iframe.src = src;
      $$("[data-exhibit-close]", exhibit).forEach((button) => {
        button.hidden = false;
      });
      window.setTimeout(() => {
        exhibit.classList.remove("is-loading");
        stage.setAttribute("aria-busy", "false");
      }, 12000);
    };

    const close = (exhibit) => {
      const stage = $(".exhibit-stage", exhibit);
      if (!stage) return;
      const iframe = $("iframe", stage);
      if (iframe) iframe.remove();
      exhibit.classList.remove("is-live", "is-loading");
      stage.removeAttribute("aria-busy");
      $$("[data-exhibit-close]", exhibit).forEach((button) => {
        button.hidden = true;
      });
      $("[data-exhibit-start]", exhibit)?.focus({ preventScroll: true });
    };

    exhibits.forEach((exhibit) => {
      $("[data-exhibit-start]", exhibit)?.addEventListener("click", () => load(exhibit));
      $$("[data-exhibit-close]", exhibit).forEach((button) => {
        button.addEventListener("click", () => close(exhibit));
      });
      $$("[data-fullscreen]", exhibit).forEach((button) => {
        button.addEventListener("click", async () => {
          if (!exhibit.classList.contains("is-live")) load(exhibit);
          try {
            if (document.fullscreenElement === exhibit) {
              await document.exitFullscreen();
            } else if (exhibit.requestFullscreen) {
              await exhibit.requestFullscreen();
            } else {
              window.open(exhibit.dataset.src, "_blank", "noopener");
            }
          } catch {
            window.open(exhibit.dataset.src, "_blank", "noopener");
          }
        });
      });
    });

    return { load };
  }

  /* ---------------------------------------------------------
     EXPLAINER SERIES
     --------------------------------------------------------- */
  function initExplainers(exhibitApi) {
    const series = Array.isArray(window.EXPLAINER_SERIES)
      ? window.EXPLAINER_SERIES.filter((item) => item.status !== "soon")
      : [];
    if (!series.length) return;

    const exhibit = $(".exhibit--lesson");
    if (!exhibit) return;

    const count = String(series.length).padStart(2, "0");
    $$("[data-series-count]").forEach((node) => {
      node.textContent = count;
    });

    const list = $("#seriesList");
    const viewerExam = $("#viewerExam");
    const viewerOpen = $("#viewerOpen");
    const viewerPoster = $("#viewerPoster");
    const viewerHint = $("#viewerHint");
    const viewerCaption = $("#viewerCaption");
    const viewerFootTitle = $("#viewerFootTitle");
    const viewerFootTags = $("#viewerFootTags");
    let activeId = (series.find((item) => item.featured) || series[0]).id;

    if (list) {
      list.innerHTML = series
        .map(
          (item) => `
          <button class="series-item" type="button" data-series-id="${escapeHTML(item.id)}">
            <span class="series-item-index">${escapeHTML(item.episode || "--")}</span>
            <span class="series-item-main"><small>${escapeHTML(item.exam || "")}</small><strong>${escapeHTML(item.title || "")}</strong></span>
            <span class="series-item-status">${item.status === "live" ? "LIVE" : "SOON"} ↗</span>
          </button>`
        )
        .join("");
    }

    const update = (item) => {
      if (!item) return;
      activeId = item.id;
      exhibit.dataset.src = item.href;
      exhibit.dataset.title = `${item.title || "3D 题解"} · 3D 讲解`;
      const openHref = item.href;
      if (viewerOpen) viewerOpen.href = openHref;
      if (viewerExam) viewerExam.textContent = item.exam || "";
      if (viewerHint) viewerHint.textContent = item.summary || "拖动视角 / 调节参数 / 看见轨迹";
      if (viewerCaption) viewerCaption.textContent = `LIVE LESSON / EP. ${item.episode || "01"}`;
      if (viewerFootTitle) viewerFootTitle.textContent = item.title || "";
      if (viewerFootTags) viewerFootTags.textContent = (item.tags || []).join(" / ");
      if (viewerPoster) {
        viewerPoster.src = item.preview || item.image || "assets/explainers/2026-shanxi-physics-preview.webp";
        viewerPoster.alt = `${item.title || "3D 题解"}页面预览`;
      }
      const episode = $("#viewerEpisode");
      if (episode) episode.textContent = `EP. ${item.episode || "01"}`;
      $$(".series-item", list || document).forEach((button) => {
        button.classList.toggle("is-active", button.dataset.seriesId === item.id);
      });
      if (exhibit.classList.contains("is-live")) exhibitApi?.load(exhibit);
    };

    if (list) {
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-series-id]");
        if (!button) return;
        const item = series.find((entry) => entry.id === button.dataset.seriesId);
        if (item) update(item);
      });
    }

    update(series.find((item) => item.id === activeId) || series[0]);
  }

  /* ---------------------------------------------------------
     COPY / SHARE
     --------------------------------------------------------- */
  let toastTimer = 0;

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      area.remove();
      return copied;
    }
  }

  function initContact() {
    const feedback = $("#contactFeedback");
    const identityButton = $("#copyIdentity");
    const shareButton = $("#sharePage");
    const identity = `孟子皓 / 20 岁
天津大学 · 电气自动化与信息工程学院 · 本科一年级
造物与问道：单片机、人工智能、三维建模、独立游戏、影像、神话与道教文化
${window.location.href}`;

    identityButton?.addEventListener("click", async () => {
      const copied = await copyText(identity);
      const message = copied ? "身份卡已复制，欢迎交换坐标。" : "复制失败，请手动选择页面信息。";
      if (feedback) feedback.textContent = message;
      showToast(message);
    });

    shareButton?.addEventListener("click", async () => {
      const shareData = {
        title: document.title,
        text: "孟子皓 · 造物与问道",
        url: window.location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }
      const copied = await copyText(shareData.url);
      const message = copied ? "页面链接已复制。" : "分享失败，请复制浏览器地址。";
      if (feedback) feedback.textContent = message;
      showToast(message);
    });
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */
  function boot() {
    initClocks();
    initScrollUI();
    initReveals();
    initTilt();
    initIdentityCore();
    initMenu();
    initInterests();
    initBagua();
    const exhibitApi = initExhibits();
    initExplainers(exhibitApi);
    initContact();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
