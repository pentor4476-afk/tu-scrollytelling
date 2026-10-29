/* =========================================================
   SCENE 9 — How far has Thammasat come? (the finale)
   Pinned part (scroll-scrubbed):
     1. dome outline + "90+ YEARS OF THAMMASAT"
     2. #1 WORLDWIDE — THE Impact Rankings 2026, SDG 16
     3. Nightingale rose of THE Impact 2026 results (longer petal = better rank)
     4. QS World University Rankings, edition by edition (line chart)
   ========================================================= */
(function scene9() {
  /* ---------- DATA (sources printed under each chart) ---------- */
  // THE Impact Rankings 2026 (Nation Thailand, 24–25 Jun 2026). Colours = Okabe–Ito palette (colour-blind safe).
  const RANKS = [
    { k: 'SDG 16', name: 'Peace, Justice & Strong Institutions', th: 'สันติภาพ ความยุติธรรม และสถาบันที่เข้มแข็ง', r: 1, c: '#0072B2', hi: true },
    { k: 'SDG 5', name: 'Gender Equality', th: 'ความเท่าเทียมทางเพศ', r: 25, c: '#CC79A7' },
    { k: 'SDG 11', name: 'Sustainable Cities & Communities', th: 'เมืองและชุมชนที่ยั่งยืน', r: 40, c: '#D55E00' },
    { k: 'Overall', name: 'Impact Rankings overall', th: 'อันดับรวม Impact Rankings', r: 46, c: '#7a6a52' },
    { k: 'SDG 17', name: 'Partnerships for the Goals', th: 'หุ้นส่วนเพื่อการพัฒนา (อันดับร่วม)', r: 55, c: '#56B4E9' },
    { k: 'SDG 7', name: 'Affordable & Clean Energy', th: 'พลังงานสะอาดที่เข้าถึงได้', r: 76, c: '#F0E442' }
  ];
  // QS World University Rankings by edition year (ค.ศ.). lo–hi = band when QS publishes a range. 2017: no data.
  const QS = [
    { y: 2014, lo: 601, hi: 650 }, { y: 2015, lo: 601, hi: 650 }, { y: 2016, lo: 601, hi: 650 },
    { y: 2017, miss: true },
    { y: 2018, lo: 601, hi: 650 }, { y: 2019, lo: 601, hi: 650 }, { y: 2020, lo: 601, hi: 650 },
    { y: 2021, lo: 561, hi: 570 }, { y: 2022, lo: 601, hi: 650 }, { y: 2023, lo: 651, hi: 700 },
    { y: 2024, lo: 600, hi: 600 }, { y: 2025, lo: 596, hi: 596 }, { y: 2026, lo: 551, hi: 551 },
    { y: 2027, lo: 555, hi: 555 }
  ].map(d => d.miss ? d : { ...d, m: (d.lo + d.hi) / 2, band: d.hi > d.lo });

  const ss = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const S = { dome: 0, one: 0, rank: 0, pop: 0, qs: 0 };

  /* ---------- 3. Nightingale rose ---------- */
  const RS = 640, C = RS / 2, R0 = 46, RMAX = 222;
  // petal AREA ∝ (101 − rank): rank #1 → full petal, #100 → nothing (area-true, so the eye isn't fooled)
  const rr = rank => Math.sqrt(R0 * R0 + (RMAX * RMAX - R0 * R0) * (101 - rank) / 100);
  const rose = d3.select('#s9-rose').attr('viewBox', `0 0 ${RS} ${RS}`);
  const g = rose.append('g').attr('transform', `translate(${C},${C})`);
  const STEP = Math.PI * 2 / RANKS.length, A0 = Math.PI / 6;          // best petal centred at 1 o'clock, then clockwise
  const ringG = g.append('g').attr('class', 's9-rings');
  [75, 50, 25, 1].forEach(v => {
    ringG.append('circle').attr('r', rr(v));
    const ra = A0 - 0.2;   // just inside the small SDG 7 sector, clear of its label
    ringG.append('text').attr('x', Math.sin(ra) * rr(v)).attr('y', -Math.cos(ra) * rr(v) + 4).attr('text-anchor', 'middle').text('#' + v);
  });
  const arc = d3.arc().padAngle(0.035).cornerRadius(7);
  const petals = RANKS.map((d, i) => {
    const a0 = A0 + i * STEP, a1 = a0 + STEP, mid = (a0 + a1) / 2;
    const pg = g.append('g').attr('class', 's9-petal' + (d.hi ? ' hi' : ''));
    const path = pg.append('path').attr('fill', d.c);
    const lbl = pg.append('g').attr('class', 'lbl').attr('opacity', 0);
    const right = Math.sin(mid) >= 0.05, left = Math.sin(mid) <= -0.05;
    const anchor = right ? 'start' : left ? 'end' : 'middle';
    lbl.append('text').attr('class', 'v').attr('text-anchor', anchor).text('#' + d.r);
    lbl.append('text').attr('class', 'k').attr('text-anchor', anchor).attr('dy', d.hi ? 22 : 16).text(d.k);
    return { d, a0, a1, mid, pg, path, lbl };
  });
  const hub = g.append('g').attr('class', 's9-hub');
  hub.append('circle').attr('r', R0 - 8);
  hub.append('text').attr('dy', -2).text('THE');
  hub.append('text').attr('class', 'sm').attr('dy', 13).text('IMPACT 2026');

  // legend (what each colour is)
  const legend = document.getElementById('s9-legend');
  RANKS.forEach(d => {
    const li = document.createElement('li'); if (d.hi) li.className = 'hi';
    li.innerHTML = `<i style="background:${d.c}"></i><span class="t"><b>${d.k}</b><small>${d.th}</small></span><em>#${d.r}</em>`;
    legend.appendChild(li);
  });

  function renderRose() {
    const pop = S.pop;                                           // raw value so back.out overshoot shows
    petals.forEach(({ d, a0, a1, mid, pg, path, lbl }, i) => {
      const t = ss(S.rank * 1.7 - i * 0.14);                     // best rank grows first, then down the list
      const r = R0 + (rr(d.r) - R0) * t;
      const off = d.hi ? 20 * pop : 0;                           // SDG 16 is pulled out of the rose
      pg.attr('transform', `translate(${Math.sin(mid) * off},${-Math.cos(mid) * off})`);
      path.attr('d', arc({ innerRadius: R0, outerRadius: Math.max(R0 + 0.1, r), startAngle: a0, endAngle: a1 }));
      const lr = r + (d.hi ? 18 : 12);
      const ly = Math.cos(mid) > 0.3 ? -(d.hi ? 26 : 18) : Math.cos(mid) < -0.3 ? 14 : -4;   // keep labels off the petal
      lbl.attr('transform', `translate(${Math.sin(mid) * lr},${-Math.cos(mid) * lr + ly})`)
         .attr('opacity', ss((t - 0.75) * 4));
    });
    rose.classed('popped', pop > 0.5);
  }

  /* ---------- 4. QS World line chart (rebuilt on resize: compact layout on phones) ---------- */
  const qs = d3.select('#s9-qs');
  let renderQS = () => {};
  function buildQS() {
    const narrow = window.innerWidth < 700;
    const QW = narrow ? 460 : 760, QH = narrow ? 380 : 360;
    const M = narrow ? { l: 50, r: 64, t: 34, b: 40 } : { l: 62, r: 92, t: 34, b: 42 };
    qs.selectAll('*').remove();
    qs.attr('viewBox', `0 0 ${QW} ${QH}`).classed('narrow', narrow);
    const x = d3.scaleLinear([2014, 2027], [M.l, QW - M.r]);
    const y = d3.scaleLinear([520, 720], [M.t, QH - M.b]);        // better rank at the top
    const ax = qs.append('g').attr('class', 's9-qaxis');
    [550, 600, 650, 700].forEach(v => {
      ax.append('line').attr('x1', M.l).attr('x2', QW - M.r).attr('y1', y(v)).attr('y2', y(v));
      ax.append('text').attr('x', M.l - 10).attr('y', y(v) + 4).attr('text-anchor', 'end').text('#' + v);
    });
    (narrow ? [2014, 2018, 2022, 2027] : [2014, 2016, 2018, 2020, 2022, 2024, 2027]).forEach(v =>
      ax.append('text').attr('x', x(v)).attr('y', QH - M.b + 24).attr('text-anchor', 'middle').text(v));
    ax.append('text').attr('class', 'cap').attr('x', narrow ? 4 : M.l - 10).attr('y', M.t - 16).attr('text-anchor', narrow ? 'start' : 'end').text('↑ อันดับยิ่งดี');
    ax.append('text').attr('class', 'cap').attr('x', x(2017)).attr('y', y(668)).attr('text-anchor', 'middle').text(narrow ? 'n/a' : 'ไม่มีข้อมูล');

    const pts = QS.filter(d => !d.miss);
    const bands = qs.append('g').attr('class', 's9-bands').selectAll('rect').data(pts.filter(d => d.band)).join('rect')
      .attr('x', d => x(d.y) - 6).attr('width', 12).attr('y', d => y(d.lo)).attr('height', d => y(d.hi) - y(d.lo)).attr('rx', 6);
    // straight segments only: no invented values between editions; the line breaks where 2017 is missing
    const line = d3.line().defined(d => !d.miss).x(d => x(d.y)).y(d => y(d.m));
    const clipR = qs.append('defs').append('clipPath').attr('id', 's9qclip').append('rect').attr('x', 0).attr('y', 0).attr('height', QH).attr('width', 0);
    qs.append('path').datum(QS).attr('class', 's9-qline').attr('d', line).attr('clip-path', 'url(#s9qclip)');
    const dots = qs.append('g').selectAll('circle').data(pts).join('circle')
      .attr('class', d => 's9-qdot' + (d.band ? ' band' : '') + (d.y === 2027 ? ' now' : ''))
      .attr('cx', d => x(d.y)).attr('cy', d => y(d.m)).attr('r', d => d.y === 2027 ? 7 : d.band ? 4.5 : 5);
    const notes = qs.append('g').attr('class', 's9-qnotes');
    const note = (yr, txt, dx, dy, anchor, cls) => notes.append('text').attr('data-y', yr).attr('class', cls || '')
      .attr('x', x(yr) + dx).attr('y', y(QS.find(d => d.y === yr).m) + dy).attr('text-anchor', anchor).text(txt);
    note(2014, '601–650', 0, -16, 'start');
    note(2021, '561–570', 0, -14, 'middle');
    note(2023, '651–700', 0, 34, 'middle');
    note(2024, '#600', 6, 22, 'start');
    note(2026, narrow ? '#551' : '#551 ดีที่สุด', 0, -14, 'end', 'best');
    note(2027, '#555', 14, 8, 'start', 'now');
    note(2027, 'ฉบับ 2027', 14, 24, 'start', 'sub');

    renderQS = () => {
      const t = ss(S.qs), xEdge = M.l + (QW - M.r - M.l) * t;
      clipR.attr('width', xEdge + 8);
      const vis = d => x(d.y) <= xEdge + 1 ? 1 : 0;
      dots.attr('opacity', vis); bands.attr('opacity', vis);
      notes.selectAll('text').attr('opacity', function () { return x(+this.dataset.y) <= xEdge + 1 ? 1 : 0; });
    };
    renderQS();
  }
  buildQS();
  let qsNarrow = window.innerWidth < 700;
  window.addEventListener('resize', () => { const n = window.innerWidth < 700; if (n !== qsNarrow) { qsNarrow = n; buildQS(); } });

  /* ---------- 1–2. dome draw + #1 grow ---------- */
  const domePaths = [...document.querySelectorAll('#s9-dome path')];
  domePaths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });
  function renderDome() { domePaths.forEach(p => { p.style.strokeDashoffset = p.dataset.len * (1 - ss(S.dome)); }); }
  const oneEl = document.getElementById('s9-one-num');
  function renderOne() { const t = ss(S.one); oneEl.style.transform = `scale(${0.4 + 0.6 * t})`; oneEl.style.opacity = t; }

  renderDome(); renderOne(); renderRose();
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s9-pin', start: 'top top', end: '+=820%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });
  tl.to('#s9-intro', { opacity: 1, duration: 0.3 }, 0)
    .to(S, { dome: 1, duration: 1.4, onUpdate: renderDome }, 0)
    .to('#s9-q', { opacity: 1, y: 0, duration: 0.5 }, 1.0)
    .to('#s9-intro', { opacity: 0, duration: 0.5 }, 2.2)
    .to('#s9-award', { opacity: 1, duration: 0.3 }, 2.5)
    .to(S, { one: 1, duration: 1.2, onUpdate: renderOne }, 2.5)
    .to('#s9-award .s9-award-txt', { opacity: 1, y: 0, duration: 0.6 }, 3.2)
    .to('#s9-award', { opacity: 0, duration: 0.5 }, 4.6)
    // rose: petals open from the best rank down, then SDG 16 is pulled out
    .to('#s9-rankwrap', { opacity: 1, duration: 0.4 }, 4.9)
    .to(S, { rank: 1, duration: 2.2, onUpdate: renderRose }, 5.1)
    .to(S, { pop: 1, duration: 0.7, ease: 'back.out(2)', onUpdate: renderRose }, 7.3)
    .to('#s9-legend li', { opacity: 1, x: 0, duration: 0.4, stagger: 0.12 }, 5.3)
    .to('#s9-rankwrap', { opacity: 0, duration: 0.5 }, 9.0)
    // QS World line
    .to('#s9-qswrap', { opacity: 1, duration: 0.4 }, 9.3)
    .to(S, { qs: 1, duration: 2.2, onUpdate: () => renderQS() }, 9.5)
    .to('#s9-qswrap .s9-qs', { opacity: 1, y: 0, duration: 0.5 }, 11.5)
    .to({}, { duration: 1.2 });
})();
