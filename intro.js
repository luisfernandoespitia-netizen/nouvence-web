/* NOUVĒNCE · intro cinematográfica accesible. Solo gestiona la animación. */
(function () {
  'use strict';
  var html = document.documentElement;
  var overlay = document.getElementById('nouvenceCinematicIntro');
  if (!overlay || !html.classList.contains('nouvence-intro-pending')) return;

  var button = document.getElementById('nouvenceSkipIntro');
  var finished = false;
  var fallbackTimer;

  function finish() {
    if (finished) return;
    finished = true;
    html.classList.remove('nouvence-intro-pending');
    overlay.remove();
    window.clearTimeout(fallbackTimer);
  }

  if (button) button.addEventListener('click', finish);
  overlay.addEventListener('animationend', function (event) {
    if (event.target === overlay && event.animationName === 'nouvence-intro-disappear') finish();
  });

  // Cierre de seguridad si se bloquean las animaciones CSS.
  fallbackTimer = window.setTimeout(finish, 5600);

  // Si el usuario activa "Reducir movimiento" mientras aparece, cerrar.
  if (window.matchMedia) {
    var media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) finish();
    else if (media.addEventListener) media.addEventListener('change', function () {
      if (media.matches) finish();
    }, { once:true });
  }
}());
