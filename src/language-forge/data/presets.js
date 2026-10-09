export function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const segments = (letters, weights, kind, codas = '') => [...letters].map((grapheme,i) => ({id:grapheme,grapheme,class:kind,onset:kind==='consonant',coda:codas.includes(grapheme),weight:weights[i]}));
const make = (id, consonants, cw, vowels, vw, codas, templates, clusters, stress, lengths, grammar, labels) => ({
  id, labels, segments:[...segments(consonants,cw,'consonant',codas),...segments(vowels,vw,'vowel')],
  templates:templates.map(([pattern,weight])=>({pattern,weight})), clusters,
  forbiddenSequences:[], stress, lengths, grammar,
});
export const presets = freeze([
  make('flowing','mnlrsvy',[4,4,4,4,2,2,1],'aeiou',[4,4,4,1,1],'',[['V',10],['CV',90]],[],'penultimate',[[1,2],[3,2],[3,2]],{wordOrder:'SVO',adjectivePosition:'before',morphologyStrategy:'particle'},{tr:'AKICI',en:'FLOWING'}),
  make('crisp','ktpgdbsnrl',[5,5,5,3,3,3,2,2,1,1],'aio',[4,4,4],'ktpsnr',[['CV',25],['CVC',50],['CCV',5],['CCVC',20]],['tr','kr','gr','pr','st','sk'],'initial',[[4,1],[3,1],[3,1]],{wordOrder:'SOV',adjectivePosition:'after',morphologyStrategy:'suffix'},{tr:'KESKİN',en:'CRISP'}),
  make('rhythmic','ptkmnslr',[1,1,1,1,1,1,1,1],'aeiou',[1,1,1,1,1],'',[['CV',100]],[],'penultimate',[[1,5],[5,1],[4,1]],{wordOrder:'SVO',adjectivePosition:'after',morphologyStrategy:'suffix'},{tr:'RİTMİK',en:'RHYTHMIC'}),
  make('clustered','ptkbdgfs lr'.replace(/ /g,''),[3,3,3,2,2,2,2,2,3,3],'aeiou',[1,4,1,4,1],'ptksnlr',[['CV',15],['CVC',15],['CCV',45],['CCVC',25]],['pl','pr','bl','br','tr','dr','kl','kr','gl','gr','fl','fr','sl'],'initial',[[2,3],[3,2],[3,2]],{wordOrder:'VSO',adjectivePosition:'before',morphologyStrategy:'particle'},{tr:'KÜMELİ',en:'CLUSTERED'}),
]);
