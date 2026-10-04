export function setStatus(target, message, state = 'ready') {
  if (!target) return;
  target.textContent = message;
  target.dataset.state = state;
}
