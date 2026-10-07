"""Explicit immutable-source importer for the approved fourteen studies.
Existing JSON records are never overwritten.

Uses only Python's standard library. Generated JSON is migrated source content, not a
runtime HTML import. Rerun intentionally when updating a pilot's source revision.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json

ROOT = Path(__file__).resolve().parent.parent
INPUTS = {
    'turin-shroud': 'Torino_Kefeni_Interaktif_Dosya.html',
    'nazca-lines': 'Nazca_Cizgileri_Interaktif_Dosya.html',
    'codex-gigas': 'Codex_Gigas_Interaktif_Dosya.html',
    'copper-scroll': 'Bakir_Parsomen_Copper_Scroll_Interaktif_Dosya.html',
    'baigong-pipes': 'Baigong_Borulari_Interaktif_Dosya.html',
    'yonaguni-monument': 'Yonaguni_Aniti_Interaktif_Dosya.html',
    'roman-dodecahedra': 'Roma_Dodekahedronlari_Interaktif_Dosya.html',
    'rongorongo-script': 'Rongorongo_Yazisi_Interaktif_Dosya.html',
    'phaistos-disc': 'Phaistos_Diski_Interaktif_Dosya.html',
    'baghdad-battery': 'Bagdat_Pili_Interaktif_Dosya.html',
    'dendera-light': 'Dendera_Light_Interaktif_Dosya.html',
    'voynich-manuscript': 'Voynich_El_Yazmasi_Interaktif_Dosya.html',
    'antikythera-mechanism': 'Antikythera_Duzenegi_Interaktif_Dosya.html',
    'saksaywaman-puma-punku': 'Saksaywaman_Puma_Punku_Interaktif_Dosya.html',
}
VOID = {'br', 'hr', 'meta', 'link', 'img', 'input'}
ALLOWED = {'section', 'h2', 'h3', 'h4', 'p', 'div', 'span', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'details', 'summary', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'time', 'br', 'blockquote', 'sup', 'small'}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = {'tag': 'root', 'children': []}
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node = {'tag': tag, 'attrs': dict(attrs), 'children': []}
        self.stack[-1]['children'].append(node)
        if tag not in VOID:
            self.stack.append(node)
    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index]['tag'] == tag:
                del self.stack[index:]
                break
    def handle_data(self, data):
        self.stack[-1]['children'].append(data)

def walk(node):
    if isinstance(node, dict):
        yield node
        for child in node['children']:
            yield from walk(child)

def plain(node):
    return node if isinstance(node, str) else ''.join(plain(c) for c in node['children'])

def clean(node):
    if isinstance(node, str):
        return node
    tag, attrs = node['tag'], node.get('attrs', {})
    if tag not in ALLOWED or 'track' in attrs.get('class', '').split():
        return None
    # Inline styles, event handlers, uncalibrated evidence bars and shell are dropped.
    safe = {k: v for k, v in attrs.items() if k in {'id', 'class', 'href', 'colspan', 'rowspan', 'datetime'}}
    if tag == 'a' and not safe.get('href', '').startswith(('#', 'https://', 'http://')):
        raise ValueError('Unsupported source link')
    return {'tag': tag, 'attrs': safe, 'children': [result for c in node['children'] if (result := clean(c)) is not None]}

for case_id, filename in INPUTS.items():
    if (ROOT / 'src/content/mysteries' / case_id / 'tr.json').exists():
        print(f'Preserved existing content: {case_id}')
        continue
    source = ROOT / 'Yeni klasör' / 'Çözülemeyen Dosyalar' / filename
    raw = source.read_bytes()
    parser = Parser()
    parser.feed(raw.decode('utf-8'))
    sections = [clean(n) for n in walk(parser.root) if n['tag'] == 'section' and n.get('attrs', {}).get('id')]
    sections = [s for s in sections if s]
    if not sections or sections[0]['attrs']['id'] != 'ozet':
        raise ValueError(f'Unexpected pilot structure: {filename}')
    output = {
        'schemaVersion': 1, 'id': case_id, 'locale': 'tr',
        'source': {'filename': filename, 'sha256': hashlib.sha256(raw).hexdigest(), 'revision': '2026-10-06'},
        'editorial': {'translationState': 'source-only', 'independentlyReviewed': False},
        'sections': sections,
    }
    target = ROOT / 'src/content/mysteries' / case_id / 'tr.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Imported {case_id}: {len(sections)} sections')
