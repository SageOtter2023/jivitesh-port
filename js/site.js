/* ═══════════════════════════════════════════════════════════
   Two Grounds — Jivitesh Kumar
   Progressive enhancement only. With JS off the page still
   reads top to bottom in the day ground.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root   = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp  = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp   = function (a, b, t) { return a + (b - a) * t; };

  /* ── clock ───────────────────────────────────────────── */
  (function clock() {
    var a = document.getElementById('clock');
    var b = document.getElementById('clock2');
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    function tick() {
      var now = new Date();
      var full = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      if (a) a.textContent = full;
      if (b) b.textContent = full.slice(0, 5);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ── copy email ──────────────────────────────────────── */
  (function copyMail() {
    var btn  = document.getElementById('copy');
    var mail = document.getElementById('mail');
    if (!btn || !mail) return;
    var label = btn.textContent;

    btn.addEventListener('click', function () {
      var address = mail.textContent.trim();
      var done = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = label; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, function () { btn.textContent = 'Press Ctrl+C'; });
      } else {
        var t = document.createElement('textarea');
        t.value = address;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
        document.body.removeChild(t);
      }
    });
  })();

  /* ── spine: mark the section you're in ───────────────── */
  (function spine() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.spine nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;

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

  /* ── gentle reveal (added by JS so no-JS stays visible) ─ */
  (function reveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll('.case, .principles div, .roles > li, .tk, .services li');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('rise');
      io.observe(el);
    });
  })();

  /* ═══ the seam: day ⇄ night ═══════════════════════════ */
  var zones = Array.prototype.slice.call(document.querySelectorAll('[data-night]'));
  var nightAmt = 0;       // rendered value
  var nightTarget = 0;    // scroll-derived value

  function measure() {
    var vh = window.innerHeight;
    var band = vh * 0.45;
    var max = 0;

    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].getBoundingClientRect();
      var enter = clamp((vh - r.top) / band, 0, 1);
      var exit  = clamp(r.bottom / band, 0, 1);
      var amt = Math.min(enter, exit);
      if (amt > max) max = amt;
    }
    nightTarget = max;
  }

  /* ═══ ambient field ══════════════════════════════════ */
  var canvas = document.getElementById('field');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var COUNT = 520;
  var pts = [];
  var spin = 0;

  function seed() {
    pts.length = 0;
    for (var i = 0; i < COUNT; i++) {
      // even-ish distribution over a sphere shell
      var u = Math.random() * 2 - 1;
      var th = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      pts.push({
        x: s * Math.cos(th),
        y: u,
        z: s * Math.sin(th),
        r: 0.82 + Math.random() * 0.34,   // shell thickness
        w: 0.5 + Math.random(),           // wobble rate
        o: 0.25 + Math.random() * 0.75    // opacity seed
      });
    }
  }

  function size() {
    if (!canvas) return;
    W = canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    H = canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
  }

  function render(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (nightAmt < 0.012) return;

    var cx = W * 0.5;
    var cy = H * 0.5;
    var R = Math.min(W, H) * 0.30;
    var FOV = 2.4;

    // as the ground darkens the cloud gathers; on the way out it scatters
    var gather = nightAmt;
    var sc = 1 + (1 - gather) * 1.5;

    var cos = Math.cos(spin), sin = Math.sin(spin);

    for (var i = 0; i < COUNT; i++) {
      var p = pts[i];
      var wob = Math.sin(t * 0.00035 * p.w + i) * 0.05;
      var rad = (p.r + wob) * sc;

      var x = p.x * rad, y = p.y * rad, z = p.z * rad;
      var xr = x * cos - z * sin;
      var zr = x * sin + z * cos;

      var depth = FOV / (FOV + zr);
      var sx = cx + xr * R * depth;
      var sy = cy + y * R * depth * 0.92;

      var a = p.o * depth * depth * 0.85 * gather;
      if (a <= 0.008) continue;

      var size2 = Math.max(0.4, depth * 1.5 * dpr);
      ctx.beginPath();
      ctx.arc(sx, sy, size2, 0, 6.2832);
      ctx.fillStyle = 'rgba(109,135,255,' + a.toFixed(3) + ')';
      ctx.fill();
    }

    // the horizon line the cloud sits on
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 1.22, R * 0.30, 0, 0, 6.2832);
    ctx.strokeStyle = 'rgba(109,135,255,' + (0.13 * gather).toFixed(3) + ')';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  }

  /* ── one loop for everything ─────────────────────────── */
  var running = false;
  var idleFrames = 0;

  function frame(t) {
    nightAmt = lerp(nightAmt, nightTarget, reduce ? 1 : 0.085);
    if (Math.abs(nightAmt - nightTarget) < 0.002) nightAmt = nightTarget;

    root.style.setProperty('--night-amt', nightAmt.toFixed(3));

    var wantNight = nightAmt > 0.5;
    if (wantNight !== (root.getAttribute('data-ground') === 'night')) {
      root.setAttribute('data-ground', wantNight ? 'night' : 'day');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', wantNight ? '#0C0D10' : '#E9E7E1');
    }

    if (!reduce) {
      spin += 0.0013 * (0.35 + nightAmt);
      render(t || 0);
    }

    // idle out once settled: in day, or whenever the field isn't animating
    if (nightAmt === nightTarget && (reduce || nightAmt < 0.012)) {
      if (++idleFrames > 30) { running = false; return; }
    } else {
      idleFrames = 0;
    }
    requestAnimationFrame(frame);
  }

  function kick() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  /* ── wiring ──────────────────────────────────────────── */
  seed();
  size();
  measure();
  nightAmt = nightTarget;          // no flash on load
  root.style.setProperty('--night-amt', nightAmt.toFixed(3));
  if (nightAmt > 0.5) root.setAttribute('data-ground', 'night');
  kick();

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { measure(); kick(); ticking = false; });
    }
  }, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { size(); measure(); kick(); }, 120);
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) kick();
  });
})();
