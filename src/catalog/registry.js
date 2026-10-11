export const sections = Object.freeze([
  { id: 'today', type: 'daily', title: 'TODAY', route: '/today/', status: 'available' },
  { id: 'play', type: 'play', title: 'PLAY', route: '/play/', status: 'available' },
  { id: 'challenge', type: 'challenge', title: 'CHALLENGE', route: '/challenge/', status: 'available' },
  { id: 'create', type: 'create', title: 'CREATE', route: '/create/', status: 'available' },
  { id: 'tools', type: 'tool', title: 'TOOLS', route: '/tools/', status: 'available' },
  { id: 'lab', type: 'lab', title: 'LAB', route: '/lab/', status: 'legacy' },
]);

export const entries = Object.freeze([
  { id: 'qr', type: 'tool', route: '/laboratuvar/qr-kod-olusturucu.html', status: 'legacy' },
  { id: 'business-card', type: 'tool', route: '/laboratuvar/dijital-kartvizit-olusturucu.html', status: 'legacy' },
  { id: 'karar', type: 'lab', route: '/laboratuvar/karar-pusulasi.html', status: 'legacy' },
  { id: 'cuma', type: 'lab', route: '/laboratuvar/cuma-mesaji.html', status: 'legacy' },
  { id: 'kandil', type: 'lab', route: '/laboratuvar/kandil-mesaji.html', status: 'legacy' },
  { id: 'dogum-gunu', type: 'lab', route: '/laboratuvar/dogum-gunu-mesaji.html', status: 'legacy' },
  { id: 'bayram', type: 'lab', route: '/laboratuvar/bayram-mesaji.html', status: 'legacy' },
]);
