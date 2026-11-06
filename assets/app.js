/* ================= Laundry Bag — landing ================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 760px)').matches;

  /* ---------- smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    var lenis = new Lenis({ duration: 1.05, smoothWheel: true, lerp: 0.1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var el = document.querySelector(a.getAttribute('href'));
          if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); }
        });
      });
    }
  }

  /* ---------- reveal on enter ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ---------- sticky nav + progress ---------- */
  var nav = document.getElementById('nav');
  var progBar = document.querySelector('#prog i');
  var journeyEl = document.getElementById('journey');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('stuck', y > 40);
    var jr = journeyEl.getBoundingClientRect();
    nav.classList.toggle('dark', jr.top <= 60 && jr.bottom > 160);
    var max = document.body.scrollHeight - innerHeight;
    progBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- hero welcome ---------- */
  if (!reduce && window.gsap) {
    gsap.from('#heroChar', { y: 60, opacity: 0, scale: .94, duration: 1.1, ease: 'power3.out', delay: .2 });
    gsap.from('.bagwrap .glowpad', { scaleX: .4, opacity: 0, duration: 1, ease: 'power2.out', delay: .4 });
    gsap.from('.hbadge', { y: 24, opacity: 0, duration: .7, stagger: .14, ease: 'back.out(1.5)', delay: .85 });
    gsap.to('#heroChar', { y: -14, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.3 });
    gsap.to('.hbadge.b-a', { y: -9, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.5 });
    gsap.to('.hbadge.b-b', { y: 9, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.7 });
  }

  /* ================= CINEMATIC JOURNEY (3D) ================= */
  var CAPS = [
    ['الغسيل مستنيك عند الباب', 'إنت بس تطلب — وإحنا نبدأ من هنا'],
    ['وإحنا في الطريق ليك', 'السواق بيستلم من باب بيتك'],
    ['جوه المغسلة', 'كل قطعة بتتعامل حسب نوع قماشها'],
    ['تتكوي وتتطوي', 'واحدة واحدة، بعناية'],
    ['وترجعلك عند نفس الباب', 'نضيفة ومكوية — في ميعادها']
  ];

  var PERSP = 1500;
  document.querySelectorAll('.layer').forEach(function (l) {
    var z = +(l.dataset.z || 0);
    var sc = (PERSP - z) / PERSP;
    l.style.transform = 'translateZ(' + z + 'px) scale(' + sc.toFixed(4) + ')';
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    var capT = document.getElementById('capT'), capS = document.getElementById('capS');
    var capBox = document.querySelector('.cap .box');
    var rail = document.querySelectorAll('#rail .r');
    var cur = -1;
    capT.textContent = CAPS[0][0]; capS.textContent = CAPS[0][1];

    function setCap(i) {
      if (i === cur) return;
      cur = i;
      capT.textContent = CAPS[i][0];
      capS.textContent = CAPS[i][1];
      gsap.killTweensOf(capBox);
      gsap.fromTo(capBox, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', overwrite: true });
      rail.forEach(function (d, n) { d.classList.toggle('on', n === i); });
    }

    gsap.set('#sc1', { opacity: 1 });

    var world = document.getElementById('world');
    var cam = { z: 0, rx: 0, ry: 0 };
    function applyCam() {
      world.style.transform =
        'translateZ(' + cam.z + 'px) rotateX(' + cam.rx + 'deg) rotateY(' + cam.ry + 'deg)';
    }

    /* mouse parallax — gentle camera tilt */
    if (!small && !reduce) {
      var stage = document.getElementById('stage');
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(cam, { ry: nx * 5.5, rx: -ny * 3.5, duration: 0.9,
          ease: 'power2.out', onUpdate: applyCam });
      });
    }

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#journey', start: 'top top',
        end: '+=' + (small ? 320 : 440) + '%',
        pin: '#stage', scrub: 0.9, anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress, i = p < .13 ? 0 : p < .373 ? 1 : p < .605 ? 2 : p < .798 ? 3 : 4;
          setCap(i);
        }
      }
    });

    /* 1 — door : camera dollies in toward the bag */
    tl.to(cam, { z: 340, duration: 1.15, ease: 'none', onUpdate: applyCam }, 0)
      .fromTo('#s1bagL img', { y: 40, opacity: 0, scale: .88 },
        { y: 0, opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.5)' }, .1);

    /* 1 -> 2 */
    tl.to('#sc1', { opacity: 0, duration: .75, ease: 'power1.inOut' }, 1.0)
      .fromTo('#sc2', { opacity: 0 }, { opacity: 1, duration: .75, ease: 'power1.inOut' }, 1.0)

    /* 2 — street : layers slide at different speeds + dolly */
    tl.to(cam, { z: 60, duration: .45, ease: 'power1.inOut', onUpdate: applyCam }, 1.15)
      .to(cam, { z: 330, duration: 2.0, ease: 'none', onUpdate: applyCam }, 1.6)
      .fromTo('#s2far svg', { x: 90 }, { x: -90, duration: 2.1, ease: 'none' }, 1.2)
      .fromTo('#s2mid svg', { x: 240 }, { x: -240, duration: 2.1, ease: 'none' }, 1.2)
      .fromTo('#s2dash', { x: 0 }, { x: -900, duration: 2.1, ease: 'none' }, 1.2)
      .fromTo('#s2van svg', { x: 420 }, { x: -120, duration: 2.1, ease: 'none' }, 1.2)
      .fromTo('#s2man img', { x: -260, opacity: 0 },
        { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }, 1.5)
      .to('#s2man img', { y: -14, duration: .5, repeat: 2, yoyo: true, ease: 'sine.inOut' }, 2.2)
      .fromTo('#s2speed svg', { x: 300, opacity: 0 },
        { x: -500, opacity: .9, duration: 1.6, ease: 'none' }, 1.6);

    /* 2 -> 3 */
    tl.to('#sc2', { opacity: 0, duration: .75, ease: 'power1.inOut' }, 3.2)
      .fromTo('#sc3', { opacity: 0 }, { opacity: 1, duration: .75, ease: 'power1.inOut' }, 3.2)

    /* 3 — laundry : push into the drum */
    tl.to(cam, { z: 90, duration: .45, ease: 'power1.inOut', onUpdate: applyCam }, 3.35)
      .to(cam, { z: 430, duration: 1.9, ease: 'none', onUpdate: applyCam }, 3.8)
      .fromTo('#s3drum', { rotate: 0 },
        { rotate: 1080, transformOrigin: '800px 514px', duration: 2.0, ease: 'none' }, 3.4)
      .fromTo('#s3bub svg circle', { y: 90, opacity: 0 },
        { y: -520, opacity: .75, stagger: .12, duration: 1.8, ease: 'none' }, 3.5)
      .fromTo('#s3steam svg g', { y: 150, opacity: 0, scale: .75 },
        { y: -110, opacity: .3, scale: 1.3, transformOrigin: '50% 50%', duration: 1.9, ease: 'none' }, 3.5);

    /* 3 -> 4 */
    tl.to('#sc3', { opacity: 0, duration: .7, ease: 'power1.inOut' }, 5.3)
      .fromTo('#sc4', { opacity: 0 }, { opacity: 1, duration: .7, ease: 'power1.inOut' }, 5.3)

    /* 4 — folding */
    tl.to(cam, { z: 20, duration: .45, ease: 'power1.inOut', onUpdate: applyCam }, 5.45)
      .to(cam, { z: 150, duration: 1.5, ease: 'none', onUpdate: applyCam }, 5.9)
      .fromTo('#s4stack .fold',
        { y: -300, opacity: 0, rotate: -9, scaleX: .55 },
        { y: 0, opacity: 1, rotate: 0, scaleX: 1, transformOrigin: '50% 50%',
          stagger: .2, duration: .7, ease: 'back.out(1.6)' }, 5.6)
      .fromTo('#s4spark svg', { opacity: 0, scale: .7 },
        { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: .6, ease: 'back.out(2)' }, 6.8);

    /* 4 -> 5 */
    tl.to('#sc4', { opacity: 0, duration: .7, ease: 'power1.inOut' }, 7.05)
      .fromTo('#sc5', { opacity: 0 }, { opacity: 1, duration: .7, ease: 'power1.inOut' }, 7.05)

    /* 5 — handover at the door */
    tl.to(cam, { z: 40, duration: .45, ease: 'power1.inOut', onUpdate: applyCam }, 7.2)
      .to(cam, { z: 300, duration: 1.7, ease: 'none', onUpdate: applyCam }, 7.65)
      .fromTo('#s5man img', { x: -220, opacity: 0 },
        { x: 0, opacity: 1, duration: .85, ease: 'power3.out' }, 7.35)
      .fromTo('#s5woman img', { x: 220, opacity: 0 },
        { x: 0, opacity: 1, duration: .85, ease: 'power3.out' }, 7.55)
      .fromTo('#s5halo svg', { opacity: 0, scale: .6 },
        { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: .9, ease: 'power2.out' }, 7.8)
      .fromTo('#s5spark svg', { opacity: 0, scale: .6 },
        { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: .7, ease: 'back.out(2)' }, 8.1);

    gsap.to('#hint', {
      opacity: 0, scrollTrigger: { trigger: '#journey', start: 'top top', end: '+=40%', scrub: true }
    });
  }

  /* ================= PRICES ================= */
  var SERVICE_AR = { wash_iron: 'غسيل وكي', wash: 'غسيل', iron: 'كي', dry_clean: 'تنظيف جاف',
                     carpet: 'سجاد وبطاطين', housekeeping: 'تنظيف منازل', accessories: 'منتجات' };
  var ORDER = ['wash_iron', 'wash', 'iron', 'dry_clean', 'carpet', 'housekeeping', 'accessories'];

  fetch('assets/prices.json').then(function (r) { return r.json(); }).then(function (data) {
    var tabs = document.getElementById('tabs'), grid = document.getElementById('priceGrid');
    var cats = Object.keys(data);
    cats.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'tab' + (i === 0 ? ' on' : ''); b.textContent = c;
      b.addEventListener('click', function () {
        tabs.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('on'); });
        b.classList.add('on'); render(c);
      });
      tabs.appendChild(b);
    });
    function render(cat) {
      var items = data[cat];
      grid.innerHTML = '';
      Object.keys(items).forEach(function (name, i) {
        var svcs = items[name];
        var key = ORDER.find(function (k) { return svcs[k] != null; });
        if (!key) return;
        var row = document.createElement('div');
        row.className = 'price-row rv'; row.style.setProperty('--d', Math.min(i, 10) * 35 + 'ms');
        row.innerHTML = '<span class="nm">' + name + '</span>' +
          '<span class="pr">' + Math.round(svcs[key]) + ' ج.م ' +
          '<small>' + (SERVICE_AR[key] || key) + '</small></span>';
        grid.appendChild(row);
        requestAnimationFrame(function () { row.classList.add('in'); });
      });
    }
    render(cats[0]);
  }).catch(function () {});

  /* ================= PLANS ================= */
  fetch('assets/plans.json').then(function (r) { return r.json(); }).then(function (plans) {
    var pick = ['فردي', 'عائلي', 'بريميوم'];
    var chosen = pick.map(function (n) {
      return plans.find(function (p) { return p.name === n; });
    }).filter(Boolean);
    if (chosen.length < 3) chosen = plans.slice(0, 3);
    var wrap = document.getElementById('plansGrid');
    var tick = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0a04b" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    chosen.forEach(function (p, i) {
      var hot = i === 1;
      var saveY = p.annual_price ? Math.round((1 - p.annual_price / (p.monthly_price * 12)) * 100) : 0;
      var el = document.createElement('article');
      el.className = 'plan rv' + (hot ? ' hot' : ''); el.style.setProperty('--d', i * 90 + 'ms');
      el.innerHTML =
        (hot ? '<span class="tag">الأكثر طلباً</span>' : '') +
        '<h3>' + p.name + '</h3>' +
        '<div class="amt" style="margin-top:12px">' + Math.round(p.monthly_price) +
        ' <small>ج.م / شهرياً</small></div>' +
        '<ul>' +
        '<li>' + tick + '<span>' + p.items_per_month + ' قطعة شهرياً</span></li>' +
        '<li>' + tick + '<span>غسيل · كي · غسيل وكي · تنظيف جاف</span></li>' +
        '<li>' + tick + '<span>استلام وتسليم من باب بيتك</span></li>' +
        (saveY > 0 ? '<li>' + tick + '<span>وفّر ' + saveY + '٪ مع الاشتراك السنوي</span></li>' : '') +
        '</ul>' +
        '<a class="btn ' + (hot ? 'btn-gold' : 'btn-dark') + '" href="https://wa.me/201006646641">اشترك الآن</a>';
      wrap.appendChild(el);
      io.observe(el);
    });
  }).catch(function () {});

  /* ================= BEFORE / AFTER ================= */
  (function () {
    var ba = document.getElementById('ba');
    if (!ba) return;
    var after = document.getElementById('baAfter'), handle = document.getElementById('baHandle'),
        knob = document.getElementById('baKnob'), down = false;
    function set(px) {
      var r = ba.getBoundingClientRect();
      var p = Math.max(4, Math.min(96, ((px - r.left) / r.width) * 100));
      after.style.clipPath = 'inset(0 0 0 ' + p + '%)';
      handle.style.left = p + '%';
      knob.style.left = p + '%';
    }
    ba.addEventListener('pointerdown', function (e) { down = true; ba.setPointerCapture(e.pointerId); set(e.clientX); });
    ba.addEventListener('pointermove', function (e) { if (down) set(e.clientX); });
    ba.addEventListener('pointerup', function () { down = false; });
    ba.addEventListener('pointercancel', function () { down = false; });
    if (window.gsap && window.ScrollTrigger && !reduce) {
      ScrollTrigger.create({
        trigger: ba, start: 'top 70%', once: true,
        onEnter: function () {
          var o = { v: 50 };
          gsap.to(o, { v: 22, duration: 1.1, ease: 'power2.inOut', yoyo: true, repeat: 1,
            onUpdate: function () {
              after.style.clipPath = 'inset(0 0 0 ' + o.v + '%)';
              handle.style.left = o.v + '%';
              knob.style.left = o.v + '%';
            } });
        }
      });
    }
  })();
})();
