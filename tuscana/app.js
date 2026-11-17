/* טוסקנה חוויות שטח: page behaviour. The 3D hero lives in hero3d.js and is loaded only if the model file exists. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const T = window.T, cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const touch = matchMedia('(hover:none)').matches, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true });
const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };

/* smooth scroll on desktop only (phones keep native scrolling) */
let lenis = null;
if (!touch && !reduce) { const { default: Lenis } = await import('https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs'); lenis = new Lenis({ lerp: .13, wheelMultiplier: 1.2 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const el = $(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView({ behavior: 'smooth' }); }));

/* ---------- static bits ---------- */
$('#waze').href = T.waze; $('#gReview').href = T.review;
$('#waQuick').href = `https://wa.me/${T.wa}?text=${encodeURIComponent('היי טוסקנה, אשמח לפרטים על טיול רייזרים 🚙')}`;
$('#hrs').innerHTML = T.hours.map(([d, h]) => `<div><span>${d}</span><span>${h}</span></div>`).join('');
$('#mq').innerHTML = [...T.see, ...T.see].map((s) => `<span>${s}</span>`).join('');
$('#fleetCards').innerHTML = T.fleet.map((f) => `<article class="fc rv"><div class="ph"><img src="img/${f.img}.webp" alt="${esc(f.n)}" loading="lazy"><span class="tag">${f.tag}</span></div><div class="in"><h3>${f.n}</h3><div class="sub">${f.sub}</div><p>${f.d}</p><div class="specs">${f.specs.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div></div></article>`).join('');
$('#rcards').innerHTML = T.routes.map((r) => `<button class="rc" data-route="${r.id}"><img src="img/${r.img}_s.webp" alt="" loading="lazy"><div><div class="tg"><span>${r.time}</span><span>${r.lvl}</span></div><h4>${r.n}</h4><p>${r.d}</p><u>להזמנת המסלול ‹</u></div></button>`).join('');
$('#deck').innerHTML = T.who.map((w) => `<article class="dk"><img src="img/${w.img}.webp" alt="" loading="lazy"><div class="t"><span class="m">${w.k}</span><h3>${w.n}</h3><p>${w.d}</p><ul>${w.pts.map((p) => `<li>${p}</li>`).join('')}</ul><button class="btn p" data-book data-who="${w.id}">מתאים לנו</button></div></article>`).join('');
$('#mosaic').innerHTML = T.gallery.map(([im, c]) => `<figure class="rv"><img src="img/${im}.webp" alt="${esc(c)}" loading="lazy"><figcaption>${c}</figcaption></figure>`).join('');
$('#faqList').innerHTML = T.faq.map(([q, a], i) => `<div class="fq"><button aria-expanded="false" aria-controls="fa${i}"><span>${q}</span><i aria-hidden="true">+</i></button><div class="a" id="fa${i}" role="region"><p>${a}</p></div></div>`).join('');
$$('.fq button').forEach((b) => b.onclick = () => { const f = b.parentElement, on = !f.classList.contains('on'); $$('.fq').forEach((x) => { x.classList.remove('on'); $('button', x).setAttribute('aria-expanded', 'false'); }); if (on) { f.classList.add('on'); b.setAttribute('aria-expanded', 'true'); } });
{ // review wall: three columns of cards, each list doubled so the loop is seamless
  const ph = ['kinneret', 'view', 'water', 'rzr', 'family', 'aerial'], cols = [[], [], []];
  T.reviews.forEach((r, i) => { cols[i % 3].push(`<div class="rvw"><div class="st">★★★★★</div><p>${esc(r[1])}</p><b>${esc(r[0])} · Google</b></div>`); if (i % 3 === 1) cols[(i + 1) % 3].push(`<div class="rvw ph"><img src="img/${ph[(i / 3 | 0) % ph.length]}_s.webp" alt="" loading="lazy"></div>`); });
  $('#wall').innerHTML = cols.map((c) => `<div class="c">${c.join('')}${c.join('')}</div>`).join('');
}

/* ---------- header + mobile bar ---------- */
const top = $('#top'), bar = $('#bar');
// header: transparent over the opening, slips away while scrolling down, comes back (with a soft shade, no hard band) when scrolling up
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { const y = s.scroll(); top.classList.toggle('away', s.direction > 0 && y > innerHeight * .5 && !$('#bk').classList.contains('on')); top.classList.toggle('solid', y > innerHeight * .6); } });
ScrollTrigger.create({ trigger: '.strip', start: 'top 80%', endTrigger: 'footer', end: 'top bottom', onToggle: (s) => bar.classList.toggle('on', s.isActive) });

/* ---------- reveals, counters, parallax ---------- */
$$('.head, .more-routes h3, .rv-top, .st-txt, .visit, .fq').forEach((el) => el.classList.add('rv'));
if (!reduce) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .07 }) });
$$('[data-count]').forEach((el) => { const to = +el.dataset.count, dec = +el.dataset.dec || 0, plain = el.dataset.plain; const o = { v: plain ? to - 12 : 0 };
  const show = () => el.textContent = dec ? o.v.toFixed(dec) : plain ? Math.round(o.v) : Math.round(o.v).toLocaleString('en');
  if (reduce) { o.v = to; return show(); } show();
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: show }) }); });
if (!reduce) {
  $$('.fc .ph img, .mosaic img, .st-img img').forEach((im) => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.to('.st-img', { clipPath: 'inset(0% 0% 0% 0% round 26px)', ease: 'none', scrollTrigger: { trigger: '#story', start: 'top 85%', end: 'top 25%', scrub: true } });
  gsap.fromTo('#outro img', { scale: 1.3 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: '#outro', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('#outro .huge', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#outro', start: 'top 70%', end: 'top 10%', scrub: true } });
}

/* ---------- the route: the trail draws itself, the car rides it, stops light up ---------- */
{
  const trail = $('#trail'), len = trail.getTotalLength(), car = $('#car'), gKm = $('#gKm'), gMin = $('#gMin'), END = .9;   // the drawn path ends back at the base
  trail.style.strokeDasharray = len; trail.style.strokeDashoffset = len;
  $('#stops').innerHTML = T.stops.map((s, i) => { const p = trail.getPointAtLength(len * s.at * END); return `<g data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><circle r="7"/><text x="${p.x > 220 ? -14 : 14}" y="4" text-anchor="${p.x > 220 ? 'start' : 'end'}">${s.t}</text></g>`; }).join('');
  $('#stopList').innerHTML = T.stops.map((s, i) => `<li data-i="${i}"><img src="img/${s.img}_s.webp" alt="" loading="lazy"><div><span class="n">0${i + 1} · ${s.km} KM</span><h4>${s.t}</h4><p>${s.d}</p></div></li>`).join('');
  const lis = $$('#stopList li'), gs = $$('#stops g');
  const set = (t) => { t = cl(t); const p = trail.getPointAtLength(len * t * END); trail.style.strokeDashoffset = len * (1 - t * END); car.setAttribute('transform', `translate(${p.x} ${p.y})`); gKm.textContent = (t * 15).toFixed(1); gMin.textContent = Math.round(t * 75);
    T.stops.forEach((s, i) => { const on = t >= s.at - .02; gs[i].classList.toggle('on', on); }); };
  set(0);
  // phones: the map is not pinned (nothing slides over the stops), so the trail draws while the map itself crosses the screen
  const small = matchMedia('(max-width:900px)').matches;
  ScrollTrigger.create(small ? { trigger: '#map', start: 'top 80%', end: 'bottom 45%', scrub: reduce ? false : .4, onUpdate: (s) => set(s.progress) } : { trigger: '#stopList', start: 'top 72%', end: 'bottom 62%', scrub: reduce ? false : .4, onUpdate: (s) => set(s.progress) });
  lis.forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 80%', end: 'bottom 30%', onToggle: (s) => li.classList.toggle('on', s.isActive) }));
}

/* ---------- "who" deck: the centre card is full size, the neighbours recede in depth ---------- */
{
  const deck = $('#deck'), cards = $$('.dk', deck); let tk = false;
  const lay = () => { tk = false; const c = deck.scrollLeft + deck.clientWidth / 2; cards.forEach((f) => { const w = f.offsetWidth, k = (f.offsetLeft + w / 2 - c) / w, a = Math.min(Math.abs(k), 2); f.style.transform = `perspective(1200px) rotateY(${cl(-k * 22, -28, 28).toFixed(1)}deg) scale(${(1 - Math.min(a, 1.4) * .11).toFixed(3)})`; f.style.opacity = (1 - Math.min(a, 2) * .26).toFixed(2); f.style.zIndex = String(10 - Math.round(a * 3)); }); };
  deck.addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(lay); } }, { passive: true }); addEventListener('resize', lay);
  deck.scrollLeft = 0; lay(); setTimeout(lay, 500);
  deck.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); deck.scrollBy({ left: (e.key === 'ArrowLeft' ? -1 : 1) * cards[0].offsetWidth, behavior: 'smooth' }); } });
}

/* ---------- hero: one seamless, stabilised loop that starts by itself (autoplay in the HTML) ---------- */
const hero = $('#hero'), ride = $('#ride'), hp = { v: 0 };
// the heavy frame sequences further down wait until the opening clip is playing (or the visitor scrolls)
let heroReady; const heroGo = new Promise((r) => heroReady = r);
{
  const V = $('#mudV'), poster = $('#mudPoster');
  const ok = () => { poster.style.opacity = 0; heroReady(); };
  if (reduce) { V.pause(); heroReady(); }
  else {
    if (V.readyState >= 3 && !V.paused) ok(); else V.addEventListener('playing', ok, { once: true });
    V.play().catch(() => {});
    // iOS low-power mode blocks autoplay: start on the first touch
    addEventListener('touchstart', () => V.paused && V.play().catch(() => {}), { once: true, passive: true });
    addEventListener('scroll', () => setTimeout(heroReady, 200), { once: true, passive: true });
    setTimeout(heroReady, 3500);
    new IntersectionObserver(([e]) => { if (e.isIntersecting) V.play().catch(() => {}); else V.pause(); }).observe(hero);
  }
  const tc = $('#tc'), mudEl = $('.mud'), hc1 = $('#hc1'), cue = $('.scrollcue');
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (st) => { mudEl.style.transform = `translate3d(0,${(st.progress * 22).toFixed(2)}%,0)`; hc1.style.opacity = 1 - cl(st.progress / .5); cue.style.opacity = 1 - cl(st.progress / .1); } });
  // the browser bar takes the colour of the sky over the opening, and the page colour after it
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom 12%', onToggle: (st) => { tc.content = st.isActive ? (innerWidth / innerHeight >= 1 ? '#514241' : '#3e2c25') : '#0d0a07'; } });
}
/* ---------- the dark breath: a thin ember line draws down, then the copy rises word by word ---------- */
{
  const g = $('#gap'), line = $('.g-line', g);
  line.innerHTML = line.innerHTML.split(/(<br>|<em>|<\/em>)/).map((t) => /^</.test(t) ? t : t.split(' ').filter(Boolean).map((w) => `<span>${w}</span>`).join(' ')).join('');
  const words = $$('span', line);
  ScrollTrigger.create({ trigger: g, start: 'top 85%', end: 'bottom 35%', scrub: true, onUpdate: (st) => { const p = st.progress;
    g.style.setProperty('--gr', cl(p / .3).toFixed(3)); g.style.setProperty('--ga', cl((p - .15) / .15).toFixed(3));
    words.forEach((w, i) => { const a = cl((p - .25 - i * .07) / .16); w.style.opacity = a.toFixed(3); w.style.transform = `translateY(${((1 - a) * .5).toFixed(3)}em)`; }); } });
}
/* ---------- the machine at golden hour: copy changes with the scroll ---------- */
{
  const c2 = $('#hc2'), c3 = $('#hc3'), img = $('#heroImg'), hudB = $('#hudB'), hudA = $('#hudA');
  const show = (el, a) => { el.style.opacity = a; el.style.visibility = a > .01 ? 'visible' : 'hidden'; el.style.transform = `translateY(${(1 - a) * 30}px)`; };
  const win = (p, a, b, c, d) => cl((p - a) / (b - a)) * (1 - cl((p - c) / (d - c)));
  // the photoreal clip (the camera circles the RZR, the lights come on), cut to frames and scrubbed by the scroll
  const cvs = $('#heroCv'), ctx = cvs.getContext('2d'), N = 81, dir = `f/orbit/${touch || innerWidth < 820 ? 'm' : 'd'}/`, frames = []; let want = 0, shown = -1, started = false;
  const draw = () => { let i = Math.round(cl(want / .92) * (N - 1)); while (i > 0 && !(frames[i] && frames[i].complete && frames[i].naturalWidth)) i--; const f = frames[i]; if (!f || !f.complete || !f.naturalWidth || i === shown) return; if (cvs.width !== f.naturalWidth) cvs.width = cvs.height = f.naturalWidth; ctx.drawImage(f, 0, 0); shown = i; };
  const load = (i) => new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (i === 0 && im.naturalWidth) { draw(); ride.classList.add('seq'); } res(); }; im.src = dir + String(i).padStart(3, '0') + '.webp'; frames[i] = im; });
  const start = async () => { if (started || reduce) return; started = true; await load(0); const order = [], seen = new Set([0]); for (let st = 8; st >= 1; st >>= 1) for (let i = 0; i < N; i += st) if (!seen.has(i)) { seen.add(i); order.push(i); } for (let k = 0; k < order.length; k += 4) { await Promise.all(order.slice(k, k + 4).map(load)); draw(); } };
  heroGo.then(() => setTimeout(start, 250));
  // rises out of the dark as it scrolls in (it is never laid over the opening)
  const rs = ride.querySelector('.stick');
  // its top edge stays soft while it scrolls in, and the softness is gone a moment after it settles
  const mask = (f) => { rs.style.webkitMaskImage = rs.style.maskImage = f > .2 ? `linear-gradient(rgba(0,0,0,0),#000 ${f.toFixed(1)}%)` : 'none'; };
  ScrollTrigger.create({ trigger: ride, start: 'top bottom', end: 'top -35%', scrub: true, onUpdate: (st) => { const y = st.progress * 1.35, q = cl(y), e = q * q * (3 - 2 * q); rs.style.opacity = (.3 + .7 * e).toFixed(3); mask(26 * (1 - cl((y - 1) / .35))); }, onLeave: () => { rs.style.opacity = 1; mask(0); }, onEnterBack: () => {} });
  ScrollTrigger.create({ trigger: ride, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => { const p = hp.v = s.progress;
    show(c2, win(p, .04, .14, .44, .54)); show(c3, win(p, .6, .7, .92, .99));
    hudB.textContent = String(Math.round(p * 360)).padStart(3, '0') + '°'; hudA.textContent = p < .5 ? 'POLARIS RZR · 4 SEATS' : 'LIGHTS ON · GOLDEN HOUR';
    if (!ride.classList.contains('gl')) { want = p; draw(); } } });
}
if (!touch) {
  // dust: soft particles drifting toward the viewer (desktop only: on phones it costs battery and smoothness)
  const cv = $('#dust'), cx = cv.getContext('2d'); let W, H, D = Math.min(devicePixelRatio, 2), P = [], vis = true, last = 0;
  const size = () => { W = cv.width = cv.clientWidth * D; H = cv.height = cv.clientHeight * D; };
  const spawn = (o = {}) => Object.assign(o, { x: Math.random() * W, y: H * (.55 + Math.random() * .5), z: Math.random(), r: (8 + Math.random() * 46) * D, a: .05 + Math.random() * .16, vx: (-.25 + Math.random() * .5) * D, vy: -(.12 + Math.random() * .4) * D, hot: Math.random() < .16 });
  size(); addEventListener('resize', size); P = Array.from({ length: touch ? 46 : 80 }, () => spawn());
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(hero);
  let lastY = scrollY, sv = 0;
  function tick(t) { requestAnimationFrame(tick); if (!vis || reduce) return; const dt = Math.min(40, t - last) / 16.7; last = t; sv = lerp(sv, Math.abs(scrollY - lastY), .12); lastY = scrollY; const boost = 1 + Math.min(sv, 60) * .09;
    cx.clearRect(0, 0, W, H);
    for (const p of P) { p.x += p.vx * dt * boost * (1 + p.z); p.y += p.vy * dt * boost * (1 + p.z * 2); p.r += .05 * dt * boost * D; if (p.y < H * .12 || p.x < -p.r || p.x > W + p.r) spawn(p);
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); const col = p.hot ? '255,160,70' : '222,196,160'; g.addColorStop(0, `rgba(${col},${p.a})`); g.addColorStop(1, `rgba(${col},0)`); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fill(); } }
  requestAnimationFrame(tick);
}
// real-time 3D model: kept as an option (?3d). The default hero is the photoreal picture, because the model read as a toy.
if (new URLSearchParams(location.search).has('3d')) fetch('models/rzr/scene.gltf', { method: 'HEAD' }).then((r) => { if (r.ok) import('./hero3d.js').then((m) => m.start({ hero: ride, canvas: $('#gl'), progress: () => hp.v, touch, reduce })).catch((e) => console.warn('3D hero off', e)); }).catch(() => {});

/* ---------- x-ray: the Ranger comes apart and back together as you scroll ---------- */
{
  const sec = $('#xray'), cv = $('#xCv'), cx = cv.getContext('2d'), tags = $('.x-tags'), pct = $('#xPct'), N = 91, dir = `f/explode/${touch || innerWidth < 820 ? 'm' : 'd'}/`, fr = [];
  let want = 0, shown = -1, started = false;
  const draw = () => { let i = Math.round(cl(want) * (N - 1)); while (i > 0 && !(fr[i] && fr[i].complete && fr[i].naturalWidth)) i--; const f = fr[i]; if (!f || !f.complete || !f.naturalWidth || i === shown) return; if (cv.width !== f.naturalWidth) cv.width = cv.height = f.naturalWidth; cx.drawImage(f, 0, 0); shown = i; };
  const load = (i) => new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (i === 0 && im.naturalWidth) { draw(); sec.classList.add('seq'); } res(); }; im.src = dir + String(i).padStart(3, '0') + '.webp'; fr[i] = im; });
  const start = async () => { if (started || reduce) return; started = true; await load(0); const order = [], seen = new Set([0]); for (let st = 8; st >= 1; st >>= 1) for (let i = 0; i < N; i += st) if (!seen.has(i)) { seen.add(i); order.push(i); } for (let k = 0; k < order.length; k += 4) { await Promise.all(order.slice(k, k + 4).map(load)); draw(); } };
  heroGo.then(() => ScrollTrigger.create({ trigger: sec, start: 'top 250%', onEnter: () => setTimeout(start, 400) }));
  // the clip is drawn 'cover' (centred), so the labels are placed on the same square the picture is drawn into, and kept on screen
  // the labels sit on the same square the picture is drawn into ('cover' inside its box: full frame on phones, the left part of wide screens)
  const place = () => { const st = sec.querySelector('.stick').getBoundingClientRect(), b = sec.querySelector('.stage .box').getBoundingClientRect(), W = st.width, H = st.height;
    const S = Math.max(b.width, b.height), ox = b.left - st.left + (b.width - S) / 2, oy = b.top - st.top + (b.height - S) / 2, x0 = Math.max(0, b.left - st.left), x1 = Math.min(W, b.right - st.left);
    tags.style.inset = '0'; tags.style.width = W + 'px'; tags.style.height = H + 'px';
    $$('li', tags).forEach((li) => { const x = ox + S * li.dataset.x / 100, y = oy + S * li.dataset.y / 100; li.style.setProperty('--sx', cl(x, x0 + 70, x1 - 70) + 'px'); li.style.setProperty('--sy', cl(y, H * .3, H - 70) + 'px'); }); };
  place(); addEventListener('resize', place);
  const stage = sec.querySelector('.stage'), xc = sec.querySelector('.x-copy');
  // same entrance as the golden-hour clip: it rises out of the dark with a soft top edge, then sits clean and full
  const xs = sec.querySelector('.stick'), xmask = (f) => { xs.style.webkitMaskImage = xs.style.maskImage = f > .2 ? `linear-gradient(rgba(0,0,0,0),#000 ${f.toFixed(1)}%)` : 'none'; };
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'top -35%', scrub: true, onUpdate: (st) => { const y = st.progress * 1.35, q = cl(y), e = q * q * (3 - 2 * q); xs.style.opacity = (.3 + .7 * e).toFixed(3); xmask(26 * (1 - cl((y - 1) / .35))); }, onLeave: () => { xs.style.opacity = 1; xmask(0); } });
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (st) => { want = st.progress; draw(); const open = Math.sin(Math.PI * cl((want - .08) / .84)); tags.classList.toggle('on', want > .3 && want < .72); pct.textContent = Math.round(100 - open * 100) + '%'; } });
}

/* ---------- booking wizard -> WhatsApp ---------- */
{
  const bk = $('#bk'), B = $('#bkB'), F = $('#bkF'), P = $('#bkP'), DAYN = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const st = { step: 0, who: null, n: 2, route: 'poriya', date: null, when: null, extras: [], name: '', note: '' }; let lastFocus = null;
  const people = (n) => n === 1 ? 'נוסע אחד' : n + ' נוסעים';
  // the smallest set of vehicles that seats everyone: 6-seaters first, then 4-seaters
  const vehicles = (n) => { let six = 0, four = 0, left = n; while (left > 4) { six++; left -= 6; } if (left > 0) four++; if (n <= 4) { six = 0; four = 1; } return { six, four, txt: [six && (six === 1 ? 'כלי אחד של 6 מקומות' : six + ' כלים של 6 מקומות'), four && (four === 1 ? 'רייזר אחד של 4 מקומות' : four + ' רייזרים של 4 מקומות')].filter(Boolean).join(' + ') }; };
  const dayList = () => Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
  const fmt = (d) => `יום ${DAYN[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}`;
  const midweek = (d) => d.getDay() <= 3;
  const STEPS = [
    { t: 'עם מי יוצאים לשטח?', s: 'נתאים לכם את המסלול ואת הכלים.', ok: () => st.who,
      html: () => `<div class="opts two">${T.book.who.map(([id, n, e]) => `<button class="op${st.who === id ? ' on' : ''}" data-v="${id}"><span class="e">${e}</span><span>${n}</span></button>`).join('')}</div>`,
      bind: () => $$('.op', B).forEach((b) => b.onclick = () => { st.who = b.dataset.v; if (st.who === 'couple') st.n = 2; else if (st.n < 3) st.n = st.who === 'team' ? 12 : 4; next(); }) },
    { t: 'כמה אתם?', s: 'כולל ילדים. מגיל 5, ופעוטות עם בוסטר.', ok: () => st.n > 0,
      html: () => `<div class="stepper"><button id="nM" aria-label="פחות">−</button><b id="nV" aria-live="polite">${st.n}</b><button id="nP" aria-label="יותר">+</button></div><div class="hint" id="nH"></div>`,
      bind: () => { const up = () => { $('#nV').textContent = st.n; $('#nH').innerHTML = `ל‑${people(st.n)} מתאים: <b>${vehicles(st.n).txt}</b>.${st.n >= 12 ? ' לקבוצות יש גם פריסת שטח וחבילות אירוח.' : ''}`; }; $('#nM').onclick = () => { st.n = Math.max(1, st.n - 1); up(); }; $('#nP').onclick = () => { st.n = Math.min(60, st.n + 1); up(); }; up(); } },
    { t: 'איזה מסלול?', s: 'לא בטוחים? בחרו את הראשון, ונתאים בטלפון.', ok: () => st.route,
      html: () => `<div class="opts">${T.routes.map((r) => `<button class="op${st.route === r.id ? ' on' : ''}" data-v="${r.id}"><img src="img/${r.img}_s.webp" alt=""><span>${r.n}<small>${r.time} · ${r.lvl}</small></span><span class="ck">✓</span></button>`).join('')}</div>`,
      bind: () => $$('.op', B).forEach((b) => b.onclick = () => { st.route = b.dataset.v; $$('.op', B).forEach((x) => x.classList.toggle('on', x === b)); foot(); }) },
    { t: 'מתי?', s: 'בוחרים יום וחלק ביום. את השעה המדויקת נסגור בוואטסאפ.', ok: () => st.date && st.when,
      html: () => `<div class="days">${dayList().map((d) => `<button class="dy${st.date && st.date.toDateString() === d.toDateString() ? ' on' : ''}" data-d="${d.toISOString()}">${DAYN[d.getDay()]}<b>${d.getDate()}.${d.getMonth() + 1}</b>${midweek(d) ? '<small>‎−10%</small>' : ''}</button>`).join('')}</div><div class="opts">${T.book.when.map(([id, n, h]) => `<button class="op${st.when === id ? ' on' : ''}" data-v="${id}"><span>${n}<small>${h}</small></span><span class="ck">✓</span></button>`).join('')}</div>`,
      bind: () => { $$('.dy', B).forEach((b) => b.onclick = () => { st.date = new Date(b.dataset.d); $$('.dy', B).forEach((x) => x.classList.toggle('on', x === b)); foot(); }); $$('.op', B).forEach((b) => b.onclick = () => { st.when = b.dataset.v; $$('.op', B).forEach((x) => x.classList.toggle('on', x === b)); foot(); }); } },
    { t: 'רוצים להוסיף משהו?', s: 'לא חובה. אפשר לבחור כמה.', ok: () => true,
      html: () => `<div class="opts">${T.book.extras.map(([id, n]) => `<button class="op${st.extras.includes(id) ? ' on' : ''}" data-v="${id}" aria-pressed="${st.extras.includes(id)}"><span>${n}</span><span class="ck">✓</span></button>`).join('')}</div>`,
      bind: () => $$('.op', B).forEach((b) => b.onclick = () => { const v = b.dataset.v, i = st.extras.indexOf(v); i < 0 ? st.extras.push(v) : st.extras.splice(i, 1); b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', i < 0); }) },
    { t: 'כמעט שם.', s: 'בודקים שהכול נכון, ושולחים לנו בוואטסאפ.', ok: () => st.name.trim().length > 1, last: true,
      html: () => { const r = T.routes.find((x) => x.id === st.route), w = T.book.who.find((x) => x[0] === st.who), wn = T.book.when.find((x) => x[0] === st.when); return `<div class="sum"><div><span>מי</span><b>${w[1]} · ${people(st.n)}</b></div><div><span>כלים</span><b>${vehicles(st.n).txt}</b></div><div><span>מסלול</span><b>${r.n}</b></div><div><span>מתי</span><b>${fmt(st.date)} · ${wn[1]}${midweek(st.date) ? ' · 10% הנחה' : ''}</b></div>${st.extras.length ? `<div><span>תוספות</span><b>${st.extras.map((e) => T.book.extras.find((x) => x[0] === e)[1].split(':')[0]).join(', ')}</b></div>` : ''}</div><input class="f" id="bName" placeholder="השם שלכם" autocomplete="name" aria-label="השם שלכם" value="${esc(st.name)}"><textarea class="f" id="bNote" placeholder="משהו שחשוב שנדע? (לא חובה)" aria-label="הערה">${esc(st.note)}</textarea><p class="s" style="margin-top:12px;text-align:center">נפתח הוואטסאפ שלכם עם ההודעה מוכנה. אנחנו חוזרים עם שעה ומחיר.</p>`; },
      bind: () => { $('#bName').oninput = (e) => { st.name = e.target.value; foot(); }; $('#bNote').oninput = (e) => st.note = e.target.value; } },
  ];
  function message() { const r = T.routes.find((x) => x.id === st.route), w = T.book.who.find((x) => x[0] === st.who), wn = T.book.when.find((x) => x[0] === st.when);
    return [`היי טוסקנה, רוצים לצאת לטיול רייזרים 🚙`, ``, `*מי:* ${w[1]}, ${people(st.n)}`, `*כלים:* ${vehicles(st.n).txt}`, `*מסלול:* ${r.n} (${r.time})`, `*מתי:* ${fmt(st.date)}, ${wn[1]}`, st.extras.length ? `*תוספות:* ${st.extras.map((e) => T.book.extras.find((x) => x[0] === e)[1]).join(', ')}` : null, st.note.trim() ? `*הערה:* ${st.note.trim()}` : null, ``, `*שם:* ${st.name.trim()}`, `נשלח מהאתר`].filter((x) => x !== null).join('\n'); }
  function foot() { const S = STEPS[st.step]; F.innerHTML = `${st.step ? '<button class="btn back" id="bkBack">חזרה</button>' : ''}<button class="btn ${S.last ? 'wa' : 'p'}" id="bkNext" ${S.ok() ? '' : 'disabled'}>${S.last ? 'שליחה בוואטסאפ' : 'המשך'}</button>`;
    if (st.step) $('#bkBack').onclick = () => { st.step--; draw(); };
    $('#bkNext').onclick = () => { if (!S.last) return next(); window.open(`https://wa.me/${T.wa}?text=${encodeURIComponent(message())}`, '_blank', 'noopener'); close(); toast('ההודעה מוכנה בוואטסאפ, נשאר רק לשלוח'); }; }
  function draw() { const S = STEPS[st.step]; P.style.width = ((st.step + 1) / STEPS.length * 100) + '%'; B.innerHTML = `<span class="m k">// ${String(st.step + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}</span><h3 id="bkT">${S.t}</h3><p class="sub">${S.s}</p>${S.html()}`; B.scrollTop = 0; S.bind(); foot(); }
  const next = () => { if (st.step < STEPS.length - 1) { st.step++; draw(); } };
  function open(pre = {}) { lastFocus = document.activeElement; Object.assign(st, pre); st.step = pre.who ? 1 : 0; if (pre.route && !st.who) st.step = 0; draw(); bk.classList.add('on'); if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden'; $('#bkX').focus({ preventScroll: true }); }
  function close() { bk.classList.remove('on'); if (lenis) lenis.start(); document.documentElement.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-book],[data-route]'); if (!b) return; const pre = {}; if (b.dataset.who) { pre.who = ['couple', 'family', 'friends', 'team', 'birthday', 'event'].includes(b.dataset.who) ? b.dataset.who : b.dataset.who === 'holiday' ? 'family' : 'friends'; if (b.dataset.who === 'stay') pre.extras = ['suite']; if (pre.who === 'couple') pre.n = 2; else if (st.n < 3) pre.n = pre.who === 'team' ? 12 : 4; } if (b.dataset.route) pre.route = b.dataset.route; open(pre); });
  $('#bkX').onclick = close; bk.addEventListener('click', (e) => { if (e.target === bk) close(); }); addEventListener('keydown', (e) => { if (e.key === 'Escape' && bk.classList.contains('on')) close(); });
  if (new URLSearchParams(location.search).has('book')) setTimeout(() => open(), 500);
}
addEventListener('load', () => ScrollTrigger.refresh());
