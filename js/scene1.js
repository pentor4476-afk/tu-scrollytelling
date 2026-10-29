/* =========================================================
   SCENE 1 — The Foundation & Growth of Education
   Macro shirt → zoom out → pan across the Chao Phraya →
   blueprint of the Dome draws in → lights up → data layer
   ========================================================= */
(function scene1() {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const stage = document.getElementById('s1-stage');
  const cam = document.getElementById('s1-cam');

  /* ---------- procedural details ---------- */
  // wing windows (two storeys, arched) – same shapes for the sketch and the glow
  let winD = '';
  const glow = document.getElementById('win-glow');
  // arched = true → round-headed (ground-floor arcade), otherwise rectangular
  const addWin = (x, y, w, h, arched) => {
    const r = w / 2;
    const d = arched
      ? `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`
      : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    winD += d;
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    glow.appendChild(p);
  };
  // wings: three storeys — two rows of rectangular windows over an arched ground floor
  const wingRow = (x0, x1) => {
    for (let x = x0; x <= x1; x += 18) {
      addWin(x, 461, 8, 9); addWin(x, 474, 8, 10); addWin(x - 1, 487, 10, 13, true);
    }
  };
  wingRow(770, 950); wingRow(1044, 1224);
  // clock tower: window rows above and below the red name band, arcade at the base
  [976, 994, 1012].forEach(x => { addWin(x, 433, 12, 10); addWin(x, 457, 12, 12); });
  [971, 991, 1011].forEach(x => addWin(x, 477, 18, 23, true));
  document.getElementById('bp-win').setAttribute('d', winD);

  // river waves
  const waves = document.getElementById('waves');
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * 2400 - 400, y = 520 + Math.random() * 240, w = 14 + Math.random() * 40;
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', `M${x} ${y}h${w}`);
    p.setAttribute('stroke-width', (0.8 + (y - 520) / 160).toFixed(2));
    p.classList.add('wave');
    waves.appendChild(p);
  }
  gsap.to('.wave', { x: () => -20 - Math.random() * 30, duration: () => 2.5 + Math.random() * 2,
    repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // stars
  const stars = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('cx', 400 + Math.random() * 1300);
    c.setAttribute('cy', 150 + Math.random() * 280);
    c.setAttribute('r', (Math.random() * 0.9 + 0.3).toFixed(2));
    c.setAttribute('opacity', (Math.random() * 0.6 + 0.3).toFixed(2));
    stars.appendChild(c);
  }

  /* ---------- camera ---------- */
  // cam.x / cam.y = point of the world at screen centre; lz = log(zoom) so zooming feels even
  const C = { x: 330, y: 721, lz: Math.log(30) };
  const applyCam = () => {
    const s = Math.exp(C.lz);
    cam.setAttribute('transform', `translate(800 450) scale(${s}) translate(${-C.x} ${-C.y})`);
  };
  applyCam();

  /* ---------- construction drawing: guides, grid tags, crane, sketch strokes, roof hatching ---------- */
  const bpLines = document.getElementById('bp-lines');
  const scaffold = document.getElementById('scaffold');
  const mkPath = (parent, d, extra = {}) => {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d); p.classList.add('bp');
    Object.entries(extra).forEach(([k, v]) => p.setAttribute(k, v));
    parent.appendChild(p); return p;
  };

  // #construct = everything that only exists while the building is "on paper"; removed at completion
  const construct = document.createElementNS(SVGNS, 'g');
  construct.id = 'construct';
  bpLines.insertBefore(construct, scaffold);

  // 1) setting-out guide lines (datums + axes), drawn first like an architect's layout
  const guides = document.createElementNS(SVGNS, 'g');
  guides.setAttribute('stroke-width', '.6'); guides.setAttribute('opacity', '.5');
  construct.appendChild(guides);
  mkPath(guides, 'M680 500H1320M690 456H1310M700 432H1300M890 410H1110M910 360H1090M930 346H1070M950 300H1050');
  mkPath(guides, 'M1000 262V532M965 372V532M1035 372V532M760 420V532M1240 420V532');

  // grid bubbles A–E under the axes (architectural drawing convention)
  const tags = document.createElementNS(SVGNS, 'g');
  tags.id = 'grid-tags'; tags.setAttribute('opacity', 0);
  [[760, 'A'], [965, 'B'], [1000, 'C'], [1035, 'D'], [1240, 'E']].forEach(([x, l]) => {
    tags.insertAdjacentHTML('beforeend',
      `<circle cx="${x}" cy="541" r="8" fill="none" stroke="#a9d6ff" stroke-width=".8"/>
       <text x="${x}" y="544.2" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="#a9d6ff" stroke="none">${l}</text>`);
  });
  construct.appendChild(tags);

  // 2) tower crane beside the tower (part of the scaffolding, so it comes down at completion)
  let mast = 'M1120 500V276M1130 500V276';
  for (let y = 500; y > 280; y -= 16) mast += `M1120 ${y}L1130 ${y - 16}`;
  mkPath(scaffold, mast);
  let jib = 'M1040 276H1310M1040 284H1310M1080 276L1125 252L1310 276M1125 252V276';
  for (let x = 1040; x < 1310; x += 15) jib += `M${x} 284L${x + 15} 276`;
  mkPath(scaffold, jib + 'M1130 276H1160V296H1130Z');          // + operator's cab
  mkPath(scaffold, 'M1072 284V326M1066 326H1078M1072 326V332A4 4 0 1 1 1066 333');   // hook line
  mkPath(scaffold, 'M1080 330H1108V342H1080ZM1080 342L1094 330M1094 342L1108 330'); // load (beam bundle)

  // 3) sketchy second pass on the main outlines — a slightly offset, lighter stroke reads as hand drawing
  [...bpLines.querySelectorAll(':scope > .bp')].forEach(p => {
    if (p.id === 'bp-win' || p.getAttribute('d').startsWith('M700 500')) return;
    const q = p.cloneNode(); q.removeAttribute('id');
    q.setAttribute('transform', 'translate(.8 -.6)');
    q.setAttribute('stroke-width', '.7'); q.setAttribute('opacity', '.45');
    p.after(q);
  });

  // 4) roof hatching, clipped to the roof shapes, drawn last
  stage.querySelector('defs').insertAdjacentHTML('beforeend', `<clipPath id="roofClip">
      <path d="M752 456L778 432H965V456Z M1035 456V432H1222L1248 456Z M926 412Q975 396 986 360H1014Q1025 396 1074 412Z M980 347Q994 334 1000 300Q1006 334 1020 347Z"/></clipPath>`);
  const hatch = document.createElementNS(SVGNS, 'g');
  hatch.setAttribute('clip-path', 'url(#roofClip)'); hatch.setAttribute('stroke-width', '.6'); hatch.setAttribute('opacity', '.7');
  construct.appendChild(hatch);
  let hd = '';
  for (let x = 700; x < 1300; x += 6) hd += `M${x} 460L${x + 60} 290`;
  mkPath(hatch, hd);
  bpLines.appendChild(construct);        // keep hatching on top of the outlines (it's last in draw order)

  // pen nib that rides the end of whichever stroke is being drawn
  const pen = document.createElementNS(SVGNS, 'circle');
  pen.setAttribute('r', 2.4); pen.setAttribute('fill', '#ffffff'); pen.setAttribute('filter', 'url(#glow)');
  pen.setAttribute('opacity', 0); pen.id = 'pen';
  cam.appendChild(pen);

  // blueprint strokes start hidden. Draw order: guides → scaffold/crane → building → windows → hatching
  const order = [...guides.querySelectorAll('.bp'), ...scaffold.querySelectorAll('.bp'),
    ...[...bpLines.querySelectorAll(':scope > .bp')], ...hatch.querySelectorAll('.bp')];
  const bps = order;
  bps.forEach(p => {
    p.setAttribute('pathLength', 1); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = 1;
    p._len = p.getTotalLength();
  });
  gsap.set('#night', { opacity: 0 });

  const pct = document.getElementById('bp-pct');
  const drawProg = { v: 0 };

  /* ---------- scroll timeline (1 unit ≈ 60% of a screen of scrolling) ---------- */
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s1-pin', start: 'top top', end: '+=850%', scrub: 1, pin: true, anticipatePin: 1 }
  });

  // 1. macro shirt → zoom out to the student on the Thonburi bank
  tl.to('.cap-title', { autoAlpha: 0, y: -30, duration: 0.6 }, 0.25)
    .to(C, { lz: 0, duration: 3, ease: 'power1.inOut', onUpdate: applyCam }, 0)
    .to(C, { x: 800, y: 450, duration: 3, ease: 'power4.in', onUpdate: applyCam }, 0);

  // 2. pan across the Chao Phraya to Tha Phra Chan
  tl.to(C, { x: 1000, y: 410, lz: Math.log(2.1), duration: 1.8, ease: 'power2.inOut', onUpdate: applyCam }, 3)
    .to('.cap-river', { opacity: 1, duration: 0.4 }, 2.7)
    .to('.cap-river', { opacity: 0, duration: 0.4 }, 4.3);

  // 3. dusk → blueprint mode
  tl.to('#night', { opacity: 1, duration: 1 }, 4.2)
    .to('#dim', { opacity: 0.6, duration: 1 }, 4.2)
    .to('#grid', { opacity: 1, duration: 0.8 }, 4.6)
    .to('.cap-build', { opacity: 1, duration: 0.4 }, 4.7);

  // 4. incremental stroke drawing of the Dome — stroke by stroke, with a pen nib riding the line
  const DRAW_START = 4.9, DRAW_SPAN = 4.6, EACH = 0.55;
  const step = DRAW_SPAN / bps.length;
  tl.to(pen, { opacity: 1, duration: 0.2 }, DRAW_START)
    .to('#grid-tags', { opacity: 1, duration: 0.5 }, DRAW_START + 0.6)
    .to(C, { x: 1030, y: 400, lz: Math.log(2.3), duration: DRAW_SPAN + EACH, ease: 'sine.inOut', onUpdate: applyCam }, DRAW_START);
  bps.forEach((p, i) => {
    tl.to(p, {
      strokeDashoffset: 0, duration: EACH,
      onUpdate() {                          // move the pen to the growing end of this stroke
        const f = 1 - (+p.style.strokeDashoffset || 0);
        if (f <= 0 || f >= 1) return;
        const pt = p.getPointAtLength(p._len * f);
        const tr = p.getAttribute('transform');
        const off = tr ? tr.match(/-?[\d.]+/g).map(Number) : [0, 0];
        pen.setAttribute('cx', pt.x + off[0]); pen.setAttribute('cy', pt.y + off[1]);
      }
    }, DRAW_START + i * step);
  });
  const DRAW_END = DRAW_START + DRAW_SPAN + EACH;
  tl.to(drawProg, { v: 100, duration: DRAW_END - DRAW_START, onUpdate: () => { pct.textContent = Math.round(drawProg.v); } }, DRAW_START)
    .to(pen, { opacity: 0, duration: 0.2 }, DRAW_END);

  // 5. complete → scaffolding, crane and construction marks come down, the Dome lights up
  const T = DRAW_END + 0.1;
  tl.to(['#scaffold', '#construct'], { opacity: 0, duration: 0.6 }, T)
    .to('#grid', { opacity: 0, duration: 0.8 }, T + 0.1)
    .to('#dome-fill', { opacity: 1, duration: 0.7 }, T + 0.1)
    .to('#bp-lines', { attr: { stroke: '#6e5530', 'stroke-opacity': 0.55, 'stroke-width': 1 }, duration: 0.7 }, T + 0.1)
    .to('#win-glow', { opacity: 1, duration: 0.6 }, T + 0.4)
    .to(['#halo-el', '#reflection'], { opacity: 1, duration: 0.8 }, T + 0.4)
    .to('.cap-build', { opacity: 0, duration: 0.4 }, T + 0.3)
    .to('.cap-quote', { opacity: 1, y: 0, duration: 0.5 }, T + 0.7);

  // 6. pull back for the closing wide shot, then hold
  tl.to(C, { x: 960, y: 450, lz: Math.log(1.35), duration: 1.4, ease: 'power1.inOut', onUpdate: applyCam }, T + 0.7)
    .to({}, { duration: 0.8 });

  /* ---------- data layer: "how many first cohorts fit in today?" ----------
     Horizontal bar chart drawn as SVG at the container's real pixel size (crisp at any
     resolution). One linear x-axis from 0 for both bars → lie factor = 1.
     Bar 2 is cut into 7,094-person segments (= one whole first cohort each). */
  const FIRST = 7094, NOW = 40000, DOMAIN = 40000;
  const ratio = NOW / FIRST;                      // 5.638…
  const full = Math.floor(ratio);                 // 5 whole cohorts
  const plot = document.getElementById('s1c-plot');
  const multEl = document.getElementById('mult-n');
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = reduce, playing = false, lastW = 0, lastH = 0, anim = null;

  const el = (tag, attrs = {}, parent, text) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };

  function draw() {
    const narrow = plot.clientWidth < 600;
    const w = plot.clientWidth;
    const h = narrow ? 300 : Math.max(260, plot.clientHeight);
    if (narrow) plot.style.height = h + 'px'; else plot.style.height = '';
    lastW = w; lastH = h;

    const m = narrow ? { l: 86, r: 70, t: 6, b: 50 } : { l: 148, r: 128, t: 6, b: 56 };
    const pw = w - m.l - m.r, ph = h - m.t - m.b;
    const x = v => m.l + v / DOMAIN * pw;
    const band = ph / 2, barH = Math.min(band * 0.56, 66);
    const yc = [m.t + band * 0.5, m.t + band * 1.5];
    const yTop = yc.map(c => c - barH / 2);

    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img',
      'aria-label': 'กราฟแท่งแนวนอน: รุ่นแรก พ.ศ. 2477 มี 7,094 คน ปัจจุบันรวม 4 ศูนย์ กว่า 40,000 คน หรือประมาณ 5.6 เท่า' });
    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: 's1c-hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse',
      patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 7, height: 7, fill: '#0072b2' }, pat);
    el('rect', { width: 3, height: 7, fill: '#cfe3f1' }, pat);

    // gridlines + tick labels (x-axis)
    const ticks = narrow ? [0, 20000, 40000] : [0, 10000, 20000, 30000, 40000];
    const g = el('g', {}, svg);
    ticks.forEach(v => {
      if (v) el('line', { x1: x(v), x2: x(v), y1: m.t, y2: m.t + ph, stroke: '#e6dfcf', 'stroke-width': 1 }, g);
      el('text', { x: x(v), y: m.t + ph + 22, 'text-anchor': 'middle', class: 'tick' }, g, fmt(v));
    });
    el('line', { x1: m.l, x2: m.l + pw, y1: m.t + ph + 0.5, y2: m.t + ph + 0.5, stroke: '#3a332b', 'stroke-width': 1 }, g);
    el('text', { x: m.l + pw / 2, y: h - 6, 'text-anchor': 'middle', class: 'ax-title' }, g, 'จำนวนนักศึกษา (คน)  →');
    // y-axis title + category labels
    el('text', { transform: `translate(14 ${m.t + ph / 2}) rotate(-90)`, 'text-anchor': 'middle', class: 'ax-title' }, g, 'ช่วงเวลา');
    [['พ.ศ. 2477', 'รุ่นแรก'], ['ปัจจุบัน', 'รวม 4 ศูนย์']].forEach(([a, b], i) => {
      el('text', { x: m.l - 14, y: yc[i] - 3, 'text-anchor': 'end', class: 'cat', style: narrow ? 'font-size:15px' : '' }, g, a);
      el('text', { x: m.l - 14, y: yc[i] + 17, 'text-anchor': 'end', class: 'cat-sub', style: narrow ? 'font-size:12px' : '' }, g, b);
    });

    // bar 1 — first cohort
    const u = x(FIRST) - m.l;
    const bar1 = el('rect', { x: m.l, y: yTop[0], width: played ? u : 0, height: barH, fill: '#e69f00' }, svg);
    const v1 = el('text', { x: x(FIRST) + 10, y: yc[0] + 7, class: 'val', style: narrow ? 'font-size:16px' : '' }, svg, played ? fmt(FIRST) : '0');
    const v1s = el('text', { x: x(FIRST) + 10, y: yc[0] + 26, class: 'val-sub' }, svg, 'คน');

    // guide: one first-cohort width, dropped onto bar 2
    const guide = el('g', { opacity: played ? 1 : 0 }, svg);
    el('line', { x1: x(FIRST), x2: x(FIRST), y1: yTop[0] + barH + 4, y2: yTop[1] - 4,
      stroke: '#3a332b', 'stroke-width': 1, 'stroke-dasharray': '3 4' }, guide);
    if (!narrow) el('text', { x: x(FIRST) + 8, y: (yTop[0] + barH + yTop[1]) / 2 + 5, class: 'guide-lab' }, guide,
      '↓ ความยาวเท่ากัน: 1 ช่อง = 7,094 คน');

    // bar 2 — today, built from first-cohort segments
    const segs = [];
    const rowGap = yc[1] - yc[0];
    for (let k = 0; k <= full; k++) {
      const v0 = k * FIRST, v1v = Math.min((k + 1) * FIRST, NOW);
      const sg = el('g', { opacity: played ? 1 : 0, transform: played ? '' : `translate(${-x(v0) + m.l} ${-rowGap})` }, svg);
      const isPart = k === full;
      el('rect', { x: x(v0), y: yTop[1], width: x(v1v) - x(v0), height: barH, fill: isPart ? 'url(#s1c-hatch)' : '#0072b2' }, sg);
      if (k) el('line', { x1: x(v0), x2: x(v0), y1: yTop[1], y2: yTop[1] + barH, stroke: '#fffdf7', 'stroke-width': 2 }, sg);
      const sw = x(v1v) - x(v0);
      const lab = isPart ? (sw > 50 ? (ratio - full).toFixed(2) : '') : (sw > 74 ? 'รุ่นที่ ' + (k + 1) : String(k + 1));
      if (lab && isPart) el('rect', { x: x(v0) + sw / 2 - 22, y: yc[1] - 11, width: 44, height: 22, rx: 11, fill: '#fffdf7' }, sg);
      if (lab) el('text', { x: x(v0) + sw / 2, y: yc[1] + 5, 'text-anchor': 'middle', class: 'seg-lab',
        style: isPart ? 'fill:#005a8c;font-weight:600' : '' }, sg, lab);
      segs.push(sg);
    }
    const v2 = el('text', { x: x(NOW) + 10, y: yc[1] + 7, class: 'val now', style: narrow ? 'font-size:16px' : '' }, svg, played ? fmt(NOW) : '0');
    el('text', { x: x(NOW) + 10, y: yc[1] + 26, class: 'val-sub' }, svg, narrow ? 'คน' : 'คน (กว่า)');
    // zero baseline drawn last so it sits on top of the bars
    el('line', { x1: m.l + 0.5, x2: m.l + 0.5, y1: m.t, y2: m.t + ph, stroke: '#3a332b', 'stroke-width': 1.5 }, svg);

    plot.replaceChildren(svg);
    return { bar1, v1, v2, guide, segs, u, m, x, rowGap };
  }

  let parts = draw();
  if (played) multEl.textContent = ratio.toFixed(1); else multEl.textContent = '0.0';

  function play() {
    if (played || playing) return;
    playing = true;
    const p = parts, c = { a: 0, b: 0, mult: 0 };
    const tl = anim = gsap.timeline({ onComplete: () => { played = true; playing = false; } });
    tl.to(p.bar1, { attr: { width: p.u }, duration: 1, ease: 'power3.out' }, 0)
      .to(c, { a: FIRST, duration: 1, ease: 'power3.out', onUpdate: () => { p.v1.textContent = fmt(c.a); } }, 0)
      .to(p.guide, { opacity: 1, duration: 0.4 }, 0.9);
    p.segs.forEach((sg, k) => {
      const t = 1.15 + k * 0.4, last = k === p.segs.length - 1;
      tl.to(sg, { opacity: 1, duration: 0.2 }, t)
        .to(sg, { attr: { transform: 'translate(0 0)' }, duration: 0.55, ease: 'back.out(1.3)' }, t)
        .to(c, { b: last ? NOW : FIRST * (k + 1), mult: last ? ratio : k + 1, duration: 0.45, ease: 'power1.out',
          onUpdate: () => { p.v2.textContent = fmt(c.b); multEl.textContent = c.mult.toFixed(1); } }, t + 0.1);
    });
    tl.from('.s1c-foot', { opacity: 0, y: 10, duration: 0.6 }, 1.0)
      .fromTo('.mult-num', { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '>-0.05');
  }

  ScrollTrigger.create({ trigger: '#s1-chart', start: 'top 75%', once: true, onEnter: play });
  new ResizeObserver(() => {
    const w = plot.clientWidth, h = plot.clientHeight;
    if (Math.abs(w - lastW) < 2 && (w < 600 || Math.abs(h - lastH) < 2)) return;
    if (playing && anim) anim.progress(1);
    parts = draw();
  }).observe(plot);

  gsap.from('.s1-text > *', {
    opacity: 0, y: 24, duration: 0.8, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '.s1-text', start: 'top 80%' }
  });
})();
