// Versioned envelopes isolate future v2 data from untouched legacy storage keys.
export function createStorage({ namespace = 'katovia:v2', version = 1, getBackend = () => globalThis.localStorage } = {}) {
  const keyFor = (key) => `${namespace}:${key}`;
  return Object.freeze({
    get(key, fallback = null) {
      try {
        const raw = getBackend()?.getItem(keyFor(key));
        if (raw == null) return fallback;
        const envelope = JSON.parse(raw);
        return envelope?.version === version && Object.hasOwn(envelope, 'value') ? envelope.value : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try {
        if (value === undefined) return false;
        const backend = getBackend();
        if (!backend) return false;
        backend.setItem(keyFor(key), JSON.stringify({ version, value }));
        return true;
      } catch { return false; }
    },
    remove(key) {
      try {
        const backend = getBackend();
        if (!backend) return false;
        backend.removeItem(keyFor(key));
        return true;
      } catch { return false; }
    },
  });
}

export const storage = createStorage();
