/* =========================================================
   应县木塔 · 程序化三维木构
   Three.js r160 / classic script
   All geometry, textures and lighting are generated in code.
   ========================================================= */
(function () {
  'use strict';

  var T = window.THREE;
  if (!T) {
    console.error('Three.js 未加载');
    return;
  }

  var PI = Math.PI;
  var TAU = PI * 2;
  var OCT = PI / 4;
  var SIDE_NAMES = ['南', '东南', '东', '东北', '北', '西北', '西', '西南'];
  var V2 = T.Vector2;
  var V3 = T.Vector3;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  /* deterministic pseudo random, so every visit builds the same tower */
  var seed = 1056;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function randRange(a, b) { return a + (b - a) * rand(); }

  /* ---------------- canvas textures ---------------- */
  function makeCanvas(size) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  }

  function finishTexture(canvas, repeatX, repeatY, srgb) {
    var tex = new T.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX || 1, repeatY || 1);
    tex.anisotropy = 4;
    if (srgb !== false) tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  function makeWoodMap() {
    var s = 512;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#f0e7da';
    ctx.fillRect(0, 0, s, s);
    for (var k = 0; k < 240; k++) {
      var x = rand() * s;
      var w = randRange(.4, 2.0);
      var alpha = randRange(.025, .13);
      ctx.strokeStyle = 'rgba(82,51,28,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = w;
      ctx.beginPath();
      var xx = x;
      ctx.moveTo(xx, 0);
      for (var y = 0; y <= s; y += 16) {
        xx += Math.sin((y + k * 37) * .024) * .8 + randRange(-1.1, 1.1);
        ctx.lineTo(xx, y);
      }
      ctx.stroke();
    }
    for (var n = 0; n < 14; n++) {
      var cx = rand() * s, cy = rand() * s;
      ctx.strokeStyle = 'rgba(78,47,25,.12)';
      ctx.lineWidth = 1;
      for (var r = 2; r < 14; r += 3) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.8, r * .72, rand() * 1.2, 0, TAU);
        ctx.stroke();
      }
    }
    for (var d = 0; d < 1400; d++) {
      ctx.fillStyle = 'rgba(65,43,24,' + randRange(.015, .05).toFixed(3) + ')';
      ctx.fillRect(rand() * s, rand() * s, 1, randRange(1, 4));
    }
    return finishTexture(c, 1, 2);
  }

  function makeTileMap() {
    var s = 512;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#66695d';
    ctx.fillRect(0, 0, s, s);
    var cols = 9;
    var step = s / cols;
    for (var i = 0; i < cols; i++) {
      var x = i * step;
      var g = ctx.createLinearGradient(x, 0, x + step, 0);
      g.addColorStop(0, 'rgba(28,31,26,.52)');
      g.addColorStop(.13, 'rgba(120,124,111,.25)');
      g.addColorStop(.5, 'rgba(142,145,129,.18)');
      g.addColorStop(.88, 'rgba(70,73,64,.18)');
      g.addColorStop(1, 'rgba(25,28,23,.46)');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, step, s);
      ctx.fillStyle = 'rgba(204,201,181,.12)';
      ctx.fillRect(x + step * .47, 0, 1.2, s);
    }
    var rows = 7;
    var rh = s / rows;
    for (var j = 0; j < rows; j++) {
      var y = j * rh;
      ctx.fillStyle = 'rgba(35,37,31,.35)';
      ctx.fillRect(0, y, s, 2.2);
      ctx.fillStyle = 'rgba(203,199,178,.14)';
      ctx.fillRect(0, y + 2.2, s, 1);
      ctx.fillStyle = 'rgba(26,29,24,.13)';
      ctx.fillRect(0, y + rh * .55, s, 2);
    }
    for (var n = 0; n < 5000; n++) {
      ctx.fillStyle = 'rgba(' + [Math.round(randRange(40, 110)), Math.round(randRange(45, 110)), Math.round(randRange(40, 95))].join(',') + ',' + randRange(.02, .09).toFixed(3) + ')';
      ctx.fillRect(rand() * s, rand() * s, randRange(1, 3), randRange(1, 3));
    }
    return finishTexture(c, 1, 1);
  }

  function makeStoneMap() {
    var s = 512;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#c8c0b0';
    ctx.fillRect(0, 0, s, s);
    for (var n = 0; n < 9000; n++) {
      var v = Math.round(randRange(95, 190));
      ctx.fillStyle = 'rgba(' + v + ',' + (v - 4) + ',' + (v - 12) + ',' + randRange(.02, .12).toFixed(3) + ')';
      ctx.fillRect(rand() * s, rand() * s, randRange(.6, 2.4), randRange(.6, 2.4));
    }
    ctx.strokeStyle = 'rgba(72,62,48,.13)';
    for (var i = 0; i < 18; i++) {
      ctx.lineWidth = randRange(.4, 1.2);
      ctx.beginPath();
      var x = rand() * s, y = rand() * s;
      ctx.moveTo(x, y);
      for (var k = 0; k < 5; k++) {
        x += randRange(-28, 34);
        y += randRange(-12, 20);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return finishTexture(c, 1.8, 1.8);
  }

  function makePlasterMap() {
    var s = 256;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#eee5d4';
    ctx.fillRect(0, 0, s, s);
    for (var n = 0; n < 6000; n++) {
      var v = Math.round(randRange(145, 235));
      ctx.fillStyle = 'rgba(' + v + ',' + (v - 5) + ',' + (v - 18) + ',' + randRange(.015, .07).toFixed(3) + ')';
      ctx.fillRect(rand() * s, rand() * s, randRange(.5, 2.2), randRange(.5, 2.2));
    }
    return finishTexture(c, 2.4, 2.4);
  }

  function makeFloorMap() {
    var s = 512;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#e7d8c1';
    ctx.fillRect(0, 0, s, s);
    var planks = 9;
    for (var i = 0; i < planks; i++) {
      var y = i * s / planks;
      ctx.fillStyle = 'rgba(80,53,32,' + randRange(.03, .11).toFixed(3) + ')';
      ctx.fillRect(0, y, s, s / planks);
      ctx.fillStyle = 'rgba(52,35,22,.18)';
      ctx.fillRect(0, y, s, 1.4);
    }
    for (var k = 0; k < 260; k++) {
      ctx.strokeStyle = 'rgba(79,50,28,' + randRange(.02, .075).toFixed(3) + ')';
      ctx.lineWidth = randRange(.4, 1.2);
      ctx.beginPath();
      var yy = rand() * s;
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(s * .3, yy + randRange(-4, 4), s * .7, yy + randRange(-4, 4), s, yy + randRange(-4, 4));
      ctx.stroke();
    }
    return finishTexture(c, 3, 3);
  }

  function makeGroundMap() {
    var s = 1024;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(s / 2, s / 2, s * .02, s / 2, s / 2, s * .5);
    g.addColorStop(0, 'rgba(215,203,184,.95)');
    g.addColorStop(.28, 'rgba(226,215,197,.72)');
    g.addColorStop(.62, 'rgba(236,226,209,.1)');
    g.addColorStop(1, 'rgba(236,226,209,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(88,72,50,.16)';
    ctx.lineWidth = 1.2;
    var rings = [.17, .26, .35, .455];
    for (var r = 0; r < rings.length; r++) {
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s * rings[r], 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(88,72,50,.09)';
    ctx.lineWidth = .8;
    for (var i = 0; i < 32; i++) {
      var a = i / 32 * TAU;
      ctx.beginPath();
      ctx.moveTo(s / 2 + Math.cos(a) * s * .17, s / 2 + Math.sin(a) * s * .17);
      ctx.lineTo(s / 2 + Math.cos(a) * s * .47, s / 2 + Math.sin(a) * s * .47);
      ctx.stroke();
    }
    return finishTexture(c, 1, 1);
  }

  function makeShadowMap() {
    var s = 512;
    var c = makeCanvas(s);
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(s / 2, s / 2, s * .03, s / 2, s / 2, s * .48);
    g.addColorStop(0, 'rgba(47,36,20,.52)');
    g.addColorStop(.35, 'rgba(58,45,27,.35)');
    g.addColorStop(.68, 'rgba(70,55,34,.16)');
    g.addColorStop(1, 'rgba(80,64,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return finishTexture(c, 1, 1);
  }

  function makePlaqueMap(chars, vertical) {
    var w = vertical ? 256 : 640;
    var h = vertical ? 640 : 240;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#35251a';
    ctx.fillRect(0, 0, w, h);
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255,237,196,.15)');
    grad.addColorStop(.5, 'rgba(255,237,196,0)');
    grad.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c5a066';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.fillStyle = '#ddb873';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (vertical) {
      var fs = Math.min(102, (h - 100) / chars.length * .75);
      ctx.font = '600 ' + fs + 'px "Noto Serif SC","Songti SC",serif';
      for (var i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], w / 2, 58 + fs * .68 + i * fs * 1.18);
      }
    } else {
      var f = Math.min(94, (w - 80) / chars.length * .8);
      ctx.font = '600 ' + f + 'px "Noto Serif SC","Songti SC",serif';
      ctx.fillText(chars, w / 2, h / 2 + 4);
    }
    var tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /* ---------------- geometry helpers ---------------- */
  function mergeGeometries(list) {
    var pos = [], nor = [], uv = [];
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      if (!g) continue;
      if (!g.attributes.normal) g.computeVertexNormals();
      var ng = g.index ? g.toNonIndexed() : g;
      var p = ng.attributes.position;
      var n = ng.attributes.normal;
      var u = ng.attributes.uv;
      for (var j = 0; j < p.count; j++) {
        pos.push(p.getX(j), p.getY(j), p.getZ(j));
        nor.push(n.getX(j), n.getY(j), n.getZ(j));
        if (u) uv.push(u.getX(j), u.getY(j)); else uv.push(0, 0);
      }
      if (ng !== g) ng.dispose();
    }
    var out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    out.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    out.computeBoundingSphere();
    return out;
  }

  function boxGeo(w, h, d, x, y, z, ry, rx) {
    var g = new T.BoxGeometry(w, h, d);
    if (rx) g.applyMatrix4(new T.Matrix4().makeRotationX(rx));
    if (ry) g.applyMatrix4(new T.Matrix4().makeRotationY(ry));
    g.translate(x || 0, y || 0, z || 0);
    return g;
  }

  function cylinderBetween(a, b, radius, segments) {
    var dir = new V3().subVectors(b, a);
    var len = dir.length();
    if (len < 0.001) return null;
    var g = new T.CylinderGeometry(radius, radius, len, segments || 6, 1, false);
    var mid = new V3().addVectors(a, b).multiplyScalar(.5);
    var q = new T.Quaternion().setFromUnitVectors(new V3(0, 1, 0), dir.clone().normalize());
    var m = new T.Matrix4().compose(mid, q, new V3(1, 1, 1));
    g.applyMatrix4(m);
    return g;
  }

  function octagonPoints(radius, y) {
    var pts = [];
    for (var k = 0; k < 8; k++) {
      var a = -PI / 8 + k * OCT;
      pts.push(new V3(radius * Math.sin(a), y || 0, radius * Math.cos(a)));
    }
    return pts;
  }

  function facePoint(radius, i, t) {
    var a0 = -PI / 8 + i * OCT;
    var a1 = a0 + OCT;
    var a = lerp(a0, a1, t);
    return new V3(radius * Math.sin(a), 0, radius * Math.cos(a));
  }

  function sideYaw(i) { return i * OCT; }

  function planeGeo(w, h, x, y, z, ry) {
    var g = new T.PlaneGeometry(w, h);
    if (ry) g.rotateY(ry);
    g.translate(x || 0, y || 0, z || 0);
    return g;
  }

  function makeOctPrism(radius, height) {
    return new T.CylinderGeometry(radius, radius, height, 8, 1, false, PI / 8, TAU);
  }

  function makeLatticeGeometry(w, h, cols, rows, bar, depth, y0) {
    var g = [];
    var z = 0;
    g.push(boxGeo(w, bar, depth, 0, y0 || 0, z));
    g.push(boxGeo(w, bar, depth, 0, (y0 || 0) + h, z));
    g.push(boxGeo(bar, h, depth, -w / 2, (y0 || 0) + h / 2, z));
    g.push(boxGeo(bar, h, depth, w / 2, (y0 || 0) + h / 2, z));
    for (var i = 1; i < cols; i++) {
      g.push(boxGeo(bar * .55, h, depth * .8, -w / 2 + i * w / cols, (y0 || 0) + h / 2, z));
    }
    for (var j = 1; j < rows; j++) {
      g.push(boxGeo(w, bar * .55, depth * .8, 0, (y0 || 0) + j * h / rows, z));
    }
    return g;
  }

  /* ---------------- data ---------------- */
  var PARTS = window.YX.parts;

  var LEVEL_GEOM = {
    f1: { floor: 4.2, eave: 16.15, lowEave: 10.85, outerR: 12.95, verandaR: 15.65, balconyR: 16.3, innerR: 6.25, wallR: 12.35 },
    h1: { y0: 16.15, y1: 19.4, outerR: 12.15, innerR: 6.05, enclosureR: 11.55 },
    f2: { floor: 19.4, eave: 26.15, outerR: 12.1, verandaR: 0, balconyR: 14.35, innerR: 6.0, wallR: 11.55 },
    h2: { y0: 26.15, y1: 29.0, outerR: 11.4, innerR: 5.75, enclosureR: 10.85 },
    f3: { floor: 29.0, eave: 34.75, outerR: 11.35, verandaR: 0, balconyR: 13.45, innerR: 5.7, wallR: 10.85 },
    h3: { y0: 34.75, y1: 37.15, outerR: 10.65, innerR: 5.45, enclosureR: 10.15 },
    f4: { floor: 37.15, eave: 42.35, outerR: 10.6, verandaR: 0, balconyR: 12.65, innerR: 5.4, wallR: 10.15 },
    h4: { y0: 42.35, y1: 44.35, outerR: 9.9, innerR: 5.15, enclosureR: 9.45 },
    f5: { floor: 44.35, eave: 49.0, outerR: 9.85, verandaR: 0, balconyR: 11.9, innerR: 5.15, wallR: 9.45 },
    roof: { yBase: 49.0, yTop: 55.6, baseR: 10.0 }
  };

  var CAMERA_BOUNDS = {
    f1: { y0: 4.0, y1: 16.4, r: 16.4 },
    h1: { y0: 16.1, y1: 19.5, r: 12.2 },
    f2: { y0: 19.2, y1: 26.4, r: 14.5 },
    h2: { y0: 26.1, y1: 29.1, r: 11.5 },
    f3: { y0: 28.8, y1: 34.9, r: 13.6 },
    h3: { y0: 34.7, y1: 37.3, r: 10.7 },
    f4: { y0: 37.0, y1: 42.5, r: 12.8 },
    h4: { y0: 42.3, y1: 44.5, r: 10.0 },
    f5: { y0: 44.2, y1: 49.2, r: 12.0 },
    roof: { y0: 48.8, y1: 67.4, r: 13.0 }
  };

  var STACK = ['f1', 'h1', 'f2', 'h2', 'f3', 'h3', 'f4', 'h4', 'f5', 'roof'];

  /* ---------------- main class ---------------- */
  function PagodaScene(options) {
    this.opts = options || {};
    this.canvas = document.getElementById('scene');
    this.labelLayer = document.getElementById('sceneLabels');
    this.railEl = document.getElementById('rail');
    this.inspectorEl = document.getElementById('inspector');
    this.onSelect = this.opts.onSelect || function () {};
    this.onHover = this.opts.onHover || function () {};
    this.onReady = this.opts.onReady || function () {};
    this.onAutoChange = this.opts.onAutoChange || function () {};

    this.state = {
      mode: 'overview',
      explodeMode: 'floors',
      explode: 0,
      explodeTarget: 0,
      floorId: 'f1',
      principle: 'tube',
      autoRotate: true,
      labels: true,
      selected: null,
      hovered: null,
      cutaway: false
    };

    this.units = [];
    this.shells = [];
    this.levels = {};
    this.pickRoots = [];
    this.partsById = {};
    this.highlighted = [];
    this.highlightMats = [];
    this.selectedTarget = null;
    this.selectedAnchor = null;
    this.labelItems = [];
    this.lastExplodeFit = -1;
    this.pointer = { down: false, moved: false, x: 0, y: 0, lastX: 0, lastY: 0, id: null };
    this.pointers = new Map();
    this.pinchStart = 0;
    this.pinchRadius = 0;
    this.hoverRaf = 0;
    this.clock = new T.Clock();
    this.tmp = new V3();
    this.raycaster = new T.Raycaster();
    this.clientPointer = new T.Vector2();
    this.firstFrame = true;

    this.materials = this.createMaterials();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.build();
    this.bindEvents();
    this.resize();
    this.setMode('overview', true);
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  PagodaScene.prototype.createMaterials = function () {
    var woodMap = makeWoodMap();
    var tileMap = makeTileMap();
    var stoneMap = makeStoneMap();
    var plasterMap = makePlasterMap();
    var floorMap = makeFloorMap();
    this.textures = { wood: woodMap, tile: tileMap, stone: stoneMap, plaster: plasterMap, floor: floorMap };

    var M = T.MeshStandardMaterial;
    return {
      wood: new M({ color: 0x7f5839, map: woodMap, bumpMap: woodMap, bumpScale: .022, roughness: .73, metalness: .015 }),
      woodDark: new M({ color: 0x4d3625, map: woodMap, bumpMap: woodMap, bumpScale: .018, roughness: .8, metalness: .01 }),
      woodWarm: new M({ color: 0x9a6d45, map: woodMap, bumpMap: woodMap, bumpScale: .016, roughness: .7, metalness: .02 }),
      woodRed: new M({ color: 0x783b2d, map: woodMap, bumpMap: woodMap, bumpScale: .02, roughness: .62, metalness: .015 }),
      beam: new M({ color: 0x765539, map: woodMap, bumpMap: woodMap, bumpScale: .02, roughness: .76, metalness: .01 }),
      dougong: new M({ color: 0x855736, map: woodMap, bumpMap: woodMap, bumpScale: .018, roughness: .74, metalness: .015 }),
      floor: new M({ color: 0x9c7b58, map: floorMap, bumpMap: floorMap, bumpScale: .03, roughness: .8, metalness: .005 }),
      plaster: new M({ color: 0xe6dcc9, map: plasterMap, bumpMap: plasterMap, bumpScale: .024, roughness: .94, metalness: 0 }),
      roof: new M({ color: 0xffffff, map: tileMap, bumpMap: tileMap, bumpScale: .035, roughness: .86, metalness: .02, side: T.DoubleSide }),
      roofUnder: new M({ color: 0x5a4531, map: woodMap, roughness: .88, metalness: .01, side: T.DoubleSide }),
      stone: new M({ color: 0xffffff, map: stoneMap, bumpMap: stoneMap, bumpScale: .03, roughness: .92, metalness: .01 }),
      stoneDark: new M({ color: 0x9d927f, map: stoneMap, roughness: .95, metalness: .01 }),
      redLacquer: new M({ color: 0x8d3d2e, map: woodMap, bumpMap: woodMap, bumpScale: .015, roughness: .5, metalness: .03 }),
      gold: new M({ color: 0xc09a5d, metalness: .45, roughness: .38, emissive: 0x2b1c08, emissiveIntensity: .18 }),
      bronze: new M({ color: 0x6d5736, metalness: .65, roughness: .4 }),
      iron: new M({ color: 0x403c35, metalness: .72, roughness: .46 }),
      paper: new M({ color: 0xd7c4a0, emissive: 0x6a4a25, emissiveIntensity: .13, roughness: .92, side: T.DoubleSide }),
      statue: new M({ color: 0xd0a764, metalness: .22, roughness: .43, emissive: 0x3a250a, emissiveIntensity: .24 }),
      statueRed: new M({ color: 0x8a432f, roughness: .62, metalness: .08 }),
      hair: new M({ color: 0x3e2c1e, roughness: .68, metalness: .04 }),
      plaque: new M({ color: 0xffffff, map: makePlaqueMap('佛宫寺释迦塔', true), roughness: .6 }),
      plaque2: new M({ color: 0xffffff, map: makePlaqueMap('峻极神工', false), roughness: .6 })
    };
  };

  PagodaScene.prototype.initRenderer = function () {
    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 800 ? 1.6 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = false;
  };

  PagodaScene.prototype.initCamera = function () {
    var fov = 30;
    this.camera = new T.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, .2, 800);
    this.orbit = {
      theta: .52, phi: 1.40, radius: 190,
      target: new V3(0, 34, 0),
      goalTheta: .52, goalPhi: 1.40, goalRadius: 190,
      goalTarget: new V3(0, 34, 0)
    };
    this.lens = { x: 0, y: 0 };
    this.layout = { left: 0, right: 0, top: 0, bottom: 0, availW: 1, availH: 1 };
    this.camera.position.set(
      this.orbit.target.x + this.orbit.radius * Math.sin(this.orbit.phi) * Math.sin(this.orbit.theta),
      this.orbit.target.y + this.orbit.radius * Math.cos(this.orbit.phi),
      this.orbit.target.z + this.orbit.radius * Math.sin(this.orbit.phi) * Math.cos(this.orbit.theta)
    );
    this.camera.lookAt(this.orbit.target);
  };

  PagodaScene.prototype.initLights = function () {
    this.scene = new T.Scene();
    var hemi = new T.HemisphereLight(0xfff6e5, 0x8e7c63, 1.7);
    this.scene.add(hemi);
    var key = new T.DirectionalLight(0xfff2dc, 2.25);
    key.position.set(-46, 88, 58);
    this.scene.add(key);
    var fill = new T.DirectionalLight(0xbfd1d2, .75);
    fill.position.set(62, 35, -32);
    this.scene.add(fill);
    var rim = new T.DirectionalLight(0xffdfb4, .62);
    rim.position.set(18, 48, -80);
    this.scene.add(rim);
    var frontFill = new T.DirectionalLight(0xffe8cc, .46);
    frontFill.position.set(34, 18, 76);
    this.scene.add(frontFill);

    this.pagoda = new T.Group();
    this.horizontalScale = .9;
    this.pagoda.scale.set(this.horizontalScale, 1, this.horizontalScale);
    this.scene.add(this.pagoda);
    this.baseGroup = new T.Group();
    this.pagoda.add(this.baseGroup);
  };

  PagodaScene.prototype.addPick = function (object, info, unitInfo) {
    object.userData.pickInfo = info;
    this.partsById[info.partKey] = this.partsById[info.partKey] || [];
    this.partsById[info.partKey].push(object);
    if (unitInfo) {
      var anchor = unitInfo.anchor || object.position;
      var outward = new V3(anchor.x, 0, anchor.z);
      if (outward.lengthSq() < .01) outward.set(0, 0, 1);
      outward.normalize();
      var catOut = unitInfo.outward != null ? unitInfo.outward : this.defaultOutward(info.partKey);
      var up = unitInfo.up != null ? unitInfo.up : this.defaultUp(info.partKey);
      var offset = outward.clone().multiplyScalar(catOut);
      offset.y += up;
      if (unitInfo.extra) offset.add(unitInfo.extra);
      this.units.push({
        object: object,
        base: object.position.clone(),
        offset: offset,
        anchor: anchor.clone(),
        partKey: info.partKey,
        level: info.floorId
      });
    }
    return object;
  };

  PagodaScene.prototype.defaultOutward = function (key) {
    switch (key) {
      case 'wall': return 17;
      case 'eave': return 8;
      case 'dougong': return 11;
      case 'columns': return 4.8;
      case 'beams': return 1.2;
      case 'braces': return 6;
      case 'floor': return 1.6;
      case 'finial': return 0;
      default: return 1.4;
    }
  };

  PagodaScene.prototype.defaultUp = function (key) {
    switch (key) {
      case 'wall': return 1;
      case 'eave': return 4.8;
      case 'dougong': return 2.7;
      case 'columns': return .2;
      case 'beams': return 1.1;
      case 'braces': return 1;
      case 'floor': return .1;
      case 'finial': return 7;
      default: return .2;
    }
  };

  PagodaScene.prototype.makeInfo = function (partKey, name, floorId, extra) {
    var cat = PARTS[partKey];
    var fl = null;
    for (var i = 0; i < window.YX.floors.length; i++) {
      if (window.YX.floors[i].id === floorId) fl = window.YX.floors[i];
    }
    var info = {
      kind: 'part',
      partKey: partKey,
      categoryName: cat.name,
      categoryEn: cat.en,
      categoryShort: cat.short,
      description: cat.desc,
      facts: cat.facts,
      name: name,
      floorId: floorId || null,
      floorName: fl ? fl.name : '',
      tags: (extra && extra.tags) || [],
      count: 1
    };
    return info;
  };

  PagodaScene.prototype.addLevel = function (id, stackIndex) {
    var g = new T.Group();
    g.name = 'level-' + id;
    g.userData.levelId = id;
    this.pagoda.add(g);
    this.levels[id] = { group: g, id: id, stack: stackIndex, unitStart: this.units.length, box: null };
    return g;
  };

  PagodaScene.prototype.build = function () {
    var self = this;
    /* ground */
    var groundMap = makeGroundMap();
    var groundMat = new T.MeshBasicMaterial({ map: groundMap, transparent: true, depthWrite: false, opacity: .95, side: T.DoubleSide });
    var ground = new T.Mesh(new T.PlaneGeometry(210, 210), groundMat);
    ground.rotation.x = -PI / 2;
    ground.position.y = -.05;
    ground.renderOrder = -2;
    this.pagoda.add(ground);

    var shadowMap = makeShadowMap();
    var shadowMat = new T.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 1 });
    var shadow = new T.Mesh(new T.PlaneGeometry(92, 82), shadowMat);
    shadow.rotation.x = -PI / 2;
    shadow.position.set(4, -.02, 7);
    shadow.renderOrder = -1;
    this.pagoda.add(shadow);

    this.buildBase();
    this.buildVisibleFloor('f1', 0);
    this.buildHiddenLevel('h1', 1);
    this.buildVisibleFloor('f2', 2);
    this.buildHiddenLevel('h2', 3);
    this.buildVisibleFloor('f3', 4);
    this.buildHiddenLevel('h3', 5);
    this.buildVisibleFloor('f4', 6);
    this.buildHiddenLevel('h4', 7);
    this.buildVisibleFloor('f5', 8);
    this.buildRoof(9);
    this.buildFinial();
    this.buildChains();
    this.buildGuides();
    this.pagoda.updateMatrixWorld(true);

    for (var id in this.levels) {
      var group = this.levels[id].group;
      var box = new T.Box3().setFromObject(group);
      if (box.isEmpty()) {
        var cb = CAMERA_BOUNDS[id];
        box = new T.Box3(new V3(-cb.r, cb.y0, -cb.r), new V3(cb.r, cb.y1, cb.r));
      }
      this.levels[id].box = box;
    }
    this.pickRoots = [this.baseGroup].concat(Object.keys(this.levels).map(function (id) { return self.levels[id].group; }));
    this.baseBox = new T.Box3().setFromObject(this.baseGroup);
    this.fullBox = new T.Box3(new V3(-20, 0, -20), new V3(20, 67.4, 20));
    this.collectFitSamples();
    this.updateVisibility();
    this.updateLabels();
  };

  PagodaScene.prototype.collectFitSamples = function () {
    var self = this;
    this.fitSamples = { all: [], base: [], levels: {} };
    var sample = function (root, out) {
      if (!root) return out;
      root.updateWorldMatrix(true, true);
      root.traverse(function (obj) {
        if (!obj.isMesh || !obj.geometry || !obj.geometry.attributes.position) return;
        var pos = obj.geometry.attributes.position;
        var v = new V3();
        var stride = Math.max(1, Math.floor(pos.count / 14));
        for (var i = 0; i < pos.count; i += stride) {
          v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
          out.push(v.clone());
        }
        if (pos.count) {
          v.fromBufferAttribute(pos, pos.count - 1).applyMatrix4(obj.matrixWorld);
          out.push(v.clone());
        }
        obj.geometry.computeBoundingBox();
        var bb = obj.geometry.boundingBox;
        if (bb) {
          for (var ix = 0; ix < 2; ix++) {
            for (var iy = 0; iy < 2; iy++) {
              for (var iz = 0; iz < 2; iz++) {
                v.set(ix ? bb.max.x : bb.min.x, iy ? bb.max.y : bb.min.y, iz ? bb.max.z : bb.min.z)
                  .applyMatrix4(obj.matrixWorld);
                out.push(v.clone());
              }
            }
          }
        }
      });
      return out;
    };
    sample(this.baseGroup, this.fitSamples.base);
    for (var id in this.levels) {
      var pts = [];
      sample(this.levels[id].group, pts);
      this.fitSamples.levels[id] = pts;
      this.fitSamples.all = this.fitSamples.all.concat(pts);
    }
    this.fitSamples.all = this.fitSamples.all.concat(this.fitSamples.base);
  };

  /* ---------------- base ---------------- */
  PagodaScene.prototype.buildBase = function () {
    var g = this.baseGroup;
    var stone = this.materials.stone;
    var stoneDark = this.materials.stoneDark;

    var lower = new T.Mesh(new T.BoxGeometry(43, 2, 43), stone);
    lower.position.y = 1;
    g.add(lower);
    var lowerBand = new T.Mesh(new T.BoxGeometry(43.35, .22, 43.35), stoneDark);
    lowerBand.position.y = 1.98;
    g.add(lowerBand);
    var lowerGeom = new T.BoxGeometry(43.4, .28, 43.4);
    var lowerCap = new T.Mesh(lowerGeom, stoneDark);
    lowerCap.position.y = 2.0;
    g.add(lowerCap);
    var upper = new T.Mesh(makeOctPrism(19.15, 2.0), stone);
    upper.position.y = 3.0;
    g.add(upper);
    var upperCap = new T.Mesh(makeOctPrism(19.3, .2), stoneDark);
    upperCap.position.y = 4.0;
    g.add(upperCap);

    var platformInfo = this.makeInfo('platform', '台基 · 八角石台', 'f1', { tags: ['foundation'] });
    this.addPick(lower, platformInfo, null);
    this.addPick(upper, platformInfo, null);

    /* south stair: two flights, ground -> square terrace -> octagonal terrace */
    var stepGeoms = [];
    for (var i = 0; i < 4; i++) {
      var height = (i + 1) * .5;
      var depth = 3.0 - i * .66;
      stepGeoms.push(boxGeo(7.4, height, depth, 0, height / 2, 21.5 + depth / 2 - .2));
    }
    for (var j = 0; j < 4; j++) {
      var h2 = (j + 1) * .5;
      var dep = 4.3 - j * .86;
      stepGeoms.push(boxGeo(6.4, h2, dep, 0, 2 + h2 / 2, 17.75 + dep / 2 - .1));
    }
    var stair = new T.Mesh(mergeGeometries(stepGeoms), stone);
    g.add(stair);
    this.addPick(stair, this.makeInfo('platform', '台基 · 南面踏道', 'f1', { tags: ['foundation'] }), null);

    /* broad lower terrace edge: a quiet stone border */
    var trim = [];
    for (var s = 0; s < 8; s++) {
      var a0 = -PI / 8 + s * OCT, a1 = a0 + OCT;
      var p0 = new V3(18.45 * Math.sin(a0), 0, 18.45 * Math.cos(a0));
      var p1 = new V3(18.45 * Math.sin(a1), 0, 18.45 * Math.cos(a1));
      var mid = new V3().addVectors(p0, p1).multiplyScalar(.5);
      var len = p0.distanceTo(p1);
      var yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      trim.push(boxGeo(.18, .32, len, mid.x, 4.02, mid.z, yaw));
    }
    var trimMesh = new T.Mesh(mergeGeometries(trim), stoneDark);
    g.add(trimMesh);

    /* two stone lions at the foot of the stairs */
    this.makeLion(-4.7, .2, 25.8, -0.18);
    this.makeLion(4.7, .2, 25.8, 0.18);

    /* discreet plan outline on the ground */
    var ringPts = [];
    for (var k = 0; k <= 8; k++) {
      var a = -PI / 8 + k * OCT;
      ringPts.push(new V3(22.1 * Math.sin(a), .025, 22.1 * Math.cos(a)));
    }
    var ringGeo = new T.BufferGeometry().setFromPoints(ringPts);
    var ringLine = new T.Line(ringGeo, new T.LineBasicMaterial({ color: 0x75644d, transparent: true, opacity: .22 }));
    g.add(ringLine);
  };

  PagodaScene.prototype.makeLion = function (x, y, z, ry) {
    var parts = [];
    parts.push(boxGeo(1.35, .64, 1.3, 0, .32, 0));
    parts.push(boxGeo(1.05, .2, 1.1, 0, .68, 0));
    var body = new T.SphereGeometry(.52, 10, 7);
    body.scale(.82, 1.05, .78);
    body.translate(0, 1.2, -.03);
    parts.push(body);
    var chest = new T.SphereGeometry(.4, 10, 7);
    chest.scale(.78, .85, .7);
    chest.translate(0, 1.22, .3);
    parts.push(chest);
    var head = new T.SphereGeometry(.4, 12, 8);
    head.scale(.9, .95, .85);
    head.translate(0, 1.85, .23);
    parts.push(head);
    var mane = new T.TorusGeometry(.32, .13, 6, 12);
    mane.rotateX(PI / 2);
    mane.translate(0, 1.78, .05);
    parts.push(mane);
    parts.push(boxGeo(.2, .32, .5, -.22, 2.16, .22));
    parts.push(boxGeo(.2, .32, .5, .22, 2.16, .22));
    parts.push(boxGeo(.24, .5, .3, -.3, .78, .48, 0, -.2));
    parts.push(boxGeo(.24, .5, .3, .3, .78, .48, 0, -.2));
    var tail = new T.SphereGeometry(.18, 8, 6);
    tail.scale(.7, 1.5, .7);
    tail.translate(0, 1.15, -.75);
    parts.push(tail);
    var geo = mergeGeometries(parts);
    var mesh = new T.Mesh(geo, this.materials.stoneDark);
    mesh.position.set(x, y + 4.03, z);
    mesh.rotation.y = ry;
    this.baseGroup.add(mesh);
    this.addPick(mesh, this.makeInfo('platform', '台基 · 石狮', 'f1', { tags: ['foundation'] }), null);
  };

  /* ---------------- columns, walls, beams ---------------- */
  PagodaScene.prototype.makeColumnGeometry = function (height, bottomR, topR) {
    var pts = [];
    pts.push(new V2(0, 0));
    pts.push(new V2(bottomR * 1.08, 0));
    pts.push(new V2(bottomR * 1.08, height * .035));
    pts.push(new V2(bottomR, height * .08));
    pts.push(new V2(topR * 1.02, height * .9));
    pts.push(new V2(topR * 1.16, height * .965));
    pts.push(new V2(topR * 1.16, height));
    pts.push(new V2(0, height));
    return new T.LatheGeometry(pts, 10);
  };

  PagodaScene.prototype.addColumn = function (levelGroup, x, z, y, height, floorId, infoName, tags, inner) {
    if (!this._colGeoCache) this._colGeoCache = {};
    var key = height.toFixed(2) + (inner ? 'i' : 'o');
    if (!this._colGeoCache[key]) {
      this._colGeoCache[key] = this.makeColumnGeometry(height, inner ? .25 : .29, inner ? .2 : .23);
    }
    var mesh = new T.Mesh(this._colGeoCache[key], inner ? this.materials.woodDark : this.materials.wood);
    mesh.position.set(x, y, z);
    levelGroup.add(mesh);
    var info = this.makeInfo('columns', infoName, floorId, { tags: tags || [] });
    this.addPick(mesh, info, { anchor: new V3(x, y, z), outward: inner ? .8 : 5.2, up: inner ? 1.4 : .15 });
    return mesh;
  };

  PagodaScene.prototype.addRingColumns = function (levelGroup, radius, y, height, floorId, floorLabel, inner, onlyCorners) {
    var count = 0;
    if (inner) {
      for (var k = 0; k < 8; k++) {
        var a = -PI / 8 + k * OCT;
        var x = radius * Math.sin(a), z = radius * Math.cos(a);
        this.addColumn(levelGroup, x, z, y, height, floorId,
          floorLabel + ' · 内槽柱', ['inner-column'], true);
        count++;
      }
      return count;
    }
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 3; j++) {
        if (onlyCorners && j !== 0) continue;
        var t = j / 3;
        var p = facePoint(radius, i, t);
        this.addColumn(levelGroup, p.x, p.z, y, height, floorId,
          floorLabel + ' · ' + SIDE_NAMES[i] + '面檐柱', ['outer-column'], false);
        count++;
      }
    }
    return count;
  };

  PagodaScene.prototype.buildBeams = function (levelGroup, cfg, floorId, floorLabel, colTop, wallR, innerR, isHidden) {
    var geoms = [];
    var outerPts = [];
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 3; j++) {
        var p = facePoint(cfg.outerR, i, j / 3);
        p.y = colTop;
        outerPts.push(p);
      }
    }
    for (var a = 0; a < outerPts.length; a++) {
      var p0 = outerPts[a], p1 = outerPts[(a + 1) % outerPts.length];
      if (p0.distanceTo(p1) > 8) continue;
      var mid = new V3().addVectors(p0, p1).multiplyScalar(.5);
      var len = p0.distanceTo(p1);
      var yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      geoms.push(boxGeo(.22, .3, len, mid.x, mid.y, mid.z, yaw));
    }
    var innerPts = [];
    for (var k = 0; k < 8; k++) {
      var ang = -PI / 8 + k * OCT;
      innerPts.push(new V3(innerR * Math.sin(ang), colTop, innerR * Math.cos(ang)));
    }
    for (var b = 0; b < 8; b++) {
      var q0 = innerPts[b], q1 = innerPts[(b + 1) % 8];
      var qm = new V3().addVectors(q0, q1).multiplyScalar(.5);
      var ql = q0.distanceTo(q1);
      var qy = Math.atan2(q1.x - q0.x, q1.z - q0.z);
      geoms.push(boxGeo(.2, .28, ql, qm.x, qm.y, qm.z, qy));
    }
    for (var r = 0; r < 8; r++) {
      var aa = r * OCT;
      var oa = new V3(cfg.outerR * Math.sin(aa), colTop - .03, cfg.outerR * Math.cos(aa));
      var ia = new V3(innerR * Math.sin(aa), colTop - .03, innerR * Math.cos(aa));
      var rm = new V3().addVectors(oa, ia).multiplyScalar(.5);
      var rl = oa.distanceTo(ia);
      var ry = Math.atan2(ia.x - oa.x, ia.z - oa.z);
      geoms.push(boxGeo(.2, .26, rl, rm.x, rm.y, rm.z, ry));
    }
    if (!isHidden) {
      /* two layered ring beams for visual depth */
      var ringY = colTop - .45;
      for (var s = 0; s < 8; s++) {
        var v0 = facePoint(cfg.outerR, s, 0);
        var v1 = facePoint(cfg.outerR, s, 1);
        var vm = new V3().addVectors(v0, v1).multiplyScalar(.5);
        var vl = v0.distanceTo(v1);
        var vy = Math.atan2(v1.x - v0.x, v1.z - v0.z);
        geoms.push(boxGeo(.15, .18, vl, vm.x, ringY, vm.z, vy));
      }
    }
    var mesh = new T.Mesh(mergeGeometries(geoms), this.materials.beam);
    levelGroup.add(mesh);
    var info = this.makeInfo('beams', floorLabel + (isHidden ? ' · 暗层梁架' : ' · 梁枋'), floorId, {
      tags: isHidden ? ['brace'] : ['ring-beam', 'radial-beam']
    });
    this.addPick(mesh, info, { anchor: new V3(0, colTop, 0), outward: .2, up: 1.1 });
    return mesh;
  };

  PagodaScene.prototype.buildWalls = function (levelGroup, cfg, floorId, floorLabel, y0, y1, groundFloor) {
    var self = this;
    var wallR = cfg.wallR;
    var width = 2 * wallR * Math.tan(PI / 8) - .35;
    var height = y1 - y0;
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var a = i * OCT;
        var group = new T.Group();
        group.position.set(wallR * Math.sin(a), y0, wallR * Math.cos(a));
        group.rotation.y = a;
        group.userData.shellOctant = i;
        group.userData.shellLevel = floorId;
        levelGroup.add(group);
        self.shells.push({ object: group, octant: i, levelId: floorId });

        var woodParts = [];
        var plasterParts = [];
        var paperParts = [];
        var cardFace = (i % 2 === 0);
        var bayW = width / 3;
        var centreW = Math.min(bayW * .92, 4.15);
        var sideW = (width - centreW) / 2 - .28;
        var top = height;
        var timberTop = height - .15;
        var doorH = groundFloor ? Math.min(height - 1.0, 5.4) : Math.min(height - .75, 4.15);
        var baseZ = 0;
        var frameZ = .17;
        var thick = groundFloor ? .48 : .3;

        /* sill and head */
        woodParts.push(boxGeo(width, .38, .34, 0, 0.19, baseZ + .02));
        woodParts.push(boxGeo(width, .3, .38, 0, timberTop, baseZ));

        /* side plaster bays */
        [-1, 1].forEach(function (sgn) {
          var cx = sgn * (centreW / 2 + .18 + sideW / 2);
          var frameW = sideW;
          var ph = timberTop - .4;
          var pg = new T.BoxGeometry(frameW, ph, thick * .55);
          pg.translate(cx, .38 + ph / 2, baseZ);
          plasterParts.push(pg);
          woodParts.push(boxGeo(.18, ph, .24, cx - frameW / 2, .38 + ph / 2, baseZ + .16));
          woodParts.push(boxGeo(.18, ph, .24, cx + frameW / 2, .38 + ph / 2, baseZ + .16));
          woodParts.push(boxGeo(frameW, .18, .24, cx, .38 + ph, baseZ + .16));
          /* a few small lattice vents high in the side bays */
          if (!groundFloor) {
            var vw = Math.min(frameW * .55, 1.25);
            var vh = Math.min(ph * .25, 1.1);
            var vy = .38 + ph * .64;
            var lattice = makeLatticeGeometry(vw, vh, 5, 3, .055, .09, 0);
            for (var q = 0; q < lattice.length; q++) {
              lattice[q].translate(cx, vy, baseZ + .16);
              woodParts.push(lattice[q]);
            }
            var paper = planeGeo(vw * .92, vh * .88, cx, vy + vh / 2, baseZ + .115);
            paperParts.push(paper);
          }
        });

        /* central bay */
        if (groundFloor) {
          if (cardFace) {
            var doorW = centreW * .88;
            var doorH2 = doorH;
            woodParts.push(boxGeo(.27, doorH2 + .5, .42, -doorW / 2 - .15, doorH2 / 2 + .16, baseZ + .1));
            woodParts.push(boxGeo(.27, doorH2 + .5, .42, doorW / 2 + .15, doorH2 / 2 + .16, baseZ + .1));
            woodParts.push(boxGeo(doorW + .55, .36, .42, 0, doorH2 + .28, baseZ + .1));
            /* open double doors */
            var leafW = doorW / 2;
            for (var ds = -1; ds <= 1; ds += 2) {
              var leaf = new T.Mesh(new T.BoxGeometry(leafW, doorH2, .11), self.materials.redLacquer);
              leaf.geometry.translate(leafW / 2, 0, 0);
              leaf.position.set(ds * doorW / 2, .32 + doorH2 / 2, baseZ + .12);
              leaf.rotation.y = ds * .48;
              group.add(leaf);
              var bandGeo = [];
              bandGeo.push(boxGeo(leafW * .9, .055, .02, leafW * .5, doorH2 * .42, .07));
              bandGeo.push(boxGeo(leafW * .9, .055, .02, leafW * .5, doorH2 * .2, .07));
              var bands = new T.Mesh(mergeGeometries(bandGeo), self.materials.gold);
              leaf.add(bands);
            }
            /* interior dark recess to make the opening read */
            var recess = new T.Mesh(new T.PlaneGeometry(doorW, doorH2), new T.MeshBasicMaterial({
              color: 0x2d1c12, transparent: true, opacity: .55
            }));
            recess.position.set(0, .32 + doorH2 / 2, baseZ - .06);
            group.add(recess);
          } else {
            var ph2 = timberTop - .42;
            var pg2 = new T.BoxGeometry(centreW, ph2, thick * .6);
            pg2.translate(0, .42 + ph2 / 2, baseZ);
            plasterParts.push(pg2);
          }
        } else {
          if (cardFace) {
            var dw = centreW;
            var dh = doorH;
            var latticeParts = makeLatticeGeometry(dw, dh, 7, 9, .07, .1, 0);
            for (var l = 0; l < latticeParts.length; l++) {
              latticeParts[l].translate(0, .3, baseZ + .18);
              woodParts.push(latticeParts[l]);
            }
            paperParts.push(planeGeo(dw * .94, dh * .95, 0, .3 + dh / 2, baseZ + .12));
          } else {
            var ph3 = timberTop - .42;
            var pg3 = new T.BoxGeometry(centreW, ph3, thick * .55);
            pg3.translate(0, .42 + ph3 / 2, baseZ);
            plasterParts.push(pg3);
            var fw = centreW - .3;
            var fh = Math.min(1.45, ph3 * .3);
            woodParts.push(boxGeo(fw, .15, .2, 0, .42 + ph3 * .55, baseZ + .16));
            woodParts.push(boxGeo(fw, .15, .2, 0, .42 + ph3 * .55 + fh, baseZ + .16));
            var winLat = makeLatticeGeometry(fw, fh, 5, 4, .055, .08, 0);
            for (var lw = 0; lw < winLat.length; lw++) {
              winLat[lw].translate(0, .42 + ph3 * .55, baseZ + .17);
              woodParts.push(winLat[lw]);
            }
            paperParts.push(planeGeo(fw * .95, fh * .9, 0, .42 + ph3 * .55 + fh / 2, baseZ + .11));
          }
        }

        /* inner-side timber frame: in a cutaway this is what gives the far
           wall something to read as architecture rather than a blank plane */
        var innerZ = -.18;
        var innerPosts = [-width / 2 + .12, -centreW / 2, centreW / 2, width / 2 - .12];
        for (var ip = 0; ip < innerPosts.length; ip++) {
          woodParts.push(boxGeo(.14, height - .16, .12, innerPosts[ip], (height - .16) / 2 + .08, innerZ));
        }
        woodParts.push(boxGeo(width - .12, .16, .13, 0, .16, innerZ));
        woodParts.push(boxGeo(width - .12, .13, .12, 0, Math.min(2.0, height * .34), innerZ));
        woodParts.push(boxGeo(width - .12, .15, .13, 0, timberTop - .15, innerZ));
        if (!groundFloor) {
          woodParts.push(boxGeo(centreW, .12, .12, 0, Math.min(doorH + .32, timberTop - .35), innerZ));
        }

        /* thick vertical posts at the bay edges */
        woodParts.push(boxGeo(.24, height, .34, -width / 2 + .05, height / 2, baseZ + .12));
        woodParts.push(boxGeo(.24, height, .34, width / 2 - .05, height / 2, baseZ + .12));

        var woodMat = groundFloor ? self.materials.woodRed : self.materials.woodDark;
        if (woodParts.length) {
          var woodMesh = new T.Mesh(mergeGeometries(woodParts), woodMat);
          group.add(woodMesh);
        }
        if (plasterParts.length) {
          var plasterMesh = new T.Mesh(mergeGeometries(plasterParts), self.materials.plaster);
          group.add(plasterMesh);
        }
        if (paperParts.length) {
          var paperMesh = new T.Mesh(mergeGeometries(paperParts), self.materials.paper);
          group.add(paperMesh);
        }

        /* plaques on the south side of the first and fourth levels */
        if (floorId === 'f1' && i === 0) {
          var plq = new T.Mesh(new T.PlaneGeometry(2.1, 5.2), self.materials.plaque);
          plq.position.set(0, height * .76, baseZ + .42);
          group.add(plq);
          var pf = new T.Mesh(new T.BoxGeometry(2.5, 5.6, .18), self.materials.woodDark);
          pf.position.set(0, height * .76, baseZ + .3);
          group.add(pf);
        }
        if (floorId === 'f4' && i === 0) {
          var plq2 = new T.Mesh(new T.PlaneGeometry(3.5, 1.5), self.materials.plaque2);
          plq2.position.set(0, height * .72, baseZ + .38);
          group.add(plq2);
          var pf2 = new T.Mesh(new T.BoxGeometry(3.9, 1.85, .16), self.materials.woodDark);
          pf2.position.set(0, height * .72, baseZ + .27);
          group.add(pf2);
        }

        var label = floorLabel + ' · ' + SIDE_NAMES[i] + (cardFace ? '面隔扇' : '面板壁');
        var info = self.makeInfo('wall', label, floorId, { tags: ['envelope'] });
        self.addPick(group, info, {
          anchor: new V3(wallR * Math.sin(a), y0 + height * .5, wallR * Math.cos(a)),
          outward: 17, up: 1
        });
      })(i);
    }
  };

  PagodaScene.prototype.buildRailing = function (levelGroup, radius, y, floorId, floorLabel) {
    var material = this.materials.woodRed;
    for (var i = 0; i < 8; i++) {
      var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
      var p0 = new V3(radius * Math.sin(a0), 0, radius * Math.cos(a0));
      var p1 = new V3(radius * Math.sin(a1), 0, radius * Math.cos(a1));
      var yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      var len = p0.distanceTo(p1);
      var mid = new V3().addVectors(p0, p1).multiplyScalar(.5);
      var geoms = [];
      var group = new T.Group();
      group.position.set(mid.x, y, mid.z);
      group.rotation.y = i * OCT;
      group.userData.shellOctant = i;
      var railH = 1.06;
      geoms.push(boxGeo(len, .09, .12, 0, railH, 0));
      geoms.push(boxGeo(len, .07, .09, 0, .54, 0));
      geoms.push(boxGeo(len, .06, .08, 0, .16, 0));
      var posts = 7;
      for (var p = 0; p <= posts; p++) {
        var xx = -len / 2 + len * p / posts;
        geoms.push(boxGeo(.075, railH, .075, xx, railH / 2, 0));
        if (p > 0 && p < posts) {
          geoms.push(boxGeo(.045, .46, .045, xx, .36, 0, 0, .42));
          geoms.push(boxGeo(.045, .46, .045, xx, .36, 0, 0, -.42));
        }
      }
      var rail = new T.Mesh(mergeGeometries(geoms), material);
      group.add(rail);
      levelGroup.add(group);
      this.shells.push({ object: group, octant: i, levelId: floorId });
      var info = this.makeInfo('floor', floorLabel + ' · ' + SIDE_NAMES[i] + '面平座栏杆', floorId, { tags: ['balcony'] });
      this.addPick(group, info, {
        anchor: new V3(mid.x, y + .6, mid.z),
        outward: 16, up: .5
      });
    }
  };

  PagodaScene.prototype.buildDeck = function (levelGroup, cfg, floorId, floorLabel, radius) {
    var deck = new T.Mesh(makeOctPrism(radius, .4), this.materials.floor);
    deck.position.y = cfg.floor - .2;
    levelGroup.add(deck);
    var deckInfo = this.makeInfo('floor', floorLabel + ' · 楼板与平座', floorId, { tags: ['balcony'] });
    this.addPick(deck, deckInfo, { anchor: new V3(0, cfg.floor, 0), outward: 1.4, up: .1 });

    var edge = [];
    for (var i = 0; i < 8; i++) {
      var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
      var p0 = new V3(radius * Math.sin(a0), 0, radius * Math.cos(a0));
      var p1 = new V3(radius * Math.sin(a1), 0, radius * Math.cos(a1));
      var mid = new V3().addVectors(p0, p1).multiplyScalar(.5);
      var len = p0.distanceTo(p1);
      var yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      edge.push(boxGeo(.2, .34, len, mid.x, cfg.floor - .3, mid.z, yaw));
      edge.push(boxGeo(.14, .13, len, mid.x, cfg.floor - .56, mid.z, yaw));
    }
    var edgeMesh = new T.Mesh(mergeGeometries(edge), this.materials.woodDark);
    levelGroup.add(edgeMesh);
    this.addPick(edgeMesh, this.makeInfo('floor', floorLabel + ' · 平座挑檐', floorId, { tags: ['balcony'] }), null);
  };

  /* ---------------- dougong ---------------- */
  PagodaScene.prototype.dougongGeometry = function (scale) {
    var s = scale || 1;
    var geoms = [];
    geoms.push(boxGeo(.92 * s, .38 * s, .92 * s, 0, .19 * s, 0));
    geoms.push(boxGeo(1.1 * s, .18 * s, .56 * s, 0, .46 * s, 0));
    geoms.push(boxGeo(.38 * s, .2 * s, 1.75 * s, 0, .58 * s, .18 * s));
    geoms.push(boxGeo(1.65 * s, .2 * s, .34 * s, 0, .7 * s, .54 * s));
    geoms.push(boxGeo(.36 * s, .2 * s, 2.25 * s, 0, .85 * s, .32 * s));
    geoms.push(boxGeo(.3 * s, .17 * s, 2.5 * s, 0, 1.02 * s, .52 * s, 0, -.16));
    geoms.push(boxGeo(1.4 * s, .18 * s, .3 * s, 0, 1.12 * s, .86 * s));
    geoms.push(boxGeo(.78 * s, .18 * s, .26 * s, 0, 1.27 * s, 1.0 * s));
    for (var i = -1; i <= 1; i += 2) {
      geoms.push(boxGeo(.2 * s, .32 * s, .2 * s, i * .72 * s, .54 * s, .5 * s));
      geoms.push(boxGeo(.18 * s, .26 * s, .18 * s, i * .88 * s, .95 * s, .82 * s));
      geoms.push(boxGeo(.17 * s, .22 * s, .17 * s, i * 1.1 * s, 1.21 * s, .96 * s));
    }
    return mergeGeometries(geoms);
  };

  PagodaScene.prototype.buildDougongRing = function (levelGroup, radius, y, floorId, floorLabel, scale, isVeranda) {
    var geo = this.dougongGeometry(scale || 1);
    var positions = [];
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 3; j++) {
        var p = facePoint(radius, i, j / 3);
        p.userData = { i: i, j: j, corner: j === 0 };
        positions.push(p);
      }
    }
    for (var f = 0; f < 8; f++) {
      var p = facePoint(radius, f, .5);
      p.userData = { i: f, j: 1.5, corner: false };
      positions.push(p);
    }
    for (var k = 0; k < positions.length; k++) {
      var pos = positions[k];
      var angle = Math.atan2(pos.x, pos.z);
      var mesh = new T.Mesh(geo, this.materials.dougong);
      mesh.position.set(pos.x, y, pos.z);
      mesh.rotation.y = angle;
      levelGroup.add(mesh);
      var kind = pos.userData.corner ? '转角铺作' : (pos.userData.j === 1.5 ? '补间铺作' : '柱头铺作');
      var name = floorLabel + ' · ' + SIDE_NAMES[pos.userData.i] + '面' + kind;
      var info = this.makeInfo('dougong', name, floorId, { tags: ['bracket'] });
      this.addPick(mesh, info, { anchor: new V3(pos.x, y, pos.z), outward: 11, up: 2.7 });
    }
  };

  /* ---------------- eave ---------------- */
  PagodaScene.prototype.eaveSectorGeometry = function (i, opts, underside) {
    var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
    var U = 7, R = 6;
    var pos = [], uv = [];
    var top = !underside;
    for (var u = 0; u <= U; u++) {
      var tu = u / U;
      var ang = lerp(a0, a1, tu);
      var corner = Math.pow(Math.abs(tu * 2 - 1), 5);
      var edgeR = opts.outerR + (opts.extend || 1.25) * corner;
      var delta = ang - i * OCT;
      var innerR = opts.innerAp
        ? opts.innerAp / Math.max(.82, Math.cos(delta))
        : opts.innerR;
      for (var r = 0; r <= R; r++) {
        var tr = r / R;
        var rr = lerp(innerR, edgeR, tr);
        var yy = opts.y - opts.drop * Math.pow(tr, 1.15) + opts.lift * corner * Math.pow(tr, 2.15);
        if (underside) yy -= (opts.thickness || .22);
        if (top) yy += .03;
        pos.push(rr * Math.sin(ang), yy, rr * Math.cos(ang));
        uv.push(tu * 1.2, tr * 1.8);
      }
    }
    var idx = [];
    for (var uu = 0; uu < U; uu++) {
      for (var rr2 = 0; rr2 < R; rr2++) {
        var a = uu * (R + 1) + rr2;
        var b = (uu + 1) * (R + 1) + rr2;
        var c = uu * (R + 1) + rr2 + 1;
        var d = (uu + 1) * (R + 1) + rr2 + 1;
        if (top) {
          idx.push(a, c, b, b, c, d);
        } else {
          idx.push(a, b, c, b, d, c);
        }
      }
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  PagodaScene.prototype.eaveFascia = function (i, opts) {
    var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
    var U = 8;
    var pos = [];
    for (var u = 0; u <= U; u++) {
      var tu = u / U;
      var ang = lerp(a0, a1, tu);
      var corner = Math.pow(Math.abs(tu * 2 - 1), 5);
      var edgeR = opts.outerR + (opts.extend || 1.25) * corner;
      var yy = opts.y - opts.drop + opts.lift * corner;
      pos.push(edgeR * Math.sin(ang), yy + .02, edgeR * Math.cos(ang));
      pos.push(edgeR * Math.sin(ang), yy - (opts.thickness || .22), edgeR * Math.cos(ang));
    }
    var idx = [];
    for (var q = 0; q < U; q++) {
      var a = q * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  PagodaScene.prototype.buildEave = function (levelGroup, opts, floorId, floorLabel) {
    var self = this;
    var y = opts.y;
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var group = new T.Group();
        group.userData.shellOctant = i;
        group.userData.shellLevel = floorId;
        levelGroup.add(group);
        self.shells.push({ object: group, octant: i, levelId: floorId });

        var top = new T.Mesh(self.eaveSectorGeometry(i, opts, false), self.materials.roof);
        group.add(top);
        var under = new T.Mesh(self.eaveSectorGeometry(i, opts, true), self.materials.roofUnder);
        group.add(under);
        var fascia = new T.Mesh(self.eaveFascia(i, opts), self.materials.woodDark);
        group.add(fascia);

        /* rafters under the eave */
        var rafters = [];
        var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
        for (var r = 0; r <= 8; r++) {
          var tu = r / 8;
          var ang = lerp(a0, a1, tu);
          var corner = Math.pow(Math.abs(tu * 2 - 1), 5);
          var edgeR = opts.outerR + (opts.extend || 1.25) * corner;
          var y0 = y - (opts.thickness || .22) - .03;
          var startBase = opts.innerAp || opts.innerR;
          var startR = opts.innerAp ? startBase / Math.max(.82, Math.cos(ang - i * OCT)) : startBase;
          var start = new V3(startR * .96 * Math.sin(ang), y0, startR * .96 * Math.cos(ang));
          var end = new V3(edgeR * .97 * Math.sin(ang), y0 - opts.drop + opts.lift * corner * .97, edgeR * .97 * Math.cos(ang));
          var rgeo = cylinderBetween(start, end, .055, 5);
          if (rgeo) rafters.push(rgeo);
        }
        if (rafters.length) {
          var raf = new T.Mesh(mergeGeometries(rafters), self.materials.woodDark);
          group.add(raf);
        }

        /* upturned corner ridge */
        var ang1 = a1;
        var pts = [];
        var ridgeInner = opts.innerAp
          ? opts.innerAp / Math.cos(PI / 8)
          : opts.innerR;
        for (var q = 0; q <= 7; q++) {
          var t = .18 + q / 7 * .82;
          var rr = lerp(ridgeInner, opts.outerR + (opts.extend || 1.25), t);
          var yy = y - opts.drop * Math.pow(t, 1.15) + opts.lift * Math.pow(t, 2.15) + .1;
          pts.push(new V3(rr * Math.sin(ang1), yy, rr * Math.cos(ang1)));
        }
        var curve = new T.CatmullRomCurve3(pts);
        var tube = new T.TubeGeometry(curve, 14, .075, 5, false);
        var ridge = new T.Mesh(tube, self.materials.woodDark);
        group.add(ridge);

        /* wind bell at corner */
        var endT = 1;
        var er = opts.outerR + (opts.extend || 1.25);
        var ey = y - opts.drop + opts.lift;
        var bellParts = [];
        var bellBody = new T.CylinderGeometry(.1, .19, .32, 8);
        bellBody.translate(0, -.28, 0);
        bellParts.push(bellBody);
        var clapper = new T.SphereGeometry(.055, 6, 4);
        clapper.translate(0, -.47, 0);
        bellParts.push(clapper);
        var bell = new T.Mesh(mergeGeometries(bellParts), self.materials.bronze);
        bell.position.set(er * .965 * Math.sin(ang1), ey - .1, er * .965 * Math.cos(ang1));
        group.add(bell);

        var anchorR = ((opts.innerAp || opts.innerR) + opts.outerR) * .6;
        var anchorA = lerp(a0, a1, .5);
        var info = self.makeInfo('eave', floorLabel + ' · ' + SIDE_NAMES[i] + '面屋檐', floorId, { tags: ['roof'] });
        self.addPick(group, info, {
          anchor: new V3(anchorR * Math.sin(anchorA), y, anchorR * Math.cos(anchorA)),
          outward: 8, up: 4.8
        });
      })(i);
    }
  };

  /* ---------------- roof ---------------- */
  PagodaScene.prototype.roofSectorGeometry = function (i, opts) {
    var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
    var U = 7, R = 7;
    var pos = [], uv = [];
    for (var u = 0; u <= U; u++) {
      var tu = u / U;
      var ang = lerp(a0, a1, tu);
      for (var r = 0; r <= R; r++) {
        var tr = r / R;
        var rr = lerp(.35, opts.baseR, Math.pow(tr, .94));
        var yy = opts.yTop - (opts.yTop - opts.yBase) * Math.pow(tr, .78);
        var corner = Math.pow(Math.abs(tu * 2 - 1), 8);
        yy += corner * .2 * Math.pow(tr, 4);
        pos.push(rr * Math.sin(ang), yy, rr * Math.cos(ang));
        uv.push(tu * 1.3, tr * 2.4);
      }
    }
    var idx = [];
    for (var uu = 0; uu < U; uu++) {
      for (var rr2 = 0; rr2 < R; rr2++) {
        var a = uu * (R + 1) + rr2;
        var b = (uu + 1) * (R + 1) + rr2;
        var c = uu * (R + 1) + rr2 + 1;
        var d = (uu + 1) * (R + 1) + rr2 + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  PagodaScene.prototype.buildRoof = function (stackIndex) {
    var self = this;
    var g = this.addLevel('roof', stackIndex);
    var cfg = LEVEL_GEOM.roof;
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var group = new T.Group();
        group.userData.shellOctant = i;
        group.userData.shellLevel = 'roof';
        g.add(group);
        self.shells.push({ object: group, octant: i, levelId: 'roof' });
        var surf = new T.Mesh(self.roofSectorGeometry(i, cfg), self.materials.roof);
        group.add(surf);

        var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
        var pts = [];
        for (var q = 0; q <= 10; q++) {
          var tr = q / 10;
          var rr = lerp(.34, cfg.baseR, Math.pow(tr, .94));
          var yy = cfg.yTop - (cfg.yTop - cfg.yBase) * Math.pow(tr, .78) + .14;
          pts.push(new V3(rr * Math.sin(a1), yy, rr * Math.cos(a1)));
        }
        var curve = new T.CatmullRomCurve3(pts);
        var hip = new T.Mesh(new T.TubeGeometry(curve, 18, .13, 5, false), self.materials.woodDark);
        group.add(hip);

        /* thin eave lip at the foot of the roof */
        var lipPts = [];
        for (var s = 0; s <= 6; s++) {
          var ang = lerp(a0, a1, s / 6);
          lipPts.push(new V3((cfg.baseR + .16) * Math.sin(ang), cfg.yBase - .08, (cfg.baseR + .16) * Math.cos(ang)));
        }
        var lipGeo = new T.BufferGeometry().setFromPoints(lipPts);
        var lip = new T.Line(lipGeo, new T.LineBasicMaterial({ color: 0x4a3a29, transparent: true, opacity: .55 }));
        group.add(lip);

        var info = self.makeInfo('eave', '屋顶 · ' + SIDE_NAMES[i] + '面坡顶', 'roof', { tags: ['roof'] });
        self.addPick(group, info, {
          anchor: new V3((cfg.baseR * .55) * Math.sin(lerp(a0, a1, .5)), cfg.yBase + 2.8, (cfg.baseR * .55) * Math.cos(lerp(a0, a1, .5))),
          outward: 3.6, up: 9
        });
      })(i);
    }
  };

  PagodaScene.prototype.buildFinial = function () {
    var g = this.levels.roof.group;
    var y0 = 55.55;
    var group = new T.Group();
    group.position.set(0, y0, 0);
    g.add(group);

    /* lotus pedestal */
    var lotusParts = [];
    var base = new T.CylinderGeometry(1.55, 1.7, .38, 16);
    base.translate(0, .19, 0);
    lotusParts.push(base);
    for (var p = 0; p < 16; p++) {
      var a = p / 16 * TAU;
      var petal = new T.SphereGeometry(.38, 7, 5);
      petal.scale(.55, 1.15, .45);
      petal.translate(Math.sin(a) * 1.42, .55, Math.cos(a) * 1.42);
      lotusParts.push(petal);
    }
    var ring = new T.TorusGeometry(1.4, .12, 5, 20);
    ring.rotateX(PI / 2);
    ring.translate(0, .48, 0);
    lotusParts.push(ring);
    var stem = new T.CylinderGeometry(1.05, 1.28, .9, 16);
    stem.translate(0, .92, 0);
    lotusParts.push(stem);
    var plate = new T.CylinderGeometry(.9, .9, .16, 16);
    plate.translate(0, 1.4, 0);
    lotusParts.push(plate);
    var lotus = new T.Mesh(mergeGeometries(lotusParts), this.materials.stoneDark);
    group.add(lotus);
    this.addPick(lotus, this.makeInfo('finial', '塔刹 · 仰莲刹座', 'roof', { tags: ['finial'] }), {
      anchor: new V3(0, y0 + .8, 0), outward: .4, up: 11
    });

    /* inverted alms bowl */
    var bowl = new T.Mesh(new T.LatheGeometry([
      new V2(0, 0), new V2(.96, 0), new V2(1.03, .28), new V2(.88, .62),
      new V2(.54, .86), new V2(0, .9)
    ], 16), this.materials.iron);
    bowl.position.y = 1.35;
    group.add(bowl);
    this.addPick(bowl, this.makeInfo('finial', '塔刹 · 覆钵', 'roof', { tags: ['finial'] }), {
      anchor: new V3(0, y0 + 2.0, 0), outward: .2, up: 12.5
    });

    /* central mast */
    var mast = new T.Mesh(new T.CylinderGeometry(.13, .17, 8.25, 8), this.materials.iron);
    mast.position.y = 5.4;
    group.add(mast);

    /* rings of the 相轮 */
    var ringGeos = [];
    var ringCount = 9;
    for (var i = 0; i < ringCount; i++) {
      var t = i / (ringCount - 1);
      var rr = lerp(1.12, .42, t);
      var ringY = 2.45 + i * .76;
      var tor = new T.TorusGeometry(rr, .075, 6, 22);
      tor.rotateX(PI / 2);
      tor.translate(0, ringY, 0);
      ringGeos.push(tor);
      var hub = new T.CylinderGeometry(rr * .8, rr * .88, .07, 16);
      hub.translate(0, ringY, 0);
      ringGeos.push(hub);
    }
    var ringsMesh = new T.Mesh(mergeGeometries(ringGeos), this.materials.iron);
    group.add(ringsMesh);
    this.addPick(ringsMesh, this.makeInfo('finial', '塔刹 · 相轮', 'roof', { tags: ['finial'] }), {
      anchor: new V3(0, y0 + 6.0, 0), outward: .3, up: 14
    });

    /* crescent moon */
    var shape = new T.Shape();
    shape.absarc(0, 0, 1.0, .35, PI - .35, false);
    shape.absarc(0, .38, .8, PI - .35, .35, true);
    var moonGeo = new T.ExtrudeGeometry(shape, { depth: .14, bevelEnabled: false });
    moonGeo.center();
    var moon = new T.Mesh(moonGeo, this.materials.gold);
    moon.position.set(0, 10.1, 0);
    group.add(moon);
    this.addPick(moon, this.makeInfo('finial', '塔刹 · 仰月', 'roof', { tags: ['finial'] }), {
      anchor: new V3(0, y0 + 10.1, 0), outward: .2, up: 16
    });

    /* jewel */
    var jewel = new T.Mesh(new T.SphereGeometry(.45, 16, 10), this.materials.gold);
    jewel.position.y = 11.0;
    group.add(jewel);
    var flame = new T.Mesh(new T.ConeGeometry(.18, .55, 8), this.materials.gold);
    flame.position.y = 11.55;
    group.add(flame);
    this.addPick(jewel, this.makeInfo('finial', '塔刹 · 宝珠', 'roof', { tags: ['finial'] }), {
      anchor: new V3(0, y0 + 11.1, 0), outward: .1, up: 18
    });

    this.finialGroup = group;

    /* ensure the overall top reaches 67.31 m */
    group.position.y = 55.55;
  };

  PagodaScene.prototype.buildChains = function () {
    var g = new T.Group();
    g.name = 'finial-chains';
    var anchors = [];
    for (var i = 0; i < 8; i++) {
      var a = -PI / 8 + i * OCT;
      anchors.push(new V3(4.2 * Math.sin(a), 59.1, 4.2 * Math.cos(a)));
    }
    for (var k = 0; k < 8; k++) {
      var a2 = -PI / 8 + k * OCT;
      var end = new V3(10.1 * Math.sin(a2), 50.7, 10.1 * Math.cos(a2));
      var mid = new V3().addVectors(anchors[k], end).multiplyScalar(.5);
      mid.y -= .9;
      var curve = new T.CatmullRomCurve3([anchors[k], mid, end]);
      var tube = new T.TubeGeometry(curve, 16, .026, 4, false);
      var chain = new T.Mesh(tube, this.materials.iron);
      g.add(chain);
    }
    this.levels.roof.group.add(g);
    this.chainGroup = g;
  };

  /* ---------------- interior / statues ---------------- */
  PagodaScene.prototype.figureGeometry = function (height, standing) {
    var unit = 3.0;
    var body = [];
    if (!standing) {
      var legs = new T.SphereGeometry(.85, 14, 8);
      legs.scale(1.35, .48, .73);
      legs.translate(0, .52, .12);
      body.push(legs);
      var kneesL = new T.SphereGeometry(.42, 10, 7);
      kneesL.scale(1.1, .5, .9);
      kneesL.translate(-.75, .55, .35);
      body.push(kneesL);
      var kneesR = kneesL.clone();
      kneesR.translate(1.5, 0, 0);
      body.push(kneesR);
    } else {
      var hem = new T.CylinderGeometry(.35, .7, 1.2, 14);
      hem.translate(0, .6, 0);
      body.push(hem);
    }
    var profile = [
      new V2(0, .6), new V2(.72, .62), new V2(.88, 1.05), new V2(.83, 1.4),
      new V2(.66, 1.8), new V2(.55, 2.0), new V2(.32, 2.08), new V2(0, 2.1)
    ];
    var torso = new T.LatheGeometry(profile, 16);
    torso.scale(.94, 1, .7);
    torso.translate(0, standing ? .45 : .42, 0);
    body.push(torso);
    var shoulderL = new T.SphereGeometry(.3, 10, 7);
    shoulderL.scale(1.1, .8, .9);
    shoulderL.translate(-.5, 2.28, 0);
    body.push(shoulderL);
    var shoulderR = shoulderL.clone();
    shoulderR.translate(1.0, 0, 0);
    body.push(shoulderR);
    var armL = cylinderBetween(new V3(-.55, 2.22, .05), new V3(-.68, 1.1, .42), .17, 8);
    if (armL) body.push(armL);
    var armR = cylinderBetween(new V3(.55, 2.22, .05), new V3(.68, 1.1, .42), .17, 8);
    if (armR) body.push(armR);
    var handL = new T.SphereGeometry(.18, 8, 6);
    handL.scale(1.2, .75, .9);
    handL.translate(-.68, 1.02, .45);
    body.push(handL);
    var handR = handL.clone();
    handR.translate(1.36, 0, 0);
    body.push(handR);
    var neck = new T.CylinderGeometry(.18, .23, .28, 10);
    neck.translate(0, 2.35, 0);
    body.push(neck);
    var head = new T.SphereGeometry(.33, 14, 10);
    head.scale(.85, 1.03, .9);
    head.translate(0, 2.63, .02);
    body.push(head);
    var earL = new T.SphereGeometry(.09, 6, 4);
    earL.scale(.5, 1.8, .5);
    earL.translate(-.28, 2.6, .02);
    body.push(earL);
    var earR = earL.clone();
    earR.translate(.56, 0, 0);
    body.push(earR);
    var ushnisha = new T.SphereGeometry(.14, 8, 6);
    ushnisha.scale(1, .85, 1);
    ushnisha.translate(0, 2.96, 0);
    body.push(ushnisha);
    var bodyGeo = mergeGeometries(body);
    bodyGeo.scale(height / unit, height / unit, height / unit);
    return { body: bodyGeo, unit: unit, height: height };
  };

  PagodaScene.prototype.makeFigure = function (opts) {
    var group = new T.Group();
    group.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    group.rotation.y = opts.ry || 0;
    var fg = this.figureGeometry(opts.height, opts.standing);
    var bodyMesh = new T.Mesh(fg.body, this.materials.statue);
    group.add(bodyMesh);

    var hair = new T.Mesh(new T.SphereGeometry(.35, 14, 8, 0, TAU, 0, PI / 2), this.materials.hair);
    var sc = opts.height / fg.unit;
    hair.scale.set(sc * .86, sc * 1.02, sc * .9);
    hair.position.set(0, 2.73 * sc, .01);
    group.add(hair);

    var halo = new T.Mesh(new T.TorusGeometry(.78 * sc, .035 * sc, 5, 26), this.materials.gold);
    halo.position.set(0, 2.15 * sc, -.42 * sc);
    group.add(halo);

    if (opts.lotus !== false) {
      var lotus = new T.Mesh(new T.CylinderGeometry(.9 * sc * .9, 1.05 * sc * .9, .22 * sc, 12), this.materials.statueRed);
      lotus.position.y = .11 * sc;
      group.add(lotus);
    }

    if (opts.name) {
      var info = this.makeInfo('statue', opts.name, opts.floorId, { tags: ['interior'] });
      this.addPick(group, info, null);
    }
    return group;
  };

  PagodaScene.prototype.addAltar = function (levelGroup, y, radius, floorId, name) {
    var altarMat = this.materials.statueRed;
    var lower = new T.Mesh(makeOctPrism(radius, .35), altarMat);
    lower.position.y = y + .175;
    levelGroup.add(lower);
    var upper = new T.Mesh(makeOctPrism(radius * .82, .22), this.materials.woodDark);
    upper.position.y = y + .46;
    levelGroup.add(upper);
    var info = this.makeInfo('statue', name, floorId, { tags: ['interior'] });
    this.addPick(lower, info, null);
    this.addPick(upper, info, null);
  };

  PagodaScene.prototype.fillStatues = function (levelGroup, cfg, floorId, floorLabel) {
    var y = cfg.floor;
    if (floorId === 'f1') {
      this.addAltar(levelGroup, y + .25, 3.1, floorId, '一层 · 佛坛');
      var big = this.makeFigure({
        height: 9.5, y: y + .68, x: 0, z: -.1, ry: 0, floorId: floorId,
        name: '一层 · 释迦牟尼佛'
      });
      levelGroup.add(big);
    } else if (floorId === 'f2') {
      this.addAltar(levelGroup, y + .2, 3.0, floorId, '二层 · 方形佛坛');
      levelGroup.add(this.makeFigure({ height: 3.6, y: y + .68, z: -.5, ry: 0, floorId: floorId, name: '二层 · 主佛' }));
      levelGroup.add(this.makeFigure({ height: 2.6, y: y + .68, x: -2.05, z: .6, ry: .28, floorId: floorId, name: '二层 · 菩萨（西）' }));
      levelGroup.add(this.makeFigure({ height: 2.6, y: y + .68, x: 2.05, z: .6, ry: -.28, floorId: floorId, name: '二层 · 菩萨（东）' }));
      levelGroup.add(this.makeFigure({ height: 1.9, y: y + .68, x: -1.0, z: 2.0, ry: .15, floorId: floorId, name: '二层 · 胁侍（西）' }));
      levelGroup.add(this.makeFigure({ height: 1.9, y: y + .68, x: 1.0, z: 2.0, ry: -.15, floorId: floorId, name: '二层 · 胁侍（东）' }));
    } else if (floorId === 'f3') {
      this.addAltar(levelGroup, y + .2, 3.45, floorId, '三层 · 八角佛坛');
      var dirs = [['南', 0, 0, 1], ['东', 1, 1, 0], ['北', 2, 0, -1], ['西', 3, -1, 0]];
      for (var i = 0; i < dirs.length; i++) {
        var d = dirs[i];
        levelGroup.add(this.makeFigure({
          height: 3.35, y: y + .72, x: d[2] * 2.18, z: d[3] * 2.18,
          ry: i * PI / 2, floorId: floorId, name: '三层 · ' + d[0] + '方佛'
        }));
      }
    } else if (floorId === 'f4') {
      this.addAltar(levelGroup, y + .2, 2.9, floorId, '四层 · 佛坛');
      levelGroup.add(this.makeFigure({ height: 3.4, y: y + .66, z: -.4, floorId: floorId, name: '四层 · 主佛' }));
      levelGroup.add(this.makeFigure({ height: 2.1, y: y + .66, x: -1.75, z: .7, ry: .25, floorId: floorId, name: '四层 · 阿难' }));
      levelGroup.add(this.makeFigure({ height: 2.1, y: y + .66, x: 1.75, z: .7, ry: -.25, floorId: floorId, name: '四层 · 迦叶' }));
      levelGroup.add(this.makeFigure({ height: 2.35, y: y + .66, x: -2.7, z: 1.35, ry: .5, floorId: floorId, name: '四层 · 文殊菩萨' }));
      levelGroup.add(this.makeFigure({ height: 2.35, y: y + .66, x: 2.7, z: 1.35, ry: -.5, floorId: floorId, name: '四层 · 普贤菩萨' }));
    } else if (floorId === 'f5') {
      this.addAltar(levelGroup, y + .2, 3.1, floorId, '五层 · 佛坛');
      levelGroup.add(this.makeFigure({ height: 3.7, y: y + .66, z: -.3, floorId: floorId, name: '五层 · 中央主尊' }));
      for (var b = 0; b < 8; b++) {
        var ang = b / 8 * TAU;
        levelGroup.add(this.makeFigure({
          height: 2.45, y: y + .66,
          x: 3.35 * Math.sin(ang), z: 3.35 * Math.cos(ang),
          ry: ang, floorId: floorId, name: '五层 · 八大菩萨之' + (b + 1)
        }));
      }
    }
  };

  /* ---------------- level builders ---------------- */
  PagodaScene.prototype.buildVisibleFloor = function (id, stackIndex) {
    var cfg = LEVEL_GEOM[id];
    var g = this.addLevel(id, stackIndex);
    var fl = window.YX.floors.find(function (f) { return f.id === id; });
    var floorLabel = fl.name;
    var isGround = id === 'f1';
    var colTop = cfg.eave - 1.65;
    var facadeTop = cfg.eave - 1.75;
    var hiddenAbove = { f1: 'h1', f2: 'h2', f3: 'h3', f4: 'h4' }[id];
    var eaveInnerAp = id === 'f5' ? 9.2
      : (hiddenAbove ? LEVEL_GEOM[hiddenAbove].enclosureR + .13 : cfg.wallR + .2);

    this.buildDeck(g, cfg, id, floorLabel, cfg.balconyR);
    this.buildRailing(g, cfg.balconyR - .1, cfg.floor + .02, id, floorLabel);

    if (isGround) {
      /* veranda ring of 24 columns */
      this.addRingColumns(g, cfg.verandaR, cfg.floor, cfg.lowEave - cfg.floor - 1.1, id, '一层', false, false);
      /* low eave over the veranda */
      this.buildEave(g, {
        y: cfg.lowEave, innerR: cfg.wallR + .2, innerAp: cfg.wallR + .2,
        outerR: cfg.verandaR + 2.15,
        drop: .8, lift: .98, extend: .85, thickness: .22
      }, id, '一层下檐');
      this.buildDougongRing(g, cfg.verandaR, cfg.lowEave - 1.40, id, '一层下檐', .62, true);
      this.buildWalls(g, cfg, id, floorLabel, cfg.floor - .02, facadeTop, true);
    } else {
      this.buildWalls(g, cfg, id, floorLabel, cfg.floor - .02, facadeTop, false);
    }

    this.addRingColumns(g, cfg.outerR, cfg.floor + .05, colTop - cfg.floor, id, floorLabel, false, false);
    this.addRingColumns(g, cfg.innerR, cfg.floor + .05, colTop - cfg.floor, id, floorLabel, true, false);
    this.buildBeams(g, cfg, id, floorLabel, colTop, cfg.wallR, cfg.innerR, false);

    /* upper dougong + eave */
    this.buildDougongRing(g, cfg.outerR, colTop - .2, id, floorLabel, isGround ? .63 : .60, false);
    this.buildEave(g, {
      y: cfg.eave, innerR: eaveInnerAp, innerAp: eaveInnerAp,
      outerR: cfg.outerR + (isGround ? 2.9 : 3.0),
      drop: .9, lift: 1.02, extend: .95, thickness: .24
    }, id, floorLabel);

    this.fillStatues(g, cfg, id, floorLabel);

    /* warm interior light: only meaningful in cutaway and single-level views */
    var roomLight = new T.PointLight(0xffc98f, isGround ? 22 : 16, isGround ? 22 : 14, 2);
    roomLight.position.set(0, cfg.floor + (isGround ? 5.8 : 4.1), 0);
    g.add(roomLight);
  };

  PagodaScene.prototype.buildHiddenLevel = function (id, stackIndex) {
    var self = this;
    var cfg = LEVEL_GEOM[id];
    var g = this.addLevel(id, stackIndex);
    var fl = window.YX.floors.find(function (f) { return f.id === id; });
    var label = fl.name;
    var h = cfg.y1 - cfg.y0;
    var colTop = cfg.y1 - .3;

    this.addRingColumns(g, cfg.outerR, cfg.y0 + .1, h - .4, id, label, false, true);
    this.addRingColumns(g, cfg.innerR, cfg.y0 + .1, h - .4, id, label, true, false);

    /* diagonal bracing across each face */
    for (var i = 0; i < 8; i++) {
      var geoms = [];
      var a0 = -PI / 8 + i * OCT, a1 = a0 + OCT;
      var p0 = new V3(cfg.outerR * Math.sin(a0), cfg.y0 + .3, cfg.outerR * Math.cos(a0));
      var p1 = new V3(cfg.outerR * Math.sin(a1), cfg.y0 + .3, cfg.outerR * Math.cos(a1));
      var p2 = new V3(cfg.outerR * Math.sin(a0), colTop, cfg.outerR * Math.cos(a0));
      var p3 = new V3(cfg.outerR * Math.sin(a1), colTop, cfg.outerR * Math.cos(a1));
      var midA = new V3().addVectors(p0, p3).multiplyScalar(.5);
      var midB = new V3().addVectors(p1, p2).multiplyScalar(.5);
      geoms.push(cylinderBetween(p0, p3, .075, 5));
      geoms.push(cylinderBetween(p1, p2, .075, 5));
      geoms.push(cylinderBetween(new V3().addVectors(p0, p1).multiplyScalar(.5), new V3().addVectors(p2, p3).multiplyScalar(.5), .06, 5));
      var inner0 = new V3(cfg.innerR * Math.sin(a0), cfg.y0 + .5, cfg.innerR * Math.cos(a0));
      var inner1 = new V3(cfg.innerR * Math.sin(a1), colTop, cfg.innerR * Math.cos(a1));
      geoms.push(cylinderBetween(inner0, inner1, .06, 5));
      var brace = new T.Mesh(mergeGeometries(geoms.filter(Boolean)), this.materials.beam);
      g.add(brace);
      var info = this.makeInfo('braces', label + ' · ' + SIDE_NAMES[i] + '面斜撑', id, { tags: ['brace', 'rigid-layer'] });
      this.addPick(brace, info, { anchor: new V3((cfg.outerR * .75) * Math.sin((a0 + a1) / 2), (cfg.y0 + colTop) / 2, (cfg.outerR * .75) * Math.cos((a0 + a1) / 2)), outward: 6, up: 1 });
    }

    /* outer enclosure: dark timber panels close the hidden level between eaves.
       They are part of the cutaway shell, so the diagonal bracing is revealed
       as soon as the visitor switches to 剖视 or isolates a floor. */
    var panelR = cfg.enclosureR;
    var panelW = 2 * panelR * Math.tan(PI / 8) - .18;
    var panelH = (cfg.y1 - cfg.y0) + .12;
    var panelY = cfg.y0 - .06;
    for (var p = 0; p < 8; p++) {
      (function (p) {
        var ang = p * OCT;
        var grp = new T.Group();
        grp.position.set(panelR * Math.sin(ang), panelY, panelR * Math.cos(ang));
        grp.rotation.y = ang;
        grp.userData.shellOctant = p;
        grp.userData.shellLevel = id;
        g.add(grp);
        self.shells.push({ object: grp, octant: p, levelId: id });

        var boards = [];
        boards.push(boxGeo(panelW, panelH, .3, 0, panelH / 2, 0));
        boards.push(boxGeo(panelW + .12, .22, .38, 0, panelH - .1, .02));
        boards.push(boxGeo(panelW + .12, .2, .38, 0, .1, .02));
        for (var b = 1; b < 7; b++) {
          boards.push(boxGeo(.055, panelH - .18, .06, -panelW / 2 + b * panelW / 7, panelH / 2, .16));
        }
        var panel = new T.Mesh(mergeGeometries(boards), self.materials.wood);
        grp.add(panel);

        var insideBattens = [];
        for (var bi = 1; bi < 6; bi++) {
          insideBattens.push(boxGeo(.07, panelH - .2, .06, -panelW / 2 + bi * panelW / 6, panelH / 2, -.15));
        }
        insideBattens.push(boxGeo(panelW - .15, .12, .08, 0, Math.min(1.4, panelH * .45), -.15));
        var insideMesh = new T.Mesh(mergeGeometries(insideBattens), self.materials.woodDark);
        grp.add(insideMesh);

        var slotW = Math.min(panelW * .72, 4.2);
        var slotH = Math.min(panelH * .34, .88);
        var slotY = panelH * .56;
        var slotBars = makeLatticeGeometry(slotW, slotH, 9, 3, .052, .08, 0);
        for (var sb = 0; sb < slotBars.length; sb++) slotBars[sb].translate(0, slotY, .16);
        var slot = new T.Mesh(mergeGeometries(slotBars), self.materials.woodWarm);
        grp.add(slot);
        var paper = new T.Mesh(new T.PlaneGeometry(slotW * .94, slotH * .88), self.materials.paper);
        paper.position.set(0, slotY + slotH / 2, .12);
        grp.add(paper);

        var info = self.makeInfo('wall', label + ' · ' + SIDE_NAMES[p] + '面外壁', id, { tags: ['envelope', 'hidden'] });
        self.addPick(grp, info, {
          anchor: new V3(panelR * Math.sin(ang), panelY + panelH / 2, panelR * Math.cos(ang)),
          outward: 17, up: 1
        });
      })(p);
    }

    /* inner radial braces */
    var innerBraceParts = [];
    for (var k = 0; k < 8; k++) {
      var aa = -PI / 8 + k * OCT;
      var a = new V3(cfg.innerR * Math.sin(aa), cfg.y0 + .4, cfg.innerR * Math.cos(aa));
      var b = new V3(cfg.innerR * Math.sin(aa + OCT), colTop, cfg.innerR * Math.cos(aa + OCT));
      innerBraceParts.push(cylinderBetween(a, b, .065, 5));
    }
    var ib = new T.Mesh(mergeGeometries(innerBraceParts.filter(Boolean)), this.materials.beam);
    g.add(ib);
    this.addPick(ib, this.makeInfo('braces', label + ' · 内槽斜撑', id, { tags: ['brace', 'rigid-layer'] }), {
      anchor: new V3(0, cfg.y1 - 1, 0), outward: .4, up: .8
    });

    this.buildBeams(g, cfg, id, label, colTop, cfg.outerR, cfg.innerR, true);
  };

  /* ---------------- guides ---------------- */
  PagodaScene.prototype.buildGuides = function () {
    var guide = new T.Group();
    guide.visible = false;
    this.guideGroup = guide;
    this.pagoda.add(guide);
    var lineMat = new T.LineDashedMaterial({ color: 0x6b5d49, transparent: true, opacity: .32, dashSize: .7, gapSize: .55 });
    var lineMat2 = new T.LineDashedMaterial({ color: 0x943b2e, transparent: true, opacity: .8, dashSize: .7, gapSize: .35 });
    var levels = [
      { y: 4.2, r: 16.4 }, { y: 16.2, r: 12.8 }, { y: 19.4, r: 14.4 },
      { y: 26.2, r: 11.8 }, { y: 29.0, r: 13.5 }, { y: 34.8, r: 11.2 },
      { y: 37.2, r: 12.7 }, { y: 42.4, r: 10.5 }, { y: 44.4, r: 11.9 },
      { y: 49.1, r: 10.8 }
    ];
    for (var i = 0; i < levels.length; i++) {
      var pts = [];
      for (var k = 0; k <= 8; k++) {
        var a = -PI / 8 + k * OCT;
        pts.push(new V3(levels[i].r * Math.sin(a), levels[i].y, levels[i].r * Math.cos(a)));
      }
      var geo = new T.BufferGeometry().setFromPoints(pts);
      var line = new T.Line(geo, lineMat);
      line.computeLineDistances();
      guide.add(line);
    }
    var axisGeo = new T.BufferGeometry().setFromPoints([new V3(0, 0, 0), new V3(0, 68, 0)]);
    var axis = new T.Line(axisGeo, lineMat);
    axis.computeLineDistances();
    guide.add(axis);

    this.activeRing = new T.Line(new T.BufferGeometry().setFromPoints([]), lineMat2);
    guide.add(this.activeRing);
    this.guideLevels = levels;
  };

  PagodaScene.prototype.updateGuide = function () {
    if (!this.guideGroup) return;
    this.guideGroup.visible = this.state.mode === 'floors';
    if (this.state.mode !== 'floors') return;
    var id = this.state.floorId;
    var idx = STACK.indexOf(id);
    var y, r;
    if (id === 'roof') {
      y = 49.1; r = 13.0;
    } else {
      var b = CAMERA_BOUNDS[id];
      y = id.charAt(0) === 'h' ? b.y0 : LEVEL_GEOM[id].floor;
      r = b.r + 2;
    }
    var pts = [];
    for (var k = 0; k <= 8; k++) {
      var a = -PI / 8 + k * OCT;
      pts.push(new V3(r * Math.sin(a), y, r * Math.cos(a)));
    }
    this.activeRing.geometry.dispose();
    this.activeRing.geometry = new T.BufferGeometry().setFromPoints(pts);
    this.activeRing.computeLineDistances();
  };

  /* ---------------- state API ---------------- */
  PagodaScene.prototype.setMode = function (mode, instant) {
    if (!this.state) return;
    this.state.mode = mode;
    this.state.cutaway = mode === 'section' || mode === 'floors';
    this.clearSelection();
    var modePhi = { overview: 1.40, explode: 1.37, floors: 1.415, section: 1.425 };
    if (!instant && modePhi[mode]) this.orbit.goalPhi = modePhi[mode];
    if (mode !== 'explode') {
      this.state.explodeTarget = 0;
    }
    if (mode === 'explode') {
      this.state.explodeTarget = Math.max(this.state.explodeTarget, .001);
    }
    this.updateVisibility();
    this.updateGuide();
    this.updateLabels();
    this.scheduleFit(instant);
  };

  PagodaScene.prototype.setExplode = function (v) {
    this.state.explodeTarget = clamp(v, 0, 1);
    if (this.state.mode !== 'explode') {
      this.setMode('explode');
    }
    this.updateLabels();
  };

  PagodaScene.prototype.setExplodeMode = function (mode) {
    this.state.explodeMode = mode;
    this.updateLabels();
    this.scheduleFit();
  };

  PagodaScene.prototype.setFloor = function (id) {
    this.state.floorId = id;
    this.updateVisibility();
    this.updateGuide();
    this.updateLabels();
    this.scheduleFit();
  };

  PagodaScene.prototype.setPrinciple = function (id) {
    this.state.principle = id;
    var p = null;
    for (var i = 0; i < window.YX.principles.length; i++) {
      if (window.YX.principles[i].id === id) p = window.YX.principles[i];
    }
    if (!p) return;
    this.clearHighlightOnly();
    var targets = [];
    if (p.highlight === 'columnRings' || p.highlight === 'chazhu') {
      targets = this.getTargetsByPart('columns');
    } else if (p.highlight === 'braces') {
      targets = this.getTargetsByPart('braces');
    } else if (p.highlight === 'dougong') {
      targets = this.getTargetsByPart('dougong');
    } else if (p.highlight === 'foundation') {
      targets = this.getTargetsByPart('platform');
    }
    this.highlightTargets(targets);
    this.updateLabels();
  };

  PagodaScene.prototype.setAutoRotate = function (v) {
    this.state.autoRotate = !!v;
  };

  PagodaScene.prototype.setLabels = function (v) {
    this.state.labels = !!v;
    this.updateLabels(true);
  };

  PagodaScene.prototype.resetView = function () {
    this.orbit.goalTheta = .52;
    this.orbit.goalPhi = 1.40;
    this.scheduleFit(true);
  };

  PagodaScene.prototype.scheduleFit = function (instant) {
    var self = this;
    if (this._fitRaf) cancelAnimationFrame(this._fitRaf);
    this._fitRaf = requestAnimationFrame(function () {
      self._fitRaf = 0;
      self.layout = self.computeLayout();
      self.fitCamera(instant);
    });
  };

  PagodaScene.prototype.computeLayout = function () {
    var W = window.innerWidth, H = window.innerHeight;
    var header = document.querySelector('.topbar').getBoundingClientRect();
    var rail = this.railEl ? this.railEl.getBoundingClientRect() : { width: 0, right: 0, left: 0 };
    var inspector = this.inspectorEl ? this.inspectorEl.getBoundingClientRect() : { width: 0, left: W, top: H };
    var mobile = W <= 800;
    var left, right, top, bottom;
    if (mobile) {
      left = 12;
      right = W - 12;
      top = header.bottom + 10;
      bottom = Math.max(top + 160, inspector.top - 10);
    } else {
      left = rail.width > 10 ? rail.right + 24 : 24;
      right = inspector.width > 10 ? inspector.left - 24 : W - 24;
      top = header.bottom + 18;
      bottom = H - (this.state.mode === 'explode' ? 122 : 78);
    }
    if (this.state.mode === 'explode' && mobile) bottom -= 4;
    bottom = Math.min(H - 16, bottom);
    if (right - left < 240) {
      left = 20;
      right = W - 20;
    }
    var availW = Math.max(220, right - left);
    var availH = Math.max(160, bottom - top);
    return {
      left: left, right: right, top: top, bottom: bottom,
      availW: availW, availH: availH,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
      W: W, H: H
    };
  };

  PagodaScene.prototype.fitCamera = function (instant) {
    var mode = this.state.mode;
    var W = window.innerWidth, H = window.innerHeight;
    var layout = this.layout || this.computeLayout();
    var box = null;
    var points = null;

    if (mode === 'floors') {
      points = (this.fitSamples.levels[this.state.floorId] || []).slice();
      if (this.state.floorId === 'f1') points = points.concat(this.fitSamples.base);
      if (!points.length) {
        box = this.levels[this.state.floorId] ? this.levels[this.state.floorId].box.clone() : this.fullBox.clone();
        if (this.state.floorId === 'f1' && this.baseBox) box.union(this.baseBox);
      }
    } else if (mode === 'overview' || mode === 'section') {
      points = this.fitSamples.all;
      if (!points || !points.length) box = this.fullBox.clone();
    } else if (mode === 'explode') {
      var e = this.currentExplode != null ? this.currentExplode : this.state.explode;
      if (this.state.explodeMode === 'floors') {
        var extra = 45 * e;
        box = new T.Box3(new V3(-24, 0, -24), new V3(24, 67.4 + extra, 24));
      } else {
        var pW = 20 + 7 * e;
        box = new T.Box3(new V3(-pW, 0, -pW), new V3(pW, 69 + 18 * e, pW));
      }
    } else {
      box = this.fullBox.clone();
    }

    var center = new V3();
    var halfH = 1;
    if (points && points.length) {
      var min = new V3(Infinity, Infinity, Infinity);
      var max = new V3(-Infinity, -Infinity, -Infinity);
      for (var pi = 0; pi < points.length; pi++) {
        var pv = points[pi];
        if (pv.x < min.x) min.x = pv.x;
        if (pv.y < min.y) min.y = pv.y;
        if (pv.z < min.z) min.z = pv.z;
        if (pv.x > max.x) max.x = pv.x;
        if (pv.y > max.y) max.y = pv.y;
        if (pv.z > max.z) max.z = pv.z;
      }
      center.addVectors(min, max).multiplyScalar(.5);
      halfH = Math.max(1, (max.y - min.y) / 2);
    } else {
      if (!box) box = this.fullBox.clone();
      center.copy(box.getCenter(new V3()));
      halfH = Math.max(1, (box.max.y - box.min.y) / 2);
    }

    var vFov = this.camera.fov * PI / 180;
    var tanY = Math.tan(vFov / 2);
    var tanX = tanY * this.camera.aspect;
    var availWRatio = clamp(layout.availW / W, .25, 1);
    var availHRatio = clamp(layout.availH / H, .25, 1);

    /* Solve the distance from the real sampled silhouette, not a hollow box:
       a tower's top corners are empty air, and using them makes the pagoda
       needlessly small. */
    var goalPhi = this.orbit.goalPhi;
    var goalTheta = this.orbit.goalTheta;
    var dir = new V3(
      Math.sin(goalPhi) * Math.sin(goalTheta),
      Math.cos(goalPhi),
      Math.sin(goalPhi) * Math.cos(goalTheta)
    ).normalize();
    var forward = dir.clone().negate();
    var right = new V3().crossVectors(forward, new V3(0, 1, 0)).normalize();
    var up = new V3().crossVectors(right, forward).normalize();
    var required = 0;
    var tmpP = new V3();
    if (points && points.length) {
      for (var qi = 0; qi < points.length; qi++) {
        tmpP.copy(points[qi]).sub(center);
        var pdepth = tmpP.dot(dir);
        var px = Math.abs(tmpP.dot(right));
        var py = Math.abs(tmpP.dot(up));
        var rx = pdepth + px / Math.max(.001, tanX * availWRatio);
        var ry = pdepth + py / Math.max(.001, tanY * availHRatio);
        if (rx > required) required = rx;
        if (ry > required) required = ry;
      }
    } else {
      for (var ix = 0; ix < 2; ix++) {
        for (var iy = 0; iy < 2; iy++) {
          for (var iz = 0; iz < 2; iz++) {
            tmpP.set(
              ix ? box.max.x : box.min.x,
              iy ? box.max.y : box.min.y,
              iz ? box.max.z : box.min.z
            ).sub(center);
            var depth = tmpP.dot(dir);
            var bx = Math.abs(tmpP.dot(right));
            var by = Math.abs(tmpP.dot(up));
            required = Math.max(
              required,
              depth + bx / Math.max(.001, tanX * availWRatio),
              depth + by / Math.max(.001, tanY * availHRatio)
            );
          }
        }
      }
    }
    var dist = Math.max(required * 1.035, halfH + 2);
    /* In cutaway modes the near shell is hidden. Sampling still contains it,
       so allow the camera a little closer than the full-envelope fit. */
    if (mode === 'floors') dist *= this.state.floorId === 'f1' ? .95 : .82;
    else if (mode === 'section') dist *= .92;
    else if (mode === 'explode') dist *= .91;
    dist = clamp(dist, 38, 520);

    this.orbit.goalTarget.copy(center);
    this.orbit.goalRadius = dist;
    this.lens.x = layout.centerX - W / 2;
    this.lens.y = layout.centerY - H / 2;

    if (instant) {
      this.orbit.target.copy(this.orbit.goalTarget);
      this.orbit.radius = this.orbit.goalRadius;
      this.orbit.theta = this.orbit.goalTheta;
      this.orbit.phi = this.orbit.goalPhi;
    }
  };

  PagodaScene.prototype.updateCamera = function (dt) {
    if (this.state.autoRotate && !this.pointer.down) {
      this.orbit.goalTheta += dt * .048;
    }
    var damp = 1 - Math.pow(.001, dt);
    this.orbit.theta = lerp(this.orbit.theta, this.orbit.goalTheta, damp);
    this.orbit.phi = lerp(this.orbit.phi, this.orbit.goalPhi, damp);
    this.orbit.radius = lerp(this.orbit.radius, this.orbit.goalRadius, damp * .85);
    this.orbit.target.lerp(this.orbit.goalTarget, damp * .85);
    var sp = Math.sin(this.orbit.phi), cp = Math.cos(this.orbit.phi);
    this.camera.position.set(
      this.orbit.target.x + this.orbit.radius * sp * Math.sin(this.orbit.theta),
      this.orbit.target.y + this.orbit.radius * cp,
      this.orbit.target.z + this.orbit.radius * sp * Math.cos(this.orbit.theta)
    );
    this.camera.lookAt(this.orbit.target);
    this.camera.updateProjectionMatrix();
    if (Math.abs(this.lens.x) > .5 || Math.abs(this.lens.y) > .5) {
      this.camera.projectionMatrix.elements[8] -= 2 * this.lens.x / window.innerWidth;
      this.camera.projectionMatrix.elements[9] += 2 * this.lens.y / window.innerHeight;
      this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
    }
  };

  /* ---------------- visibility & cutaway ---------------- */
  PagodaScene.prototype.updateVisibility = function () {
    var floorMode = this.state.mode === 'floors';
    for (var id in this.levels) {
      this.levels[id].group.visible = !floorMode || id === this.state.floorId;
    }
    this.baseGroup.visible = !floorMode || this.state.floorId === 'f1';
    this.guideGroup.visible = floorMode;
    this.updateGuide();

    var cut = this.state.mode === 'section' || this.state.mode === 'floors';
    if (!cut) {
      for (var s = 0; s < this.shells.length; s++) {
        this.shells[s].object.visible = true;
      }
      return;
    }
    var camAz = Math.atan2(this.camera.position.x - this.orbit.target.x, this.camera.position.z - this.orbit.target.z);
    for (var q = 0; q < this.shells.length; q++) {
      var sh = this.shells[q];
      if (floorMode && sh.levelId !== this.state.floorId) continue;
      var faceA = sh.octant * OCT;
      var diff = Math.abs(((camAz - faceA + PI) % TAU + TAU) % TAU - PI);
      sh.object.visible = diff > 1.3;
    }
    if (this.chainGroup) this.chainGroup.visible = !cut;
  };

  /* ---------------- labels ---------------- */
  PagodaScene.prototype.clearLabelDOM = function () {
    if (!this.labelLayer) return;
    this.labelLayer.innerHTML = '';
    this.labelItems = [];
  };

  PagodaScene.prototype.labelSpecs = function () {
    var st = this.state;
    if (!st.labels) return [];
    if (st.selected && this.selectedAnchor) {
      return [{
        pos: this.selectedAnchor.clone(),
        title: st.selected.name,
        sub: '已选构件 · ' + (st.selected.categoryName || '')
      }];
    }
    var hs = this.horizontalScale || 1;
    if (st.mode === 'overview') {
      return [
        { pos: new V3(0, 64.6, 0), title: '塔刹', sub: '铁刹通高 11.67 m' },
        { pos: new V3(8.5 * hs, 47.2, 6.2 * hs), title: '斗拱', sub: '54 种 · 480 余朵' },        { pos: new V3(-9.0 * hs, 36.9, 6.4 * hs), title: '暗层', sub: '藏在明层之间的刚性层' }
      ];
    }
    if (st.mode === 'section') {
      var p = null;
      for (var i = 0; i < window.YX.principles.length; i++) {
        if (window.YX.principles[i].id === st.principle) p = window.YX.principles[i];
      }
      if (p) {
        return p.labels.map(function (l) {
          return { pos: new V3(l.x * hs, l.y, l.z * hs), title: l.title, sub: l.sub };
        });
      }
      return [];
    }
    if (st.mode === 'floors') {
      var fl = null;
      for (var f = 0; f < window.YX.floors.length; f++) {
        if (window.YX.floors[f].id === st.floorId) fl = window.YX.floors[f];
      }
      var b = CAMERA_BOUNDS[st.floorId];
      var y = (b.y0 + b.y1) / 2;
      var title = fl ? fl.name : '';
      var sub = fl ? (fl.kindLabel + ' · ' + fl.tag) : '';
      return [
        { pos: new V3(0, b.y1 + .8, 0), title: title, sub: sub }
      ];
    }
    return [];
  };

  PagodaScene.prototype.updateLabels = function (build) {
    if (build !== false) {
      var specs = this.labelSpecs();
      var key = specs.map(function (s) { return s.title + s.sub + s.pos.toArray().map(function (v) { return v.toFixed(1); }).join(','); }).join('|');
      if (key !== this._labelKey) {
        this._labelKey = key;
        this.clearLabelDOM();
        for (var i = 0; i < specs.length; i++) {
          var spec = specs[i];
          var el = document.createElement('div');
          el.className = 'scene-label';
          var anchor = document.createElement('span');
          anchor.className = 'sl-anchor';
          var line = document.createElement('span');
          line.className = 'sl-line';
          var copy = document.createElement('span');
          copy.className = 'sl-copy';
          var b = document.createElement('b');
          b.textContent = spec.title;
          var small = document.createElement('small');
          small.textContent = spec.sub || '';
          copy.appendChild(b);
          copy.appendChild(small);
          el.appendChild(anchor);
          el.appendChild(line);
          el.appendChild(copy);
          this.labelLayer.appendChild(el);
          this.labelItems.push({ el: el, pos: spec.pos, title: spec.title });
        }
      }
    }
    this.updateLabelPositions();
  };

  PagodaScene.prototype.updateLabelPositions = function () {
    if (!this.labelItems || !this.labelItems.length) return;
    var W = window.innerWidth, H = window.innerHeight;
    var mobile = W <= 800;
    for (var i = 0; i < this.labelItems.length; i++) {
      var item = this.labelItems[i];
      var v = item.pos.clone().project(this.camera);
      if (mobile || v.z > 1 || v.z < -1) {
        item.el.classList.remove('is-visible');
        continue;
      }
      var x = (v.x * .5 + .5) * W;
      var y = (-v.y * .5 + .5) * H;
      var inStage = x > 20 && x < W - 20 && y > 70 && y < H - 40;
      item.el.classList.toggle('is-visible', inStage);
      if (!inStage) continue;
      item.el.style.left = x.toFixed(1) + 'px';
      item.el.style.top = y.toFixed(1) + 'px';
      var left = x > W * .68;
      item.el.classList.toggle('is-left', left);
    }
  };

  /* ---------------- highlights ---------------- */
  PagodaScene.prototype.getTargetsByPart = function (partKey) {
    var arr = [];
    var roots = this.pickRoots;
    for (var i = 0; i < roots.length; i++) {
      roots[i].traverse(function (o) {
        if (o.userData && o.userData.pickInfo && o.userData.pickInfo.partKey === partKey) arr.push(o);
      });
    }
    /* remove nested duplicates */
    return arr.filter(function (o) {
      var p = o.parent;
      while (p) {
        if (arr.indexOf(p) >= 0) return false;
        p = p.parent;
      }
      return true;
    });
  };

  PagodaScene.prototype.countTargets = function (partKey) {
    return this.getTargetsByPart(partKey).length;
  };

  PagodaScene.prototype.clearHighlightOnly = function () {
    for (var i = 0; i < this.highlighted.length; i++) {
      var target = this.highlighted[i];
      target.traverse(function (o) {
        if (o.isMesh && o.userData._origMat) {
          if (Array.isArray(o.material)) o.material = o.userData._origMat;
          else o.material = o.userData._origMat;
          delete o.userData._origMat;
        }
      });
    }
    this.highlighted = [];
    this.highlightMats = [];
  };

  PagodaScene.prototype.highlightTargets = function (targets) {
    if (!targets || !targets.length) return;
    this.clearHighlightOnly();
    var self = this;
    for (var i = 0; i < targets.length; i++) {
      (function (target) {
        target.traverse(function (o) {
          if (!o.isMesh) return;
          o.userData._origMat = o.material;
          var m = o.material.clone();
          if (m.emissive) {
            m.emissive.setHex(0xd8692c);
            m.emissiveIntensity = .62;
          }
          if (m.color) m.color.offsetHSL(0, .13, .055);
          o.material = m;
          self.highlightMats.push(m);
        });
      })(targets[i]);
    }
    self.highlighted = targets.slice();
  };

  PagodaScene.prototype.clearSelection = function () {
    this.clearHighlightOnly();
    this.selectedTarget = null;
    this.selectedAnchor = null;
    this.state.selected = null;
    this.updateLabels(true);
    this.onHover(null);
  };

  PagodaScene.prototype.resolvePickTarget = function (obj) {
    var o = obj;
    while (o) {
      if (o.userData && o.userData.pickInfo) return o;
      o = o.parent;
    }
    return null;
  };

  PagodaScene.prototype.visibleInScene = function (o) {
    var p = o;
    while (p) {
      if (p.visible === false) return false;
      p = p.parent;
    }
    return true;
  };

  PagodaScene.prototype.pickAt = function (clientX, clientY) {
    var rect = this.canvas.getBoundingClientRect();
    this.clientPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.clientPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.clientPointer, this.camera);
    var hits = this.raycaster.intersectObjects(this.pickRoots, true);
    for (var i = 0; i < hits.length; i++) {
      var target = this.resolvePickTarget(hits[i].object);
      if (target && this.visibleInScene(target)) return target;
    }
    return null;
  };

  PagodaScene.prototype.selectTarget = function (target) {
    this.clearHighlightOnly();
    this.selectedTarget = target;
    this.selectedAnchor = null;
    this.state.selected = target ? target.userData.pickInfo : null;
    if (!target) {
      this.updateLabels(true);
      this.onSelect(null);
      return;
    }
    var box = new T.Box3().setFromObject(target);
    if (!box.isEmpty()) {
      this.selectedAnchor = box.getCenter(new V3());
      this.selectedAnchor.y += .2;
    }
    this.highlightTargets([target]);
    this.updateLabels(true);
    this.onSelect(target.userData.pickInfo);
  };

  PagodaScene.prototype.selectPartCategory = function (partKey) {
    var targets = this.getTargetsByPart(partKey);
    this.clearHighlightOnly();
    this.highlightTargets(targets);
    var cat = PARTS[partKey];
    this.onSelect({
      kind: 'category',
      partKey: partKey,
      categoryName: cat.name,
      categoryEn: cat.en,
      categoryShort: cat.short,
      description: cat.desc,
      facts: cat.facts,
      name: cat.name,
      count: targets.length
    });
  };

  PagodaScene.prototype.getCountForPart = function (partKey) {
    return this.countTargets(partKey);
  };

  /* ---------------- events ---------------- */
  PagodaScene.prototype.bindEvents = function () {
    var self = this;
    var canvas = this.canvas;

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      self.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (self.pointers.size === 1) {
        self.pointer.down = true;
        self.pointer.moved = false;
        self.pointer.id = e.pointerId;
        self.pointer.x = e.clientX;
        self.pointer.y = e.clientY;
        self.pointer.lastX = e.clientX;
        self.pointer.lastY = e.clientY;
        canvas.classList.add('is-dragging');
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      } else if (self.pointers.size === 2) {
        self.pointer.moved = true;
        var pts = Array.from(self.pointers.values());
        self.pinchStart = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        self.pinchRadius = self.orbit.goalRadius;
      }
    });

    canvas.addEventListener('pointermove', function (e) {
      if (self.pointers.has(e.pointerId)) {
        self.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (self.pointers.size === 2 && self.pinchStart) {
        self.pointer.moved = true;
        var pts = Array.from(self.pointers.values());
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (d > 0) {
          self.orbit.goalRadius = clamp(self.pinchRadius * (self.pinchStart / d), 38, 520);
        }
        return;
      }
      if (!self.pointer.down) {
        if (e.pointerType === 'mouse') self.queueHover(e.clientX, e.clientY);
        return;
      }
      var dx = e.clientX - self.pointer.lastX;
      var dy = e.clientY - self.pointer.lastY;
      if (Math.abs(e.clientX - self.pointer.x) + Math.abs(e.clientY - self.pointer.y) > 5) self.pointer.moved = true;
      self.pointer.lastX = e.clientX;
      self.pointer.lastY = e.clientY;
      self.orbit.goalTheta -= dx * .0052;
      self.orbit.goalPhi = clamp(self.orbit.goalPhi - dy * .0042, .62, 1.54);
      canvas.classList.add('is-dragging');
    });

    var endPointer = function (e) {
      var wasClick = self.pointer.down && self.pointer.id === e.pointerId && !self.pointer.moved;
      self.pointers.delete(e.pointerId);
      if (self.pointers.size === 0) {
        self.pointer.down = false;
        canvas.classList.remove('is-dragging');
        self.pinchStart = 0;
      }
      if (wasClick) {
        var target = self.pickAt(e.clientX, e.clientY);
        self.selectTarget(target);
      }
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', function (e) {
      self.pointers.delete(e.pointerId);
      if (self.pointers.size === 0) {
        self.pointer.down = false;
        canvas.classList.remove('is-dragging');
      }
    });
    canvas.addEventListener('pointerleave', function () {
      if (!self.pointer.down) {
        self.onHover(null);
        canvas.style.cursor = 'grab';
      }
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.orbit.goalRadius = clamp(self.orbit.goalRadius * Math.exp(e.deltaY * .0009), 38, 520);
    }, { passive: false });

    window.addEventListener('resize', function () {
      self.resize();
      self.layout = self.computeLayout();
      self.fitCamera(true);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) self.clock.getDelta();
    });
  };

  PagodaScene.prototype.queueHover = function (x, y) {
    var self = this;
    var now = performance.now();
    if (now - (this._lastHoverAt || 0) < 70) return;
    if (this._hoverQueued) return;
    this._hoverQueued = true;
    this._lastHoverAt = now;
    requestAnimationFrame(function () {
      self._hoverQueued = false;
      if (self.pointer.down) return;
      var target = self.pickAt(x, y);
      var info = target ? target.userData.pickInfo : null;
      self.canvas.style.cursor = target ? 'pointer' : 'grab';
      self.onHover(info, x, y);
    });
  };

  PagodaScene.prototype.resize = function () {
    var W = window.innerWidth, H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, W <= 800 ? 1.6 : 2));
  };

  /* ---------------- animation ---------------- */
  PagodaScene.prototype.animate = function () {
    if (document.hidden) {
      this.clock.getDelta();
      return;
    }
    var dt = Math.min(this.clock.getDelta(), .05);
    this.currentExplode = this.currentExplode == null ? this.state.explode : this.currentExplode;
    var target = this.state.explodeTarget;
    var diff = target - this.currentExplode;
    if (Math.abs(diff) > .0003) {
      this.currentExplode += diff * (1 - Math.pow(.0009, dt));
      this.state.explode = this.currentExplode;
      if (Math.abs(target - this.currentExplode) < .001) this.currentExplode = target;
    } else {
      this.currentExplode = target;
    }

    this.applyExplosion(this.currentExplode);
    this.updateCamera(dt);
    this.updateVisibility();
    this.updateLabelPositions();

    if (this.highlightMats.length) {
      var pulse = .52 + .13 * Math.sin(performance.now() * .0042);
      for (var hm = 0; hm < this.highlightMats.length; hm++) {
        this.highlightMats[hm].emissiveIntensity = pulse;
      }
    }

    /* re-fit while the exploded spread grows, so parts remain in view */
    if (this.state.mode === 'explode' && Math.abs(this.currentExplode - this.lastExplodeFit) > .015) {
      this.lastExplodeFit = this.currentExplode;
      this.fitCamera(false);
    }

    this.renderer.render(this.scene, this.camera);
    this.updateHoverCursor();
    if (this.firstFrame) {
      this.firstFrame = false;
      this.onReady();
    }
  };

  PagodaScene.prototype.updateHoverCursor = function () {
    /* the event handlers own the actual hover raycast; this method is
       kept as a hook for pointer-type changes */
  };

  PagodaScene.prototype.applyExplosion = function (e) {
    var st = this.state;
    var layerGap = st.explodeMode === 'floors' ? 5.0 : .28;
    var eased = e * e * (3 - 2 * e);
    for (var id in this.levels) {
      var lv = this.levels[id];
      var offset = st.explodeMode === 'floors'
        ? lv.stack * layerGap * eased
        : lv.stack * layerGap * eased;
      lv.group.position.y = offset;
    }
    for (var i = 0; i < this.units.length; i++) {
      var u = this.units[i];
      if (st.explodeMode === 'floors' || e < .0001) {
        u.object.position.copy(u.base);
      } else {
        u.object.position.copy(u.base).addScaledVector(u.offset, eased);
      }
    }
    if (this.chainGroup) {
      this.chainGroup.position.y = 0;
    }
  };

  window.PagodaScene = PagodaScene;
})();
