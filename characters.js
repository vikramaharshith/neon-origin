/* Layered, palette-editable pixel characters based on NeonCharImages references. */
const CHARACTER_DESIGNS = {
0:{prefix:'Hum',name:'Human',hair:'#c9cbd2',eyes:'#29bce3',outfit:'#4b5d48',skin:'#efc39e',hairStyle:'swept',outfitType:'tactical'},
1:{prefix:'Vamp',name:'Vampire',hair:'#292535',eyes:'#ec314a',outfit:'#921e36',skin:'#e1ccd4',hairStyle:'swept',outfitType:'coat'},
2:{prefix:'Cyb',name:'Cyborg',hair:'#657b87',eyes:'#4cf5ff',outfit:'#829ea5',skin:'#81999c',hairStyle:'none',outfitType:'armor'},
3:{prefix:'Elf',name:'Elf',hair:'#d2e0ec',eyes:'#42badc',outfit:'#5791c2',skin:'#edb49f',hairStyle:'long',outfitType:'tunic'},
4:{prefix:'Dem',name:'Demon',hair:'#361c31',eyes:'#ffc556',outfit:'#322c3c',skin:'#be2949',hairStyle:'swept',outfitType:'coat'},
5:{prefix:'Ang',name:'Angel',hair:'#f9dfa0',eyes:'#fff8bd',outfit:'#dba738',skin:'#e5c7a0',hairStyle:'none',outfitType:'armor'}
};
function hasDesign(id){return Object.prototype.hasOwnProperty.call(CHARACTER_DESIGNS,id)}
function speciesLabel(id){return SPECIES[id].name+(hasDesign(id)?'':' (in dev)')}
function defaultLook(id,body='M'){const p=CHARACTER_DESIGNS[id]||CHARACTER_DESIGNS[0];return {body,hair:p.hair,eyes:p.eyes,outfit:p.outfit,hairStyle:(body==='F'&&[0,1,4].includes(id))?'long':p.hairStyle,outfitType:p.outfitType}}
function validLook(a){return !!a&&['M','F'].includes(a.body)&&['short','long','swept','none'].includes(a.hairStyle)&&['tactical','coat','armor','tunic','dress'].includes(a.outfitType)&&['hair','eyes','outfit'].every(k=>typeof a[k]==='string'&&/^#[0-9a-f]{6}$/i.test(a[k]))}
function tint(hex,delta){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+delta)).toString(16).padStart(2,'0')).join('')}
function gait(phase,moving){const v=moving?Math.sin(phase):0;return {stride:Math.round(v*6),lift:Math.round(Math.max(0,-v)*2),backLift:Math.round(Math.max(0,v)*2),bob:moving?Math.round(Math.abs(Math.cos(phase))*1):0}}
// Coordinates are native pixels. Side legs swing horizontally; limb lengths stay fixed.
function drawCharacter(c,id,a,dir,phase,moving){const p=CHARACTER_DESIGNS[id],side=dir==='left'||dir==='right',back=dir==='up',female=a.body==='F',g=gait(phase,moving),ink='#101525',skin=p.skin,skinShade=tint(skin,-32),cloth=a.outfit,dark=tint(cloth,-48),light=tint(cloth,39),hair=a.hair,hs=tint(hair,-45),hl=tint(hair,30),eye=a.eyes,w=side?6:female?8:10;
const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)},poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill()},seg=(ax,ay,bx,by,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='butt';c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke()};c.save();if(dir==='left')c.scale(-1,1);
// Wings have narrow side profiles, feather layers and a distinct rear silhouette.
if(id===5){const spread=side?15:32;for(const sign of side?[-1]:[-1,1]){poly([[sign*6,-42],[sign*spread,-62],[sign*(spread+5),-58],[sign*(spread-2),-30],[sign*10,-13]],'#695776');for(let j=0;j<6;j++){poly([[sign*(9+j*3),-43-j*2],[sign*(spread-j*2),-57+j*4],[sign*(spread-j*2-1),-24+j*2],[sign*(9+j*2),-32]],j%2?'#e8c992':'#fff0bf')}}}
if(id===4){c.strokeStyle=skinShade;c.lineWidth=3;c.beginPath();c.moveTo(-4,-15);c.bezierCurveTo(-28,-6,-28,-26,-21,-28);c.stroke();poly([[-21,-33],[-17,-24],[-26,-25]],skin)}
// Hair behind shoulders and a species-specific cloak.
if(a.hairStyle==='long'&&id!==2&&id!==5){poly([[-11,-52],[11,-52],[16,-16],[7,-11],[-13,-12],[-16,-20]],hs);r(-12,-44,5,27,hair);r(9,-44,4,29,hl)}
if(a.outfitType==='coat'||id===1){poly([[-w,-35],[w,-35],[w+8,-5],[4,-9],[-3,-4],[-w-7,-7]],ink);poly([[-w+1,-33],[w-1,-33],[w+5,-8],[4,-12],[-3,-7],[-w-4,-10]],id===1?cloth:dark);r(-w+2,-29,3,19,light)}
// Walk cycle: contact, passing, opposite contact. Far leg goes behind the body.
function leg(near){const sign=near?1:-1,foot=sign*g.stride,lift=near?g.lift:g.backLift,x=side?(near?2:-2):(near?5:-5),endX=side?foot:x,endY=-lift,base=near?'#29303f':'#1b2232';seg(x,-20,side?foot*.4:x,-10,6,ink);seg(side?foot*.4:x,-10,endX,endY-3,5,base);if(id===2||id===5||a.outfitType==='armor'){r((side?foot*.4:x)-3,-13,6,5,near?cloth:dark);r(endX-2,endY-8,4,5,near?light:cloth)}if(a.outfitType==='dress'){r(x-2,-18,4,7,skin)}r(endX-4,endY-3,side?9:7,4,ink);r(endX-2,endY-3,5,1,id===3?'#8f6550':tint(cloth,-20));if(id===0){r(endX-2,endY-6,4,2,'#a7b5b7')}}leg(false);
function arm(near){const sign=near?1:-1,swing=side?g.stride*-.7*sign:g.stride*.3*sign,x=side?(near?2:-3):(near?w+2:-w-2),endX=side?x+swing:x,endY=-18+(side?0:swing*.25);seg(x,-33,endX,endY,7,ink);seg(x,-33,endX,endY-2,5,near?cloth:dark);r(endX-2,endY-2,4,5,id===2||id===5?dark:skin);if(id===2||id===5){r(endX-3,endY-9,6,5,near?light:cloth)}if(id===1){r(endX-2,endY-9,4,2,'#eadbe0');r(endX-2,endY-5,4,2,'#eadbe0')}}arm(false);
c.save();c.translate(0,-g.bob);r(-w,-36,w*2,19,ink);r(-w+1,-35,w*2-2,17,cloth);r(-w+2,-34,3,13,light);r(w-4,-34,3,15,dark);r(-w,-19,w*2,3,'#372b30');r(-2,-19,4,3,id===3||id===1?'#d7a35c':'#8397a1');r(-1,-18,2,1,ink);
if(a.outfitType==='tactical'){for(let y=-32;y<-21;y+=5){r(-w+3,y,4,3,light);r(2,y,4,3,dark)}r(-1,-35,2,16,'#8a979a');r(w-1,-32,3,3,'#ae2f42')}
if(a.outfitType==='armor'||id===2||id===5){r(-w-2,-35,6,5,light);r(w-4,-35,6,5,light);r(-w+3,-28,w*2-6,3,dark);r(-2,-31,4,4,eye);r(-w+4,-23,w*2-8,2,light)}
if(a.outfitType==='tunic'||a.outfitType==='dress'){poly([[-w+1,-18],[w-1,-18],[w+3,-8],[-w-3,-8]],cloth);r(-w+2,-16,2,7,light);r(w,-16,2,7,dark);if(id===3){r(-w-1,-10,w*2+2,2,'#e4e9ec');r(-1,-17,2,8,'#d9bc7b')}}
if(id===1){poly([[-10,-38],[-2,-33],[-7,-29]],light);poly([[10,-38],[2,-33],[7,-29]],light);r(0,-32,2,12,'#d5a45d')}
if(id===3){seg(-7,-34,7,-20,2,'#6b4b48');r(-1,-33,3,3,'#eccb86')}
if(back){r(-w+3,-33,w*2-6,12,dark);if(id===2){r(-3,-32,6,11,'#233c4b');r(-1,-30,2,7,eye)}}
// Neck, ears, face and fitted directional hair.
r(-3,-41,6,5,skinShade);r(-9,-57,18,17,ink);r(-10,-53,20,11,ink);r(-8,-56,16,15,skin);r(5,-54,3,12,skinShade);r(-6,-41,12,2,skinShade);
if(id===3||id===4){if(!side){poly([[-8,-51],[-18,-55],[-12,-45],[-8,-45]],skinShade);poly([[8,-51],[18,-55],[12,-45],[8,-45]],skin);r(11,-50,3,2,skinShade)}else{poly([[-6,-51],[-16,-55],[-10,-45],[-5,-45]],skin);r(-12,-50,4,2,skinShade)}}
if(side){r(8,-49,3,6,skin);r(3,-51,5,5,'#f6f0e9');r(5,-51,3,4,eye);r(6,-51,1,3,ink);r(3,-53,5,2,ink);r(6,-43,3,1,skinShade)}else if(!back){r(-7,-51,5,5,'#f8f0e9');r(2,-51,5,5,'#f8f0e9');r(-5,-51,3,4,eye);r(3,-51,3,4,eye);r(-4,-51,1,3,ink);r(4,-51,1,3,ink);r(-7,-53,5,2,ink);r(2,-53,5,2,ink);r(-1,-45,2,2,skinShade);r(-2,-42,4,1,skinShade);if(id===1){r(-3,-44,6,3,'#722438');r(-2,-44,1,2,'#fff9ef');r(2,-44,1,2,'#fff9ef')}}
if(id===2){r(-10,-58,20,16,ink);r(-8,-57,16,14,cloth);r(-5,-59,11,3,light);r(-8,-54,4,7,light);r(5,-55,3,9,dark);r(-5,-44,11,3,dark);r(-9,-50,3,7,'#263649');if(!back){r(side?2:-5,-51,side?7:10,5,dark);r(side?3:-4,-50,4,4,eye);r(side?4:-3,-49,2,2,'#efffff')}else{r(-5,-53,10,8,dark);r(-3,-51,2,4,eye)}if(female){r(-11,-61,1,10,ink);r(-12,-62,3,2,light)}}
else if(id===5){r(-10,-57,20,16,ink);poly([[-9,-56],[-4,-59],[0,-62],[4,-59],[9,-56],[7,-43],[0,-39],[-7,-43]],cloth);r(-6,-56,3,9,light);r(-1,-60,2,18,light);if(!back){r(-7,-51,6,2,ink);r(2,-51,6,2,ink);r(-5,-51,3,1,eye);r(3,-51,3,1,eye)}c.strokeStyle='#ffe7a1';c.lineWidth=1;c.beginPath();c.ellipse(0,-65,female?13:9,3,0,0,Math.PI*2);c.stroke()}
else if(a.hairStyle!=='none'){r(-9,-59,18,6,hs);r(-7,-60,13,3,hair);r(-10,-55,4,13,hs);r(7,-55,4,13,hs);r(-7,-58,9,3,hl);r(3,-57,5,4,hair);if(back){r(-8,-55,16,14,hair);r(-5,-54,3,10,hl);r(4,-54,3,12,hs)}else{r(-8,-54,5,5,hair);r(-4,-56,5,5,hl);r(1,-55,4,3,hair);if(a.hairStyle==='swept'){r(-8,-52,4,7,hair);r(-5,-54,4,5,hl)}if(a.hairStyle==='long'){r(-10,-51,3,17,hair);r(8,-51,3,17,hair)}}if(a.hairStyle==='short'){r(-11,-55,2,3,hair);r(9,-57,3,3,hl)}}
if(id===4){poly([[-10,-55],[-14,-64],[-13,-68],[-7,-59]],'#3a2839');poly([[8,-57],[13,-68],[14,-62],[11,-54]],'#493245');r(-12,-62,2,3,'#9a6470');r(11,-62,2,3,'#9a6470');if(female){poly([[-11,-57],[-20,-63],[-16,-56],[-11,-53]],'#8a5b6e');poly([[11,-57],[20,-63],[16,-56],[11,-53]],'#8a5b6e')}}
c.restore();leg(true);arm(true);c.restore();}
