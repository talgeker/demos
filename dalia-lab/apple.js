/* ===== Apple-design layer (dalia-lab experiment) =====
   Springs with Apple's two parameters (damping ratio + response), velocity hand-off,
   momentum projection, rubber-banding, interruptible animations from the live value. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rtl = document.documentElement.dir === 'rtl';
const buzz = ms => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms) } catch (e) {} };
const cap = (el, id) => { try { el.setPointerCapture(id) } catch (e) {} };
document.addEventListener('touchstart', () => {}, { passive: true }); // enables :active instantly on iOS

/* ---------- spring (damping ratio + response, mass 1) ---------- */
class Spring {
  constructor(x = 0, damping = 1, response = .4) { this.x = x; this.v = 0; this.t = x; this.cfg(damping, response) }
  cfg(d, r) { this.k = (2 * Math.PI / r) ** 2; this.c = 4 * Math.PI * d / r; return this }
  step(dt) { // fixed sub-steps for stability
    for (let n = Math.ceil(dt / (1 / 240)), h = dt / n; n--;) { const a = -this.k * (this.x - this.t) - this.c * this.v; this.v += a * h; this.x += this.v * h }
  }
  get rest() { return Math.abs(this.x - this.t) < 1e-3 && Math.abs(this.v) < 1e-3 }
}
const project = (v /* px/s */, d = .998) => (v / 1000) * d / (1 - d);          // Apple's momentum projection
const rubber = (o, dim, c = .55) => (o * dim * c) / (dim + c * Math.abs(o));  // soft boundary
const velOf = h => { // velocity from the last ~100ms of pointer history
  const now = h[h.length - 1]; let i = h.length - 1; while (i > 0 && now.t - h[i - 1].t < 100) i--;
  const a = h[i], dt = (now.t - a.t) / 1000; return dt > 0 ? { x: (now.x - a.x) / dt, y: (now.y - a.y) / dt } : { x: 0, y: 0 } };
const S1 = getComputedStyle(document.documentElement).getPropertyValue('--s1').trim();
const EASE = CSS.supports('transition-timing-function', S1) ? S1 : 'cubic-bezier(.2,.8,.2,1)';

/* ---------- 1 · reviews: grab, throw with momentum, cruise again ---------- */
const tr = $('#revs');
if (tr) {
  let half = 0, off = 0, v = 0, drag = null, hover = false, last = performance.now();
  const cruise = () => RM ? 0 : (hover ? 0 : half / 70) * (rtl ? 1 : 1);
  const measure = () => { half = tr.scrollWidth / 2 }; measure(); addEventListener('resize', measure);
  const mod = (a, n) => ((a % n) + n) % n;
  const render = () => { if (!half) return; const x = rtl ? mod(off, half) : mod(off, half) - half; tr.style.transform = `translate3d(${x}px,0,0)` };
  tr.parentElement.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true });
  tr.parentElement.addEventListener('pointerleave', () => hover = false);
  tr.addEventListener('pointerdown', e => {
    drag = { x0: e.clientX, y0: e.clientY, o0: off, h: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }], on: false, id: e.pointerId };
  });
  tr.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) { // ~10px hysteresis before committing to a horizontal drag
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return }
      if (Math.abs(dx) < 10) return;
      drag.on = true; drag.x0 = e.clientX; drag.o0 = off; cap(tr, e.pointerId); tr.classList.add('drag');
    }
    off = drag.o0 + (e.clientX - drag.x0); v = 0;             // 1:1, respects the grab offset
    drag.h.push({ x: e.clientX, y: e.clientY, t: e.timeStamp }); if (drag.h.length > 12) drag.h.shift();
  });
  const end = () => { if (!drag) return; if (drag.on) { v = velOf(drag.h).x; buzz(6) } drag = null; tr.classList.remove('drag') };
  tr.addEventListener('pointerup', end); tr.addEventListener('pointercancel', end);
  (function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!drag) { // momentum decays exponentially (scroll-like) back to cruising speed
      const target = cruise(); v = target + (v - target) * Math.pow(.998, dt * 1000) ** 2.2; off += v * dt }
    render(); requestAnimationFrame(loop);
  })(last);
}

/* ---------- 2 · menu filter: FLIP from the live (presentation) position ---------- */
const filters = $('#filters');
if (filters) filters.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; buzz(5);
  const before = new Map();
  $$('.dish').forEach(d => { if (!d.classList.contains('hide')) before.set(d, d.getBoundingClientRect()) }); // live rects, mid-flight included
  setTimeout(() => {
    $$('.dish').forEach(d => {
      d.getAnimations().forEach(a => a.cancel());
      if (d.classList.contains('hide')) return;
      const a = d.getBoundingClientRect(), p = before.get(d);
      if (RM) { d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); return }
      if (!p) { d.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: EASE }); return }
      const dx = p.left - a.left, dy = p.top - a.top, sx = p.width / a.width, sy = p.height / a.height;
      if (Math.abs(dx) + Math.abs(dy) < 1 && Math.abs(sx - 1) < .01) return;
      d.style.transformOrigin = '0 0';
      d.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` }, { transform: 'none' }], { duration: 750, easing: EASE });
    });
  }, 0);
}, true);

/* ---------- 3 · dish sheet: grows out of the card it came from, drag down to dismiss ---------- */
const L = { he: ['סגירה'], ar: ['إغلاق'], en: ['Close'] }[document.documentElement.lang] || ['Close'];
const scrim = document.createElement('div'); scrim.className = 'sh-scrim';
const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
const book = $('.hd .js-book') || $('.js-book');
sh.innerHTML = `<i class="grab"></i><button class="x" aria-label="${L[0]}"><svg viewBox="0 0 24 24" fill="none" stroke="#f6e2a8" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img class="im" alt=""><div class="tx"><h3></h3><p></p>${book ? `<a class="btn gd" target="_blank" rel="noopener"></a>` : ''}</div>`;
document.body.append(scrim, sh);
const im = $('.im', sh), h3 = $('h3', sh), pp = $('p', sh), cta = $('.btn', sh);
const P = new Spring(0, 1, .45), Y = new Spring(0, 1, .4);
let src = null, open = false, run = false, fromT = null, sdrag = null;
const mobile = () => innerWidth <= 600;
function place() { // final resting rect
  if (mobile()) { sh.style.left = ''; sh.style.top = ''; return }
  const w = sh.offsetWidth, h = sh.offsetHeight; sh.style.left = (innerWidth - w) / 2 + 'px'; sh.style.top = Math.max(20, (innerHeight - h) / 2) + 'px' }
function from() { // transform that maps the sheet onto the source card image
  const r = { left: sh.offsetLeft, top: sh.offsetTop, width: sh.offsetWidth }, s = (src.querySelector('.ph') || src).getBoundingClientRect(); // untransformed resting rect
  const sc = s.width / r.width; return { x: s.left - r.left, y: s.top - r.top, s: sc } }
function render() {
  const p = P.x, f = fromT, dy = Y.x, h = sh.offsetHeight;
  const x = f.x * (1 - p), y = f.y * (1 - p) + dy, s = f.s + (1 - f.s) * p;
  sh.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
  sh.style.borderRadius = (22 + 8 * p) / s + 'px';
  const k = Math.max(0, Math.min(1, p)) * (1 - Math.min(1, Math.max(0, dy) / h) * .7);
  scrim.style.opacity = k; $('.tx', sh).style.opacity = Math.max(0, Math.min(1, (p - .35) / .65)); $('.x', sh).style.opacity = $('.grab', sh).style.opacity = Math.max(0, p);
}
let lastT = 0;
function loop(t) {
  const dt = Math.min(.05, (t - lastT) / 1000 || .016); lastT = t;
  if (!sdrag) { P.step(dt); Y.step(dt) }
  render();
  if (!open && P.rest && P.x < .01) { sh.classList.remove('on'); scrim.classList.remove('on'); src && (src.style.visibility = ''); run = false; return }
  if (open && P.rest && Y.rest && !sdrag) { run = false; return }
  requestAnimationFrame(loop);
}
const kick = () => { if (!run) { run = true; lastT = performance.now(); requestAnimationFrame(loop) } };
function show(dish) {
  src = dish; const ph = dish.querySelector('img');
  im.src = ph.currentSrc || ph.src; h3.textContent = $('h3', dish).textContent; pp.textContent = $('p', dish).textContent;
  if (cta) { cta.textContent = book.textContent.trim(); cta.href = book.href }
  sh.style.transform = 'none'; sh.classList.add('on'); scrim.classList.add('on'); place(); fromT = from();
  if (RM) fromT = { x: 0, y: 24, s: .96 };
  dish.style.visibility = 'hidden'; open = true;
  P.cfg(1, RM ? .2 : .45); P.t = 1; Y.t = 0; buzz(8); kick(); $('.x', sh).focus({ preventScroll: true });
}
function hide(v = 0) { // v: release velocity (px/s) handed to the spring
  if (!open) return; open = false; fromT = from(); P.cfg(1, RM ? .2 : .42); P.t = 0;
  const h = sh.offsetHeight; P.v = -Math.max(0, v) / Math.max(h, 1) * .6; Y.t = 0; kick() }
document.addEventListener('click', e => {
  const d = e.target.closest('.dish'); if (!d || d.closest('.sheet')) return; e.preventDefault(); show(d) });
scrim.addEventListener('click', () => hide());
$('.x', sh).addEventListener('click', () => hide());
addEventListener('keydown', e => { if (e.key === 'Escape') hide() });
['wheel', 'touchmove'].forEach(ev => [scrim, sh].forEach(el => el.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation() }, { passive: false })));
sh.addEventListener('pointerdown', e => {
  if (!open || e.target.closest('a,button')) return;
  sdrag = { y0: e.clientY, d0: Y.x, h: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }] }; cap(sh, e.pointerId); Y.v = 0; kick() });
sh.addEventListener('pointermove', e => {
  if (!sdrag) return; const raw = sdrag.d0 + e.clientY - sdrag.y0;
  Y.x = raw >= 0 ? raw : rubber(raw, sh.offsetHeight);                    // pull up = resistance, never a hard stop
  sdrag.h.push({ x: e.clientX, y: e.clientY, t: e.timeStamp }); if (sdrag.h.length > 12) sdrag.h.shift() });
const release = () => {
  if (!sdrag) return; const v = velOf(sdrag.h).y; sdrag = null;
  const end = Y.x + project(v); // where the flick is going, not where it was let go
  if (end > sh.offsetHeight * .3) { buzz(8); hide(v) } else { Y.v = v; Y.t = 0; Y.cfg(.8, .35); kick(); setTimeout(() => Y.cfg(1, .4), 600) } };
sh.addEventListener('pointerup', release); sh.addEventListener('pointercancel', release);
addEventListener('resize', () => { if (open) { place(); fromT = from(); render() } });
})();
