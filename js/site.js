/* ═══════════════════════════════════════════════════════════
   Two Grounds v3 — Jivitesh Kumar
   Progressive enhancement throughout: with JS off the page reads
   top to bottom, with reduced motion it stays calm, and touch
   devices keep their native behaviour.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var osReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionPref = null;
  try { motionPref = localStorage.getItem('jk-motion'); } catch (e) { /* storage blocked */ }
  var reduce = motionPref === 'on' ? false : motionPref === 'off' ? true : osReduce;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  // phones: skip the ambient canvas entirely. It is decorative, nearly invisible at this
  // size, and repainting it every frame is what makes a mid-range phone drop scroll frames.
  var lightweight = window.matchMedia('(max-width: 899px)').matches && window.matchMedia('(pointer: coarse)').matches;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ramp(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* hello — Leo is being built for Asia and Europe; the site says hi in both */
  var GREET = [
    ['Hello', 'English', 'en'],
    ['नमस्ते', 'Hindi', 'hi'],
    ['नमस्कार', 'Marathi', 'mr'],
    ['வணக்கம்', 'Tamil', 'ta'],
    ['こんにちは', 'Japanese', 'ja'],
    ['안녕하세요', 'Korean', 'ko'],
    ['你好', 'Mandarin', 'zh'],
    ['Bonjour', 'French', 'fr'],
    ['Hallo', 'German', 'de'],
    ['Hola', 'Spanish', 'es'],
    ['Ciao', 'Italian', 'it'],
    ['Olá', 'Portuguese', 'pt'],
    ['مرحبا', 'Arabic', 'ar']
  ];

  var vw = window.innerWidth, vh = window.innerHeight, docH = 0;
  var S = { y: window.scrollY, py: window.scrollY, v: 0, dir: 1 };
  var M = { x: vw * 0.5, y: vh * 0.4, sx: vw * 0.5, sy: vh * 0.4, on: false, down: false };

  root.classList.add('js', reduce ? 'calm' : 'motion');

  /* ── motion: follows the device, but the visitor has the last word ── */
  function setMotion(v) {
    try { localStorage.setItem('jk-motion', v); } catch (e) { /* storage blocked */ }
    window.location.reload();
  }
  (function motionControls() {
    $$('.motion-toggle').forEach(function (b) {
      b.hidden = false;
      b.textContent = reduce ? 'Motion: off' : 'Motion: on';
      b.setAttribute('aria-pressed', String(!reduce));
      b.addEventListener('click', function () { setMotion(reduce ? 'on' : 'off'); });
    });
    var hinted = false;
    try { hinted = sessionStorage.getItem('jk-motion-hint') === '1'; } catch (e) { /* storage blocked */ }
    if (!osReduce || motionPref !== null || hinted) return;
    try { sessionStorage.setItem('jk-motion-hint', '1'); } catch (e) { /* storage blocked */ }
    var h = document.createElement('div');
    h.className = 'motion-hint';
    h.setAttribute('role', 'status');
    h.innerHTML = '<p>Your device is set to reduce motion, so you\u2019re seeing the calm version of this site.</p>' +
      '<button type="button" class="on">Turn motion on</button>' +
      '<button type="button" class="x" aria-label="Dismiss">\u00d7</button>';
    body.appendChild(h);
    $('.on', h).addEventListener('click', function () { setMotion('on'); });
    $('.x', h).addEventListener('click', function () { if (h.parentNode) h.parentNode.removeChild(h); });
  })();

  /* ── clock ───────────────────────────────────────────── */
  (function clock() {
    var a = $('#clock'), b = $('#clock2'), y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    function tick() {
      var t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      if (a) a.textContent = t;
      if (b) b.textContent = t.slice(0, 5);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ── name: split into letters that respond to the pointer ── */
  var nameEl = $('#name');
  var letters = [];
  if (nameEl) {
    var ci = 0;
    $$('.line', nameEl).forEach(function (line) {
      var txt = line.textContent.trim();
      line.textContent = '';
      for (var k = 0; k < txt.length; k++) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = txt[k];
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--ci', ci++);
        line.appendChild(s);
        letters.push({ el: s, w: 800, wd: 100 });
      }
    });
    if (!reduce) nameEl.classList.add('enter');
  }
  function enterName() {
    if (!nameEl || reduce) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { nameEl.classList.add('go'); });
    });
    setTimeout(function () { nameEl.classList.remove('enter', 'go'); }, 2000);
  }

  /* ── intro: hello in thirteen languages, once per visit ── */
  function runIntro(done) {
    var seen = false;
    try { seen = sessionStorage.getItem('jk-intro') === '1'; } catch (e) { /* storage blocked */ }
    if (reduce || seen) { done(); return; }
    try { sessionStorage.setItem('jk-intro', '1'); } catch (e) { /* storage blocked */ }

    var el = document.createElement('div');
    el.className = 'intro';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<p class="intro-word"><span></span></p><p class="intro-lang"></p><span class="intro-bar"></span>';
    body.appendChild(el);
    root.classList.add('intro-lock');

    var word = $('.intro-word span', el), lang = $('.intro-lang', el), bar = $('.intro-bar', el);
    var seq = [0, 7, 9, 8, 10, 11, 12, 4, 5, 6, 3, 2, 1];   // …ends on नमस्ते
    var i = 0, timer = null, over = false;

    function show() {
      var g = GREET[seq[i]];
      word.textContent = g[0];
      word.setAttribute('lang', g[2]);
      lang.textContent = g[1];
      bar.style.transform = 'scaleX(' + ((i + 1) / seq.length) + ')';
    }
    function finish() {
      if (over) return;
      over = true;
      clearTimeout(timer);
      el.classList.add('out');
      root.classList.remove('intro-lock');
      done();
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
    }
    function step() {
      i++;
      if (i >= seq.length) { finish(); return; }
      show();
      timer = setTimeout(step, i === seq.length - 1 ? 480 : 118);
    }

    show();
    timer = setTimeout(step, 320);
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, finish, { passive: true, once: true });
    });
    setTimeout(finish, 4500);   // failsafe
  }

  /* ── custom cursor ───────────────────────────────────── */
  var cursor = null, cDot, cRing, cLabel, cTarget = null, cCycle = null;
  var R = { x: M.x, y: M.y };

  function initCursor() {
    if (!fine || reduce) return;
    cursor = document.createElement('div');
    cursor.className = 'cursor is-hidden';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="c-ring"><span class="c-label"></span></span><span class="c-dot"></span>';
    body.appendChild(cursor);
    cDot = $('.c-dot', cursor);
    cRing = $('.c-ring', cursor);
    cLabel = $('.c-label', cursor);
    root.classList.add('has-cursor');

    function tag(sel, label) {
      $$(sel).forEach(function (el) { if (!el.getAttribute('data-cursor')) el.setAttribute('data-cursor', label); });
    }
    tag('.book-btn', 'Book');
    tag('#copy', 'Copy');
    tag('a[href$=".pdf"]', 'PDF');
    tag('a[href^="mailto"]', 'Mail');
    tag('a[href^="http"]', 'Open');
    tag('.frame', 'Jump');
    tag('a[href^="#"]', 'Go');

    document.addEventListener('pointerover', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-cursor], #name') : null;
      if (t === cTarget) return;
      cTarget = t;
      setCursor(t);
    });
    document.addEventListener('pointerdown', function () { M.down = true; });
    document.addEventListener('pointerup', function () { M.down = false; });
    root.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); M.on = false; });
    root.addEventListener('mouseenter', function () { cursor.classList.remove('is-hidden'); });
  }

  function setCursor(t) {
    cursor.classList.remove('is-link', 'is-name');
    clearInterval(cCycle);
    if (!t) { cLabel.textContent = ''; return; }
    if (t.id === 'name') {
      cursor.classList.add('is-name');
      var order = [1, 4, 7, 5, 0, 2, 6, 9, 3], n = 0;
      var tick = function () {
        var g = GREET[order[n++ % order.length]];
        cLabel.textContent = g[0];
        cLabel.setAttribute('lang', g[2]);
      };
      tick();
      cCycle = setInterval(tick, 650);
    } else {
      cursor.classList.add('is-link');
      cLabel.textContent = t.getAttribute('data-cursor');
      cLabel.removeAttribute('lang');
    }
  }

  function writeCursor() {
    if (!cursor) return;
    R.x = lerp(R.x, M.x, 0.2);
    R.y = lerp(R.y, M.y, 0.2);
    cDot.style.transform = 'translate3d(' + M.x + 'px,' + M.y + 'px,0)';
    cRing.style.transform = 'translate3d(' + R.x.toFixed(1) + 'px,' + R.y.toFixed(1) + 'px,0) scale(' + (M.down ? 0.84 : 1) + ')';
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    M.x = e.clientX;
    M.y = e.clientY;
    if (!M.on) {
      M.on = true;
      R.x = M.x; R.y = M.y;
      if (cursor) cursor.classList.remove('is-hidden');
    }
    var t = e.target && e.target.closest ? e.target.closest('[data-spot]') : null;
    if (t) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  }, { passive: true });

  /* ── copy email ──────────────────────────────────────── */
  (function copyMail() {
    var btn = $('#copy'), mail = $('#mail');
    if (!btn || !mail) return;
    var label = btn.textContent;
    function done() {
      btn.textContent = 'Copied';
      if (cursor && cTarget === btn) cLabel.textContent = 'Copied';
      setTimeout(function () {
        btn.textContent = label;
        if (cursor && cTarget === btn) cLabel.textContent = 'Copy';
      }, 1800);
    }
    btn.addEventListener('click', function () {
      var address = mail.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, function () { btn.textContent = 'Press Ctrl+C'; });
      } else {
        var t = document.createElement('textarea');
        t.value = address;
        body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
        body.removeChild(t);
      }
    });
  })();

  /* ── spine: which chapter you're in ──────────────────── */
  (function spine() {
    var links = $$('.spine nav a');
    if (!links.length || !hasIO) return;
    var map = {};
    links.forEach(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      if (el) map[el.id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = map[e.target.id];
        if (a && e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('on'); });
          a.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* ── reveals, word-split headings, count-ups ─────────── */
  function reveal() {
    if (reduce || !hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    $$('.case, .roles > li, .tk, .services li').forEach(function (el) {
      el.classList.add('rise');
      io.observe(el);
    });
  }

  function splitHeads() {
    if (reduce || !hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('main h2, .case h3').forEach(function (h) {
      var text = h.textContent.replace(/\s+/g, ' ').trim();
      h.setAttribute('aria-label', text);
      h.innerHTML = text.split(' ').map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span class="wi" style="--d:' + i + '">' + esc(w) + '</span></span>';
      }).join(' ');
      h.classList.add('split');
      io.observe(h);
    });
  }

  function countUps() {
    if (reduce || !hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var d = e.target._count, t0 = performance.now();
        (function tick(now) {
          var k = ease(clamp((now - t0) / 1100, 0, 1));
          var v = Math.round(d.to * k);
          d.node.nodeValue = (d.comma ? v.toLocaleString('en-US') : String(v)) + d.rest;
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    $$('.metrics b').forEach(function (b) {
      var node = b.firstChild;
      if (!node || node.nodeType !== 3) return;
      if (/[–\/]/.test(b.textContent)) return;          // ranges and ratios stay as written
      var m = /^(\d[\d,]*)(.*)$/.exec(node.nodeValue);
      if (!m) return;
      var to = parseInt(m[1].replace(/,/g, ''), 10);
      if (to < 2) return;
      b._count = { node: node, to: to, rest: m[2], comma: m[1].indexOf(',') > -1 };
      node.nodeValue = '0' + m[2];
      io.observe(b);
    });
  }

  /* ── contact: a hello that changes language ──────────── */
  function helloCycle() {
    var w = $('#helloWord'), l = $('#helloLang');
    if (!w || !l || reduce || !hasIO) return;
    var order = [1, 0, 4, 7, 2, 5, 9, 3, 6, 8, 10, 11, 12], i = 0, vis = false, hover = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(w);
    w.parentElement.addEventListener('pointerenter', function () { hover = true; });
    w.parentElement.addEventListener('pointerleave', function () { hover = false; });
    setInterval(function () {
      if (!vis || hover || document.hidden) return;
      i = (i + 1) % order.length;
      var g = GREET[order[i]];
      w.classList.add('swap');
      setTimeout(function () {
        w.textContent = g[0];
        w.setAttribute('lang', g[2]);
        l.textContent = g[1];
        w.classList.remove('swap');
      }, 280);
    }, 1800);
  }

  /* ── hero: parallax with the pointer, split on scroll ── */
  var depthEls = $$('#hero [data-depth]');
  var lines = nameEl ? $$('.line', nameEl) : [];
  var letterRects = null;

  function readLetters() {
    letterRects = null;
    if (!letters.length || !fine || reduce || S.y > vh) return;
    letterRects = letters.map(function (L) { return L.el.getBoundingClientRect(); });
  }
  function writeLetters() {
    if (!letterRects) return;
    for (var i = 0; i < letters.length; i++) {
      var L = letters[i], r = letterRects[i];
      var dx = M.x - (r.left + r.width / 2), dy = M.y - (r.top + r.height / 2);
      var k = M.on ? clamp(1 - Math.sqrt(dx * dx + dy * dy) / 260, 0, 1) : 0;
      k = k * k * (3 - 2 * k);
      var nw = lerp(L.w, 800 - 500 * k, 0.2), nwd = lerp(L.wd, 100 - 24 * k, 0.2);
      if (Math.abs(nw - L.w) > 0.4 || Math.abs(nwd - L.wd) > 0.05) {
        L.w = nw; L.wd = nwd;
        L.el.style.fontVariationSettings = '"wght" ' + nw.toFixed(0) + ', "wdth" ' + nwd.toFixed(1) + ', "opsz" 96';
      }
    }
  }
  function writeHero() {
    if (reduce || S.y > vh * 1.3) return;
    var p = clamp(S.y / (vh * 0.9), 0, 1);
    var mx = fine ? M.sx / vw - 0.5 : 0, my = fine ? M.sy / vh - 0.5 : 0;
    for (var i = 0; i < depthEls.length; i++) {
      var el = depthEls[i], d = +el.getAttribute('data-depth');
      var x = -mx * d * 16, y = -my * d * 10, o;
      var li = lines.indexOf(el);
      if (li > -1) { x += (li === 0 ? -1 : 1) * p * vw * 0.18; o = 1 - p * 0.9; }
      else { y -= p * d * 70; o = 1 - p * 0.95; }
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      el.style.opacity = o.toFixed(3);
    }
  }

  /* ── ticker: follows scroll direction and speed ──────── */
  var tape = $('.tape'), tapeX = 0, tapeW = 0, tapeHover = false;
  if (tape && !reduce) {
    tape.classList.add('js');
    tape.parentElement.addEventListener('pointerenter', function () { tapeHover = true; });
    tape.parentElement.addEventListener('pointerleave', function () { tapeHover = false; });
  }
  function writeTicker(dt) {
    if (!tape || reduce || !tapeW || S.y > vh * 1.5) return;
    var speed = tapeHover ? 0 : 0.05 + Math.min(Math.abs(S.v) * 0.03, 1.6);
    tapeX -= speed * dt * S.dir;
    if (tapeX <= -tapeW) tapeX += tapeW;
    if (tapeX > 0) tapeX -= tapeW;
    tape.style.transform = 'translate3d(' + tapeX.toFixed(1) + 'px,0,0)';
  }

  /* ── band: moves with scroll, skews with speed ───────── */
  var band = $('#band'), bandW = 0, bandTop = 0;
  function writeBand() {
    if (!band || reduce || !bandW) return;
    var rel = S.y + vh - bandTop;
    if (rel < -200 || rel > vh * 2 + 400) return;
    var off = ((rel * 0.5) % bandW + bandW) % bandW;
    var skew = clamp(S.v * 0.4, -10, 10);
    band.style.transform = 'translate3d(' + (-off).toFixed(1) + 'px,0,0) skewX(' + (-skew).toFixed(2) + 'deg)';
  }

  /* ── storyboard ──────────────────────────────────────── */
  var story = $('.story'), machine = $('#machine');
  var caps = $$('.cap'), frames = $$('.frame');
  var sumEl = $('#sumText'), sumFull = sumEl ? sumEl.textContent : '', sumN = -1;
  var storyTop = 0, storyH = 0, stageH = 0, storyIdx = -1;
  var FR = [[0, 0.22], [0.22, 0.47], [0.47, 0.73], [0.73, 1]];
  var JUMP = [0.14, 0.44, 0.71, 0.94];
  var lastVars = '';
  var phoneStory = window.matchMedia('(max-width: 899px)');
  // where each frame's subject sits inside the 44x36em stage, as a fraction
  var FOCUS = [[0.32, 0.33], [0.80, 0.29], [0.31, 0.82], [0.80, 0.73]];
  function panMachine(idx) {
    if (!machine) return;
    if (!phoneStory.matches) { if (machine.style.transform) machine.style.transform = ''; return; }
    var wrap = machine.parentElement;
    var cap = $('figcaption', wrap);
    var ww = wrap.clientWidth, wh = wrap.clientHeight - (cap ? cap.offsetHeight : 0);
    var mw = machine.offsetWidth, mh = machine.offsetHeight;
    if (!ww || !mw) return;
    var f = FOCUS[idx] || FOCUS[0];
    var tx = clamp(ww / 2 - f[0] * mw, Math.min(0, ww - mw), 0);
    var ty = clamp(wh / 2 - f[1] * mh, Math.min(0, wh - mh), 0);
    machine.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
  }
  var pinnedStory = false;
  if (story && machine) {
    if (phoneStory.matches) buildStackedStory(); else { story.classList.add('pinned'); pinnedStory = true; }
    // crossing the phone/desktop boundary swaps the whole mechanism; rebuild cleanly
    if (phoneStory.addEventListener) phoneStory.addEventListener('change', function () { window.location.reload(); });
  }

  /* phones get the frames stacked: no sticky, no scroll maths, nothing to desync */
  function buildStackedStory() {
    var note = $('figcaption', machine.parentElement);
    caps.forEach(function (cap, i) {
      var art = document.createElement('div');
      art.className = 'cap-art';
      art.setAttribute('aria-hidden', 'true');
      var m = machine.cloneNode(true);
      m.removeAttribute('id');
      $$('[id]', m).forEach(function (el) { el.removeAttribute('id'); });
      var sum = $('.sum-text', m);
      if (sum) sum.textContent = sumFull;
      m.style.setProperty('--f1', '1');
      m.style.setProperty('--f2', i >= 1 ? '1' : '0');
      m.style.setProperty('--f3', i >= 2 ? '1' : '0');
      m.style.setProperty('--f4', i >= 3 ? '1' : '0');
      if (i >= 1) m.classList.add('s2');
      if (i === 2) m.classList.add('s3');
      art.appendChild(m);
      cap.appendChild(art);
      if (i === caps.length - 1 && note) {
        var n = document.createElement('p');
        n.className = 'cap-note';
        n.textContent = note.textContent;
        cap.appendChild(n);
      }
    });
    requestAnimationFrame(panClones);
  }
  function panClones() {
    $$('.cap-art').forEach(function (art, i) {
      var m = art.firstElementChild;
      if (!m) return;
      var f = FOCUS[i] || FOCUS[0];
      var mw = m.offsetWidth, mh = m.offsetHeight;
      if (!mw || !art.clientWidth) return;
      var tx = clamp(art.clientWidth / 2 - f[0] * mw, Math.min(0, art.clientWidth - mw), 0);
      var ty = clamp(art.clientHeight / 2 - f[1] * mh, Math.min(0, art.clientHeight - mh), 0);
      m.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
    });
  }

  function writeStory(force) {
    if (!story || !machine || !pinnedStory) return;
    if (!force && (S.y < storyTop - vh * 1.2 || S.y > storyTop + storyH)) return;
    var span = storyH - (stageH || vh);
    var p = span > 0 ? clamp((S.y - storyTop) / span, 0, 1) : 1;
    var f1 = ramp(p, 0, 0.12), f2 = ramp(p, 0.25, 0.42), f3 = ramp(p, 0.5, 0.7), f4 = ramp(p, 0.76, 0.92);
    var key = f1.toFixed(3) + f2.toFixed(3) + f3.toFixed(3) + f4.toFixed(3);
    if (key !== lastVars) {
      lastVars = key;
      var ms = machine.style;
      ms.setProperty('--f1', f1.toFixed(3));
      ms.setProperty('--f2', f2.toFixed(3));
      ms.setProperty('--f3', f3.toFixed(3));
      ms.setProperty('--f4', f4.toFixed(3));
      machine.classList.toggle('s2', f2 > 0.5);
      machine.classList.toggle('s3', f3 > 0.02 && f4 < 0.98);
      frames.forEach(function (f, i) { f.style.setProperty('--b', ramp(p, FR[i][0], FR[i][1]).toFixed(3)); });
    }
    var idx = p < FR[1][0] ? 0 : p < FR[2][0] ? 1 : p < FR[3][0] ? 2 : 3;
    if (idx !== storyIdx) {
      storyIdx = idx;
      caps.forEach(function (c, i) { c.classList.toggle('on', i === idx); });
      panMachine(idx);
      frames.forEach(function (f, i) {
        f.classList.toggle('on', i === idx);
        if (i === idx) f.setAttribute('aria-current', 'step'); else f.removeAttribute('aria-current');
      });
    }
    if (sumEl) {
      var n = Math.round(ramp(p, 0.54, 0.72) * sumFull.length);
      if (n !== sumN) { sumN = n; sumEl.textContent = sumFull.slice(0, n); }
    }
  }
  frames.forEach(function (f, i) {
    f.addEventListener('click', function () {
      window.scrollTo({ top: storyTop + JUMP[i] * (storyH - (stageH || vh)), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── case studies: sticky number with a reading rail ── */
  var cases = $$('.case').map(function (c) {
    var no = $('.case-no', c);
    if (no) {
      var rail = document.createElement('span');
      rail.className = 'case-rail';
      rail.setAttribute('aria-hidden', 'true');
      rail.innerHTML = '<i></i>';
      no.appendChild(rail);
    }
    return { el: c, r: null, cp: -1 };
  });
  function readCases() { for (var i = 0; i < cases.length; i++) cases[i].r = cases[i].el.getBoundingClientRect(); }
  function writeCases() {
    for (var i = 0; i < cases.length; i++) {
      var c = cases[i], r = c.r;
      if (!r || r.bottom < -vh || r.top > vh * 2) continue;
      var cp = clamp((vh * 0.4 - r.top) / Math.max(1, r.height - vh * 0.3), 0, 1);
      if (Math.abs(cp - c.cp) > 0.002) { c.cp = cp; c.el.style.setProperty('--cp', cp.toFixed(3)); }
    }
  }

  /* ── magnetic controls ───────────────────────────────── */
  var mags = (fine && !reduce) ? $$('.book-btn, .copy, .case-links a, .elsewhere a, .spine-mark').map(function (el) {
    return { el: el, x: 0, y: 0 };
  }) : [];
  function readMags() { return mags.map(function (m) { return m.el.getBoundingClientRect(); }); }
  function writeMags(rects) {
    for (var i = 0; i < mags.length; i++) {
      var m = mags[i], r = rects[i], tx = 0, ty = 0;
      if (M.on && r.bottom > -60 && r.top < vh + 60) {
        var cx = r.left + r.width / 2 - m.x, cy = r.top + r.height / 2 - m.y;
        var dx = M.x - cx, dy = M.y - cy, reach = Math.max(r.width, r.height) * 0.5 + 36;
        if (Math.abs(dx) < reach && Math.abs(dy) < reach) { tx = dx * 0.28; ty = dy * 0.34; }
      }
      m.x = lerp(m.x, tx, 0.16);
      m.y = lerp(m.y, ty, 0.16);
      if (tx === 0 && ty === 0 && Math.abs(m.x) < 0.05 && Math.abs(m.y) < 0.05) {
        if (m.el.style.transform) m.el.style.transform = '';
        m.x = m.y = 0;
        continue;
      }
      m.el.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)';
    }
  }
  if (fine && !reduce) $$('.metrics li, .tk, .services li').forEach(function (el) { el.setAttribute('data-spot', ''); });

  /* ═══ the seam: day ⇄ night ═══════════════════════════ */
  var zones = $$('[data-night]'), zoneRects = [];
  var nightAmt = 0, nightTarget = 0, lastAmt = '';
  function readNight() { zoneRects = zones.map(function (z) { return z.getBoundingClientRect(); }); }
  function calcNight() {
    var bandH = vh * 0.45, max = 0;
    for (var i = 0; i < zoneRects.length; i++) {
      var r = zoneRects[i];
      var a = Math.min(clamp((vh - r.top) / bandH, 0, 1), clamp(r.bottom / bandH, 0, 1));
      if (a > max) max = a;
    }
    nightTarget = max;
  }
  function writeNight() {
    nightAmt = lerp(nightAmt, nightTarget, reduce ? 1 : 0.09);
    if (Math.abs(nightAmt - nightTarget) < 0.002) nightAmt = nightTarget;
    var s = nightAmt.toFixed(3);
    if (s !== lastAmt) { lastAmt = s; root.style.setProperty('--night-amt', s); }
    var want = nightAmt > 0.5;
    if (want !== (root.getAttribute('data-ground') === 'night')) {
      root.setAttribute('data-ground', want ? 'night' : 'day');
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', want ? '#0C0D10' : '#E9E7E1');
    }
  }

  /* ── spine meter: how far, which way ─────────────────── */
  var meter = $('#meter'), dirEl = $('#dir'), lastProg = '', lastDir = '';
  function writeSpine() {
    var prog = clamp(S.y / Math.max(1, docH - vh), 0, 1), ps = prog.toFixed(3);
    if (meter && ps !== lastProg) { lastProg = ps; meter.style.transform = 'scaleY(' + ps + ')'; }
    if (dirEl) {
      var txt = Math.round(prog * 100) + '% ' + (S.dir > 0 ? '↓' : '↑');
      if (txt !== lastDir) { lastDir = txt; dirEl.textContent = txt; }
    }
  }

  /* ═══ the object: a knot in the day, a cloud at night ══ */
  var canvas = $('#field');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, N = fine ? 620 : 360;
  var knot = [], cloud = [], curve = [], alpha = [];
  var spin = 0;

  function knotPoint(t) {             // a (2,3) torus knot, roughly unit radius
    var r = Math.cos(3 * t) + 2.2;
    return [r * Math.cos(2 * t) / 3.2, r * Math.sin(2 * t) / 3.2, -Math.sin(3 * t) * 0.38];
  }
  function seedField() {
    for (var i = 0; i < N; i++) {
      var kp = knotPoint((i / N) * Math.PI * 2), j = 0.16;
      knot.push([kp[0] + (Math.random() - 0.5) * j, kp[1] + (Math.random() - 0.5) * j, kp[2] + (Math.random() - 0.5) * j]);
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), rr = 0.82 + Math.random() * 0.34;
      cloud.push([s * Math.cos(th) * rr, u * rr, s * Math.sin(th) * rr]);
      alpha.push(0.3 + Math.random() * 0.7);
    }
    for (var c = 0; c <= 260; c++) curve.push(knotPoint((c / 260) * Math.PI * 2));
  }
  function sizeField() {
    if (!canvas) return;
    W = canvas.width = Math.max(1, Math.floor(vw * dpr));
    H = canvas.height = Math.max(1, Math.floor(vh * dpr));
  }
  function drawField(dt) {
    if (!ctx || lightweight) return;
    ctx.clearRect(0, 0, W, H);
    if (reduce) return;

    var heroP = S.y < vh * 1.1 ? 1 - ramp(S.y, 0, vh * 0.85) : 0;
    var nightP = nightAmt;
    if (heroP < 0.01 && nightP < 0.01) return;

    spin += dt * 0.00016 * (1 + Math.min(Math.abs(S.v) * 0.12, 5)) * S.dir;
    var tx = fine ? (M.sy / vh - 0.5) * 0.7 : 0.18;
    var ty = fine ? (M.sx / vw - 0.5) * 0.9 : 0;
    var a = spin + ty, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(tx), sb = Math.sin(tx);
    var narrow = vw < 860;
    var mx = M.sx * dpr, my = M.sy * dpr, rep = (fine && M.on) ? 120 * dpr : 0;

    var knotMode = heroP >= nightP;
    var pres = knotMode ? heroP * (narrow ? 0.5 : 1) : nightP;
    var cx, cy, R, pts, scale, rgb;
    if (knotMode) {
      cx = W * (narrow ? 0.66 : 0.76); cy = H * (narrow ? 0.26 : 0.30);
      R = Math.min(W, H) * (narrow ? 0.26 : 0.25);
      scale = 1 + (1 - heroP) * 2.4; pts = knot; rgb = '22,23,27';
    } else {
      cx = W * (narrow ? 0.5 : 0.8); cy = H * 0.5; R = Math.min(W, H) * (narrow ? 0.34 : 0.27);
      scale = 1 + (1 - nightP) * 1.6; pts = cloud; rgb = '109,135,255';
    }
    var FOV = 2.6, o = [0, 0, 0];

    function project(p) {
      var x = p[0], y = p[1], z = p[2];
      var x1 = x * ca - z * sa, z1 = x * sa + z * ca;
      var y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
      var d = Math.min(1.6, FOV / (FOV + z2));
      o[0] = cx + x1 * R * d * scale; o[1] = cy + y1 * R * d * scale; o[2] = d;
      if (rep) {
        var dx = o[0] - mx, dy = o[1] - my, dd = dx * dx + dy * dy;
        if (dd < rep * rep && dd > 1) {
          var dl = Math.sqrt(dd), f = (1 - dl / rep) * 34 * dpr;
          o[0] += dx / dl * f; o[1] += dy / dl * f;
        }
      }
    }

    if (knotMode) {
      ctx.beginPath();
      for (var c = 0; c < curve.length; c++) {
        project(curve[c]);
        if (c === 0) ctx.moveTo(o[0], o[1]); else ctx.lineTo(o[0], o[1]);
      }
      ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.22 * pres * pres).toFixed(3) + ')';
      ctx.lineWidth = dpr;
      ctx.stroke();
    }
    for (var i = 0; i < pts.length; i++) {
      project(pts[i]);
      var al = alpha[i] * o[2] * o[2] * (knotMode ? 0.75 : (narrow ? 0.4 : 0.6)) * pres;
      if (al < 0.01) continue;
      ctx.fillStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(o[0], o[1], Math.max(0.5, o[2] * (knotMode ? 1.25 : 1.5) * dpr), 0, 6.2832);
      ctx.fill();
    }
    if (!knotMode) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.22, R * 0.3, 0, 0, 6.2832);
      ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.13 * pres).toFixed(3) + ')';
      ctx.lineWidth = dpr;
      ctx.stroke();
    }
  }

  /* ── layout cache ────────────────────────────────────── */
  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    docH = root.scrollHeight;
    if (story) {
      storyTop = story.getBoundingClientRect().top + window.scrollY;
      storyH = story.offsetHeight;
      var stageEl = $('.story-stage');          // the pinned stage is 100svh; window height is not
      if (stageEl) stageH = stageEl.offsetHeight;
    }
    if (band) { bandW = band.scrollWidth / 2; bandTop = band.parentElement.getBoundingClientRect().top + window.scrollY; }
    if (tape) tapeW = tape.scrollWidth / 2;
    sizeField();
    lastVars = '';
    writeStory(true);
    if (pinnedStory) panMachine(storyIdx < 0 ? 0 : storyIdx); else panClones();
  }

  /* ── one loop: read everything, then write everything ─ */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(64, (now - last) || 16);
    last = now;

    S.y = window.scrollY;
    var raw = S.y - S.py;
    S.py = S.y;
    S.v = lerp(S.v, raw, 0.22);
    if (Math.abs(raw) > 0.6) S.dir = raw > 0 ? 1 : -1;
    M.sx = lerp(M.sx, M.x, 0.1);
    M.sy = lerp(M.sy, M.y, 0.1);

    readNight();
    readLetters();
    readCases();
    var magRects = readMags();

    calcNight();
    writeNight();
    writeLetters();
    writeHero();
    writeTicker(dt);
    writeBand();
    writeStory(false);
    writeCases();
    writeMags(magRects);
    writeSpine();
    writeCursor();
    drawField(dt);

    requestAnimationFrame(frame);
  }

  /* ── boot ────────────────────────────────────────────── */
  initCursor();
  splitHeads();
  reveal();
  countUps();
  helloCycle();
  if (lightweight && canvas) canvas.style.display = 'none';
  if (!lightweight) seedField();
  measure();
  readNight(); calcNight(); nightAmt = nightTarget; writeNight();
  runIntro(function () { setTimeout(enterName, 160); });
  requestAnimationFrame(frame);

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
  // phones resize the visible area when the browser bars slide away
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
  }
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
