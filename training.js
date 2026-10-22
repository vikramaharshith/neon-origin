/* Training simulation. Practice loadouts never replace the saved origin loadout. */
(function(){
'use strict';
const meleeDamage=[9,20,40,7,32,25,12,72,24,62,10,30,38,14,27,19,25,13,66,48,26,11,53,60,12];
const meleeTime=[.18,.34,.85,.13,.65,.4,.19,1.4,.52,1.15,.15,.52,.8,.22,.6,.3,.55,.17,1.25,.95,.42,.16,1.05,1.15,.16];
const meleeRange=[65,90,95,60,80,105,65,100,150,105,65,90,80,75,125,110,85,70,135,90,105,65,145,90,70];
const ranged=[
 ['bow',58,1.15,.35,1,0,700,.025],['throw',27,.45,.3,1,0,480,.06],
 ['gun',17,0,.18,12,3.8,1050,.16],['gun',90,0,1.1,3,5.5,1500,.065],
 ['bow',82,1.7,.65,1,0,850,.018],['gun',12,0,.9,4,4.6,850,.3],
 ['throw',18,.3,.18,1,0,650,.05],['gun',16,0,.12,20,4.5,1150,.15],
 ['bow',32,.7,.25,1,0,600,.06],['throw',17,.5,.3,1,0,750,.025],
 ['gun',36,0,.5,6,4.2,1100,.12],['gun',12,0,.075,24,4.8,1000,.23],
 ['throw',43,.8,.45,1,0,450,.07],['gun',95,0,1.2,1,6,400,.14],
 ['throw',30,.6,.5,1,0,420,.08],['gun',65,0,.9,3,5.4,380,.18],
 ['gun',68,0,.85,5,4.8,1300,.075],['throw',60,1,.55,1,0,650,.04],
 ['gun',48,0,.8,2,4.5,700,.08],['gun',18,0,.38,18,4.2,1150,.14],
 ['throw',12,.35,.25,1,0,720,.08],['gun',50,0,.8,3,4,850,.06],
 ['gun',23,0,.1,40,7,1000,.25],['bow',74,1.4,.4,1,0,1000,.015],
 ['gun',88,0,1.2,1,6.5,1000,.2]
];
const spellCasts=[1.1,.8,.65,1,.95,.7,1.4,1.6,1.2,1.2,.8,1.8,1.1,1,1,1.9,1.7,1.2,1.3,1.2,1.5,1.4,1.7,1.4,1.1];
const colors=['#ff975e','#6bd8f0','#c7b8ff','#cfabff','#b9efff','#d5f5e9','#c9aa77','#9cdb70','#ffe69b','#bea3ff','#9684b7','#f87b53','#92bfff','#b4df5d','#fff6c2','#c1e5e9','#bd95ec','#ec6585','#a3dfee','#eeaff0','#89c96f','#b1ccda','#b4bfff','#b49a71','#e1decb'];
function profile(type,id){
 const name=COMBAT[type].items[id][0];
 if(type===1)return {type,id,name,kind:'melee',damage:meleeDamage[id],interval:meleeTime[id],range:meleeRange[id],color:'#dbe8ed',cast:0,ammo:0};
 if(type===2){const [kind,damage,cast,interval,ammo,reload,speed,spread]=ranged[id];return {type,id,name,kind,damage,cast,interval,ammo,reload,speed,spread,range:1100,color:kind==='gun'?'#ffc77d':'#bce3c4'}}
 return {type,id,name,kind:'magic',damage:[44,27,40,20,30,18,32,12,0,48,35,15,0,24,12,13,40,36,0,26,24,0,35,8,42][id],cast:spellCasts[id],interval:1.1+spellCasts[id]*.45,range:650,speed:600,color:colors[id],ammo:0};
}
const T=globalThis.Training={active:false,returnPosition:null,profile,enter,leave,update,render,cancel,restore};
let weapon=profile(1,0),ammo=0,reload=0,cooldown=0,charge=0,casting=false,held=false,aimX=0,aimY=-1,mouse=null,clock=0;
let targets=[],shots=[],effects=[],areas=[],swing=0,health=70,buff=0,buffName='',statusText='',lastHit=0;
const panel=document.createElement('section');panel.id='trainingHUD';panel.hidden=true;
panel.innerHTML='<div class="training-title">TRAINING / 02 <button id="leaveTraining">Return to lab</button></div><div class="training-loadout"><label>Practice path<select id="practicePath"><option value="0">Magic</option><option value="1">Melee</option><option value="2">Ranged</option></select></label><label>Practice loadout<select id="practiceWeapon"></select></label></div><div id="weaponTiming"></div><div class="training-meter"><div id="trainingFill"></div></div><div id="trainingState" role="status" aria-live="polite"></div><div id="trainingScore"></div><button id="resetTargets">Reset targets</button><button id="reloadTraining">Reload [R]</button>';
document.body.append(panel);
const style=document.createElement('style');style.textContent='#trainingHUD{position:fixed;top:100px;left:22px;width:300px;padding:15px;background:#081724ed;border:1px solid #527179;z-index:3;font-size:11px}#trainingHUD[hidden]{display:none}.training-title{color:#91fce0;letter-spacing:2px;display:flex;justify-content:space-between;align-items:center}.training-loadout{display:grid;gap:10px;margin:14px 0}.training-loadout label{display:grid;gap:5px;color:#9bb9bf}.training-loadout select{width:100%;padding:8px;background:#142b38;color:#e5f6f2;border:1px solid #3e6069;font:inherit}#trainingHUD button{background:#173441;border:1px solid #43646b;padding:7px;font-size:10px}#weaponTiming{color:#9fb6bd;line-height:1.6;min-height:50px}.training-meter{height:5px;background:#253d48;margin:10px 0}#trainingFill{height:100%;background:#91fce0;width:0}#trainingState{min-height:30px;line-height:1.5}#trainingScore{color:#9fb6bd;margin:7px 0 12px}#trainAttack{display:none;position:fixed;right:22px;bottom:105px;padding:20px;background:#234c59;border:1px solid #91fce0;touch-action:none}#trainAttack[hidden]{display:none!important}@media(pointer:coarse){#trainAttack{display:block}}@media(max-width:700px){#trainingHUD{top:85px;left:12px;width:220px;padding:10px;font-size:9px}.training-loadout{gap:5px;margin:7px 0}#weaponTiming{min-height:0}.training-title{letter-spacing:0}#trainingScore{margin:5px 0}}';document.head.append(style);
const attackButton=document.createElement('button');attackButton.id='trainAttack';attackButton.textContent='HOLD / ATTACK';attackButton.hidden=true;document.body.append(attackButton);
function fillWeapons(){const select=$('practiceWeapon');select.replaceChildren();COMBAT[Number($('practicePath').value)].items.forEach(([name],id)=>{const o=document.createElement('option');o.value=id;o.textContent=name;select.append(o)})}
function equip(){cancel();weapon=profile(Number($('practicePath').value),Number($('practiceWeapon').value));ammo=weapon.ammo;reload=0;cooldown=0;shots=[];areas=[];effects=[];buff=0;buffName='';swing=0;updateInfo()}
function updateInfo(){
 const p=weapon;
 $('weaponTiming').textContent=p.kind==='melee'?p.damage+' damage · '+p.range+' reach · '+p.interval.toFixed(2)+'s per strike. '+(p.interval<.25?'Hold for continuous light combos.':'Heavy hits require recovery between swings.'):
 p.kind==='gun'?p.damage+' damage'+(p.id===5?' per pellet':'')+' · '+p.ammo+' rounds · '+p.reload+'s reload. Movement increases spread.':
 p.kind==='magic'?p.cast+'s cast · '+p.interval.toFixed(1)+'s recovery. Hold to cast once; release before casting again.':
 p.damage+' damage at full charge · '+p.cast+'s wind-up. Hold to draw, release to fire; partial charge is weaker.';
 $('reloadTraining').hidden=p.kind!=='gun';
}
function reset(){targets=[{x:768,y:600,label:'CLOSE',max:250},{x:560,y:390,label:'RANGE',max:350},{x:960,y:340,label:'MOVING',max:350,moving:true},{x:790,y:250,label:'GROUP A',max:250},{x:850,y:250,label:'GROUP B',max:250}].map(t=>({...t,baseX:t.x,hp:t.max,respawn:0,slow:0,stun:0,dot:0}));shots=[];effects=[];areas=[]}
function enter(){
 if(!T.active)T.returnPosition={x:player.x,y:player.y,dir:player.dir};
 T.active=true;for(const id of ['settings','pause','birth','wardrobe'])if($(id).open)$(id).close();
 clearKeys();secretBuffer='';player.x=768;player.y=755;player.dir='up';mouse=null;aimX=0;aimY=-1;
 $('practicePath').value=combatId===null?'1':String(combatId);fillWeapons();$('practiceWeapon').value=powerId===null?'0':String(powerId);equip();reset();
 panel.hidden=false;attackButton.hidden=false;canvas.tabIndex=0;canvas.focus();$('interact').classList.remove('visible');canvas.setAttribute('aria-label','Training room. WASD move, mouse aim, hold and release left click or Space to attack. R reload.');
 $('objective').textContent='Training · Mouse aim · Hold / release to attack · R reload';persist();
}
function leave(){if(!T.active)return;cancel();T.active=false;panel.hidden=true;attackButton.hidden=true;Object.assign(player,T.returnPosition);player.moving=false;clearKeys();updateIdentity();persist()}
function restore(){if(T.active){T.active=false;panel.hidden=true;attackButton.hidden=true}cancel();shots=[];areas=[]}
function cancel(){held=false;charge=0;casting=false;mouse=null}
function point(){return {x:player.x-aimY*22,y:player.y-40+aimX*22}}
function aim(){if(!mouse)return;const o=point(),x=player.x+(mouse.x-width/2)/zoom,y=player.y+(mouse.y-height/2)/zoom,d=Math.hypot(x-o.x,y-o.y);if(d>1){aimX=(x-o.x)/d;aimY=(y-o.y)/d}}
function face(){player.dir=Math.abs(aimX)>Math.abs(aimY)?aimX>0?'right':'left':aimY>0?'down':'up'}
function start(){if(!T.active||isPaused()||held)return;held=true;aim();face();if(reload>0||cooldown>0)return;if(weapon.kind==='magic'){casting=true;charge=0}else if(weapon.kind==='melee'||weapon.kind==='gun')fire(1)}
function release(){if(!T.active)return;if(held&&!isPaused()&&!reload&&!cooldown&&(weapon.kind==='bow'||weapon.kind==='throw')&&charge>.08)fire(Math.min(1,charge/weapon.cast));held=false;charge=0;if(casting)casting=false}
function beginReload(){if(weapon.kind!=='gun'||reload>0||ammo===weapon.ammo)return;reload=weapon.reload;charge=0;casting=false}
function hit(t,damage,extra={}){
 if(t.hp<=0)return;t.hp=Math.max(0,t.hp-damage);trainingStats.hits++;trainingStats.damage+=damage;lastHit=damage;
 effects.push({kind:'text',x:t.x,y:t.y-25,text:String(Math.round(damage)),ttl:.8,color:weapon.color});
 if(extra.stun)t.stun=Math.max(t.stun,extra.stun);if(extra.slow)t.slow=Math.max(t.slow,extra.slow);if(extra.dot)t.dot=Math.max(t.dot,extra.dot);
 if(t.hp===0){t.respawn=2.5;trainingStats.kills++}
}
function burst(x,y,r,damage,color,extra={}){
 effects.push({kind:'ring',x,y,r,ttl:.4,color});
 for(const t of targets)if(t.hp>0&&Math.hypot(t.x-x,t.y-y)<r+22)hit(t,damage,extra);
}
function projectile(damage,angleOffset=0,options={}){
 const o=point(),a=Math.atan2(aimY,aimX)+angleOffset;
 shots.push({x:o.x,y:o.y,vx:Math.cos(a)*weapon.speed,vy:Math.sin(a)*weapon.speed,life:weapon.range/weapon.speed,damage,color:weapon.color,...options});
}
function fire(ratio){
 const p=weapon;face();trainingStats.shots++;cooldown=p.interval;swing=.18;
 if(p.kind==='melee'){
  const o=point();for(const t of targets){const dx=t.x-o.x,dy=t.y-o.y,d=Math.hypot(dx,dy);if(t.hp>0&&d<p.range+22&&(dx*aimX+dy*aimY)/Math.max(1,d)>.25)hit(t,p.damage,{stun:p.interval>.7?.35:0})}
  effects.push({kind:'slash',...o,x:o.x+aimX*p.range*.55,y:o.y+aimY*p.range*.55,r:p.range*.6,ttl:.18,color:p.color});
 }else if(p.kind==='gun'){
  if(ammo<=0){trainingStats.shots--;beginReload();return}
  const n=p.id===5?6:p.id===19?Math.min(3,ammo):1;ammo-=p.id===5?1:n;
  for(let i=0;i<n;i++)projectile(p.damage,(Math.random()-.5)*p.spread*(player.moving?3.5:2),{blast:[13,15].includes(p.id)?95:0,stun:p.id===24?.6:0});
  if(ammo===0)beginReload();
 }else if(p.kind==='magic'){castSpell()}
 else{
  const count=p.id===20?3:1;for(let i=0;i<count;i++)projectile(p.damage*(.25+.75*ratio),(i-(count-1)/2)*.1+(Math.random()-.5)*p.spread,{dot:p.id===9?4:0});
 }
}
function castSpell(){
 const p=weapon,o=point(),nearest=targets.filter(t=>t.hp>0).sort((a,b)=>Math.hypot(a.x-o.x-aimX*250,a.y-o.y-aimY*250)-Math.hypot(b.x-o.x-aimX*250,b.y-o.y-aimY*250))[0];
 const tx=Math.max(110,Math.min(1420,o.x+aimX*260)),ty=Math.max(150,Math.min(1000,o.y+aimY*260));
 if([8,12,18,21].includes(p.id)){
  if(p.id===8)health=Math.min(100,health+30);else {buff=6;buffName=p.id===12?'STATIC SHIELD':p.id===18?'FROST ARMOR':'INVISIBLE'}
  effects.push({kind:'ring',...o,r:90,ttl:1,color:p.color});return;
 }
 if([7,11,15,23].includes(p.id)){areas.push({x:tx,y:ty,r:95,ttl:5,tick:0,damage:p.damage,color:p.color,slow:p.id===23?2:0});return}
 if(p.id===6){areas.push({x:tx,y:ty,r:40,ttl:5,tick:5,damage:0,color:p.color,wall:true});burst(tx,ty,55,p.damage,p.color);return}
 if([10,17].includes(p.id)){
  if(p.id===10){const x=player.x+aimX*130,y=player.y+aimY*130;if(!collision(x,y)){player.x=x;player.y=y}burst(player.x,player.y-40,95,p.damage,p.color)}
  else{projectile(p.damage,0,{heal:true})}return;
 }
 if([3,5,14,16,19,20,24].includes(p.id)){
  burst(p.id===16||p.id===20?tx:o.x,p.id===16||p.id===20?ty:o.y,p.id===24?150:125,p.damage,p.color,{stun:[3,14,16,19,20].includes(p.id)?2:0,slow:2});
  return;
 }
 if(p.id===22&&nearest&&Math.hypot(nearest.x-o.x,nearest.y-o.y)<650){hit(nearest,p.damage);effects.push({kind:'beam',x:o.x,y:o.y,x2:nearest.x,y2:nearest.y,ttl:.3,color:p.color});for(const t of targets)if(t!==nearest&&t.hp>0&&Math.hypot(t.x-nearest.x,t.y-nearest.y)<200)hit(t,p.damage*.7);return}
 projectile(p.damage,0,{blast:p.id===0?85:0,stun:p.id===4?2:0,slow:p.id===1?2:0});
}
function collision(x,y){return x<95||x>1440||y<160||y>1060||areas.some(a=>a.wall&&Math.hypot(x-a.x,y-30-a.y)<a.r+16)}
function update(dt){
 if(isPaused()){cancel();return}clock+=dt;playSeconds+=dt;cooldown=Math.max(0,cooldown-dt);swing=Math.max(0,swing-dt);buff=Math.max(0,buff-dt);
 if(reload>0){reload=Math.max(0,reload-dt);if(reload===0)ammo=weapon.ammo}
 const dx=Number(!!(keys.d||keys.arrowright))-Number(!!(keys.a||keys.arrowleft)),dy=Number(!!(keys.s||keys.arrowdown))-Number(!!(keys.w||keys.arrowup)),len=Math.hypot(dx,dy),speed=casting?95:190;
 const oldX=player.x,oldY=player.y;if(len){const x=player.x+dx/len*speed*dt,y=player.y+dy/len*speed*dt;if(!collision(x,player.y))player.x=x;if(!collision(player.x,y))player.y=y;player.dir=dx?dx>0?'right':'left':dy>0?'down':'up';if(!mouse){aimX=dx/len;aimY=dy/len}}
 player.moving=Math.hypot(player.x-oldX,player.y-oldY)>.001;if(player.moving)walkPhase+=Math.hypot(player.x-oldX,player.y-oldY)*.075;
 aim();if(held){face();if(!reload&&!cooldown){
  if(weapon.kind==='magic'&&casting){charge+=dt;if(charge>=weapon.cast){fire(1);casting=false;charge=0}}
  else if(weapon.kind==='bow'||weapon.kind==='throw')charge=Math.min(weapon.cast,charge+dt);
  else if(weapon.kind==='melee'||weapon.kind==='gun')fire(1);
 }}
 for(const t of targets){
  if(t.hp<=0){t.respawn-=dt;if(t.respawn<=0){t.hp=t.max;t.dot=0;t.stun=0;t.slow=0}continue}
  t.stun=Math.max(0,t.stun-dt);t.slow=Math.max(0,t.slow-dt);
  if(t.moving&&!t.stun)t.x+= (t.baseX+Math.sin(clock*.8)*110-t.x)*Math.min(1,dt*(t.slow?1:6));
  if(t.dot>0){t.dot-=dt;const damage=5*dt;t.hp=Math.max(.1,t.hp-damage);trainingStats.damage+=damage}
 }
 for(const a of areas){a.ttl-=dt;a.tick-=dt;if(a.tick<=0&&!a.wall){a.tick=.5;burst(a.x,a.y,a.r,a.damage,a.color,{slow:a.slow})}}
 areas=areas.filter(a=>a.ttl>0);
 for(const s of shots){
  const ox=s.x,oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  for(const t of targets){if(t.hp<=0)continue;const vx=s.x-ox,vy=s.y-oy,u=Math.max(0,Math.min(1,((t.x-ox)*vx+(t.y-oy)*vy)/(vx*vx+vy*vy||1)));
   if(Math.hypot(t.x-ox-u*vx,t.y-oy-u*vy)<24){if(s.blast)burst(t.x,t.y,s.blast,s.damage,s.color);else hit(t,s.damage,s);if(s.heal)health=Math.min(100,health+s.damage*.3);s.life=0;break}}
 }
 shots=shots.filter(s=>s.life>0&&s.x>80&&s.x<1450&&s.y>100&&s.y<1080);
 effects.forEach(e=>e.ttl-=dt);effects=effects.filter(e=>e.ttl>0);
 const state=reload>0?'RELOADING '+reload.toFixed(1)+'s':casting?'CASTING '+Math.max(0,weapon.cast-charge).toFixed(1)+'s':charge>0?'CHARGE '+Math.round(charge/weapon.cast*100)+'% · Release to fire':cooldown>0?'RECOVERY '+cooldown.toFixed(2)+'s':weapon.kind==='gun'?'READY · '+ammo+' / '+weapon.ammo+' rounds':'READY · Hold attack';
 if(state!==statusText){$('trainingState').textContent=state;statusText=state}
 $('trainingFill').style.width=(reload?1-reload/weapon.reload:charge?charge/weapon.cast:cooldown?1-cooldown/weapon.interval:1)*100+'%';
 $('trainingScore').textContent='Hits '+trainingStats.hits+' · Damage '+Math.round(trainingStats.damage)+' · Targets '+trainingStats.kills+' · Last '+Math.round(lastHit)+' · Vitality '+Math.round(health);
}
const trainingFloor=document.createElement('canvas');trainingFloor.width=1536;trainingFloor.height=1152;const fc=trainingFloor.getContext('2d');
fc.fillStyle='#101c2a';fc.fillRect(0,0,1536,1152);
for(let y=96;y<1080;y+=48)for(let x=72;x<1464;x+=48){fc.fillStyle=(x+y)%96?'#223442':'#253947';fc.fillRect(x+1,y+1,46,46)}
fc.strokeStyle='#41616b';fc.lineWidth=4;fc.strokeRect(80,100,1376,980);
for(const y of [250,390,600]){fc.fillStyle='#73957f';for(let x=120;x<1420;x+=32)fc.fillRect(x,y+60,15,2)}
fc.fillStyle='#8adbc9';fc.font='20px monospace';fc.textAlign='center';fc.fillText('COMBAT SIMULATION / TRAINING',768,150);
fc.font='12px monospace';fc.fillStyle='#819ca7';fc.fillText('CLOSE QUARTERS',768,695);fc.fillText('RANGED TEST LANES',768,465);fc.fillText('WASD MOVE   ·   MOUSE AIM   ·   HOLD / RELEASE ATTACK',768,970);
function drawTarget(t){
 if(t.hp<=0){label('REBUILDING '+Math.ceil(t.respawn),t.x,t.y,'#7899a5',10);return}
 ellipse(t.x,t.y+40,30,9,'#09141c');rect(t.x-5,t.y+5,10,35,'#536574');rect(t.x-24,t.y+36,48,6,'#111e2b');
 rect(t.x-21,t.y-26,42,50,t.stun?'#b1a1d6':'#345a68');rect(t.x-16,t.y-21,32,40,'#183343');rect(t.x-11,t.y-13,22,24,t.slow?'#85b7d6':'#ae6658');rect(t.x-5,t.y-7,10,12,'#efd9b0');
 rect(t.x-27,t.y-44,54,5,'#0d1924');rect(t.x-27,t.y-44,54*t.hp/t.max,5,'#8ce1b5');label(Math.ceil(t.hp)+' / '+t.max,t.x,t.y-52,'#c3d9de',10);label(t.label,t.x,t.y+60,'#839eaa',9);
}
function drawWeapon(){
 const o=point(),p=weapon,a=Math.atan2(aimY,aimX)+(p.kind==='melee'&&swing?-.6+swing*6:0);
 const ca=Math.cos(a),sa=Math.sin(a),ox=o.x+aimX*20,oy=o.y+aimY*20;
 // Stamp integer pixels so even aimed equipment keeps the character's pixel edges.
 function pixel(x,y,color){rect(Math.round(ox+x*ca-y*sa),Math.round(oy+x*sa+y*ca),2,2,color)}
 function box(x,y,w,h,color){for(let i=0;i<w;i+=2)for(let j=0;j<h;j+=2)pixel(x+i,y+j,color)}
 function stroke(x,y,xx,yy,color,w=2){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y));for(let i=0;i<=n;i+=1)box(x+(xx-x)*i/(n||1),y+(yy-y)*i/(n||1),w,w,color)}
 if(p.kind==='melee'){
  if([0,6,24].includes(p.id)){box(0,-6,12,12,p.id===6?'#c9a967':'#dbc0a0');if(p.id===24)for(let y=-6;y<7;y+=5)box(7,y,20,2,'#d6e5ec')}
  else if([7,19,23].includes(p.id)){box(0,-2,30,5,'#91724e');box(24,-12,p.id===7?18:12,25,'#839fac');box(26,-10,12,3,'#deeaeb')}
  else if([2,4,12,16].includes(p.id)){box(0,-2,15,5,'#83634c');box(13,-5,30,10,p.id===2||p.id===16?'#b18b58':'#96a5af')}
  else if([8,14,22].includes(p.id)){box(-8,-2,55,4,'#8e775a');box(42,-4,15,8,'#c5d8df');if(p.id===22)box(42,-17,6,18,'#d1dce3');if(p.id===14)for(let y=-12;y<13;y+=6)box(42,y,14,2,'#9eabb3')}
  else if(p.id===9){box(0,-2,35,5,'#816a4c');box(25,-15,15,28,'#99acb7')}
  else {const short=[3,10,17,21].includes(p.id);box(0,-3,12,6,'#79634e');box(12,-6,3,12,'#caa565');box(16,-3,short?19:p.range*.3,p.id===18?10:5,'#c3d5df');if(p.id===17){box(2,12,9,4,'#79634e');box(11,11,23,5,'#c3d5df')}}
 }else if(p.kind==='bow'){
  stroke(0,-22,10,0,'#b59668',3);stroke(10,0,0,22,'#b59668',3);
  const pull=-16*(charge/p.cast);stroke(0,-22,pull,0,'#dfe6df',1);stroke(pull,0,0,22,'#dfe6df',1);stroke(pull,0,27,0,'#c3dce3',2);
  if(p.id===4)box(-10,-3,35,6,'#637d8c');if(p.id===8){box(0,-14,4,28,'#9c7b50');box(-10,-2,12,5,'#9c7b50')}
 }else if(p.kind==='gun'){
  const len=[3,16,22].includes(p.id)?48:[2,10,24].includes(p.id)?23:36;
  box(0,-7,len,12,'#182734');box(5,-8,len-10,4,'#8ba6b6');box(7,4,8,13,'#4d6574');box(len-4,-4,12,5,'#9aafba');
  if([3,16].includes(p.id))box(14,-14,15,6,'#6d8496');
  if([13,15].includes(p.id))box(2,-12,40,22,'#69795e');
  if(p.id===2){box(0,15,23,8,'#526d7c');box(4,21,7,9,'#283948')}
  if(swing>.1)box(len+10,-5,10,7,'#ffca73');
 }else if(p.kind==='magic'){box(8,-8,14,16,p.color);box(12,-4,6,8,'#f1f8ee')}
 else {stroke(0,0,30,0,'#b1ced8',4);box(24,-6,7,12,'#d3e7e8')}
}
function render(){
 ctx.fillStyle='#08131e';ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(width/2,height/2);ctx.scale(zoom,zoom);ctx.translate(-player.x,-player.y);ctx.drawImage(trainingFloor,0,0);
 for(const a of areas){ctx.globalAlpha=.3;rect(a.x-a.r,a.y-a.r,a.r*2,a.r*2,a.color);ctx.globalAlpha=1;if(a.wall)rect(a.x-25,a.y-65,50,70,a.color)}
 const behind=targets.filter(t=>t.y+40<player.y),front=targets.filter(t=>t.y+40>=player.y);behind.forEach(drawTarget);
 if(aimY<-.5)drawWeapon();if(buffName==='INVISIBLE'&&buff)ctx.globalAlpha=.3;drawPlayer();ctx.globalAlpha=1;if(aimY>=-.5)drawWeapon();front.forEach(drawTarget);
 for(const s of shots){line(s.x,s.y,s.x-s.vx*.012,s.y-s.vy*.012,s.color,3);rect(s.x-2,s.y-2,4,4,s.color)}
 for(const e of effects){ctx.globalAlpha=Math.min(1,e.ttl*3);if(e.kind==='text')label(e.text,e.x,e.y-(.8-e.ttl)*45,e.color,16);else if(e.kind==='beam')line(e.x,e.y,e.x2,e.y2,e.color,4);else{ctx.strokeStyle=e.color;ctx.lineWidth=e.kind==='slash'?5:2;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1}
 const o=point();if(charge||buff){ctx.strokeStyle=weapon.color;ctx.lineWidth=2;ctx.strokeRect(player.x-25,player.y+12,50,5);rect(player.x-25,player.y+12,50*(charge?charge/weapon.cast:buff/6),5,weapon.color)}
 if(buff)label(buffName,player.x,player.y+38,'#cce4e9',9);
 const ax=o.x+aimX*160,ay=o.y+aimY*160;line(ax-7,ay,ax+7,ay,'#90ddcb');line(ax,ay-7,ax,ay+7,'#90ddcb');ctx.restore();
}
$('practicePath').onchange=()=>{fillWeapons();equip()};$('practiceWeapon').onchange=equip;$('leaveTraining').onclick=leave;$('resetTargets').onclick=()=>{cancel();reset()};$('reloadTraining').onclick=beginReload;
$('trainingButton').onclick=enter;
canvas.addEventListener('pointermove',e=>{if(T.active)mouse={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerdown',e=>{if(!T.active||e.button!==0)return;e.preventDefault();canvas.focus();mouse={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);start()});
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',cancel);
attackButton.onpointerdown=e=>{e.preventDefault();attackButton.setPointerCapture(e.pointerId);mouse=null;start()};attackButton.onpointerup=release;attackButton.onpointercancel=cancel;
addEventListener('keydown',e=>{if(!T.active||isPaused()||['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target?.tagName))return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)start()}if(e.code==='KeyR'&&!e.repeat)beginReload()});
addEventListener('keyup',e=>{if(e.code==='Space')release()});addEventListener('blur',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
})();
