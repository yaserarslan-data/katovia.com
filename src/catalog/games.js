const games = [
  ['approve-or-deny','1.1','Approve or Deny','Check applications and decide who gets approved across 20 shifts.','Belgeleri incele ve 20 vardiya boyunca başvuruları onayla ya da reddet.','desktop'],
  ['how-fast-can-you-type','0.2','How Fast Can You Type?','Test your speed and accuracy in 20 English typing exercises.','20 İngilizce yazma egzersizinde hızını ve doğruluğunu ölç.','keyboard'],
  ['night-shift-0300','1.1','Night Shift: 03:00','Watch the CCTV feeds and report anomalies across seven nights.','Yedi gece boyunca güvenlik kameralarını izle ve anormallikleri bildir.','desktop'],
  ['i-was-born-to-be-great','1.1','I Was Born to Be Great — Complete Edition','Follow Ren through six chapters of cinematic action.','Ren’in altı bölümlük sinematik aksiyon hikâyesini oyna.','keyboard'],
  ['sorting-error','0.1','Sorting Error','Sort parcels by the rules in this three-shift arcade prototype.','Üç vardiyalık arcade prototipinde paketleri kurallara göre ayır.','prototype'],
  ['the-liquor-ledger','0.4','The Liquor Ledger','Mix drinks and run a shop at your own pace in this prototype.','Bu prototipte kendi hızında içecek hazırla ve dükkânını işlet.','prototype'],
  ['port-404-8','1.3-rc1','PORT 404//8','Investigate eight apartments in an atmospheric interactive story.','Atmosferik bir interaktif hikâyede sekiz daireyi araştır.','desktop'],
];
export const hostedGames = Object.freeze(games.map(([id,version,title,, , input]) => ({
  id, version, title, input, type:'play', owner:'play', game:true, route:`/play/${id}/`,
  runtime:`/game-builds/${id}/${version}/`, titleKey:`gameShelf.${id}.title`,
  descriptionKey:`gameShelf.${id}.description`, seoTitleKey:`gameShelf.${id}.seoTitle`,
})));
export const gameShelfMessages = {
  en:{'gameShelf.heading':'Games','gameShelf.launch':'Play game','gameShelf.back':'All games and experiences','gameShelf.language':'Game language: English','gameShelf.desktop':'Desktop recommended','gameShelf.keyboard':'Physical keyboard required','gameShelf.prototype':'Prototype'},
  tr:{'gameShelf.heading':'Oyunlar','gameShelf.launch':'Oyna','gameShelf.back':'Tüm oyunlar ve deneyimler','gameShelf.language':'Oyun dili: İngilizce','gameShelf.desktop':'Masaüstü önerilir','gameShelf.keyboard':'Fiziksel klavye gerekir','gameShelf.prototype':'Prototip'},
};
for(const [id,,title,en,tr] of games){
  for(const locale of ['en','tr']){
    gameShelfMessages[locale][`gameShelf.${id}.title`]=title;
    gameShelfMessages[locale][`gameShelf.${id}.seoTitle`]=`${title} | Katovia`;
    gameShelfMessages[locale][`gameShelf.${id}.description`]=locale==='tr'?tr:en;
  }
}
