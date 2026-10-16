/* NOUVĒNCE · movimientos editoriales discretos durante la navegación.
   No modifica compras, consultas por folio ni el contenido de Supabase. */
(function () {
  'use strict';

  // En ausencia de JS, IntersectionObserver o para quien prefiere menos movimiento,
  // el contenido queda siempre visible y completamente utilizable.
  if (!('IntersectionObserver' in window) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    return;
  }

  var selectors = [
    '.hero-copy > *',
    '.hero-visual',
    '.manifesto > .eyebrow',
    '.manifesto-grid > *',
    '.section-heading > *',
    '.service-card',
    '.editorial-feature > *',
    '.points-section > *',
    '.contact > *'
  ].join(',');

  var elements = Array.from(document.querySelectorAll(selectors));
  if (!elements.length) return;

  var serviceCards = Array.from(document.querySelectorAll('.service-card'));
  var heroItems = Array.from(document.querySelectorAll('.hero-copy > *'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('nouvence-reveal--shown');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.09 });

  elements.forEach(function (element) {
    element.classList.add('nouvence-reveal');
    var delay = 0;
    if (serviceCards.includes(element)) delay = Math.min(serviceCards.indexOf(element) * 85, 260);
    if (heroItems.includes(element)) delay = Math.min(heroItems.indexOf(element) * 85, 340);
    element.style.setProperty('--nouvence-reveal-delay', delay + 'ms');

    // No ocultar brevemente el contenido que ya aparece en la pantalla.
    var box = element.getBoundingClientRect();
    if (box.top < window.innerHeight * .9 && box.bottom > 0) {
      element.classList.add('nouvence-reveal--shown');
    } else {
      observer.observe(element);
    }
  });

  document.documentElement.classList.add('nouvence-motion-ready');

  // Al cambiar a reducir movimiento en tiempo real, se cancela toda la transición.
  if (window.matchMedia) {
    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.addEventListener) {
      preference.addEventListener('change', function () {
        if (preference.matches) {
          observer.disconnect();
          document.documentElement.classList.remove('nouvence-motion-ready');
        }
      });
    }
  }
}());
