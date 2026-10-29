/* =========================================================
   SCENE 8 — Where is the green space on Rangsit campus?
   Scene 6's line fades as the OpenStreetMap green-space map rises,
   then trees grow across the campus's green areas on scroll.
   ========================================================= */
(function scene8() {
  /* ---------- DATA (sources in the data-layer note) ---------- */
  const STUDENTS = 39952;   // all TU students, 2nd term AY2566 (Wikipedia)

  /* ---------- stage: Scene 6 line fades out ---------- */
  const pin = document.querySelector('.s8-pin');
  const svg = d3.select('#s8-stage');
  let W = 0, H = 0;
  const S = { m: 0, trees: 0 };
  const ss = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  function size() {
    const r = pin.getBoundingClientRect(); W = r.width; H = r.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
  }
  function render() {}   // (old Scene 6 line removed)

  /* ---------- Phase 3b: live green-space map from OpenStreetMap ---------- */
  const map = d3.select('#s8-map');
  const statEl = document.getElementById('s8-mapstat');
  const BBOX = [14.055, 100.58, 14.092, 100.628];   // S, W, N, E around Rangsit campus
  const QUERY = `[out:json][timeout:25];
    (way["amenity"="university"]["name"~"Thammasat|ธรรมศาสตร์"](${BBOX});relation["amenity"="university"]["name"~"Thammasat|ธรรมศาสตร์"](${BBOX}););out geom;
    (way["leisure"~"park|garden|nature_reserve|pitch|golf_course"](${BBOX});
     way["landuse"~"grass|forest|meadow|recreation_ground|village_green|farmland|orchard"](${BBOX});
     way["natural"~"wood|scrub|grassland|water|wetland|tree_row"](${BBOX});
     way["water"](${BBOX});way["building"](${BBOX}););out geom;`;
  const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  const R_EARTH = 6371008.8;
  let mapData = null, mapDrawn = false, treeEls = [];

  const toPoly = coords => {               // closed OSM way → GeoJSON polygon with d3 winding
    const ring = coords.map(c => [c.lon, c.lat]);
    if (ring.length < 4) return null;
    const a = ring[0], z = ring[ring.length - 1];
    if (a[0] !== z[0] || a[1] !== z[1]) return null;
    let f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } };
    if (d3.geoArea(f) > 2 * Math.PI) f.geometry.coordinates = [ring.slice().reverse()];
    return f;
  };
  const kindOf = t => {
    if (!t) return null;
    if (t.building) return 'building';
    if (t.natural === 'water' || t.water || t.natural === 'wetland') return 'water';
    if (t.leisure || t.landuse || t.natural) return t.leisure === 'pitch' ? 'pitch' : 'green';
    return null;
  };

  // decode the bundled snapshot (js/s8-osm.js) into the same shape as an Overpass reply
  function fromSnapshot(d) {
    const pt = (x, y) => ({ lon: 100.59 + x / 1e4, lat: 14.06 + y / 1e4 });
    const ring = c => { const g = []; for (let i = 0; i < c.length; i += 2) g.push(pt(c[i], c[i + 1])); return g; };
    const TAG = { g: { leisure: 'park' }, p: { leisure: 'pitch' }, w: { natural: 'water' } };
    const els = [{ type: 'way', tags: { amenity: 'university', name: 'Thammasat' }, geometry: ring(d.tu) }];
    d.f.forEach(f => els.push({ type: 'way', tags: Object.assign({ name: f.n || '' }, TAG[f.k]), geometry: ring(f.c) }));
    d.b.forEach(([x0, y0, x1, y1]) => { if (x1 > x0 && y1 > y0) els.push({ type: 'way', tags: { building: 'yes' },
      geometry: ring([x0, y0, x1, y0, x1, y1, x0, y1, x0, y0]) }); });
    return { elements: els };
  }

  async function loadMap() {
    if (window.S8_OSM) return fromSnapshot(window.S8_OSM);
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(QUERY),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        if (!res.ok) continue;
        return await res.json();
      } catch (e) { /* try next endpoint */ }
    }
    throw new Error('overpass unavailable');
  }

  function buildMap(json) {
    const els = json.elements || [];
    let tu = null;
    const feats = { green: [], pitch: [], water: [], building: [] };
    els.forEach(e => {
      const t = e.tags || {};
      if (t.amenity === 'university') {
        const ways = e.type === 'relation' ? (e.members || []).filter(mm => mm.role !== 'inner' && mm.geometry) : [e];
        ways.forEach(w => { const f = w.geometry && toPoly(w.geometry); if (f && (!tu || d3.geoArea(f) > d3.geoArea(tu))) tu = f; });
        return;
      }
      const k = kindOf(t); if (!k || !e.geometry) return;
      const f = toPoly(e.geometry); if (!f) return;
      f.properties = { name: t.name || t['name:th'] || t['name:en'] || '', tags: t };
      feats[k].push(f);
    });
    const inside = f => !tu || d3.geoContains(tu, d3.geoCentroid(f));
    Object.keys(feats).forEach(k => { feats[k] = feats[k].filter(inside); });
    const greenM2 = d3.sum(feats.green.concat(feats.pitch), f => d3.geoArea(f)) * R_EARTH * R_EARTH;
    mapData = { tu, feats, greenM2 };
  }

  function drawMap() {
    if (!mapData) return;
    const { tu, feats, greenM2 } = mapData;
    const r = pin.getBoundingClientRect();
    map.attr('viewBox', `0 0 ${r.width} ${r.height}`).selectAll('*').remove();
    const focus = tu || { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[BBOX[1], BBOX[0]], [BBOX[3], BBOX[0]], [BBOX[3], BBOX[2]], [BBOX[1], BBOX[2]], [BBOX[1], BBOX[0]]]] } };
    const narrow = r.width < 820;
    const proj = d3.geoMercator().fitExtent(narrow ? [[12, r.height * 0.36], [r.width - 12, r.height - 12]]
      : [[r.width * 0.34, 40], [r.width - 40, r.height - 30]], focus);
    const path = d3.geoPath(proj);
    const add = (list, fill, stroke, op = 1) => map.append('g').selectAll('path').data(list).join('path')
      .attr('d', path).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 0.6).attr('opacity', op);
    add(feats.green, '#8cc47a', '#5e9a4f');
    add(feats.pitch, '#b5dba1', '#7fb46c');
    add(feats.water, '#4f8fc0', '#3c79a8');
    add(feats.building, '#d8cfbf', '#b3a894', 0.9);
    if (tu) map.append('path').datum(tu).attr('d', path).attr('fill', 'none').attr('stroke', '#a3171f').attr('stroke-width', 2).attr('stroke-dasharray', '6 5');
    // trees: scattered inside each green polygon, roughly one per 2,500 m² (capped)
    const gTrees = map.append('g');
    treeEls = [];
    let budget = 900;
    feats.green.forEach(f => {
      const m2 = d3.geoArea(f) * R_EARTH * R_EARTH;
      let n = Math.max(1, Math.min(40, Math.round(m2 / 2500)));
      const ring = f.geometry.coordinates[0].map(c => proj(c));
      const [[bx0, by0], [bx1, by1]] = path.bounds(f);
      let tries = 0;
      while (n > 0 && budget > 0 && tries < 200) {
        tries++;
        const p = [bx0 + Math.random() * (bx1 - bx0), by0 + Math.random() * (by1 - by0)];
        if (!d3.polygonContains(ring, p)) continue;
        const s = 0.7 + Math.random() * 0.6;
        const g = gTrees.append('g').attr('transform', `translate(${p[0]},${p[1]}) scale(0)`).attr('data-s', s);
        g.append('rect').attr('x', -0.8).attr('y', -1).attr('width', 1.6).attr('height', 4).attr('fill', '#6b4a2a');
        g.append('circle').attr('cy', -4).attr('r', 4).attr('fill', Math.random() < 0.5 ? '#2f7a43' : '#3c8d4f');
        treeEls.push({ g, p, s, k: Math.random() });
        n--; budget--;
      }
    });
    // label named parks (e.g. Puey 100-year learning park) if OSM names them
    feats.green.filter(f => /ป๋วย|puey/i.test(f.properties.name)).forEach(f => {
      const c = path.centroid(f);
      map.append('text').attr('x', c[0]).attr('y', c[1] - 14).attr('text-anchor', 'middle').attr('font-size', 12.5)
        .attr('font-weight', 700).attr('fill', '#1f5f33').attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).text(f.properties.name);
    });
    map.append('text').attr('x', r.width - 12).attr('y', r.height - 10).attr('text-anchor', 'end').attr('font-size', 10.5)
      .attr('fill', '#6c7a63').text('© OpenStreetMap contributors');
    const perStudent = greenM2 / STUDENTS;
    const rai = greenM2 / 1600;
    statEl.innerHTML = `พื้นที่สีเขียวที่บันทึกใน OpenStreetMap ภายในศูนย์รังสิต ≈ <b>${Math.round(rai).toLocaleString('en-US')}</b> ไร่ ` +
      `(${(greenM2 / 1e6).toFixed(2)} ตร.กม.) หรือ ≈ <b>${perStudent.toFixed(1)}</b> ตร.ม. ต่อนักศึกษา 1 คน`;
    mapDrawn = true; renderTrees();
  }
  function renderTrees() {
    treeEls.forEach(t => {
      const v = ss(S.trees * 1.5 - t.k * 0.5);
      t.g.attr('transform', `translate(${t.p[0]},${t.p[1]}) scale(${t.s * v * 1.4})`);
    });
  }
  function mapFailed() {
    statEl.innerHTML = 'โหลดแผนที่จาก OpenStreetMap ไม่ได้ (ต้องเชื่อมต่ออินเทอร์เน็ต) — อุทยานการเรียนรู้ป๋วย 100 ปี มีพื้นที่ <b>60,000</b> ตร.ม. ≈ <b>1.5</b> ตร.ม. ต่อนักศึกษา 1 คน (เฉพาะอุทยานแห่งนี้)';
  }
  // fetch once the reader gets near this scene
  ScrollTrigger.create({ trigger: '#scene-8', start: 'top 300%', once: true, onEnter: () => {
    loadMap().then(j => { buildMap(j); drawMap(); }).catch(mapFailed);
  } });

  /* ---------- layout & timeline ---------- */
  size(); render();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); render(); if (mapDrawn) drawMap(); }, 150); });

  const R = { onUpdate: render };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.s8-pin', start: 'top top', end: '+=320%', scrub: 1.2, pin: true, anticipatePin: 1 }
  });
  // the Scene 6 line fades while the map rises, then trees grow
  tl.to(S, { m: 1, duration: 0.6, ...R }, 0)
    .to('#s8-mapwrap', { opacity: 1, duration: 0.7 }, 0.1)
    .to(S, { trees: 1, duration: 2.0, onUpdate: renderTrees }, 0.6)
    .to({}, { duration: 1.4 });
})();
