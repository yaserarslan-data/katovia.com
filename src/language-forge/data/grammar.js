import { freeze } from './presets.js';
// g1 authored semantic metadata; d1 lexical allocation and labels remain frozen.
export const grammarVersion='g1';
export const markerOrder=freeze(['plural','past','future','negation','question','possession','copula','above'].map(id=>`grammar.${id}`));
export const verbValency=freeze(Object.fromEntries([
  ['go','intransitive'],['come','intransitive'],['see','transitive'],['hear','transitive'],
  ['drink','transitive'],['eat','transitive'],['speak','intransitive'],['know','transitive'],
  ['give','transitive'],['take','transitive'],['make','transitive'],['love','transitive'],
].map(([id,valency])=>[`verb.${id}`,{valency}])));
export const pronounFeatures=freeze(Object.fromEntries([
  ['i',1,'singular'],['you-singular',2,'singular'],['third-singular',3,'singular'],
  ['we',1,'plural'],['you-plural',2,'plural'],['they-plural',3,'plural'],
].map(([id,person,number])=>[`pronoun.${id}`,{person,number,gender:'unspecified'}])));
const np=(semanticId,extra={})=>({type:'nominal',semanticId,number:pronounFeatures[semanticId]?.number??'singular',adjectives:[],...extra});
const verb=(semanticId,extra={})=>({type:'verb',semanticId,tense:'present',negated:false,...extra});
const frame=(id,tr,en,subject,predicate,object=null,mood='declarative')=>({id,meaning:{tr,en},ast:{subject,predicate,object,mood}});
export const sentenceFrames=freeze([
  frame('sentence.see-moon','Ayı görüyorum.','I see the moon.',np('pronoun.i'),verb('verb.see'),np('noun.moon')),
  frame('sentence.drink-water','Su içiyorsun.','You drink water.',np('pronoun.you-singular'),verb('verb.drink'),np('noun.water')),
  frame('sentence.child-sea','Çocuk denizi görüyor.','The child sees the sea.',np('noun.child'),verb('verb.see'),np('noun.sea')),
  frame('sentence.love-city','Şehri seviyoruz.','We love the city.',np('pronoun.we'),verb('verb.love'),np('noun.city')),
  frame('sentence.good-person','İyi kişi konuşuyor.','The good person speaks.',np('noun.person',{adjectives:['adj.good']}),verb('verb.speak')),
  frame('sentence.children-moon','Çocuklar ayı görüyor.','The children see the moon.',np('noun.child',{number:'plural'}),verb('verb.see'),np('noun.moon')),
  frame('sentence.past-go','Gittim.','I went.',np('pronoun.i'),verb('verb.go',{tense:'past'})),
  frame('sentence.future-go','Gidecekler.','They will go.',np('pronoun.they-plural'),verb('verb.go',{tense:'future'})),
  frame('sentence.not-drink','Su içmiyorum.','I do not drink water.',np('pronoun.i'),verb('verb.drink',{negated:true}),np('noun.water')),
  frame('sentence.question-moon','Ayı görüyor musun?','Do you see the moon?',np('pronoun.you-singular'),verb('verb.see'),np('noun.moon'),'question'),
  frame('sentence.your-house','Evin iyi.','Your house is good.',{type:'possessive',possessor:np('pronoun.you-singular'),possessed:np('noun.house')},{type:'copula'}, {type:'quality',semanticId:'adj.good'}),
  frame('sentence.sun-above','Güneş dağın üstünde.','The sun is above the mountain.',np('noun.sun'),{type:'copula'}, {type:'relation',markerId:'grammar.above',object:np('noun.mountain')}),
]);
