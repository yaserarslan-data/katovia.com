"""Explicit, dependency-free dataset compiler. Sources are fetched only here,
never by the product. PDF/reference bytes stay in memory; only Unicode facts,
our original explanatory text and source fingerprints enter the dataset.
"""
from pathlib import Path
import hashlib, json, urllib.request, subprocess

ROOT = Path(__file__).resolve().parent.parent
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
def fetch(url):
    try:
        with opener.open(urllib.request.Request(url, headers={'User-Agent': 'Katovia-Alphabet-Source-Audit'}), timeout=30) as r:
            return r.read()
    except Exception:
        # Windows curl uses the OS certificate store. Never disable TLS checks.
        return subprocess.check_output(['curl.exe','--fail','--location','--silent','--show-error','--max-time','45','--proto','=https',url])

specs = [
 ('ucd', 'Unicode Character Database', '17.0.0', 'https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt', 'Unicode License V3; notice retained'),
 ('greek', 'UNGEGN Greek romanization report', '4.0 / March 2016; UN 1987 / ELOT 743 transcription', 'https://arhiiv.eki.ee/wgrs/rom1_el.pdf', 'Reference only; original text/layout not reproduced'),
 ('greek-reading', 'Greek Ministry of Education: Modern Greek phonetics', 'Textbook edition accessed 2026-10-07; fingerprint pinned', 'https://ebooks.edu.gr/ebooks/v/html/8547/2334/Grammatiki-Neas-Ellinikis-Glossas_A-B-G-Gymnasiou_html-apli/index_B_01.html', 'Reference only; original explanations'),
 ('russian', 'University Library Bern: Russian romanization comparison / ALA-LC', 'ALA-LC Russian 2012; comparison fingerprint pinned', 'https://www.ub.unibe.ch/unibe/portal/unibiblio/content/e6304/e1491782/e1491855/pane1491862/e1491864/files1491867/transliterationsvergleich_gesamt_ger.pdf', 'Reference only; independently arranged factual mappings'),
 ('russian-authority', 'Library of Congress ALA-LC catalog', 'Russian table 2012', 'https://www.loc.gov/catdir/cpso/roman', 'Reference only'),
 ('russian-reading', 'Cornell Russian: Letters and Sounds, Part 1', 'Slava Paperno; accessed 2026-10-07; fingerprint pinned', 'https://russian.cornell.edu/russian.web/courses/305/letters_sounds_1.htm', 'Page permits reproduction; explanations written for Katovia'),
 ('hiragana', 'Japan Agency for Cultural Affairs: romanization Q&A', 'Cabinet Notice 2025-12-22; 2026 Q&A', 'https://www.bunka.go.jp/seisaku/kokugo_nihongo/kokugo_shisaku/pdf/94340701_01.pdf', 'Reference only; no document/media reproduction'),
 ('hiragana-reading', 'Japan Foundation Irodori kana chart', 'Starter L1-14–16; accessed 2026-10-07; fingerprint pinned', 'https://www.irodori.jpf.go.jp/assets/data/Kana_all.pdf', 'Reference only; no PDF, illustrations or audio reused'),
 ('morse', 'ITU-R International Morse Code', 'M.1677-1 / October 2009 / Annex 1 §§1.1.1–1.1.2', 'https://www.itu.int/rec/R-REC-M.1677-1-200910-I/en', 'Reference only; our own arrangement of signal mappings'),
 ('braille-tr', 'World Braille Usage', 'Third edition 2013 / Turkish p.204', 'https://www.perkins.org/wp-content/uploads/2021/07/world-braille-usage-third-edition.pdf', 'Reference only; no PDF or artwork reused'),
 ('braille-tr-check', 'MEB visual impairment teaching guide', '2025 document / Figure 2, PDF p.15', 'https://orgm.meb.gov.tr/meb_iys_dosyalar/2025_05/06133757_gormeyetersizligi.pdf', 'Reference only'),
 ('braille-ueb', 'Rules of Unified English Braille', 'Third edition 2024 / §4.1 English alphabet', 'https://iceb.org/wp-content/uploads/2025/10/Rules-of-Unified-English-Braille-2024.pdf', 'Reference only; no rulebook text/media reproduced'),
]
sources=[]; unicode_data=None
for sid,title,version,url,rights in specs:
    raw=fetch(url)
    sources.append({'id':sid,'title':title,'version':version,'url':url,'sha256':hashlib.sha256(raw).hexdigest(),'accessedAt':'2026-10-07','reuse':rights})
    if sid=='ucd': unicode_data=raw.decode('utf-8')
    print('Pinned:',sid,flush=True)
ucd={int(line.split(';')[0],16):line.split(';')[1] for line in unicode_data.splitlines()}
profiles=[]
def form(value,role='primary'):
    cps=[ord(c) for c in value]
    assert all(cp in ucd for cp in cps)
    return {'text':value,'role':role,'codePoints':[f'U+{cp:04X}' for cp in cps],'unicodeNames':[ucd[cp] for cp in cps]}
def entry(pid,index,glyph,name,roman,reading,source_ids,upper=None,extra=None,kind='letter',dots=None,pattern=None):
    sid=f'{pid}-{ord(glyph):04x}'
    forms=[form(glyph,'lower' if upper else 'primary')]
    if upper: forms.insert(0,form(upper,'upper'))
    if extra: forms.append(form(extra,'word-final'))
    return {'id':sid,'order':index+1,'kind':kind,'forms':forms,'symbolName':name,'romanization':roman,'pronunciation':reading,'dots':dots,'pattern':pattern,'searchAliases':[glyph]+([upper] if upper else [])+([extra] if extra else []),'sourceRefsByField':{'forms':['ucd'],'symbolName':['ucd'],'romanization':source_ids[:1] if roman else [],'pronunciation':source_ids[1:] if reading['kind']=='written-guidance' else [],'representation':source_ids[:1]},'reviewState':'source-checked','audio':None}
def roman(value,scheme):return {'value':value,'scheme':scheme}
def guidance(tr,en):return {'kind':'written-guidance','text':{'tr':tr,'en':en}}
def na(tr,en):return {'kind':'not-applicable','text':{'tr':tr,'en':en}}
def profile(pid,system,lang,title,scheme,rows,srefs,groups=None):
    profiles.append({'id':pid,'systemId':system,'languageTag':lang,'title':title,'romanizationScheme':scheme,'expectedCount':len(rows),'sourceRefs':srefs,'groups':groups or [],'entries':rows})

greek='αβγδεζηθικλμνξοπρστυφχψω'
gn=['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','Sigma','Tau','Upsilon','Phi','Chi','Psi','Omega']
gt=['Alfa','Beta','Gama','Delta','Epsilon','Zeta','Eta','Teta','İota','Kappa','Lambda','Mü','Nü','Ksi','Omikron','Pi','Ro','Sigma','Tau','İpsilon','Fi','Hi','Psi','Omega']
gr=['a','v','g','d','e','z','i','th','i','k','l','m','n','x','o','p','r','s','t','y','f','ch','ps','o']
sounds=['a','v','ɣ / ʝ','ð','e','z','i','θ','i','k / c','l','m','n','ks','o','p','r','s','t','i','f','x / ç','ps','o']
rows=[]
for i,c in enumerate(greek):
    note_tr=f'Temel Modern Greek ses değeri: {sounds[i]}. Latin gösterim bir telaffuz kılavuzu değildir.'
    note_en=f'Basic Modern Greek sound value: {sounds[i]}. Romanization is not a pronunciation guide.'
    if c in 'γκχ':note_tr+=' Okuma, sonraki ses ve kelime bağlamına bağlıdır.';note_en+=' Reading depends on the following sound and word context.'
    if c=='σ':note_tr+=' Kelime sonunda küçük biçim ς kullanılır.';note_en+=' The lowercase word-final form is ς.'
    rows.append(entry('greek-modern',i,c,{'tr':gt[i],'en':gn[i]},roman(gr[i],'UNGEGN/ELOT 743 transcription; report v4.0 March 2016'),guidance(note_tr,note_en),['greek','greek-reading'],c.upper(),'ς' if c=='σ' else None))
    # Monotonic forms belong to the same 24 letters, never additional cards.
    for variant in {'α':'Άά','ε':'Έέ','η':'Ήή','ι':'ΊίΪϊΐ','ο':'Όό','υ':'ΎύΫϋΰ','ω':'Ώώ'}.get(c,''):
        rows[-1]['forms'].append(form(variant,'monotonic-variant'))
        rows[-1]['searchAliases'].append(variant)
profile('greek-modern','greek','el',{'tr':'Modern Greek','en':'Modern Greek'},'UNGEGN/ELOT 743 transcription; report v4.0 March 2016',rows,['ucd','greek','greek-reading'])

russian='абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
rr=['a','b','v','g','d','e','ë','zh','z','i','ĭ','k','l','m','n','o','p','r','s','t','u','f','kh','t͡s','ch','sh','shch','ʺ','y','ʹ','ė','i͡u','i͡a']
rn=['A','Be','Ve','Ge','De','Ie','Io','Zhe','Ze','I','Short I','Ka','El','Em','En','O','Pe','Er','Es','Te','U','Ef','Kha','Tse','Che','Sha','Shcha','Hard sign','Yeru','Soft sign','E','Yu','Ya']
rt=['A','Be','Ve','Ge','De','Ye','Yo','Je','Ze','İ','Kısa İ','Ka','El','Em','En','O','Pe','Er','Es','Te','U','Ef','Ha','Tse','Çe','Şa','Şça','Sert işaret','Yerı','Yumuşak işaret','E','Yu','Ya']
rsounds=['a','b / bʲ','v / vʲ','g / gʲ','d / dʲ','je / e','jo / o','ʐ','z / zʲ','i','j','k / kʲ','l / lʲ','m / mʲ','n / nʲ','o','p / pʲ','r / rʲ','s / sʲ','t / tʲ','u','f / fʲ','x / xʲ','t͡s','t͡ɕ','ʂ','ɕː',None,'ɨ',None,'e','ju / u','ja / a']
rows=[]
for i,c in enumerate(russian):
    read=guidance('Rusçada harf ve ses birebir eşleşmez. Okuma; vurgu, komşu sesler ve sert/yumuşak ünsüz bağlamına bağlıdır. Harf adı ve ALA-LC gösterimi ayrı bilgilerdir.','Russian letters and sounds do not correspond one-to-one. Reading depends on stress, adjacent sounds and plain/palatalized consonants. The letter name and ALA-LC output are separate information.')
    read=guidance(f'Temel ses gösterimi: {rsounds[i]}. Vurgu ve sert/yumuşak ünsüz bağlamı gerçek okumayı değiştirir; bu harf adı veya ALA-LC çıktısı değildir.',f'Basic sound notation: {rsounds[i]}. Stress and plain/palatalized context affect actual reading; this is not the letter name or ALA-LC output.')
    if c in 'еёюя':read=guidance(f'Temel ses gösterimi: {rsounds[i]}. Kelime başında, ünlüden veya ayırıcı işaretten sonra iki sesli okuma görülebilir; ünsüzden sonra bağlam değişir.',f'Basic sound notation: {rsounds[i]}. At the start of a word, after a vowel or after a separating sign, a two-sound reading may occur; after a consonant the context differs.')
    if c=='ь':read=na('Bağımsız ses değildir; yumuşaklık veya ayırma işlevi taşır.','No independent sound; marks softness or separation.')
    if c=='ъ':read=na('Bağımsız ses değildir; ayırıcı işaret olarak kullanılır.','No independent sound; used as a separating sign.')
    rows.append(entry('cyrillic-russian',i,c,{'tr':rt[i],'en':rn[i]},roman(rr[i],'ALA-LC Russian 2012'),read,['russian','russian-reading'],c.upper(),kind='modifier' if c in 'ъь' else 'letter'))
profile('cyrillic-russian','cyrillic','ru',{'tr':'Russian Cyrillic','en':'Russian Cyrillic'},'ALA-LC Russian 2012',rows,['ucd','russian','russian-authority','russian-reading'])

kana_groups=[('vowels','あいうえお',['a','i','u','e','o']),('k','かきくけこ',['ka','ki','ku','ke','ko']),('s','さしすせそ',['sa','shi','su','se','so']),('t','たちつてと',['ta','chi','tsu','te','to']),('n','なにぬねの',['na','ni','nu','ne','no']),('h','はひふへほ',['ha','hi','fu','he','ho']),('m','まみむめも',['ma','mi','mu','me','mo']),('y','やゆよ',['ya','yu','yo']),('r','らりるれろ',['ra','ri','ru','re','ro']),('w','わを',['wa','o']),('final','ん',['n'])]
rows=[];groups=[]
for group,chars,latin in kana_groups:
    ids=[]
    for c,value in zip(chars,latin):
        read=guidance(f'Yazılı okuma gösterimi: {value}. Latin harfleri Japonca seslerin yaklaşık gösterimidir.',f'Written reading: {value}. Latin letters are an approximate representation of Japanese sounds.')
        if c=='は':read=guidance('Tek kana olarak ha; parçacık kullanımında wa.','As an individual kana: ha; as a particle: wa.')
        if c=='へ':read=guidance('Tek kana olarak he; parçacık kullanımında e.','As an individual kana: he; as a particle: e.')
        if c=='を':read=guidance('Modern ortak dilde o. Klavye girişi wo, bu resmî Latin gösterimle aynı alan değildir.','In modern common Japanese: o. Keyboard input wo is distinct from this official romanization.')
        if c=='ん':read=guidance('n: bağımsız bir mora; gerçek ses komşu seslere göre değişir.','n: a separate mora; its realization varies with adjacent sounds.')
        row=entry('hiragana-basic',len(rows),c,{'tr':f'{value} kana','en':f'{value} kana'},roman(value,'Japanese Cabinet Notice 2025-12-22'),read,['hiragana','hiragana-reading'],kind='kana')
        row['group']=group
        if c=='を':row['searchAliases'].append('wo')
        rows.append(row);ids.append(row['id'])
    groups.append({'id':group,'entryIds':ids})
profile('hiragana-basic','hiragana','ja',{'tr':'Hiragana — 46 temel kana','en':'Hiragana — 46 basic kana'},'Japanese Cabinet Notice 2025-12-22',rows,['ucd','hiragana','hiragana-reading'],groups)

morse_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
patterns=['.-','-...','-.-.','-..','.','..-.','--.','....','..','.---','-.-','.-..','--','-.','---','.--.','--.-','.-.','...','-','..-','...-','.--','-..-','-.--','--..','-----','.----','..---','...--','....-','.....','-....','--...','---..','----.']
rows=[entry('morse-international',i,c,{'tr':f'{c} işareti','en':f'Sign {c}'},None,na('Konuşma telaffuzu değil; nokta/çizgi sinyal kodudur.','Not spoken pronunciation; a dot/dash signal code.'),['morse'],kind='digit' if c.isdigit() else 'letter',pattern=pattern) for i,(c,pattern) in enumerate(zip(morse_chars,patterns))]
profile('morse-international','morse',None,{'tr':'International Morse','en':'International Morse'},None,rows,['ucd','morse'])

dots={'a':'1','b':'12','c':'14','d':'145','e':'15','f':'124','g':'1245','h':'125','i':'24','j':'245','k':'13','l':'123','m':'134','n':'1345','o':'135','p':'1234','q':'12345','r':'1235','s':'234','t':'2345','u':'136','v':'1236','w':'2456','x':'1346','y':'13456','z':'1356','ç':'16','ğ':'126','ı':'35','ö':'246','ş':'146','ü':'1256'}
for pid,chars,lang,title,sref in [('braille-tr','abcçdefgğhıijklmnoöprsştuüvyz','tr',{'tr':'Türkçe Braille','en':'Turkish Braille'},'braille-tr'),('braille-ueb','abcdefghijklmnopqrstuvwxyz','en',{'tr':'UEB — İngilizce Braille','en':'UEB — English Braille'},'braille-ueb')]:
    rows=[]
    for i,c in enumerate(chars):
        raised=[int(d) for d in dots[c]];glyph=chr(0x2800+sum(1<<(n-1) for n in raised))
        row=entry(pid,i,glyph,{'tr':f'{c} harfi','en':f'Letter {c}'},None,na('Hücrenin bağımsız telaffuzu yoktur; seçilen profilde harf anlamını gösterir.','A cell has no independent pronunciation; it represents a letter in the selected profile.'),[sref],kind='braille-letter',dots=raised)
        row['inputToken']=c;row['searchAliases']+=[c,c.upper()];rows.append(row)
        row['sourceRefsByField']['symbolName']=[sref]
    profile(pid,'braille',lang,title,None,rows,['ucd',sref]+(['braille-tr-check'] if lang=='tr' else []))

expected=[24,33,46,36,29,26]
assert [len(p['entries']) for p in profiles]==expected
assert sum(expected)==194
license_text=fetch('https://www.unicode.org/license.txt').decode('utf-8')
assert license_text.startswith('UNICODE LICENSE V3')
data={'schemaVersion':1,'datasetVersion':'alphabet-lab-v1.0.0','unicodeVersion':'17.0.0','audioEnabled':False,'license':{'id':'Unicode-License-V3','url':'https://www.unicode.org/license.txt','text':license_text},'sources':sources,'profiles':profiles}
target=ROOT/'src/tools/alphabet/data.json';target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote six profiles / 194 records with fixed source fingerprints.',flush=True)
