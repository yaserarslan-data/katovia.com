export const sections = Object.freeze([
  { id: 'today', type: 'daily', title: 'TODAY', route: '/v2/today/', status: 'available' },
  { id: 'play', type: 'play', title: 'PLAY', route: '/v2/play/', status: 'planned' },
  { id: 'challenge', type: 'challenge', title: 'CHALLENGE', route: '/v2/challenge/', status: 'planned' },
  { id: 'create', type: 'create', title: 'CREATE', route: '/v2/create/', status: 'planned' },
  { id: 'tools', type: 'tool', title: 'TOOLS', route: '/v2/tools/', status: 'legacy' },
  { id: 'lab', type: 'lab', title: 'LAB', route: '/v2/lab/', status: 'legacy' },
]);

export const entries = Object.freeze([
  { id: 'qr', type: 'tool', route: '/laboratuvar/qr-kod-olusturucu.html', status: 'legacy' },
  { id: 'business-card', type: 'tool', route: '/laboratuvar/dijital-kartvizit-olusturucu.html', status: 'legacy' },
  { id: 'yuk-ustasi', type: 'lab', route: '/oyunlar/yuk-ustasi.html', status: 'legacy' },
  { id: 'tas-yagmuru', type: 'lab', route: '/oyunlar/tas-yagmuru.html', status: 'legacy' },
  { id: 'sut-gol', type: 'lab', route: '/oyunlar/sut-gol.html', status: 'legacy' },
  { id: 'serit-kacisi', type: 'lab', route: '/oyunlar/serit-kacisi.html', status: 'legacy' },
  { id: 'kus-fotografcisi', type: 'lab', route: '/oyunlar/kus-fotografcisi.html', status: 'legacy' },
  { id: 'golf', type: 'lab', route: '/oyunlar/golf-mini-oyun.html', status: 'legacy' },
  { id: 'falso-sut', type: 'lab', route: '/oyunlar/falso-sut.html', status: 'legacy' },
  { id: 'hokey', type: 'lab', route: '/oyunlar/buz-hokeyi.html', status: 'legacy' },
  { id: 'bilardo', type: 'lab', route: '/oyunlar/bilardo.html', status: 'legacy' },
  { id: 'araba-firlat', type: 'lab', route: '/oyunlar/araba-firlat.html', status: 'legacy' },
  { id: 'karar', type: 'lab', route: '/laboratuvar/karar-pusulasi.html', status: 'legacy' },
  { id: 'cuma', type: 'lab', route: '/laboratuvar/cuma-mesaji.html', status: 'legacy' },
  { id: 'kandil', type: 'lab', route: '/laboratuvar/kandil-mesaji.html', status: 'legacy' },
  { id: 'dogum-gunu', type: 'lab', route: '/laboratuvar/dogum-gunu-mesaji.html', status: 'legacy' },
  { id: 'bayram', type: 'lab', route: '/laboratuvar/bayram-mesaji.html', status: 'legacy' },
]);
