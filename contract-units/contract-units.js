// Fade / loading effects shared by every Contract Units page.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // scroll reveal: fade sections up as they enter the viewport
  // the hero already rises in piece by piece via CSS, so leave it (and its children) alone
  document.querySelectorAll('.page > :not(.hero)').forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries
      .filter(e => e.isIntersecting)
      .forEach((e, i) => {
        e.target.style.setProperty('--reveal-delay', Math.min(i, 6) * 90 + 'ms');
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // videos: show a shimmering placeholder until the embed has loaded, then fade it in
  document.querySelectorAll('.video-wrap').forEach(wrap => {
    const frame = wrap.querySelector('iframe');
    if (!frame) return;
    const done = () => wrap.classList.add('loaded');
    frame.addEventListener('load', done, { once: true });
    setTimeout(done, 5000); // don't leave the shimmer up if the load event never fires
  });

  // fade out before navigating to another page on the site
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (e.defaultPrevented || !link || link.target === '_blank' || link.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;

    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = link.href; }, 250);
  });

  // coming back via the browser's back button restores the page from cache mid-fade
  window.addEventListener('pageshow', e => {
    if (e.persisted) document.body.classList.remove('leaving');
  });
})();

// Smooth wheel scrolling (Lenis) on pages with <html class="smooth-scroll">. Lenis still
// moves the real window scroll, so scroll listeners like the rail below keep working.
const lenis = (() => {
  if (!document.documentElement.classList.contains('smooth-scroll') || !window.Lenis) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const lenis = new Lenis({ lerp: 0.1 });
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  return lenis;
})();

// Scroll rail: a fixed tracker beside the scrollbar with a marker for every heading that
// has a data-rail attribute. Markers sit where their section activates (heading crosses
// 40% of the viewport), so the fill reaches each one exactly as its section takes over.
(() => {
  const headings = [...document.querySelectorAll('[data-rail]')];
  if (!headings.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trigger = 0.4;

  const rail = document.createElement('nav');
  rail.className = 'scroll-rail';
  rail.setAttribute('aria-label', 'Page sections');
  rail.innerHTML =
    '<div class="rail-track"><div class="rail-fill"></div><div class="rail-head"></div></div>';

  const track = rail.querySelector('.rail-track');
  const fill = rail.querySelector('.rail-fill');
  const head = rail.querySelector('.rail-head');

  const offsetTop = el => el.getBoundingClientRect().top + scrollY;

  const marks = headings.map(h => {
    const mark = document.createElement('a');
    mark.className = 'rail-mark';
    mark.href = '#';
    mark.innerHTML =
      `<span class="rail-dot"></span><span class="rail-label"><em>${h.dataset.rail}</em></span>`;
    mark.addEventListener('click', e => {
      e.preventDefault();
      const top = offsetTop(h) - 120;
      if (lenis) lenis.scrollTo(top, { duration: 1.2 });
      else window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    rail.appendChild(mark);
    return { heading: h, mark, name: mark.querySelector('em'), at: 0 };
  });

  document.body.appendChild(rail);

  // reveal animations use transforms, which don't shift the headings' layout position
  let maxScroll = 1, trackH = 0;
  function measure() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    trackH = track.offsetHeight;
    marks.forEach(m => {
      m.at = Math.min(1, Math.max(0, (offsetTop(m.heading) - innerHeight * trigger) / maxScroll));
      m.mark.style.top = m.at * 100 + '%';
    });
  }

  // decode the section name through random glyphs, settling left to right
  const glyphs = '!<>-_\\/[]{}=+*^?#01';
  function scramble(el) {
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    if (reduceMotion) return;
    cancelAnimationFrame(el._raf);
    const start = performance.now(), duration = 450;
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * text.length);
      el.textContent = text.slice(0, settled) + [...text.slice(settled)]
        .map(() => glyphs[Math.random() * glyphs.length | 0]).join('');
      if (t < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  let active = -1, sleepTimer, ticking = false;
  function update() {
    ticking = false;
    const p = Math.min(1, Math.max(0, scrollY / maxScroll));
    fill.style.transform = `scaleY(${p})`;
    head.style.transform = `translateY(${p * trackH}px)`;

    let current = -1;
    marks.forEach((m, i) => {
      const passed = p >= m.at - 0.0005;
      if (passed) current = i;
      m.mark.classList.toggle('passed', passed);
    });

    if (current !== active) {
      if (active >= 0) marks[active].mark.classList.remove('active');
      active = current;
      if (active >= 0) {
        marks[active].mark.classList.add('active');
        scramble(marks[active].name);
      }
    }
  }

  function refresh() { measure(); update(); }

  addEventListener('scroll', () => {
    rail.classList.add('awake');
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => rail.classList.remove('awake'), 1400);
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', refresh);
  addEventListener('load', refresh);
  new ResizeObserver(refresh).observe(document.body);

  refresh();
  requestAnimationFrame(() => rail.classList.add('ready'));
})();
