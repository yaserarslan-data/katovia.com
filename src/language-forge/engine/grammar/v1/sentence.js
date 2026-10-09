import { verbValency,pronounFeatures,markerOrder } from '../../../data/grammar.js';
import { concepts } from '../../../data/concepts.js';
import { deriveSuffix } from './morphology.js';
import { GrammarError } from './errors.js';
const orders={SVO:['subject','verb','object'],SOV:['subject','object','verb'],VSO:['verb','subject','object']};
export function realizeSentence(ast,base,grammar) {
  const fail=detail=>{throw new GrammarError('SENTENCE_REALIZATION_FAILED',{detail});};
  if(!ast||!['declarative','question'].includes(ast.mood)||!ast.subject||!ast.predicate)fail('AST');
  const config=grammar.config;
  if(!orders[config?.wordOrder]||!['before','after'].includes(config.adjectivePosition)||!['particle','suffix'].includes(config.morphologyStrategy))fail('grammar config');
  const roots=new Map(base.language.lexicon.map(x=>[x.semanticId,x.word]));
  const facts={wordOrder:config.wordOrder,pronouns:[],morphology:[],plural:false,negation:false,question:ast.mood==='question',possession:false,copula:false,locativeRelation:null};
  const rootToken=(id,role)=>{
    if(!roots.has(id))fail(`unknown semantic ID ${id}`);
    return {surface:roots.get(id),semanticId:id,meaningId:id,role,analysis:[{type:'root',semanticId:id,surface:roots.get(id)}]};
  };
  const markerToken=(id,role)=>{
    if(!markerOrder.includes(id)||typeof grammar.markers?.[id]!=='string')fail(`unknown marker ${id}`);
    return {surface:grammar.markers[id],markerId:id,meaningId:id,role,analysis:[{type:'marker',markerId:id,surface:grammar.markers[id]}]};
  };
  const inflect=(token,id)=>{
    facts.morphology.push({semanticId:token.semanticId,markerId:id,strategy:config.morphologyStrategy});
    if(config.morphologyStrategy==='particle')return [markerToken(id,token.role),token];
    const marker=markerToken(id,token.role).surface;
    const derived=deriveSuffix({root:token.surface,semanticId:token.semanticId,marker,markerId:id,phonology:base.config.rules,linkingVowel:grammar.linkingVowel,blocked:[...roots.values(),base.language.canonicalName,...Object.values(grammar.markers)]});
    return [{...token,...derived}];
  };
  const nounPhrase=(np,role,depth=0)=>{
    if(!np||depth>4)fail('nominal depth');
    if(np.type==='possessive') {
      if(np.possessor?.type!=='nominal'||np.possessed?.type!=='nominal')fail('possession');
      facts.possession=true;
      return [...nounPhrase(np.possessor,role,depth+1),markerToken('grammar.possession',role),...nounPhrase(np.possessed,role,depth+1)];
    }
    const concept=concepts.find(c=>c.semanticId===np.semanticId);
    if(np.type!=='nominal'||!concept||!['noun','pronoun'].includes(concept.partOfSpeech)||!['singular','plural'].includes(np.number)||!Array.isArray(np.adjectives))fail('nominal');
    if(np.adjectives.length>4||np.adjectives.some(id=>!concepts.some(c=>c.semanticId===id&&c.partOfSpeech==='adj')))fail('adjectives');
    if(concept.partOfSpeech==='pronoun') {
      if(np.number!==pronounFeatures[np.semanticId].number||np.adjectives.length)fail('pronoun modifiers unsupported');
      facts.pronouns.push({semanticId:np.semanticId,...pronounFeatures[np.semanticId]});
    }
    const noun=rootToken(np.semanticId,role);
    const plural=concept.partOfSpeech==='noun'&&np.number==='plural';
    if(plural)facts.plural=true;
    const body=plural?inflect(noun,'grammar.plural'):[noun];
    const adjectives=np.adjectives.map(id=>rootToken(id,role));
    if(adjectives.length)facts.adjectivePosition=config.adjectivePosition;
    return config.adjectivePosition==='before'?[...adjectives,...body]:[...body,...adjectives];
  };
  const subject=nounPhrase(ast.subject,'subject');
  let verbal=[],object=[];
  const predicate=ast.predicate;
  if(predicate.type==='verb') {
    const valency=verbValency[predicate.semanticId]?.valency;
    if(!valency||!['present','past','future'].includes(predicate.tense)||typeof predicate.negated!=='boolean')fail('predicate');
    if((valency==='transitive')!==Boolean(ast.object))fail('valency');
    if(ast.object)object=nounPhrase(ast.object,'object');
    const verb=rootToken(predicate.semanticId,'verb');
    facts.tense=predicate.tense;facts.negation=predicate.negated;
    verbal=predicate.tense==='present'?[verb]:inflect(verb,`grammar.${predicate.tense}`);
    if(predicate.negated)verbal.unshift(markerToken('grammar.negation','verb'));
  } else if(predicate.type==='copula') {
    if(predicate.tense!==undefined||predicate.negated!==undefined)fail('copula modifiers unsupported');
    facts.copula=true;verbal=[markerToken('grammar.copula','verb')];
    if(ast.object?.type==='quality'&&concepts.some(c=>c.semanticId===ast.object.semanticId&&c.partOfSpeech==='adj'))object=[rootToken(ast.object.semanticId,'complement')];
    else if(ast.object?.type==='relation'&&ast.object.markerId==='grammar.above') {facts.locativeRelation='above';object=[markerToken('grammar.above','complement'),...nounPhrase(ast.object.object,'complement')];}
    else fail('copula complement');
  } else fail('predicate type');
  const blocks={subject,verb:verbal,object};
  const tokens=orders[config.wordOrder].flatMap(role=>blocks[role]);
  if(ast.mood==='question')tokens.push(markerToken('grammar.question','question'));
  return {surface:tokens.map(t=>t.surface).join(' '),tokens,explanation:facts};
}
