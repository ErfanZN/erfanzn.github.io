(() => {
  'use strict';
  if (document.getElementById('portfolio-review')) return;
  const KEY = 'erfan-portfolio-review-v1';
  const DRAFT_KEY = `${KEY}-draft`;
  const host = document.createElement('div');
  host.id = 'portfolio-review';
  host.lang = 'fa';
  const ui = host.attachShadow({ mode: 'open' });
  ui.innerHTML = `
    <link rel="stylesheet" href="/review.css">
    <div class="outline" hidden></div><div id="pins"></div>
    <section class="toolbar" aria-label="ابزار بازبینی سایت" dir="rtl">
      <header><strong>بازبینی سایت</strong><small>یادداشت‌ها در همین مرورگر می‌مانند</small><button id="exit" aria-label="خروج از بازبینی" title="خروج از بازبینی">×</button></header>
      <div class="actions"><button id="pick" aria-pressed="true">انتخاب بخش</button><button id="notes">یادداشت‌ها (۰)</button><button id="copy">کپی برای گفتگو</button></div>
      <p class="hint" id="hint">روی هر بخش کلیک کن و بگو چه تغییری می‌خواهی.</p>
      <p class="status" id="status" role="status" aria-live="polite">برای انتخاب با کیبورد: Alt + ↓ سپس Enter</p>
      <button id="resume" hidden>ادامهٔ پیش‌نویس</button>
    </section>
    <dialog aria-labelledby="dialog-title">
      <div class="dialog-head"><h2 id="dialog-title"></h2><button id="close" aria-label="بستن پنجره">×</button></div>
      <form id="editor" novalidate hidden>
        <div class="context"><p id="target-text" dir="auto"></p><small id="target-section" dir="auto"></small></div>
        <button type="button" id="parent">انتخاب بخش بزرگ‌تر</button>
        <label for="comment">چه چیزی باید عوض شود؟</label>
        <textarea id="comment" dir="auto" maxlength="4000" placeholder="مثلاً این تیتر کوتاه‌تر شود و اندازه‌اش کوچک‌تر باشد." aria-describedby="comment-error draft-help" style="resize:none"></textarea>
        <p class="error" id="comment-error" role="alert"></p>
        <div class="actions"><button type="submit" class="primary">ذخیره یادداشت</button><button type="button" id="cancel">بستن</button></div>
        <p class="muted" id="draft-help">ذخیره در مرورگر؛ برای ارسال به گفتگو از «کپی برای گفتگو» استفاده کن.</p>
      </form>
      <section id="list" hidden><div id="note-list"></div><button id="undo" hidden>برگرداندن یادداشت حذف‌شده</button><p class="muted">هیچ یادداشتی خودکار برای کسی ارسال نمی‌شود.</p></section>
      <section id="export" hidden><p>کپی خودکار انجام نشد. متن زیر را انتخاب و کپی کن و در گفتگو بفرست.</p><label for="export-text">متن یادداشت‌ها</label><textarea id="export-text" readonly style="resize:none"></textarea></section>
    </dialog>`;
  document.body.append(host);
  const $ = id => ui.getElementById(id);
  const dialog = ui.querySelector('dialog');
  const outline = ui.querySelector('.outline');
  let picking = true, hovered = null, target = null, editingId = null, selected = null, keyboardSelecting = false;
  let state = { notes: [], trash: null }, draft = null, storageOK = true, raf = 0;
  const say = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
  const validNote = n => n && typeof n.id === 'string' && typeof n.path === 'string' && n.path.startsWith('/') && typeof n.selector === 'string' && typeof n.comment === 'string';
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.notes)) state = { notes: saved.notes.filter(validNote), trash: validNote(saved.trash) ? saved.trash : null };
    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (validNote(savedDraft)) draft = savedDraft;
  } catch { storageOK = false; say('ذخیرهٔ مرورگر در دسترس نیست؛ پیش از خروج، یادداشت‌ها را کپی کن.', true); }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; return true; }
    catch { storageOK = false; say('یادداشت فعلاً در این صفحه است؛ ذخیره نشد. آن را کپی کن.', true); return false; }
  }
  function persistDraft() {
    if (!selected) return;
    draft = { ...selected, id: editingId || 'draft', comment: $('comment').value };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
    catch { storageOK = false; $('draft-help').textContent = 'پیش‌نویس ذخیره نشد؛ قبل از خروج متن را کپی کن.'; }
    $('resume').hidden = !draft.comment.trim();
  }
  function selectorFor(el) {
    const parts = [];
    while (el && el !== document.body) {
      if (el.id) { parts.unshift(`#${CSS.escape(el.id)}`); break; }
      let part = el.localName;
      const siblings = [...el.parentElement.children].filter(s => s.localName === el.localName);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(el) + 1})`;
      parts.unshift(part); el = el.parentElement;
    }
    return parts.join(' > ') || 'body';
  }
  function describe(el) {
    const section = el.closest('section,article,header,footer');
    return {
      path: location.pathname, selector: selectorFor(el),
      text: (el.getAttribute('alt') || el.innerText || el.getAttribute('aria-label') || el.localName).replace(/\s+/g, ' ').trim().slice(0,250),
      section: section?.querySelector('h1,h2,h3')?.textContent?.trim().slice(0,150) || section?.getAttribute('aria-label') || el.localName,
      viewport: `${innerWidth} × ${innerHeight}`, time: new Date().toISOString()
    };
  }
  function find(note) { try { return document.querySelector(note.selector); } catch { return null; } }
  function highlight(el) {
    hovered = el;
    if (!el || dialog.open || !picking) { outline.hidden = true; return; }
    const r = el.getBoundingClientRect();
    Object.assign(outline.style, { left:`${r.left}px`, top:`${r.top}px`, width:`${r.width}px`, height:`${r.height}px` });
    outline.hidden = false;
  }
  function setPicking(value) {
    picking = value; $('pick').setAttribute('aria-pressed', String(value));
    $('pick').textContent = value ? 'انتخاب بخش' : 'مرور سایت';
    $('hint').textContent = value ? 'روی هر بخش کلیک کن و بگو چه تغییری می‌خواهی.' : 'لینک‌ها و دکمه‌ها کار می‌کنند. برای نظر دادن «مرور سایت» را بزن.';
    highlight(null);
  }
  function show(view, title) {
    for (const name of ['editor','list','export']) $(name).hidden = name !== view;
    $('dialog-title').textContent = title; outline.hidden = true;
    if (!dialog.open) dialog.showModal();
  }
  function closeDialog() { dialog.close(); $('pick').focus(); }
  function updateContext() {
    $('target-text').textContent = selected.text;
    $('target-section').textContent = `${selected.section} · ${selected.path}`;
    $('parent').hidden = !target?.parentElement || target.parentElement === document.body;
  }
  function edit(el, note = null) {
    target = el; editingId = note?.id === 'draft' ? null : note?.id || null;
    selected = note ? { ...note } : describe(el);
    $('comment').value = note?.comment || '';
    $('comment-error').textContent = ''; $('comment').removeAttribute('aria-invalid');
    updateContext(); show('editor', editingId ? 'ویرایش یادداشت' : 'یادداشت جدید'); $('comment').focus();
  }
  function renderPins() {
    $('pins').replaceChildren();
    state.notes.forEach((note,index) => {
      if (note.path !== location.pathname) return;
      const el = find(note); if (!el || !el.getClientRects().length) return;
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const pin = document.createElement('button'); pin.className = 'pin';
      pin.textContent = String(index + 1); pin.setAttribute('aria-label', `ویرایش یادداشت ${index + 1}: ${note.text}`);
      pin.style.left = `${Math.max(4,Math.min(innerWidth-32,r.right-14))}px`;
      pin.style.top = `${Math.max(4,r.top-12)}px`; pin.addEventListener('click', () => edit(el,note)); $('pins').append(pin);
    });
  }
  function update() {
    $('notes').textContent = `یادداشت‌ها (${state.notes.length.toLocaleString('fa-IR')})`;
    $('copy').disabled = !state.notes.length; $('resume').hidden = !draft?.comment?.trim(); renderPins();
  }
  function makeButton(text, action) { const b = document.createElement('button'); b.textContent = text; b.addEventListener('click',action); return b; }
  function reviewURL(path) { const url = new URL(path,location.origin); url.searchParams.set('review','1'); return url; }
  function showNotes() {
    $('note-list').replaceChildren();
    if (!state.notes.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'هنوز یادداشتی نداری. پنجره را ببند و روی بخشی از سایت کلیک کن.'; $('note-list').append(p); }
    state.notes.forEach((note,index) => {
      const item = document.createElement('article'); item.className = 'note';
      const title = document.createElement('h3'); title.textContent = `${index+1}. ${note.section}`;
      const context = document.createElement('p'); context.className = 'preview'; context.dir = 'auto'; context.textContent = note.text;
      const message = document.createElement('p'); message.dir = 'auto'; message.textContent = note.comment;
      const actions = document.createElement('div'); actions.className = 'row';
      actions.append(makeButton('مشاهده و ویرایش', () => {
        if (note.path !== location.pathname) { const url = reviewURL(note.path); url.searchParams.set('note',note.id); location.assign(url); return; }
        const el = find(note); if (el) { el.closest('details')?.setAttribute('open',''); el.scrollIntoView({block:'center'}); }
        edit(el,note);
      }), makeButton('حذف', () => { state.trash = note; state.notes = state.notes.filter(n => n.id !== note.id); persist(); update(); showNotes(); $('undo').focus(); }));
      item.append(title,context,message,actions); $('note-list').append(item);
    });
    $('undo').hidden = !state.trash; show('list','یادداشت‌های بازبینی'); $('close').focus();
  }
  function exportText() {
    return 'این تغییرات را روی سایت من اعمال کن:\n\n' + state.notes.map((n,i) => `${i+1}. ${n.section}\nصفحه: ${new URL(n.path,location.origin).href}\nبخش انتخاب‌شده: ${n.text}\nنشانی عنصر: ${n.selector}\nاندازه صفحه هنگام انتخاب: ${n.viewport}\nتغییر درخواستی: ${n.comment}`).join('\n\n');
  }
  async function copyNotes() {
    if (!state.notes.length) return;
    const text = exportText();
    try { await navigator.clipboard.writeText(text); say('کپی شد. حالا در همین گفتگو Paste کن و بفرست.'); }
    catch { show('export','کپی یادداشت‌ها'); $('export-text').value = text; $('export-text').focus(); $('export-text').select(); }
  }
  $('editor').addEventListener('submit', event => {
    event.preventDefault(); const comment = $('comment').value.trim();
    if (!comment) { $('comment-error').textContent = 'تغییر موردنظرت را بنویس.'; $('comment').setAttribute('aria-invalid','true'); $('comment').focus(); return; }
    const note = { ...selected, id: editingId || crypto.randomUUID(), comment, time: new Date().toISOString() };
    const index = state.notes.findIndex(n => n.id === note.id);
    if (index < 0) state.notes.push(note); else state.notes[index] = note;
    const saved = persist(); draft = null;
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* The copy action remains available. */ }
    closeDialog(); update(); if (saved) say('یادداشت ذخیره شد. بخش بعدی را انتخاب کن یا یادداشت‌ها را کپی کن.');
  });
  $('comment').addEventListener('input', () => { $('comment').removeAttribute('aria-invalid'); $('comment-error').textContent = ''; persistDraft(); });
  $('parent').addEventListener('click', () => { if (target?.parentElement && target.parentElement !== document.body) { target = target.parentElement; selected = describe(target); updateContext(); persistDraft(); } });
  $('pick').addEventListener('click', () => setPicking(!picking));
  $('notes').addEventListener('click', showNotes); $('copy').addEventListener('click', copyNotes);
  $('close').addEventListener('click',closeDialog); $('cancel').addEventListener('click',closeDialog);
  dialog.addEventListener('close', () => { update(); $('pick').focus(); });
  $('undo').addEventListener('click', () => { if (state.trash) { state.notes.push(state.trash); state.trash = null; persist(); update(); showNotes(); } });
  $('resume').addEventListener('click', () => {
    if (!draft) return;
    if (draft.path !== location.pathname) { const url = reviewURL(draft.path); url.searchParams.set('draft','1'); location.assign(url); return; }
    edit(find(draft),draft);
  });
  $('exit').addEventListener('click', () => { const url = new URL(location.href); ['review','note','draft'].forEach(k=>url.searchParams.delete(k)); location.assign(url); });
  const inside = event => event.composedPath().includes(host);
  const candidate = el => el?.closest?.('h1,h2,h3,h4,p,img,button,a,summary,li,figure,section') || el;
  document.addEventListener('pointerover', event => { if (!inside(event) && picking && !dialog.open) { keyboardSelecting = false; highlight(candidate(event.target)); } },true);
  document.addEventListener('click', event => {
    if (inside(event) || dialog.open) return;
    if (picking) { event.preventDefault(); event.stopImmediatePropagation(); edit(candidate(event.target)); }
    else {
      const link = event.target.closest('a[href]'); if (!link) return;
      const url = new URL(link.href); if (url.origin === location.origin && url.pathname !== location.pathname) { url.searchParams.set('review','1'); link.href = url; }
    }
  },true);
  document.addEventListener('keydown', event => {
    if (dialog.open || !picking || event.isComposing) return;
    if (event.altKey && ['ArrowDown','ArrowUp'].includes(event.key)) {
      event.preventDefault();
      keyboardSelecting = true;
      const choices = [...document.querySelectorAll('h1,h2,h3,p,img,button,a,summary')].filter(el=>!host.contains(el) && el.getClientRects().length);
      const index = choices.indexOf(hovered), direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = choices[(index+direction+choices.length)%choices.length];
      next?.scrollIntoView({block:'center'}); highlight(next); say(next ? `انتخاب شد: ${describe(next).text.slice(0,70)}. Enter را بزن.` : 'بخشی پیدا نشد.');
    } else if (event.key === 'Enter' && hovered && (!inside(event) || keyboardSelecting)) { event.preventDefault(); event.stopImmediatePropagation(); keyboardSelecting = false; edit(hovered); }
    else if (event.key === 'Escape') { setPicking(false); say('انتخاب متوقف شد؛ می‌توانی سایت را مرور کنی.'); }
  },true);
  function reposition() { if (raf) return; raf = requestAnimationFrame(() => { raf=0; highlight(hovered); renderPins(); }); }
  window.addEventListener('scroll',reposition,{passive:true}); window.addEventListener('resize',reposition);
  window.addEventListener('beforeunload', event => { if (!storageOK && (state.notes.length || $('comment').value.trim())) { event.preventDefault(); event.returnValue=''; } });
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    try { const incoming = JSON.parse(event.newValue); if (incoming && Array.isArray(incoming.notes)) { state = {notes:incoming.notes.filter(validNote),trash:validNote(incoming.trash)?incoming.trash:null}; update(); if (!$('list').hidden) showNotes(); } } catch { say('یادداشت‌های تب دیگر قابل خواندن نیست؛ متن را کپی کن.',true); }
  });
  update();
  const requested = new URLSearchParams(location.search).get('note');
  const existing = state.notes.find(n=>n.id===requested && n.path===location.pathname);
  if (existing) edit(find(existing),existing);
  else if (new URLSearchParams(location.search).get('draft') === '1' && draft?.path===location.pathname) edit(find(draft),draft);
})();
