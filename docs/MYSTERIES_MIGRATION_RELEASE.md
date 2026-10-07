# Mysteries — 14 araştırmanın TR/EN migration ve production yayını

## Kapsam

Mevcut mimari, JSON semantic modeli, URL/locale modeli, reader, masaüstü tablo ve mobil kart yaklaşımı korundu. Kalan 11 çalışma özgün Türkçe HTML'den mevcut modele aktarıldı; tam doğal editoryal İngilizce sürümleri eklendi. Üç pilotun altı JSON içerik dosyası yeniden yazılmadı.

Yeni EN locale'leri, tüm yapısal çeviri kontrolleri geçtikten sonra etkinleştirildi. Editoryal çeviri bilimsel doğrulama değildir: tüm EN kayıtlarda translationState=editorial-translation ve independentlyReviewed=false. Yeni bilimsel iddia, kaynak veya kaynakların gücünü artıran statü eklenmedi.

## Katalog, sıralama ve canlı URL listesi

Her dosyada stable ID/slug, curated order, status, TR/EN başlık-soru-özet ve alias'lar tek katalogdan yönetiliyor. Özgün genel tablonun sırası korunuyor; durum dağılımı 🟢 4 / 🟡 5 / 🔴 5.

| Sıra | Çalışma | Statü | Kayıt | TR URL | EN URL |
|---|---|---|---|---|---|
| 1 | Torino Kefeni | 🟡 | Yeni | [TR](https://katovia.com/tr/mysteries/turin-shroud/) | [EN](https://katovia.com/mysteries/turin-shroud/) |
| 2 | Voynich El Yazması | 🔴 | Mevcut pilot | [TR](https://katovia.com/tr/mysteries/voynich-manuscript/) | [EN](https://katovia.com/mysteries/voynich-manuscript/) |
| 3 | Antikythera Düzeneği | 🟡 | Mevcut pilot | [TR](https://katovia.com/tr/mysteries/antikythera-mechanism/) | [EN](https://katovia.com/mysteries/antikythera-mechanism/) |
| 4 | Nazca Çizgileri | 🟡 | Yeni | [TR](https://katovia.com/tr/mysteries/nazca-lines/) | [EN](https://katovia.com/mysteries/nazca-lines/) |
| 5 | Codex Gigas | 🟢 | Yeni | [TR](https://katovia.com/tr/mysteries/codex-gigas/) | [EN](https://katovia.com/mysteries/codex-gigas/) |
| 6 | Bakır Parşömen | 🔴 | Yeni | [TR](https://katovia.com/tr/mysteries/copper-scroll/) | [EN](https://katovia.com/mysteries/copper-scroll/) |
| 7 | Baigong Boruları | 🟢 | Yeni | [TR](https://katovia.com/tr/mysteries/baigong-pipes/) | [EN](https://katovia.com/mysteries/baigong-pipes/) |
| 8 | Yonaguni Anıtı | 🟡 | Yeni | [TR](https://katovia.com/tr/mysteries/yonaguni-monument/) | [EN](https://katovia.com/mysteries/yonaguni-monument/) |
| 9 | Saksaywaman / Puma Punku | 🟢 | Mevcut pilot | [TR](https://katovia.com/tr/mysteries/saksaywaman-puma-punku/) | [EN](https://katovia.com/mysteries/saksaywaman-puma-punku/) |
| 10 | Roma Dodekahedronları | 🔴 | Yeni | [TR](https://katovia.com/tr/mysteries/roman-dodecahedra/) | [EN](https://katovia.com/mysteries/roman-dodecahedra/) |
| 11 | Rongorongo Yazısı | 🔴 | Yeni | [TR](https://katovia.com/tr/mysteries/rongorongo-script/) | [EN](https://katovia.com/mysteries/rongorongo-script/) |
| 12 | Phaistos Diski | 🔴 | Yeni | [TR](https://katovia.com/tr/mysteries/phaistos-disc/) | [EN](https://katovia.com/mysteries/phaistos-disc/) |
| 13 | Bağdat Pili | 🟡 | Yeni | [TR](https://katovia.com/tr/mysteries/baghdad-battery/) | [EN](https://katovia.com/mysteries/baghdad-battery/) |
| 14 | Dendera Light | 🟢 | Yeni | [TR](https://katovia.com/tr/mysteries/dendera-light/) | [EN](https://katovia.com/mysteries/dendera-light/) |

İndeksler: [Mysteries](https://katovia.com/mysteries/) ve [Gizem Dosyaları](https://katovia.com/tr/mysteries/). Her biri 14 dosya gösterir. Arama, alias, renk yanında metinli durum etiketi ve sıralama aynı kayıt kümesinden çalışır. İndeks sayaçları katalogdan türetilir.

## Yeni TR/EN JSON dosyaları

- src/content/mysteries/turin-shroud/tr.json
- src/content/mysteries/turin-shroud/en.json
- src/content/mysteries/nazca-lines/tr.json
- src/content/mysteries/nazca-lines/en.json
- src/content/mysteries/codex-gigas/tr.json
- src/content/mysteries/codex-gigas/en.json
- src/content/mysteries/copper-scroll/tr.json
- src/content/mysteries/copper-scroll/en.json
- src/content/mysteries/baigong-pipes/tr.json
- src/content/mysteries/baigong-pipes/en.json
- src/content/mysteries/yonaguni-monument/tr.json
- src/content/mysteries/yonaguni-monument/en.json
- src/content/mysteries/roman-dodecahedra/tr.json
- src/content/mysteries/roman-dodecahedra/en.json
- src/content/mysteries/rongorongo-script/tr.json
- src/content/mysteries/rongorongo-script/en.json
- src/content/mysteries/phaistos-disc/tr.json
- src/content/mysteries/phaistos-disc/en.json
- src/content/mysteries/baghdad-battery/tr.json
- src/content/mysteries/baghdad-battery/en.json
- src/content/mysteries/dendera-light/tr.json
- src/content/mysteries/dendera-light/en.json

Toplam 22 yeni JSON; pilotlarla birlikte 28 JSON. src/catalog/mysteries.js içine 11 kayıt eklendi, üç mevcut kayıt aynı metaverilerle curated sıralarına yerleştirildi.

## Kaynak, anchor ve parity

| ID | Section | Semantic element | Dolu metin alanı | Kaynak bağlantısı |
|---|---:|---:|---:|---:|
| turin-shroud | 9 | 189 | 174 | 0 |
| voynich-manuscript | 11 | 271 | 238 | 12 |
| antikythera-mechanism | 10 | 242 | 178 | 6 |
| nazca-lines | 10 | 221 | 175 | 6 |
| codex-gigas | 10 | 195 | 142 | 2 |
| copper-scroll | 10 | 197 | 145 | 5 |
| baigong-pipes | 9 | 160 | 120 | 1 |
| yonaguni-monument | 10 | 216 | 167 | 7 |
| saksaywaman-puma-punku | 11 | 209 | 157 | 6 |
| roman-dodecahedra | 9 | 202 | 152 | 5 |
| rongorongo-script | 10 | 213 | 171 | 7 |
| phaistos-disc | 9 | 200 | 154 | 6 |
| baghdad-battery | 9 | 189 | 149 | 3 |
| dendera-light | 9 | 189 | 144 | 6 |
| Toplam | 136 | 2893 | 2266 | 78 |

- Bütün tag, attribute, child sayısı ve sırası TR/EN arasında eşleşir. Kaynakta dolu metin alanının EN karşılığı boş olamaz.
- Section ID ve internal anchor'lar, kaynak href'leri, DOI dizileri ve kaynakça kayıtlarındaki 79 alıntılı eser başlığı korundu. Almanca/Fransızca/Türkçe eser adları kendi kaynak dilinde bırakıldı.
- Zaman çizelgeleri; Torino'nun durum bölümü; Rongorongo'nun Mamari bölümü; Voynich'in beş sorusu ve Saksaywaman/Puma Punku ayrımı korundu.
- Başlangıç hash karşılaştırması: 15 özgün HTML + altı pilot JSON = 21 dosyanın byte'ları değişmedi.
- Özgün HTML'ler silinmedi/taşınmadı. Kaynak denetiminin temiz checkout'ta tekrar edilebilmesi için değişmeden source sürümüne alındı; production artifact'ına dahil edilmedi.
- İçerik dışında orijinal inline CSS/event handler ve eski print kontrolü alınmadı; mevcut reader bunları zaten sağlar. Araştırma metninde eksik unsupported semantic öğe bulunmadı.

## SEO ve UX kontrolleri

- 28 araştırmada kendine ait canonical, doğru html lang, title/description, OG URL/locale ve Article.inLanguage.
- Her TR/EN çifti kendine ve diğer dile karşılıklı hreflang ve language link içeriyor.
- 28 araştırma + iki indeks sitemap'te; filtre/query kombinasyonları ayrı sitemap sayfaları değil.
- 14 dosyada önceki/tümü/sonraki bağlantıları curated order'a göre; ilk ve son dosyada olmayan komşu bağlantısı üretilmiyor.
- İki indekste alias araması, 🟢/🟡/🔴 filtre sayıları, iki yönde durum sıralaması ve curated sıra doğrulandı.
- 360/768/1440 pikselde aynı 14 kayıt: mobil kart / masaüstü tablo display parity, taşma yok.
- Tüm TR/EN sayfalar JavaScript kapalı erişilebilir; native teori açılırları çalışır.
- Her dosyada print bütün teori açılırlarını açar, ardından başlangıç durumunu geri yükler.
- Dil değişimi aynı stable anchor'ı korur; URL dili kayıtlı tercihten önceliklidir.

## Kaynak ve QA dosyaları

- .gitattributes: özgün HTML ve research JSON byte/hash değerlerini Windows/Unix checkout normalizasyonundan korur.
- scripts/import-mysteries.py: 14 açık kaynak girdisi; mevcut JSON'ları asla üzerine yazmaz.
- scripts/check-mysteries.mjs: source hash, çeviri sürümü, semantic parity, DOI ve kaynak adı doğrulaması.
- scripts/mysteries.mjs: aynı renderer; koleksiyon kopyası ve katalogdan türetilen toplam/durum sayaçları.
- scripts/qa-mysteries.mjs: local ve canlı ortamda aynı kapsamlı smoke sözleşmesi.
- scripts/live-qa.mjs: mevcut release akışına Mysteries smoke eklendi; oyun/araç/legacy QA devam eder.
- tests/mysteries.test.mjs ve tests/browser/mysteries.spec.js: 14 çalışma kapsamı ve 28 rota kontrolleri.
- src/i18n/messages.js ve home discovery metni: artık üç pilot yerine araştırma koleksiyonu.
- site/mysteries/, site/tr/mysteries/ ve site/sitemap.xml: mevcut generator tarafından üretildi.

Önceki, kabul edilmiş foundation/EN kaynak değişiklikleri de bu ilk Mysteries production paketinin source commit'inde birlikte saklanır. tanitim/ kullanıcı çalışma dosyaları kapsam dışında tutulur.

## Build, test ve yayın

- Production build: 60 statik giriş; allowlist/local-link ve legacy byte kontrolleri geçti.
- Node: 49/49 geçti.
- Browser: 77/77 geçti; mevcut TODAY/PLAY/TOOLS/CREATE/CHALLENGE/LAB regresyonları dahil.
- Dev QA: bütün 30 Mysteries rotası ve mevcut root/legacy yollar geçti.
- Gzip toplam: JS 46.831 byte, CSS 8.441 byte; mevcut performans bütçeleri içinde.
- Bağımlılık/lockfile, harici medya, ücretli servis, billing veya production resource eklenmedi.

Mevcut yayın akışı: scripts/release-pages.py baseline/prepare/publish Mysteries1. GitHub Pages main/root, katovia.com CNAME, HTTPS ve mevcut hosting ayarları korunur. Yayın yalnız dist artifact'ını içerir; önceki hashed assetler ve legacy yollar tutulur.

Doğrulanmış production baseline: 3e9d34d2e0ce2b334fede47eae169af3551452eb; 134 canlı dosya byte kontrolünden geçti. known-good tree arşivi ve forward-commit rollback hazırlanır; force-push/reset/clean yok.

Yayın durumu: final build/test kontrolü ardından publish ve canlı smoke bekleniyor. Sonuç ve commit SHA'ları aşağıdaki yayın kanıtına eklenecek.

## Takip notları

Çeviriler Türkçe kaynak sürümünün editoryal çevirileridir; bağımsız bilimsel kaynak incelemesi olarak sunulmaz. Özellikle yakın tarihli veya tartışmalı kaynak iddiaları sonraki editoryal incelemenin konusudur. Source hash/translation revision, ileride Türkçe içerik değişirse EN güncelleme ihtiyacının denetlenmesini sağlar.

> **Bu milestone tamamlandıktan sonra production yayını yap.**

Bu kullanıcı talimatı kapsamında source commit, artifact-only production deploy ve sonrasında canlı QA yetkilidir.
