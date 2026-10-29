/* =========================================================
   SCENE 7 — From Campus to Society (graduates → careers)
   Scene 6's line chart dissolves into dots (1 dot = 100 graduates) →
   dots gather into a graduate in cap & gown → dots pour into an
   animated bar chart of graduates per year → dots merge into a
   Sankey of where bachelor graduates go → key numbers + closing line
   ========================================================= */
(function scene7() {
  /* ---------- DATA (sources in the data-layer note) ---------- */
  const GRADS = [   // all degree levels, by academic year (พ.ศ.)
    { y: 2562, n: 9523 }, { y: 2563, n: 9049 },
    { y: 2565, n: 9847, derived: true }, { y: 2566, n: 9949 }, { y: 2567, n: 9694 }
  ];
  const SURVEY = 6366, EMPLOYED = 92.62;          // % of surveyed bachelor graduates
  const SECTORS = [                               // % of EMPLOYED graduates
    { k: 'pri', name: 'ภาคเอกชน', p: 64.77, c: '#2f6fae' },
    { k: 'gov', name: 'ข้าราชการ/เจ้าหน้าที่รัฐ', p: 15.83, c: '#a3171f' },
    { k: 'own', name: 'ธุรกิจอิสระ', p: 12.45, c: '#e2a817' },
    { k: 'oth', name: 'ภาคอื่น/ไม่ระบุ', p: +(100 - 64.77 - 15.83 - 12.45).toFixed(2), c: '#b9ad97' }
  ];
  const PER_DOT = 100;
  const DATA_BARS = GRADS.filter(g => g.n);
  const N = d3.sum(DATA_BARS, g => Math.round(g.n / PER_DOT));
  const TOTAL = d3.sum(DATA_BARS, g => g.n);

  /* ---------- stage ---------- */
  const pin = document.querySelector('.s7-pin');
  const svg = d3.select('#s7-stage');
  const labels = document.getElementById('s7-labels');
  let W = 0, H = 0;
  const ss = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // graduate in cap & gown (local box 200 × 300) — used to place dots
  const GRAD_PATH = 'M40 38L100 14L160 38L100 62Z M76 46H124V70H76Z M100 56A25 25 0 1 1 99.9 56Z' +
    'M100 104C66 104 44 118 38 146L20 292H180L162 146C156 118 134 104 100 104Z';
  const probe = svg.append('path').attr('d', GRAD_PATH).attr('fill', '#000').attr('opacity', 0).attr('pointer-events', 'none');

  const gSankey = svg.append('g');
  const gBars = svg.append('g');
  const shareLine = svg.append('path').attr('fill', 'none').attr('stroke', '#b8336a').attr('stroke-width', 3).attr('stroke-dasharray', '7 5');
  const tassel = svg.append('path').attr('fill', 'none').attr('stroke', '#e2a817').attr('stroke-width', 2.5).attr('opacity', 0);
  const dots = d3.range(N).map(() => svg.append('circle').attr('r', 3));

  const mk = (cls, html) => { const d = document.createElement('div'); d.className = 's7-lbl ' + cls; d.innerHTML = html; labels.appendChild(d); return d; };
  const place = (el, x, y, how, op) => { el.style.transform = `translate(${x}px, ${y}px) ${how}`; el.style.opacity = op; };
  const barLbls = GRADS.map(g => mk('yr', g.n ? `<b>${g.n.toLocaleString('en-US')}${g.derived ? '*' : ''}</b>${g.y}` : `<b style="color:#a0937c">ไม่พบข้อมูล</b>${g.y}`));
  const totalEl = document.getElementById('s7-total');

  // per-dot target positions for each state
  let A = [], B = [], C = [], D = [], barGeo = [], sk = null, dotR = 3;
  const S = { ab: 0, bars: 0, cd: 0, sk: 0 };

  function size() {
    const r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    seed = 7;
    // A — Scene 6's female-share chart, as dots filling the area under the line
    const fx = d3.scaleLinear([2477, 2568], [W * 0.16, W * 0.84]), fy = d3.scaleLinear([0, 100], [H * 0.86, H * 0.3]);
    const share = d3.scaleLinear([2477, 2528, 2568], [20, 50, 64]);
    shareLine.attr('d', null);   // old Scene 6 line removed
    A = d3.range(N).map(() => { const yr = lerp(2477, 2568, rnd()); return [fx(yr), lerp(fy(0), fy(share(yr)), Math.sqrt(rnd()))]; });
    // B — graduate silhouette
    const s = Math.min(H * 0.6 / 300, W * 0.36 / 200);
    const ox = W / 2 - 100 * s, oy = H * 0.3 - 20 * s + 10;
    // regular grid inside the silhouette (crisp outline); shrink the step until there are enough points
    const node = probe.node();
    const inside = (x, y) => { try { return node.isPointInFill(new DOMPoint(x, y)); } catch (e) { return ((x - 100) / 75) ** 2 + ((y - 160) / 140) ** 2 < 1; } };
    let pts = [];
    for (let step = 12; step > 3 && pts.length < N; step -= 0.5) {
      pts = [];
      for (let y = 14; y <= 292; y += step) for (let x = 20 + ((y / step) % 2) * step / 2; x <= 180; x += step) if (inside(x, y)) pts.push([x, y]);
    }
    // keep N points spread evenly over the whole figure
    B = d3.range(N).map(i => { const p = pts[Math.floor(i * pts.length / N)]; return [ox + p[0] * s, oy + p[1] * s]; });
    tassel.attr('d', `M${ox + 160 * s},${oy + 38 * s}V${oy + 80 * s}`);
    // C — bar chart: dots stacked 5 per row inside each year's bar
    const n = GRADS.length, x0 = W * 0.1, x1 = W * 0.9, slot = (x1 - x0) / n;
    const bw = Math.min(slot * 0.62, 120), cols = 5;
    const maxRows = Math.ceil(100 / cols);
    const dy = Math.min(bw / cols, (H * 0.56) / maxRows);
    dotR = Math.max(1.6, Math.min(3.4, dy * 0.36));
    const base = H * 0.86;
    barGeo = []; C = [];
    let k = 0;
    GRADS.forEach((g, i) => {
      const cx = x0 + slot * (i + 0.5);
      const cnt = g.n ? Math.round(g.n / PER_DOT) : 0;
      const rows = Math.ceil(cnt / cols);
      barGeo.push({ g, cx, bw, top: base - rows * dy - 4, base, first: k, cnt, emptyH: Math.ceil(95 / cols) * dy });
      for (let j = 0; j < cnt; j++) {
        const col = j % cols, row = Math.floor(j / cols);
        C[k++] = [cx - bw / 2 + (col + 0.5) * (bw / cols), base - (row + 0.5) * dy];
      }
    });
    // bar frames (the missing year is a dashed empty frame)
    gBars.selectAll('*').remove();
    gBars.append('line').attr('x1', x0).attr('x2', x1).attr('y1', base).attr('y2', base).attr('stroke', '#8a7a62');
    barGeo.forEach(b => {
      gBars.append('rect').attr('class', 'frame').attr('x', b.cx - b.bw / 2 - 3).attr('width', b.bw + 6)
        .attr('y', b.g.n ? b.top : base - b.emptyH).attr('height', b.g.n ? base - b.top : b.emptyH)
        .attr('fill', b.g.n ? 'rgba(163,23,31,.06)' : 'none').attr('stroke', b.g.n ? 'none' : '#b9aa8f').attr('stroke-dasharray', '5 5').attr('rx', 3);
    });
    // D — Sankey (bachelor survey): source → employed / other → sectors
    const sx0 = W * 0.08, sx1 = W * 0.42, sx2 = W * 0.76, nw = 16;
    const yT = Math.max(150, H * 0.24), yB = H * 0.94, gap = 12;
    const Hs = yB - yT - gap * 3;
    const empH = Hs * EMPLOYED / 100, othH = Hs - empH;
    const src = { x: sx0, y0: yT + gap * 1.5, y1: yT + gap * 1.5 + Hs };
    const emp = { x: sx1, y0: yT, y1: yT + empH };
    const oth = { x: sx1, y0: emp.y1 + gap * 3, y1: emp.y1 + gap * 3 + othH };
    let yy = yT - gap * 0.5;
    const secs = SECTORS.map(sct => { const h = empH * sct.p / 100; const o = { ...sct, x: sx2, y0: yy, y1: yy + h }; yy += h + gap; return o; });
    sk = { src, emp, oth, secs, nw, sx0, sx2 };
    // dots collapse into the source node
    D = d3.range(N).map(() => [sx0 + rnd() * nw, lerp(src.y0, src.y1, rnd())]);
    drawSankey();
  }

  const band = (xa, a0, a1, xb, b0, b1) => {
    const xm = (xa + xb) / 2;
    return `M${xa},${a0}C${xm},${a0} ${xm},${b0} ${xb},${b0}L${xb},${b1}C${xm},${b1} ${xm},${a1} ${xa},${a1}Z`;
  };
  let skLbls = [];
  function drawSankey() {
    gSankey.selectAll('*').remove();
    skLbls.forEach(l => l.el.remove()); skLbls = [];
    const { src, emp, oth, secs, nw } = sk;
    gSankey.append('defs').html(`<clipPath id="s7clip"><rect id="s7clip-r" x="0" y="0" width="0" height="${H}"/></clipPath>`);
    const g = gSankey.append('g').attr('clip-path', 'url(#s7clip)');
    // links source → employed / other (split the source bar in proportion)
    const sE = src.y0 + (src.y1 - src.y0) * EMPLOYED / 100;
    g.append('path').attr('d', band(src.x + nw, src.y0, sE, emp.x, emp.y0, emp.y1)).attr('fill', '#a3171f').attr('opacity', 0.28);
    g.append('path').attr('d', band(src.x + nw, sE, src.y1, oth.x, oth.y0, oth.y1)).attr('fill', '#9b9488').attr('opacity', 0.35);
    // links employed → sectors
    let e0 = emp.y0;
    secs.forEach(s => {
      const h = s.y1 - s.y0;
      g.append('path').attr('d', band(emp.x + nw, e0, e0 + h, s.x, s.y0, s.y1)).attr('fill', s.c).attr('opacity', 0.45);
      e0 += h;
    });
    // nodes
    const node = (x, y0, y1, c) => g.append('rect').attr('x', x).attr('y', y0).attr('width', nw).attr('height', Math.max(2, y1 - y0)).attr('fill', c).attr('rx', 2);
    node(src.x, src.y0, src.y1, '#5b544a');
    node(emp.x, emp.y0, emp.y1, '#a3171f'); node(oth.x, oth.y0, oth.y1, '#9b9488');
    secs.forEach(s => node(s.x, s.y0, s.y1, s.c));
    // labels (HTML), each revealed when the sweep passes its column
    const fmt = v => '≈ ' + Math.round(v).toLocaleString('en-US') + ' คน';
    const empN = SURVEY * EMPLOYED / 100;
    skLbls.push({ el: mk('node', `<b>${SURVEY.toLocaleString('en-US')}</b>บัณฑิต ป.ตรีที่สำรวจ`), x: src.x, y: src.y0 - 8, how: 'translate(0, -100%)', col: src.x });
    skLbls.push({ el: mk('node', `<b>${EMPLOYED}%</b>มีงานทำ<small>${fmt(empN)}</small>`), x: emp.x + nw + 10, y: emp.y0 + 34, how: 'translate(0, -50%)', col: emp.x });
    skLbls.push({ el: mk('node', `<b style="color:#7d766b">${(100 - EMPLOYED).toFixed(2)}%</b>ยังไม่มีงานทำ / ศึกษาต่อ / อื่น ๆ`), x: oth.x + nw + 10, y: (oth.y0 + oth.y1) / 2, how: 'translate(0, -50%)', col: oth.x });
    secs.forEach(s => skLbls.push({ el: mk('node', `<b style="color:${s.c}">${s.p}%</b>${s.name}<small>${fmt(empN * s.p / 100)}</small>`),
      x: s.x + nw + 10, y: (s.y0 + s.y1) / 2, how: 'translate(0, -50%)', col: s.x }));
  }

  function render() {
    const ab = ss(S.ab), cd = ss(S.cd);
    shareLine.attr('opacity', 1 - ss(S.ab * 2.5));
    tassel.attr('opacity', ab * (1 - ss(S.bars * 3)));
    // dots per bar arrive one year after another
    const perBar = 1 / DATA_BARS.length;
    let arrived = 0;
    dots.forEach((dot, i) => {
      const bar = barGeo.find(b => i >= b.first && i < b.first + b.cnt);
      const bi = DATA_BARS.indexOf(bar.g);
      const local = (i - bar.first) / bar.cnt;
      const tb = ss((S.bars - bi * perBar) / perBar * 1.6 - local * 0.6);
      if (tb >= 1) arrived++;
      let p = [lerp(A[i][0], B[i][0], ab), lerp(A[i][1], B[i][1], ab)];
      p = [lerp(p[0], C[i][0], tb), lerp(p[1], C[i][1], tb)];
      p = [lerp(p[0], D[i][0], cd), lerp(p[1], D[i][1], cd)];
      const col = tb > 0.5 ? '#a3171f' : d3.interpolateRgb('#d6604d', '#22180f')(ab);
      dot.attr('cx', p[0]).attr('cy', p[1]).attr('r', lerp(lerp(2.6, 2.4, ab), dotR, tb) * (1 - cd * 0.4))
        .attr('fill', col).attr('opacity', 1 - ss((S.cd - 0.6) / 0.4));
    });
    gBars.attr('opacity', ss(S.bars * 4) * (1 - cd));
    // bar labels + running total
    let total = 0;
    barGeo.forEach((b, i) => {
      const bi = DATA_BARS.indexOf(b.g);
      const done = b.g.n ? ss((S.bars - bi * perBar) / perBar * 1.2 - 0.4) : ss(S.bars * 3);
      if (b.g.n) total += b.g.n * done;
      place(barLbls[i], b.cx, (b.g.n ? b.top : b.base - b.emptyH) - 8, 'translate(-50%, -100%)', done * (1 - cd));
    });
    totalEl.textContent = Math.round(S.bars >= 0.999 ? TOTAL : total).toLocaleString('en-US');
    // sankey sweep
    d3.select('#s7clip-r').attr('width', lerp(sk.sx0 - 2, W, ss(S.sk)));
    const sweepX = lerp(sk.sx0 - 2, W, ss(S.sk));
    skLbls.forEach(l => place(l.el, l.x, l.y, l.how, ss((sweepX - l.col) / 80) * (S.sk > 0 ? 1 : 0)));
  }

  size(); render();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); render(); }, 150); });

  /* ---------- scroll timeline ---------- */
  const R = { onUpdate: render };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s7-pin', start: 'top top', end: '+=1100%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });
  tl.to('.s7-title', { opacity: 1, duration: 0.3 }, 0)
    .to('.s7-title', { opacity: 0, y: -30, duration: 0.5 }, 0.9)
    // the chart dissolves into dots that gather into a graduate
    .to(S, { ab: 1, duration: 1.8, ...R }, 1.0)
    .to('.s7-question', { opacity: 1, duration: 0.4 }, 2.5)
    .to('.s7-question', { opacity: 0, duration: 0.4 }, 3.8)
    // graduate → animated bar chart, year by year, with a running total
    .to('.s7-count', { opacity: 1, duration: 0.4 }, 4.0)
    .to(S, { bars: 1, duration: 3.6, ...R }, 4.1)
    .to('.s7-count', { opacity: 0, duration: 0.4 }, 8.2)
    // bars merge into the Sankey source, then the flows sweep out
    .to(S, { cd: 1, duration: 1.0, ...R }, 8.2)
    .to('.s7-sankey-head', { opacity: 1, duration: 0.4 }, 8.8)
    .to(S, { sk: 1, duration: 2.2, ...R }, 9.0)
    // closing: key numbers + message
    .to('.s7-final', { opacity: 1, duration: 0.5 }, 11.6)
    .to({}, { duration: 1.2 });
})();
