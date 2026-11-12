/* Original code-native pixel scenery; paperwork remains native, readable HTML. */
(function(root){
  'use strict';
  function draw(canvas,seed=1){
    const c=canvas.getContext('2d');canvas.width=640;canvas.height=360;c.imageSmoothingEnabled=false;
    let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x|0,y|0,w|0,h|0);};
    const line=(x1,y1,x2,y2,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
    const box=(x,y,w,h,fill,edge='#1e251f')=>{r(x,y,w,h,edge);r(x+2,y+2,w-4,h-4,fill);};
    // Plaster wall, wooden lower cabinets, and a deep felt-lined work surface.
    r(0,0,640,360,'#343e33');r(0,115,202,150,'#414a3a');
    for(let y=116;y<267;y+=7){r(0,y,202,1,'#384331');r(0,y+1,202,1,'#4a503e');}
    r(202,0,438,360,'#393a2b');r(205,69,435,291,'#726348');
    for(let x=206;x<640;x+=37){r(x,70,1,290,'#504a34');r(x+2,70,1,290,'#8b7651');}
    for(let i=0;i<350;i++){const x=209+random()*429,y=72+random()*285;r(x,y,random()*13+2,1,random()>.5?'#89755444':'#302d2244');}
    box(212,77,418,241,'#505d46','#333c2b');
    r(215,80,412,1,'#84916a');r(215,314,412,1,'#303d2e');
    for(let i=0;i<550;i++)r(216+random()*408,82+random()*230,1,1,random()>.5?'#82916a22':'#15271a22');
    // The citizens' side of the building: cold, quiet pavement and queue barriers.
    box(9,9,184,112,'#202720','#171d19');box(14,14,174,102,'#8e9180','#626b55');
    r(17,17,168,91,'#777e72');r(17,17,168,35,'#92978a');
    for(let x=18;x<187;x+=12){r(x,19,8,19,'#686f66');r(x+1,20,2,12,'#b0ad98');}
    r(17,51,168,4,'#586150');r(17,56,168,52,'#828777');
    for(let y=59;y<109;y+=8)r(17,y,168,1,'#69745f');
    for(let x=29;x<173;x+=44){r(x,56,3,50,'#c5c2a3');r(x+6,56,1,50,'#505f4b');}
    // Painted arrows, bollards, fencing and tiny waiting citizens.
    for(let y=58;y<106;y+=13){r(99,y,3,8,'#b9bca2');r(97,y+4,7,2,'#b9bca2');}
    for(let x=23;x<184;x+=27){r(x,86,3,19,'#4a5447');r(x-1,84,5,3,'#bdb799');line(x+3,89,x+26,89,'#444f42',2);}
    for(let i=0;i<8;i++){
      const x=35+i*17+(seed%3),y=63+(i%3)*3;
      r(x+1,y,3,3,'#454b42');r(x,y+3,5,9,['#555749','#4c5a55','#62594b'][i%3]);r(x,y+12,2,4,'#3c453d');r(x+3,y+12,2,4,'#3c453d');
    }
    r(14,108,174,7,'#343f32');r(14,113,174,2,'#a0a78a');
    r(7,10,4,113,'#879074');r(189,10,5,113,'#1d281d');
    for(let y=15;y<120;y+=13){r(8,y,2,2,'#c3bea0');r(190,y,2,2,'#8b9477');}
    // Window surrounds, grille, wire conduits and lower counter cabinetry.
    r(0,126,202,6,'#202b20');r(0,134,202,2,'#7a8063');
    box(15,146,172,103,'#303c30','#202c23');r(20,150,162,96,'#394a39');
    for(let x=21;x<183;x+=9)r(x,152,1,93,'#2c3e2d');
    r(11,143,5,112,'#899276');r(184,143,5,112,'#657457');
    r(0,250,202,10,'#242e24');r(0,252,202,2,'#9c9f79');r(0,260,202,10,'#515b40');
    r(0,271,202,89,'#514735');
    for(let y=272;y<360;y+=13){r(0,y,202,1,'#7e6b49');r(0,y+2,202,1,'#393d2b');}
    for(let x=7;x<198;x+=49){box(x,280,43,67,'#554d36','#272f23');r(x+5,284,33,1,'#8b7950');box(x+12,293,19,6,'#8c8d68','#343c2b');r(x+16,295,11,2,'#b2ae81');}
    // Small office telephone and loosely stacked files, intentionally decorative.
    box(7,251,25,20,'#2b362a','#1c251b');r(9,249,21,5,'#545d42');r(9,254,4,8,'#6b7352');r(27,253,3,11,'#18251b');
    for(let y=257;y<266;y+=3)for(let x=16;x<25;x+=3)r(x,y,1,1,'#9a9a71');
    for(let i=0;i<5;i++){r(157-i*2,253+i*3,34+i*2,2,['#b9ac7f','#a39a6b','#c2b48a'][i%3]);r(159-i*2,255+i*3,30+i*2,1,'#5c6142');}
    // Mechanical rail for the two stamp blocks and the fixed office calendar.
    box(208,8,424,61,'#52574a','#212c23');r(211,11,418,3,'#868b70');r(211,63,418,3,'#333e2c');
    for(let x=215;x<629;x+=31){r(x,14,2,2,'#b7b99a');r(x,59,2,2,'#222f24');}
    r(202,0,5,360,'#18251d');r(207,69,2,291,'#a28b59');
    // Paperwork return aperture, reinforced by the live HTML hit target.
    box(407,323,222,31,'#343d2c','#232d22');r(416,329,203,5,'#101d15');r(416,335,203,2,'#8b8b60');
    for(let x=410;x<627;x+=18)r(x,348,10,2,'#75805a');
    // Dust, wear and small bolts, kept off all readable document text.
    for(let i=0;i<160;i++)r(random()*640,random()*360,1,1,'#111b1725');
    for(const [x,y] of [[3,3],[635,3],[3,355],[635,355],[201,126],[201,245]]){r(x,y,3,3,'#969d7b');r(x+1,y+1,1,1,'#293c2b');}
  }
  root.OfficeArt={draw};
})(window);
