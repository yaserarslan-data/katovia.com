# Alphabet Lab V1 — implementation ve yayın raporu

## Onaylı kapsam

Tek route: https://katovia.com/tools/alphabet-lab/

5 sistem, 6 profil, 194 temel kayıt. Harici ses, TTS, dinle, quiz, skor, hesap, backend ve full-text converter yok. Morse sesi V1'e eklenmedi. TR/EN arayüz dili veri profilini değiştirmez.

| Profil | Kayıt |
|---|---:|
| greek-modern | 24 |
| cyrillic-russian | 33 |
| hiragana-basic | 46 |
| morse-international | 36 |
| braille-tr | 29 |
| braille-ueb | 26 |
| Toplam | 194 |

Greek son sigma ve monotonic tonos/diaeresis biçimleri aynı 24 harfin varyantlarıdır; yeni kayıt veya tarihsel Greek profili eklenmedi. Russian yalnız 33 modern harf; Hiragana yalnız 46 temel kana; Morse yalnız A–Z + 0–9. Türkçe Braille 29 ve UEB 26 alfabetik eşleme ayrı profillerdir; tam Braille metin çevirisi yapılmaz.

## Dataset ve provenance

Dataset sürümü: alphabet-lab-v1.0.0; Unicode 17.0.0.

Kimlik, biçimler/kod noktaları/Unicode adları, symbolName, isimli romanization, yazılı pronunciation/function, profil üyeliği, sıra ve alan bazlı sourceRefs ayrı tutuldu. 194 kayıt derleme sırasında doğrulanır. Braille hücreleri nokta maskesinden hesaplanıp Unicode glyph'i ile kontrol edilir. Romanization diakritikleri silinmez; arama alias/sadeleştirme orijinal verinin üzerine yazmaz. Desteklenmeyen Morse é/ş, Hiragana が ve Greek micro sign µ sessizce başka kayda dönüştürülmez. Türkçe I/İ girdileri profil diline göre ele alınır.

Sabit kaynak sürümleri ve gerçek byte fingerprint'leri:

| Kaynak | Sürüm | SHA-256 |
|---|---|---|
| [Unicode Character Database](https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt) | 17.0.0 | 2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c |
| [UNGEGN Greek romanization report](https://arhiiv.eki.ee/wgrs/rom1_el.pdf) | 4.0 / March 2016; UN 1987 / ELOT 743 transcription | 43594ab5c3c4a3cbd8ef705c563292eb04868570e0c79788ba28ed39dc58e9a3 |
| [Greek Ministry of Education: Modern Greek phonetics](https://ebooks.edu.gr/ebooks/v/html/8547/2334/Grammatiki-Neas-Ellinikis-Glossas_A-B-G-Gymnasiou_html-apli/index_B_01.html) | Textbook edition accessed 2026-10-07; fingerprint pinned | 8dae271ff30651e1aafcd3fb00ef052ee2fe7dee4a87378b9d121a408ac399b7 |
| [University Library Bern: Russian romanization comparison / ALA-LC](https://www.ub.unibe.ch/unibe/portal/unibiblio/content/e6304/e1491782/e1491855/pane1491862/e1491864/files1491867/transliterationsvergleich_gesamt_ger.pdf) | ALA-LC Russian 2012; comparison fingerprint pinned | 3337605f76209f12a5048ce3399e443d8dc1cb033c01abf13d280c294e5d31c3 |
| [Library of Congress ALA-LC catalog](https://www.loc.gov/catdir/cpso/roman) | Russian table 2012 | 6308abf23dc6e9628e80e61b99028d5dc716859e8f2b5838d3d2c290c102174f |
| [Cornell Russian: Letters and Sounds, Part 1](https://russian.cornell.edu/russian.web/courses/305/letters_sounds_1.htm) | Slava Paperno; accessed 2026-10-07; fingerprint pinned | 895e2bf8d7a13dcef2fb10de82f87a9a5650bbef6dc676a3f68ddf3893d2389a |
| [Japan Agency for Cultural Affairs: romanization Q&A](https://www.bunka.go.jp/seisaku/kokugo_nihongo/kokugo_shisaku/pdf/94340701_01.pdf) | Cabinet Notice 2025-12-22; 2026 Q&A | 0466e5875139da14fc981339b6ae425e5ada3abce51c5cef61776c7b2885737a |
| [Japan Foundation Irodori kana chart](https://www.irodori.jpf.go.jp/assets/data/Kana_all.pdf) | Starter L1-14–16; accessed 2026-10-07; fingerprint pinned | d33b6a2328799ef40b9ce008a25baec8f556b74663a892211797ba431084d37f |
| [ITU-R International Morse Code](https://www.itu.int/rec/R-REC-M.1677-1-200910-I/en) | M.1677-1 / October 2009 / Annex 1 §§1.1.1–1.1.2 | 0c77492ec6aa90e937cbb60cce6efdb41442f156ff515cfab333383c9fcfd15e |
| [World Braille Usage](https://www.perkins.org/wp-content/uploads/2021/07/world-braille-usage-third-edition.pdf) | Third edition 2013 / Turkish p.204 | 921bbb31b52d2502c27e6db63fb3fe9feb07fabe991f6bc441f8a1fe54ee2768 |
| [MEB visual impairment teaching guide](https://orgm.meb.gov.tr/meb_iys_dosyalar/2025_05/06133757_gormeyetersizligi.pdf) | 2025 document / Figure 2, PDF p.15 | 29e55c6dcd39f1712abec583bcc84d2c6ab4a2bc072a51f4dd3c3eed330a2111 |
| [Rules of Unified English Braille](https://iceb.org/wp-content/uploads/2025/10/Rules-of-Unified-English-Braille-2024.pdf) | Third edition 2024 / §4.1 English alphabet | bf742499ee2eb3cbdf4914d97bbf0b2857bd3e91621f04a4990091b64e5a105e |

Kaynaklar yalnız dataset derleyicisinde incelenir. Production kaynaklara otomatik istek yapmaz; PDF/görsel/font/audio asset'leri ürüne kopyalanmaz. Unicode License V3'nin tam bildirimi hem dataset'te hem ürünün okunabilir lisans bölümünde tutulur. Diğer kaynakların ifade/görsel düzeni kopyalanmadı; factual eşlemeler kendi şemamızda ve özgün TR/EN açıklamalarla düzenlendi.

## UX, routing ve no-JS

TOOLS registry/card/related tools ile aynı design system kullanılır. Beş sistem seçimi, Braille için iki açık profil seçimi, karakter grid'i, arama ve bilgi paneli. TR/EN değişiminde profile, selected symbol, query/hash ve arama metni korunur. Profil query'de, sabit sembol ID'si anchor'da; geri/ileri, refresh ve malformed-link fallback kontrol edilir. Kullanıcı araması storage/analytics/URL'ye kaydedilmez.

No-JS HTML'de 194 kayıt ve altı temel tablo, sürüm/kaynak ve lisans bölümleri okunur. Style CSS doğrudan sayfadan yüklenir; lazy Alphabet client/dataset TOOLS indeksinde indirilmez. Mobil grid/panel tek sütun, masaüstünde iki sütun. Native düğme/klavye, görünür focus ve text dots açıklamaları vardır. Braille noktaları okuma yüzünden gösterilir; görsel araç dokunsal eğitim yerine geçmez.

## SEO ve maliyet

Tek canonical https://katovia.com/tools/alphabet-lab/. Unique title/description, OG metadata, gerçek ücretsiz WebApplication şeması. Sitemap'e yalnız temiz tool URL'si eklenir; query/anchor için ayrı sayfa veya sahte hreflang yok. UI-only TR/EN mevcut TOOLS locale modeliyle çalışır.

Yeni dependency veya lockfile değişikliği yok. Backend, ücretli servis/hosting/font/medya/TTS, Firebase billing veya production resource eklenmedi. Mevcut no-op analytics sürer; arama metni gönderilmez. Toplam asset bütçesi: JS 64.702 byte gzip, CSS 9.536 byte gzip; mevcut 80/25 KiB sınırlarının içinde.

## Dosyalar

- src/tools/alphabet/data.json, model.js, markup.js, client.js, style.css
- scripts/build-alphabet-data.py: stdlib + sistem curl; TLS doğrulaması kapatılmaz.
- src/catalog/tools.js / src/features/tools.js: registry ve lazy loader.
- src/i18n/messages.js / scripts/generate-pages.mjs: TR/EN UI ve mevcut statik MPA route.
- scripts/qa-alphabet.mjs / scripts/live-qa.mjs / scripts/check-dev.mjs: local/live/dev smoke.
- tests/alphabet.test.mjs / tests/browser/alphabet.spec.js
- site/tools/alphabet-lab/index.html ve mevcut registry-generated koleksiyon/sitemap çıktıları.

## QA

Production build: 61 statik giriş; artifact allowlist/local links ve 36 korunmuş legacy dosya birebir kontrolü geçti. Source manifest 37 dosya; root exception değişmedi.

Node: 54/54 geçti. Tam browser suite: 80/80 geçti. Son Greek variant/romanization arama tamamlamasından sonra Node54 ve Alphabet browser3 yeniden geçti. Dev smoke geçti. 360/390/430/768/1024/1440 genişliklerde TR/EN ve profile-state, no-JS, keyboard, refresh, history, unsupported characters ve sıfır external runtime request doğrulandı. Mobil/masaüstü ekran görüntüleri incelendi.

## Production yayın

Mevcut scripts/release-pages.py baseline/prepare/publish Alphabet1 akışı kullanılır. Başlangıç production SHA: 88a2d969cc6928621b2fe50080fc27e55d208f28; 181 canlı served dosya başlangıç byte kontrolünden geçti. Hosting, CNAME, HTTPS ve main/root ayarları korunur; yalnız build artifact yayınlanır. Rollback önceki doğrulanmış tree'ye forward commit olarak hazırlanır. Hata halinde otomatik uygulanır; başarılı yayın sonrası gereksiz geri dönüş yapılmaz.

Durum: **published — RELEASE VERIFIED Alphabet1**. Production ve kapsamlı canlı QA tamamlandı.


## Production kanıtı

- Canlı URL: https://katovia.com/tools/alphabet-lab/
- Production SHA: `a7bba6439074610f67696e85f0b315e2615c0181`
- Rollback SHA: `8cf5b726ccd4072fce90d2e5343157d2bc354184`
- Test edilmiş source SHA: `aa3087e4d17266429d75711dcb8cf31a72589996`
- GitHub Pages build: built, `2026-10-07T18:17:27Z`.
- 198 served dosya release tree ile byte-for-byte doğrulandı; korunmuş legacy yollar ve eski hashed assetler tutuldu.
- Canlı 194 kayıt ve altı profil; 24 / 33 / 46 / 36 / 29 / 26 sayıları doğrulandı.
- Canlı TR/EN profile/seçili sembol/query/hash korunması ve refresh; no-JS194 satır; altı viewport; canonical/sitemap geçti.
- Canlı Mysteries14 TR/EN, yeni üç tool, mevcut root bölümleri/PLAY/TOOLS/Memory/Reaction ve 18 legacy sayfa/QR geçti.
- Rollback tree'si başlangıç production tree'si ile aynı ve remote `codex/katovia-master-alphabet1-rollback` üzerinde hazır; başarılı yayında uygulanmadı.
- Yeni dependency, backend, ücretli servis, dış medya/ses/TTS veya production resource yok; package/lockfile, CNAME ve app-ads.txt değişmedi.
- Çalışma alanında kullanıcı tanitim dosyaları korunuyor; commit/deploy kapsamı dışında.
