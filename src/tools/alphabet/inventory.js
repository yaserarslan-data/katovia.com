// Directly authored character literals and UI labels for Katovia.
// This module imports no character database, technical names or document assets.
const letters=(profileId,lower,upper,names)=>[...lower].map((character,index)=>({
 id:`${profileId}-${character.codePointAt(0).toString(16).padStart(4,'0')}`,
 profileId,order:index+1,character,
 forms:[{role:'upper',text:[...upper][index]},{role:'lower',text:character}],
 label:names?{tr:names[index],en:names[index]}:{tr:`${character} harfi`,en:`Letter ${character}`},
}));
const greek=letters('greek-modern','αβγδεζηθικλμνξοπρστυφχψω','ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',[
 'Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon','Phi','Chi','Psi','Omega',
]);
for(const entry of greek){
 if(entry.character==='σ')entry.forms.push({role:'word-final',text:'ς'});
 for(const variant of ({α:'Άά',ε:'Έέ',η:'Ήή',ι:'ΊίΪϊΐ',ο:'Όό',υ:'ΎύΫϋΰ',ω:'Ώώ'})[entry.character]||'')entry.forms.push({role:'variant',text:variant});
}
const russian=letters('cyrillic-russian','абвгдеёжзийклмнопрстуфхцчшщъыьэюя','АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ');
const kanaRows=[['vowels','あいうえお'],['k','かきくけこ'],['s','さしすせそ'],['t','たちつてと'],['n','なにぬねの'],['h','はひふへほ'],['m','まみむめも'],['y','やゆよ'],['r','らりるれろ'],['w','わを'],['final','ん']];
const kana=[],groups=[];
for(const [group,characters] of kanaRows){
 const entryIds=[];
 for(const character of characters){const id=`hiragana-basic-${character.codePointAt(0).toString(16)}`;kana.push({id,profileId:'hiragana-basic',order:kana.length+1,character,forms:[{role:'primary',text:character}],label:{tr:`${character} karakteri`,en:`Character ${character}`}});entryIds.push(id);}
 groups.push({id:group,entryIds});
}
const morsePairs=[
 ['A','.-'],['B','-...'],['C','-.-.'],['D','-..'],['E','.'],['F','..-.'],['G','--.'],['H','....'],['I','..'],['J','.---'],['K','-.-'],['L','.-..'],['M','--'],['N','-.'],['O','---'],['P','.--.'],['Q','--.-'],['R','.-.'],['S','...'],['T','-'],['U','..-'],['V','...-'],['W','.--'],['X','-..-'],['Y','-.--'],['Z','--..'],
 ['0','-----'],['1','.----'],['2','..---'],['3','...--'],['4','....-'],['5','.....'],['6','-....'],['7','--...'],['8','---..'],['9','----.'],
];
const morse=morsePairs.map(([name,character],index)=>({id:`morse-international-${name.codePointAt(0).toString(16).padStart(4,'0')}`,profileId:'morse-international',order:index+1,character,forms:[{role:'primary',text:character}],label:{tr:name,en:name}}));
const braille=(profileId,letters,glyphs)=>[...letters].map((name,index)=>({id:`${profileId}-${[...glyphs][index].codePointAt(0).toString(16)}`,profileId,order:index+1,character:[...glyphs][index],forms:[{role:'primary',text:[...glyphs][index]}],label:{tr:`${name} harfi`,en:`Letter ${name}`}}));
export const profiles=Object.freeze([
 {id:'greek-modern',systemId:'greek',languageTag:'el',title:{tr:'Modern Greek',en:'Modern Greek'},expectedCount:24,entries:greek},
 {id:'cyrillic-russian',systemId:'cyrillic',languageTag:'ru',title:{tr:'Russian Cyrillic',en:'Russian Cyrillic'},expectedCount:33,entries:russian},
 {id:'hiragana-basic',systemId:'hiragana',languageTag:'ja',title:{tr:'Hiragana',en:'Hiragana'},expectedCount:46,entries:kana,groups},
 {id:'morse-international',systemId:'morse',languageTag:'en',title:{tr:'International Morse',en:'International Morse'},expectedCount:36,entries:morse},
 {id:'braille-tr',systemId:'braille',languageTag:'tr',title:{tr:'Türkçe Braille',en:'Turkish Braille'},expectedCount:29,entries:braille('braille-tr','abcçdefgğhıijklmnoöprsştuüvyz','⠁⠃⠉⠡⠙⠑⠋⠛⠣⠓⠔⠊⠚⠅⠇⠍⠝⠕⠪⠏⠗⠎⠩⠞⠥⠳⠧⠽⠵')},
 {id:'braille-ueb',systemId:'braille',languageTag:'en',title:{tr:'İngilizce Braille',en:'English Braille'},expectedCount:26,entries:braille('braille-ueb','abcdefghijklmnopqrstuvwxyz','⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵')},
]);
export const dataset={profiles};
