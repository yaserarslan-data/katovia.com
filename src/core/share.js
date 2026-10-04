export function createTextPayload({ title = 'Katovia', text = '', url = '' } = {}) {
  if (typeof title !== 'string' || typeof text !== 'string' || typeof url !== 'string') throw new TypeError('Share payload must contain strings');
  if (title.length > 120 || text.length > 4000 || url.length > 2048) throw new RangeError('Share payload is too large');
  if (url) {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new TypeError('Unsafe share URL');
  }
  return { title, text, ...(url ? { url } : {}) };
}

export function supportsWebShare(navigatorObject = globalThis.navigator) {
  return typeof navigatorObject?.share === 'function';
}

export async function copyText(text, navigatorObject = globalThis.navigator) {
  try {
    if (typeof navigatorObject?.clipboard?.writeText !== 'function') return { status: 'manual', text };
    await navigatorObject.clipboard.writeText(text);
    return { status: 'copied' };
  } catch { return { status: 'manual', text }; }
}

// Resolve means OS handoff, not that a message was sent or received.
export async function shareText(input, navigatorObject = globalThis.navigator) {
  const payload = createTextPayload(input);
  if (supportsWebShare(navigatorObject)) {
    try {
      await navigatorObject.share(payload);
      return { status: 'handoff' };
    } catch (error) {
      if (error?.name === 'AbortError') return { status: 'cancelled' };
    }
  }
  return copyText([payload.text, payload.url].filter(Boolean).join('\n'), navigatorObject);
}
