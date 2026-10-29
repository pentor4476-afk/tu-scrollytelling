/* =========================================================
   SCENE 6 — Who sits in which faculty? (gender by faculty, 2569)
   Dot-unit stacked bars: 1 dot = 2 students, male (blue) at the bottom,
   female (pink) on top. Scroll fills each faculty, then three callouts.
   ========================================================= */
(function scene6b() {
  /* ---------- DATA (ปี 2569, provided by the project team) ---------- */
  // sorted from most male-heavy to most female-heavy
  const FAC = [
    { k: 'eng', name: 'วิศวกรรมศาสตร์', short: 'วิศวะ', note: 'รังสิต พัทยา และอื่น ๆ', m: 537, f: 254, pm: 67, pf: 33 },
    { k: 'med', name: 'แพทยศาสตร์', short: 'แพทย์', note: '', m: 109, f: 128, pm: 46, pf: 54 },
    { k: 'acc', name: 'พาณิชยศาสตร์ฯ', short: 'พาณิชย์ฯ', note: 'ท่าพระจันทร์ และรังสิต', m: 386, f: 503, pm: 43, pf: 57 },
    { k: 'law', name: 'นิติศาสตร์', short: 'นิติ', note: 'ท่าพระจันทร์ รังสิต ลำปาง', m: 362, f: 529, pm: 41, pf: 59 },
    { k: 'nur', name: 'พยาบาลศาสตร์', short: 'พยาบาล', note: '', m: 18, f: 81, pm: 18, pf: 82 }
  ];
  const PER_DOT = 2, COLS = 10, STEP = 9, GAP = 5, R = 3.4;
  FAC.forEach(d => { d.dm = Math.round(d.m / PER_DOT); d.df = Math.round(d.f / PER_DOT); d.n = d.dm + d.df; d.total = d.m + d.f; });
  const ROWS = Math.max(...FAC.map(d => Math.ceil(d.n / COLS)));
  const rowsH = r => r * STEP + Math.floor(Math.max(0, r - 1) / 5) * GAP;
  const ss = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  const svg = d3.select('#s6b-chart');
  const S = { fill: 0, strip: 0, step: 0 };
  let dots = [], totals = [];

  function build() {
    const narrow = window.innerWidth < 700;
    const CW = narrow ? 560 : 1000, TOP = 58, BOT = narrow ? 58 : 70, BAR = rowsH(ROWS);
    const CH = TOP + BAR + BOT, base = TOP + BAR, colW = (CW - 20) / FAC.length;
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${CW} ${CH}`).classed('narrow', narrow);
    svg.append('line').attr('class', 'base').attr('x1', 6).attr('x2', CW - 6).attr('y1', base + 6).attr('y2', base + 6);
    dots = []; totals = [];
    FAC.forEach((d, k) => {
      const cx = 10 + colW * (k + 0.5), bw = COLS * STEP + GAP, x0 = cx - bw / 2;
      const g = svg.append('g').attr('class', 'fac').attr('data-k', d.k);
      for (let i = 0; i < d.n; i++) {
        const row = Math.floor(i / COLS), col = i % COLS;
        const x = x0 + col * STEP + (col >= 5 ? GAP : 0) + STEP / 2;
        const y = base - (row * STEP + Math.floor(row / 5) * GAP) - STEP / 2;
        dots.push({ k, i, n: d.n, el: g.append('circle').attr('class', i < d.dm ? 'm' : 'f').attr('cx', x).attr('cy', y).attr('r', R).node() });
      }
      const top = base - rowsH(Math.ceil(d.n / COLS));
      const t = g.append('g').attr('class', 'tot').attr('transform', `translate(${cx},${top - 14})`);
      t.append('text').attr('class', 'n').text(d.total.toLocaleString('en-US'));
      totals.push(t.node());
      const lb = g.append('g').attr('class', 'lbl').attr('transform', `translate(${cx},${base + 30})`);
      lb.append('text').attr('class', 'name').text(narrow ? d.short : d.name);
      const r = lb.append('text').attr('class', 'ratio').attr('dy', narrow ? 20 : 22);
      r.append('tspan').attr('class', 'm').text(narrow ? d.pm : 'ชาย ' + d.pm);
      r.append('tspan').attr('class', 'sep').text(' : ');
      r.append('tspan').attr('class', 'f').text(narrow ? d.pf : 'หญิง ' + d.pf);
    });
    render();
  }

  const strip = document.getElementById('s6b-strip');
  function render() {
    // faculties fill left → right, overlapping; each from the bottom up (men first, then women)
    dots.forEach(({ k, i, n, el }) => {
      const p = ss((S.fill - k * 0.15) / 0.4);
      el.style.opacity = i < p * n ? 1 : 0;
    });
    totals.forEach((t, k) => { t.style.opacity = ss((S.fill - k * 0.15 - 0.3) / 0.1); });
    strip.style.setProperty('--grow', ss(S.strip));
    const focus = ['', 'eng', 'nur', 'all'][Math.round(S.step)] || '';
    document.querySelector('.s6b-pin').dataset.focus = focus;
  }

  build();
  let wasNarrow = window.innerWidth < 700;
  window.addEventListener('resize', () => { const n = window.innerWidth < 700; if (n !== wasNarrow) { wasNarrow = n; build(); } });

  const R_ = { onUpdate: render };
  const steps = gsap.utils.toArray('.s6b-step');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s6b-pin', start: 'top top', end: '+=700%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });
  tl.to('.s6b-title', { opacity: 1, duration: 0.3 }, 0)
    .to('.s6b-title', { opacity: 0, y: -24, duration: 0.5 }, 1.0)
    .to('.s6b-main', { opacity: 1, duration: 0.5 }, 1.3)
    .to(S, { fill: 1, duration: 2.6, ...R_ }, 1.5)
    .to(S, { strip: 1, duration: 0.6, ...R_ }, 4.1)
    // callouts: engineering → nursing → whole university
    .to(S, { step: 1, duration: 0.2, ...R_ }, 4.9).to(steps[0], { opacity: 1, duration: 0.4 }, 4.9)
    .to(steps[0], { opacity: 0, duration: 0.3 }, 6.2)
    .to(S, { step: 2, duration: 0.2, ...R_ }, 6.4).to(steps[1], { opacity: 1, duration: 0.4 }, 6.4)
    .to(steps[1], { opacity: 0, duration: 0.3 }, 7.7)
    .to(S, { step: 3, duration: 0.2, ...R_ }, 7.9).to(steps[2], { opacity: 1, duration: 0.4 }, 7.9)
    .to(steps[2], { opacity: 0, duration: 0.3 }, 9.2)
    .to(S, { step: 0, duration: 0.2, ...R_ }, 9.4)
    .to({}, { duration: 0.8 });
})();
