(function () {
  "use strict";

  const audiences = ["friend", "partner", "family", "colleague", "child", "general"];
  const tones = ["friendly", "emotional", "fun", "simple", "heartfelt", "formal"];
  const lengths = ["single", "short", "medium"];

  const baseContent = {
    friend: {
      friendly: [
        "Yeni yaşın dostluğumuz kadar sıcak ve keyifli geçsin.",
        "Doğum günün bol kahkahalı ve güzel anılarla dolu olsun.",
        "Bugün yüzünü güldüren ne varsa yanında olsun."
      ],
      emotional: [
        "Hayatıma kattığın dostluğun değerini bilerek yeni yaşını kutluyorum.",
        "Paylaştığımız güzel anılara yenilerinin ekleneceği bir yaş diliyorum.",
        "Dostluğumuzun sıcaklığı yeni yaşının her gününe eşlik etsin."
      ],
      fun: [
        "Bugünün programı belli: pasta, kahkaha ve bolca kutlama.",
        "Mumları üflemeden önce dilek listesini hazır etmeyi unutma.",
        "Yeni yaşın kapıyı çaldı; pastadan büyük bir dilimle karşıla."
      ],
      simple: [
        "Doğum günün kutlu olsun, yeni yaşın güzel geçsin.",
        "Sağlıklı, huzurlu ve mutlu bir yaş diliyorum.",
        "Yeni yaşın sana güzel günler getirsin."
      ],
      heartfelt: [
        "İyi bir dostluğun verdiği güvenle doğum gününü içtenlikle kutluyorum.",
        "Hayatımda yer aldığın için mutluyum; yeni yaşın gönlünce olsun.",
        "Dostluğumuzun değerini hissettiğin güzel bir doğum günü diliyorum."
      ],
      formal: [
        "Doğum gününü içten dileklerimle kutlar, güzel bir yaş dilerim.",
        "Yeni yaşının sağlık, huzur ve başarı getirmesini dilerim.",
        "Doğum günün kutlu olsun; yeni yaşın gönlünce geçsin."
      ]
    },
    partner: {
      friendly: [
        "Yeni yaşını yanında olmanın mutluluğuyla kutluyorum.",
        "Doğum günün, birlikte gülümsediğimiz güzel anlar kadar sıcak olsun.",
        "Bugün senin günün; keyfin ve mutluluğun hep yüksek olsun."
      ],
      emotional: [
        "Hayatı paylaşmanın güzelliğini bana hissettirdiğin için yeni yaşını sevgiyle kutluyorum.",
        "Birlikte biriktirdiğimiz anılar yeni yaşında da çoğalsın.",
        "Yeni yaşın kalbine huzur, hayatımıza nice güzel an getirsin."
      ],
      fun: [
        "Bugün pastanın en güzel dilimi ve kutlamanın en neşeli anı senin.",
        "Mumlar hazır, dilekler sırada; bana kalan seninle kutlamak.",
        "Yeni yaşının ilk kuralı belli: bugün bütün güzel sürprizler serbest."
      ],
      simple: [
        "İyi ki doğdun; yeni yaşın mutlulukla geçsin.",
        "Doğum günün kutlu, yeni yaşın güzel olsun.",
        "Yeni yaşında sağlık, huzur ve mutluluk diliyorum."
      ],
      heartfelt: [
        "Yan yana geçirdiğimiz zamanların değerini bilerek yeni yaşını kutluyorum.",
        "Varlığının hayatıma kattığı sıcaklık için teşekkür ediyor, güzel bir yaş diliyorum.",
        "Yeni yaşında da sevgiyi, güveni ve huzuru birlikte büyütelim."
      ],
      formal: [
        "Doğum gününü sevgi ve saygıyla kutluyor, güzel bir yaş diliyorum.",
        "Yeni yaşının huzur, sağlık ve mutluluk getirmesini dilerim.",
        "Doğum günün kutlu olsun; gelecek günlerin gönlünce geçsin."
      ]
    },
    family: {
      friendly: [
        "Ailemizin sıcaklığı yeni yaşında da hep yanında olsun.",
        "Doğum günün evimizdeki güzel anlar kadar neşeli geçsin.",
        "Yeni yaşını ailece paylaşacağımız nice güzel anla kutlayalım."
      ],
      emotional: [
        "Ailemizdeki yerinin değerini hissederek yeni yaşını kutluyorum.",
        "Birlikte büyüttüğümüz güzel anılar yeni yaşında da çoğalsın.",
        "Aile bağımızın verdiği güven ve sıcaklık her zaman yanında olsun."
      ],
      fun: [
        "Bugün aile grubunun en güzel bildirimleri doğum günün için gelsin.",
        "Pasta payı konusunda aile içi dayanışmayı bugün biraz erteleyebiliriz.",
        "Mumlar üflensin, tabaklar dolsun ve evimiz neşeyle şenlensin."
      ],
      simple: [
        "Doğum günün kutlu olsun, yeni yaşın huzurlu geçsin.",
        "Sağlık ve mutlulukla dolu bir yaş diliyorum.",
        "Yeni yaşın ailemize ve sana güzellikler getirsin."
      ],
      heartfelt: [
        "Aynı ailenin parçası olmanın verdiği yakınlıkla doğum gününü kutluyorum.",
        "Hayatımızdaki yerin çok kıymetli; yeni yaşın gönlünce olsun.",
        "Aile sıcaklığını her an hissedeceğin güzel bir yaş diliyorum."
      ],
      formal: [
        "Doğum gününü en güzel dileklerimle kutlar, huzurlu bir yaş dilerim.",
        "Yeni yaşının sağlık, mutluluk ve esenlik getirmesini dilerim.",
        "Doğum günün kutlu olsun; gelecek günlerin güzel geçsin."
      ]
    },
    colleague: {
      friendly: [
        "Doğum gününüz kutlu olsun; yeni yaşınız keyifli ve verimli geçsin.",
        "Yeni yaşınız iş günlerine de güzel bir enerji katsın.",
        "Bugünün yoğunluğu arasında kutlamaya güzel bir mola ayırmanızı dilerim."
      ],
      emotional: [
        "Birlikte çalışmanın kattığı güzel paylaşımlarla doğum gününüzü kutluyorum.",
        "Yeni yaşınızda emeğinizin karşılığını aldığınız güzel günler dilerim.",
        "Çalışma hayatımıza kattığınız değeri düşünerek doğum gününüzü kutluyorum."
      ],
      fun: [
        "Bugünün en önemli gündem maddesi pasta ve doğum günü kutlaması olsun.",
        "Toplantılar kısa, kutlama molası uzun olsun; doğum gününüz kutlu olsun.",
        "Yeni yaşınız gelen kutusundan çok güzel sürprizlerle dolsun."
      ],
      simple: [
        "Doğum gününüz kutlu olsun, güzel bir yaş dilerim.",
        "Yeni yaşınız sağlık ve başarı getirsin.",
        "Mutlu ve huzurlu bir doğum günü dilerim."
      ],
      heartfelt: [
        "Birlikte çalışmaktan duyduğum memnuniyetle doğum gününüzü kutluyorum.",
        "Yeni yaşınızda hem işte hem günlük yaşamda güzel gelişmeler dilerim.",
        "Emeğinizin ve katkınızın değer gördüğü güzel bir yaş dilerim."
      ],
      formal: [
        "Doğum gününüzü kutlar, yeni yaşınızda sağlık ve başarılar dilerim.",
        "Yeni yaşınızın huzur, mutluluk ve verimli çalışmalar getirmesini dilerim.",
        "Doğum gününüzü en iyi dileklerimle kutlarım."
      ]
    },
    child: {
      friendly: [
        "Doğum günün oyunlar, gülücükler ve güzel sürprizlerle dolsun.",
        "Yeni yaşın sana neşeli günler ve yepyeni keşifler getirsin.",
        "Bugün senin günün; dilediğince eğlenip bol bol gülümse."
      ],
      emotional: [
        "Yeni yaşında kendini sevildiğin ve güvende hissettiğin nice güzel günün olsun.",
        "Gülümsemenin çoğaldığı, kalbinin neşeyle dolduğu bir yaş diliyorum.",
        "Büyürken keşfedeceğin her güzellik sana umut ve mutluluk versin."
      ],
      fun: [
        "Pasta hazır, mumlar sırada; bugünün kahramanı sensin.",
        "Yeni yaşın oyun kadar eğlenceli, balonlar kadar renkli olsun.",
        "Dileğini tut ve mumları üfle; kutlama macerası şimdi başlasın."
      ],
      simple: [
        "Doğum günün kutlu olsun, hep mutlu ol.",
        "Yeni yaşın neşeli ve güzel geçsin.",
        "Sana oyun ve mutluluk dolu bir yaş diliyorum."
      ],
      heartfelt: [
        "Yeni yaşında sevgiyle büyüyüp güzel anılar biriktirmeni diliyorum.",
        "Bugünün neşesi kalbinde uzun süre kalsın.",
        "Kendin olarak parladığın mutlu bir yaş diliyorum."
      ],
      formal: [
        "Doğum gününü kutluyor, güzel ve başarılı bir yaş diliyorum.",
        "Yeni yaşının sağlık, mutluluk ve keyif getirmesini dilerim.",
        "Doğum günün kutlu olsun; her günün güzel geçsin."
      ]
    },
    general: {
      friendly: [
        "Yeni yaşın bolca mutluluk ve güzel an getirsin.",
        "Doğum günün sıcak bir kutlama ve güzel sürprizlerle geçsin.",
        "Bugün yüzünü güldüren her şey seninle olsun."
      ],
      emotional: [
        "Yeni yaşın geçmişin güzel anılarını çoğaltacak umutlar getirsin.",
        "Hayatının yeni yaşı kalbine huzur ve mutluluk katsın.",
        "Bugün kendini değerli ve sevgiyle çevrili hissetmeni dilerim."
      ],
      fun: [
        "Pasta, mumlar ve güzel sürprizler bugün sıraya girsin.",
        "Doğum günü bahanesiyle bütün güzel molalar bugün senin olsun.",
        "Yeni yaşın kutlama neşesiyle hızlı ve keyifli bir başlangıç yapsın."
      ],
      simple: [
        "Doğum günün kutlu olsun, güzel bir yaş dilerim.",
        "Yeni yaşın sağlık ve mutluluk getirsin.",
        "Mutlu yıllar; her şey gönlünce olsun."
      ],
      heartfelt: [
        "Yeni yaşının sana iyi gelen insanları ve anları çoğaltmasını dilerim.",
        "Bugünü içten bir gülümsemeyle hatırlayacağın güzel bir yaş dilerim.",
        "Hayatının yeni döneminde huzurun ve umudun hep yanında olsun."
      ],
      formal: [
        "Doğum gününüzü kutlar, sağlıklı ve başarılı bir yaş dilerim.",
        "Yeni yaşınızın huzur, mutluluk ve güzel gelişmeler getirmesini dilerim.",
        "Doğum gününüz kutlu olsun; yeni yaşınız için en güzel dileklerimi sunarım."
      ]
    }
  };

  const toneContent = {
    friendly: {
      short: [
        "Günün keyfini çıkar ve güzel anların tadını doyasıya yaşa.",
        "Yeni başlangıçların sana enerji ve mutluluk vermesini dilerim.",
        "Sevdiklerinle birlikte neşeli bir kutlama geçir."
      ],
      medium: [
        "Yeni başlangıçların sana enerji ve huzur vermesini dilerim.",
        "Günlük telaşın arasında kendine güzel anlar ayır.",
        "Kutlamanın neşesi bütün haftana yayılsın."
      ]
    },
    emotional: {
      short: [
        "Yeni yaşında kalbine iyi gelen anların çoğalmasını dilerim.",
        "Umutların ve güzel başlangıçların hep seninle olsun.",
        "Kendini değerli hissettiğin nice günün olsun."
      ],
      medium: [
        "Geçmişin güzel anıları sana güç, yeni umutların yoluna ışık versin.",
        "Her yeni gün kendine ve hayata dair güzel bir umut getirsin.",
        "Kalbinde taşıdığın güzel dilekler yeni yaşında çoğalsın."
      ]
    },
      fun: {
      short: [
        "Kutlama kuralları basit: bolca gülümse ve pastaya yer ayır.",
        "Dilek hakkını iyi kullan; pasta payını ise hiç düşünmeden büyüt.",
        "Kutlama modu gün boyu açık, gereksiz ciddiyet ise kapalı kalsın."
      ],
      medium: [
        "Bugün takvimden çok pasta dilimleri konuşsun.",
        "Mumların sayısı değil, kutlamanın keyfi önemli olsun.",
        "Günün küçük sürprizleri yüzünde büyük bir gülümseme bıraksın."
      ]
    },
    simple: {
      short: [
        "Sağlık, huzur ve mutluluk seninle olsun.",
        "Güzel günlerle dolu bir yıl dilerim.",
        "Her şeyin gönlünce olmasını dilerim."
      ],
      medium: [
        "Sağlık ve huzur her gününe eşlik etsin.",
        "Yeni başlangıçların sana mutluluk getirsin.",
        "Güzel anılar biriktireceğin bir yıl olsun."
      ]
    },
    heartfelt: {
      short: [
        "Yeni yaşında değerini hissettiğin güzel anların çoğalmasını dilerim.",
        "Gönlünden geçen güzellikler hayatında sıcak bir yer bulsun.",
        "İçten dileklerim bugün ve yeni yaşın boyunca seninle olsun."
      ],
      medium: [
        "Kendine ayırdığın her güzel an sana huzur versin.",
        "Sana iyi gelen bağlar ve anılar yeni yaşında çoğalsın.",
        "Hayatın küçük güzellikleri her gün yüzünü güldürsün."
      ]
    },
      formal: {
      short: [
        "Güzel gelişmelerin ve huzurun size eşlik etmesini dilerim.",
        "Gelecek dönemin güzel gelişmeler getirmesini temenni ederim.",
        "Mutluluk ve esenlik dolu bir yıl geçirmenizi dilerim."
      ],
      medium: [
        "Yeni dönemin size güzel fırsatlar ve huzur getirmesini dilerim.",
        "Sağlık ve mutluluğun yaşamınız boyunca size eşlik etmesini dilerim.",
        "Gelecek günlerin güzel gelişmelerle dolu olmasını temenni ederim."
      ]
    }
  };

  const audienceEndings = {
    friend: [
      "Dostluğumuza ekleyeceğimiz nice güzel an bizi beklesin.",
      "Birlikte güleceğimiz ve hatırlayacağımız günler çoğalsın.",
      "Yeni yaşının her anında dostluğumuzun sıcaklığını hisset."
    ],
    partner: [
      "Birlikte paylaşacağımız yeni anları sevgi ve heyecanla bekliyorum.",
      "Ortak günlerimizin huzuru ve neşesi yeni yaşında da çoğalsın.",
      "Yan yana kurduğumuz her güzel hayal bize mutluluk getirsin."
    ],
    family: [
      "Ailemizin sevgisi ve desteği her zaman yanında olsun.",
      "Birlikte kutlayacağımız nice güzel günümüz olsun.",
      "Evimizin sıcaklığı yeni yaşının her gününe eşlik etsin."
    ],
    colleague: [
      "Yeni yaşınızın çalışma yaşamınıza ve günlük hayatınıza güzellik katmasını dilerim.",
      "Başarılarınızın ve güzel paylaşımlarınızın devamını dilerim.",
      "Ekibimizle birlikte nice güzel başarıyı paylaşmanızı dilerim."
    ],
    child: [
      "Oyun, keşif ve kahkaha dolu nice güzel günün olsun.",
      "Sevildiğini ve desteklendiğini her zaman hatırla.",
      "Yeni yaşında öğreneceğin her şey sana keyif versin."
    ],
    general: [
      "Yeni yaşının her günü sana güzel bir hatıra bıraksın.",
      "Sevdiklerinle paylaşacağın nice mutlu günün olsun.",
      "Hayatının yeni dönemi gönlündeki güzellikleri çoğaltsın."
    ]
  };

  function lowerFirst(text) {
    return text.charAt(0).toLocaleLowerCase("tr-TR") + text.slice(1);
  }

  function insertBeforeFirstStop(text, token) {
    const match = text.match(/[.!?]/);
    if (!match) return text + " " + token;
    const index = match.index;
    return text.slice(0, index) + " " + token + text.slice(index);
  }

  function createNamedTemplate(text, length, variant, audience, tone) {
    if (variant === 0) return "{name}, " + lowerFirst(text);
    if (variant === 1) return insertBeforeFirstStop(text, "{name}");
    const polite = audience === "colleague" || (audience === "general" && tone === "formal");
    const birthdayGreeting = polite ? "İyi ki doğdunuz {name}" : "İyi ki doğdun {name}";
    if (length === "single") return birthdayGreeting + "; " + lowerFirst(text);
    if (length === "medium") return birthdayGreeting + ". " + text;
    return "{name}, " + lowerFirst(text);
  }

  function adaptTonePart(text, audience, tone) {
    if (audience === "colleague" && tone !== "formal") {
      return text
        .replace(/Kendine ayırdığın/g, "Kendinize ayırdığınız")
        .replace(/Kalbinde taşıdığın/g, "Kalbinizde taşıdığınız")
        .replace(/Yeni yaşında değerini hissettiğin/g, "Yeni yaşınızda değerinizi hissettiğiniz")
        .replace(/Günün keyfini çıkar/g, "Günün keyfini çıkarın")
        .replace(/doyasıya yaşa/g, "doyasıya yaşayın")
        .replace(/Sevdiklerinle/g, "Sevdiklerinizle")
        .replace(/kutlama geçir/g, "kutlama geçirin")
        .replace(/kalbine/g, "kalbinize")
        .replace(/Umutların/g, "Umutlarınız")
        .replace(/seninle/g, "sizinle")
        .replace(/Kendini/g, "Kendinizi")
        .replace(/günün olsun/g, "gününüz olsun")
        .replace(/sana/g, "size")
        .replace(/yoluna/g, "yolunuza")
        .replace(/kendine/g, "kendinize")
        .replace(/Yeni yaşında/g, "Yeni yaşınızda")
        .replace(/yeni yaşında/g, "yeni yaşınızda")
        .replace(/yeni yaşın boyunca/g, "yeni yaşınız boyunca")
        .replace(/gülümse ve/g, "gülümseyin ve")
        .replace(/yer ayır\./g, "yer ayırın.")
        .replace(/güzel anlar ayır\./g, "güzel anlar ayırın.")
        .replace(/Dilek hakkını iyi kullan/g, "Dilek hakkınızı iyi kullanın")
        .replace(/pasta payını ise hiç düşünmeden büyüt/g, "pasta payınızı ise hiç düşünmeden büyütün")
        .replace(/kendine güzel anlar ayır/g, "kendinize güzel anlar ayırın")
        .replace(/Gönlünden/g, "Gönlünüzden")
        .replace(/hayatında/g, "hayatınızda")
        .replace(/İçten dileklerim bugün ve yeni yaşın boyunca/g, "İçten dileklerim bugün ve yeni yaşınız boyunca")
        .replace(/Sana iyi gelen/g, "Size iyi gelen")
        .replace(/yüzünü/g, "yüzünüzü")
        .replace(/gönlünce/g, "gönlünüzce");
    }
    if (tone !== "formal" || audience === "colleague" || audience === "general") return text;
    return text
      .replace(/yaşınızda/g, "yaşında")
      .replace(/yaşınızın/g, "yaşının")
      .replace(/yaşamınız/g, "yaşamın")
      .replace(/size/g, "sana")
      .replace(/geçirmenizi/g, "geçirmeni");
  }

  function adaptAudienceEnding(text, audience, tone) {
    if (tone !== "formal" || audience !== "general") return text;
    return text
      .replace(/yaşının/g, "yaşınızın")
      .replace(/Sevdiklerinle paylaşacağın nice mutlu günün olsun/g, "Sevdiklerinizle paylaşacağınız nice mutlu gününüz olsun")
      .replace(/gönlündeki/g, "gönlünüzdeki");
  }

  const results = [];
  audiences.forEach(function (audience) {
    tones.forEach(function (tone) {
      lengths.forEach(function (length) {
        for (let variant = 0; variant < 3; variant += 1) {
          let withoutName = baseContent[audience][tone][variant];
          if (length === "short") {
            withoutName += " " + adaptTonePart(toneContent[tone].short[variant], audience, tone);
          } else if (length === "medium") {
            withoutName += " " + adaptTonePart(toneContent[tone].medium[variant], audience, tone) + " " +
              adaptAudienceEnding(audienceEndings[audience][variant], audience, tone);
          }
          results.push(Object.freeze({
            id: [audience, tone, length, String(variant + 1).padStart(2, "0")].join("-"),
            audience: audience,
            tone: tone,
            length: length,
            withName: createNamedTemplate(withoutName, length, variant, audience, tone),
            withoutName: withoutName
          }));
        }
      });
    });
  });

  window.KATOVIA_BIRTHDAY_MESSAGES = Object.freeze(results);
}());
