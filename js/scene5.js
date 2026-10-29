/* =========================================================
   SCENE 5 — Expanding Beyond Bangkok: Lampang & Pattaya
   Bangkok (TPC + Rangsit) → zoom out to Thailand · Lampang &
   Pattaya appear · light lines branch out with students/books ·
   map slides left, campus timeline on the right · 4-campus network
   ========================================================= */
(function scene5() {
  /* ---------- DATA (sources in the data-layer note) ---------- */
  const C = {
    tpc: { name: 'ท่าพระจันทร์', ll: [100.491, 13.757], color: '#a3171f', rai: 50 },
    rsu: { name: 'ศูนย์รังสิต', ll: [100.6005, 14.0717], color: '#e2a817', rai: 1757 },
    lpg: { name: 'ศูนย์ลำปาง', ll: [99.375, 18.33], color: '#5b6fa6', rai: 364, prov: 'Lampang' },     // Hang Chat district (approx.)
    pty: { name: 'ศูนย์พัทยา', ll: [100.93, 12.95], color: '#5b6fa6', rai: 566, prov: 'Chon Buri' }     // Bang Lamung district (approx.)
  };
  const km = (a, b) => Math.round(d3.geoDistance(a, b) * 6371 / 10) * 10;   // straight-line, rounded to 10 km
  const CARDS = {
    lpg: { title: 'ศูนย์ลำปาง', rows: [['เริ่ม', 'พ.ศ. 2539 สภามหาวิทยาลัยอนุมัติ'], ['พื้นที่', '364 ไร่ · ห้างฉัตร (ย้ายมาปี 2546)'],
      ['ระยะทาง', `ราว ${km(C.tpc.ll, C.lpg.ll)} กม. จากท่าพระจันทร์`], ['ผู้เรียน', 'ไม่ถึง 1,000 คน'], ['บทบาท', 'การพัฒนาท้องถิ่นและภูมิภาค']] },
    pty: { title: 'ศูนย์พัทยา', rows: [['เริ่ม', 'พ.ศ. 2530 ได้รับที่ดิน · 2540 เริ่มก่อสร้าง'], ['พื้นที่', '566 ไร่ · บางละมุง ชลบุรี'],
      ['ระยะทาง', `ราว ${km(C.tpc.ll, C.pty.ll)} กม. จากท่าพระจันทร์`], ['บทบาท', 'วิทยาลัยนวัตกรรมการศึกษา · พัฒนาชนบทและการจัดการ']] }
  };
  const LANES = [
    { k: 'tpc', start: 2477, ms: [[2477, 'ตั้งแต่ 2477 →']] },
    { k: 'rsu', start: 2529, ms: [[2529, 'เปิดศูนย์']] },
    { k: 'pty', start: 2530, solid: 2540, ms: [[2530, 'ได้ที่ดิน'], [2540, 'เริ่มก่อสร้าง']] },
    { k: 'lpg', start: 2539, ms: [[2539, 'อนุมัติ'], [2546, 'ย้ายสู่ห้างฉัตร']] }
  ];
  const TY0 = 2525, TY1 = 2569;   // Tha Phra Chan (2477) starts off the left edge

  /* ---------- stage ---------- */
  const pin = document.querySelector('.s5-pin');
  const svg = d3.select('#s5-stage');
  const labels = document.getElementById('s5-labels');
  const PROVINCES = window.TH_PROVINCES || { type: 'FeatureCollection', features: [] };
  let W = 0, H = 0, ready = false;

  svg.append('defs').html(`
    <filter id="s5glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="s5rib" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a3171f"/><stop offset="1" stop-color="#f2b81f"/></linearGradient>`);
  const gMap = svg.append('g').style('will-change', 'transform');
  const provEls = gMap.append('g').selectAll('path').data(PROVINCES.features).join('path')
    .attr('fill', '#f8efdc').attr('stroke', '#c4a37c').attr('stroke-width', 0.7).attr('stroke-linejoin', 'round')
    .attr('vector-effect', 'non-scaling-stroke');
  const hl = ['lpg', 'pty'].map(k => gMap.append('path').datum(PROVINCES.features.find(f => f.properties.name === C[k].prov))
    .attr('fill', '#5b6fa6').attr('opacity', 0).attr('stroke', '#5b6fa6').attr('stroke-width', 1).attr('vector-effect', 'non-scaling-stroke'));

  const gLines = svg.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');
  const mkLine = stroke => gLines.append('path').attr('stroke', stroke).attr('filter', 'url(#s5glow)')
    .attr('pathLength', 1).attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', 1);
  const lnR = mkLine('url(#s5rib)').attr('stroke-dashoffset', 0);   // TPC → Rangsit (already drawn in Scene 4)
  const lnL = mkLine('#5b6fa6'), lnP = mkLine('#5b6fa6');

  // dome icons
  const DOME_ICON = 'M-18 0V-8H-19.5L-16.5 -11.5H-4.5V-16H-10Q-5 -18 -3.2 -23.5H-2.6V-26H-3.4L0 -34L3.4 -26H2.6V-23.5H3.2Q5 -18 10 -16H4.5V-11.5H16.5L19.5 -8H18V0Z';
  const DOME_WIN = 'M-15 -6h2.4v3.6h-2.4zM-10.5 -6h2.4v3.6h-2.4zM-6 -6h2.4v3.6h-2.4zM3.6 -6h2.4v3.6h-2.4zM8.1 -6h2.4v3.6h-2.4zM12.6 -6h2.4v3.6h-2.4zM-1.6 -6h3.2v6h-3.2zM-1.6 -14h3.2v3h-3.2z';
  const rings = {}, icons = {};
  Object.entries(C).forEach(([k, c]) => {
    rings[k] = svg.append('circle').attr('fill', 'none').attr('stroke', c.color).attr('stroke-width', 2);
    const g = svg.append('g');
    g.append('ellipse').attr('cy', 1).attr('rx', 22).attr('ry', 3.5).attr('fill', '#000').attr('opacity', 0.12);
    g.append('path').attr('d', DOME_ICON).attr('fill', c.color).attr('stroke', '#fff8ea').attr('stroke-width', 1.2).attr('stroke-linejoin', 'round');
    g.append('path').attr('d', DOME_WIN).attr('fill', '#fff8ea').attr('opacity', 0.85);
    icons[k] = g;
  });

  // HTML labels + info cards
  const mk = (cls, html, tag = 'div') => { const d = document.createElement(tag); d.className = cls; d.innerHTML = html; labels.appendChild(d); return d; };
  const lbl = {
    tpc: mk('s5-lbl red', 'ท่าพระจันทร์<small>กรุงเทพฯ</small>'),
    rsu: mk('s5-lbl gold', 'ศูนย์รังสิต<small>ปทุมธานี</small>'),
    lpg: mk('s5-lbl new', 'ศูนย์ลำปาง<small>ภาคเหนือ</small>'),
    pty: mk('s5-lbl new', 'ศูนย์พัทยา<small>ภาคตะวันออก</small>')
  };
  const cards = {};
  ['lpg', 'pty'].forEach(k => {
    const c = CARDS[k];
    cards[k] = mk('s5-card', `<h4>${c.title}</h4><dl>${c.rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`);
  });
  const place = (el, x, y, how, op) => { el.style.transform = `translate(${x}px, ${y}px) ${how}`; el.style.opacity = op; };

  /* ---------- camera ---------- */
  const S = { v: 0, n: 0, lines: 0, cards: 0, split: 0, sweep: 0, glow: 0 };
  const proj = d3.geoMercator(), path = d3.geoPath(proj);
  const VIEWS = [{ c: [100.56, 13.92], k: 13 }, { c: [100.9, 13.4], k: 1 }];
  const ss = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  let base = {};

  function size() {
    const r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const th = { type: 'FeatureCollection', features: PROVINCES.features };
    proj.fitExtent([[W * 0.12, H * 0.08], [W * 0.88, H * 0.96]], th);
    provEls.attr('d', path); hl.forEach(h => h.attr('d', path));
    base = {};
    Object.entries(C).forEach(([k, c]) => { base[k] = proj(c.ll); });
    base.c0 = proj(VIEWS[0].c); base.c1 = proj(VIEWS[1].c);
  }

  function render() {
    if (!ready) return;
    const e = ss(S.v);
    const k = Math.exp(lerp(Math.log(VIEWS[0].k), Math.log(VIEWS[1].k), e));
    const cx = lerp(base.c0[0], base.c1[0], e), cy = lerp(base.c0[1], base.c1[1], e);
    // split: slide/scale the whole map aside for the comparison panel
    const sp = ss(S.split), narrow = W < 900;
    const sc = lerp(1, narrow ? 0.62 : 0.86, sp), dx = narrow ? 0 : W * 0.24 * sp, dy = narrow ? -H * 0.2 * sp : 0;
    gMap.attr('transform', `translate(${W / 2 - dx},${H / 2 + dy}) scale(${sc * k}) translate(${-cx},${-cy})`);
    const T = p => [W / 2 - dx + (p[0] - cx) * k * sc, H / 2 + dy + (p[1] - cy) * k * sc];
    const P = {}; Object.keys(C).forEach(key => { P[key] = T(base[key]); });

    hl[0].attr('opacity', 0.14 * S.n); hl[1].attr('opacity', 0.14 * S.n);

    // lines (quadratic arcs, bowed for a flight-path feel)
    const arc = (a, b, bow) => {
      const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bow, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow;
      return `M${a[0]},${a[1]}Q${mx},${my} ${b[0]},${b[1]}`;
    };
    const lw = 3 + S.glow * 3;
    lnR.attr('d', arc(P.tpc, P.rsu, 0.45)).attr('stroke-width', lerp(7, 4, e) + S.glow * 2);
    d3.select('#s5rib').attr('x1', P.tpc[0]).attr('y1', P.tpc[1]).attr('x2', P.rsu[0]).attr('y2', P.rsu[1]);
    lnL.attr('d', arc(P.tpc, P.lpg, -0.18)).attr('stroke-width', lw).attr('stroke-dashoffset', 1 - S.lines);
    lnP.attr('d', arc(P.tpc, P.pty, 0.3)).attr('stroke-width', lw).attr('stroke-dashoffset', 1 - Math.min(1, S.lines * 1.25));

    // icons, rings, labels
    const icS = lerp(1.15, 0.9, e) * lerp(1, 0.9, sp) * (1 + S.glow * 0.15);
    const vis = { tpc: 1, rsu: 1, lpg: S.n, pty: S.n };
    Object.keys(C).forEach(key => {
      icons[key].attr('transform', `translate(${P[key][0]},${P[key][1]}) scale(${icS * (key === 'lpg' || key === 'pty' ? ss(S.n * 1.2) : 1)})`)
        .attr('opacity', vis[key]);
      rings[key].attr('cx', P[key][0]).attr('cy', P[key][1] - 8);
    });
    place(lbl.tpc, P.tpc[0] - 26, P.tpc[1] - 6, 'translate(-100%, -50%)', 1 - sp * 0.3);
    place(lbl.rsu, P.rsu[0] + 26, P.rsu[1] - 16, 'translate(0, -50%)', (1 - ss((e - 0.7) / 0.25)) * (1 - sp));   // too close to TPC at country scale
    place(lbl.lpg, P.lpg[0] - 26, P.lpg[1] - 10, 'translate(-100%, -50%)', S.n);
    place(lbl.pty, P.pty[0] + 26, P.pty[1] - 6, 'translate(0, -50%)', S.n * (1 - S.cards));
    const cOp = S.cards * (1 - sp * 3);
    place(cards.lpg, P.lpg[0] + 30, P.lpg[1] - 30, 'translate(0, -50%)', Math.max(0, cOp));
    place(cards.pty, P.pty[0] + 30, P.pty[1] + 10, 'translate(0, -20%)', Math.max(0, cOp));
  }

  // pulsing rings on their own clock (cheap: a few attributes per frame)
  const clock = { t: 0 };
  gsap.to(clock, { t: 1, duration: 3.2, repeat: -1, ease: 'none', onUpdate: () => {
    if (!ready) return;
    const r = (clock.t * 2) % 1;
    Object.keys(C).forEach(key => {
      const v = key === 'lpg' || key === 'pty' ? S.n : 1;
      rings[key].attr('r', 22 + r * 22).attr('stroke-opacity', (1 - r) * v * (0.6 + S.glow * 0.4));
    });
  } });

  /* ---------- right panel: campus timeline + area ---------- */
  const tlEl = document.getElementById('s5-tl');
  const pos = y => Math.max(0, Math.min(100, (y - TY0) / (TY1 - TY0) * 100));
  const laneEls = LANES.map(l => {
    const c = C[l.k];
    const lane = document.createElement('div'); lane.className = 's5-lane';
    lane.innerHTML = `<span style="color:${c.color === '#e2a817' ? '#a67600' : c.color}">${c.name.replace('ศูนย์', '')}</span><div class="s5-track"></div>`;
    const track = lane.querySelector('.s5-track');
    const pre = document.createElement('div'); pre.className = 's5-bar';
    pre.style.cssText = `left:${pos(l.start)}%;background:${c.color};opacity:${l.solid ? 0.35 : 1}`;
    track.appendChild(pre);
    let solid = null;
    if (l.solid) { solid = document.createElement('div'); solid.className = 's5-bar'; solid.style.cssText = `left:${pos(l.solid)}%;background:${c.color}`; track.appendChild(solid); }
    const ms = l.ms.map(([y, t], i) => {
      const m = document.createElement('div'); m.className = 's5-ms'; m.style.cssText = `left:${pos(y)}%;border-color:${c.color}`;
      m.innerHTML = y < TY0 ? `<em class="edge">${t}</em>` : `<em class="${i % 2 ? 'below' : ''}">${y} ${t}</em>`;
      track.appendChild(m); return { m, y };
    });
    tlEl.appendChild(lane);
    return { l, pre, solid, ms };
  });
  const axis = document.createElement('div'); axis.className = 's5-axis';
  [2525, 2535, 2545, 2555, 2565].forEach(y => { axis.insertAdjacentHTML('beforeend', `<i style="left:${pos(y)}%">${y}</i>`); });
  tlEl.appendChild(axis);
  const areaEl = document.getElementById('s5-area');
  const maxRai = 1757;
  const areaRows = ['tpc', 'lpg', 'pty', 'rsu'].map(k => {
    const c = C[k];
    const row = document.createElement('div'); row.className = 's5-arow';
    row.innerHTML = `<span>${c.name.replace('ศูนย์', '')}</span><div><b style="background:${c.color}"></b></div><em>${c.rai ? (k === 'tpc' || k === 'rsu' ? '~' : '') + c.rai.toLocaleString('en-US') : 'ไม่พบข้อมูล'}</em>`;
    areaEl.appendChild(row);
    return { b: row.querySelector('b'), rai: c.rai };
  });
  function renderPanel() {
    const y = lerp(TY0, TY1, S.sweep);
    laneEls.forEach(({ l, pre, solid, ms }) => {
      const end = Math.max(l.start, y);
      const preEnd = l.solid ? Math.min(end, l.solid) : end;
      pre.style.width = (pos(preEnd) - pos(l.start)) + '%';
      if (solid) solid.style.width = Math.max(0, pos(end) - pos(l.solid)) + '%';
      ms.forEach(({ m, y: my }) => { m.style.opacity = ss((y - my) / 2); });
    });
    const a = ss((S.sweep - 0.55) / 0.4);
    areaRows.forEach(r => { r.b.style.width = r.rai ? Math.max(1.2, r.rai / maxRai * 100 * a) + '%' : '0'; });
  }
  renderPanel();

  /* ---------- load ---------- */
  size(); ready = true; render();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); render(); }, 120); });

  /* ---------- scroll timeline ---------- */
  const R = { onUpdate: render };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s5-pin', start: 'top top', end: '+=1100%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });
  tl.to('.s5-title', { opacity: 1, duration: 0.3 }, 0)
    .to('.s5-title', { opacity: 0, y: -30, duration: 0.5 }, 1.0)
    // zoom out from Bangkok to the whole country
    .to(S, { v: 1, duration: 2.4, ...R }, 1.0)
    .to('.s5-intro', { opacity: 1, duration: 0.4 }, 3.0)
    // two new nodes + branching light lines
    .to(S, { n: 1, duration: 0.8, ...R }, 3.3)
    .to(S, { lines: 1, duration: 1.6, ...R }, 4.2)
    .to('.s5-intro', { opacity: 0, duration: 0.4 }, 6.0)
    // info cards per campus
    .to(S, { cards: 1, duration: 0.6, ...R }, 6.0)
    // map slides left, comparison panel on the right
    .to(S, { split: 1, duration: 1.2, ...R }, 8.4)
    .to('#s5-panel', { opacity: 1, duration: 0.6 }, 9.0)
    .to(S, { sweep: 1, duration: 3, onUpdate: renderPanel }, 9.6)
    // back to the full map: the four-campus network lights up
    .to('#s5-panel', { opacity: 0, duration: 0.5 }, 13.2)
    .to(S, { split: 0, cards: 0, duration: 1.2, ...R }, 13.4)
    .to(S, { glow: 1, duration: 1, ...R }, 14.4)
    .to('.s5-final', { opacity: 1, duration: 0.5 }, 14.8)
    .to({}, { duration: 1 });

})();
