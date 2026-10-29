/* =========================================================
   SCENE 3 — Academic Expansion Spectrum (ทศวรรษ 2490–2520)
   Night map → dawn · red secret lines retract into the Dome ·
   5 knowledge streams flow out · streams settle into a treemap ·
   scroll through 2493 → 2503 → 2513 → 2522
   ========================================================= */
(function scene3() {
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- DATA ----------------------------------------------------------
     founded = ปีที่ก่อตั้ง (พ.ศ.) — sources in the data-layer note.
     Block size = years the faculty had been teaching by the shown year.
     If you find real enrolment numbers, fill `students` per year (e.g.
     students: { 2493: 1200, 2503: 2100, ... }) and they will be used instead. */
  const FACULTIES = [
    { key: 'law',  name: 'นิติศาสตร์',                 en: 'Law',                       founded: 2477, color: '#a3171f' },
    { key: 'com',  name: 'พาณิชยศาสตร์และการบัญชี',     en: 'Commerce & Accountancy',    founded: 2481, color: '#0072B2', stream: true },
    { key: 'pol',  name: 'รัฐศาสตร์',                   en: 'Political Science',         founded: 2492, color: '#D55E00', stream: true },
    { key: 'eco',  name: 'เศรษฐศาสตร์',                 en: 'Economics',                 founded: 2492, color: '#E69F00', stream: true },
    { key: 'sw',   name: 'สังคมสงเคราะห์ศาสตร์',          en: 'Social Administration',     founded: 2497, color: '#009E73', stream: true },
    { key: 'jc',   name: 'วารสารศาสตร์',                en: 'Journalism',                founded: 2497, color: '#CC79A7', stream: true },
    { key: 'la',   name: 'ศิลปศาสตร์',                  en: 'Liberal Arts',              founded: 2504, color: '#3d342b' },
    { key: 'sa',   name: 'สังคมวิทยาและมานุษยวิทยา',     en: 'Sociology & Anthropology',  founded: 2519, color: '#56B4E9' }
  ];
  const YEARS = [2493, 2503, 2513, 2522];
  const value = (f, y) => {
    if (f.students) {                       // optional real data: interpolate between given years
      const ks = Object.keys(f.students).map(Number).sort((a, b) => a - b);
      if (y <= ks[0]) return y >= f.founded ? f.students[ks[0]] : 0;
      for (let i = 1; i < ks.length; i++) if (y <= ks[i]) {
        const t = (y - ks[i - 1]) / (ks[i] - ks[i - 1]);
        return f.students[ks[i - 1]] + (f.students[ks[i]] - f.students[ks[i - 1]]) * t;
      }
      return f.students[ks[ks.length - 1]];
    }
    return Math.max(0, y - f.founded + 1);
  };
  const STREAMS = FACULTIES.filter(f => f.stream);

  /* ---------- stage ---------- */
  const pin = document.querySelector('.s3-pin');
  const svg = d3.select('#s3-stage');
  const treeEl = document.getElementById('s3-tree');
  let W = 0, H = 0;

  const defs = svg.append('defs');
  defs.html(`
    <linearGradient id="s3night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05090f"/><stop offset="1" stop-color="#121c2b"/></linearGradient>
    <linearGradient id="s3dawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fb0c9"/><stop offset=".45" stop-color="#f3d7b0"/><stop offset=".8" stop-color="#ffc98a"/><stop offset="1" stop-color="#f7b56e"/></linearGradient>
    <linearGradient id="s3paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7efe0"/><stop offset="1" stop-color="#efe2c8"/></linearGradient>
    <radialGradient id="s3sun"><stop offset="0" stop-color="#fff3c9"/><stop offset=".3" stop-color="#ffd27a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <filter id="s3glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);

  const bgNight = svg.append('rect').attr('fill', 'url(#s3night)');
  const bgDawn = svg.append('rect').attr('fill', 'url(#s3dawn)').attr('opacity', 0);
  const sun = svg.append('circle').attr('fill', 'url(#s3sun)').attr('opacity', 0);
  const river = svg.append('rect').attr('fill', '#33485a');
  const gDome = svg.append('g');
  const bgPaper = svg.append('rect').attr('fill', 'url(#s3paper)').attr('opacity', 0);
  const gRed = svg.append('g').attr('fill', 'none').attr('stroke', '#ff3b2f').attr('stroke-width', 2.5)
    .attr('stroke-linecap', 'round').attr('filter', 'url(#s3glow)');
  const gStreams = svg.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');
  const flash = svg.append('circle').attr('fill', '#fff2c4').attr('filter', 'url(#s3glow)').attr('opacity', 0);

  // the finished Dome from Scene 1, reused as a silhouette that warms with the dawn
  const domeSrc = document.querySelector('#s1-stage #dome-fill');
  const dome = domeSrc.cloneNode(true);
  dome.removeAttribute('id'); dome.style.opacity = 1; dome.setAttribute('opacity', 1);
  gDome.node().appendChild(dome);
  const domeLight = { b: 0.18 };            // night silhouette → lit by the dawn
  const setDomeLight = () => { dome.style.filter = `brightness(${domeLight.b})`; };
  setDomeLight();

  // red secret lines (from the edges of the old world map into the spire tip)
  const RED_FROM = [[0, .22], [.12, 0], [1, .16], [.86, 0], [0, .55], [1, .5]];
  const redEls = RED_FROM.map(() => gRed.append('path').attr('pathLength', 1).attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', 0));
  const streamEls = STREAMS.map(f => gStreams.append('path').attr('stroke', f.color).attr('opacity', 0.9)
    .attr('pathLength', 1).attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', 1));

  // state driven by the scroll timeline
  const S = { dawn: 0, red: 0, flash: 0, streams: 0, streamFade: 1, morph: 0, paper: 0, year: YEARS[0] };
  let tip = [0, 0], domeScale = 1, phase = 0;

  function layoutStage() {
    const r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    [bgNight, bgDawn, bgPaper].forEach(b => b.attr('width', W).attr('height', H));
    const horizon = H * 0.84;
    river.attr('y', horizon).attr('width', W).attr('height', H - horizon);
    domeScale = Math.min(W / 1600 * 1.15, H / 900 * 1.3);
    gDome.attr('transform', `translate(${W / 2} ${horizon}) scale(${domeScale}) translate(-1000 -500)`);
    tip = [W / 2, horizon - 200 * domeScale];
    sun.attr('cx', W * 0.72).attr('cy', horizon).attr('r', Math.max(W, H) * 0.45);
  }

  function drawLines() {
    // red lines retract: dashoffset 0 → -1 hides from the outer end, finishing at the spire
    RED_FROM.forEach(([fx, fy], i) => {
      const a = [fx * W, fy * H];
      const c = [(a[0] + tip[0]) / 2 + (fx < .5 ? -1 : 1) * W * .06, Math.min(a[1], tip[1]) - H * .12];
      redEls[i].attr('d', `M${a[0]},${a[1]}Q${c[0]},${c[1]} ${tip[0]},${tip[1]}`)
        .attr('stroke-dashoffset', -Math.min(1, Math.max(0, S.red * 1.25 - i * 0.05)));
    });
    // knowledge streams: wavy ribbons from the spire fanning out across the sky
    const n = STREAMS.length, sw = Math.max(10, Math.min(W, H) * 0.028);
    STREAMS.forEach((f, i) => {
      const end = [W * (0.4 + 0.54 * i / (n - 1)), H * (0.08 + 0.05 * Math.abs(i - 2))];   // fan to the right of the caption
      const pts = [];
      for (let k = 0; k <= 48; k++) {
        const t = k / 48;
        const x = tip[0] + (end[0] - tip[0]) * (t * t * (3 - 2 * t));
        const y = tip[1] + (end[1] - tip[1]) * t;
        const wob = Math.sin(t * 7 + phase + i * 1.3) * 18 * t;
        pts.push([x + wob, y + Math.cos(t * 5 + phase * 0.8 + i) * 6 * t]);
      }
      streamEls[i].attr('d', d3.line().curve(d3.curveBasis)(pts)).attr('stroke-width', sw)
        .attr('stroke-dashoffset', 1 - Math.min(1, Math.max(0, S.streams * 1.4 - i * 0.1)))
        .attr('opacity', 0.9 * S.streamFade);
    });
    flash.attr('cx', tip[0]).attr('cy', tip[1]).attr('r', 6 + S.flash * 40).attr('opacity', S.flash > 0 && S.flash < 1 ? 1 - S.flash : 0);
  }

  /* ---------- treemap (HTML cells, d3 layout) ---------- */
  const cells = FACULTIES.map(f => {
    const d = document.createElement('div');
    d.className = 's3-cell'; d.style.background = f.color;
    d.innerHTML = `<b>${f.name}</b><em>พ.ศ. ${f.founded}</em><span>${f.en}</span>`;
    treeEl.appendChild(d); return d;
  });
  const maxTotal = d3.sum(FACULTIES, f => value(f, YEARS[YEARS.length - 1]));
  const root = d3.hierarchy({ children: FACULTIES.map(f => ({ f })) });
  const treemap = d3.treemap().tile(d3.treemapResquarify).paddingInner(3).round(false);
  // build the squarified topology once at the final year so the layout stays stable while it grows
  root.sum(d => d.f ? value(d.f, YEARS[YEARS.length - 1]) : 0);
  treemap.size([1000, 600])(root);

  const yearEl = document.getElementById('s3-year'), ceEl = document.getElementById('s3-year-ce'), countEl = document.getElementById('s3-count');
  const ticks = document.getElementById('s3-ticks');
  YEARS.forEach(y => { const li = document.createElement('li'); li.textContent = y; ticks.appendChild(li); });

  function drawTree() {
    const y = S.year;
    const total = d3.sum(FACULTIES, f => value(f, y));
    const box = { x: W * 0.05, y: Math.max(150, H * 0.24), w: W * 0.9 };
    box.h = H - box.y - H * 0.05;
    const k = Math.sqrt(total / maxTotal);                    // overall area grows with the total
    const cw = box.w * k, ch = box.h * k;
    const ox = box.x + (box.w - cw) / 2, oy = box.y + (box.h - ch);   // grow upward from the base
    root.sum(d => d.f ? value(d.f, y) : 0);
    treemap.size([cw, ch])(root);
    const m = S.morph;
    root.leaves().forEach((leaf, i) => {
      const el = cells[i];
      const tx = ox + leaf.x0, ty = oy + leaf.y0, tw = Math.max(0, leaf.x1 - leaf.x0), th = Math.max(0, leaf.y1 - leaf.y0);
      // morph: each block grows out of the spire tip into its place
      const mi = Math.min(1, Math.max(0, m * 1.6 - i * 0.08)), e = 1 - Math.pow(1 - mi, 3);
      const x = tip[0] + (tx - tip[0]) * e, yy = tip[1] + (ty - tip[1]) * e;
      el.style.transform = `translate(${x}px, ${yy}px)`;
      el.style.width = (tw * e) + 'px'; el.style.height = (th * e) + 'px';
      el.style.opacity = tw * th > 4 && mi > 0 ? 1 : 0;
      el.classList.toggle('sm', tw < 150 || th < 80);
      el.classList.toggle('xs', tw < 64 || th < 40);
    });
    const yr = Math.round(y);
    yearEl.textContent = yr; ceEl.textContent = yr - 543;
    countEl.textContent = FACULTIES.filter(f => f.founded <= yr).length;
    [...ticks.children].forEach((li, i) => li.classList.toggle('on', yr >= YEARS[i]));
  }

  function render() { drawLines(); drawTree(); }
  layoutStage(); render();
  window.addEventListener('resize', () => { layoutStage(); render(); });
  gsap.ticker.add(() => { phase += 0.02; if (S.streams > 0 && S.streamFade > 0) drawLines(); });

  // legend for the five streams
  const legend = document.getElementById('s3-legend');
  STREAMS.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<i style="background:${f.color}"></i>${f.name} <small style="color:#8a7a62">พ.ศ. ${f.founded}</small>`;
    legend.appendChild(li);
  });

  /* ---------- scroll timeline ---------- */
  const R = { onUpdate: render };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s3-pin', start: 'top top', end: '+=1000%', scrub: 1, pin: true, anticipatePin: 1 }
  });

  // night → dawn
  tl.to('.s3-title', { opacity: 1, duration: 0.3 }, 0)
    .to('.s3-title', { opacity: 0, y: -30, duration: 0.5 }, 1.0)
    .to(bgDawn.node(), { opacity: 1, duration: 1.6 }, 0.6)
    .to(sun.node(), { opacity: 1, duration: 1.6 }, 0.8)
    .to(domeLight, { b: 1, duration: 1.6, onUpdate: setDomeLight }, 0.8)
    .to(river.node(), { attr: { fill: '#7f98a3' }, duration: 1.6 }, 0.8)
    .to('.s3-dawn', { opacity: 1, duration: 0.4 }, 1.4)
    .to('.s3-dawn', { opacity: 0, duration: 0.4 }, 3.1);

  // red lines curl back into the Dome, flash, then five streams flow out
  tl.to(S, { red: 1, duration: 1.6, ...R }, 1.5)
    .to(S, { flash: 1, duration: 0.6, ...R }, 3.0)
    .to(S, { streams: 1, duration: 1.8, ...R }, 3.3)
    .to('.s3-streams', { opacity: 1, duration: 0.4 }, 3.6)
    .to('.s3-streams', { opacity: 0, duration: 0.4 }, 5.6);

  // streams settle into blocks: paper backdrop, Dome steps back, treemap grows out of the spire
  tl.to(S, { streamFade: 0, duration: 0.8, ...R }, 5.8)
    .to(bgPaper.node(), { opacity: 1, duration: 0.8 }, 5.9)
    .to(gDome.node(), { opacity: 0.12, duration: 0.8 }, 5.9)
    .to(S, { morph: 1, duration: 1.2, ...R }, 6.0)
    .to('.s3-head', { opacity: 1, duration: 0.4 }, 6.6);

  // decades: 2493 → 2503 → 2513 → 2522, holding on each
  let t = 7.6;
  for (let i = 1; i < YEARS.length; i++) {
    tl.to(S, { year: YEARS[i], duration: 1.4, ease: 'power1.inOut', ...R }, t);
    t += 2.1;
  }
  tl.to({}, { duration: 0.8 }, t);

  /* ---------- data layer: founding timeline ---------- */
  const tlEl = document.getElementById('s3-timeline');
  const Y0 = 2475, Y1 = 2524, pos = y => ((y - Y0) / (Y1 - Y0) * 100) + '%';
  const axis = document.createElement('div'); axis.className = 's3-axis'; tlEl.appendChild(axis);
  [2477, 2487, 2497, 2507, 2517].forEach(y => {
    const l = document.createElement('div'); l.className = 's3-axis-lbl'; l.style.left = pos(y); l.textContent = y; tlEl.appendChild(l);
  });
  const seen = {};
  FACULTIES.forEach((f, i) => {
    const slot = seen[f.founded] = (seen[f.founded] || 0) + 1;
    const stem = 18 + (slot - 1) * 64 + (i % 2) * 6;
    const p = document.createElement('div'); p.className = 's3-pt'; p.style.left = pos(f.founded);
    p.innerHTML = `<i style="background:${f.color}"></i><div class="stem" style="height:${stem}px"></div><span><b>${f.founded}</b>${f.name}</span>`;
    tlEl.appendChild(p);
  });
  gsap.from('.s3-pt', { opacity: 0, y: 16, duration: 0.6, stagger: 0.08, ease: 'power2.out',
    scrollTrigger: { trigger: '#s3-timeline', start: 'top 80%' } });
})();
