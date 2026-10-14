const themeButton = document.querySelector('.theme-toggle');
function setTheme(light) {
  document.body.classList.toggle('light', light);
  themeButton.textContent = light ? 'Dark mode' : 'Light mode';
  themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  themeButton.setAttribute('aria-pressed', String(light));
  document.querySelector('meta[name="theme-color"]').content = light ? '#fafafa' : '#101010';
}
try { setTheme(localStorage.getItem('cliff-monochrome-theme') === 'light'); } catch { setTheme(false); }
themeButton.addEventListener('click', () => {
  const light = !document.body.classList.contains('light');
  setTheme(light);
  try { localStorage.setItem('cliff-monochrome-theme', light ? 'light' : 'dark'); } catch {}
});
document.getElementById('year').textContent = new Date().getFullYear();

// Lightweight motion enhancements. All content remains visible without JavaScript.
function initPortfolioEffects(root) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animations = new Set();
  let observer;

  function animate(element, frames, options) {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    const cleanup = () => animations.delete(animation);
    animation.addEventListener('finish', cleanup, { once: true });
    animation.addEventListener('cancel', cleanup, { once: true });
  }

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const heroItems = [...root.querySelectorAll('.hero-copy > *, .hero-visual')];
    const items = root.querySelectorAll('.hero-copy > *, .hero-visual, .section-heading, .section-top, .project, .about-copy, .achievement, .skill-row, .education-content, .contact-layout');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const heroIndex = heroItems.indexOf(entry.target);
        animate(entry.target,
          [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 650, delay: heroIndex < 0 ? 0 : Math.min(heroIndex * 65, 260), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
        );
      });
    }, { threshold: 0.08 });
    items.forEach(item => observer.observe(item));
  }

  const frames = [...root.querySelectorAll('.portrait-frame')];
  frames.forEach(frame => {
    frame.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      frame.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`);
      frame.style.setProperty('--tilt-y', `${(x - 0.5) * 7}deg`);
    });
    frame.addEventListener('pointerleave', () => resetTilt(frame));
  });
  function resetTilt(frame) {
    frame.style.setProperty('--tilt-x', '0deg');
    frame.style.setProperty('--tilt-y', '0deg');
  }

  root.querySelectorAll('.project').forEach(project => {
    project.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = project.getBoundingClientRect();
      project.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      project.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
    });
  });

  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    if (observer) observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    frames.forEach(resetTilt);
  });
}

initPortfolioEffects(document);
