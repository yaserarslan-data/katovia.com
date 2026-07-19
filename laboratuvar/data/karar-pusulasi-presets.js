(function () {
  "use strict";

  window.KATOVIA_DECISION_PRESETS = [
    {
      id: "general",
      name: "Genel karar",
      criteria: [
        { id: "general-desire-fit", name: "Gerçek isteğinle uyumu", help: "Bu seçeneğin gerçekten istediğin şeye ne kadar yaklaştığını değerlendir." },
        { id: "general-reasonable", name: "Akla yatkınlık", help: "Bu seçeneğin mevcut bilgilerinle ne kadar mantıklı göründüğünü değerlendir." },
        { id: "general-feasibility", name: "Uygulanabilirlik", help: "Bu seçeneği mevcut koşullarında hayata geçirmenin ne kadar mümkün olduğunu değerlendir." },
        { id: "general-long-term", name: "Uzun vadeli katkı", help: "Bu seçeneğin zaman içinde sana ne kadar katkı sağlayacağını değerlendir." },
        { id: "general-risk", name: "Risklerin yönetilebilirliği", help: "Bu seçeneğin olası risklerini ne kadar yönetebileceğini değerlendir." }
      ]
    },
    {
      id: "purchase",
      name: "Satın alma",
      criteria: [
        { id: "purchase-need", name: "Gerçek ihtiyacı karşılaması", help: "Bu seçeneğin asıl ihtiyacını ne kadar karşıladığını değerlendir." },
        { id: "purchase-budget", name: "Bütçeye uygunluk", help: "Bu seçeneğin mevcut bütçene ne kadar uygun olduğunu değerlendir." },
        { id: "purchase-use", name: "Kullanım değeri", help: "Bu seçenekten günlük hayatta ne ölçüde yararlanacağını değerlendir." },
        { id: "purchase-long-term", name: "Uzun vadeli değer", help: "Bu seçeneğin değerini zaman içinde ne kadar koruyacağını değerlendir." },
        { id: "purchase-advantage", name: "Alternatiflere göre avantajı", help: "Bu seçeneğin diğerlerine göre sunduğu anlamlı avantajları değerlendir." }
      ]
    },
    {
      id: "career",
      name: "İş ve kariyer",
      criteria: [
        { id: "career-income", name: "Gelir ve yan haklar", help: "Bu seçeneğin sunduğu toplam maddi koşulları değerlendir." },
        { id: "career-growth", name: "Gelişim fırsatı", help: "Bu seçeneğin öğrenme ve ilerleme olanağını değerlendir." },
        { id: "career-balance", name: "İş–yaşam dengesi", help: "Bu seçeneğin iş ile kişisel yaşam arasındaki dengeye etkisini değerlendir." },
        { id: "career-stability", name: "İstikrar ve güven", help: "Bu seçeneğin süreklilik ve öngörülebilirlik düzeyini değerlendir." },
        { id: "career-values", name: "Kişisel değerlerinle uyumu", help: "Bu seçeneğin çalışma anlayışın ve değerlerinle uyumunu değerlendir." }
      ]
    },
    {
      id: "education",
      name: "Eğitim",
      criteria: [
        { id: "education-career", name: "Kariyere katkı", help: "Bu seçeneğin mesleki hedeflerine sağlayacağı katkıyı değerlendir." },
        { id: "education-interest", name: "İlgi ve motivasyon", help: "Bu seçeneğe karşı duyduğun ilgi ve çalışma isteğini değerlendir." },
        { id: "education-time", name: "Zamana uygunluk", help: "Bu seçeneğin mevcut zamanına ve programına uyumunu değerlendir." },
        { id: "education-budget", name: "Bütçeye uygunluk", help: "Bu seçeneğin eğitim bütçene ne kadar uygun olduğunu değerlendir." },
        { id: "education-long-term", name: "Uzun vadeli değer", help: "Bu seçeneğin ileride sağlayabileceği kalıcı faydayı değerlendir." }
      ]
    },
    {
      id: "travel",
      name: "Seyahat",
      criteria: [
        { id: "travel-budget", name: "Bütçeye uygunluk", help: "Bu seçeneğin ayırdığın seyahat bütçesine uyumunu değerlendir." },
        { id: "travel-curiosity", name: "Merak ve istek", help: "Bu seçeneğin sende uyandırdığı merak ve gitme isteğini değerlendir." },
        { id: "travel-access", name: "Ulaşım kolaylığı", help: "Bu seçeneğe ulaşmanın ne kadar kolay ve uygulanabilir olduğunu değerlendir." },
        { id: "travel-experience", name: "Deneyim değeri", help: "Bu seçeneğin sana sunabileceği deneyimin değerini değerlendir." },
        { id: "travel-calendar", name: "Takvime uygunluk", help: "Bu seçeneğin tarih ve süre bakımından programına uyumunu değerlendir." }
      ]
    },
    {
      id: "lifeChange",
      name: "Yaşam değişikliği",
      criteria: [
        { id: "life-desire-fit", name: "Kişisel isteğinle uyumu", help: "Bu değişikliğin kendi isteğin ve hedeflerinle uyumunu değerlendir." },
        { id: "life-sustainable", name: "Güvenli ve sürdürülebilir oluşu", help: "Bu değişikliği güvenli ve sürdürülebilir biçimde devam ettirme olanağını değerlendir." },
        { id: "life-financial", name: "Maddi uygulanabilirlik", help: "Bu değişikliğin mevcut maddi koşullarında ne kadar uygulanabilir olduğunu değerlendir." },
        { id: "life-daily", name: "Günlük yaşama olumlu etkisi", help: "Bu değişikliğin günlük hayatına sağlayacağı olumlu etkiyi değerlendir." },
        { id: "life-peace", name: "Uzun vadeli huzura katkısı", help: "Bu değişikliğin zaman içinde yaşam memnuniyetine katkısını değerlendir." }
      ]
    }
  ];
}());
