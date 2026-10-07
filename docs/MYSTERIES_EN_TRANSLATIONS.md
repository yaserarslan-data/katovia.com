# Mysteries — üç pilotun tam İngilizce sürümleri

## Kapsam ve sonuç

Mevcut katalog, URL sistemi, reader şablonu, semantic içerik ağacı ve UX korunarak
yalnız üç pilotun tam İngilizce sürümleri eklendi. Türkçe JSON kaynak kabul edildi.
Kaynak metindeki teori, karşı argüman, nitel kanıt seviyeleri, belirsizlikler ve
birinci kişi değerlendirmeleri İngilizceye aktarıldı. Yeni bilimsel iddia veya
bağımsız bilimsel doğrulama statüsü eklenmedi.

EN kayıtlarda `translationState: editorial-translation`, `sourceLocale: tr`,
kaynak sürümü ve Türkçe JSON'un SHA-256 değeri tutuluyor.
`independentlyReviewed: false` korundu. Akademik yayın adları ve bibliyografik
tanımlayıcılar korunurken açıklama metinleri ve kaynak bağlantısı etiketleri çevrildi.

Bu milestone'un sonuçları önceki foundation raporundaki EN çeviri bekliyor
durumunun yerini alır. Commit ve deploy yapılmadı; aşağıdaki rotalar yerel build'de
etkindir, canlı siteye yayın yapıldığı anlamına gelmez.

## Yeni EN rotaları

| Araştırma | EN | TR karşılığı |
|---|---|---|
| Antikythera Mechanism | `/mysteries/antikythera-mechanism/` | `/tr/mysteries/antikythera-mechanism/` |
| Voynich Manuscript | `/mysteries/voynich-manuscript/` | `/tr/mysteries/voynich-manuscript/` |
| Saksaywaman / Puma Punku | `/mysteries/saksaywaman-puma-punku/` | `/tr/mysteries/saksaywaman-puma-punku/` |

İki indeksin mevcut URL'leri korunuyor: `/mysteries/` ve `/tr/mysteries/`.
EN indeksi artık tam EN araştırmalara bağlanıyor. Dil bağlantıları aynı dosyanın
karşılığına giderken query ve section hash bilgisini koruyor.

## Bu milestone'da eklenen ve değiştirilen dosyalar

Yeni içerik:

- `src/content/mysteries/antikythera-mechanism/en.json`
- `src/content/mysteries/voynich-manuscript/en.json`
- `src/content/mysteries/saksaywaman-puma-punku/en.json`

Güncellenen kaynak ve testler:

- `src/catalog/mysteries.js`: mevcut üç kayıtta EN locale etkinleştirildi;
  ID, sıra, statü ve URL fonksiyonları korunuyor.
- `scripts/mysteries.mjs`: EN hazırlık mesajları güncellendi; reader/table
  erişilebilirlik etiketleri mevcut renderer içinde yerelleştirildi.
- `src/mysteries/main.js`: mevcut language-link davranışında hash korundu.
- `tests/mysteries.test.mjs`: EN içerik parity, kaynak sürümü, DOI, bibliyografik
  başlık, metadata ve reciprocal hreflang kontrolleri eklendi.
- `tests/browser/mysteries.spec.js`: EN indeks beklentisi güncellendi; üç EN
  reader ve JavaScript kapalı EN okuma senaryoları eklendi.
- `docs/MYSTERIES_EN_TRANSLATIONS.md`: bu milestone raporu.

Üretilen sayfalar:

- `site/mysteries/index.html`
- `site/mysteries/antikythera-mechanism/index.html`
- `site/mysteries/voynich-manuscript/index.html`
- `site/mysteries/saksaywaman-puma-punku/index.html`
- `site/tr/mysteries/index.html`
- `site/tr/mysteries/antikythera-mechanism/index.html`
- `site/tr/mysteries/voynich-manuscript/index.html`
- `site/tr/mysteries/saksaywaman-puma-punku/index.html`
- `site/sitemap.xml`

TR üretilen sayfalarda dil bağlantıları ve çeviri bulunabilirliği mesajı
güncellendi; Türkçe araştırma JSON'u ve araştırma gövdesi değiştirilmedi.
`dist/` mevcut build sistemi tarafından yeniden üretildi.

## Parity ve koruma sonuçları

| Dosya | Section | Semantic element | Dolu metin alanı | Kaynak bağlantısı |
|---|---:|---:|---:|---:|
| Antikythera | 10 | 242 | 178 | 6 |
| Voynich | 11 | 271 | 238 | 12 |
| Saksaywaman / Puma Punku | 11 | 209 | 157 | 6 |
| Toplam | 32 | 722 | 573 | 24 |

TR/EN karşılaştırması bütün node türleri, attribute'lar, child sayıları ve sıraları
için birebir yapılıyor. Boş biçimlendirme node'ları korunuyor; kaynakta dolu metin
alanı varsa EN karşılığı boş bırakılamıyor. Section ID'leri, internal anchor'lar,
href'ler, tablo yapıları ve açılır teori blokları aynı. DOI dizileri ve özgün
İngilizce akademik eser başlıkları karşılaştırılıyor.

Bu yapısal kontroller, çevirinin bilimsel iddialarını bağımsız olarak doğrulamaz.
Editoryal çeviri incelemesinde özellikle olasılık/kanıt ayrımı, model bağımlılığı,
azınlık görüşleri ve “çözülmedi” nitelemeleri korunmuştur.

Milestone başında kaydedilen 18 dosyanın hash'leri sonunda aynı:
üç TR JSON ve genel tablo dahil 15 özgün HTML. Kalan 11 araştırma için içerik
kopyası, katalog kaydı veya rota eklenmedi. Dependency, lockfile, dış medya,
ücretli servis veya production kaynağı eklenmedi.

## SEO, build ve QA

- Her EN ve TR araştırmanın canonical'ı kendi dil URL'sini gösteriyor.
- Her çiftte kendine ve karşı dildeki sayfaya karşılıklı `hreflang` var.
- Her iki dilde gerçek statik içerik, doğru `html lang`, başlık, description,
  OG URL/locale ve `Article.inLanguage` üretiliyor.
- Altı araştırma ve iki indeks sitemap'te; filtre URL'leri sitemap'e eklenmedi.
- Yayın tarihi, bilimsel doğrulama veya yazar bilgisi uydurulmadı.
- `npm run build`: geçti; 38 statik giriş. Artifact allowlist, yerel bağlantılar
  ve korunan legacy dosyaların birebir kontrolü geçti.
- `npm run check`: 48/48 geçti; üretilen sayfa tutarlılığı dahil.
- `npx playwright test`: 65/65 geçti.
- `npm run test:dev`: sekiz Mysteries rotası ve mevcut uygulama yolları geçti.
- EN reader'lar 360, 768 ve 1440 pikselde taşmasız. Dil geçişleri, anchor,
  native teori açılırları, doğrudan yükleme/refresh ve EN önceki/tümü/sonraki
  bağlantıları kontrol edildi. JavaScript kapalı tam EN okuma geçti.
- Reader testlerinde runtime hatası veya harici asset isteği yok.
- Mobil/masaüstü EN ekran görüntüleri görsel olarak incelendi.
- Gzip asset toplamları: JS 46.826 byte, CSS 8.441 byte; mevcut bütçeler içinde.

Hiçbir commit veya deploy yapılmadı.
