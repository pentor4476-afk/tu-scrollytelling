/* =========================================================
   SCENE 4 — The Great Shift to Rangsit (พ.ศ. 2529)
   Thailand map → fly down to Bangkok · Tha Phra Chan (red) →
   Rangsit (gold) ribbon · pins become area-true squares ·
   squares morph into a stacked area chart (2529 → today)
   ========================================================= */
(function scene4() {
  /* ---------- DATA ---------- */
  const TPC = { name: 'ท่าพระจันทร์', ll: [100.491, 13.757], rai: 50 };
  const RSU = { name: 'ศูนย์รังสิต', ll: [100.6005, 14.0717], rai: 1757 };
  // province names shown once the camera reaches Bangkok & vicinity
  const PROV_TH = { 'Bangkok Metropolis': 'กรุงเทพมหานคร', 'Pathum Thani': 'ปทุมธานี', 'Nonthaburi': 'นนทบุรี',
    'Samut Prakan': 'สมุทรปราการ', 'Nakhon Pathom': 'นครปฐม', 'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา' };
  const PROVINCES = window.TH_PROVINCES || { type: 'FeatureCollection', features: [] };
  const BASE_SOCIAL = 8;   // social-science faculties already in place by 2529 (see Scene 3)
  // science / technology / health units founded after Rangsit opened (Wikipedia: Thammasat University)
  const NEW_UNITS = [
    { y: 2529, name: 'คณะวิทยาศาสตร์และเทคโนโลยี', short: 'วิทยาศาสตร์ฯ', icon: 'lab' },
    { y: 2532, name: 'คณะวิศวกรรมศาสตร์', short: 'วิศวกรรมศาสตร์', icon: 'eng' },
    { y: 2533, name: 'คณะแพทยศาสตร์', short: 'แพทยศาสตร์', icon: 'hosp' },
    { y: 2535, name: 'สถาบันเทคโนโลยีนานาชาติสิรินธร (SIIT)', short: 'SIIT', icon: 'tower' },
    { y: 2537, name: 'คณะสหเวชศาสตร์', short: 'สหเวชศาสตร์', icon: 'hosp' },
    { y: 2544, name: 'คณะสถาปัตยกรรมศาสตร์และการผังเมือง', short: 'สถาปัตย์ฯ', icon: 'arch' },
    { y: 2555, name: 'วิทยาลัยแพทยศาสตร์นานาชาติจุฬาภรณ์', short: 'CICM', icon: 'dome' }
  ];
  const MILESTONE = { y: 2549, txt: '2549: ปริญญาตรีทุกหลักสูตรย้ายมารังสิต (ยกเว้นหลักสูตรนานาชาติ)' };
  const TOTAL_NOW = { y: 2566, v: 27, txt: 'ปี 2566: รวม 27 คณะ (TU Fact Sheet 2023)' };
  const Y0 = 2529, Y1 = 2569;
  const gold = y => NEW_UNITS.filter(u => u.y <= y).length;

  /* ---------- stage ---------- */
  const pin = document.querySelector('.s4-pin');
  const svg = d3.select('#s4-stage');
  const labels = document.getElementById('s4-labels');
  let W = 0, H = 0, ready = false, land = null, thai = null;

  const defs = svg.append('defs');
  defs.html(`
    <pattern id="s4grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#cdbb98" stroke-width=".6"/></pattern>
    <filter id="s4glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="s4rib" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a3171f"/><stop offset="1" stop-color="#f2b81f"/></linearGradient>
    <clipPath id="s4sweep"><rect id="s4sweep-r" x="0" y="0" width="0" height="4000"/></clipPath>`);

  const gGrid = svg.append('rect').attr('fill', 'url(#s4grid)').attr('opacity', 0);
  // the map is projected ONCE per resize; zooming is a single transform on this group (cheap)
  const gMap = svg.append('g').style('will-change', 'transform');
  const NSS = { 'vector-effect': 'non-scaling-stroke' };
  const pLand = gMap.append('path').attr('fill', '#e6d6b6').attr('stroke', '#c9b48c').attr('stroke-width', 0.6).attr(...Object.entries(NSS)[0]);
  // 77 provinces: fill + thin borders (bundled in js/th-provinces.js)
  const gProv = gMap.append('g');
  const provEls = gProv.selectAll('path').data(PROVINCES.features).join('path')
    .attr('fill', d => d.properties.name === 'Bangkok Metropolis' ? '#f6e3d8' : d.properties.name === 'Pathum Thani' ? '#f8edcc' : '#f8efdc')
    .attr('stroke', '#c4a37c').attr('stroke-width', 0.7).attr('stroke-linejoin', 'round').attr(...Object.entries(NSS)[0]);
  const pThai = gMap.append('path').attr('fill', 'none').attr('stroke', 'none')   // national outline comes from the province edges.attr(...Object.entries(NSS)[0]);
  const pRib = svg.append('path').attr('fill', 'none').attr('stroke', 'url(#s4rib)').attr('stroke-linecap', 'round')
    .attr('stroke-width', 7).attr('pathLength', 1).attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', 1);

  const gChart = svg.append('g');
  const gAxes = gChart.append('g').attr('opacity', 0);
  const gx = gAxes.append('g'), gy = gAxes.append('g');
  const gAreas = gChart.append('g').attr('opacity', 0);
  const aRed = gAreas.append('path').attr('fill', '#a3171f');                     // red band: always full width
  const aGold = gAreas.append('path').attr('fill', '#e2a817').attr('clip-path', 'url(#s4sweep)');  // gold: revealed by the year sweep
  const gMile = gChart.append('path').attr('stroke', '#5b544a').attr('stroke-dasharray', '4 4').attr('opacity', 0);
  const gTotal = gChart.append('g').attr('opacity', 0);
  const totLine = gTotal.append('path').attr('stroke', '#a67600').attr('stroke-dasharray', '3 4').attr('fill', 'none');
  const totDot = gTotal.append('circle').attr('r', 6).attr('fill', '#fff8e6').attr('stroke', '#a67600').attr('stroke-width', 2.5);
  const gSketch = gChart.append('g').attr('fill', 'none').attr('stroke', '#6b4c00').attr('stroke-width', 1.4)
    .attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');

  // Dome-building icons mark the two campuses (base of the icon sits on the location)
  const DOME_ICON = 'M-18 0V-8H-19.5L-16.5 -11.5H-4.5V-16H-10Q-5 -18 -3.2 -23.5H-2.6V-26H-3.4L0 -34L3.4 -26H2.6V-23.5H3.2Q5 -18 10 -16H4.5V-11.5H16.5L19.5 -8H18V0Z';
  const DOME_WIN = 'M-15 -6h2.4v3.6h-2.4zM-10.5 -6h2.4v3.6h-2.4zM-6 -6h2.4v3.6h-2.4zM3.6 -6h2.4v3.6h-2.4zM8.1 -6h2.4v3.6h-2.4zM12.6 -6h2.4v3.6h-2.4zM-1.6 -6h3.2v6h-3.2zM-1.6 -14h3.2v3h-3.2z';
  const mkIcon = color => {
    const g = svg.append('g').attr('opacity', 0);
    g.append('ellipse').attr('cx', 0).attr('cy', 1).attr('rx', 22).attr('ry', 3.5).attr('fill', '#000').attr('opacity', 0.12);
    g.append('path').attr('d', DOME_ICON).attr('fill', color).attr('stroke', '#fff8ea').attr('stroke-width', 1.2).attr('stroke-linejoin', 'round');
    g.append('path').attr('d', DOME_WIN).attr('fill', '#fff8ea').attr('opacity', 0.85);
    g.append('path').attr('d', 'M0 -34V-39').attr('stroke', color).attr('stroke-width', 1);
    return g;
  };
  const iconR = mkIcon('#a3171f'), iconG = mkIcon('#e2a817');
  const ringR = svg.append('circle').attr('fill', 'none').attr('stroke', '#a3171f').attr('stroke-width', 2).attr('r', 8);
  const ringG = svg.append('circle').attr('fill', 'none').attr('stroke', '#e2a817').attr('stroke-width', 2).attr('r', 8);
  const ringT = { t: 0 };
  gsap.to(ringT, { t: 1, duration: 1.8, repeat: -1, ease: 'sine.out', onUpdate: () => {
    ringR.attr('r', 22 + ringT.t * 22).attr('stroke-opacity', (1 - ringT.t) * S.pins * (1 - S.sq));
    ringG.attr('r', 22 + ringT.t * 22).attr('stroke-opacity', (1 - ringT.t) * S.rsu * (1 - S.sq));
  } });
  // two campus "pins" that later become squares and then chart bands
  const sqRed = svg.append('rect').attr('fill', '#a3171f');
  const sqGold = svg.append('rect').attr('fill', '#e2a817');

  // architectural line sketches (local box 0..30 wide, base at 0)
  const ICONS = {
    lab: 'M0 0V-22H30V0M5 -16H11V-11H5ZM19 -16H25V-11H19ZM13 0V-8H17V0M10 -22L15 -30L20 -22',
    eng: 'M0 0V-18L7.5 -24V-18L15 -24V-18L22.5 -24V-18L30 -24V0M5 -12H25M5 -6H25',
    hosp: 'M0 0V-24H30V0M11 -16H19M15 -20V-12M4 -6H9M21 -6H26M12 0V-6H18V0',
    tower: 'M7 0V-40H23V0M7 -32H23M7 -24H23M7 -16H23M7 -8H23M15 -40V-46',
    arch: 'M0 0V-14Q15 -36 30 -14V0M8 0V-12Q15 -22 22 -12V0',
    dome: 'M0 0V-18H30V0M6 -18Q6 -32 15 -32Q24 -32 24 -18M15 -32V-37M4 -10H26'
  };
  const sketches = NEW_UNITS.map(u => gSketch.append('path').attr('d', ICONS[u.icon]).attr('pathLength', 1)
    .attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', 1));

  // HTML labels
  const mk = (cls, html) => { const d = document.createElement('div'); d.className = 's4-lbl ' + cls; d.innerHTML = html; labels.appendChild(d); return d; };
  const lTPC = mk('red', `ท่าพระจันทร์<small>ริมโค้งน้ำเจ้าพระยา</small>`);
  const lRSU = mk('gold', `ศูนย์รังสิต<small>ทุ่งรังสิต · ปทุมธานี</small>`);
  const lSqR = mk('sq red', `ท่าพระจันทร์<em>~50 ไร่</em>`);
  const lSqG = mk('sq gold', `ศูนย์รังสิต<em>~1,757 ไร่</em><small>กว้างกว่าราว 35 เท่า</small>`);
  const lEv = NEW_UNITS.map(u => mk('ev', `${u.y}<small>${u.short}</small>`));
  const lMile = mk('mile', MILESTONE.txt);
  const lTot = mk('total', TOTAL_NOW.txt);
  const provLbls = PROVINCES.features.filter(f => PROV_TH[f.properties.name]).map(f =>
    ({ f, el: mk('prov', PROV_TH[f.properties.name]), p: [0, 0],
       dy: f.properties.name === 'Bangkok Metropolis' ? 30 : 0,               // keep clear of the Tha Phra Chan icon
       yieldTo: f.properties.name === 'Pathum Thani' ? 'rsu' : null }));      // gives way to the Rangsit label
  const place = (el, x, y, how, op) => { el.style.transform = `translate(${x}px, ${y}px) ${how}`; el.style.opacity = op; };

  // state driven by scroll
  const S = { v: 0, pins: 0, rsu: 0, rib: 0, sq: 0, mapFade: 0, chart: 0, sweep: 0 };
  const proj = d3.geoMercator();
  const path = d3.geoPath(proj);
  const VIEWS = [{ c: [100.9, 13.1], k: 1 }, { c: [100.56, 13.92], k: 13 }];
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const ss = t => { t = clamp01(t); return t * t * (3 - 2 * t); };         // smoothstep
  const lerp = (a, b, t) => a + (b - a) * t;
  let F = null, base = {};          // cached chart frame + base-projected points

  // chart frame
  const frame = () => {
    const x0 = W * 0.08, x1 = W * 0.86, yb = H * 0.88, yt = Math.max(170, H * 0.3);
    const x = d3.scaleLinear([Y0, Y1], [x0, x1]);
    const y = d3.scaleLinear([0, 28], [yb, yt]);
    return { x0, x1, yb, yt, x, y };
  };

  // heavy work: only on load / resize
  function size() {
    const r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    gGrid.attr('width', W).attr('height', H);
    if (thai) {
      proj.fitExtent([[W * 0.1, H * 0.1], [W * 0.9, H * 0.94]], thai);
      pLand.attr('d', path(land)); pThai.attr('d', path(thai));
      provEls.attr('d', path);
      provLbls.forEach(o => { o.p = proj(d3.geoCentroid(o.f)); });
      base = { A: proj(TPC.ll), B: proj(RSU.ll), c0: proj(VIEWS[0].c), c1: proj(VIEWS[1].c) };
    }
    F = frame();
    const yrs = d3.range(Y0, Y1 + 1);
    aRed.attr('d', d3.area().curve(d3.curveStepAfter).x(d => F.x(d)).y0(F.yb).y1(F.y(BASE_SOCIAL))(yrs));
    aGold.attr('d', d3.area().curve(d3.curveStepAfter).x(d => F.x(d)).y0(F.y(BASE_SOCIAL)).y1(d => F.y(BASE_SOCIAL + gold(d)))(yrs));
    gx.attr('transform', `translate(0,${F.yb})`).call(d3.axisBottom(F.x).tickValues([2529, 2539, 2549, 2559, 2569]).tickFormat(d => 'พ.ศ. ' + d).tickSizeOuter(0));
    gy.attr('transform', `translate(${F.x0},0)`).call(d3.axisLeft(F.y).tickValues([0, 5, 10, 15, 20, 25]).tickSizeOuter(0));
    gAxes.selectAll('text').attr('font-family', 'IBM Plex Mono, monospace').attr('font-size', 11).attr('fill', '#5b544a');
    gAxes.selectAll('path,line').attr('stroke', '#8a7d68');
    gMile.attr('d', `M${F.x(MILESTONE.y)},${F.yb}V${F.yt - 10}`);
    totLine.attr('d', `M${F.x(TOTAL_NOW.y)},${F.y(BASE_SOCIAL + gold(TOTAL_NOW.y))}V${F.y(TOTAL_NOW.v)}`);
    totDot.attr('cx', F.x(TOTAL_NOW.y)).attr('cy', F.y(TOTAL_NOW.v));
    NEW_UNITS.forEach((u, i) => sketches[i].attr('transform', `translate(${F.x(u.y) + 4},${F.y(BASE_SOCIAL + gold(u.y)) - 4})`));
  }

  // light work: every scroll tick — only transforms, opacities and a few attributes
  function render() {
    if (!ready) return;
    // camera: zoom k around an interpolated centre (log-zoom + smoothstep feels like a drone descent)
    const e = ss(S.v);
    const k = Math.exp(Math.log(VIEWS[1].k) * e);
    const cx = lerp(base.c0[0], base.c1[0], e), cy = lerp(base.c0[1], base.c1[1], e);
    const T = p => [W / 2 + (p[0] - cx) * k, H / 2 + (p[1] - cy) * k];
    gMap.attr('transform', `translate(${W / 2},${H / 2}) scale(${k}) translate(${-cx},${-cy})`)
      .attr('opacity', 1 - ss(S.mapFade));
    gGrid.attr('opacity', ss(S.mapFade) * 0.9);

    const A = T(base.A), B = T(base.B);
    const mx = (A[0] + B[0]) / 2 - (B[1] - A[1]) * 0.45, my = (A[1] + B[1]) / 2 + (B[0] - A[0]) * 0.45;   // bow east, away from the river
    pRib.attr('d', `M${A[0]},${A[1]}Q${mx},${my} ${B[0]},${B[1]}`)
      .attr('stroke-dashoffset', 1 - S.rib).attr('opacity', 1 - ss(S.sq * 1.4));
    d3.select('#s4rib').attr('x1', A[0]).attr('y1', A[1]).attr('x2', B[0]).attr('y2', B[1]);
    ringR.attr('cx', A[0]).attr('cy', A[1] - 6); ringG.attr('cx', B[0]).attr('cy', B[1] - 6);
    const iconScale = 0.9 + 0.35 * e;                 // icons grow a little as we fly in
    iconR.attr('transform', `translate(${A[0]},${A[1]}) scale(${iconScale})`).attr('opacity', S.pins * (1 - ss(S.sq * 2.5)));
    iconG.attr('transform', `translate(${B[0]},${B[1]}) scale(${iconScale * S.rsu})`).attr('opacity', S.rsu * (1 - ss(S.sq * 2.5)));
    provLbls.forEach(o => place(o.el, W / 2 + (o.p[0] - cx) * k, H / 2 + (o.p[1] - cy) * k + o.dy, 'translate(-50%, -50%)',
      ss((S.v - 0.7) / 0.3) * (1 - ss(S.mapFade * 2)) * (o.yieldTo ? 1 - S[o.yieldTo] : 1)));

    // pins → area-true squares → first chart steps
    const G = Math.min(W * 0.34, H * 0.5);
    const R = G * Math.sqrt(TPC.rai / RSU.rai);
    const sqBase = H * 0.8;
    const sqR = { x: W * 0.27 - R / 2, y: sqBase - R, w: R, h: R };
    const sqG = { x: W * 0.6 - G / 2, y: sqBase - G, w: G, h: G };
    const pr = 7;
    const pinR = { x: A[0] - 16, y: A[1] - 26, w: 32, h: 26 };
    const pinG = { x: B[0] - 16, y: B[1] - 26, w: 32, h: 26 };
    const bandR = { x: F.x0, y: F.y(BASE_SOCIAL), w: F.x1 - F.x0, h: F.yb - F.y(BASE_SOCIAL) };
    const bandG = { x: F.x(Y0), y: F.y(BASE_SOCIAL + 1), w: F.x(2532) - F.x(Y0), h: F.y(BASE_SOCIAL) - F.y(BASE_SOCIAL + 1) };
    const box = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), w: lerp(p.w, q.w, t), h: lerp(p.h, q.h, t) });
    const step = (p, q, r) => S.chart > 0 ? box(q, r, ss(S.chart / 0.85)) : box(p, q, ss(S.sq));   // lands at 85%, then hands off
    const rr = step(pinR, sqR, bandR), rg = step(pinG, sqG, bandG);
    const rx = S.chart > 0 ? lerp(2, 0, ss(S.chart)) : lerp(pr, 2, ss(S.sq));
    const handoff = ss((S.chart - 0.85) / 0.15);           // squares hand over to the real chart shapes
    const sqIn = ss(S.sq * 2.5);
    sqRed.attr('x', rr.x).attr('y', rr.y).attr('width', rr.w).attr('height', rr.h).attr('rx', rx).attr('opacity', sqIn * (1 - handoff));
    sqGold.attr('x', rg.x).attr('y', rg.y).attr('width', rg.w).attr('height', rg.h).attr('rx', rx).attr('opacity', sqIn * (1 - handoff));
    gAreas.attr('opacity', handoff);
    gAxes.attr('opacity', ss(S.chart * 1.4 - 0.2));

    place(lTPC, A[0] - 26, A[1] - 4, 'translate(-100%, -50%)', S.pins * (1 - ss(S.sq * 2)));
    place(lRSU, B[0] + 26, B[1] - 14, 'translate(0, -50%)', S.rsu * (1 - ss(S.sq * 2)));
    const sqOp = ss((S.sq - 0.6) / 0.4) * (1 - ss(S.chart * 2.5));
    place(lSqR, sqR.x + R / 2, sqR.y - 12, 'translate(-50%, -100%)', sqOp);
    place(lSqG, sqG.x + G + 18, sqG.y + G, 'translate(0, -100%)', sqOp);

    // year sweep reveals the gold steps; sketches and labels fade/draw in as it passes each year
    const curYear = lerp(2532, Y1, S.sweep);
    d3.select('#s4sweep-r').attr('x', F.x0 - 2).attr('width', Math.max(0, F.x(curYear) - F.x0 + 2));
    const levels = [0, 1, 2, 3, 0, 1, 0];
    NEW_UNITS.forEach((u, i) => {
      const t = handoff * ss((curYear - u.y + 0.3) / 1.6);
      sketches[i].attr('stroke-dashoffset', 1 - t);
      const bx = F.x(u.y) + 4, by = F.y(BASE_SOCIAL + gold(u.y)) - 4;
      place(lEv[i], bx, by - 46 - levels[i] * 30 + (1 - t) * 10, 'translate(0, -100%)', t);
    });
    const mileT = handoff * ss((curYear - MILESTONE.y) / 1.5);
    gMile.attr('opacity', mileT * 0.8);
    place(lMile, F.x(MILESTONE.y) + 8, F.yt - 4 + (1 - mileT) * 8, '', mileT);
    const totT = handoff * ss((curYear - TOTAL_NOW.y) / 1.5);
    gTotal.attr('opacity', totT);
    place(lTot, F.x(TOTAL_NOW.y) - 10, F.y(TOTAL_NOW.v), 'translate(-100%, -50%)', totT);
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')
    .then(r => r.json())
    .then(topo => {
      const all = topojson.feature(topo, topo.objects.countries);
      thai = all.features.find(f => f.id === '764');
      // keep only Thailand's neighbourhood — far fewer vertices to draw
      const near = f => { const [[a, b], [c, d]] = d3.geoBounds(f); return c > 88 && a < 112 && d > 0 && b < 26; };
      land = { type: 'FeatureCollection', features: all.features.filter(f => f.id !== '764' && f.id !== '010' && near(f)) };
      size(); ready = true; render();
    })
    .catch(err => console.warn('Scene 4 map data could not load', err));
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); render(); }, 120); });

  /* ---------- scroll timeline ---------- */
  const R = { onUpdate: render };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s4-pin', start: 'top top', end: '+=1000%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });

  // Phase 1 — Recenter: Thailand → Bangkok, Tha Phra Chan glows
  tl.to('.s4-title', { opacity: 1, duration: 0.3 }, 0)
    .to(S, { pins: 1, duration: 0.5, ...R }, 0.3)
    .to('.s4-title', { opacity: 0, y: -30, duration: 0.5 }, 1.0)
    .to(S, { v: 1, duration: 2.6, ...R }, 1.1)          // easing is applied inside render()
    .to('.s4-zoom', { opacity: 1, duration: 0.4 }, 2.2)
    .to('.s4-zoom', { opacity: 0, duration: 0.4 }, 3.6);

  // Phase 2 — Bridge: Rangsit flashes, red→gold ribbon
  tl.to(S, { rsu: 1, duration: 0.4, ...R }, 3.8)
    .to(S, { rib: 1, duration: 1.2, ...R }, 4.1)
    .to('.s4-bridge', { opacity: 1, duration: 0.4 }, 4.6)
    .to('.s4-bridge', { opacity: 0, duration: 0.4 }, 6.4);

  // Phase 3 — Map → grid, pins → area-true squares → stacked area chart
  tl.to(S, { mapFade: 1, duration: 1, ...R }, 6.4)
    .to(S, { sq: 1, duration: 1.6, ...R }, 6.5)
    .to(S, { chart: 1, duration: 1.6, ...R }, 8.5)
    .to('.s4-chart-head', { opacity: 1, duration: 0.4 }, 9.4)
    .to(S, { sweep: 1, duration: 4, ...R }, 9.8)
    .to({}, { duration: 1 });

})();
