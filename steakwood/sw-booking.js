/* STEAKWOOD reservations: the customer's booking sheet (new booking, confirmation, change, cancel).
   Opens from every [data-rs] button, from the "your booking" chip and from a personal link (?b=CODE). */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rs = $('#rs'), card = $('#rsCard'), TEL = '050-2483177', TELH = 'tel:+972502483177', WAZE = 'https://waze.com/ul?ll=33.2298582,35.7560754&navigate=yes';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lenis = () => window.__lenis;
  let st = null, lastFocus = null;       // st: {n, date, time, edit (code being changed)}
  const link = (b) => location.origin + location.pathname + '?b=' + b.code;
  const toast = (m) => { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };

  function open(view, arg) {
    lastFocus = document.activeElement; rs.classList.add('on'); if (lenis()) lenis().stop();
    if (view === 'manage') manage(arg); else form(arg);
  }
  function close() { rs.classList.remove('on'); if (lenis()) lenis().start(); if (lastFocus && lastFocus.focus) lastFocus.focus(); chip(); }
  const shell = (body, foot) => { card._refresh = null; card.innerHTML = `<button class="b-x" aria-label="סגירה">✕</button><div class="b-scroll">${body}</div>${foot ? `<div class="b-foot">${foot}</div>` : ''}`; $('.b-x', card).onclick = close; $('.b-scroll', card).scrollTop = 0; };

  /* ---------- new booking / change ---------- */
  function form(edit) {
    const S = SW.settings(), me = SW.me();
    st = edit ? { n: edit.n, date: edit.date, time: edit.time, edit: edit.code } : { n: (st && !st.edit && st.n) || 2, date: null, time: null, edit: null };
    shell(`<span class="m b-k">// ${edit ? 'CHANGE' : 'RESERVE'}</span><h3>${edit ? 'שינוי הזמנה' : 'הזמנת שולחן'}</h3><p class="b-sub">${edit ? 'בוחרים מועד חדש, והשולחן הקודם משתחרר.' : 'שלושה צעדים, בלי הרשמה ובלי המתנה לאישור.'}</p>
      <div class="b-l" id="bLn"><span>כמה סועדים</span></div><div class="b-row" id="bN" role="radiogroup" aria-labelledby="bLn"></div>
      <div class="b-l" id="bLd"><span>באיזה יום</span></div><div class="b-row" id="bD" role="radiogroup" aria-labelledby="bLd"></div>
      <div class="b-l" id="bLt"><span>באיזו שעה</span><i id="bHint"></i></div><div id="bT"></div>
      ${edit ? '' : `<div class="b-l"><span>פרטים</span></div>
      <div class="b-two"><input class="b-f" id="bName" placeholder="שם מלא" autocomplete="name" aria-label="שם מלא" value="${esc(me.name)}"><input class="b-f" id="bTel" placeholder="טלפון נייד" inputmode="tel" autocomplete="tel" aria-label="טלפון נייד" dir="ltr" style="text-align:right" value="${esc(me.tel)}"></div>
      <button class="b-link" id="bNoteBtn">+ הוספת הערה (יום הולדת, כיסא תינוק, אלרגיה)</button><textarea class="b-f" id="bNote" placeholder="מה חשוב שנדע?" aria-label="הערה למסעדה" hidden></textarea>`}`,
      `<button class="b-go" id="bGo" disabled></button><p class="b-note" id="bFoot"></p>`);
    const ns = Array.from({ length: Math.max(8, st.n) }, (_, i) => i + 1);
    $('#bN').innerHTML = ns.map((n) => `<button class="b-c" role="radio" data-n="${n}" aria-label="${SW.people(n)}">${n}</button>`).join('') + `<button class="b-c" data-n="more" style="min-width:64px;font-size:14px">${ns.length < S.maxParty ? 'עוד' : 'יותר'}</button>`;
    $('#bN').onclick = (e) => { const b = e.target.closest('.b-c'); if (!b) return; if (b.dataset.n === 'more') return more(); st.n = +b.dataset.n; paintN(); days(); };
    function more() { const cur = $$('#bN [data-n]').filter((x) => x.dataset.n !== 'more').length; if (cur >= S.maxParty) { $('#bT').innerHTML = `<div class="b-empty">לקבוצות של יותר מ-${S.maxParty} סועדים אנחנו מתאמים אישית.<br><a href="${TELH}">התקשרו ${TEL}</a></div>`; return; } const add = Math.min(S.maxParty, cur + 4); const more = $('#bN [data-n="more"]'); for (let n = cur + 1; n <= add; n++) more.insertAdjacentHTML('beforebegin', `<button class="b-c" role="radio" data-n="${n}" aria-label="${SW.people(n)}">${n}</button>`); if (add >= S.maxParty) more.textContent = 'יותר'; $$('#bN .b-c')[cur].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
    const paintN = () => $$('#bN .b-c').forEach((x) => { const on = +x.dataset.n === st.n; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    function days() {
      const list = Array.from({ length: S.days }, (_, i) => { const date = SW.day(i), d = new Date(date + 'T00:00'); return { date, d, i, state: SW.dayState(date, st.n) }; });
      $('#bD').innerHTML = list.map((x) => `<button class="b-c d" role="radio" data-d="${x.date}" ${x.state !== 'open' ? 'disabled' : ''} aria-label="${SW.fmtDate(x.date)}">${x.i === 0 ? 'היום' : x.i === 1 ? 'מחר' : SW.DAYN[x.d.getDay()]}<b>${x.d.getDate()}.${x.d.getMonth() + 1}</b>${x.state === 'full' ? '<small>מלא</small>' : x.state === 'closed' ? '<small>סגור</small>' : ''}</button>`).join('');
      $('#bD').onclick = (e) => { const b = e.target.closest('.b-c'); if (!b || b.disabled) return; st.date = b.dataset.d; if (st.time && !SW.slots(st.date, st.n, st.edit).some((s) => s.t === st.time && s.ok)) st.time = null; paintD(); times(); };
      if (!st.date || !list.some((x) => x.date === st.date && x.state === 'open')) { const f = list.find((x) => x.state === 'open'); st.date = f ? f.date : null; st.time = null; }
      paintD(); times();
      const on = $('#bD .on'); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
    const paintD = () => $$('#bD .b-c').forEach((x) => { const on = x.dataset.d === st.date; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    function times() {
      if (!st.date) { $('#bT').innerHTML = `<div class="b-empty">אין כרגע מקום פנוי ל-${SW.people(st.n)} בשבועות הקרובים.<br><a href="${TELH}">התקשרו ${TEL}</a></div>`; return check(); }
      const sl = SW.slots(st.date, st.n, st.edit).filter((s) => s.why !== 'past' && s.why !== 'closed');
      if (st.time && !sl.some((s) => s.t === st.time && s.ok)) st.time = null;
      const btn = (s) => `<button class="b-c t${s.t === st.time ? ' on' : ''}" role="radio" aria-checked="${s.t === st.time}" data-t="${s.t}" ${s.ok ? '' : 'disabled aria-label="' + s.t + ' מלא"'}>${s.t}${s.ok && s.left - st.n < 6 ? '<small>כמעט מלא</small>' : ''}</button>`;
      const a = sl.filter((s) => SW.toMin(s.t) < 17 * 60), b = sl.filter((s) => SW.toMin(s.t) >= 17 * 60);
      $('#bT').innerHTML = sl.length ? (a.length ? `<div class="b-part">צהריים</div><div class="b-times" role="radiogroup" aria-labelledby="bLt">${a.map(btn).join('')}</div>` : '') + (b.length ? `<div class="b-part">ערב</div><div class="b-times" role="radiogroup" aria-labelledby="bLt">${b.map(btn).join('')}</div>` : '') : `<div class="b-empty">להיום כבר אי אפשר להזמין באתר.<br><a href="${TELH}">התקשרו ${TEL}</a></div>`;
      $('#bHint').textContent = SW.fmtDate(st.date);
      $$('#bT .b-c').forEach((x) => x.onclick = () => { st.time = x.dataset.t; $$('#bT .b-c').forEach((y) => { y.classList.toggle('on', y === x); y.setAttribute('aria-checked', y === x); }); check(); if (!edit && !$('#bName').value) $('#bName').focus({ preventScroll: false }); });
      check();
    }
    function check() {
      const go = $('#bGo'), okD = st.date && st.time, okP = edit || ($('#bName').value.trim().length > 1 && $('#bTel').value.replace(/\D/g, '').length >= 9);
      go.disabled = !(okD && okP);
      go.innerHTML = okD ? `${edit ? 'שמירת השינוי' : 'אישור הזמנה'} <small>${SW.fmtDate(st.date)} · ${st.time} · ${SW.people(st.n)}</small>` : 'בחרו יום ושעה';
      $('#bFoot').textContent = edit ? '' : !okD ? 'ההזמנה מאושרת מיד, בלי המתנה לטלפון חוזר.' : okP ? 'ההזמנה מאושרת מיד. אפשר לשנות או לבטל בכל רגע.' : 'נשאר רק שם וטלפון.';
    }
    if (!edit) { ['#bName', '#bTel'].forEach((q) => $(q).addEventListener('input', check)); $('#bNoteBtn').onclick = () => { $('#bNoteBtn').hidden = true; $('#bNote').hidden = false; $('#bNote').focus(); }; }
    $('#bGo').onclick = () => {
      if (edit) { const r = SW.update(edit.code, { date: st.date, time: st.time, n: st.n }); if (r && r.error) { toast('השעה הזאת התמלאה הרגע, בחרו שעה אחרת'); return times(); } toast('ההזמנה עודכנה'); return manage(r, true); }
      const r = SW.create({ date: st.date, time: st.time, n: st.n, name: $('#bName').value.trim(), tel: $('#bTel').value.trim(), note: $('#bNote').value.trim() });
      if (r.error) { toast('השעה הזאת התמלאה הרגע, בחרו שעה אחרת'); return times(); }
      SW.remember(r); st = null; manage(r, true, true);
    };
    card._refresh = days; paintN(); days();
  }

  /* ---------- confirmation + my booking ---------- */
  const ticket = (b) => { const d = new Date(b.date + 'T00:00'), off = b.status === 'cancelled'; return `<div class="b-tk${off ? ' off' : ''}"><div class="top"><div class="when"><b>${SW.fmtDate(b.date)}</b><span>יום ${SW.DAYN[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}</span></div><div class="hr">${b.time}</div></div><div class="bot"><div><small>GUESTS</small><b>${SW.people(b.n)}</b></div><div><small>NAME</small><b>${esc(b.name)}</b></div><div><small>CODE</small><b class="mono">${b.code}</b></div></div></div>`; };
  function addCal(b) {
    const ua = navigator.userAgent, apple = /iPhone|iPad|iPod|Macintosh/.test(ua);
    if (!apple) return window.open(SW.gcal(b, link(b)), '_blank', 'noopener');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([SW.ics(b, link(b))], { type: 'text/calendar;charset=utf-8' })); a.download = 'steakwood.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function manage(b, fresh, isNew) {
    b = typeof b === 'string' ? SW.find(b) : b;
    if (!b) { shell(`<span class="m b-k">// BOOKING</span><h3>לא מצאנו את ההזמנה</h3><p class="b-sub">ייתכן שהקישור נפתח במכשיר אחר. בגרסת הדמו ההזמנות נשמרות במכשיר שבו נוצרו.</p><div class="b-acts"><a class="b-btn p" href="${TELH}">התקשרו ${TEL}</a></div>`); return; }
    const off = b.status === 'cancelled', past = b.status === 'arrived' || b.status === 'noshow';
    shell(`<div class="b-done">${isNew ? '<div class="b-ring"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' : ''}
      <span class="b-tag${off ? ' off' : ''}">${off ? 'ההזמנה בוטלה' : past ? SW.STATUS[b.status] : 'מאושר'}</span>
      <h3 style="margin-top:14px">${off ? 'השולחן שוחרר' : isNew ? 'השולחן שלך שמור' : fresh ? 'ההזמנה עודכנה' : 'ההזמנה שלך'}</h3>
      <p class="b-sub">${off ? 'נשמח לראות אותך בפעם אחרת.' : isNew ? 'אין צורך באישור נוסף. מחכים לך.' : 'STEAKWOOD · כביש 98, מסעדה'}</p></div>
      ${ticket(b)}
      ${off || past ? `<div class="b-acts"><button class="b-btn p" id="mNew">הזמנת שולחן חדש</button></div>` : `<div class="b-acts"><button class="b-btn p" id="mCal">הוספה ליומן, עם תזכורת</button></div>
      <div class="b-acts two"><a class="b-btn" href="${WAZE}" target="_blank" rel="noopener">ניווט בוויז</a><button class="b-btn" id="mEdit">שינוי מועד</button></div>
      <div class="b-acts" id="mCx"><button class="b-link" id="mCancel" style="margin:4px auto 0">ביטול ההזמנה</button></div>
      <p class="b-note">${isNew ? 'היומן יזכיר לך שעתיים לפני. ההזמנה נשארת שמורה גם באתר, במכשיר הזה.' : 'שינוי או ביטול משחררים את השולחן מיד, בלי צורך להתקשר.'}</p>`}`);
    if ($('#mNew')) $('#mNew').onclick = () => form();
    if ($('#mCal')) { $('#mCal').onclick = () => addCal(b); $('#mEdit').onclick = () => form(b);
      $('#mCancel').onclick = () => { $('#mCx').className = 'b-acts two'; $('#mCx').innerHTML = `<button class="b-btn r p" id="mYes">כן, לבטל</button><button class="b-btn" id="mNo">להשאיר</button>`; $('#mNo').onclick = () => manage(b); $('#mYes').onclick = () => { manage(SW.update(b.code, { status: 'cancelled' })); toast('ההזמנה בוטלה'); }; $('#mYes').focus(); }; }
    chip();
  }

  /* ---------- "your booking" chip ---------- */
  const mybk = $('#mybk');
  function chip() { const b = SW.mine()[0]; if (!b || rs.classList.contains('on')) { mybk.classList.remove('on'); return; } mybk.innerHTML = `<i></i><span>ההזמנה שלך · <b>${SW.fmtDate(b.date)} ${b.time}</b></span><span aria-hidden="true">‹</span>`; mybk.dataset.c = b.code; mybk.classList.add('on'); }
  mybk.onclick = () => open('manage', mybk.dataset.c);

  $$('[data-rs]').forEach((b) => b.onclick = () => open());
  rs.addEventListener('click', (e) => { if (e.target === rs) close(); });
  SW.on((e) => { if (!rs.classList.contains('on')) chip(); else if ($('#bD') && card._refresh && e.type !== 'menu') card._refresh(); });
  window.SWB = { open, close, isOpen: () => rs.classList.contains('on') };
  const q = new URLSearchParams(location.search).get('b');
  if (q) setTimeout(() => open('manage', q.toUpperCase()), 600); else if (new URLSearchParams(location.search).has('reserve')) setTimeout(() => open(), 600); else setTimeout(chip, 1500);
})();
