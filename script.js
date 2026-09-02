/* ============================================================
   DronéoTech — interactions
   1. Champ de points animé du hero (canvas)
   2. Animation du titre mot à mot
   3. Révélations au défilement + barre de progression
   4. Formulaire : pré-sélection de l'offre et validation
   ============================================================ */
(function () {
  'use strict';

  /* ---- ADRESSE DE RÉCEPTION DES DEMANDES ---- */
  var DESTINATAIRE = 'contact@droneotech.fr';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. Champ de points en perspective (hero)
     ========================================================== */
  (function fieldFx() {
    var cv = document.getElementById('fx');
    if (!cv || REDUCED) { return; }

    var ctx = cv.getContext('2d', { alpha: true });
    var W = 0, H = 0, dpr = 1, pts = [], visible = true, raf = null;
    var mx = 0, my = 0, tx = 0, ty = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var n = W < 720 ? 42 : (W < 1200 ? 78 : 108);
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: (Math.random() - 0.5) * 2.4,
          y: (Math.random() - 0.5) * 2.0,
          z: 0.15 + Math.random() * 0.95,
          s: 0.6 + Math.random() * 0.9
        });
      }
    }

    function frame() {
      raf = null;
      if (!visible) { return; }

      ctx.clearRect(0, 0, W, H);
      tx += (mx - tx) * 0.045;
      ty += (my - ty) * 0.045;

      var cx = W / 2 + tx * 46;
      var cy = H / 2 + ty * 30;
      var focal = Math.min(W, 900) * 0.9;
      var proj = [];
      var i, p, k, sx, sy, a;

      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.z -= 0.0016 * p.s;
        if (p.z <= 0.12) {
          p.z = 1.1;
          p.x = (Math.random() - 0.5) * 2.4;
          p.y = (Math.random() - 0.5) * 2.0;
        }
        k = focal / (p.z * 900);
        sx = cx + p.x * 900 * k;
        sy = cy + p.y * 900 * k;
        if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) { continue; }
        a = Math.min(1, (1.1 - p.z) * 1.15);
        proj.push({ x: sx, y: sy, a: a, r: (1.15 - p.z) * 2.4 + 0.5 });
      }

      /* liaisons */
      ctx.lineWidth = 1;
      for (i = 0; i < proj.length; i++) {
        for (k = i + 1; k < proj.length; k++) {
          var dx = proj[i].x - proj[k].x, dy = proj[i].y - proj[k].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 20000) {
            var o = (1 - d2 / 20000) * 0.30 * Math.min(proj[i].a, proj[k].a);
            ctx.strokeStyle = 'rgba(120,140,255,' + o.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(proj[i].x, proj[i].y);
            ctx.lineTo(proj[k].x, proj[k].y);
            ctx.stroke();
          }
        }
      }

      /* points */
      for (i = 0; i < proj.length; i++) {
        ctx.fillStyle = 'rgba(168,182,255,' + (proj[i].a * 0.85).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(proj[i].x, proj[i].y, proj[i].r, 0, 6.2832);
        ctx.fill();
      }

      loop();
    }

    function loop() { if (!raf && visible) { raf = requestAnimationFrame(frame); } }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    /* on met l'animation en pause dès que le hero sort de l'écran */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { loop(); }
      }, { threshold: 0.02 }).observe(document.getElementById('hero'));
    }

    resize();
    loop();
  })();

  /* ==========================================================
     1 bis. Viseur thermique du hero
     Le masque circulaire de .shot-ir suit le pointeur ; à l'arrêt,
     il dérive tout seul sur une trajectoire de Lissajous.
     ========================================================== */
  (function thermalScope() {
    var hero = document.getElementById('hero');
    if (!hero || !document.getElementById('shot-ir')) { return; }

    var hint = document.getElementById('scope-hint');
    var isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) { document.body.classList.add('is-touch'); }

    if (REDUCED) { hero.classList.add('scope-on'); return; }

    var W = 0, H = 0;
    var tx = 0.62, ty = 0.56;      /* cible, en fraction du hero */
    var cx = 0.62, cy = 0.56;      /* position lissée */
    var lastMove = -1e9, t0 = performance.now();
    var visible = true, raf = null, engaged = false;

    function measure() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
    }

    function frame(now) {
      raf = null;
      if (!visible) { return; }

      /* Sans pointeur depuis 2,5 s : le viseur repart en balayage automatique */
      if (now - lastMove > 2500) {
        var t = (now - t0) / 1000;
        /* la trajectoire balaie le drone et le sol, pas le ciel vide */
        tx = 0.60 + 0.22 * Math.sin(t * 0.29);
        ty = 0.58 + 0.11 * Math.sin(t * 0.44 + 1.1);
      }

      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      hero.style.setProperty('--sx', (cx * 100).toFixed(2) + '%');
      hero.style.setProperty('--sy', (cy * 100).toFixed(2) + '%');

      loop();
    }

    function loop() { if (!raf && visible) { raf = requestAnimationFrame(frame); } }

    function point(e) {
      if (!W) { measure(); }
      var r = hero.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      lastMove = performance.now();
      if (!engaged) {
        engaged = true;
        if (hint) { hint.classList.add('gone'); }
      }
    }

    hero.addEventListener('pointermove', point, { passive: true });
    hero.addEventListener('pointerdown', point, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { loop(); }
      }, { threshold: 0.02 }).observe(hero);
    }

    measure();
    /* le viseur apparaît une fois la photo en place */
    setTimeout(function () { hero.classList.add('scope-on'); }, 700);
    loop();
  })();

  /* ==========================================================
     2. Titre du hero : apparition mot à mot
     ========================================================== */
  (function splitTitle() {
    var h1 = $('.hero h1.split');
    if (!h1 || REDUCED) { return; }
    var words = h1.textContent.trim().split(/\s+/);
    h1.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      span.style.setProperty('--wd', (140 + i * 55) + 'ms');
      h1.appendChild(span);
      if (i < words.length - 1) { h1.appendChild(document.createTextNode(' ')); }
    });
    requestAnimationFrame(function () { h1.classList.add('go'); });
  })();

  /* ==========================================================
     3. Révélations, progression du rail, section active
     ========================================================== */
  (function scrollFx() {
    var targets = $$('[data-reveal]');

    if (!('IntersectionObserver' in window) || REDUCED) {
      targets.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }

    /* section active dans le rail */
    var links = $$('#rail-index a');
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('data-sec')); });

    var bar = $('#rail-progress');
    var ticking = false;

    function onScroll() {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) { bar.style.height = (max > 0 ? (y / max) * 100 : 0) + '%'; }

        var current = -1;
        for (var i = 0; i < sections.length; i++) {
          if (sections[i] && sections[i].getBoundingClientRect().top <= window.innerHeight * 0.45) {
            current = i;
          }
        }
        links.forEach(function (a, i) { a.classList.toggle('on', i === current); });

        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ==========================================================
     4. Formulaire
     ========================================================== */
  var year = $('#year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  var select = $('#offre');
  $$('[data-offre]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (select) { select.value = link.getAttribute('data-offre'); }
    });
  });

  var form = $('#devis-form');
  if (!form) { return; }
  var note = $('#form-note');

  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var RE_TEL = /^\+?[0-9\s().-]{9,}$/;

  function setError(el, message) {
    var field = el.closest('.field');
    var box = field ? $('.err', field) : null;
    if (field) { field.classList.toggle('invalid', Boolean(message)); }
    if (box) { box.textContent = message || ''; }
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function validateField(el) {
    var v = (el.value || '').trim();

    if (el.id === 'nom') {
      return setError(el, v.length < 2 ? 'Merci d’indiquer votre nom.' : '');
    }
    if (el.id === 'contact-info') {
      if (!v) { return setError(el, 'Un téléphone ou un e-mail est nécessaire pour vous répondre.'); }
      if (!RE_EMAIL.test(v) && !RE_TEL.test(v)) {
        return setError(el, 'Format non reconnu : saisissez un numéro de téléphone ou une adresse e-mail.');
      }
      return setError(el, '');
    }
    if (el.id === 'offre') {
      return setError(el, v ? '' : 'Sélectionnez l’offre concernée.');
    }
    if (el.id === 'message') {
      return setError(el, v.length < 10 ? 'Décrivez votre besoin en quelques mots (10 caractères minimum).' : '');
    }
    return true;
  }

  var fields = ['#nom', '#contact-info', '#offre', '#message'].map(function (s) { return $(s); });

  fields.forEach(function (el) {
    el.addEventListener('blur', function () { validateField(el); });
    el.addEventListener('input', function () {
      if (el.closest('.field').classList.contains('invalid')) { validateField(el); }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (el) {
      if (!validateField(el) && !firstInvalid) { firstInvalid = el; }
    });

    if (firstInvalid) {
      note.textContent = 'Certains champs sont à corriger avant l’envoi.';
      note.className = 'form-note ko';
      firstInvalid.focus();
      return;
    }

    var sujet = 'Demande de devis — ' + $('#offre').value;
    var corps =
      'Nom : ' + $('#nom').value.trim() + '\n' +
      'Téléphone ou e-mail : ' + $('#contact-info').value.trim() + '\n' +
      'Offre concernée : ' + $('#offre').value + '\n\n' +
      'Message :\n' + $('#message').value.trim() + '\n';

    window.location.href = 'mailto:' + DESTINATAIRE +
      '?subject=' + encodeURIComponent(sujet) +
      '&body=' + encodeURIComponent(corps);

    note.textContent = 'Votre logiciel de messagerie s’ouvre avec la demande pré-remplie. Il reste à l’envoyer.';
    note.className = 'form-note ok';
  });
})();
