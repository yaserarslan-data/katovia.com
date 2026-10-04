# KATOVIA 2.0 — EPIC 0 ANALYSIS

Tarih: 3 Ekim 2026 · İncelenen çalışma dizini: `C:\katovia.com`  
Baseline: `main`, `4afd0a1751905558bdc0ebf05ee5a509932f9139`  
Kapsam: keşif, mimari ve dönüşüm planı. Production kodu, bağımlılık, hosting ayarı veya Firebase kaynağı değiştirilmedi.

## 1. Executive Summary

Katovia, framework ve build sistemi olmadan yayınlanan bir statik site. `index.html` içindeki hash router vitrini yönetiyor; sekiz laboratuvar aracı ve on Canvas oyunu ayrı HTML sayfalarında çalışıyor. Dört mobil uygulamanın kaynak kodları bu repoda yok; yalnızca görselleri ve Play Store bağlantıları var. Yerel `tanitim/` deneyimi Git tarafından izlenmiyor.

Öneri: eski sayfaları ve URL’leri koruyarak, yeni ürün için **Vite + vanilla JavaScript ES modules + statik çok sayfalı çıktı** hazırlamak. React şu aşamada gerekli değil. TODAY, PLAY, TOOLS ve LAB gerçek HTML girişleri üretmeli; Canvas/Web Audio kodları ihtiyaç olduğunda yüklenmeli. Bu öneri uygulanmış bir migration değildir.

En kritik mimari sınır GitHub Pages: rastgele `/d/{id}` ve `/p/{id}` için server rewrite veya kişiselleştirilmiş Open Graph üretimi sağlayamaz. İlk aşamada `/d/?id=...` ve `/p/?id=...` güvenilir statik girişlerdir. Briefing’deki tam clean dynamic URL’ler kesin gereksinim olduğunda, DUEL öncesinde rewrite destekleyen hosting/edge katmanı için ayrı karar alınmalı. 404 üzerinden çalışan SPA, güvenilir canonical paylaşım mimarisi olarak önerilmez.

Önce Foundation + ayrı preview shell; sonra ilk gerçek daily deneyimi. Global percentile, gerçek zamanlı trending ve sunucuda doğrulanmış skorlar veri/backend tamamlanmadan gösterilmemeli. Ana başarı ölçüleri paylaşım girişimi ve ertesi gün geri dönüş; tarayıcı paylaşım sonucunu gerçek teslim olarak ölçmek mümkün değil.

## 2. Current Stack

| Alan | Kanıtlanan durum |
|---|---|
| Dil / UI | Türkçe HTML5, inline CSS, browser JavaScript; framework yok |
| Build / dependency | `package.json`, lockfile, bundler, TypeScript config veya test runner yok |
| Ana sayfa | 2.006 satır, 82.407 bayt; stil, katalog, renderer ve router tek dosyada |
| Oyunlar | On bağımsız HTML, inline Canvas 2D mantığı ve RAF döngüleri |
| Araçlar | Beş mesaj/söz sayfasında inline mantık + yerel veri; üç araçta ayrı JS |
| Üçüncü taraf | QR ve kartvizitte yerel `kjua 0.10.0`; MIT lisans ve kaynak/hash kaydı var |
| Font / efekt | System font fallback; `Inter` adı kullanılıyor fakat font indirme tanımı yok. CSS gradient, blur, SVG ve keyframe efektleri |
| Storage | Bazı oyun skorları, mesaj geçmişleri ve söz favorileri localStorage’da |
| Backend | Firebase config/SDK, Auth, Firestore, API veya backend kodu tespit edilmedi |
| Analytics | Analytics SDK/event tracking tespit edilmedi |
| Reklam | `app-ads.txt` var; bu dosya web sitesinde reklam SDK’sı çalıştığı anlamına gelmez |
| PWA | Manifest, service worker ve offline cache uygulaması yok |
| SEO | Araçlarda description/title mevcut; ana sayfada yalnız temel title/viewport. Canonical, OG, Twitter card, JSON-LD, sitemap ve robots yok |
| Hata sayfası | Repo içinde özel `404.html` yok; araçlarda yerel hata/status/fallback akışları var |
| CI/CD | Repo içinde `.github/workflows` yok; yayın ayarları repodan kesin belirlenemiyor |
| Domain | `CNAME`: `katovia.com`; origin GitHub `yaserarslan-data/katovia.com` |

Yerel kjua SHA-256, vendor README’deki `5B627E...22279` kaydıyla eşleşiyor. CDN script bağımlılığı bulunmadı; Play Store linkleri dış navigasyondur.

## 3. Current Repository Architecture

```text
index.html                 # shell, hash router, veri dizileri, renderer, tüm global CSS
assets/apps/               # dört JPEG
oyunlar/*.html             # on bağımsız Canvas oyunu
laboratuvar/*.html         # sekiz bağımsız araç
laboratuvar/data/*.js      # altı yerel içerik/preset veri dosyası
laboratuvar/js/*.js        # QR, kartvizit, karar pusulası
laboratuvar/vendor/        # kjua, lisans, kaynak kaydı
tanitim/                   # HTML + JS; başlangıçta untracked
CNAME, app-ads.txt
PROJECT_CONTEXT.md, README.md
.agents/                   # bu checkout’ta dosya/instruction bulunmadı
```

`navItems`, `projects`, `games`, `codes`, `routeContent`, `featuredProjectTitles` ve `labToolTitles` ana sayfanın veri/filtre kaynakları. Ortak engine veya component modülleri yok; `renderHome`, `renderNav`, `setRoute` gibi tekrar kullanılan fonksiyonlar yalnız ana dosyada. `codes` gerçek indirilebilir kaynak dosyaları değil, vitrinde gösterilen örnek snippet dizisi. Bazı snippet isimleri mevcut dosya yollarını temsil etmiyor.

Router `location.hash`, `hashchange`, whitelist/fallback ve `location.replace` kullanıyor. Bilinmeyen hash ana sayfaya normalleştiriliyor. Bağımsız sayfalar `../index.html#laboratuvar` veya `#oyunlar` dönüşüne bağlı; yeni shell bu fragmentleri desteklemeli.

Ana sayfa 760/480px ve tablet kuralları, hover media query, mobil menü Escape/focus davranışı ve reduced-motion içeriyor. Laboratuvar araçlarında responsive/reduced-motion desteği yaygın. Oyunlarda uygulama kalitesi farklı: Kuş Fotoğrafçısı pointer koordinat dönüşümü, görünürlükte pause ve monotonic timer içerirken Yük Ustası `update()` çağrısını her frame çalıştırıyor; bu mantık yeni Daily Engine’e doğrudan taşınmamalı. Bazı oyunlarda try/catch olmadan localStorage okunuyor; depolama engellendiğinde başlangıç hatası oluşabilir.

Tanıtım deneyimi Web Audio, dokuz sahneli timeline, sesli/sessiz başlangıç, görünürlükte pause, reduced motion ve safe-area/dvh desteği içeriyor. Bunlar yararlı referanslar; ana shell içine tüm timeline taşınmamalı.

`PROJECT_CONTEXT.md` eski stüdyo vizyonunu ve build/backend/analytics sınırlarını anlatıyor. Bu görevde yeni briefing ürün yönünü belirler; eski belgedeki ürün tanımı ve roadmap’in v2 ile uzlaştırılması ilk milestone’un dokümantasyon işidir. Belge bu analizde değiştirilmedi. Lisans, kullanıcı değişikliklerini koruma ve veri minimizasyonu ilkeleri değerli kalır.

### Doğrulama kapsamı

- Tüm yerel HTML/JS dosyalarında kaynak, link, storage, network, metadata ve interaction taraması; önemli router, renderer, araç validation/export ve oyun lifecycle kodlarının içerik incelemesi yapıldı.
- Node `--check`: ayrı JS ve dolu inline scriptler dahil **27 blok/dosya**, sıfır syntax hatası. Runtime doğrulaması değildir.
- HTML’deki sabit yerel `href/src`: sıfır eksik hedef. Template içindeki dinamik URL’ler bu otomatik kontrolün dışında; katalog oyun/araç yolları ayrıca mevcut dosya envanteriyle karşılaştırıldı.
- Canlı ana sayfa web üzerinden erişilebilir. QR sayfasının web aracı isteği internal error verdi; bunun gerçek HTTP 404 olduğunu iddia etmiyoruz.
- GitHub Pages Settings, DNS/TLS ayarları, son deployment SHA’sı, trafik, gerçek cihazlar ve tarayıcı runtime ölçümleri doğrulanmadı. Bu rapor mobil/masaüstü görsel QA veya Lighthouse sonucu içermez.

## 4. Existing Public Routes

Aşağıdaki URL’ler repo kaynaklı envanterdir; her birinin canlı yayın durumu ayrı ayrı doğrulanmış değildir. Fragmentler `/` ve `/index.html` altında çalışır. Koruma önerileri silme kararı değildir.

| Route | Source | Current Purpose | Proposed Future |
|---|---|---|---|
| `/`, `/index.html`, `/#ana-sayfa` | `index.html` | Aktif vitrin | Yeni oynanabilir home; eski fragment/alias korunur |
| `/#uygulamalar` | `index.html` | Dört mobil uygulama | `/lab/` uygulama kataloğu; eski hash uyumlu |
| `/#laboratuvar` | `index.html` | Yedi görünür araç | `/tools/` ve LAB ayrımı; eski hash korunur |
| `/#oyunlar` | `index.html` | On oyun listesi | LAB oyun kataloğu; eski hash korunur |
| `/#kodlar` | `index.html` | Kaynak bölümü placeholder | LAB geliştirme notları; kaynak varmış gibi sunulmaz |
| `/#gizlilik` | `index.html` | Politika listesi placeholder | Gerçek privacy sayfası + eski hash desteği |
| `/#iletisim` | `index.html` | Contact placeholder | Gerçek iletişim içeriği veya LAB footer; hash korunur |
| `/laboratuvar/qr-kod-olusturucu.html` | aynı yol | Aktif; link/metin/Wi-Fi/WhatsApp QR + PNG | TOOLS QR Generator; legacy URL kalır |
| `/laboratuvar/dijital-kartvizit-olusturucu.html` | aynı yol | Aktif; üç tema, PNG/QR/vCard | TOOLS kartvizit; legacy URL kalır |
| `/laboratuvar/karar-pusulasi.html` | aynı yol | Aktif; ağırlıklı karar karşılaştırması | LAB yardımcı deney; sonra TOOLS uygunluğu değerlendir |
| `/laboratuvar/cuma-mesaji.html` | aynı yol | Aktif; mesaj üret/kopyala/paylaş | LAB mesaj koleksiyonu |
| `/laboratuvar/kandil-mesaji.html` | aynı yol | Aktif; kandil türlerine göre mesaj | LAB mesaj koleksiyonu |
| `/laboratuvar/dogum-gunu-mesaji.html` | aynı yol | Aktif; kişiselleştirilmiş mesaj | LAB mesaj koleksiyonu |
| `/laboratuvar/bayram-mesaji.html` | aynı yol | Aktif; bayram mesajı | LAB mesaj koleksiyonu |
| `/laboratuvar/guzel-sozler.html` | aynı yol | Çalışan eski koleksiyon; vitrinde gizli | ARCHIVE önerisi; direkt URL korunur |
| `/oyunlar/yuk-ustasi.html` | aynı yol | Aktif Canvas yükleme oyunu | LAB; açıklama gerçek mekaniğe uyarlanır |
| `/oyunlar/tas-yagmuru.html` | aynı yol | Aktif; title “Dağ Tırmanma” | LAB; katalog/title tutarlılığı incelenir |
| `/oyunlar/sut-gol.html` | aynı yol | Aktif; title “Tampon Gol” | LAB; isim tutarlılığı incelenir |
| `/oyunlar/serit-kacisi.html` | aynı yol | Aktif şerit kaçış oyunu | LAB |
| `/oyunlar/kus-fotografcisi.html` | aynı yol | Aktif kuş fotoğraf oyunu | LAB; lifecycle referansı |
| `/oyunlar/golf-mini-oyun.html` | aynı yol | Aktif mini golf | LAB |
| `/oyunlar/falso-sut.html` | aynı yol | Aktif falso oyunu | LAB |
| `/oyunlar/buz-hokeyi.html` | aynı yol | Aktif hokey | LAB |
| `/oyunlar/bilardo.html` | aynı yol | Aktif bilardo | LAB |
| `/oyunlar/araba-firlat.html` | aynı yol | Aktif araba fırlatma | LAB |
| `/tanitim/katovia-tanitim.html` | aynı yol, untracked | Yerel deneysel tanıtım | Kullanıcı çalışması korunur; yayın durumu bilinmiyor |
| `/app-ads.txt` | `app-ads.txt` | Reklam satıcısı beyanı | KEEP; harici uygulama ilişkisi nedeniyle korunur |

`/laboratuvar`, `/oyunlar`, `/kodlar` bağımsız index route’ları olarak repo içinde yok. Privacy uygulama belgeleri de gerçek sayfa olarak yok. Dört dış Play Store uygulaması: `com.katovia.balonlubum`, `com.katovia.karesavaslari`, `com.katovia.iletisim_analizi`, `com.katovia.mental_detox`; bunlar Katovia public route’u değildir ve yeniden doğrulanmalı.

## 5. Existing Content Classification

| Sınıf | İçerik | Gerekçe / koşul |
|---|---|---|
| KEEP | `CNAME`, `app-ads.txt`, vendor lisans/kaynak kayıtları, değerli veri dosyaları | Domain, uygulama bağımlılıkları ve köken kayıtlarını koru |
| MOVE TO LAB | On eski oyun, dört mobil uygulama vitrini, mesaj araçları, Karar Pusulası | Eski ürünleri görünür ve ulaşılabilir tut |
| MOVE TO TOOLS | QR ve dijital kartvizit | Browser-side pratik araçlar; mevcut mantık değerli |
| REFACTOR | Monolit home/router/katalog, ortak paylaşım ve storage, oyun lifecycle, büyük görseller | Ortak altyapı, performans ve bakım ihtiyacı |
| ARCHIVE | Güzel Sözler’in ana navigasyondan uzak tutulması; eski tanıtım için değerlendirme | URL’yi kapatma anlamına gelmez; tanıtım kullanıcı dosyasıdır |
| REMOVE CANDIDATE | Fal Yorumu/Mini APK gibi teslim edilmemiş vaatler, yanıltıcı kaynak snippetleri | Önce ürün kararı; mevcut gerçek dosyaları silme önerisi yok |

Mesaj datasetleri Creator quiz içeriği değildir; şablon/veri ayrımı örneği olarak kullanılabilir. Eski oyunların tamamını yeni Game Engine’e taşımak ilk sürüm şartı yapılmamalı.

## 6. Hosting & Routing Analysis

GitHub Pages statik hosting sağlar; publish source branch/root veya Actions ayarı olabilir. Yerel workflow yokluğu branch publication ihtimalini güçlendirir, ancak kanıtlamaz. Önce Settings → Pages ve son başarılı deployment artifact/SHA doğrulanmalı. `CNAME` tek başına DNS veya Pages custom-domain ayarının kanıtı değildir. [GitHub yayın modeli](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

| İhtiyaç | Pages üzerinde güvenilir uygulama |
|---|---|
| `/today`, `/play`, `/challenge`, `/create`, `/tools`, `/lab` | İlgili `route/index.html`; link/canonical tercihi `/route/` |
| `/play/{experience}`, `/tools/{slug}`, `/lab/{project}` | Katalogdaki sonlu route’lar için build-time HTML üret |
| `/d/{id}`, `/p/{id}` | Rastgele ID için dosya yok; doğrudan istek/refresh 404 |
| `/d/?id=...`, `/p/?id=...` | Gerçek statik giriş + client-side Firebase data fetch; refresh çalışır |
| Gelecekte tam clean dinamik link | Rewrite destekli host/edge; kişisel OG gerekiyorsa server/edge HTML |

History SPA sadece JS navigation sırasında çalışır; refresh’te host route’u bilmez. Özel `404.html` client router bootstrap yapabilir veya URL’yi güvenli query’ye çevirebilir; ilk HTTP cevabı yine 404, script çalışmayan crawler’larda içerik/OG yoktur. Gerçek olmayan URL’leri de home’a yönlendirmek soft-404 ve teşhis problemlerine yol açar. Fallback yalnız allowlist `/d/`, `/p/` ve sıkı ID doğrulamasıyla geçici compatibility olabilir; yeni paylaşımlar query biçimi üretmeli. [GitHub özel 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site).

Firebase veriyi sağlar, GitHub Pages URL çözümleme problemini çözmez. Tüm creator içerikleri için build tetiklemek gecikme, abuse ve maliyet nedeniyle önerilmez. Server redirect olmayan Pages’te gerçek 301/308 uygulanamaz; legacy HTML’yi korumak en güvenilir başlangıçtır. Sonradan canonical/meta redirect gerekiyorsa browser redirect’in 301 olmadığını kabul et; tüm eski linkleri hemen değiştirme.

Preview localhost’ta SPA fallback kullanırsa Pages hatalarını gizleyebilir. Deploy artifact’ı düz statik server ile, doğrudan giriş/refresh ve trailing-slash davranışıyla sınanmalı. Repo altında preview path’inde domain-root varsayımı ayrıca test edilmeli.

## 7. Recommended Technology Direction

| Seçenek | Güçlü taraf | Maliyet / karar |
|---|---|---|
| Mevcut vanilla yapı | Sıfır migration, legacy sorunsuz | Inline tekrarlar, asset pipeline ve chunk kontrolü zayıf; yalnız koruma katmanı |
| Vite + vanilla modules | Yakın teknoloji, modüler import, build asset/chunk yönetimi, MPA | Build/deploy kurulumu gerekir; **önerilen yön** |
| React + Vite | Karmaşık creator editörü için güçlü state/component modeli | Şimdi gereksiz runtime/migration; Canvas motoruna temel avantaj sağlamaz |
| Astro gibi statik odaklı hafif yaklaşım | Statik SEO ve islands | Yeni framework ve öğrenme; v1’de mevcut HTML yetiyor |

Vite çoklu HTML girişlerini destekler. Vanilla da dynamic `import()` ile engine/deney modüllerini ayırabilir. [Vite build / MPA](https://vite.dev/guide/build).

Canvas 2D, WebGL/Three.js ve Web Audio UI framework’ünden bağımsız mount/dispose modülleridir. Three.js yalnız seçilen deneyde import edilir; backend SDK yalnız bulut ihtiyacı veya gerekli izin olduğunda yüklenir. Tools içeriği HTML’de statik, editor/oyun davranışı JS’de olur. Firebase adapter, çekirdeği sağlayıcıdan ayırır. Creator ilk etapta iki sınırlı template, açık form state’i ve DOM renderer ile yapılabilir; karmaşıklık gerçekten artarsa creator-only component katmanı ayrı ADR ile değerlendirilir.

ES modules JSDoc sözleşmeleri ilk sürüm için yeterli; sırf mimari görünüm için TypeScript veya ECS ekleme. Yeni build sistemi bu analiz sırasında kurulmadı; ilk implementation görevi kapsamına açıkça dahil edilmelidir.

## 8. Proposed Katovia 2.0 Architecture

```text
site/                        # v2 HTML entry/template kaynakları; legacy köke dokunma
  index.html
  today/index.html
  play/index.html
  challenge/index.html
  create/index.html
  tools/index.html
  lab/index.html
  d/index.html               # query ID ile güvenilir dynamic entry
  p/index.html
src/
  shell/                     # nav, route alias, erişilebilir UI lifecycle
  ui/                        # button, result, toast/status; yalnız ihtiyaç kadar
  styles/                    # tokens, base, shell, motion
  core/
    identity.js              # local ID, isteğe bağlı anonymous-auth bağlantısı
    storage.js               # versioning, quota/parse/error fallback
    analytics.js             # event sözleşmesi, varsayılan no-op
    share.js                 # payload, native, clipboard, image export
    errors.js
    data/                    # local ve firebase repository adapters
  engines/
    game.js                  # lifecycle ve sonuç sözleşmesi; dev framework değil
    daily.js                 # gün/seed/attempt/streak
    score.js                 # oyun bazlı ölçü/direction/version karşılaştırması
    duel.js                  # creation, opponent attempt, rematch
    creator.js               # template schema, validation, publish/play
  features/                  # today/play/challenge/create/tools/lab page controllers
  games/                     # stop-at-five, reaction, memory, color, estimate
  experiences/               # particles, pixel-music, aquarium
  tools/                     # bağımsız lazy tool modülleri
  templates/                 # quiz, know-me schema + renderer
  catalog/                   # tek experience/tool/lab registry
public/                      # yalnız v2 static assets/OG; legacy ayrı kopyalanır
scripts/                     # static route generation, explicit legacy-copy checks
tests/                       # engine, route smoke, gerekli Firebase emulator testleri
docs/                        # ADR, plan ve route envanteri
dist/                        # üretilen artifact; kaynakların yerine geçmez
```

Mevcut `index.html`, `laboratuvar/`, `oyunlar/`, `assets/`, `CNAME`, `app-ads.txt` build sırasında açık allowlist ile korunur; kökü körlemesine public’e kopyalamak `.git`, doküman veya private dosyaları yayınlayabilir. İlk preview artifact’ında eski home kökte, v2 shell `/v2/` altında; cutover’da home root’a alınır. `tanitim/` ancak ayrıca kapsamı kesinleştirildiğinde artifact’a girer.

Game contract: `mount(container, {seed, mode, input, onComplete}) → dispose()`. `dispose` RAF, listener, audio ve GPU kaynaklarını bırakır. Engine UI’ye DOM basmaz. Daily seçim manifesti `{date, gameId, gameVersion, seed, scoringVersion}` içerir; oyun türleri aynı seed kurallarıyla üretilebilir. Score `{raw, unit, direction, normalized, scoringVersion}`: örneğin reaction’da küçük ms, memory’de yüksek doğruluk daha iyidir; farklı oyun raw skorları karşılaştırılmaz.

## 9. Proposed Data Model

Bu şema taslaktır; collection oluşturulmadı. Anonymous UUID yerel state kimliğidir; bulut yetkisi için doğrulanmış Firebase Auth UID gerekir. Kimlikler birbirine eşit varsayılmamalı. Firebase anonim hesabı daha sonra kimlik sağlayıcısına bağlanabilir. [Anonim Auth](https://firebase.google.com/docs/auth/web/anonymous-auth?hl=en).

| Model / önerilen yol | Alanlar | Erişim / maliyet kararı |
|---|---|---|
| Local identity / `users/{uid}` | `schemaVersion`, local `anonymousId`, server `createdAt`, `lastSeenAt`, `streak`, `lastCompletedDay`, optional `preferences` | Local ID private; bulutta owner-only. Her pageview’de lastSeen write yapma; oturum/gün bazlı |
| Daily config `daily/{dayKey}` | `date`, `gameId`, `gameVersion`, `seed`, `scoringVersion`, `opensAt`, `closesAt` | Public küçük read; write trusted service/admin; statik manifest de olabilir |
| Result `users/{uid}/dailyResults/{dayKey}` | `date`, `gameId`, `userId`, `score`, sınırlı `metadata`, `completedAt`, `version`, `verificationStatus` | Owner read, create-only normal sonuç. Tek belge anahtarı tek kayıt; UID sıfırlamayı önlemez |
| Duel private `duels/{duelId}` | `gameId/version`, `seed`, `creatorId`, `creatorScore`, nullable `opponentId/Score`, `status`, `createdAt`, `expiresAt`, `parentDuelId` | Bir challenge tek opponent; transaction ile claim. Katılımcı verisi herkese listelenmez |
| Duel public projection `duelPublic/{duelId}` | oyun/seed, hedef skor, public status, expiry | UID yok; ID bazlı get, list yok; update trusted service |
| Private draft `users/{uid}/drafts/{id}` | `type/version`, `title`, `questions/content`, `theme`, timestamps | Owner-only; mümkünse cihazda taslak |
| Published `creations/{creationId}` | allowlisted `type`, `schemaVersion`, `title`, `questions`, `theme`, `createdAt`, `status`, `playCount` | Public projection’da creator UID ve hassas veri yok; private owner map ayrı |
| Quiz answer key `creationKeys/{id}` | doğru cevaplar + owner mapping | Public doc’a koyma; güvenilir puanlama için trusted service. İlk tamamen client-side quiz sonucu eğlence amaçlı |
| Daily aggregate `dailyStats/{dayKey}` | oyuncu sayısı, histogram, update/version | Trusted aggregate; client global counter yazamaz |

Önerilen sınırlar: title 120 karakter; v1 en çok 20 soru × 6 cevap; soru 300, cevap 200 karakter; toplam publish payload 64 KiB; tema enum; upload yok. Bunlar ürün/test ile netleştirilecek bütçeler. Score metadata oyun başına schema ve küçük byte sınırı taşır. Duel varsayılan 7 gün; public oyuncu içeriği silme/retention politikası ayrıca belirlenir. TTL silinmesi gecikse de expiry erişimde uygulanır.

Daily günü herkes için tek timezone’da tanımla: başlangıç önerisi UTC. UI kullanıcının cihaz saatinden bağımsız kapanış saatini gösterir. Paylaşım numarası sabit release epoch’undan üretilir. Offline local sonuçlar unverified; clock değiştirme, auth sıfırlama veya istemci skor manipülasyonu leaderboard güvenini bozar. Streak yerelde motivasyon; güvenilir global streak sunucu manifesti/zamanı ile hesaplanır.

Firestore document read alan bazında gizleme sağlamaz; public/private ayrımı gerçek ayrı belgelerdir. Rules, şema ve owner kontrolü içindir; gerçek skor doğrulama, genel rate limit ve güvenilir counter trusted endpoint gerektirir. Rules emulator testleri modelle birlikte yazılmalı. [Firebase rules testleri](https://firebase.google.com/docs/firestore/security/test-rules-emulator).

## 10. Performance Strategy

Ölçülmüş baseline: ana HTML 82,4 KB raw, yerel gzip tahmini 18,6 KB; bu gerçek HTTP transfer değildir. JPEG’ler 1.992.490 + 2.899.941 + 1.401.119 + 619.284 = **6.912.834 bayt**. İlk home render’ında featured uygulama görselleri lazy attribute olmadan üretiliyor; tüm dört görselin ilk yüklemede indirildiği iddia edilmiyor. JS/CSS küçüklüğüne rağmen resim maliyeti önemlidir.

| Ölçü | v1 başlangıç bütçesi |
|---|---|
| Initial JS | Shell + aktif basit daily toplam ≤80 KiB gzip; ağır SDK/deney hariç |
| Initial CSS | ≤25 KiB gzip |
| Initial transfer | Home ≤250 KiB compressed; sonradan açılan deney hariç |
| LCP / CLS / INP | Mobil p75 ≤2,5s / ≤0,1 / ≤200ms |
| Görsel | Boyuta uygun AVIF/WebP + JPEG fallback, `srcset/sizes`, width/height; kart çoğunlukla ≤80 KB |
| Animation | Hedef 60 FPS; adaptive 30 FPS fallback; frame budget 16,7ms |
| Three.js / audio | İlk bundle’da yok; görünür deney/user gesture sonrası lazy load |
| Font | Başlangıç system font; özel font gerekirse subset WOFF2 ve bütçe |
| Cache | Hashli asset; hosting header gerçekliği ölçülür, kontrol edilemeyen immutable header vaat edilmez |

Web Vitals eşikleri kullanıcı saha ölçümleridir; Lighthouse bunların tamamının yerine geçmez. [Web Vitals](https://web.dev/articles/vitals). Build gzip/brotli raporu, orta güç Android throttled test ve sonra yeterli trafikle saha p75 ölçümü kullan. Başlangıç JS bütçesine analytics/Auth eklendiğinde etkisini ayrıca ölç; bütçeyi sessizce genişletme.

Frame sayısına bağlı fizik yerine fixed timestep veya kontrollü delta; uzun background dönüşündeki delta clamp. Görünmez sayfada pause, audio suspend, WebGL resource disposal. DPR başlangıç en çok 1,5–2; particle sayısı viewport ve frame süresine göre azalır. Reduced motion’da dekoratif animasyon durur; skor oyun mekaniği değişirse alternatif açıkça belirtilir. Service worker ilk sürümde gerekli değil; eklenirse stale daily/game version riskine özel tasarım gerekir.

## 11. Mobile Strategy

Mevcut repo responsive kurallar içeriyor; aynı kalite tüm oyunlarda yok. Kaynak incelemesi gerçek cihaz testinin yerini tutmaz.

- Pointer Events + pointer capture; koordinatı Canvas CSS rect’inden dönüştür, `pointercancel`/blur’da input sıfırla. `touch-action:none` yalnız oyun yüzeyinde; sayfa scroll’u engellenmesin.
- Hover dekoratif, hiçbir temel kontrol hover’a bağlı değil. En az 44×44 CSS px dokunma hedefi ve görünür klavye focus.
- `svh/dvh` ve `env(safe-area-inset-*)`; adres çubuğu/klavye açılınca creator formu kırılmasın. Portrait varsayılan, zorunlu orientation lock yok.
- Ses ancak doğrudan user gesture ile AudioContext resume; muted başlangıç seçeneği. iOS Safari ses kesilmesi/background dönüşü ayrıca sınanır.
- GPU memory/texture/particle sınırlı; context lost/restored durumunda yeniden kurulum veya Canvas fallback. Battery için idle RAF yok.
- 360/390/430/768/1024/1440px, portrait/landscape, gerçek iOS Safari ve orta/düşük Android; ayrıca WhatsApp/Instagram in-app browser share/storage testleri.
- Storage blocked/private mode, clipboard denied ve Web Share unavailable durumları tamamlanmış sonuç ekranını bozmaz.

## 12. Share Architecture

Tek engine oyunlardan `{kind, dayId/gameId, score, cells, url, version}` alır; UI metni ve 1080×1920 story/1200×630 kartı aynı sonuç modelinden üretilir. Bugünkü mesaj araçlarının native share/clipboard fallback ve QR/kartvizit Canvas export mantıkları yeniden kullanılabilecek örneklerdir.

| Kanal | Browser-side olanak | Sınır |
|---|---|---|
| Native menu | `navigator.share({title,text,url})`, file için `canShare({files})` | HTTPS + user activation; destek feature-detect |
| Clipboard | `writeText`, denied ise seçilebilir metin | Kullanıcıya kopyalandı/başarısız sonucu doğru ver |
| WhatsApp | URL encoded metin/link ile `wa.me` intent | Gönderildi doğrulanamaz |
| X / Reddit | Encode edilmiş share/submit linki | Window açılması gerçek yayın değildir |
| Emoji/text | Oyun seed/sonuç grid’i + kısa skor + canonical URL | Cevapları spoiler olarak paylaşma |
| Image | Canvas → Blob → indir/native file share | CORS image taint, font hazır olma, memory sınırı |
| Instagram Story | PNG indir veya destekli native file share | Web’den garantili Story yayın API akışı yok; kullanıcı export’u paylaşır |
| OG | Statik page-specific OG image | Creator/duel-specific crawler card için server/edge render gerekir |

Native share promise işletim sistemine göre farklı aşamada resolve olur; teslim/yayın ispatı değildir. Ağır PNG render’ını click sonrası uzun await ile yapıp transient activation kaybetme; export’u önceden hazırla veya ikinci açık paylaşım gesture’ı iste. Kullanıcı iptali başarısız ürün akışı olarak sunulmaz. [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API), [share davranışı](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

## 13. SEO Architecture

TOOLS için build-time ayrı HTML: unique title/description/H1, gerçek kullanım yönergesi, örnek, kısa FAQ, absolute canonical, ilgili araç linkleri. JS çalışmadan içerik anlaşılır olmalı. JSON Formatter gibi her araç registry’den HTML/metadata/sitemap girdisini üretir. `WebApplication`/`SoftwareApplication` schema yalnız doğru özelliklerle; sahte rating yok, structured data rich result garantisi değildir.

`/tools/{slug}/`, `/play/{slug}/`, `/lab/{slug}/` için tutarlı trailing slash; `/index.html` kopyasına canonical. Legacy URL’ler korunurken aynı yeni içeriğe dönüşürlerse canonical yeni sayfaya verilebilir; içerik farklıysa ayrı canonical gerekir. Sitemap yalnız indexlenebilir, gerçek 200 route’ları listeler. Robots ve 404 eklenir; özel dokümanları yayın artifact’ına hiç koyma.

Home/TODAY/PLAY/CREATE landing’leri indexlenebilir. Günlük query/seed/result varyasyonları ana `/today/` canonical’ına gider. Duel ve kullanıcı Creator oyunları v1’de `noindex` + sitemap dışı: düşük içerik, spam, kullanıcı mahremiyeti ve sınırsız URL riski. Robots’ta disallow edip crawler’ın noindex’i okuyamamasına yol açma. `noindex` güvenlik değildir; hassas veriler public doc’a hiç yazılmaz. Query-ID entry’leri statik HTML noindex taşır. Gelecekte moderasyonlu curated içerik ayrı indexlenebilir route olarak seçilebilir.

Statik Open Graph/Twitter kartları home, oyun ve araç bazında build edilir. Client JS ile OG değiştirmek sosyal crawler desteği sağlamaz; kişisel başlık/sonuç kartı gereksinimi hosting kararına bağlıdır.

## 14. Analytics Plan

Mevcut analytics yok. Önce event sözleşmesi/no-op adapter, sonra veri/izin/policy ve sağlayıcı kararı. Olaylar primary ürün işlevinden bağımsızdır; SDK hatası oyun veya paylaşımı bozmaz. Kullanıcı rızası/policy uygulanmadan kalıcı analytics ID oluşturma.

Ortak izinli alanlar: `schema_version`, `event_id` (retry dedupe), `route_key` (query/fragment içermez), `experience_id`, `mode`, `app_version`, coarse `device_class`, gerekiyorsa `session_id`. Kullanıcı adı, email, IP’yi uygulama parametresi, UID, creator title/question, QR payload, tam URL ve serbest metin gönderilmez. SDK’nın kendi topladığı veriler de değerlendirilmelidir.

| Event | Özel parametre | Amaç |
|---|---|---|
| `home_view` | entry category | İlk giriş hacmi |
| `daily_view` | day_key, game_id | Günlük funnel |
| `game_start` | game_id/version, mode, attempt_kind | Gerçek başlatma |
| `game_complete` | game_id, mode, duration_bucket, score_bucket, verified | Completion; raw hassas metadata yok |
| `share_opened` | share_kind, channel | Menü/share seçimi |
| `share_completed` | channel, outcome=`handoff`/`copied`/`exported` | Gözlenebilir teknik sonuç; gerçek gönderim değil |
| `duel_created` | game_id, expiry_bucket | Oluşturma conversion |
| `duel_opened` | game_id, link_state | Gelen challenge funnel |
| `duel_completed` | game_id, outcome, duration_bucket | Oyuna dönüşüm |
| `rematch_clicked` | game_id | Tekrar döngüsü |
| `creator_started` | template_id, entry category | Creation funnel |
| `creator_published` | template_id/version, question_count_bucket | Publish conversion |
| `creation_opened` | template_id, link_state | UGC gelen oyun |
| `tool_opened` | tool_slug | Tools kullanım |
| `returning_user` | days_since_bucket | İzinli cihaz bazlı dönüş; kişi iddiası yok |

`page_view` ortak teknik event olarak bir kez; home/daily view aynı denominator’a çift sayılmaz. `daily_streak` gerekiyorsa gün sonu streak bucket; `share_clicked` eski isim yerine bu taxonomy kullanılır. Cancel/error outcome için tamamlandı event’i üretme; gerekirse ayrı `share_cancelled`/`share_failed` eklenir.

KPI tanımları: completion = tamamlayan session / başlatan session; share intent = paylaşımı açan completed session / completed session; share handoff = olumlu teknik sonucu olan completed session / completed session. Creator conversion = published / started; challenge conversion = completed / valid opened; D1 = D günü gelen izinli cihaz cohort’undan D+1 dönenler. Bunlar kişi sayısı veya gerçek mesaj teslimi olarak sunulmaz.

## 15. Security Risks

Mevcut `innerHTML` çoğunlukla geliştiriciye ait sabit katalog/snippet için kullanılıyor; bu tek başına mevcut exploitable XSS kanıtı değildir. Aynı renderer’a gelecekte UGC geçirmek risklidir. Araç JS’lerinde `textContent`, HTTP(S) URL doğrulaması ve QR payload sınırı olumlu örnekler.

- Creator: yalnız JSON schema + enum template/theme; kullanıcı JS/CSS/HTML yok. DOM metinleri `textContent`; link gerekiyorsa protocol/host policy. String length + UTF-8 byte + soru/cevap limitleri client ve trusted boundary’de uygulanır.
- Published quiz answers publicse kullanıcı okuyabilir; competitive sonuç için cevap anahtarı private ve server validation. Eğlence amaçlı client skorlar buna uygun etiketlenir.
- Firebase deny-by-default; public list kapalı, owner immutable, document schema/field type/score range/version checked. Başkasının result overwrite, expired duel claim ve ikinci opponent reddedilir; concurrent claim transaction test edilir.
- App Check ek savunmadır, Auth/Rules ve rate limit yerine geçmez. UID/account reset ve link spam trusted endpoint quota/idempotency ile ele alınır. [App Check](https://firebase.google.com/docs/app-check).
- Tahmin edilemez en az ~96 bit random ID; örnekteki beş karakter ID gerçek security boundary olamaz. Link bilenlerin erişebildiği public içerik gizli veri sayılmaz.
- Trusted publish endpoint için kullanıcı/cihaz abuse sınırları, payload cap, moderation/report/delete ve bütçe kill switch. Billing alert hard spending cap değildir.
- UGC remote image/link preview fetch v1’de yok; böylece SSRF/CORS ve tracking riski eklenmez. Redirect target query’si serbest URL olamaz.
- Anonymous UID, quiz kişisel metinleri ve sonuçlar için retention/silme ve kullanıcı açıklaması planı gerekir. Eski gizlilik placeholder’ı bu sistemin yayın koşullarını karşılamaz.
- Firebase public config secret değildir; service account/Admin key hiçbir browser bundle veya repoya konmaz. Güvenlik Auth/Rules/endpoint kontrollerindedir.

## 16. Migration Plan

1. Mevcut SHA, Pages settings, publish folder, artifact ve canonical domain’i kayıt altına al. `tanitim/` untracked içerik sahipliğini koru; otomatik stage/commit/kopyalama yapma.
2. Implementation için `codex/katovia-v2-foundation` gibi feature branch önerilir; bu görevde branch açılmadı. Kullanıcının mevcut değişikliklerine dokunmadan checkpoint yaklaşımı belirle.
3. Yeni `site/` + `src/` yapısını ayrı preview’da geliştir; legacy home production root’ta kalır. Katalog ve eski fragment adapter’ı hazırla.
4. Artifact builder tüm tracked legacy sayfa/data/vendor/asset yollarını açık listeyle taşır; hash manifesti önce/sonra karşılaştırılır. Belgeler, `.git`, local secrets ve izlenmeyen tanıtım varsayılan artifact dışında.
5. Basit statik server üzerinde eski linkler, tüm yeni HTML entries, query dynamic links, 404, doğrudan açma/refresh ve back/forward kontrol edilir. Preview branch otomatik production deploy edemez.
6. Shell → Daily → Playground iteratif; eski araçlar çalışırken yeni URL’ler hazırlanır. Root cutover yalnız kabul kriterleri ve rollback artifact’ı hazır olduğunda yapılır. Bu görev deployment yetkisi vermiyor.
7. Build sonrası Pages için Actions artifact deployment önerilir; publishing-source değişimi ayrı implementation/deployment kapsamıdır. `CNAME`, domain ve `app-ads.txt` korunur.
8. Rollback: son doğrulanmış legacy artifact’ı yeniden yayınla; Git history reset/force push yok. Sadece bir source commit’i değil deployment çıktısı da tutulur. Yeni bulut datayı silme; additive schema/version uyumu ve feature flag fallback gerekir.

Eski hashler JS compatibility adapter ile semantik olarak TOOLS/LAB’e map edilir; `/index.html#oyunlar` da çalışır. Fragment sunucuya gitmediği için 301 ile ayrı ayrı yönlendirilemez. Legacy HTML yolları ilk milestone’da byte-identical kalır.

## 17. Technical Risks

| Seviye | Risk | Önlem |
|---|---|---|
| CRITICAL | Pages’te clean dynamic link refresh/404 ve kişisel OG beklentisi | Query entry ilk sürüm; EPIC 4 öncesi hosting ADR |
| HIGH | Publish source/son deploy bilinmeden build cutover | Settings/artifact doğrula; staging + rollback |
| HIGH | Eski URL, asset/data/vendor path kaybı | Explicit preserve manifest + direct-route smoke |
| HIGH | Client skoruna global doğruluk ve percentile atfetmek | Unverified local; trusted aggregation/validation |
| HIGH | CREATE/DUEL public write abuse, billing ve UGC XSS | Rules/schema, endpoint quota, moderation, payload sınırı |
| HIGH | 6,9 MB JPEG ve eager featured loading | Responsive optimized varyantlar; orijinalleri koru |
| HIGH | Privacy sayfası placeholder iken cloud/analytics yayınlamak | Veri/policy hazırlığı cloud release bağımlılığı |
| MEDIUM | Frame-based oyun fizik ve farklı pause/storage kalitesi | Yeni lifecycle/time/input contract; legacy ayrı kalsın |
| MEDIUM | Tanıtım untracked; yanlış artifact/commit kapsamı | Kullanıcı dosyasını koru, ayrıca yayın kararı |
| MEDIUM | Native share başarı sayısının teslim sanılması | Handoff/intent ayrı KPI |
| MEDIUM | Eski proje bağlamının v2 roadmap ile çelişmesi | İlk milestone’da belge uzlaştırma |
| MEDIUM | SPA dev server’ın Pages refresh hatalarını gizlemesi | Düz statik artifact QA |
| LOW | Katalog/title/snippet isim tutarsızlığı | Registry ve gerçek içerik incelemesi |
| LOW | Aşırı generic engine soyutlaması | Yalnız ilk oyunların ortak gereksinimleri |

CRITICAL burada bugünkü canlı sitede doğrulanmış kritik açık anlamına gelmez; önerilen ürün mimarisini bloke eden konudur.

## 18. Recommended Epic Breakdown

Ürün sıralaması korunabilir; altyapı/kaliteyi EPIC 7–8’e bırakma.

| Epic | Teknik alt faz / bağımlılık | Çıkış kriteri |
|---|---|---|
| 0A | Bu analiz | Repo/route/karar haritası |
| 0B | Build, registry, storage/error/share contract, SEO/perf bütçe, preview | Legacy artifact korunur; production değişmez |
| 1 | UI shell/design tokens + static route entries | Mobile/keyboard/reduced motion shell QA |
| 2A | Local Daily/time/seed/score/streak, ilk Stop at 5.00 | Gerçek sonuç + text/image paylaşım |
| 2B | Diğer dört oyun + isteğe bağlı cloud aggregate | Testli deterministic manifest; fake percentile yok |
| 3 | Üç lazy playground; ses/Canvas/GPU lifecycle | Mobile fallback ve resource cleanup |
| 4A | Hosting dynamic-link kararı + Auth/Rules/abuse foundation | Direct-link contract ve security testleri |
| 4B | Reaction/Memory duel, expiry/transaction/rematch | Gelen link → oyun → sonuç → rematch |
| 5 | İki Creator template, validate/publish/play, delete/report | UGC güvenli ve bounded |
| 6 | Yeni SEO tools; QR/kartvizit erken taşınabilir | Static metadata + legacy URL parity |
| 7 | Analytics provider/aggregation/dashboard | Taxonomy 0B’den; release edilen özellikler ölçülebilir |
| 8 | Birikimli final polish ve yayın kabulü | Her epic’te QA; final release regression |

Firebase kurulumu shell’in ön koşulu değildir. Global percentile 2B’de cloud foundation tamamlanmasına; güvenilir duel/creator ise 4A’ya bağlı. Analytics event hooks erken, gerçek telemetry policy hazır olduğunda açılır. Tools’un SEO foundation’ı 0B’de başlar; tüm araçlar için EPIC 6 beklenmez.

## 19. First Implementation Milestone

**Foundation + Parallel Katovia Shell** — bu raporda implement edilmedi.

Kapsam: mevcut içeriklerin preservation manifesti; v2 kararlarını yansıtan proje dokümanı; Vite vanilla MPA build; tek route/catalog kaynağı; tokens/base UI/motion, navigation/status/error/storage adapters; no-op analytics/share contract; `/v2/` preview shell ve TODAY/PLAY/CHALLENGE/CREATE/TOOLS/LAB statik girişleri. Çalışmayan modüller aktifmiş gibi gösterilmez. Yeni oyun, gerçek Firebase, kişisel OG, analytics SDK ve production cutover kapsam dışı.

Önerilen dosyalar: `package.json`, lockfile, `vite.config.js`, `site/**`, `src/shell/**`, `src/styles/**`, `src/core/{storage,errors,analytics,share}.js`, `src/catalog/**`, `scripts/build-routes.*`, `scripts/preserve-legacy.*`, gerekli smoke testler ve `docs/ADR-*.md`; `PROJECT_CONTEXT.md` ürün yönü uzlaştırması. Bunlar planlanan yollar, mevcut dosyalar değil.

Başarı: root legacy home korunur; tüm 18 tracked legacy HTML sayfası ve bağlı JS/data/vendor/asset manifesti byte-identical; preview shell responsive ve erişilebilir; deneyler initial chunk’a dahil değil; build çıktı bütçesi raporlanır; v2 entries statik server’da direct-load/refresh 200; bilinmeyen route düzgün 404. Dynamic query entry contract ADR’si hazır, cloud çağrısı yok.

Test: storage denied/corrupt JSON fallback; legacy local path manifest; 360–1440px nav/overflow/keyboard/reduced-motion; fragment alias ve back/forward; statik preview base-path; build asset sizes; publish allowlist. Geri alma noktası mevcut SHA + legacy artifact ve korunmuş untracked kullanıcı dosyalarıdır. Production değiştirilmeden milestone review edilebilir.

Sonraki milestone ilk Daily’yi ana ürün döngüsüne bağlar; salt shell görünümü Katovia vizyonunun doğrulandığı anlamına gelmez.

## 20. Files That Should Be Preserved

- `index.html`: migration boyunca legacy baseline; root değişiminden önce doğrulanmış snapshot/artifact.
- `oyunlar/` içindeki on HTML; `laboratuvar/` içindeki sekiz HTML, üç uygulama JS ve altı data dosyası: direkt URL ve göreli asset bağımlılıklarıyla birlikte.
- `laboratuvar/vendor/kjua-0.10.0.min.js`, `kjua-LICENSE.txt`, `README.md`: lisans ve hash kaydı birlikte.
- `assets/apps/{balonlubum,kare-savaslari,iletisim-analizi,mental-detox}.jpg`: optimize varyant eklenebilir; orijinal kaynakları topluca değiştirme.
- `CNAME`, `app-ads.txt`, `README.md`, `PROJECT_CONTEXT.md`: konfigürasyon/köken korunur; doküman güncellemesi ayrı ve izlenebilir.
- `tanitim/katovia-tanitim.html`, `tanitim/js/katovia-tanitim.js`: kullanıcıya ait untracked çalışma; silme/stage/publish yapma.

## 21. Files That May Eventually Be Removed

Bugün güvenle silinebilir olduğu kanıtlanan production dosyası yok. Güzel Sözler ve tanıtım için ARCHIVE önerisi dosya silme yetkisi değildir. Legacy URL kullanımı ölçülmeden HTML dosyaları kaldırılmamalı.

İleride ortak modüllere taşındıktan sonra `index.html` içindeki kopya CSS/render/router implementasyonu, placeholder veri girdileri ve yanıltıcı snippetler kaldırılabilir. Bunlar bütün `index.html` dosyasını silmek anlamına gelmez. Yeni build’in geçici/üretilen çıktıları source control politikasına göre dışarıda tutulur. Vendor ancak her iki QR tüketicisi bağımlılıktan tamamen çıktığında ve eşdeğer işlev/lisans doğrulandığında removal candidate olur.

## 22. Final Recommendation

Mevcut vanilla içeriği çalışan legacy katman olarak koru; v2’yi Vite destekli modüler vanilla ve statik HTML route’larıyla paralel kur. Önce ilk daily + paylaşım döngüsünü doğrula; büyük framework ve tüm oyunların yeniden yazımını şart yapma.

Pages için güvenilir dynamic query girişlerini kabul et veya tam `/d/{id}` ve `/p/{id}` gereksinimini karşılayacak hosting kararını DUEL öncesinde ver. Firebase data ve kişisel OG’yi routing çözümüyle karıştırma. Bulut/security/analytics altyapısını ihtiyaç fazında, gerçek ölçüm ve maliyet sınırlarıyla devreye al.

**Bu görevin sonucu:** teknik harita hazır; implementation, production deploy, commit/push, branch değişimi veya kaynak silme yapılmadı. Değişen tek dosya bu analiz raporudur. Mobil/desktop runtime QA ve Pages ayar doğrulaması sonraki implementation hazırlığının açık işleridir.
