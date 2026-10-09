# Language Forge — Phase 4 yerel tamamlanma raporu

Commit, push veya deploy yapılmadı. Production değişmedi.
Yerel önizleme: http://127.0.0.1:4173/create/language-forge/

1. **Proje/kayıt mimarisi:** Versioned recipe + explicit patch modeli. Akış:
   temel recipe → frozen lexical engine → patch'ler → final lexicon kontrolü →
   project grammar/morphology adapter → cümleler → UI. Temel generation cache'i
   edit/reroll/grammar değişiminde kullanılabiliyor; başka kökler yeniden ayrılmıyor.

2. **Dosyalar:** Yeni `project/{model,reconstruct,codec,storage}.js`,
   `ui/project-messages.js`, `tests/language-forge-project.test.mjs`,
   `tests/browser/language-forge-project.spec.js` ve bu rapor.
   Phase 4 değişiklikleri `ui/{client,markup,messages}.js`, `ui/style.css`,
   üretilen `site/create/language-forge/index.html` ve mevcut Forge browser
   testinde. Frozen engine/data/golden dosyaları değiştirilmedi.

3. **Schema:** `format: katovia-language-forge`, `version: 1`; e1/d1/g1,
   full 128-bit seed, preset/wordLength/grammar ve edits. Edits içinde nullable
   languageName ve en fazla 64 sıralı `{semanticId,value,source,rerollCounter}`
   kaydı. İzin verilmeyen alanlar reddediliyor. Locale, timestamp, UI state,
   hesaplanmış sözlük/cümleler dışa aktarılmıyor. Bilinmeyen sürüm latest'e düşmüyor.

4. **Rename:** Inline form; trim, whitespace normalizasyonu, 40 karakter sınırı,
   boş ad reddi. Custom name explicit patch olarak saklanıyor. Grammar-only
   değişimde korunuyor; yeni preset/uzunlukla oluşturulan projeye taşınmıyor.

5. **Word edit:** Satırın kompakt native disclosure menüsünden açılan inline
   form. Tek kelime, trim/NFKC, locale-independent lowercase, 24 karakter sınırı.
   Harf dışı/boş/çok kelimeli değerler reddediliyor. Apply kabul edilmiş patch'i
   işler; ayrıca bir global Save changes düğmesi gerekmiyor.

6. **Phonology warning:** Mevcut saf validator kullanılıyor. Fonoloji dışı
   ad/kelime için önce uyarı, ardından açık “Yine de kullan” seçimi gerekiyor.
   Advisory kelime tam fonolojik uyumlu diye gösterilmiyor. Bu politika import
   edilen kabul edilmiş patch'lerin replay'inde de aynı proje sürümüyle korunuyor.

7. **Collision:** Lexical duplicate ve mevcut grammar marker collision hard
   error. Ad ile exact root collision da reddediliyor. Grammar allocation final
   words/name'i reserve eder; alternatif marker deterministik seçilebilir.
   Candidate package geçmeden mevcut proje veya storage değiştirilmez.

8. **Reroll:** `reroll:<semanticId>:<counter>` akışı; en fazla 64 aday. Mevcut
   kelime, diğer kökler, marker ve dil adı reserve. Sonuç/counter explicit patch.
   Diğer 63 root, ad, seed ve config aynı kalır. Counter en fazla 1,000,000.

9. **Derived state:** Accepted patch sonrası marker/morphology/cümle/token
   analizleri yeniden üretilir. Geçerli root birleşimleri frozen suffix
   validator'dan geçer. Kullanıcının onayladığı fonoloji dışı root, proje
   katmanında opak kök olarak korunur; yeni junction, tekrar, consonant-run,
   yasak sequence ve collision kontrolleri yapılır. Gerekirse linking vowel
   kullanılır. Opak kökün içindeki mevcut uyumsuzluğun düzeltildiği iddia edilmez.
   Başarısız suffix allocation tüm edit'i atomik olarak reddeder.

10. **Local save:** Existing safe adapter; key `katovia:language-forge:active`,
    envelope version 1. Tek aktif proje. Generation, kabul edilmiş edit/name/
    reroll/grammar değişimi, import ve receiver copy sonrası save denenir.
    Keystroke, arama, filtre, disclosure, scroll veya locale kaydedilmez.

11. **Restore:** Clean route'ta valid kayıt varsa “Kaydedilmiş dilin bulundu”
    ve Continue/New seçimi. Continue recipe'yi yeniden kurar. Bozuk kayıt güvenle
    yok sayılır; başka kayıtlar silinmez. Storage kapalı/quota hatalıysa session
    çalışır ve kalıcı kayıt yapılamadığı açıkça belirtilir.

12. **Start-over:** Inline confirmation; Cancel mevcut projeyi korur. Continue
    yalnız Forge active key'ini temizler, setup/default state'e döner. Preset/
    uzunluk değişimi de patch'lerin taşınmayacağını belirten confirmation ister.

13. **Export:** UTF-8 JSON, açık format/version, recipe ve patch'ler.
    Generic dosya adı `language-forge.json`; isimden filename üretilmiyor.
    Browser Blob/download kullanılıyor; geçici object URL revoke ediliyor.

14. **Import:** File picker, 16 KiB byte sınırı; JSON, format/sürümler, seed,
    config enum, semantic ID allowlist, patch sayısı/uzunluğu/source/counter,
    duplicate ve final package kontrolü. Unknown alanlar ve prototype pollution
    girişimleri reddediliyor. Existing proje varsa replacement confirmation.
    Malformed/oversized/unsupported dosya eski proje veya storage'ı değiştirmiyor.

15. **Share codec:** `/create/language-forge/#lf1.<payload>`. First-party
    canonical positional tuple, stable patch order, UTF-8 + base64url. Seed,
    e/d/g, config, custom name ve explicit word patches taşınır. Encryption,
    compression, shortener, backend veya server persistence yok.

16. **URL budget:** Full canonical URL için 1900 karakter uygulama bütçesi.
    Ölçülen clean Neniru linki 194, tek editli örnek 237 karakter. 64 uzun patch
    testinde limit aşılır; share engellenir, tüm patch'ler ve JSON export korunur.
    Sessiz truncation yok. Paylaşılan link daha sonraki editlerle değişmeyen snapshot.

17. **Receiver:** Payload tamamen doğrulandıktan sonra read-only result.
    Rename/edit/reroll/grammar/reset/import kontrolleri receiver'da kapalı;
    event handler'larda da guard var. Inspect/search/filter/explanations/export/
    share açık. Existing local storage'a yazılmaz. Storage denied durumunda
    mevcut in-memory editable project de receiver/history geçişlerinde korunur.
    Malformed/unsupported fragment friendly state gösterir, random dil üretmez.

18. **Edit a copy:** Mevcut local/session proje varsa replacement confirmation.
    Onayda cloned reconstructed project editable olur, save denenir, fragment
    temizlenir. Sender snapshot payload'u değiştirilmez. Section/skip bağlantıları
    scroll yaparken share fragment'ını korur.

19. **TR/EN:** Seed, roots, name, config, marker, sentence, patches ve fragment
    değişmez. Labels/explanations/error/warnings çevrilir. Search/filter, disclosure
    ve açık edit formundaki draft/warning korunur. Project'te locale alanı yok.

20. **Accessibility:** Native details/actions, semantically labelled edit/reroll,
    inline form labels, warning/error için aria-describedby/aria-invalid,
    named confirmation group ve keyboard focus dönüşü. Reroll sayfa başına
    atlamaz; filtrelenen satır kaybolursa focus search'e döner. 360–1440 pixel
    overflow ve reduced-motion smoke; TR mobile inline edit görsel QA yapıldı.

21. **Error UX:** Atomic failure, localized friendly mesajlar, raw exception/code
    yok. Storage failure session'ı bozmaz. Clipboard yoksa manual link alanı;
    native share iptalinde yanlış copied feedback verilmez. Import/share errors
    mevcut kayıtları korur. Eski manual link, yeni proje kabulünde temizlenir.

22. **Bundle/performance:** Final feature JS 42,782 raw / 14,554 gzip bytes
    (~14.21 KiB); CSS 5,750 raw / 1,469 gzip (~1.43 KiB). Phase 3 karşılığı
    10,070/1,244 gzip; artış 4,484 JS ve 225 CSS byte. Global aggregate build
    budgets geçti (78,767 JS / 11,410 CSS gzip bytes). Yerel Node cached edit
    örneği: 200 sample, median 0.86 ms, p95 1.09 ms, max 1.69 ms. Fiziksel mobil
    benchmark yapılmadı; browser smoke ayrı ölçüm türüdür.

23. **Testler:** 99/99 full Node; 23/23 ilgili browser (Forge Phase 3/4,
    CREATE Quiz, i18n). Build, artifact allowlist/legacy byte protection,
    mobile/desktop/network ve final Vite dev smoke geçti. Export download içeriği,
    import atomicity, suffix edit, restore/reset, readonly copy, immutable link,
    over-budget share ve storage-denied receiver/history regression kapsandı.

24. **Frozen contract:** Phase 1/2 goldens değişmedi. Neniru/Kankik/Tapi/Blobredra
    ve bütün lexical/grammar/token fixture'ları geçti. Clean project wrapper'ın
    dört golden grammar paketiyle tam parity'si ayrıca test edildi. Yeni behavior
    project version 1 katmanında; published output değişirse bu sürüm de bump ister.

25. **Dependency/runtime:** Yeni dependency/backend/API/dataset/font/asset/paid
    service/analytics eklenmedi. Browser guard sıfır external request gördü.
    Canonical/schema/static SEO temiz route'u koruyor; UGC fragment metadata'yı
    kişiselleştirmiyor. CNAME/app-ads/legacy/diğer oyun-araçlar korunuyor.
    tanitim hash'leri başlangıçla eşleşiyor.

26. **Kararlar:** Opsiyonel Copy summary eklenmedi. Advisory + suffix davranışı
    frozen engine değiştirilmeden explicit project adapter'da çözüldü; bu,
    advisory root'un bütünü fonolojik olarak valid olduğu iddiası değildir.
    Multiple-project library/cloud/persistence sync eklenmedi. Phase 3 hero,
    preset, dictionary, grammar ve sentence düzeni yeniden tasarlanmadı.

27. **Release öncesi:** Production henüz bu fazları içermiyor. Yerel inceleme ve
    ayrı release/commit/deploy izni bekleniyor. Çok sekmede eşzamanlı düzenleme
    için conflict resolution yok; tek active key'de son başarılı write geçerli.
    Browser storage kalıcı backup garantisi vermez; JSON export bunun için var.
    Paylaşım linki açık recipe/patch snapshot'ıdır, private/encrypted değildir.
    Bounded allocation nadiren reddedilebilir ve friendly rollback/atomic failure
    uygulanır. Bundan sonraki kapsam ayrıca onaylanmalıdır.
