import { resolveRecipe } from '../../model.js';
import { allocateLexicon } from './lexicon.js';
import { generateLanguageName } from './language-name.js';
export function generateLanguage(input) {
  const recipe=resolveRecipe(input);
  const lexicon=allocateLexicon(recipe);
  const name=generateLanguageName(recipe,lexicon);
  const rules=recipe.config.rules;
  return {...recipe,language:{...name,phonologySummary:{segments:rules.segments.map(s=>s.grapheme),templates:rules.templates.map(t=>t.pattern),clusters:[...rules.clusters],stress:rules.stress},lexicon}};
}
