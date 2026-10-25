/* ============================================================
   BAEZPAN — interacciones de la web (solo frontend)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     0. TARTA GIGANTE 3D (pisos cilíndricos + glaseado + velas)
     ---------------------------------------------------------- */
  (function buildCake() {
    const el = document.getElementById('cake3d');
    if (!el) return;

    const TAU = Math.PI * 2;
    let seed = 20261025;                          // semilla fija: siempre la misma tarta
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

    // Luz desde delante-arriba-izquierda: da volumen a cada cara
    const shade = a => {
      const r = a * Math.PI / 180;
      const dot = Math.sin(r) * -0.45 + Math.cos(r) * 0.9;
      return (0.82 + 0.30 * Math.max(0, dot)).toFixed(3);
    };

    const TIERS = [
      { R: 158, H: 118, top: 12,  sides: 64, wall: 'linear-gradient(180deg,#ff9dbc,#ff7ea8)', icing: '#fff7ec' },
      { R: 104, H: 96,  top: -84, sides: 48, wall: 'linear-gradient(180deg,#fff6ea,#f6e0c4)', icing: '#ff8fb6' }
    ];
    const SPRINKLE_COLORS = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#8ac926', '#ff9f1c', '#a78bfa'];

    // Panel rectangular colocado sobre la pared del cilindro (radio z, altura y)
    const panel = (w, h, y, z, cls, bg, a) => `
        <span class="face${cls}" style="
          width:${w.toFixed(2)}px;height:${h.toFixed(2)}px;
          margin-left:${(-w / 2).toFixed(2)}px;margin-top:${(-h / 2).toFixed(2)}px;
          background:${bg};filter:brightness(${shade(a)});
          transform:translate3d(0px,${y.toFixed(2)}px,0px) rotateY(${a.toFixed(1)}deg) translateZ(${z.toFixed(2)}px);
        "></span>`;

    let html = '';

    TIERS.forEach((tier, idx) => {
      const { R, H, top, sides, wall, icing } = tier;
      const cy = top + H / 2;
      const segW = (TAU * R) / sides + 1.8;       // solape: sin huecos entre caras
      const isTop = idx === TIERS.length - 1;

      // Pared del piso
      for (let i = 0; i < sides; i++) {
        html += panel(segW, H, cy, R, '', wall, (360 / sides) * i);
      }

      // Banda de glaseado en el borde superior
      const bandH = 24;
      for (let i = 0; i < sides; i++) {
        html += panel(segW, bandH, top + bandH / 2, R + 0.6, '', icing, (360 / sides) * i);
      }

      // Gotas del glaseado que escurren por la pared
      for (let i = 0; i < sides; i++) {
        const h = 8 + rnd() * 30;
        const w = segW * 0.9;
        html += panel(w, h, top + bandH + h / 2 - 3, R + 0.8, ' drip', icing,
                      (360 / sides) * i + 180 / sides);
      }

      // Tapa horizontal del piso (sobre ella viven los sprinkles)
      let sprinkles = '';
      if (isTop) {
        for (let i = 0; i < 42; i++) {
          const ang = rnd() * TAU;
          const d = 22 + rnd() * (R - 46);
          const c = SPRINKLE_COLORS[Math.floor(rnd() * SPRINKLE_COLORS.length)];
          sprinkles += `<i class="sprinkle" style="
            left:${(R + Math.cos(ang) * d).toFixed(1)}px;top:${(R + Math.sin(ang) * d).toFixed(1)}px;
            background:${c};transform:translate(-50%,-50%) rotate(${Math.floor(rnd() * 180)}deg);
          "></i>`;
        }
      }
      html += `<span class="face cap" style="
          width:${2 * R}px;height:${2 * R}px;margin-left:${-R}px;margin-top:${-R}px;
          background:radial-gradient(circle at 36% 30%, #fffdf9, #fff3f7 52%, #ffe6ef 100%);
          transform:translate3d(0px,${top}px,0px) rotateX(90deg);
        ">${sprinkles}</span>`;
    });

    // Plato (disco + canto fino para que se vea el grosor)
    const PR = 188;
    const plateSeg = (TAU * PR) / 64 + 1.8;
    for (let i = 0; i < 64; i++) {
      html += panel(plateSeg, 9, 137, PR, '', 'linear-gradient(180deg,#f7efe6,#e6d9c8)', (360 / 64) * i);
    }
    html += `<span class="face plate" style="
        width:${2 * PR}px;height:${2 * PR}px;margin-left:${-PR}px;margin-top:${-PR}px;
        background:radial-gradient(circle at 38% 32%, #ffffff, #f8f0e7 56%, #eaded0 100%);
        transform:translate3d(0px,134px,0px) rotateX(90deg);
      "></span>`;

    // Tres velas encendidas sobre la tarta
    [[-48, 12], [0, -26], [48, 16]].forEach(([x, z]) => {
      html += `<span class="candle" style="transform:translate3d(${x}px,-84px,${z}px)">
          <i class="wax w1"></i><i class="wax w2"></i>
          <i class="flame-wrap fw1"><b class="flame"></b></i>
          <i class="flame-wrap fw2"><b class="flame"></b></i>
        </span>`;
    });

    el.innerHTML = html;
  })();

  /* ----------------------------------------------------------
     1. DATOS DE PRODUCTOS (catálogo)
     ---------------------------------------------------------- */
  const PRODUCTS = [
    {
      id: 'candeal', cat: 'pan', emoji: '🍞', name: 'Pan candeal',
      short: 'Nuestro especialidad: miga tierna y corteza dorada.',
      desc: 'El pan candeal es nuestra firma. Miga blanca y tierna, corteza fina y dorada, elaborado cada día con harina natural y fermentación lenta. Es el pan de toda la vida en Móstoles.',
      tags: ['Miga tierna', 'Diario', 'Harina natural'],
      features: ['Harina 100% natural', 'Fermentación lenta', 'Horno propio', 'Recién hecho cada mañana'],
      meta: [['Ideal para', 'Acompañar y desayunar'], ['Disponibilidad', 'Todos los días'], ['Conservación', '2-3 días en paño']],
      best: 'Muy pedido'
    },
    {
      id: 'hogaza', cat: 'pan', emoji: '🥖', name: 'Hogaza artesana',
      short: 'Corteza crujiente y miga con carácter.',
      desc: 'Hogaza grande de elaboración tradicional, con corteza crujiente y miga aromática. Perfecta para compartir en familia y para acompañar cualquier comida.',
      tags: ['Corteza crujiente', 'Grande', 'Tradicional'],
      features: ['Corteza crujiente', 'Miga aromática', 'Formato familiar', 'Hecha a mano'],
      meta: [['Ideal para', 'Comidas en familia'], ['Disponibilidad', 'Según elaboración'], ['Peso', 'Formato grande']],
      best: 'Tradicional'
    },
    {
      id: 'integral', cat: 'pan', emoji: '🌾', name: 'Pan integral',
      short: 'Sano, con semillas y mucho sabor.',
      desc: 'Pan integral con semillas, elaborado con productos naturales. Una opción más ligera y llena de sabor para tu día a día.',
      tags: ['Integral', 'Con semillas', 'Natural'],
      features: ['Sin aditivos', 'Con semillas', 'Miga densa', 'Elaboración propia'],
      meta: [['Ideal para', 'Desayunos y dietas'], ['Disponibilidad', 'Consultar en tienda'], ['Sabor', 'Intenso y natural']],
      best: 'Sano'
    },
    {
      id: 'baguette', cat: 'pan', emoji: '🥖', name: 'Baguettes y chapata',
      short: 'Crujientes por fuera, tiernas por dentro.',
      desc: 'Baguetes, chapatas y catalanas recién hechas. Crujientes por fuera y tiernas por dentro, ideales para bocadillos o para acompañar.',
      tags: ['Crujiente', 'Bocadillos', 'Variados'],
      features: ['Crujiente exterior', 'Tierna interior', 'Varios formatos', 'A diario'],
      meta: [['Ideal para', 'Bocadillos'], ['Disponibilidad', 'Cada día'], ['Tipos', 'Baguette, chapata, catalana']],
      best: 'Versátil'
    },
    {
      id: 'bolleria', cat: 'bolleria', emoji: '🥐', name: 'Bollería artesana',
      short: 'Croissants, ensaimadas y caracolas.',
      desc: 'Gran surtido de bollería recién hecha cada mañana, elaborada a mano en nuestro obrador: croissants, ensaimadas, caracolas y mucho más.',
      tags: ['Croissants', 'Ensaimadas', 'Caracolas'],
      features: ['Hecha cada mañana', 'Mantequilla natural', 'Horneado propio', 'Gran surtido'],
      meta: [['Ideal para', 'Desayuno y merienda'], ['Disponibilidad', 'Diaria, hasta agotar'], ['Consejo', 'Ven temprano']],
      best: 'Más pedido'
    },
    {
      id: 'tartas', cat: 'pasteleria', emoji: '🎂', name: 'Tartas por encargo',
      short: 'Personalizadas para tu celebración.',
      desc: 'Tartas y pasteles por encargo para cumpleaños, bautizos, comuniones y cualquier ocasión especial. Cuéntanos tu idea y la preparamos a tu gusto.',
      tags: ['Por encargo', 'Personalizadas', 'Celebraciones'],
      features: ['Diseño personalizado', 'Rellenos a elegir', 'Mensaje escrito', '48 h de antelación'],
      meta: [['Ideal para', 'Cumpleaños y fiestas'], ['Pedido', 'Mínimo 48 horas'], ['Tamaños', 'Varios']],
      best: 'Especial'
    },
    {
      id: 'pasteles', cat: 'pasteleria', emoji: '🧁', name: 'Pasteles y bizcochos',
      short: 'Piezas pequeñas para cualquier antojo.',
      desc: 'Pasteles, bizcochos y pequeñas elaboraciones para completar la mesa o para un buen merendar. Elaborados a diario con productos naturales.',
      tags: ['Bizcochos', 'Piezas', 'Merienda'],
      features: ['Elaboración diaria', 'Productos naturales', 'Variedad', 'A buen precio'],
      meta: [['Ideal para', 'Meriendas'], ['Disponibilidad', 'Cada día'], ['Opciones', 'Bizcocho, pastel...']],
      best: 'Diario'
    },
    {
      id: 'pastas', cat: 'pasta', emoji: '🍝', name: 'Pastas caseras',
      short: 'Elaboración propia, como en casa.',
      desc: 'Pastas caseras de elaboración propia para completar tu mesa cada día. Sencillas, frescas y de confianza.',
      tags: ['Caseras', 'Elaboración propia', 'Frescas'],
      features: ['Hechas a mano', 'Frescas', 'Variedad', 'Elaboración propia'],
      meta: [['Ideal para', 'Comidas de cada día'], ['Disponibilidad', 'Consultar en tienda'], ['Tipo', 'Casera']],
      best: 'Casero'
    }
  ];

  const STEPS = {
    1: { emoji: '🌾', name: 'Masa madre y harina', desc: 'Empezamos con harina natural y una fermentación lenta. Sin prisas: el tiempo es el mejor ingrediente y le da el sabor de siempre.', features: ['Harina natural', 'Fermentación lenta', 'Sin conservantes'], meta: [['Duración', 'Varias horas'], ['Secreto', 'El tiempo']] },
    2: { emoji: '👐', name: 'Amasado a mano', desc: 'La masa se amasa a mano hasta conseguir la textura perfecta. Es el gesto que se transmite de generación en generación en la familia.', features: ['Hecho a mano', 'Textura perfecta', 'Oficio de familia'], meta: [['Quién', 'Nuestra familia'], ['Año a año', 'Mismo gesto']] },
    3: { emoji: '🔥', name: 'Horno propio', desc: 'Cocemos en nuestro propio horno desde muy temprano. El calor y el tiempo hacen el resto para que el pan salga dorado y con su punto.', features: ['Horno en tienda', 'Desde temprano', 'Punto exacto'], meta: [['Cada día', 'Muy temprano'], ['Resultado', 'Dorado y crujiente']] },
    4: { emoji: '🧺', name: 'A tu mesa', desc: 'Sale directo al mostrador, y si no puedes venir, te lo llevamos a domicilio. Producto recién hecho, del horno a tu casa.', features: ['Recién salido', 'Servicio a domicilio', 'Recogida en tienda'], meta: [['Opciones', 'Recoger o domicilio'], ['Cuándo', 'Cada mañana']] }
  };

  const REVIEWS = [
    { stars: 5, text: 'El mejor pan candeal de Móstoles. Se nota que es hecho a mano y cada mañana está recién hecho.', who: 'Cliente de Google' },
    { stars: 5, text: 'La bollería está buenísima y el trato es muy familiar. Repetimos cada fin de semana.', who: 'Cliente de Google' },
    { stars: 4, text: 'Pedimos una tarta por encargo para un cumpleaños y quedó genial. Muy recomendable.', who: 'Cliente de Google' },
    { stars: 5, text: 'Panadería de toda la vida. Calidad, precio y trato excelente. Muy cerca de casa.', who: 'Cliente de Google' },
    { stars: 4, text: 'Buen surtido de pastas y panes. Me gusta que trabajen con productos naturales.', who: 'Cliente de Google' }
  ];

  const HOURS = [
    { day: 'Lunes',        open: '07:30', close: '14:30', o2: '17:00', c2: '20:30' },
    { day: 'Martes',       open: '07:30', close: '14:30', o2: '17:00', c2: '20:30' },
    { day: 'Miércoles',    open: '07:30', close: '14:30', o2: '17:00', c2: '20:30' },
    { day: 'Jueves',       open: '07:30', close: '14:30', o2: '17:00', c2: '20:30' },
    { day: 'Viernes',      open: '07:30', close: '14:30', o2: '17:00', c2: '20:30' },
    { day: 'Sábado',       open: '08:00', close: '14:30' },
    { day: 'Domingo',      closed: true }
  ];

  /* ----------------------------------------------------------
     2. HELPERS
     ---------------------------------------------------------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  /* ----------------------------------------------------------
     3. MENÚ MÓVIL + NAV ACTIVA
     ---------------------------------------------------------- */
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link', nav).forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  const links = $$('.nav-link');
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));
  }

  /* ----------------------------------------------------------
     4. REVEAL AL SCROLL + CONTADORES
     ---------------------------------------------------------- */
  function runCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const duration = 1200, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  const revealEls = () => $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls().forEach(el => el.classList.add('visible'));
  } else {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          $$('[data-count]', entry.target).forEach(runCounter);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    const observeAll = () => revealEls().forEach(el => { if (!el.classList.contains('visible')) revealObs.observe(el); });
    observeAll();
    window.observeReveals = observeAll;
  }

  /* ----------------------------------------------------------
     5. BARRA DE PROGRESO + BOTÓN SUBIR
     ---------------------------------------------------------- */
  const progress = $('#progress');
  const toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function onScroll() {
    const y = window.scrollY;
    if (toTop) toTop.classList.toggle('show', y > 500);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     6. MODO OSCURO
     ---------------------------------------------------------- */
  const themeToggle = $('#themeToggle'), themeIcon = $('#themeIcon');
  const savedTheme = localStorage.getItem('baezpan-theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  const syncIcon = () => { if (themeIcon) themeIcon.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'; };
  syncIcon();
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (dark) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('baezpan-theme', dark ? 'light' : 'dark');
    syncIcon();
    toast(dark ? 'Modo claro activado ☀️' : 'Modo oscuro activado 🌙');
  });

  /* ----------------------------------------------------------
     7. MODAL (detalle de productos, pasos y galería)
     ---------------------------------------------------------- */
  const modal = $('#modal');
  const mEmoji = $('#modalEmoji'), mTitle = $('#modalTitle'), mDesc = $('#modalDesc');
  const mFeat = $('#modalFeatures'), mMeta = $('#modalMeta');

  function openModal(data) {
    if (!modal) return;
    mEmoji.textContent = data.emoji;
    mTitle.textContent = data.name;
    mDesc.textContent = data.desc;
    mFeat.innerHTML = (data.features || []).map((f, i) =>
      `<span style="animation-delay:${(i * 90)}ms">${f}</span>`).join('');
    mMeta.innerHTML = (data.meta || []).map(([k, v]) =>
      `<div><span>${k}</span><b>${v}</b></div>`).join('');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBack').addEventListener('click', closeModal);
  $('#modalOrder').addEventListener('click', () => { closeModal(); toast('Completa el formulario de contacto y te llamamos 📞'); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ----------------------------------------------------------
     8. PRODUCTOS: render + filtros
     ---------------------------------------------------------- */
  const grid = $('#productGrid');
  function renderProducts() {
    grid.innerHTML = PRODUCTS.map((p, i) => `
      <button class="card reveal" data-delay="${(i % 4) + 1}" data-cat="${p.cat}" data-id="${p.id}">
        <span class="card-emoji">${p.emoji}</span>
        <h3>${p.name}</h3>
        <p>${p.short}</p>
        <ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="card-cta">Ver detalles →</div>
      </button>`).join('');
    if (window.observeReveals) window.observeReveals();
  }
  renderProducts();

  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const p = PRODUCTS.find(x => x.id === card.dataset.id);
    if (p) openModal({ emoji: p.emoji, name: p.name, desc: p.desc, features: p.features, meta: p.meta });
  });

  $$('#filters .chip').forEach(chip => chip.addEventListener('click', () => {
    $$('#filters .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    $$('#productGrid .card').forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('hidden', !show);
      if (show) { card.classList.remove('visible'); requestAnimationFrame(() => card.classList.add('visible')); }
    });
    toast(f === 'all' ? 'Mostrando todos los productos' : 'Filtro: ' + chip.textContent.trim());
  }));

  /* ----------------------------------------------------------
     9. PASOS DEL OBRADOR + GALERÍA
     ---------------------------------------------------------- */
  $$('#steps .step').forEach(btn => btn.addEventListener('click', () => {
    const s = STEPS[btn.dataset.step];
    if (s) openModal({ emoji: s.emoji, name: s.name, desc: s.desc, features: s.features, meta: s.meta });
  }));

  $$('#gallery .shot').forEach(fig => fig.addEventListener('click', () => {
    const emoji = fig.querySelector('span').textContent;
    const caption = fig.dataset.caption || '';
    const name = fig.querySelector('figcaption').textContent;
    openModal({ emoji, name, desc: caption, features: ['Elaboración propia', 'Productos naturales', 'Horno en tienda'], meta: [['Categoría', name], ['Disponibilidad', 'Consulta en tienda']] });
  }));

  /* ----------------------------------------------------------
     10. CARRUSEL DE OPINIONES
     ---------------------------------------------------------- */
  const track = $('#revTrack'), dotsBox = $('#revDots');
  let revIndex = 0, revTimer;

  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  if (track) {
    track.innerHTML = REVIEWS.map(r => `
      <div class="review">
        <div class="stars">${stars(r.stars)}</div>
        <p>“${r.text}”</p>
        <div class="who">— ${r.who}</div>
      </div>`).join('');
    dotsBox.innerHTML = REVIEWS.map((_, i) => `<button aria-label="Opinión ${i + 1}" data-i="${i}"></button>`).join('');

    const dots = $$('button', dotsBox);
    function goRev(i) {
      revIndex = (i + REVIEWS.length) % REVIEWS.length;
      track.style.transform = `translateX(-${revIndex * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('on', k === revIndex));
    }
    function autoRev() { clearInterval(revTimer); revTimer = setInterval(() => goRev(revIndex + 1), 5000); }

    $('#revPrev').addEventListener('click', () => { goRev(revIndex - 1); autoRev(); });
    $('#revNext').addEventListener('click', () => { goRev(revIndex + 1); autoRev(); });
    dots.forEach(d => d.addEventListener('click', () => { goRev(+d.dataset.i); autoRev(); }));

    // Swipe en móvil
    let startX = null;
    track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { goRev(revIndex + (dx < 0 ? 1 : -1)); autoRev(); }
      startX = null;
    });

    goRev(0); autoRev();
  }

  /* ----------------------------------------------------------
     11. FAQ (ACORDEÓN)
     ---------------------------------------------------------- */
  $$('.acc-item').forEach(item => {
    const head = $('.acc-head', item), body = $('.acc-body', item);
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.acc-item').forEach(o => { o.classList.remove('open'); $('.acc-body', o).style.maxHeight = null; });
      if (!isOpen) { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
    });
  });

  /* ----------------------------------------------------------
     12. HORARIO + ¿ABIERTO AHORA?
     ---------------------------------------------------------- */
  const schedBox = $('#schedule'), badge = $('#openBadge');
  if (schedBox) {
    const jsDay = new Date().getDay();               // 0 = domingo
    const idx = jsDay === 0 ? 6 : jsDay - 1;          // nuestro array empieza en lunes
    schedBox.innerHTML = HOURS.map((h, i) => {
      const txt = h.closed ? 'Cerrado' : `${h.open} - ${h.close}` + (h.o2 ? ` · ${h.o2} - ${h.c2}` : '');
      return `<div class="sched-row ${i === idx ? 'today' : ''}"><span>${h.day}</span><span>${txt}</span></div>`;
    }).join('');

    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const today = HOURS[idx];
    let openNow = false;
    if (!today.closed) {
      openNow = (cur >= toMin(today.open) && cur < toMin(today.close)) ||
                (today.o2 && cur >= toMin(today.o2) && cur < toMin(today.c2));
    }
    badge.textContent = openNow ? '● Abierto ahora' : '● Cerrado ahora';
    badge.classList.toggle('closed', !openNow);
  }

  /* ----------------------------------------------------------
     13. FORMULARIO DE PEDIDO (simulado)
     ---------------------------------------------------------- */
  const form = $('#orderForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input[required]', form).forEach(inp => {
      const bad = !inp.value.trim();
      inp.classList.toggle('err', bad);
      if (bad) ok = false;
    });
    const tel = form.querySelector('[name=telefono]');
    if (tel.value.trim() && !/^[0-9\s+]{7,}$/.test(tel.value.trim())) { tel.classList.add('err'); ok = false; }
    if (!ok) { toast('Revisa los campos marcados 🔴'); return; }
    toast('¡Solicitud enviada! Te llamamos pronto 🥖');
    form.reset();
  });

  /* ----------------------------------------------------------
     14. AÑO DEL FOOTER
     ---------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
