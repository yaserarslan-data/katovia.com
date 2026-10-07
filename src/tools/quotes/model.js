import '../../../laboratuvar/data/guzel-sozler.js';
export const quotes = globalThis.KATOVIA_BEAUTIFUL_QUOTES;
export const categories = [...new Set(quotes.flatMap(quote => quote.categories))];
export const favoritesKey = 'katovia.beautifulQuotes.favorites.v1';
export const historyKey = 'katovia.beautifulQuotes.history.v1';
export function validFavorites(value) { return Array.isArray(value) ? [...new Set(value)].filter(id=>quotes.some(quote=>quote.id===id)) : []; }
export function selectQuotes(category='all',favorites=null) { return quotes.filter(quote=>(category==='all'||quote.categories.includes(category))&&(!favorites||favorites.includes(quote.id))); }
