import { sentenceFrames } from '../data/grammar.js';
// Labels only: never called by random streams or realization.
const descriptions={
  tr:{order:'Öge sırası',adjective:'Sıfat konumu',tense:'Zaman',plural:'Çoğul',negation:'Olumsuzluk parçacığı yüklem bloğundan önce',question:'Soru parçacığı cümle sonunda',possession:'Sahip + iyelik parçacığı + sahip olunan',copula:'Bağlayıcı sözcük',above:'üstünde',before:'isimden önce',after:'isimden sonra',present:'şimdiki/geniş',past:'geçmiş',future:'gelecek',particle:'ayrı parçacık',suffix:'ek'},
  en:{order:'Constituent order',adjective:'Adjective position',tense:'Tense',plural:'Plural',negation:'Negation particle before the verbal block',question:'Question particle at sentence end',possession:'Possessor + possession particle + possessed',copula:'Copula word',above:'above',before:'before the noun',after:'after the noun',present:'present',past:'past',future:'future',particle:'separate particle',suffix:'suffix'},
};
export function presentSentence(example,locale) {
  const labels=descriptions[locale];const frame=sentenceFrames.find(f=>f.id===example.id);
  if(!labels||!frame)throw new TypeError('sentence presentation');
  const facts=example.explanation;
  const explanation=[`${labels.order}: ${facts.wordOrder}`];
  if(facts.adjectivePosition)explanation.push(`${labels.adjective}: ${labels[facts.adjectivePosition]}`);
  if(facts.tense)explanation.push(`${labels.tense}: ${labels[facts.tense]}`);
  for(const m of facts.morphology)explanation.push(`${m.markerId==='grammar.plural'?labels.plural:labels[m.markerId.slice(8)]}: ${labels[m.strategy]}`);
  for(const field of ['negation','question','possession','copula'])if(facts[field])explanation.push(labels[field]);
  if(facts.locativeRelation)explanation.push(labels.above);
  return {meaning:frame.meaning[locale],explanation};
}
