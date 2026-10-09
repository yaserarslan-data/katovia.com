// First-party inventory. Array order is the d1 allocation contract, not UI order.
const groups = [
  ['pronouns', 'pronoun', [['i','ben','I'],['you-singular','sen','you (singular)'],['third-singular','o','he / she / they (singular)'],['we','biz','we'],['you-plural','siz','you (plural)'],['they-plural','onlar','they (plural)']]],
  ['people','noun', [['person','kişi','person'],['child','çocuk','child'],['mother','anne','mother'],['father','baba','father'],['friend','arkadaş','friend']]],
  ['nature','noun', [['water','su','water'],['fire','ateş','fire'],['ground','toprak','ground / earth / soil'],['sky','gökyüzü','sky'],['sun','güneş','sun'],['moon','ay','moon'],['star','yıldız','star'],['wind','rüzgâr','wind'],['tree','ağaç','tree'],['sea','deniz','sea']]],
  ['body','noun', [['hand','el','hand'],['eye','göz','eye'],['mouth','ağız','mouth'],['head','baş','head'],['heart','kalp','heart']]],
  ['daily','noun', [['house','ev','house'],['city','şehir','city'],['mountain','dağ','mountain'],['river','nehir','river'],['road','yol','road'],['food','yiyecek','food']]],
  ['actions','verb', [['go','gitmek','go'],['come','gelmek','come'],['see','görmek','see'],['hear','duymak','hear'],['drink','içmek','drink'],['eat','yemek','eat'],['speak','konuşmak','speak'],['know','bilmek','know'],['give','vermek','give'],['take','almak','take'],['make','yapmak','make'],['love','sevmek','love']]],
  ['qualities','adj', [['good','iyi','good'],['bad','kötü','bad'],['big','büyük','big'],['small','küçük','small'],['hot','sıcak','hot'],['cold','soğuk','cold'],['new','yeni','new'],['old','eski','old']]],
  ['emotions','noun', [['joy','sevinç','joy'],['fear','korku','fear'],['calm','huzur','calm'],['hope','umut','hope']]],
  ['time','adverb', [['now','şimdi','now'],['today','bugün','today'],['yesterday','dün','yesterday'],['tomorrow','yarın','tomorrow']]],
  ['abstract','noun', [['life','hayat','life'],['death','ölüm','death'],['thing','şey','thing'],['word','kelime','word']]],
];
export const concepts = Object.freeze(groups.flatMap(([category, partOfSpeech, rows]) => rows.map(([id,tr,en]) => Object.freeze({semanticId:`${partOfSpeech}.${id}`, category, partOfSpeech, labels:Object.freeze({tr,en})}))));
export const allocationOrder = Object.freeze(concepts.map(({semanticId}) => semanticId));
