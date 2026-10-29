/* Shared setup for every scene */
gsap.registerPlugin(ScrollTrigger);

// top progress bar
gsap.to('#progress-bar', {
  width: '100%', ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: true }
});

// HUD scene label: each <section data-scene="n"> updates it when it enters.
// Created on load, after every scene has added its pinned sections, so positions include pin spacing.
window.addEventListener('load', () => document.querySelectorAll('section[data-scene]').forEach(sec => {
  ScrollTrigger.create({
    trigger: sec, start: 'top center', end: 'bottom center',
    onToggle: self => {
      if (self.isActive) document.getElementById('hud-scene').textContent = 'SCENE ' + sec.dataset.scene;
    }
  });
}));

// helper used by scenes: animate a number from 0 to target
window.countUp = function (el, target, suffix = '', duration = 1.6) {
  const o = { v: 0 };
  return gsap.to(o, {
    v: target, duration, ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US') + suffix; }
  });
};
