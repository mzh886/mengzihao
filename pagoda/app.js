/* =========================================================
   应县木塔 · 界面与交互
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.YX;
  var appEl = document.getElementById('app');
  var inspector = document.getElementById('inspector');
  var floorStack = document.getElementById('floorStack');
  var principleList = document.getElementById('principleList');
  var explodeDock = document.getElementById('explodeDock');
  var explodeRange = document.getElementById('explodeRange');
  var explodeValue = document.getElementById('explodeValue');
  var dockHint = document.getElementById('dockHint');
  var loader = document.getElementById('loader');
  var toastEl = document.getElementById('toast');
  var modalLayer = document.getElementById('modalLayer');
  var dougongModal = document.getElementById('dougongModal');
  var aboutModal = document.getElementById('aboutModal');
  var btnRotate = document.getElementById('btnRotate');
  var btnLabels = document.getElementById('btnLabels');
  var btnReset = document.getElementById('btnReset');
  var scene = null;

  var state = {
    mode: 'overview',
    explodeMode: 'floors',
    explodeValue: 0,
    floorId: 'f1',
    principle: 'tube',
    selection: null,
    autoRotate: true,
    labels: true,
    modal: null
  };

  var modeLabels = { overview: '全景', explode: '拆解', floors: '逐层', section: '剖视' };
  var toastTimer = 0;
  var lastFocus = null;
  var dgKey = 'ludou';

  /* ---------- small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2300);
  }
  function findFloor(id) {
    for (var i = 0; i < DATA.floors.length; i++) if (DATA.floors[i].id === id) return DATA.floors[i];
    return DATA.floors[DATA.floors.length - 1];
  }
  function floorIndex(id) {
    for (var i = 0; i < DATA.floors.length; i++) if (DATA.floors[i].id === id) return i;
    return 0;
  }
  function partCount(key) {
    if (!scene) return 0;
    try { return scene.getCountForPart(key); } catch (e) { return 0; }
  }
  function setDockVisible(show) {
    if (!explodeDock) return;
    explodeDock.classList.toggle('is-visible', !!show);
    explodeDock.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
  function updateRangeVisual(value) {
    if (explodeRange) {
      explodeRange.value = value;
      explodeRange.style.setProperty('--fill', value + '%');
    }
    if (explodeValue) explodeValue.textContent = Math.round(value) + '%';
    var ir = $('.js-inspector-explode', inspector);
    if (ir) {
      ir.value = value;
      ir.style.setProperty('--fill', value + '%');
      var out = ir.parentElement && $('output', ir.parentElement);
      if (out) out.textContent = Math.round(value) + '%';
    }
  }
  function setDockHint() {
    if (!dockHint) return;
    dockHint.textContent = state.explodeMode === 'floors'
      ? '拖动滑杆，让九个结构层沿中轴升起'
      : '拖动滑杆，让柱、墙、檐、斗拱向四周展开';
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!window.THREE) {
      showFatal('三维引擎加载失败，请检查 three.min.js 是否存在。');
      return;
    }
    buildFloorStack();
    buildPrinciples();
    bindStaticEvents();
    bindModalEvents();
    bindDougong();
    renderInspector();

    window.setTimeout(function () {
      try {
        scene = new window.PagodaScene({
          onSelect: handleSceneSelect,
          onHover: handleSceneHover,
          onReady: handleReady,
          onAutoChange: function (v) { setAutoUI(v); }
        });
        window.__pagodaScene = scene;
        if (typeof window.__onPagodaReady === 'function') {
          try { window.__onPagodaReady(scene); } catch (err) { console.error(err); }
        }
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          state.autoRotate = false;
          scene.setAutoRotate(false);
          setAutoUI(false);
        }
      } catch (err) {
        console.error(err);
        showFatal('木塔模型未能建立。' + (err && err.message ? '（' + err.message + '）' : ''));
      }
    }, 80);
  }

  function handleReady() {
    if (!loader) return;
    loader.classList.add('is-done');
    window.setTimeout(function () {
      window.scrollTo(0, 0);
    }, 700);
  }

  function showFatal(msg) {
    if (!loader) return;
    loader.innerHTML = '<div class="loader-inner"><div class="loader-seal">塔</div><p style="letter-spacing:.06em">' +
      escapeHTML(msg) + '</p><small>PLEASE CHECK THE LOCAL FILES</small></div>';
  }

  /* ---------- static navigation ---------- */
  function buildFloorStack() {
    if (!floorStack) return;
    var html = '';
    DATA.floors.forEach(function (f) {
      var isHidden = f.kind === 'hidden';
      var kind = f.kind === 'roof' ? '塔顶' : (isHidden ? '暗' : '明');
      html += '<button type="button" class="floor-row ' +
        (isHidden ? 'is-hidden-layer ' : '') +
        (f.kind === 'roof' ? 'is-roof-layer ' : '') +
        '" data-floor="' + f.id + '" role="listitem">' +
        '<span class="floor-name">' + f.name +
        (isHidden ? '<span class="floor-meta">结构夹层 · 无窗无像</span>' :
          '<span class="floor-meta">' + (f.kind === 'roof' ? '八角攒尖 · 塔刹' : '礼佛明层') + '</span>') +
        '</span>' +
        '<span class="floor-kind' + (f.kind === 'roof' ? ' floor-kind--roof' : '') + '">' + kind + '</span>' +
        '</button>';
    });
    floorStack.innerHTML = html;
    floorStack.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-floor]');
      if (!btn) return;
      selectFloor(btn.getAttribute('data-floor'), true);
    });
    updateFloorStackActive();
  }

  function updateFloorStackActive() {
    $all('[data-floor]', floorStack).forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-floor') === state.floorId);
    });
  }

  function buildPrinciples() {
    if (!principleList) return;
    var html = '';
    DATA.principles.forEach(function (p) {
      html += '<button type="button" class="principle-row" data-principle="' + p.id + '">' +
        '<span class="principle-no">' + p.no + '</span>' +
        '<span><span class="principle-name">' + p.name + '</span><span class="principle-en">' + p.en + '</span></span>' +
        '<span class="principle-arrow">→</span></button>';
    });
    principleList.innerHTML = html;
    principleList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-principle]');
      if (!btn) return;
      selectPrinciple(btn.getAttribute('data-principle'));
    });
    updatePrincipleActive();
  }

  function updatePrincipleActive() {
    $all('[data-principle]', principleList).forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-principle') === state.principle);
    });
  }

  function bindStaticEvents() {
    $all('.mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.getAttribute('data-mode'));
      });
    });
    var brand = document.getElementById('brandHome');
    if (brand) brand.addEventListener('click', function (e) {
      e.preventDefault();
      setMode('overview');
    });

    explodeRange.addEventListener('input', function () {
      state.explodeValue = Number(explodeRange.value);
      updateRangeVisual(state.explodeValue);
      if (scene) scene.setExplode(state.explodeValue / 100);
    });
    $all('[data-explode-mode]', explodeDock).forEach(function (btn) {
      btn.addEventListener('click', function () {
        setExplodeMode(btn.getAttribute('data-explode-mode'));
      });
    });

    btnRotate.addEventListener('click', function () {
      state.autoRotate = !state.autoRotate;
      setAutoUI(state.autoRotate);
      if (scene) scene.setAutoRotate(state.autoRotate);
      toast(state.autoRotate ? '自动旋转已开启' : '自动旋转已暂停');
    });
    btnLabels.addEventListener('click', function () {
      state.labels = !state.labels;
      setLabelsUI(state.labels);
      if (scene) scene.setLabels(state.labels);
      toast(state.labels ? '结构标注已显示' : '结构标注已隐藏');
    });
    btnReset.addEventListener('click', function () {
      if (scene) scene.resetView();
      toast('视角已复位');
    });

    document.getElementById('openDougong').addEventListener('click', function () { openModal('dougong'); });
    document.getElementById('openAbout').addEventListener('click', function () { openModal('about'); });

    inspector.addEventListener('click', handleInspectorClick);
    inspector.addEventListener('input', handleInspectorInput);
  }

  function handleInspectorClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    var action = actionBtn.getAttribute('data-action');
    if (action === 'floor') {
      selectFloor(actionBtn.getAttribute('data-id'), true);
    } else if (action === 'floor-step') {
      var idx = floorIndex(state.floorId) + Number(actionBtn.getAttribute('data-step'));
      idx = Math.max(0, Math.min(DATA.floors.length - 1, idx));
      selectFloor(DATA.floors[idx].id, true);
    } else if (action === 'principle') {
      selectPrinciple(actionBtn.getAttribute('data-id'));
    } else if (action === 'look-section') {
      setMode('section');
      if (actionBtn.getAttribute('data-principle')) selectPrinciple(actionBtn.getAttribute('data-principle'));
    } else if (action === 'look-floors') {
      setMode('floors');
    } else if (action === 'open-dougong') {
      openModal('dougong');
    } else if (action === 'back') {
      state.selection = null;
      if (scene) scene.clearSelection();
      renderInspector();
    } else if (action === 'highlight-category') {
      if (scene) scene.selectPartCategory(actionBtn.getAttribute('data-key'));
    } else if (action === 'explode-mode') {
      setExplodeMode(actionBtn.getAttribute('data-mode'));
    }
  }

  function handleInspectorInput(e) {
    if (!e.target.classList.contains('js-inspector-explode')) return;
    state.explodeValue = Number(e.target.value);
    updateRangeVisual(state.explodeValue);
    if (scene) scene.setExplode(state.explodeValue / 100);
  }

  function setExplodeMode(mode) {
    state.explodeMode = mode;
    $all('[data-explode-mode]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-explode-mode') === mode);
    });
    setDockHint();
    if (scene) {
      scene.setExplodeMode(mode);
      scene.setExplode(state.explodeValue / 100);
    }
    renderInspector();
  }

  function setAutoUI(v) {
    state.autoRotate = !!v;
    btnRotate.classList.toggle('is-on', state.autoRotate);
    btnRotate.setAttribute('aria-pressed', state.autoRotate ? 'true' : 'false');
  }

  function setLabelsUI(v) {
    state.labels = !!v;
    btnLabels.classList.toggle('is-on', state.labels);
    btnLabels.setAttribute('aria-pressed', state.labels ? 'true' : 'false');
  }

  /* ---------- mode orchestration ---------- */
  function setMode(mode) {
    if (!modeLabels[mode]) return;
    state.mode = mode;
    state.selection = null;
    appEl.setAttribute('data-mode', mode);
    $all('.mode-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-mode') === mode);
    });
    $all('.rail-section').forEach(function (section) {
      section.classList.toggle('is-active', section.getAttribute('data-rail') === mode);
    });
    if (!scene) {
      renderInspector();
      return;
    }

    scene.setMode(mode);

    if ((mode === 'floors' || mode === 'section') && state.autoRotate) {
      state.autoRotate = false;
      scene.setAutoRotate(false);
      setAutoUI(false);
    }

    if (mode === 'explode') {
      if (state.explodeValue === 0) state.explodeValue = 55;
      setDockVisible(true);
      scene.setExplodeMode(state.explodeMode);
      scene.setExplode(state.explodeValue / 100);
      updateRangeVisual(state.explodeValue);
    } else {
      setDockVisible(false);
      scene.setExplodeTargetZero && scene.setExplodeTargetZero();
    }

    if (mode === 'floors') {
      scene.setFloor(state.floorId);
      updateFloorStackActive();
    }
    if (mode === 'section') {
      scene.setPrinciple(state.principle);
      updatePrincipleActive();
    }
    if (mode === 'overview') {
      scene.clearHighlightOnly();
    }

    renderInspector();
    if (inspector) inspector.scrollTop = 0;
  }

  function selectFloor(id, bringMode) {
    state.floorId = id;
    state.selection = null;
    if (bringMode && state.mode !== 'floors') setMode('floors');
    if (scene) {
      if (scene.state.mode !== 'floors') scene.setMode('floors');
      scene.setFloor(id);
    }
    updateFloorStackActive();
    renderInspector();
    if (inspector) inspector.scrollTop = 0;
  }

  function selectPrinciple(id) {
    state.principle = id;
    state.selection = null;
    if (state.mode !== 'section') {
      setMode('section');
    }
    if (scene) {
      if (scene.state.mode !== 'section') scene.setMode('section');
      scene.setPrinciple(id);
    }
    updatePrincipleActive();
    renderInspector();
    if (inspector) inspector.scrollTop = 0;
  }

  /* ---------- scene callbacks ---------- */
  function handleSceneSelect(info) {
    if (!info) {
      state.selection = null;
      renderInspector();
      hideHoverTip();
      return;
    }
    state.selection = info;
    renderInspector();
    hideHoverTip();
    if (inspector) inspector.scrollTop = 0;
  }

  var hoverTip = null;
  function ensureHoverTip() {
    if (hoverTip) return hoverTip;
    hoverTip = document.createElement('div');
    hoverTip.className = 'hover-tip';
    hoverTip.innerHTML = '<b></b><span></span>';
    appEl.appendChild(hoverTip);
    return hoverTip;
  }
  function handleSceneHover(info, x, y) {
    if (!info || state.modal || state.selection) {
      hideHoverTip();
      return;
    }
    var tip = ensureHoverTip();
    $('b', tip).textContent = info.name;
    $('span', tip).textContent = info.categoryName + (info.floorName ? ' · ' + info.floorName : '');
    var W = window.innerWidth;
    var px = (x || 0) + 16;
    var py = (y || 0) - 12;
    if (px > W - 230) px = (x || 0) - 200;
    tip.style.left = Math.max(8, px) + 'px';
    tip.style.top = Math.max(72, py) + 'px';
    tip.classList.add('is-visible');
  }
  function hideHoverTip() {
    if (hoverTip) hoverTip.classList.remove('is-visible');
  }

  /* ---------- inspector renderers ---------- */
  function renderInspector() {
    if (!inspector) return;
    var html = '';
    if (state.selection) {
      html = renderSelection(state.selection);
    } else if (state.mode === 'overview') {
      html = renderOverview();
    } else if (state.mode === 'explode') {
      html = renderExplode();
    } else if (state.mode === 'floors') {
      html = renderFloor();
    } else if (state.mode === 'section') {
      html = renderSection();
    }
    inspector.innerHTML = html;
    updateRangeVisual(state.explodeValue);
  }

  function renderOverview() {
    return '' +
      '<div class="inspector-view">' +
        '<div class="panel-topline"><div>' +
          '<p class="panel-index">OBJECT FILE <b>01</b></p>' +
          '<h2 class="panel-title">佛宫寺释迦塔<small>SAKYAMUNI PAGODA · YINGXIAN</small></h2>' +
        '</div></div>' +
        '<div class="panel-rule"></div>' +
        '<p class="panel-lead">世界现存最高、最古老的纯木结构楼阁式塔。它在山西应县站了近千年，不用铁钉，以榫卯、梁枋与斗拱层层咬合；外观五层，内部却藏着九层结构。</p>' +
        '<div class="metric-grid">' +
          '<div class="metric-item"><b>67.31<small>m</small></b><span>塔通高</span></div>' +
          '<div class="metric-item"><b>1056</b><span>辽清宁二年始建</span></div>' +
          '<div class="metric-item"><b>明五暗九</b><span>外观五层 · 实为九层</span></div>' +
          '<div class="metric-item"><b>54<small>种</small></b><span>斗拱形制</span></div>' +
        '</div>' +
        '<div class="panel-block">' +
          '<div class="block-head"><h3>先看三处</h3><small>LOOK CLOSER</small></div>' +
          '<div class="look-list">' +
            '<button type="button" class="look-row" data-action="look-section" data-principle="tube">' +
              '<i>01</i><span><b>双层套筒</b><em>内外两圈柱，怎样抱成一根空心木筒？</em></span><span class="look-arrow">→</span>' +
            '</button>' +
            '<button type="button" class="look-row" data-action="open-dougong">' +
              '<i>02</i><span><b>一朵斗拱</b><em>拆开栌斗、华拱与下昂，看它如何传力</em></span><span class="look-arrow">→</span>' +
            '</button>' +
            '<button type="button" class="look-row" data-action="look-floors">' +
              '<i>03</i><span><b>明五暗九</b><em>逐层进入四个没有窗的暗层</em></span><span class="look-arrow">→</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<blockquote class="panel-quote">' +
          '<p>“不见此塔，不知木构的可能性到了什么程度。”</p>' +
          '<cite>梁思成 · 1933 年考察应县木塔</cite>' +
        '</blockquote>' +
        '<p class="panel-footnote">模型为科普性艺术复原，不是测绘复原图；层高、构件数量与细部均有简化。</p>' +
      '</div>';
  }

  function renderExplode() {
    var controls = '' +
      '<div class="explode-control mobile-only">' +
        '<div class="segmented" role="group" aria-label="拆解方式">' +
          '<button type="button" class="' + (state.explodeMode === 'floors' ? 'is-active' : '') + '" data-action="explode-mode" data-mode="floors">楼层分解</button>' +
          '<button type="button" class="' + (state.explodeMode === 'parts' ? 'is-active' : '') + '" data-action="explode-mode" data-mode="parts">构件分解</button>' +
        '</div>' +
        '<div class="range-line" style="margin-top:12px">' +
          '<input type="range" class="mini-range js-inspector-explode" min="0" max="100" value="' + state.explodeValue + '" aria-label="分解程度">' +
          '<output>' + Math.round(state.explodeValue) + '%</output>' +
        '</div>' +
      '</div>';

    var rows = DATA.partOrder.map(function (key) {
      var p = DATA.parts[key];
      var count = partCount(key);
      var countText = key === 'statue' ? '34 尊' : (count ? count + ' 处' : p.short);
      return '<button type="button" class="category-row" data-action="highlight-category" data-key="' + key + '">' +
        '<span class="category-no">' + p.no + '</span>' +
        '<span class="category-label">' + p.name + '</span>' +
        '<small>' + countText + '</small>' +
        '</button>';
    }).join('');

    return '' +
      '<div class="inspector-view">' +
        '<div class="panel-topline"><div>' +
          '<p class="panel-index">EXPLODED ATLAS <b>02</b></p>' +
          '<h2 class="panel-title">拆开一座塔<small>EVERY JOINT HAS A REASON</small></h2>' +
        '</div></div>' +
        '<div class="panel-rule"></div>' +
        '<p class="panel-lead">木塔不是一块整木，而是上万件构件的精密叠合。你可以先按楼层升起，再让墙、檐、柱、拱四散；也可以点选塔上的任意一根构件。</p>' +
        controls +
        '<div class="panel-block">' +
          '<div class="block-head"><h3>构件档案</h3><small>SELECT A FAMILY</small></div>' +
          '<div class="category-list">' + rows + '</div>' +
        '</div>' +
        '<p class="panel-footnote">点击某一类构件，可在塔上高亮全部同类；分解比例越高，构件离塔身越远。</p>' +
      '</div>';
  }

  function floorStrip() {
    var shortName = { roof: '顶', f5: '五', h4: '暗四', f4: '四', h3: '暗三', f3: '三', h2: '暗二', f2: '二', h1: '暗一', f1: '一' };
    return '<div class="mobile-floor-strip" role="tablist" aria-label="选择楼层">' +
      DATA.floors.map(function (f) {
        return '<button type="button" data-action="floor" data-id="' + f.id + '" class="' +
          (state.floorId === f.id ? 'is-active' : '') + '">' + shortName[f.id] + '</button>';
      }).join('') + '</div>';
  }

  function renderFloor() {
    var f = findFloor(state.floorId);
    var idx = floorIndex(state.floorId);
    var prev = DATA.floors[idx - 1];
    var next = DATA.floors[idx + 1];
    var notes = f.notes.map(function (n) {
      return '<div class="floor-note"><dt>' + escapeHTML(n[0]) + '</dt><dd>' + escapeHTML(n[1]) + '</dd></div>';
    }).join('');
    var isHidden = f.kind === 'hidden';
    var isRoof = f.kind === 'roof';
    var visibleStorey = parseInt(f.id.replace('f', ''), 10);
    var hiddenNo = { h1: '01', h2: '02', h3: '03', h4: '04' }[f.id] || '';
    var displayNo = isHidden ? '暗' : isRoof ? '顶' : ('0' + visibleStorey);
    var panelIndex = isHidden
      ? 'HIDDEN LAYER ' + hiddenNo + ' / 04'
      : isRoof ? 'CROWN · 屋顶与塔刹' : 'VISIBLE FLOOR ' + displayNo + ' / 05';
    return '' +
      '<div class="inspector-view">' +
        floorStrip() +
        '<div class="panel-topline"><div>' +
          '<p class="panel-index">' + panelIndex + ' <b>' + escapeHTML(f.tag) + '</b></p>' +
        '</div></div>' +
        '<div class="floor-hero">' +
          '<div class="floor-number">' + displayNo + '</div>' +
          '<div class="floor-hero-copy">' +
            '<div class="floor-kind-label"><i></i>' + f.kindLabel + ' · ' + f.name + '</div>' +
            '<h3>' + escapeHTML(f.title) + '<small>' + escapeHTML(f.tag) + '</small></h3>' +
          '</div>' +
        '</div>' +
        '<p class="floor-detail">' + escapeHTML(f.lead) + '</p>' +
        '<div class="floor-notes">' +
          '<div class="floor-note"><dt>性质</dt><dd>' + (isHidden ? '结构暗层，封闭、无窗、无塑像；在外部被屋檐与平座遮蔽。' : isRoof ? '八角攒尖屋顶与铁刹，是木塔的最高处。' : '礼佛明层，塔身中的柔性层。') + '</dd></div>' +
          notes +
        '</div>' +
        '<div class="floor-nav">' +
          '<button type="button" data-action="floor-step" data-step="-1" ' + (!prev ? 'disabled' : '') + '><span>↑</span>' + (prev ? escapeHTML(prev.name) : '已到顶层') + '</button>' +
          '<button type="button" data-action="floor-step" data-step="1" ' + (!next ? 'disabled' : '') + '>' + (next ? escapeHTML(next.name) : '已到底层') + '<span>↓</span></button>' +
        '</div>' +
        '<p class="panel-footnote">' + (isHidden ? '暗层在剖面中是理解木塔抗震的关键：密集的斜撑把柱框变成了刚性桁架。' : '在塔上点选一根柱子、一朵斗拱或一尊塑像，可继续查看构件档案。') + '</p>' +
      '</div>';
  }

  function principleDiagram(id) {
    var stroke = 'rgba(68,56,40,.7)';
    var red = '#943b2e';
    if (id === 'tube') {
      return '<svg viewBox="0 0 260 112" aria-hidden="true"><g fill="none" stroke="' + stroke + '" stroke-width="1">' +
        '<path d="M35 85 80 23H180l45 62-45 15H80Z"/>' +
        '<path d="M92 78 116 43H144l24 35-24 8H116Z" stroke="' + red + '"/>' +
        '<circle cx="130" cy="61" r="10" stroke="' + red + '" stroke-dasharray="2 3"/>' +
        '<path d="M80 23l36 55M180 23l-36 55M35 85l81-22M225 85l-81-22" stroke-dasharray="2 4" opacity=".5"/>' +
        '</g><text x="130" y="108" text-anchor="middle" font-size="7" fill="#8a8273" letter-spacing="1.5">INNER CORE + OUTER FRAME</text></svg>';
    }
    if (id === 'rigid') {
      return '<svg viewBox="0 0 260 112" aria-hidden="true"><g fill="none" stroke="' + stroke + '" stroke-width="1">' +
        '<rect x="35" y="13" width="190" height="18" fill="rgba(148,59,46,.06)"/>' +
        '<rect x="35" y="47" width="190" height="18" stroke="' + red + '"/>' +
        '<rect x="35" y="81" width="190" height="18" fill="rgba(148,59,46,.06)"/>' +
        '<path d="M48 65l38-18M48 47l38 18M101 65l38-18M101 47l38 18M154 65l38-18M154 47l38 18" stroke="' + red + '" opacity=".7"/>' +
        '</g><text x="130" y="108" text-anchor="middle" font-size="7" fill="#8a8273" letter-spacing="1.5">FLEXIBLE · RIGID · FLEXIBLE</text></svg>';
    }
    if (id === 'dougong') {
      return '<svg viewBox="0 0 260 112" aria-hidden="true"><g fill="none" stroke="' + stroke + '" stroke-width="1">' +
        '<path d="M95 101V73M165 101V73M95 73h70" />' +
        '<path d="M105 73h50v-9h-50zM83 55h94v-9H83zM72 38h116v-8H72z" stroke="' + red + '"/>' +
        '<path d="M89 64 70 51M171 64l19-13M84 47 65 37M176 47l19-10" stroke="' + red + '" opacity=".65"/>' +
        '<path d="M21 21c45-13 83-13 109-8s65 6 109-2" stroke-dasharray="3 4" opacity=".5"/>' +
        '</g><text x="130" y="108" text-anchor="middle" font-size="7" fill="#8a8273" letter-spacing="1.5">STEPPED CANTILEVER</text></svg>';
    }
    if (id === 'chazhu') {
      return '<svg viewBox="0 0 260 112" aria-hidden="true"><g fill="none" stroke="' + stroke + '" stroke-width="1">' +
        '<path d="M52 101V70h42v31M120 101V70h42v31M188 101V70h42v31"/>' +
        '<path d="M66 65h188" stroke="' + red + '"/>' +
        '<path d="M87 42V18M155 42V18M223 42V18" />' +
        '<rect x="74" y="34" width="24" height="8" fill="rgba(148,59,46,.14)" stroke="' + red + '"/>' +
        '<rect x="142" y="34" width="24" height="8" fill="rgba(148,59,46,.14)" stroke="' + red + '"/>' +
        '<rect x="210" y="34" width="24" height="8" fill="rgba(148,59,46,.14)" stroke="' + red + '"/>' +
        '</g><text x="130" y="108" text-anchor="middle" font-size="7" fill="#8a8273" letter-spacing="1.5">COLUMN ON BRACKET</text></svg>';
    }
    return '<svg viewBox="0 0 260 112" aria-hidden="true"><g fill="none" stroke="' + stroke + '" stroke-width="1">' +
      '<path d="M32 96h196l-16-25H48Z"/><path d="M57 71h144l-13-16H70Z" stroke="' + red + '"/>' +
      '<path d="M81 55h94l-10-11H91Z"/><path d="M102 44h52l-8-9h-36Z"/>' +
      '<path d="M130 7v28" stroke="' + red + '" stroke-dasharray="3 3"/>' +
      '<path d="M122 18h16M125 12h10" stroke="' + red + '"/>' +
      '</g><text x="130" y="108" text-anchor="middle" font-size="7" fill="#8a8273" letter-spacing="1.5">WIDE BASE · SOFT TAPER</text></svg>';
  }

  function principleStrip() {
    return '<div class="mobile-principle-strip" role="tablist" aria-label="结构线索">' +
      DATA.principles.map(function (p) {
        return '<button type="button" data-action="principle" data-id="' + p.id + '" class="' +
          (state.principle === p.id ? 'is-active' : '') + '">' + p.name + '</button>';
      }).join('') + '</div>';
  }

  function renderSection() {
    var p = DATA.principles[0];
    DATA.principles.forEach(function (x) { if (x.id === state.principle) p = x; });
    var tags = p.tagsList.map(function (t) { return '<span>' + escapeHTML(t) + '</span>'; }).join('');
    var extraBtn = p.id === 'dougong'
      ? '<button type="button" class="action-btn" data-action="open-dougong">拆开一朵斗拱 <span>→</span></button>'
      : '';
    return '' +
      '<div class="inspector-view">' +
        principleStrip() +
        '<div class="panel-topline"><div>' +
          '<p class="panel-index">STRUCTURAL FILE <b>03</b></p>' +
          '<h2 class="panel-title">' + p.name + '<small>' + p.en + '</small></h2>' +
        '</div></div>' +
        '<div class="panel-rule"></div>' +
        '<div class="principle-hero">' +
          '<h3>' + escapeHTML(p.title) + '</h3>' +
          '<p>' + escapeHTML(p.desc) + '</p>' +
        '</div>' +
        '<div class="principle-diagram">' +
          principleDiagram(p.id) +
          '<p class="diagram-caption">结构关系示意 · NOT TO SCALE</p>' +
        '</div>' +
        '<div class="principle-tags">' + tags + '</div>' +
        '<div class="panel-block">' +
          '<div class="block-head"><h3>在塔上</h3><small>IN THE MODEL</small></div>' +
          '<p class="panel-lead" style="font-size:11px;line-height:1.85">相关构件已经在三维模型中点亮。拖动旋转，剖切面会自动转向你，让塔身内部保持可见。</p>' +
        '</div>' +
        extraBtn +
        '<p class="panel-footnote">这是理解木塔的一条线索，不是唯一答案。五种机制共同工作，才让木塔历经近千年。</p>' +
      '</div>';
  }

  function renderSelection(info) {
    var isCat = info.kind === 'category';
    var cat = DATA.parts[info.partKey] || {};
    var count = partCount(info.partKey);
    var floorChip = info.floorName ? '<span class="part-floor">' + escapeHTML(info.floorName) + '</span>' : '';
    var facts = (info.facts || cat.facts || []).map(function (f) {
      return '<dt>' + escapeHTML(f[0]) + '</dt><dd>' + escapeHTML(f[1]) + '</dd>';
    }).join('');
    var actions = '';
    if (!isCat) {
      actions += '<button type="button" class="ghost-btn" data-action="highlight-category" data-key="' + info.partKey + '">高亮全部同类 <span>→</span></button>';
    }
    actions += '<button type="button" class="ghost-btn" data-action="back">返回' + (modeLabels[state.mode] || '导览') + ' <span>←</span></button>';

    var title = isCat ? info.categoryName : info.name;
    var sub = isCat ? (info.categoryEn || cat.en) : (cat.en || '') + (info.floorName ? ' · ' + info.floorName : '');
    var kicker = isCat ? '构件族 / COMPONENT FAMILY' : '构件档案 / MEMBER FILE';
    var lead = info.description || cat.desc || '';
    var countValue = info.partKey === 'statue'
      ? '全塔现存 34 尊辽代彩塑（模型简化为代表像）'
      : '全塔共 ' + count + ' 处可识别构件';

    return '' +
      '<div class="inspector-view">' +
        '<div class="panel-topline"><div>' +
          '<p class="panel-index">' + kicker + '</p>' +
          '<span class="part-type">' + (isCat ? '构件类别' : escapeHTML(cat.name || '构件')) + floorChip + '</span>' +
          '<h2 class="panel-title">' + escapeHTML(title) + '<small>' + escapeHTML(sub) + '</small></h2>' +
        '</div></div>' +
        '<div class="panel-rule"></div>' +
        '<p class="panel-lead">' + escapeHTML(lead) + '</p>' +
        '<dl class="part-facts">' + facts +
          '<dt>同类构件</dt><dd>' + countValue + '</dd>' +
        '</dl>' +
        '<div class="part-actions">' + actions + '</div>' +
        '<p class="panel-footnote">' + (isCat ? '这一类构件已在塔上高亮。点击塔身可改看单件。' : '你选中的只是其中一件；点击“高亮全部同类”，可以看到它在结构中的伙伴。') + '</p>' +
      '</div>';
  }

  /* ---------- draggable sheet (mobile) ---------- */  (function mobileSheet() {
    var bar = document.getElementById('mobileSheetBar');
    if (!bar) return;
    var startY = 0, startBottom = 0, dragging = false;
    // The sheet bar is visually decorative; the inspector itself scrolls.
    bar.setAttribute('aria-hidden', 'true');
  })();

  /* ---------- modals ---------- */
  function openModal(which) {
    if (state.modal) return;
    state.modal = which;
    lastFocus = document.activeElement;
    modalLayer.hidden = false;
    modalLayer.classList.remove('is-closing');
    dougongModal.hidden = which !== 'dougong';
    aboutModal.hidden = which !== 'about';
    var target = which === 'dougong' ? dougongModal : aboutModal;
    var close = $('.modal-close', target);
    if (close) setTimeout(function () { close.focus(); }, 60);
    document.body.classList.add('modal-open');
    hideHoverTip();
    if (which === 'dougong') updateDougong(dgKey);
  }
  function closeModal() {
    if (!state.modal) return;
    state.modal = null;
    modalLayer.hidden = true;
    dougongModal.hidden = true;
    aboutModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function bindModalEvents() {
    $all('[data-close-modal]').forEach(function (el) { el.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (state.modal) closeModal();
      }
    });
  }

  /* ---------- dougong diagram ---------- */
  function updateDougong(key) {
    dgKey = key;
    var d = DATA.dougong[key];
    if (!d) return;
    $all('#dougongSvg .dg-part').forEach(function (g) {
      g.classList.toggle('is-active', g.getAttribute('data-dg') === key);
      g.classList.toggle('is-dim', false);
    });
    $all('#dougongSvg .dg-num').forEach(function (n) {
      n.classList.toggle('is-active', n.getAttribute('data-dgnum') === key);
    });
    $all('.dg-chip').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-dgkey') === key);
    });
    var copy = document.getElementById('dgCopy');
    if (copy) {
      copy.innerHTML = '<p class="dg-kicker">' + d.kicker + '</p><h3>' + d.name + '</h3><p>' + d.body + '</p>';
    }
    var loadBar = document.getElementById('dgLoadBar');
    var moveBar = document.getElementById('dgMoveBar');
    if (loadBar) loadBar.style.width = d.load + '%';
    if (moveBar) moveBar.style.width = d.move + '%';
    var force = document.getElementById('dgForce');
    if (force) force.classList.remove('is-on');
  }

  function bindDougong() {
    $all('#dougongSvg .dg-part').forEach(function (g) {
      g.addEventListener('click', function () { updateDougong(g.getAttribute('data-dg')); });
      g.addEventListener('mouseenter', function () { if (state.modal === 'dougong') updateDougong(g.getAttribute('data-dg')); });
    });
    $all('.dg-chip').forEach(function (b) {
      b.addEventListener('click', function () { updateDougong(b.getAttribute('data-dgkey')); });
    });
    var shake = document.getElementById('shakeDougong');
    if (shake) {
      shake.addEventListener('click', function () {
        var assembly = document.getElementById('dgAssembly');
        var force = document.getElementById('dgForce');
        if (!assembly) return;
        assembly.classList.remove('is-shaking');
        void assembly.offsetWidth;
        assembly.classList.add('is-shaking');
        if (force) force.classList.add('is-on');
        shake.classList.add('is-active');
        if (window.__dgTimer) clearTimeout(window.__dgTimer);
        window.__dgTimer = setTimeout(function () {
          assembly.classList.remove('is-shaking');
          if (force) force.classList.remove('is-on');
        }, 1400);
        if (dgKey === 'ludou') updateDougong('huagong');
        var loadBar = document.getElementById('dgLoadBar');
        var moveBar = document.getElementById('dgMoveBar');
        if (loadBar) loadBar.style.width = '46%';
        if (moveBar) moveBar.style.width = '78%';
      });
    }
    updateDougong('ludou');
  }

  /* ---------- URL hash: lightweight entry points ---------- */
  function applyHash() {
    var h = (location.hash || '').replace('#', '');
    if (h === 'dougong') openModal('dougong');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot();
      applyHash();
    });
  } else {
    boot();
    applyHash();
  }
})();
