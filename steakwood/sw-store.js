/* STEAKWOOD reservations: shared data layer for the customer site and the admin app.
   DEMO adapter: everything lives in this browser's localStorage and is broadcast between tabs, so a booking made on the
   site shows up in the admin tab at once. The live system keeps the same API and swaps this file for calls to the
   Cloudflare Worker + D1 database (see ../README-system.md). */
(function () {
  const K = 'sw1.', ch = 'BroadcastChannel' in window ? new BroadcastChannel('steakwood') : null, subs = [];
  const get = (k, d) => { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(K + k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const emit = (ev) => { subs.forEach((f) => f(ev)); if (ch) ch.postMessage(ev); };
  if (ch) ch.onmessage = (e) => subs.forEach((f) => f(e.data));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return ymd(d); };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }, toT = (m) => `${pad(m / 60 | 0)}:${pad(m % 60)}`;
  const DAYN = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const DEF = {
    cap: 24,            // covers that can arrive in one half-hour slot
    maxParty: 10,       // bigger parties are asked to call
    lead: 60,           // minutes: no online booking closer than this
    days: 30,           // how far ahead the site takes bookings
    hours: Array.from({ length: 7 }, () => ({ open: true, from: '12:00', last: '20:00' })),   // per weekday; "last" = last seating
    blocks: [],         // {date, from?, to?, why}  no from/to = the whole day
    notify: { neu: true, cancel: true, change: true },
  };
  const settings = () => Object.assign({}, DEF, get('settings', {}));
  const saveSettings = (s, who) => { set('settings', s); log(who, 'עדכון הגדרות'); emit({ type: 'settings' }); };

  /* ---------- bookings ---------- */
  const all = () => get('bookings', []);
  const live = (b) => b.status !== 'cancelled' && b.status !== 'noshow';
  const code = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.random() * A.length | 0]; return s; };
  const taken = (date, time, skip) => all().filter((b) => b.date === date && b.time === time && live(b) && b.code !== skip).reduce((a, b) => a + b.n, 0);
  function slots(date, n, skip) {      // -> [{t, left, ok, why}]
    const s = settings(), d = new Date(date + 'T00:00'), h = s.hours[d.getDay()], out = [];
    if (!h.open) return out;
    const now = new Date(), isToday = ymd(now) === date, cut = now.getHours() * 60 + now.getMinutes() + s.lead;
    for (let m = toMin(h.from); m <= toMin(h.last); m += 30) {
      const t = toT(m), blk = s.blocks.find((b) => b.date === date && (!b.from || (m >= toMin(b.from) && m <= toMin(b.to))));
      const left = s.cap - taken(date, t, skip);
      out.push({ t, left, ok: !blk && !(isToday && m < cut) && left >= n, why: blk ? 'closed' : isToday && m < cut ? 'past' : left < n ? 'full' : '' });
    }
    return out;
  }
  const dayState = (date, n) => { const sl = slots(date, n); return sl.some((x) => x.ok) ? 'open' : sl.some((x) => x.why === 'full') ? 'full' : 'closed'; };
  function create(b, who) {            // b: {date,time,n,name,tel,note,src}
    if (who === undefined && !slots(b.date, b.n).some((x) => x.t === b.time && x.ok)) return { error: 'full' };   // the last seats went to someone else
    const bk = Object.assign({ code: code(), status: 'confirmed', created: Date.now(), src: 'site' }, b), L = all();
    L.push(bk); set('bookings', L);
    log(who || 'לקוח', `הזמנה חדשה: ${bk.name}, ${bk.n} סועדים, ${fmtDate(bk.date)} ${bk.time}`);
    emit({ type: 'new', code: bk.code, by: who || null }); return bk;
  }
  function update(c, patch, who) {
    const L = all(), b = L.find((x) => x.code === c); if (!b) return null;
    const moved = (patch.date && patch.date !== b.date) || (patch.time && patch.time !== b.time) || (patch.n && patch.n !== b.n);
    if (moved && who === undefined && !slots(patch.date || b.date, patch.n || b.n, c).some((x) => x.t === (patch.time || b.time) && x.ok)) return { error: 'full' };
    const was = b.status; Object.assign(b, patch); set('bookings', L);
    const type = patch.status === 'cancelled' && was !== 'cancelled' ? 'cancel' : moved ? 'change' : 'status';
    log(who || 'לקוח', type === 'cancel' ? `ביטול: ${b.name}, ${fmtDate(b.date)} ${b.time}` : type === 'change' ? `שינוי: ${b.name} עבר ל-${fmtDate(b.date)} ${b.time}, ${b.n} סועדים` : `${b.name}: ${STATUS[b.status]}`);
    emit({ type, code: c, by: who || null }); return b;
  }
  const find = (c) => all().find((b) => b.code === c) || null;
  const byDate = (date) => all().filter((b) => b.date === date).sort((a, b) => a.time.localeCompare(b.time) || a.created - b.created);
  const STATUS = { confirmed: 'מאושר', arrived: 'הגיעו', noshow: 'לא הגיעו', cancelled: 'בוטל' };
  const fmtDate = (date) => { const d = new Date(date + 'T00:00'), t = day(0), m = day(1); return date === t ? 'היום' : date === m ? 'מחר' : `יום ${DAYN[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}`; };
  const people = (n) => n === 1 ? 'סועד אחד' : n + ' סועדים';

  /* ---------- this device's customer (no sign-up: the site simply remembers) ---------- */
  const me = () => get('me', { name: '', tel: '', codes: [] });
  const remember = (bk) => { const m = me(); m.name = bk.name; m.tel = bk.tel; if (!m.codes.includes(bk.code)) m.codes.push(bk.code); set('me', m); };
  const mine = () => { const now = Date.now(); return me().codes.map(find).filter((b) => b && b.status === 'confirmed' && new Date(`${b.date}T${b.time}`).getTime() > now - 3 * 3600e3).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)); };

  /* ---------- menu (the owner edits it in the admin app) ---------- */
  function menu() {                    // -> [{name, en, items:[{id,n,d,p,im,ex,out,hide}]}]
    const m = get('menu', null); if (m) return m;
    return (window.SW_MENU || []).map(([name, en, items], c) => ({ name, en, items: items.map(([n, d, p, im, ex], i) => ({ id: `${c}-${i}`, n, d, p, im, ex, out: false, hide: false })) }));
  }
  const saveMenu = (m, who, what) => { if (!set('menu', m)) return false; log(who, what || 'עדכון תפריט'); emit({ type: 'menu' }); return true; };
  const img = (im, thumb) => !im ? '' : im.startsWith('data:') ? im : `${window.SW_BASE || ''}img/d/${im}${thumb ? '_t' : ''}.webp`;

  /* ---------- staff + session ---------- */
  const staff = () => get('staff', [{ id: 'u1', name: 'עומר', role: 'owner', user: 'owner', pass: '1234' }, { id: 'u2', name: 'נועה', role: 'host', user: 'host', pass: '1234' }]);
  const saveStaff = (s, who, what) => { set('staff', s); log(who, what || 'עדכון צוות'); emit({ type: 'staff' }); };
  const login = (user, pass) => { const u = staff().find((x) => x.user === user.trim().toLowerCase() && x.pass === pass); if (u) sessionStorage.setItem(K + 'sess', u.id); return u || null; };
  const session = () => staff().find((x) => x.id === sessionStorage.getItem(K + 'sess')) || null;
  const logout = () => sessionStorage.removeItem(K + 'sess');

  /* ---------- activity log ---------- */
  function log(who, text) { const L = get('log', []); L.unshift({ t: Date.now(), who: who || 'מערכת', text }); set('log', L.slice(0, 200)); }
  const activity = () => get('log', []);

  /* ---------- demo data: a believable service for today and tomorrow, created once ---------- */
  function seed() {
    if (get('seeded', 0)) return;
    const N = ['דניאל כהן', 'מיכל לוי', 'יוסי מזרחי', 'נועם פרץ', 'שירה אברהם', 'איתי ביטון', 'רונית דהן', 'אלון גבאי', 'תמר שפירא', 'עידו חדד', 'ליאור אזולאי', 'הילה סויסה', 'אמיר נחום', 'יעל רוזן', 'גיא אוחיון', 'מאיה קורן', 'רועי בן דוד', 'סיוון מלכה'];
    const NOTE = ['', '', '', 'יום הולדת, אשמח לזיקוק על הקינוח', 'כיסא תינוק אחד', '', 'אלרגיה לאגוזים', '', 'שולחן ליד החלון אם אפשר', '', 'יום נישואין'];
    const T = ['12:30', '13:00', '13:00', '13:30', '14:00', '18:30', '19:00', '19:00', '19:30', '19:30', '20:00', '20:00'], L = [];
    let k = 0; const mk = (date, time, i, st) => { const nm = N[k % N.length]; k++; L.push({ code: code(), status: st, created: Date.now() - (40 - k) * 3600e3, src: i % 4 === 0 ? 'phone' : 'site', date, time, n: [2, 4, 2, 6, 3, 2, 5, 4, 8, 2][k % 10], name: nm, tel: '05' + (2 + k % 4) + '-' + String(1000000 + (k * 7919) % 8999999), note: NOTE[k % NOTE.length] }); };
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    T.forEach((t, i) => mk(day(0), t, i, toMin(t) < nowM - 20 ? (i === 3 ? 'noshow' : 'arrived') : 'confirmed'));
    T.slice(2, 10).forEach((t, i) => mk(day(1), t, i, 'confirmed'));
    ['19:00', '19:30', '20:00'].forEach((t, i) => mk(day(2), t, i, 'confirmed'));
    set('bookings', L); set('seeded', 1);
    set('log', [{ t: Date.now() - 5400e3, who: 'נועה', text: 'סומן שהגיעו: ' + L[0].name }, { t: Date.now() - 9200e3, who: 'לקוח', text: `הזמנה חדשה: ${L[8].name}, ${L[8].n} סועדים` }]);
  }
  seed();
  const reset = () => { Object.keys(localStorage).filter((k) => k.startsWith(K)).forEach((k) => localStorage.removeItem(k)); sessionStorage.removeItem(K + 'sess'); seed(); emit({ type: 'reset' }); };

  /* ---------- calendar ---------- */
  function ics(b, url) {
    const s = new Date(`${b.date}T${b.time}`), e = new Date(s.getTime() + 2 * 3600e3), f = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STEAKWOOD//Reservations//HE', 'BEGIN:VEVENT', `UID:${b.code}@steakwood`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
      `SUMMARY:STEAKWOOD · שולחן ל-${b.n}`, 'LOCATION:STEAKWOOD\\, כביש 98\\, מסעדה\\, רמת הגולן', `DESCRIPTION:שולחן ל-${b.n} על שם ${b.name}.\\nלשינוי או ביטול: ${url}\\nטלפון המסעדה: 050-2483177`, `URL:${url}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:STEAKWOOD בעוד שעתיים', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function gcal(b, url) {
    const s = new Date(`${b.date}T${b.time}`), e = new Date(s.getTime() + 2 * 3600e3), f = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(`STEAKWOOD · שולחן ל-${b.n}`) + `&dates=${f(s)}/${f(e)}&location=` + encodeURIComponent('STEAKWOOD, כביש 98, מסעדה') + '&details=' + encodeURIComponent(`שולחן ל-${b.n} על שם ${b.name}.\nלשינוי או ביטול: ${url}`);
  }

  window.SW = { settings, saveSettings, slots, dayState, taken, create, update, find, byDate, all, me, remember, mine, menu, saveMenu, img, staff, saveStaff, login, session, logout, activity, reset, ics, gcal,
    on: (f) => subs.push(f), ymd, day, toMin, toT, fmtDate, people, DAYN, STATUS, live };
})();
