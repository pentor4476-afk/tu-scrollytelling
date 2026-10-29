/* =========================================================
   SCENE 2 — The Secret Fortress & Free Thai Network (1942–1945)
   Lit Dome → wartime blackout → zoom into the top room (telegraph)
   → red radio pulse from the spire → bird's-eye flow map that
   zooms out from Tha Phra Chan to Allied bases
   ========================================================= */
(function scene2() {
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- 1. reuse the Dome stage from Scene 1, set to its final lit state ---------- */
  const stage = document.getElementById('s1-stage').cloneNode(true);
  stage.id = 's2-stage';
  stage.setAttribute('aria-label', 'ภาพเคลื่อนไหว: ตึกโดมดับไฟยามสงคราม และห้องยอดโดมที่มีผู้ส่งรหัสโทรเลข');
  document.querySelector('.s2-dome').appendChild(stage);
  const $ = s => stage.querySelector(s);
  const cam = $('#s1-cam');

  gsap.set([$('#night'), $('#dome-fill'), $('#win-glow'), $('#halo-el'), $('#reflection')], { opacity: 1 });
  gsap.set([$('#scaffold'), $('#grid'), $('#construct')].filter(Boolean), { opacity: 0 });
  if ($('#pen')) $('#pen').remove();
  gsap.set($('#dim'), { opacity: 0.6 });
  stage.querySelectorAll('.bp').forEach(p => { p.style.strokeDashoffset = 0; });
  const lines = $('#bp-lines');
  lines.setAttribute('stroke', '#6e5530'); lines.setAttribute('stroke-opacity', 0.55); lines.setAttribute('stroke-width', 1);
  gsap.to(stage.querySelectorAll('.wave'), { x: () => -20 - Math.random() * 30, duration: () => 2.5 + Math.random() * 2,
    repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // the room at the top of the tower: lamp light, a silhouette at a telegraph key
  $('defs').insertAdjacentHTML('beforeend', `
    <radialGradient id="s2lamp" gradientUnits="userSpaceOnUse" cx="192" cy="22" r="200">
      <stop offset="0" stop-color="#ffb35c"/><stop offset=".45" stop-color="#b8541f"/><stop offset="1" stop-color="#2a1208"/>
    </radialGradient>`);
  // drawn in a local 270×130 box, then scaled into the lantern opening (27×13 scene units)
  const room = document.createElementNS(NS, 'g');
  room.setAttribute('opacity', 0);
  room.innerHTML = `
  <g transform="translate(986.5 346.5) scale(0.1)">
    <!-- 1 unit ≈ 1.3 cm: desk 75 cm high, seat 45 cm, seated head-top ≈ 130 cm -->
    <rect width="270" height="130" fill="url(#s2lamp)"/>
    <rect y="127" width="270" height="3" fill="#1a0e07"/>
    <!-- notes pinned on the wall -->
    <rect x="112" y="14" width="34" height="22" fill="#3b2414" opacity=".8"/>
    <path d="M117 20H141M117 25H138M117 30H142" stroke="#7a4f2c" stroke-width="1"/>
    <!-- hanging lamp over the set -->
    <path d="M192 0V11" stroke="#120a06" stroke-width="1.2"/>
    <path d="M184 18L188 11H196L200 18Z" fill="#120a06"/>
    <circle cx="192" cy="19.5" r="2.4" fill="#ffe2a8"/>
    <path d="M184 18L164 72H220L200 18Z" fill="#ffcf85" opacity=".13"/>
    <!-- desk (shorter) -->
    <rect x="118" y="72" width="110" height="4" fill="#1b100a"/>
    <path d="M123 76V127M223 76V127" stroke="#140c07" stroke-width="4"/>
    <!-- radio transceiver -->
    <rect x="166" y="40" width="54" height="32" rx="1.5" fill="#1a110b" stroke="#3a2618" stroke-width=".8"/>
    <rect x="171" y="45" width="20" height="10" rx="1" fill="#e8a64a" opacity=".85"/>
    <path d="M173.5 53.5L181 47.5" stroke="#2a170c" stroke-width="1"/>
    <circle cx="205" cy="50" r="5" fill="#2a1c12" stroke="#c98a3e" stroke-width=".8"/>
    <path d="M205 50L207.5 46.8" stroke="#e8b46a" stroke-width=".8"/>
    <circle cx="177" cy="64" r="2.8" fill="#2a1c12" stroke="#8a5c2c" stroke-width=".7"/>
    <circle cx="189" cy="64" r="2.8" fill="#2a1c12" stroke="#8a5c2c" stroke-width=".7"/>
    <circle cx="212" cy="64" r="1.8" class="s2-led" fill="#5a1410"/>
    <path d="M216 40V20" stroke="#2a1c12" stroke-width="1.2"/>
    <!-- message pad + pencil -->
    <path d="M151 72L153.5 69H164L163 72Z" fill="#d9c9a6"/>
    <path d="M155 70.5H161" stroke="#8a7a5c" stroke-width=".5"/>
    <!-- straight Morse key: base, pivoting lever, knob -->
    <rect x="131" y="69" width="17" height="3" rx=".8" fill="#2c1d12"/>
    <g class="s2-lever">
      <path d="M134 68.3L146 66" stroke="#b07a3a" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="146" cy="64.8" r="2.3" fill="#120a06"/>
    </g>
    <!-- chair -->
    <path d="M76 52V127M76 95H104M101 95V127" stroke="#0e0805" stroke-width="3"/>
    <!-- operator, seated in profile facing the set -->
    <g fill="#0a0605">
      <path d="M82 96Q78 74 86 57Q94 51 102 57L102 80L99 96Z"/>
      <path d="M94 47H100L100.5 55H93.5Z"/>
      <ellipse cx="97" cy="40" rx="7" ry="8.5"/>
      <path d="M103.6 38.5L106.6 41.6L103.6 42.8Z"/>
    </g>
    <!-- legs: thigh to the knee under the desk, shin to the floor -->
    <path d="M90 92L118 93" stroke="#0a0605" stroke-width="11" stroke-linecap="round"/>
    <path d="M118 93L120 125" stroke="#0a0605" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M119 126.5H129" stroke="#0a0605" stroke-width="3.5" stroke-linecap="round"/>
    <!-- headphones + cable to the set -->
    <path d="M93 41Q90 29.5 99 30" fill="none" stroke="#2b1b10" stroke-width="2"/>
    <ellipse cx="94.5" cy="41" rx="2.8" ry="3.6" fill="#2b1b10" stroke="#5a3a20" stroke-width=".6"/>
    <path d="M94.5 44.6Q92 66 122 67T166 62" fill="none" stroke="#2b1b10" stroke-width=".8" opacity=".9"/>
    <!-- arm: upper arm fixed, forearm + hand tap the key -->
    <path d="M99 59L112 71" stroke="#0a0605" stroke-width="6.5" stroke-linecap="round"/>
    <g class="s2-hand">
      <path d="M112 71L139 66" stroke="#0a0605" stroke-width="5" stroke-linecap="round"/>
      <path d="M138 62.8Q147 60.5 148.8 65L139 68.4Z" fill="#0a0605"/>
    </g>
    <!-- warm rim light from the lamp -->
    <path d="M102 58L102 79M103.5 34Q105 39 104 45" stroke="#ff9d4a" stroke-width=".9" fill="none" opacity=".6"/>
  </g>`;
  cam.insertBefore(room, lines);

  // open up the lantern so the room is visible: keep its frame, drop the louvre slats
  stage.querySelectorAll('#dome-fill path').forEach(p => { if (p.getAttribute('d').startsWith('M992 348')) p.remove(); });
  stage.querySelectorAll('#bp-lines .bp').forEach(p => {
    if (p.getAttribute('d').startsWith('M986 360V346')) p.setAttribute('d', 'M986 360V346H1014V360Z');
  });
  const lanternFill = [...stage.querySelectorAll('#dome-fill rect')].find(r => r.getAttribute('y') === '346');
  if (lanternFill) lanternFill.setAttribute('fill', 'none');

  // the operator keys "RUTH" in Morse: ·−· ··− − ····  (dot = 1 unit, dash = 3, gaps per ITU)
  const hand = room.querySelector('.s2-hand'), lever = room.querySelector('.s2-lever'), led = room.querySelector('.s2-led');
  const U = 0.11, keyTl = gsap.timeline({ repeat: -1, repeatDelay: U * 10 });
  let t = 0;
  ['.-.', '..-', '-', '....'].forEach(letter => {
    [...letter].forEach(sym => {
      const hold = (sym === '.' ? 1 : 3) * U;
      keyTl.to(hand, { y: 1.5, duration: 0.04 }, t)
           .to(lever, { rotation: 4, svgOrigin: '134 68.3', duration: 0.04 }, t)
           .set(led, { attr: { fill: '#ff3b2f' } }, t)
           .to(hand, { y: 0, duration: 0.05 }, t + hold)
           .to(lever, { rotation: 0, svgOrigin: '134 68.3', duration: 0.05 }, t + hold)
           .set(led, { attr: { fill: '#5a1410' } }, t + hold);
      t += hold + U;
    });
    t += U * 2;
  });

  // red radio pulses from the spire tip
  const rings = document.createElementNS(NS, 'g');
  for (let i = 0; i < 4; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 1000); c.setAttribute('cy', 300); c.setAttribute('r', 2);
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#ff3b2f'); c.setAttribute('stroke-width', 3);
    c.setAttribute('vector-effect', 'non-scaling-stroke'); c.setAttribute('filter', 'url(#glow)');
    c.setAttribute('opacity', 0);
    rings.appendChild(c);
  }
  cam.appendChild(rings);
  const tip = document.createElementNS(NS, 'circle');
  tip.setAttribute('cx', 1000); tip.setAttribute('cy', 300); tip.setAttribute('r', 2.2);
  tip.setAttribute('fill', '#ff3b2f'); tip.setAttribute('filter', 'url(#glow)'); tip.setAttribute('opacity', 0);
  cam.appendChild(tip);

  // camera — same model as Scene 1, starting where Scene 1 ended
  const C = { x: 960, y: 450, lz: Math.log(1.35) };
  const applyCam = () => {
    cam.setAttribute('transform', `translate(800 450) scale(${Math.exp(C.lz)}) translate(${-C.x} ${-C.y})`);
  };
  applyCam();

  // morse line, revealed by scroll
  const MORSE = '·−· ··− − ····   ·−−− ·− −· −·· −.−− ';   // "RUTH" + call sign flavour
  const morseEl = document.getElementById('s2-morse');
  const morse = { n: 0 };

  /* ---------- 2. flow map (D3 + world-atlas) ---------- */
  const map = d3.select('#s2-map');
  const labels = document.getElementById('s2-labels');
  const HQ = { name: 'ตึกโดม · ท่าพระจันทร์', sub: 'กองบัญชาการลับเสรีไทย', ll: [100.491, 13.757] };
  const NODES = [
    { name: 'แคนดี, ซีลอน', sub: 'SEAC · OSS Det. 404 · Force 136', ll: [80.634, 7.291],
      num: '6', txt: 'เครื่องส่งวิทยุลับในกรุงเทพฯ ส่งข้อความรหัสถึง OSS ที่ซีลอน', chip: 'bl', lbl: 'l' },
    { name: 'จีนตอนใต้', sub: 'คุนหมิง · ซือเหมา · ฉงชิ่ง', ll: [106.552, 29.563],
      num: '11', txt: 'นายทหารเสรีไทยแทรกซึมเข้าไทยทางบก (พ.ค. 2487)', chip: 'tr', lbl: 'r' },
    { name: 'ลอนดอน', sub: 'เสรีไทยสายอังกฤษ', ll: [-0.128, 51.507],
      num: '24', txt: 'นักศึกษาไทยผ่านการฝึกเข้าร่วม Force 136 (2486)', chip: 't', lbl: 'r' },
    { name: 'วอชิงตัน ดี.ซี.', sub: 'เสรีไทยสายอเมริกา · OSS', ll: [-77.037, 38.907],
      num: '56', txt: 'เสรีไทยในแผน OSS ร่วมชาวอเมริกัน 214 นาย (ส.ค. 2488)', chip: 'b', lbl: 'r' }
  ];
  // map views: 0 = Bangkok close-up, 1 = Asia, 2 = world
  const VIEWS = [
    { c: [100.5, 14.5], k: 7 },
    { c: [94, 20], k: 2.3 },
    { c: [14, 24], k: 1 }
  ];
  const M = { v: 0, hq: 0, flows: NODES.map(() => ({ d: 0, l: 0 })) };

  const proj = d3.geoNaturalEarth1().rotate([-14, 0]);
  const path = d3.geoPath(proj);
  let W = 0, H = 0, s0 = 1, land = null, ready = false;

  const gSphere = map.append('path').attr('fill', '#0a1220');
  const gGrat = map.append('path').attr('fill', 'none').attr('stroke', '#1d2a3c').attr('stroke-width', 0.6);
  const gLand = map.append('path').attr('fill', '#1a2433').attr('stroke', '#33445b').attr('stroke-width', 0.6);
  const gTH = map.append('path').attr('fill', '#3a2a1c').attr('stroke', '#f2b81f').attr('stroke-width', 0.8).attr('stroke-opacity', 0.6);
  const defs = map.append('defs');
  defs.html(`<filter id="s2glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  const gFlows = map.append('g').attr('fill', 'none').attr('stroke-linecap', 'round');
  const flowEls = NODES.map(() => ({
    base: gFlows.append('path').attr('stroke', '#ff3b2f').attr('stroke-width', 2).attr('filter', 'url(#s2glow)')
      .attr('pathLength', 1).attr('stroke-dasharray', '1 1'),
    pulse: gFlows.append('path').attr('stroke', '#ffe1c2').attr('stroke-width', 3.5)
      .attr('pathLength', 1).attr('stroke-dasharray', '0.025 0.975').attr('opacity', 0)
  }));
  const gNodes = map.append('g');
  const nodeEls = NODES.map(() => gNodes.append('circle').attr('r', 4.5).attr('fill', '#ff3b2f').attr('filter', 'url(#s2glow)').attr('opacity', 0));
  const hqRing = gNodes.append('circle').attr('fill', 'none').attr('stroke', '#f2b81f').attr('stroke-width', 1.5);
  const hqDot = gNodes.append('circle').attr('r', 6).attr('fill', '#f2b81f').attr('filter', 'url(#s2glow)');

  // HTML labels
  const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; labels.appendChild(d); return d; };
  const hqLbl = mk('node-lbl hq', `${HQ.name}<small>${HQ.sub}</small>`);
  const hqChip = mk('flow-chip hq', `<em>50,000+</em><span>คนไทยที่ได้รับการฝึกและติดอาวุธเมื่อสิ้นสงคราม</span>`);
  const nodeLbls = NODES.map(n => mk('node-lbl', `${n.name}<small>${n.sub}</small>`));
  const chips = NODES.map(n => mk('flow-chip', `<em>${n.num}</em><span>${n.txt}</span>`));
  const PLACE = { // where a chip sits relative to its destination node
    bl: 'translate(calc(-100% - 10px), 14px)', tr: 'translate(10px, calc(-100% - 14px))',
    t: 'translate(-50%, calc(-100% - 22px))', b: 'translate(-50%, 22px)'
  };
  const LBL = { r: 'translate(10px, -50%)', l: 'translate(calc(-100% - 10px), -50%)' };
  const place = (el, x, y, how, op) => {
    el.style.transform = `translate(${x}px, ${y}px) ${how}`;
    el.style.opacity = op;
  };

  // gently pulsing HQ ring + travelling pulses along the flows (time-based, not scroll)
  const pulseT = { t: 0 };
  gsap.to(pulseT, { t: 1, duration: 2.2, repeat: -1, ease: 'none', onUpdate: () => { if (ready) render(); } });

  function sizeMap() {
    const r = document.querySelector('.s2-pin').getBoundingClientRect();
    W = r.width; H = r.height;
    map.attr('viewBox', `0 0 ${W} ${H}`);
    proj.scale(1).translate([0, 0]);
    proj.fitExtent([[W * 0.03, H * 0.1], [W * 0.97, H * 0.95]], { type: 'Sphere' });
    s0 = proj.scale();
  }

  function setView(v) {
    const i = Math.min(Math.floor(v), VIEWS.length - 2), f = v - i;
    const a = VIEWS[i], b = VIEWS[i + 1];
    const e = f * f * (3 - 2 * f);                       // smoothstep
    const k = Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * e);
    const c = [a.c[0] + (b.c[0] - a.c[0]) * e, a.c[1] + (b.c[1] - a.c[1]) * e];
    proj.scale(s0 * k).translate([W / 2, H / 2]);
    const p = proj(c);
    proj.translate([W - p[0], H - p[1]]);
    return k;
  }

  function render() {
    if (!ready) return;
    const k = setView(M.v);
    gSphere.attr('d', path({ type: 'Sphere' }));
    gGrat.attr('d', path(d3.geoGraticule10()));
    gLand.attr('d', path(land));
    gTH.attr('d', path(window.__s2thai));

    const A = proj(HQ.ll);
    hqDot.attr('cx', A[0]).attr('cy', A[1]).attr('opacity', M.hq);
    hqRing.attr('cx', A[0]).attr('cy', A[1]).attr('r', 6 + pulseT.t * 22).attr('opacity', M.hq * (1 - pulseT.t));
    place(hqLbl, A[0], A[1], M.v > 1.3 ? 'translate(14px, -12px)' : 'translate(-50%, calc(-100% - 14px))', M.hq);
    place(hqChip, A[0], A[1], 'translate(16px, 22px)', M.flows[3].l);   // the headline number comes last

    NODES.forEach((n, i) => {
      const B = proj(n.ll), st = M.flows[i];
      const dx = B[0] - A[0], dy = B[1] - A[1], dist = Math.hypot(dx, dy);
      // bend every arc "upward" (away from the equator) for a flight-path feel
      let nx = -dy / dist, ny = dx / dist;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const bend = dist * 0.28;
      const Cx = (A[0] + B[0]) / 2 + nx * bend, Cy = (A[1] + B[1]) / 2 + ny * bend;
      const d = `M${A[0]},${A[1]}Q${Cx},${Cy} ${B[0]},${B[1]}`;
      flowEls[i].base.attr('d', d).attr('stroke-dashoffset', 1 - st.d);
      flowEls[i].pulse.attr('d', d).attr('stroke-dashoffset', -((pulseT.t + i * 0.27) % 1)).attr('opacity', st.d >= 0.99 ? 0.9 : 0);
      nodeEls[i].attr('cx', B[0]).attr('cy', B[1]).attr('opacity', st.d > 0.97 ? 1 : 0);
      place(nodeLbls[i], B[0], B[1], LBL[n.lbl], st.d > 0.97 ? 1 : 0);
      place(chips[i], B[0], B[1], PLACE[n.chip], st.l);
    });
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
    .then(r => r.json())
    .then(topo => {
      const countries = topojson.feature(topo, topo.objects.countries);
      countries.features = countries.features.filter(f => f.id !== '010');     // drop Antarctica
      land = countries;
      window.__s2thai = countries.features.find(f => f.id === '764') || { type: 'FeatureCollection', features: [] };
      sizeMap(); ready = true; render();
    })
    .catch(err => console.warn('Scene 2 map data could not load', err));

  window.addEventListener('resize', () => { if (ready) { sizeMap(); render(); } });

  /* ---------- 3. scroll timeline ---------- */
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s2-pin', start: 'top top', end: '+=900%', scrub: 1, pin: true, anticipatePin: 1 }
  });

  // blackout
  tl.to('.s2-title', { autoAlpha: 0, y: -30, duration: 0.6 }, 0.5)
    .to([$('#win-glow'), $('#halo-el'), $('#reflection')], { opacity: 0, duration: 0.6, stagger: 0.12 }, 0.3)
    .to($('#dome-fill'), { opacity: 0.4, duration: 0.8 }, 0.3)
    .to(lines, { attr: { 'stroke-opacity': 0.2 }, duration: 0.8 }, 0.3)
    .to($('#dim'), { opacity: 0.88, duration: 0.8 }, 0.3)
    .to('.s2-blackout', { opacity: 1, duration: 0.4 }, 0.8)
    .to('.s2-blackout', { opacity: 0, duration: 0.4 }, 1.9);

  // dive into the room at the top of the Dome
  tl.to(C, { x: 1000, y: 353, lz: Math.log(32), duration: 2, ease: 'power2.inOut', onUpdate: applyCam }, 1.6)
    .to(room, { opacity: 1, duration: 0.6 }, 2.6)
    .to('.s2-morse', { opacity: 1, duration: 0.4 }, 3.4)
    .to(morse, { n: MORSE.length, duration: 1.6, onUpdate: () => { morseEl.textContent = MORSE.slice(0, Math.round(morse.n)); } }, 3.5)
    .to('.s2-morse', { opacity: 0, duration: 0.4 }, 5.3);

  // red radio pulse from the spire
  tl.to(C, { x: 1000, y: 330, lz: Math.log(2.6), duration: 1.4, ease: 'power2.inOut', onUpdate: applyCam }, 5.4)
    .to(tip, { opacity: 1, duration: 0.3 }, 6.0)
    .to('.s2-signal', { opacity: 1, duration: 0.3 }, 6.2);
  rings.querySelectorAll('circle').forEach((c, i) => {
    tl.fromTo(c, { attr: { r: 2 }, opacity: 1 }, { attr: { r: 520 }, opacity: 0, duration: 1.4, ease: 'power1.out' }, 6.2 + i * 0.3);
  });

  // switch to the bird's-eye map
  const mv = { duration: 1, onUpdate: render };
  tl.to('.s2-signal', { opacity: 0, duration: 0.3 }, 7.4)
    .to('.s2-dome', { opacity: 0, duration: 0.7 }, 7.5)
    .to(['#s2-map', '#s2-labels'], { opacity: 1, duration: 0.7 }, 7.5)
    .to(M, { hq: 1, ...mv, duration: 0.4 }, 7.8)
    .to('.s2-maptitle', { opacity: 1, duration: 0.4 }, 8.0);

  // zoom out to Asia: Kandy + southern China
  tl.to(M, { v: 1, ...mv, duration: 1.6, ease: 'power1.inOut' }, 8.4)
    .to(M.flows[0], { d: 1, ...mv, duration: 0.9 }, 9.4)
    .to(M.flows[1], { d: 1, ...mv, duration: 0.9 }, 9.7)
    .to(M.flows[0], { l: 1, ...mv, duration: 0.4 }, 10.2)
    .to(M.flows[1], { l: 1, ...mv, duration: 0.4 }, 10.5);

  // zoom out to the world: London + Washington
  tl.to(M, { v: 2, ...mv, duration: 1.8, ease: 'power1.inOut' }, 11.2)
    .to(M.flows[2], { d: 1, ...mv, duration: 1.1 }, 12.4)
    .to(M.flows[3], { d: 1, ...mv, duration: 1.3 }, 12.8)
    .to(M.flows[2], { l: 1, ...mv, duration: 0.4 }, 13.4)
    .to(M.flows[3], { l: 1, ...mv, duration: 0.4 }, 14.0)
    .to({}, { duration: 1.2 });

  /* ---------- 4. data layer ---------- */
  gsap.from('.s2-data-head > *', {
    opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power2.out',
    scrollTrigger: { trigger: '.s2-data', start: 'top 70%' }
  });
})();
