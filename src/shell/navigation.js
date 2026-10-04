import { i18n, t } from '../i18n/index.js';
export function mountNavigation(root = document) {
  const toggle = root.querySelector('[data-menu-toggle]');
  const nav = root.querySelector('[data-navigation]');
  if (!toggle || !nav) return () => {};
  const viewport = window.matchMedia('(max-width: 767px)');
  const setOpen = (open, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'common.closeMenu' : 'common.openMenu'));
    nav.dataset.open = String(open);
    nav.hidden = viewport.matches && !open;
    if (returnFocus) toggle.focus();
  };
  const onToggle = () => setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  const onKey = (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  };
  const onOutside = (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  };
  const onNav = (event) => { if (event.target.closest('a')) setOpen(false); };
  const onViewport = () => setOpen(false);
  toggle.addEventListener('click', onToggle);
  nav.addEventListener('click', onNav);
  root.addEventListener('keydown', onKey);
  root.addEventListener('click', onOutside);
  viewport.addEventListener('change', onViewport);
  const unsubscribe = i18n.subscribe(() => { toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'common.closeMenu' : 'common.openMenu')); });
  setOpen(false);
  return () => {
    unsubscribe();
    toggle.removeEventListener('click', onToggle);
    nav.removeEventListener('click', onNav);
    root.removeEventListener('keydown', onKey);
    root.removeEventListener('click', onOutside);
    viewport.removeEventListener('change', onViewport);
  };
}
