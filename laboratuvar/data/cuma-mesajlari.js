(function () {
  "use strict";

  const messagePools = {
    "general-friendly-single": [
      "Gönlünüzün hafiflediği, yüzünüzün gülümsediği güzel bir gün olsun; hayırlı cumalar.",
      "Bugün size huzur, sevdiklerinizle birlikte nice güzel an getirsin; hayırlı cumalar."
    ],
    "general-friendly-short": [
      "Gününüz huzurla, gönlünüz güzel düşüncelerle dolsun. Hayırlı cumalar.",
      "Bu güzel gün yüreğinize ferahlık, evinize neşe getirsin. Cumanız hayırlı olsun."
    ],
    "general-friendly-medium": [
      "Yeni bir cumaya sağlıkla ulaşmanın sevincini paylaşalım. Gönlünüz huzur, gününüz güzel haberlerle dolsun. Sevdiklerinizle birlikte hayırlı cumalar dilerim.",
      "Bugün küçük bir tebessümün bile etrafımıza iyilik yaydığı bir gün olsun. Kalbiniz ferahlasın, işleriniz kolaylaşsın. Hayırlı cumalar."
    ],
    "general-traditional-single": [
      "Cumanız huzura, iyiliğe ve berekete vesile olsun; hayırlı cumalar.",
      "Bu mübarek cuma günü gönüllerinize ferahlık, hanelerinize huzur getirsin."
    ],
    "general-traditional-short": [
      "Cuma gününüz huzur ve bereket içinde geçsin. Hayırlı cumalar dilerim.",
      "Gönüllerin iyilikte buluştuğu güzel bir cuma olsun. Cumanız mübarek olsun."
    ],
    "general-traditional-medium": [
      "Bir cuma gününe daha sağlıkla eriştik. Gönüllerimiz iyilikle, hanelerimiz huzurla dolsun. Cumanız mübarek olsun.",
      "Cumanın huzuru gününüze, bereketi sofranıza, güzelliği gönlünüze yansısın. Sevdiklerinizle birlikte esenlik içinde olun. Hayırlı cumalar."
    ],
    "general-emotional-single": [
      "Kalbinize iyi gelen insanların ve umutların hep yakınınızda olduğu bir cuma olsun.",
      "Bugün gönlünüzde taşıdığınız tüm güzel dilekler size huzur olarak dönsün; hayırlı cumalar."
    ],
    "general-emotional-short": [
      "Bazen içten bir selam, uzun bir konuşmadan daha çok şey anlatır. Gönülden hayırlı cumalar.",
      "Yorgun kalbinize ferahlık, özlediğiniz anlara yakınlık gelsin. Cumanız huzurlu olsun."
    ],
    "general-emotional-medium": [
      "Hayatın telaşı içinde kalbimize iyi gelenleri hatırlamak ne güzel. Bugün kırgınlıklar hafiflesin, güzel duygular çoğalsın. Gönülden hayırlı cumalar.",
      "Her yeni gün umut için küçük bir kapı aralar. Bu cuma gönlünüze sakinlik, yolunuza iyilik getirsin. Sevdiklerinizle huzurlu bir gün dilerim."
    ],
    "general-simple-single": [
      "Huzurlu ve güzel bir gün geçirmeniz dileğiyle, hayırlı cumalar.",
      "Gününüz aydınlık, gönlünüz ferah olsun; hayırlı cumalar."
    ],
    "general-simple-short": [
      "Sağlık ve huzur dolu bir gün dilerim. Hayırlı cumalar.",
      "Cumanız güzel, işleriniz kolay olsun. Esenlikler dilerim."
    ],
    "general-simple-medium": [
      "Bugünün size huzur ve kolaylık getirmesini dilerim. Sevdiklerinizle güzel vakit geçirin. Hayırlı cumalar.",
      "Sakin, sağlıklı ve güzel bir cuma olsun. Gününüzün her anı gönlünüzce geçsin. Hayırlı cumalar dilerim."
    ],
    "general-lightHumor-single": [
      "Cumanız huzurlu, kahveniz sıcak, yapılacaklar listeniz olabildiğince kısa olsun.",
      "Bugün güzel haberler, sakin bildirimler ve keyifli molalar sizinle olsun; hayırlı cumalar."
    ],
    "general-lightHumor-short": [
      "Haftanın yorgunluğu geride, huzuru yanınızda kalsın. Kahveniz de tam kıvamında olsun; hayırlı cumalar.",
      "Bugün işler kolay, sohbetler güzel, telefon biraz sessiz olsun. Hayırlı cumalar."
    ],
    "general-lightHumor-medium": [
      "Cuma geldi; yoğun takvim biraz sakinleşsin, omuzlar biraz hafiflesin. Güzel bir kahveye ve içten bir sohbete vakit kalsın. Huzurlu cumalar.",
      "Haftanın bütün telaşı bugün kısa bir mola versin. Bildirimler az, güzel haberler çok olsun. Keyifli ve hayırlı cumalar dilerim."
    ],

    "family-friendly-single": [
      "Canım ailem, evimizden sevgi ve huzurun eksik olmadığı nice güzel cumalarımız olsun.",
      "Ailemizin neşesi, soframızın bereketi daim olsun; hepinize hayırlı cumalar."
    ],
    "family-friendly-short": [
      "Canım ailem, hepinizin günü huzurla geçsin. Evimizden gülümseme hiç eksik olmasın; hayırlı cumalar.",
      "Birlikte olduğumuz her gün en güzel hediyemiz. Hepinize sağlık ve neşe dolu cumalar."
    ],
    "family-friendly-medium": [
      "Canım ailem, bir cuma sabahında daha sizleri sevgiyle anıyorum. Evimiz huzurla, soframız bereketle dolsun. Hepinize gönülden hayırlı cumalar.",
      "Aynı çatı altında ya da uzakta olsak da gönüllerimiz hep bir. Bugün hepimizin yüzü gülsün, işleri kolaylaşsın. Ailemize huzurlu cumalar."
    ],
    "family-traditional-single": [
      "Aziz ailem, cumanız mübarek, haneniz huzur ve bereketle dolu olsun.",
      "Cuma gününün güzelliği ailemizin birliğine ve evimizin huzuruna yansısın."
    ],
    "family-traditional-short": [
      "Kıymetli ailem, cumanız mübarek olsun. Hanemizde sağlık, huzur ve bereket daim olsun.",
      "Birlik ve muhabbetimizin güçlendiği güzel bir cuma olsun. Hepinize hayırlı cumalar."
    ],
    "family-traditional-medium": [
      "Kıymetli ailem, bir cuma gününe daha birlikte ulaşmanın şükrü içindeyiz. Evimizden huzur, soframızdan bereket eksik olmasın. Cumanız mübarek olsun.",
      "Cumanın manevi huzuru gönüllerimizi birbirine daha da yaklaştırsın. Büyüklerimiz sağlıkla, küçüklerimiz neşeyle yanımızda olsun. Ailemize hayırlı cumalar."
    ],
    "family-emotional-single": [
      "Canım ailem, varlığınızın kalbime verdiği güvenle hepinize huzurlu cumalar diliyorum.",
      "Uzakta olsak bile sevgimizin hep aynı sıcaklıkta kaldığı güzel bir cuma olsun."
    ],
    "family-emotional-short": [
      "Canım ailem, iyi ki hayatımda ve kalbimdesiniz. Hepinize huzur dolu cumalar.",
      "Evin sıcaklığı sizlerin sevgisiyle güzel. Birlikte nice sağlıklı cumalara."
    ],
    "family-emotional-medium": [
      "Canım ailem, hayat ne kadar yoğun olursa olsun kalbimdeki yeriniz hiç değişmiyor. Sesinizi duymak, iyi olduğunuzu bilmek bana güç veriyor. Hepinize huzurlu cumalar.",
      "Aile olmak aynı evde bulunmaktan çok, her an birbirini gönülde taşımaktır. Bugün sevgimiz çoğalsın, özlemlerimiz azalsın. Gönülden hayırlı cumalar."
    ],
    "family-simple-single": [
      "Ailemize sağlık, huzur ve güzel bir cuma diliyorum.",
      "Canım ailem, gününüz güzel, cumanız hayırlı olsun."
    ],
    "family-simple-short": [
      "Canım ailem, hepinizin cumanız hayırlı olsun. Sağlık ve huzurla kalın.",
      "Ailemizin günü güzel ve sakin geçsin. Hayırlı cumalar."
    ],
    "family-simple-medium": [
      "Canım ailem, hepinize sağlıklı ve huzurlu bir gün dilerim. İşleriniz kolay, neşeniz bol olsun. Hayırlı cumalar.",
      "Bugün ailemizin her üyesi için güzel geçsin. Evimizde huzur, soframızda bereket olsun. Cumanız hayırlı olsun."
    ],
    "family-lightHumor-single": [
      "Aile grubumuz bugün yalnız güzel haberlerle hareketlensin; hepinize huzurlu cumalar.",
      "Canım ailem, çayımız sıcak, sohbetimiz koyu, telefonlarımız biraz sessiz olsun; hayırlı cumalar."
    ],
    "family-lightHumor-short": [
      "Aile grubuna günün en sakin bildirimini bırakıyorum. Hepinize huzurlu ve neşeli cumalar.",
      "Bugün sofrada muhabbet çok, acele az olsun. Canım aileme hayırlı cumalar."
    ],
    "family-lightHumor-medium": [
      "Canım ailem, cuma bahanesiyle gruba güzel bir selam bırakayım dedim. Bugün bildirimlerimiz iyi haberlerden, soframız keyifli sohbetlerden dolsun. Hepinize hayırlı cumalar.",
      "Haftanın yorgunluğunu çayın yanına bırakıp biraz soluklanalım. Evde neşe, aile grubunda tatlı sohbet eksik olmasın. Huzurlu cumalar."
    ],

    "friend-friendly-single": [
      "Güzel dostum, yüzünü güldüren haberlerle dolu huzurlu bir cuman olsun.",
      "Dostluğumuz gibi içten ve güzel bir gün geçirmen dileğiyle, hayırlı cumalar."
    ],
    "friend-friendly-short": [
      "Güzel dostum, günün keyifli ve huzurlu geçsin. Hayırlı cumalar.",
      "Bugün yolun güzel insanlara ve güzel haberlere çıksın. Huzurlu cumalar dostum."
    ],
    "friend-friendly-medium": [
      "Sevgili dostum, haftanın telaşı arasında sana içten bir selam bırakmak istedim. Günün huzurlu, neşen bol olsun. Hayırlı cumalar.",
      "Dostluğun en güzel yanı, uzakta olsak da birbirimizi hatırlamak. Bugün yüzünü güldüren nice küçük güzellik bulsun seni. Huzurlu cumalar dostum."
    ],
    "friend-traditional-single": [
      "Aziz dostum, cuman mübarek, gönlün huzur ve iyilikle dolu olsun.",
      "Cuma gününün bereketi yoluna, huzuru gönlüne yansısın dostum."
    ],
    "friend-traditional-short": [
      "Kıymetli dostum, cuman mübarek olsun. Sağlık, huzur ve esenlik seninle olsun.",
      "Bu güzel cuma günü gönlüne ferahlık getirsin. Hayırlı cumalar dostum."
    ],
    "friend-traditional-medium": [
      "Kıymetli dostum, bir cuma gününe daha eriştik. Gönlün huzurla, hayatın güzel gelişmelerle dolsun. Cuman mübarek olsun.",
      "Cumanın güzelliği gününe, bereketi işlerine yansısın. Dostluğumuz sağlık ve esenlik içinde sürsün. Hayırlı cumalar."
    ],
    "friend-emotional-single": [
      "İyi günümde sevincimi, zor günümde yükümü paylaşan dostuma gönülden hayırlı cumalar.",
      "Mesafeler değişse de kıymeti hiç değişmeyen dostluğumuza huzurlu cumalar."
    ],
    "friend-emotional-short": [
      "Dostluğun hayatıma kattığı güzellik için sana teşekkür ederim. Gönülden hayırlı cumalar.",
      "Bazen tek bir dost sesi bütün yorgunluğu unutturur. İyi ki varsın, huzurlu cumalar."
    ],
    "friend-emotional-medium": [
      "Gerçek dostluk, zaman geçse de aynı sıcaklıkla devam eder. Varlığın ve güzel kalbin için teşekkür ederim. Gönülden hayırlı cumalar dostum.",
      "Hayatın farklı yollarında ilerlesek de dostluğumuz hep güven veren bir durak. Bugün kalbin ferahlasın, yüzün gülsün. Huzurlu cumalar."
    ],
    "friend-simple-single": [
      "Dostum, güzel ve huzurlu bir cuma geçirmeni dilerim.",
      "Günün sakin, keyfin yerinde olsun; hayırlı cumalar dostum."
    ],
    "friend-simple-short": [
      "Huzurlu bir gün geçir dostum. Hayırlı cumalar.",
      "İşlerin kolay, günün güzel olsun. Cuman hayırlı olsun dostum."
    ],
    "friend-simple-medium": [
      "Dostum, bugün her şey gönlünce olsun. Kendine güzel bir mola ayır. Hayırlı cumalar.",
      "Sana sakin ve keyifli bir gün diliyorum. Güzel haberler al, yüzün gülsün. Huzurlu cumalar dostum."
    ],
    "friend-lightHumor-single": [
      "Dostum, cuman huzurlu, kahven bol, toplantıların kısa olsun.",
      "Bugün alarmı değil güzel haberleri ertelemeyelim; hayırlı cumalar dostum."
    ],
    "friend-lightHumor-short": [
      "Haftayı devirdik sayılır dostum. Kahveni al, biraz soluklan; hayırlı cumalar.",
      "Bugün mesajlar kısa, keyif uzun olsun. Huzurlu cumalar dostum."
    ],
    "friend-lightHumor-medium": [
      "Dostum, cuma geldiğine göre haftanın yorgunluğunu usulca kapının dışında bırakabiliriz. Kahve sıcak, sohbet güzel olsun. Hayırlı cumalar.",
      "Bugün yapılacaklar listesi bize biraz anlayış göstersin. Biz de güzel bir mola ve keyifli bir sohbet bulalım. Huzurlu cumalar dostum."
    ],

    "partner-friendly-single": [
      "Sevgilim, gülüşünün günüme ışık kattığı huzurlu ve güzel bir cuman olsun.",
      "Yanımda oluşunun verdiği mutlulukla sana sevgi dolu bir cuma diliyorum."
    ],
    "partner-friendly-short": [
      "Sevgilim, bugün de yüzün hep gülsün. Birlikte nice huzurlu cumalara.",
      "Günümün en güzel düşüncesi yine sensin. Cuman huzurlu ve neşeli olsun."
    ],
    "partner-friendly-medium": [
      "Sevgilim, yoğun bir günün ortasında sana küçük bir selam bırakmak istedim. Gülüşün hiç eksilmesin, işlerin kolay gitsin. Birlikte nice güzel cumalara.",
      "Hayatı seninle paylaşmak sıradan günleri bile güzelleştiriyor. Bugün kalbin huzurlu, yüzün hep güleç olsun. Hayırlı cumalar sevgilim."
    ],
    "partner-traditional-single": [
      "Sevgilim, cuman mübarek, gönlün huzur ve güzelliklerle dolu olsun.",
      "Cuma gününün huzuru kalbine, bereketi hayatımıza yansısın sevgilim."
    ],
    "partner-traditional-short": [
      "Sevgilim, cuman mübarek olsun. Sağlık, huzur ve iyilik hep bizimle olsun.",
      "Bu güzel gün gönlüne ferahlık getirsin. Hayırlı cumalar sevgilim."
    ],
    "partner-traditional-medium": [
      "Sevgilim, bir cuma gününe daha birlikte ulaşmanın mutluluğunu taşıyorum. Gönlümüz huzurla, yuvamız güzellikle dolsun. Cuman mübarek olsun.",
      "Cumanın huzuru bugünümüze, bereketi ortak yarınlarımıza yansısın. Birbirimize duyduğumuz sevgi ve saygı hep artsın. Hayırlı cumalar sevgilim."
    ],
    "partner-emotional-single": [
      "Sevgilim, kalbimin en güzel yerinde olduğun her gün gibi bu cuma da seninle anlamlı.",
      "Hayatın bütün telaşı içinde içimi huzurla dolduran sana gönülden hayırlı cumalar."
    ],
    "partner-emotional-short": [
      "Sevgilim, varlığın kalbime iyi gelen en güzel huzur. Birlikte nice cumalara.",
      "Seni düşündüğümde dünya biraz daha sakin ve güzel oluyor. Huzurlu cumalar sevgilim."
    ],
    "partner-emotional-medium": [
      "Sevgilim, hayatın telaşı içinde elini tutabilmek bana hep güç veriyor. İyi günleri çoğaltıp zor günleri birlikte aşmak ne güzel. Kalbimden geçen tüm sevgiyle hayırlı cumalar.",
      "Seninle paylaştığım her an, hafızamda sıcak bir ışık gibi kalıyor. Bugün kalbin huzurla, gözlerin mutlulukla dolsun. Birlikte nice güzel cumalara sevgilim."
    ],
    "partner-simple-single": [
      "Sevgilim, sana huzurlu ve güzel bir cuma diliyorum.",
      "Günün güzel, kalbin ferah olsun; hayırlı cumalar sevgilim."
    ],
    "partner-simple-short": [
      "Sevgilim, günün huzurla geçsin. Hayırlı cumalar.",
      "Bugün yüzün hep gülsün. Güzel bir cuma geçir sevgilim."
    ],
    "partner-simple-medium": [
      "Sevgilim, sana sakin ve güzel bir gün diliyorum. İşlerin kolay, keyfin yerinde olsun. Hayırlı cumalar.",
      "Bugün her şey gönlünce ilerlesin. Kendine güzel bir mola ayır. Huzurlu cumalar sevgilim."
    ],
    "partner-lightHumor-single": [
      "Sevgilim, cuman huzurlu, kahven sıcak, beni özleme süren de mümkün olduğunca kısa olsun.",
      "Bugün telefonun az, yüzün çok gülsün; hayırlı cumalar sevgilim."
    ],
    "partner-lightHumor-short": [
      "Sevgilim, haftanın yorgunluğunu bir kahveyle kandıralım. Cuman huzurlu, keyfin bol olsun.",
      "Bugün yapılacaklar biraz beklesin, gülümsemen öne geçsin. Hayırlı cumalar sevgilim."
    ],
    "partner-lightHumor-medium": [
      "Sevgilim, cuma geldi; takvim yoğun görünse de sana ayırdığım yer hep hazır. Kahvemiz sıcak, sohbetimiz uzun olsun. Huzurlu cumalar.",
      "Haftanın bütün koşturmacası bugün biraz yavaşlasın. Telefonlarımız sessize, keyfimiz yükseğe alınsın. Hayırlı cumalar sevgilim."
    ],

    "work-friendly-single": [
      "Değerli çalışma arkadaşlarım, emeğinizin karşılığını aldığınız huzurlu ve verimli bir cuma dilerim.",
      "Tüm ekip arkadaşlarıma kolaylık, güzel gelişmeler ve hayırlı cumalar dilerim."
    ],
    "work-friendly-short": [
      "Değerli çalışma arkadaşlarım, gününüz verimli ve huzurlu geçsin. Hayırlı cumalar.",
      "Tüm ekip arkadaşlarıma kolaylıklar diliyorum. Güzel ve sakin bir cuma olsun."
    ],
    "work-friendly-medium": [
      "Değerli çalışma arkadaşlarım, haftanın emeğini birlikte paylaşırken dayanışmanız için teşekkür ederim. Bugünün hepimiz için verimli ve huzurlu geçmesini dilerim. Hayırlı cumalar.",
      "Tüm ekip arkadaşlarıma güzel bir cuma diliyorum. İşlerimiz kolaylıkla ilerlesin, gün içinde keyifli molalara da yer kalsın. Herkese iyi çalışmalar."
    ],
    "work-traditional-single": [
      "Değerli çalışma arkadaşlarım, cumanız mübarek, işleriniz bereketli ve gönlünüz huzurlu olsun.",
      "Cuma gününün huzuru ve bereketi tüm çalışma arkadaşlarımızla birlikte olsun."
    ],
    "work-traditional-short": [
      "Değerli çalışma arkadaşlarım, cumanız mübarek olsun. İşlerinizde kolaylık ve bereket dilerim.",
      "Tüm çalışma arkadaşlarımıza sağlık, huzur ve esenlik diliyorum. Hayırlı cumalar."
    ],
    "work-traditional-medium": [
      "Değerli çalışma arkadaşlarım, cuma gününün huzur ve bereket getirmesini dilerim. Emeklerimizin güzel sonuçlara ulaşması, işlerimizin kolaylıkla ilerlemesi temennisiyle. Cumanız mübarek olsun.",
      "Kıymetli ekip arkadaşlarım, bir cuma gününe daha sağlıkla ulaştık. Çalışmalarımızda kolaylık, iş hayatımızda huzur ve bereket diliyorum. Hayırlı cumalar."
    ],
    "work-emotional-single": [
      "Aynı hedef için emek verdiğim değerli çalışma arkadaşlarıma gönülden huzurlu cumalar dilerim.",
      "Emeğin ve dayanışmanın kıymetini hissettiğimiz güzel bir cuma olsun."
    ],
    "work-emotional-short": [
      "Birlikte gösterdiğimiz emek ve dayanışma için teşekkür ederim. Hepinize gönülden hayırlı cumalar.",
      "Yoğun günlerde birbirimize verdiğimiz destek çok kıymetli. Tüm ekibe huzurlu cumalar."
    ],
    "work-emotional-medium": [
      "Değerli çalışma arkadaşlarım, birlikte verilen emeğin ve paylaşılan başarının değeri büyük. Her birinizin katkısı için teşekkür ederim. Hepinize huzurlu cumalar dilerim.",
      "Yoğunluk içinde gösterdiğimiz anlayış ve dayanışma işimizi daha anlamlı kılıyor. Bugün hepimizin gönlü ferah, yüzü güleç olsun. Hayırlı cumalar."
    ],
    "work-simple-single": [
      "Tüm çalışma arkadaşlarıma huzurlu ve verimli bir cuma dilerim.",
      "Gününüz kolaylıkla geçsin; hayırlı cumalar ve iyi çalışmalar."
    ],
    "work-simple-short": [
      "Değerli çalışma arkadaşlarım, gününüz verimli geçsin. Hayırlı cumalar.",
      "Herkese kolaylıklar ve huzurlu bir cuma dilerim. İyi çalışmalar."
    ],
    "work-simple-medium": [
      "Tüm çalışma arkadaşlarıma verimli ve huzurlu bir gün dilerim. İşleriniz kolaylıkla ilerlesin. Hayırlı cumalar.",
      "Değerli ekip arkadaşlarım, gününüz sakin ve güzel geçsin. Çalışmalarınızda kolaylıklar dilerim. Hayırlı cumalar."
    ],
    "work-lightHumor-single": [
      "Tüm ekibe toplantıların kısa, kahvelerin sıcak olduğu huzurlu bir cuma dilerim.",
      "Bugün gelen kutuları sakin, işlerimizi akıcı görmek dileğiyle hayırlı cumalar."
    ],
    "work-lightHumor-short": [
      "Cuma günü takvimler bize biraz anlayış göstersin. Tüm ekibe kolaylıklar ve hayırlı cumalar.",
      "Kahveler sıcak, toplantılar kısa, işler yolunda olsun. Herkese huzurlu cumalar."
    ],
    "work-lightHumor-medium": [
      "Değerli ekip arkadaşlarım, haftanın son düzlüğünde takvimlerimiz biraz sakinleşsin. Kahveler soğumadan işlerimiz kolaylıkla tamamlansın. Hepinize hayırlı cumalar.",
      "Bugün e-postalar kısa, güzel haberler uzun olsun. Yoğunluğun arasında keyifli bir mola bulmayı da unutmayalım. Tüm ekibe huzurlu cumalar."
    ]
  };

  window.KATOVIA_FRIDAY_MESSAGES = Object.entries(messagePools).flatMap(function (entry) {
    const parts = entry[0].split("-");
    const audience = parts[0];
    const tone = parts[1];
    const length = parts[2];

    return entry[1].map(function (text, index) {
      return Object.freeze({
        id: entry[0] + "-" + String(index + 1).padStart(2, "0"),
        audience: audience,
        tone: tone,
        length: length,
        text: text
      });
    });
  });
}());
