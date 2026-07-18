(function () {
  "use strict";

  const occasionContent = {
    regaip: {
      friendly: {
        single: [
          "Regaip Kandili'nin sakinliği",
          "Bu Regaip Kandili'nin güzel havası",
          "Regaip Kandili'nin manevi dinginliği"
        ],
        lead: [
          "Regaip Kandiliniz huzur ve güzel düşüncelerle geçsin.",
          "Bu Regaip Kandili gönlünüze ferahlık getirsin.",
          "Regaip Kandili'nin sakinliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün iyiliğe ve içten bir selama daha çok yer açılsın.",
          "Günün telaşı hafiflesin, güzel duygular çoğalsın.",
          "Bu özel gecenin huzuru yarınlarınıza da eşlik etsin."
        ]
      },
      traditional: {
        single: [
          "Regaip Kandili'nin huzur ve bereketi",
          "Mübarek Regaip Kandili'nin güzelliği",
          "Regaip Kandili'nin manevi huzuru"
        ],
        lead: [
          "Regaip Kandiliniz mübarek olsun.",
          "Bu mübarek Regaip Kandili huzur ve esenlik getirsin.",
          "Regaip Kandili'nin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Haneler huzurla, gönüller güzel niyetlerle dolsun.",
          "Sağlık, birlik ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede kırgınlıklar hafiflesin, muhabbet artsın."
        ]
      },
      emotional: {
        single: [
          "Regaip Kandili'nin kalpleri yakınlaştıran huzuru",
          "Bu Regaip Kandili'nin umut veren dinginliği",
          "Regaip Kandili'nde paylaşılan güzel duygular"
        ],
        lead: [
          "Regaip Kandili'nde kalbinize iyi gelen insanlar hep yakınınızda olsun.",
          "Regaip Kandili özlemleri hafifletip güzel duyguları çoğaltsın.",
          "Regaip Kandili'nin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle hatırlanan her bağ bugün biraz daha güçlensin.",
          "Umutlar tazelensin, gönüller birbirine daha çok yaklaşsın.",
          "İçten bir selamın sıcaklığı gecenize eşlik etsin."
        ]
      },
      simple: {
        single: [
          "Regaip Kandili",
          "Bu Regaip Kandili",
          "Regaip Kandili gecesi"
        ],
        lead: [
          "Regaip Kandiliniz huzurlu geçsin.",
          "Regaip Kandiliniz mübarek olsun.",
          "Bu Regaip Kandili size iyilik ve esenlik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Sağlık ve huzur sizinle olsun.",
          "Gönlünüz ferah, geceniz güzel olsun."
        ]
      }
    },
    mirac: {
      friendly: {
        single: [
          "Miraç Kandili'nin huzuru",
          "Bu Miraç Kandili'nin sakinliği",
          "Miraç Kandili'nin güzel atmosferi"
        ],
        lead: [
          "Miraç Kandiliniz huzur ve güzel düşüncelerle geçsin.",
          "Bu Miraç Kandili gönlünüze ferahlık getirsin.",
          "Miraç Kandili'nin dinginliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün güzel sözler ve içten selamlar çoğalsın.",
          "Günün yorgunluğu hafiflesin, yüzünüz gülsün.",
          "Bu gecenin sakinliği yeni güne de taşınsın."
        ]
      },
      traditional: {
        single: [
          "Miraç Kandili'nin huzur ve bereketi",
          "Mübarek Miraç Kandili'nin güzelliği",
          "Miraç Kandili'nin manevi dinginliği"
        ],
        lead: [
          "Miraç Kandiliniz mübarek olsun.",
          "Bu mübarek Miraç Kandili huzur ve esenlik getirsin.",
          "Miraç Kandili'nin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Hanelerde huzur, gönüllerde güzel niyetler çoğalsın.",
          "Birlik, sağlık ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede muhabbet ve dayanışma artsın."
        ]
      },
      emotional: {
        single: [
          "Miraç Kandili'nin umut veren huzuru",
          "Bu Miraç Kandili'nin kalpleri yakınlaştıran dinginliği",
          "Miraç Kandili'nde paylaşılan içten duygular"
        ],
        lead: [
          "Miraç Kandili'nde kalbinize iyi gelen her şey size yakın olsun.",
          "Bu özel gece özlemleri hafifletip umutları tazelesin.",
          "Miraç Kandili'nin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle kurulan bağlar bugün biraz daha güçlensin.",
          "Güzel anılar ve içten dilekler gecenizi aydınlatsın.",
          "Kalpten gelen bir selamın sıcaklığı sizinle kalsın."
        ]
      },
      simple: {
        single: [
          "Miraç Kandili",
          "Bu Miraç Kandili",
          "Miraç Kandili gecesi"
        ],
        lead: [
          "Miraç Kandiliniz huzurlu geçsin.",
          "Miraç Kandiliniz mübarek olsun.",
          "Bu Miraç Kandili size sağlık ve esenlik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Gönlünüz ferah, geceniz huzurlu olsun.",
          "İyilik ve güzel düşünceler sizinle olsun."
        ]
      }
    },
    berat: {
      friendly: {
        single: [
          "Berat Kandili'nin huzuru",
          "Bu Berat Kandili'nin sakinliği",
          "Berat Kandili'nin güzel atmosferi"
        ],
        lead: [
          "Berat Kandiliniz huzur ve güzel düşüncelerle geçsin.",
          "Bu Berat Kandili gönlünüze ferahlık getirsin.",
          "Berat Kandili'nin sakinliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün güzel sözlere ve içten selamlara daha çok yer açılsın.",
          "Günün telaşı hafiflesin, huzurlu anlar çoğalsın.",
          "Bu özel gecenin dinginliği yarınınıza da eşlik etsin."
        ]
      },
      traditional: {
        single: [
          "Berat Kandili'nin huzur ve bereketi",
          "Mübarek Berat Kandili'nin güzelliği",
          "Berat Kandili'nin manevi huzuru"
        ],
        lead: [
          "Berat Kandiliniz mübarek olsun.",
          "Bu mübarek Berat Kandili huzur ve esenlik getirsin.",
          "Berat Kandili'nin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Haneler huzurla, gönüller iyi niyetlerle dolsun.",
          "Sağlık, birlik ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede kırgınlıklar hafiflesin, muhabbet artsın."
        ]
      },
      emotional: {
        single: [
          "Berat Kandili'nin kalplere dokunan huzuru",
          "Bu Berat Kandili'nin umut veren dinginliği",
          "Berat Kandili'nde paylaşılan güzel duygular"
        ],
        lead: [
          "Berat Kandili'nde kalbinize iyi gelen insanlar hep yakınınızda olsun.",
          "Bu özel gece kırgınlıkları hafifletip umutları çoğaltsın.",
          "Berat Kandili'nin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle hatırlanan her bağ bugün biraz daha güçlensin.",
          "Özlemler azalsın, güzel duygular çoğalsın.",
          "İçten bir selamın sıcaklığı gecenize eşlik etsin."
        ]
      },
      simple: {
        single: [
          "Berat Kandili",
          "Bu Berat Kandili",
          "Berat Kandili gecesi"
        ],
        lead: [
          "Berat Kandiliniz huzurlu geçsin.",
          "Berat Kandiliniz mübarek olsun.",
          "Bu Berat Kandili size sağlık ve iyilik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Sağlık ve huzur sizinle olsun.",
          "Gönlünüz ferah, geceniz güzel olsun."
        ]
      }
    },
    mevlid: {
      friendly: {
        single: [
          "Mevlid Kandili'nin huzuru",
          "Bu Mevlid Kandili'nin sakinliği",
          "Mevlid Kandili'nin güzel atmosferi"
        ],
        lead: [
          "Mevlid Kandiliniz huzur ve güzel düşüncelerle geçsin.",
          "Bu Mevlid Kandili gönlünüze ferahlık getirsin.",
          "Mevlid Kandili'nin dinginliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün iyilik ve içten selamlar çoğalsın.",
          "Günün yorgunluğu hafiflesin, yüzünüz gülsün.",
          "Bu gecenin huzuru yeni güne de taşınsın."
        ]
      },
      traditional: {
        single: [
          "Mevlid Kandili'nin huzur ve bereketi",
          "Mübarek Mevlid Kandili'nin güzelliği",
          "Mevlid Kandili'nin manevi dinginliği"
        ],
        lead: [
          "Mevlid Kandiliniz mübarek olsun.",
          "Bu mübarek Mevlid Kandili huzur ve esenlik getirsin.",
          "Mevlid Kandili'nin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Hanelerde huzur, gönüllerde güzel niyetler çoğalsın.",
          "Birlik, sağlık ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede muhabbet ve dayanışma artsın."
        ]
      },
      emotional: {
        single: [
          "Mevlid Kandili'nin kalpleri yakınlaştıran huzuru",
          "Bu Mevlid Kandili'nin umut veren dinginliği",
          "Mevlid Kandili'nde paylaşılan içten duygular"
        ],
        lead: [
          "Mevlid Kandili'nde kalbinize iyi gelen her şey size yakın olsun.",
          "Mevlid Kandili özlemleri hafifletip güzel duyguları çoğaltsın.",
          "Mevlid Kandili'nin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle kurulan bağlar bugün biraz daha güçlensin.",
          "Umutlar tazelensin, gönüller birbirine daha çok yaklaşsın.",
          "Kalpten gelen bir selamın sıcaklığı sizinle kalsın."
        ]
      },
      simple: {
        single: [
          "Mevlid Kandili",
          "Bu Mevlid Kandili",
          "Mevlid Kandili gecesi"
        ],
        lead: [
          "Mevlid Kandiliniz huzurlu geçsin.",
          "Mevlid Kandiliniz mübarek olsun.",
          "Bu Mevlid Kandili size sağlık ve esenlik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Gönlünüz ferah, geceniz huzurlu olsun.",
          "İyilik ve güzel düşünceler sizinle olsun."
        ]
      }
    },
    kadir: {
      friendly: {
        single: [
          "Kadir Gecesi'nin huzuru",
          "Bu Kadir Gecesi'nin sakinliği",
          "Kadir Gecesi'nin manevi dinginliği"
        ],
        lead: [
          "Kadir Geceniz huzur ve güzel düşüncelerle geçsin.",
          "Bu Kadir Gecesi gönlünüze ferahlık getirsin.",
          "Kadir Gecesi'nin dinginliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün iyiliğe ve içten bir selama daha çok yer açılsın.",
          "Günün telaşı hafiflesin, huzurlu anlar çoğalsın.",
          "Bu özel gecenin sakinliği yarınınıza da eşlik etsin."
        ]
      },
      traditional: {
        single: [
          "Kadir Gecesi'nin huzur ve bereketi",
          "Mübarek Kadir Gecesi'nin güzelliği",
          "Kadir Gecesi'nin manevi huzuru"
        ],
        lead: [
          "Kadir Geceniz mübarek olsun.",
          "Bu mübarek Kadir Gecesi huzur ve esenlik getirsin.",
          "Kadir Gecesi'nin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Haneler huzurla, gönüller güzel niyetlerle dolsun.",
          "Sağlık, birlik ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede kırgınlıklar hafiflesin, muhabbet artsın."
        ]
      },
      emotional: {
        single: [
          "Kadir Gecesi'nin kalpleri yakınlaştıran huzuru",
          "Bu Kadir Gecesi'nin umut veren dinginliği",
          "Kadir Gecesi'nde paylaşılan güzel duygular"
        ],
        lead: [
          "Kadir Gecesi'nde kalbinize iyi gelen insanlar hep yakınınızda olsun.",
          "Kadir Gecesi özlemleri hafifletip umutları çoğaltsın.",
          "Kadir Gecesi'nin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle hatırlanan her bağ bugün biraz daha güçlensin.",
          "Güzel anılar ve içten dilekler gecenizi aydınlatsın.",
          "Kalpten gelen bir selamın sıcaklığı sizinle kalsın."
        ]
      },
      simple: {
        single: [
          "Kadir Gecesi",
          "Bu Kadir Gecesi",
          "Kadir Gecesi'nin huzuru"
        ],
        lead: [
          "Kadir Geceniz huzurlu geçsin.",
          "Kadir Geceniz mübarek olsun.",
          "Bu Kadir Gecesi size sağlık ve iyilik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Sağlık ve huzur sizinle olsun.",
          "Gönlünüz ferah, geceniz güzel olsun."
        ]
      }
    },
    general: {
      friendly: {
        single: [
          "Kandil gecesinin huzuru",
          "Bu güzel kandil gecesinin sakinliği",
          "Kandilinizin manevi dinginliği"
        ],
        lead: [
          "Kandiliniz huzur ve güzel düşüncelerle geçsin.",
          "Bu kandil gecesi gönlünüze ferahlık getirsin.",
          "Kandilin sakinliğini sevdiklerinizle paylaşmanızı dilerim."
        ],
        bridge: [
          "Bugün iyiliğe ve içten bir selama daha çok yer açılsın.",
          "Günün telaşı hafiflesin, güzel duygular çoğalsın.",
          "Bu özel gecenin huzuru yarınınıza da eşlik etsin."
        ]
      },
      traditional: {
        single: [
          "Kandil gecesinin huzur ve bereketi",
          "Bu mübarek kandilin güzelliği",
          "Kandilinizin manevi huzuru"
        ],
        lead: [
          "Kandiliniz mübarek olsun.",
          "Bu mübarek kandil gecesi huzur ve esenlik getirsin.",
          "Kandilin gönülleri iyilikte buluşturmasını dilerim."
        ],
        bridge: [
          "Haneler huzurla, gönüller güzel niyetlerle dolsun.",
          "Sağlık, birlik ve bereket hayatınıza eşlik etsin.",
          "Bu anlamlı gecede kırgınlıklar hafiflesin, muhabbet artsın."
        ]
      },
      emotional: {
        single: [
          "Kandil gecesinin kalpleri yakınlaştıran huzuru",
          "Bu kandilin umut veren dinginliği",
          "Kandil gecesinde paylaşılan güzel duygular"
        ],
        lead: [
          "Bu kandil gecesinde kalbinize iyi gelen insanlar hep yakınınızda olsun.",
          "Bu özel gece özlemleri hafifletip umutları çoğaltsın.",
          "Kandilin huzuru yorgun gönüllere ferahlık versin."
        ],
        bridge: [
          "Sevgiyle hatırlanan her bağ bugün biraz daha güçlensin.",
          "Güzel anılar ve içten dilekler gecenizi aydınlatsın.",
          "İçten bir selamın sıcaklığı bu gece size eşlik etsin."
        ]
      },
      simple: {
        single: [
          "Kandiliniz",
          "Bu kandil gecesi",
          "Kandil gecesinin huzuru"
        ],
        lead: [
          "Kandiliniz huzurlu geçsin.",
          "Kandiliniz mübarek olsun.",
          "Bu kandil gecesi size sağlık ve iyilik getirsin."
        ],
        bridge: [
          "Gününüz sakin ve güzel olsun.",
          "Sağlık ve huzur sizinle olsun.",
          "Gönlünüz ferah, geceniz güzel olsun."
        ]
      }
    }
  };

  const addresses = {
    general: { friendly: "", traditional: "", emotional: "", simple: "" },
    family: { friendly: "Canım ailem, ", traditional: "Kıymetli ailem, ", emotional: "Canım ailem, ", simple: "Ailem, " },
    friend: { friendly: "Dostum, ", traditional: "Kıymetli dostum, ", emotional: "Güzel dostum, ", simple: "Dostum, " },
    partner: { friendly: "Sevgilim, ", traditional: "Sevgilim, ", emotional: "Sevgilim, ", simple: "Sevgilim, " },
    work: { friendly: "Değerli çalışma arkadaşlarım, ", traditional: "Kıymetli çalışma arkadaşlarım, ", emotional: "Değerli ekip arkadaşlarım, ", simple: "Değerli çalışma arkadaşlarım, " }
  };

  const audienceContent = {
    general: {
      friendly: {
        single: ["gününüze ferahlık ve güzel düşünceler getirsin", "yüzünüzü gülümseten güzel anlara eşlik etsin", "size sağlık, huzur ve içten sevinçler katsın"],
        short: ["Size ve sevdiklerinize huzurlu bir kandil dilerim.", "Gününüz güzel haberler ve içten selamlarla geçsin.", "Sevdiklerinizle sakin ve güzel bir gece geçirmenizi dilerim."],
        medium: ["Size ve sevdiklerinize sağlık, huzur ve güzel bir kandil dilerim.", "Gecenizin içten sohbetler ve güzel haberlerle geçmesini dilerim.", "Sevdiklerinizle paylaştığınız her güzel anın çoğalmasını dilerim."]
      },
      traditional: {
        single: ["hanenize huzur ve bereket getirsin", "gönlünüze esenlik, hayatınıza iyilik katsın", "sağlık ve birlik içinde güzel günlere eşlik etsin"],
        short: ["Sağlık, huzur ve bereket sizinle olsun.", "Hanenize esenlik, gönlünüze ferahlık diliyorum.", "Sevdiklerinizle birlikte nice huzurlu kandillere."],
        medium: ["Hanenize huzur, hayatınıza sağlık ve bereket diliyorum.", "Gönlünüzün ferah, sevdiklerinizin sağlık içinde olmasını dilerim.", "Birlik ve muhabbet içinde nice güzel kandillere erişmenizi dilerim."]
      },
      emotional: {
        single: ["kalbinizde umut, hayatınızda güzel izler bıraksın", "özlediğiniz sıcaklığı ve gönül ferahlığını size getirsin", "sevdiklerinizle aranızdaki bağı daha da güçlendirsin"],
        short: ["Kalbinizde umut, yüzünüzde huzurlu bir gülümseme olsun.", "Özlediğiniz güzel duygular bu gece size yakın olsun.", "Sevdiklerinizin sıcaklığı ve iyi dilekleri yanınızda olsun."],
        medium: ["Kalbinizdeki umutların tazelendiği, güzel duyguların çoğaldığı bir gece dilerim.", "Uzakta olanların sevgisini yakınınızda hissedeceğiniz huzurlu bir kandil olsun.", "Sevgi, dayanışma ve içtenliğin hayatınıza güç katmasını dilerim."]
      },
      simple: {
        single: ["size huzur ve sağlık getirsin", "sakin ve güzel geçsin", "gönlünüze ferahlık versin"],
        short: ["Sağlık ve huzur dilerim.", "Güzel bir kandil gecesi geçirmenizi dilerim.", "Gününüz sakin, gönlünüz ferah olsun."],
        medium: ["Sağlık, huzur ve güzel bir gece dilerim.", "Sevdiklerinizle sakin ve güzel bir kandil geçirmenizi dilerim.", "Gününüzün kolay, gecenizin huzurlu geçmesini dilerim."]
      }
    },
    family: {
      friendly: {
        single: ["ailemizin birlik duygusunu ve evimizin neşesini çoğaltsın", "evimize huzur, soframıza güzel sohbetler getirsin", "hepimizin yüzünü güldüren sıcak anlara eşlik etsin"],
        short: ["Evimizden huzur, soframızdan güzel sohbet eksik olmasın.", "Hepimizin yüzü gülsün, evimizin neşesi çoğalsın.", "Birlikte sağlık ve huzurla nice kandillere ulaşalım."],
        medium: ["Evimizden huzurun, ailemizden sevgi ve dayanışmanın eksik olmamasını dilerim.", "Hepimizin sağlıkla bir arada olduğu güzel günler çoğalsın.", "Aile soframızın neşe, muhabbet ve güzel haberlerle dolmasını dilerim."]
      },
      traditional: {
        single: ["hanemize huzur ve bereket, ailemize sağlık getirsin", "ailemizin birliğini ve muhabbetini güçlendirsin", "evimizi esenlik ve güzel niyetlerle doldursun"],
        short: ["Hanemizde sağlık, huzur ve bereket daim olsun.", "Ailemizin birlik ve muhabbeti hep güçlü kalsın.", "Büyüklerimiz ve küçüklerimiz sağlıkla yanımızda olsun."],
        medium: ["Hanemize huzur, soframıza bereket, ailemize sağlık diliyorum.", "Büyüklerimizin ve küçüklerimizin esenlik içinde olduğu nice kandillere erişelim.", "Ailemizin birlik, muhabbet ve dayanışma içinde kalmasını dilerim."]
      },
      emotional: {
        single: ["ailemizin kalpten gelen sevgisini ve yakınlığını daha da büyütsün", "uzakta olsak da birbirimize duyduğumuz özlemi hafifletsin", "evimizin sıcaklığını ve aramızdaki güçlü bağı hepimize hissettirsin"],
        short: ["İyi ki aynı sevginin içinde birbirimize bağlıyız.", "Uzakta olsak da kalplerimiz hep birbirine yakın kalsın.", "Ailemizin sıcaklığı ve sevgisi hepimize güç versin."],
        medium: ["Aile olmanın güvenini ve sıcaklığını her zaman yanımızda hissedelim.", "Mesafeler olsa da sevgimizin bizi hep birbirimize yakın tutmasını dilerim.", "Birlikte paylaştığımız güzel anıların ve güçlü bağımızın çoğalmasını dilerim."]
      },
      simple: {
        single: ["ailemize sağlık ve huzur getirsin", "evimizde sakin ve güzel geçsin", "hepimizin gönlüne ferahlık versin"],
        short: ["Ailemize sağlık ve huzur diliyorum.", "Evimizde güzel ve sakin bir gece olsun.", "Hep birlikte nice huzurlu kandillere."],
        medium: ["Ailemize sağlık, huzur ve güzel bir gece diliyorum.", "Hepimizin sakin ve güzel bir kandil geçirmesini dilerim.", "Evimizde huzurun ve güzel sohbetlerin eksik olmamasını dilerim."]
      }
    },
    friend: {
      friendly: {
        single: ["gününe huzur, yüzüne içten bir gülümseme getirsin", "sana güzel haberler ve keyifli anlar getirsin", "kalbine ferahlık, hayatına güzel düşünceler katsın"],
        short: ["Günün güzel, gönlün huzurlu olsun dostum.", "Sana güzel haberler ve içten selamlar getirsin.", "Huzurlu bir gece geçirmeni dilerim dostum."],
        medium: ["Gününün güzel haberler, gecenin huzurlu anlarla geçmesini dilerim dostum.", "Dostluğumuz gibi içten ve güzel bir kandil geçirmeni dilerim.", "Kalbine iyi gelen insanlarla birlikte huzurlu bir gece geçirmeni dilerim."]
      },
      traditional: {
        single: ["gönlüne huzur, hayatına sağlık ve bereket getirsin", "yoluna esenlik ve güzel gelişmeler katsın", "sana sağlık ve huzur içinde nice güzel günler getirsin"],
        short: ["Sağlık, huzur ve esenlik seninle olsun dostum.", "Gönlüne ferahlık, hayatına güzel gelişmeler dilerim.", "Sevdiklerinle birlikte nice huzurlu kandillere."],
        medium: ["Gönlüne huzur, hayatına sağlık ve bereket diliyorum dostum.", "Sevdiklerinle birlikte esenlik içinde nice kandillere erişmeni dilerim.", "Yolunun güzel gelişmelerle, gönlünün ferahlıkla dolmasını dilerim."]
      },
      emotional: {
        single: ["dostluğumuzun sıcaklığını ve kıymetini bir kez daha hissettirsin", "özlemleri hafifletip güzel anılarımızı sana yakınlaştırsın", "kalbine umut, dostluğumuza nice güzel an katsın"],
        short: ["İyi ki hayatımda güven veren bir dostsun.", "Mesafeler değişse de dostluğumuzun sıcaklığı hep aynı kalsın.", "Güzel anılarımız ve dostluğumuz sana huzur versin."],
        medium: ["Varlığınla hayatıma kattığın dostluk ve güven için teşekkür ederim.", "Uzakta olsak da dostluğumuzun sıcaklığını hep yakınında hissetmeni dilerim.", "Birlikte paylaştığımız güzel anıların kalbine huzur vermesini dilerim."]
      },
      simple: {
        single: ["sana huzur ve sağlık getirsin", "güzel ve sakin geçsin dostum", "gönlüne ferahlık versin"],
        short: ["Huzurlu bir kandil geçir dostum.", "Sağlık ve huzur seninle olsun.", "Günün güzel, gönlün ferah olsun."],
        medium: ["Sana sağlık, huzur ve güzel bir gece diliyorum dostum.", "Sevdiklerinle sakin ve güzel bir kandil geçirmeni dilerim.", "Gününün kolay, gecenin huzurlu geçmesini dilerim."]
      }
    },
    partner: {
      friendly: {
        single: ["ikimize huzur, ortak günlerimize güzel anlar getirsin", "yüzünü güldüren, içini ferahlatan bir gece olsun", "birlikte paylaştığımız güzel duyguları çoğaltsın"],
        short: ["Yüzün gülsün, kalbin hep huzurlu olsun sevgilim.", "Birlikte nice güzel ve sakin kandillere.", "Gecen huzurla, günlerin güzel haberlerle dolsun."],
        medium: ["Birlikte paylaştığımız her güzel anın çoğalmasını dilerim sevgilim.", "Yüzünü güldüren ve kalbine iyi gelen güzel günlerimiz çoğalsın.", "İkimizin de huzurla hatırlayacağı nice güzel kandillere ulaşalım."]
      },
      traditional: {
        single: ["hayatımıza huzur, birlik ve bereket getirsin", "gönüllerimize esenlik ve güzel niyetler katsın", "bize sağlık ve huzur içinde nice güzel günler getirsin"],
        short: ["Sağlık, huzur ve iyilik hep bizimle olsun.", "Gönlümüz ferah, ortak günlerimiz güzel olsun.", "Birlikte nice huzurlu kandillere erişelim."],
        medium: ["Hayatımıza sağlık, huzur ve bereket eşlik etsin sevgilim.", "Gönüllerimizin ferah, ortak yarınlarımızın güzel olmasını dilerim.", "Birlik ve esenlik içinde nice kandillere ulaşmamızı dilerim."]
      },
      emotional: {
        single: ["kalplerimiz arasındaki sevgiyi ve güveni daha da güçlendirsin", "yan yana olmanın huzurunu ikimize de yeniden hissettirsin", "özlemleri hafifletip ortak umutlarımızı çoğaltsın"],
        short: ["Varlığın kalbime huzur veren en güzel duygulardan biri.", "Seninle paylaştığım her güzel an benim için çok kıymetli.", "Kalplerimizdeki sevgi ve umut hep canlı kalsın sevgilim."],
        medium: ["Hayatın telaşı içinde varlığının bana verdiği huzuru her zaman hissediyorum.", "Birlikte paylaştığımız sevginin ve güvenin ortak yarınlarımıza güç vermesini dilerim.", "Yan yana olduğumuz her güzel anın kalbimizde sıcak bir iz bırakmasını dilerim."]
      },
      simple: {
        single: ["ikimize huzur ve sağlık getirsin", "senin için güzel ve sakin geçsin", "kalbine ferahlık versin sevgilim"],
        short: ["Huzurlu bir kandil geçir sevgilim.", "Sağlık ve huzur hep bizimle olsun.", "Günün güzel, gönlün ferah olsun sevgilim."],
        medium: ["Sana sağlık, huzur ve güzel bir gece diliyorum sevgilim.", "Birlikte sakin ve güzel bir kandil geçirmemizi dilerim.", "Gününün kolay, gecenin huzurlu geçmesini dilerim sevgilim."]
      }
    },
    work: {
      friendly: {
        single: ["ekibimize huzur, dayanışma ve güzel gelişmeler getirsin", "çalışma hayatımıza sakinlik ve karşılıklı anlayış katsın", "hepimize sağlık, kolaylık ve güzel haberler getirsin"],
        short: ["Tüm ekibe sağlık, huzur ve güzel bir kandil dilerim.", "Dayanışma ve güzel gelişmeler hepimizle olsun.", "Gününüzün sakin ve huzurlu geçmesini dilerim."],
        medium: ["Tüm ekip arkadaşlarıma sağlık, huzur ve güzel gelişmeler diliyorum.", "Birlikte gösterdiğimiz dayanışmanın ve karşılıklı anlayışın güçlenmesini dilerim.", "Çalışmalarımızda kolaylık, hayatımızda huzur dolu bir kandil dilerim."]
      },
      traditional: {
        single: ["çalışmalarımıza bereket, ekibimize huzur ve esenlik getirsin", "hepimize sağlık, birlik ve güzel gelişmeler katsın", "iş hayatımıza kolaylık ve karşılıklı anlayış getirsin"],
        short: ["Tüm çalışma arkadaşlarımıza sağlık, huzur ve bereket dilerim.", "Çalışmalarımızda kolaylık ve güzel sonuçlar bizimle olsun.", "Ekibimize birlik ve esenlik içinde nice kandiller dilerim."],
        medium: ["Tüm çalışma arkadaşlarımıza sağlık, huzur ve bereket diliyorum.", "Çalışmalarımızın kolaylıkla ilerlemesini, dayanışmamızın güçlü kalmasını dilerim.", "Birlik ve esenlik içinde nice güzel kandillere ulaşmayı dilerim."]
      },
      emotional: {
        single: ["paylaştığımız emeğin ve dayanışmanın kıymetini hepimize hissettirsin", "ekibimizdeki anlayışı ve karşılıklı desteği daha da güçlendirsin", "hepimize umut, huzur ve birlikte başarma gücü katsın"],
        short: ["Birlikte gösterdiğimiz emek ve dayanışma için teşekkür ederim.", "Karşılıklı anlayış ve desteğimiz hep güçlü kalsın.", "Tüm ekibimize huzur ve güzel gelişmeler diliyorum."],
        medium: ["Birlikte verdiğimiz emeğin ve kurduğumuz dayanışmanın güçlenmesini dilerim.", "Yoğun günlerde birbirimize gösterdiğimiz anlayışın hep sürmesini dilerim.", "Tüm ekip arkadaşlarımıza umut, huzur ve güzel gelişmeler diliyorum."],
      },
      simple: {
        single: ["tüm ekibe huzur ve sağlık getirsin", "çalışma arkadaşlarımız için sakin ve güzel geçsin", "hepimize kolaylık ve esenlik versin"],
        short: ["Tüm ekibe huzurlu bir kandil dilerim.", "Sağlık ve esenlik hepimizle olsun.", "Gününüz sakin ve güzel geçsin."],
        medium: ["Tüm çalışma arkadaşlarıma sağlık, huzur ve güzel bir gece diliyorum.", "Ekibimize sakin ve huzurlu bir kandil dilerim.", "Gününüzün kolay, gecenizin güzel geçmesini dilerim."]
      }
    }
  };

  const occasions = Object.keys(occasionContent);
  const audiences = Object.keys(audienceContent);
  const tones = ["friendly", "traditional", "emotional", "simple"];
  const lengths = ["single", "short", "medium"];
  const results = [];

  function addAddress(address, sentence) {
    if (!address) return sentence;
    if (/^(Bu|Kandil|Mübarek)/.test(sentence)) {
      return address + sentence.charAt(0).toLocaleLowerCase("tr-TR") + sentence.slice(1);
    }
    return address + sentence;
  }

  function adaptForAudience(sentence, audience) {
    if (audience !== "friend" && audience !== "partner") return sentence;
    return sentence
      .replace(/Kandilinizin/g, "Kandili'nin")
      .replace(/Kandiliniz/g, "Kandili'n")
      .replace(/Geceniz/g, "Gecesi'n")
      .replace(/gönlünüze/g, "gönlüne")
      .replace(/kalbinize/g, "kalbine")
      .replace(/hayatınıza/g, "hayatına")
      .replace(/sevdiklerinizle/g, "sevdiklerinle")
      .replace(/paylaşmanızı/g, "paylaşmanı")
      .replace(/yarınlarınıza/g, "yarınlarına")
      .replace(/yarınınıza/g, "yarınına")
      .replace(/yakınınızda/g, "yakınında")
      .replace(/gecenize/g, "gecene")
      .replace(/gecenizi/g, "geceni")
      .replace(/Gününüz/g, "Günün")
      .replace(/gününüz/g, "günün")
      .replace(/Gönlünüz/g, "Gönlün")
      .replace(/geceniz/g, "gecen")
      .replace(/yüzünüz/g, "yüzün")
      .replace(/sizinle/g, "seninle")
      .replace(/size/g, "sana");
  }

  occasions.forEach(function (occasion) {
    audiences.forEach(function (audience) {
      tones.forEach(function (tone) {
        lengths.forEach(function (length) {
          for (let variant = 0; variant < 3; variant += 1) {
            const address = addresses[audience][tone];
            const occasionParts = occasionContent[occasion][tone];
            const audienceParts = audienceContent[audience][tone];
            const singlePart = adaptForAudience(occasionParts.single[variant], audience);
            const leadPart = adaptForAudience(occasionParts.lead[variant], audience);
            const bridgePart = adaptForAudience(occasionParts.bridge[variant], audience);
            let text;

            if (length === "single") {
              text = addAddress(address, singlePart) + " " + audienceParts.single[variant] + ".";
            } else if (length === "short") {
              text = addAddress(address, leadPart) + " " + audienceParts.short[variant];
            } else {
              text = addAddress(address, leadPart) + " " + bridgePart + " " + audienceParts.medium[variant];
            }

            results.push(Object.freeze({
              id: [occasion, audience, tone, length, String(variant + 1).padStart(2, "0")].join("-"),
              occasion: occasion,
              audience: audience,
              tone: tone,
              length: length,
              text: text
            }));
          }
        });
      });
    });
  });

  window.KATOVIA_KANDIL_MESSAGES = Object.freeze(results);
}());
