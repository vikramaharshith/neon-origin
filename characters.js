/* All characters use one integer-pixel chibi rig. No antialiased paths or rotated art. */
const CHARACTER_DESIGNS={
0:{prefix:'Hum',name:'Human',hair:'#cbd3db',eyes:'#38bcdf',outfit:'#4b6151',skin:'#f1c39c',hairStyle:'swept',outfitType:'tactical'},
1:{prefix:'Vamp',name:'Vampire',hair:'#302c40',eyes:'#e0445b',outfit:'#902a43',skin:'#ead5dd',hairStyle:'swept',outfitType:'coat'},
2:{prefix:'Cyb',name:'Cyborg',hair:'#657b87',eyes:'#62f3ee',outfit:'#809ca6',skin:'#bcc6cb',hairStyle:'short',outfitType:'armor'},
3:{prefix:'Elf',name:'Elf',hair:'#cbdfee',eyes:'#4ab6db',outfit:'#598fb7',skin:'#ebba9d',hairStyle:'long',outfitType:'tunic'},
4:{prefix:'Dem',name:'Demon',hair:'#3a2338',eyes:'#f6b557',outfit:'#393142',skin:'#c94761',hairStyle:'swept',outfitType:'coat'},
5:{prefix:'Ang',name:'Angel',hair:'#f2dda1',eyes:'#fff2af',outfit:'#d1a34c',skin:'#edcba7',hairStyle:'long',outfitType:'armor'},
6:{prefix:'Dwa',name:'Dwarf',hair:'#a8693c',eyes:'#89bbd4',outfit:'#5b7254',skin:'#e8b58f',hairStyle:'swept',outfitType:'armor'},
7:{prefix:'Orc',name:'Orc',hair:'#2d3942',eyes:'#e5b448',outfit:'#76634b',skin:'#7a9f4e',hairStyle:'swept',outfitType:'tunic'},
8:{prefix:'Wer',name:'Werewolf',hair:'#59657d',eyes:'#edbc54',outfit:'#3b3b50',skin:'#59657d',hairStyle:'swept',outfitType:'tactical'}
};
function hasDesign(id){return Object.prototype.hasOwnProperty.call(CHARACTER_DESIGNS,id)}
function speciesLabel(id){return SPECIES[id].name+(hasDesign(id)?'':' (in dev)')}
function defaultLook(id,body='M'){const p=CHARACTER_DESIGNS[id]||CHARACTER_DESIGNS[0];return {body,hair:p.hair,eyes:p.eyes,outfit:p.outfit,hairStyle:body==='F'&&[0,1,4,6,7].includes(id)?'long':p.hairStyle,outfitType:p.outfitType,headgear:id===2||id===5}}
function validLook(a){return !!a&&['M','F'].includes(a.body)&&['short','long','swept','none','braids'].includes(a.hairStyle)&&['tactical','coat','armor','tunic','dress'].includes(a.outfitType)&&(a.headgear===undefined||typeof a.headgear==='boolean')&&['hair','eyes','outfit'].every(k=>typeof a[k]==='string'&&/^#[0-9a-f]{6}$/i.test(a[k]))}
function tint(hex,d){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+d)).toString(16).padStart(2,'0')).join('')}
function gait(phase,moving){const v=moving?Math.sin(phase):0;return {stride:Math.round(v*4),lift:Math.round(Math.max(0,-v)*2),backLift:Math.round(Math.max(0,v)*2),bob:moving?Math.round(Math.abs(Math.cos(phase))):0}}
const spriteCache=new Map();
function makePixelSprite(id,a,dir,frame){const surface=document.createElement('canvas');surface.width=80;surface.height=76;const c=surface.getContext('2d');c.translate(40,72);const p=CHARACTER_DESIGNS[id],side=dir==='left'||dir==='right',back=dir==='up',female=a.body==='F',ink='#151b35',skin=id===8?a.hair:p.skin,ss=tint(skin,-30),sl=tint(skin,20),cloth=a.outfit,cd=tint(cloth,-35),cl=tint(cloth,29),hair=a.hair,hs=tint(hair,-36),hl=tint(hair,32),eye=a.eyes,helmet=(id===2||id===5)&&(a.headgear??true);let bob=frame===1||frame===5?1:0;const stride=[0,3,4,2,0,-3,-4,-2][frame],lift=Math.max(0,-stride)>2?1:0,otherLift=Math.max(0,stride)>2?1:0;
// Scan-converted integer primitives ensure opaque, square-edged source pixels.
const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function poly(points,col){const min=Math.ceil(Math.min(...points.map(p=>p[1]))),max=Math.floor(Math.max(...points.map(p=>p[1])));for(let y=min;y<=max;y++){const xs=[];for(let i=0;i<points.length;i++){let [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))xs.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1))}xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)r(Math.ceil(xs[k]),y,Math.ceil(xs[k+1])-Math.ceil(xs[k]),1,col)}}
function segment(x1,y1,x2,y2,w,col){const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1);for(let i=0;i<=steps;i++)r(x1+(x2-x1)*i/steps-w/2,y1+(y2-y1)*i/steps-w/2,w,w,col)}
function headShape(col,inset=0){r(-11+inset,-59+bob+inset,22-inset*2,2,col);r(-14+inset,-57+bob+inset,28-inset*2,3,col);r(-16+inset,-54+bob+inset,32-inset*2,18-inset*2,col);r(-14+inset,-36+bob-inset,28-inset*2,3,col);r(-10+inset,-33+bob-inset,20-inset*2,2,col)}
// Rear layers: wings, tail, long hair and cape.
if(id===5){for(const sign of side?[-1]:[-1,1]){const q=pts=>pts.map(([x,y])=>[x*sign,y]);poly(q([[8,-39],[26,-57],[33,-59],[32,-42],[23,-20],[13,-18]]),ink);poly(q([[10,-39],[27,-55],[31,-56],[29,-42],[22,-23],[14,-21]]),'#bba07c');for(let j=0;j<5;j++)poly(q([[13+j*3,-39-j*3],[29-j,-53+j*3],[25-j*2,-28+j*2],[19-j,-23+j]]),j%2?'#dfcba5':'#f1e5c7')}}
function demonTail(){
 const points=back?[[0,-18],[0,-10],[-8,-5],[-21,-7],[-25,-18]]:side?[[-5,-18],[-15,-12],[-24,-14],[-26,-24]]:[[-6,-15],[-23,-9],[-26,-20],[-22,-24]];
 for(let i=1;i<points.length;i++){segment(...points[i-1],...points[i],4,ink);segment(...points[i-1],...points[i],2,skin)}
 const [x,y]=points[points.length-1];poly([[x,y-6],[x+4,y+2],[x-4,y+1]],skin);
}
if(id===4&&!back)demonTail();
if(id===8){poly([[-6,-17],[-22,-13],[-29,-23],[-26,-11],[-18,-7],[-5,-11]],ink);poly([[-7,-16],[-22,-12],[-26,-18],[-23,-10],[-17,-9]],hs)}
function longHair(){
 const pts=side?[[-14,-51],[-3,-51],[-5,-23],[-10,-13],[-20,-16]]:[[-13,-49],[13,-49],[17,-17],[9,-11],[-12,-14],[-17,-18]];
 poly(pts,ink);
 if(side){poly([[-13,-49],[-5,-49],[-7,-23],[-11,-16],[-18,-18]],hs);r(-15,-42,3,21,hair);r(-12,-41,2,22,hl)}
 else {poly([[-12,-49],[12,-49],[14,-18],[8,-14],[-11,-16],[-14,-19]],hair);r(-10,-43,3,25,hl);r(8,-40,4,23,hs);r(-3,-37,2,19,hs)}
}
function cape(){
 if(side){poly([[-7,-34],[-13,-32],[-22,-6],[-8,-8],[-3,-16]],ink);poly([[-9,-32],[-12,-30],[-19,-9],[-10,-11],[-5,-17]],cd);segment(-12,-28,-16,-12,2,cloth)}
 else {poly([[-11,-35],[11,-35],[19,-6],[9,-8],[0,-5],[-10,-8],[-19,-6]],ink);poly([[-10,-33],[10,-33],[16,-9],[8,-11],[0,-8],[-9,-11],[-16,-9]],back?cloth:cd);segment(-8,-30,-12,-12,2,cl);segment(7,-29,12,-12,2,cd);segment(0,-29,0,-10,2,cd)}
}
if(a.outfitType==='coat'&&!back)cape();
if(a.hairStyle==='long'&&!helmet&&!back)longHair();
function leg(near){const sign=near?1:-1,x=side?(near?2:-2):(near?5:-5),f=side?stride*sign:x,fy=near?lift:otherLift;segment(x,-15,side?f*.5:x,-8,6,ink);segment(side?f*.5:x,-8,f,-3-fy,5,'#263144');r(f-3,-7-fy,5,4,id===6?'#79573f':cd);r(f-4,-3-fy,side?9:8,4,ink);r(f-2,-3-fy,5,1,id===6?'#bb8f61':tint(cloth,5));if(id===0)r(f-2,-8-fy,4,2,'#bcc9d0');if(id===2||id===5||a.outfitType==='armor'){r(f-3,-11-fy,6,3,cloth);r(f-2,-11-fy,4,1,cl);r(f-2,-7-fy,4,3,cd);r(f-2,-7-fy,1,3,cl)}if(id===7||id===8){r(f-2,-3-fy,5,2,skin);r(f-2,-1-fy,1,1,'#eee7d3');r(f+1,-1-fy,1,1,'#eee7d3')}}
function arm(near){const sign=near?1:-1,x=side?(near?4:-3):(near?12:-12),sx=side?-stride*sign*.7:0,sy=side?0:stride*sign*.3;segment(x,-28+bob,x+sx,-16+sy,7,ink);segment(x,-28+bob,x+sx,-18+sy,5,id===7||id===8?skin:cloth);r(x+sx-2,-17+sy,4,5,id===2&&helmet?cd:skin);if(a.outfitType==='armor'){r(x-3,-29+bob,6,4,cl);r(x+sx-3,-22+sy,6,5,cd);r(x+sx-2,-21+sy,4,1,cl);r(x+sx-2,-18+sy,4,1,cloth)}if(id===7||id===8){r(x-3,-28+bob,6,4,ss);r(x-2,-28+bob,4,3,sl);r(x+sx-3,-22+sy,6,3,cloth);r(x+sx-2,-22+sy,4,1,cl)}if(id===1){r(x+sx-2,-22+sy,4,1,'#f2dfe4');r(x+sx-2,-19+sy,4,1,'#f2dfe4')}}
leg(false);leg(true);arm(false);
// Same compact torso and large head proportions across all species.
const muscular=[2,5,6,7,8].includes(id),w=side?7:female?10:muscular?12:11,waist=side?5:female?6:8;
poly([[-w,-33+bob],[w,-33+bob],[w-1,-26+bob],[waist,-21+bob],[waist+2,-15],[-waist-2,-15],[-waist,-21+bob],[-w+1,-26+bob]],ink);
poly([[-w+2,-31+bob],[w-2,-31+bob],[w-3,-26+bob],[waist-1,-21+bob],[waist,-16],[-waist,-16],[-waist+1,-21+bob],[-w+3,-26+bob]],cloth);
poly([[-w+2,-30+bob],[-w+5,-30+bob],[-waist+2,-22+bob],[-waist+2,-17],[-waist,-17]],cl);
poly([[w-4,-30+bob],[w-2,-29+bob],[waist-1,-21+bob],[waist,-17],[waist-2,-18]],cd);
if(!side&&!back){r(-w+5,-29+bob,4,2,cl);r(2,-29+bob,w-6,2,cl);r(-w+5,-25+bob,4,1,cd);r(2,-25+bob,w-6,1,cd);r(0,-28+bob,1,5,cd);r(-3,-22+bob,2,1,cl);r(2,-22+bob,2,1,cl)}
if(female){r(-waist-1,-19,2,3,cl);r(waist-1,-19,2,3,cd)}

if(id===7||id===8){poly([[-w+2,-31+bob],[w-2,-31+bob],[w-3,-25+bob],[waist-1,-21],[-waist+1,-21],[-w+3,-25+bob]],skin);r(-w+4,-30+bob,6,3,sl);r(2,-30+bob,6,3,sl);r(-w+4,-26+bob,5,1,ss);r(2,-26+bob,5,1,ss);r(-1,-29+bob,2,6,ss);r(-4,-23+bob,3,2,sl);r(2,-23+bob,3,2,sl);segment(-8,-32,7,-21,3,cloth);r(-5,-28,2,2,cl);r(3,-24,2,2,cl)}
if(a.outfitType==='tactical'){for(let y=-29;y<-19;y+=4){r(-6,y+bob,4,2,cl);r(2,y+bob,4,2,cd)}r(-1,-31+bob,2,14,'#9eafb0');if(id===0)r(w,-28+bob,3,3,'#ad3045')}
// A short split tunic leaves the legs visible; a dress has a longer flared skirt.
if(a.outfitType==='tunic'){
 poly([[-w+1,-18],[w-1,-18],[w+1,-10],[2,-10],[0,-13],[-2,-10],[-w-1,-10]],ink);
 poly([[-w+2,-18],[w-2,-18],[w-1,-12],[3,-12],[0,-15],[-3,-12],[-w+1,-12]],cloth);
 r(-w+2,-16,2,4,cl);r(w-3,-16,2,4,cd);
 if(id===3){r(-w+1,-12,w-3,1,'#d9e5e9');r(3,-12,w-3,1,'#d9e5e9')}
}
if(a.outfitType==='dress'){
 const hem=side?11:w+5;
 poly([[-waist-1,-18],[waist+1,-18],[hem,-3],[-hem,-3]],ink);
 poly([[-waist,-17],[waist,-17],[hem-2,-5],[-hem+2,-5]],cloth);
 segment(-waist+2,-16,-hem+4,-6,2,cl);segment(waist-2,-16,hem-4,-6,2,cd);
 segment(1,-15,3,-6,2,cd);r(-hem+2,-6,hem*2-4,1,cl);
}
if(a.outfitType==='armor'){for(const sign of [-1,1]){poly([[sign*(w-4),-34+bob],[sign*(w+2),-35+bob],[sign*(w+4),-30+bob],[sign*w,-27+bob],[sign*(w-4),-29+bob]],ink);r(sign>0?w-3:-w-2,-33+bob,6,3,cl);r(sign>0?w-1:-w-2,-29+bob,4,1,cd)}r(-w+4,-26+bob,w*2-8,2,cd);r(-2,-29+bob,4,3,id===2?eye:cl);r(-5,-22+bob,4,2,cl);r(1,-22+bob,4,2,cl);r(-4,-19+bob,3,1,cd);r(2,-19+bob,3,1,cd);r(-w+4,-30+bob,2,1,tint(cloth,60));r(w-5,-30+bob,2,1,tint(cloth,60))}
r(-w,-17,w*2,3,'#443741');r(-2,-17,5,3,'#bca16e');r(-1,-16,3,1,ink);
if(id===3){segment(-7,-30,7,-18,2,'#795647');r(-4,-29,3,3,'#e1bb70')}
if(id===1){poly([[-12,-35],[-2,-29],[-8,-24]],cl);poly([[12,-35],[2,-29],[8,-24]],cd);r(0,-26,1,8,'#d6af68')}
if(back){r(-w+3,-29+bob,w*2-6,10,cd);if(id===2){r(-3,-29,6,9,ink);r(-1,-27,2,5,eye)}}
if(a.outfitType==='coat'&&back)cape();
if(id===4&&back)demonTail();
// Fitted stepped head silhouette, with no skewed or 3/4 angle.
if(side){r(-11,-58+bob,19,2,ink);r(-14,-56+bob,24,4,ink);r(-15,-52+bob,26,18,ink);r(-11,-34+bob,21,3,ink);r(-12,-54+bob,21,18,skin);r(-9,-57+bob,16,3,sl);r(-13,-51+bob,5,13,ss);r(8,-45+bob,5,7,ink);r(8,-44+bob,3,5,skin);r(-8,-34+bob,15,2,ss)}else{headShape(ink);r(-10,-57+bob,20,2,sl);r(-13,-55+bob,26,4,skin);r(-14,-51+bob,28,14,skin);r(-12,-37+bob,24,3,skin);r(-9,-34+bob,18,1,ss);r(9,-50+bob,5,13,ss);r(-12,-52+bob,4,8,sl);r(-8,-56+bob,13,2,sl)}
if(id===3||id===4||id===7){for(const sign of side?[-1]:[-1,1]){poly([[sign*12,-49+bob],[sign*23,-54+bob],[sign*18,-44+bob],[sign*12,-42+bob]],ink);poly([[sign*14,-48+bob],[sign*21,-51+bob],[sign*17,-45+bob],[sign*14,-44+bob]],skin);r(sign>0?15:-19,-47+bob,3,2,ss)}}
if(!back&&!helmet){if(side){r(1,-49+bob,8,10,ink);r(3,-47+bob,4,6,eye);r(4,-47+bob,2,3,'#f2faf2');r(0,-51+bob,9,2,hs);r(6,-35+bob,3,1,ss)}else{r(-11,-49+bob,8,10,ink);r(3,-49+bob,8,10,ink);r(-9,-47+bob,4,6,eye);r(5,-47+bob,4,6,eye);r(-8,-47+bob,2,3,'#f4faf5');r(6,-47+bob,2,3,'#f4faf5');r(-11,-51+bob,8,2,hs);r(3,-51+bob,8,2,hs);r(-1,-39+bob,2,2,ss);r(-3,-35+bob,6,1,ss);if(female){r(-12,-49+bob,1,3,ink);r(11,-49+bob,1,3,ink)}if(id===1){r(-4,-37+bob,8,3,'#793344');r(-3,-37+bob,2,2,'#f5f1e3');r(2,-37+bob,2,2,'#f5f1e3')}if(id===7){r(-6,-37+bob,12,3,'#344331');poly([[-6,-40+bob],[-7,-34+bob],[-3,-35+bob]],'#eee9cc');poly([[6,-40+bob],[7,-34+bob],[3,-35+bob]],'#eee9cc')}}}
if(id===8){for(const sign of [-1,1]){poly([[sign*8,-55],[sign*17,-66],[sign*19,-52]],ink);poly([[sign*11,-55],[sign*16,-62],[sign*16,-52]],hs)}for(let i=0;i<4;i++){r(-16+i*2,-48+i*4,2,3,hs);r(14-i*2,-48+i*4,2,3,hs)}if(!back){r(side?7:-6,-40+bob,side?9:12,6,ink);r(side?8:-5,-40+bob,side?7:10,4,tint(hair,20));r(side?13:-2,-40+bob,side?3:5,2,ink);r(side?10:-4,-35+bob,1,2,'#f8efd2');r(side?13:4,-35+bob,1,2,'#f8efd2')}}
// Each facing has its own hair silhouette; left mirrors the entire right profile.
if(!helmet&&a.hairStyle!=='none'){
 if(back&&a.hairStyle==='long')longHair();
 if(side){
  r(-10,-59+bob,16,3,hs);r(-13,-56+bob,22,5,hair);r(-10,-58+bob,14,3,hl);
  poly([[-14,-53+bob],[-5,-53+bob],[-6,-42+bob],[-10,-35+bob],[-14,-38+bob]],hs);
  r(-13,-52+bob,5,12,hair);r(-11,-53+bob,2,10,hl);
  r(-5,-53+bob,10,3,hair);
  if(a.hairStyle==='swept'){r(0,-53+bob,8,3,hl);r(5,-51+bob,4,5,hair)}
  if(a.hairStyle==='short'){r(-12,-44+bob,4,6,hs);r(3,-52+bob,4,2,hl)}
  if(a.hairStyle==='long'){r(-12,-48+bob,5,20,hair);r(-10,-47+bob,2,17,hl)}
 }else{
  r(-10,-59+bob,20,3,hs);r(-13,-56+bob,26,5,hair);r(-11,-58+bob,17,3,hl);
  r(-15,-52+bob,4,12,hs);r(11,-52+bob,4,12,hs);
  if(back){
   r(-13,-52+bob,26,15,hair);r(-10,-51+bob,4,13,hl);r(7,-51+bob,5,14,hs);
   r(-10,-37+bob,20,3,hs);r(-6,-35+bob,12,2,hs);
   if(a.hairStyle==='swept'){segment(-6,-54+bob,4,-38+bob,3,hl)}
  }else{
   r(-10,-51+bob,6,5,hair);r(-6,-53+bob,6,4,hl);r(0,-52+bob,5,3,hair);
   if(a.hairStyle==='swept'){r(-9,-48+bob,4,7,hair);r(-5,-51+bob,4,6,hl)}
   if(a.hairStyle==='short'){r(-11,-51+bob,4,4,hair);r(6,-52+bob,5,3,hl)}
   if(a.hairStyle==='long'){r(-15,-49+bob,3,19,hair);r(12,-49+bob,3,19,hair);r(-14,-48+bob,1,16,hl)}
  }
 }
 if(a.hairStyle==='braids'){
  for(const x of side?[-10]:back?[-10,7]:[-13,11]){
   for(let y=-43;y<-23;y+=4){r(x,y+bob,4,4,hs);r(x+(y%8===1?1:0),y+bob,3,2,hair)}
   r(x,-26+bob,4,2,'#d7b275');
  }
 }
}
if(id===6&&!female&&!back){poly([[-10,-38],[-4,-40],[0,-38],[4,-40],[10,-38],[9,-27],[3,-21],[-3,-22],[-10,-28]],hs);poly([[-8,-37],[-2,-38],[1,-36],[7,-38],[7,-29],[2,-24],[-6,-28]],hair);r(-5,-34,4,2,hl);r(2,-30,3,3,hl);r(-3,-38,6,2,ss)}
if(id===4){for(const sign of [-1,1]){poly([[sign*10,-54],[sign*13,-66],[sign*18,-65],[sign*16,-52]],ink);poly([[sign*12,-55],[sign*14,-63],[sign*16,-62],[sign*14,-54]],'#79556b')}if(female){r(-20,-59,5,3,'#9b7184');r(16,-59,5,3,'#9b7184')}}
if(helmet){if(id===2){if(side){r(-12,-56+bob,22,20,cd);r(-9,-58+bob,16,3,cl);r(-11,-54+bob,7,6,cloth);r(-13,-48+bob,7,8,ink);r(-12,-47+bob,5,5,cloth);r(1,-49+bob,10,9,ink);r(3,-47+bob,6,5,eye);r(4,-46+bob,3,2,'#effffb')}else{headShape(ink);r(-10,-57+bob,20,3,cl);r(-13,-54+bob,26,16,cloth);r(-10,-38+bob,20,4,cd);r(-12,-52+bob,6,4,cl);r(8,-51+bob,5,12,cd);if(back){r(-7,-50+bob,14,9,ink);r(-5,-48+bob,3,5,eye)}else{r(-10,-49+bob,20,8,ink);r(-8,-47+bob,6,5,eye);r(3,-47+bob,6,5,eye);r(-7,-46+bob,2,2,'#f0fffa');r(4,-46+bob,2,2,'#f0fffa');r(-5,-38+bob,10,2,ink)}}if(female){r(-16,-62+bob,2,13,ink);r(-17,-63+bob,3,2,cl)}}else{headShape(ink);r(-10,-57+bob,20,4,cl);r(-13,-53+bob,26,15,cloth);r(-10,-38+bob,20,4,cd);r(-11,-52+bob,4,10,cl);r(9,-51+bob,3,12,cd);r(-1,-58+bob,3,24,cl);if(!back){r(side?2:-10,-48+bob,side?9:20,5,ink);r(side?3:-8,-47+bob,5,2,eye);if(!side)r(4,-47+bob,5,2,eye)}r(-11,-66,22,1,'#f5de94');r(-14,-65,3,1,'#f5de94');r(11,-65,3,1,'#f5de94');r(-15,-64,1,2,'#f5de94');r(14,-64,1,2,'#f5de94');r(-14,-62,3,1,'#f5de94');r(11,-62,3,1,'#f5de94');r(-11,-61,22,1,'#f5de94')}}
// Hands and front foot overlap the lower torso, never the face.
arm(true);
if(dir==='left'){const mirror=document.createElement('canvas');mirror.width=80;mirror.height=76;const m=mirror.getContext('2d');m.imageSmoothingEnabled=false;m.translate(80,0);m.scale(-1,1);m.drawImage(surface,0,0);return mirror}return surface}
function drawCharacter(c,id,a,dir,phase,moving){const frame=moving?(Math.floor(phase/(Math.PI*2)*8)%8+8)%8:0,key=[id,a.body,a.hair,a.eyes,a.outfit,a.hairStyle,a.outfitType,a.headgear??true,dir,frame].join('|');let sprite=spriteCache.get(key);if(!sprite){sprite=makePixelSprite(id,a,dir,frame);if(spriteCache.size>512)spriteCache.clear();spriteCache.set(key,sprite)}c.imageSmoothingEnabled=false;if(typeof drawCustomArt==='function'&&drawCustomArt(c,id,a,dir,frame))return;c.drawImage(sprite,-40,-72)}
