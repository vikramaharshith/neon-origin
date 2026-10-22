/* Permanent path unlocks and immediate, freely selectable equipment within that path. */
(function(){
const dialog=document.createElement('dialog');dialog.id='loadout';dialog.setAttribute('aria-labelledby','loadoutTitle');
dialog.innerHTML='<div class="modal-head"><div><div class="eyebrow" id="loadoutPath">COMBAT PATH UNLOCKED</div><h1 id="loadoutTitle">Choose your loadout</h1></div><button class="x" id="closeLoadout" aria-label="Close loadout">×</button></div><p class="sub" id="loadoutHelp"></p><div id="loadoutChoices"></div><div class="modal-body"><div id="loadoutEquipped" role="status" aria-live="polite"></div><button class="action" id="finishLoadout">RETURN TO GAME</button><p class="foot">Press L anytime to change equipment within your unlocked path. Practice range: left exit in the home lab.</p></div>';
document.body.append(dialog);
const css=document.createElement('style');css.textContent='#loadoutChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:0 25px;max-height:48vh;overflow:auto}.loadout-choice{padding:13px;text-align:left;background:#142a36;border:1px solid #365361;line-height:1.5}.loadout-choice b{display:block;color:#d5eee8}.loadout-choice small{display:block;color:#91aeb7;margin-top:5px}.loadout-choice[aria-pressed="true"]{border-color:#91fce0;background:#21463f}.loadout-choice:hover{border-color:#91fce0}#loadoutEquipped{margin-bottom:16px;color:#91fce0;line-height:1.6}@media(max-width:550px){#loadoutChoices{grid-template-columns:1fr}}';document.head.append(css);
function refresh(){
 const ready=combatId!==null;
 $('loadoutPath').textContent=ready?COMBAT[combatId].name.toUpperCase()+' / UNLOCKED':'COMBAT PATH / LOCKED';
 $('loadoutHelp').textContent=ready?'Pick any '+(combatId===0?'spell':'weapon')+' below. It equips and saves immediately. Your combat path stays unlocked.':'Discover your species and combat path at the central beacon first.';
 const grid=$('loadoutChoices');grid.replaceChildren();
 if(ready)COMBAT[combatId].items.forEach(([name,description],id)=>{
  const b=document.createElement('button');b.className='loadout-choice';b.setAttribute('aria-pressed',String(id===powerId));
  const title=document.createElement('b'),detail=document.createElement('small');title.textContent=(id===powerId?'✓ ':'')+name;detail.textContent=description;b.append(title,detail);
  b.onclick=()=>{powerId=id;globalThis.Training?.useEquipped();persist();updateIdentity();refresh();};grid.append(b);
 });
 $('loadoutEquipped').textContent=ready&&powerId!==null?'EQUIPPED · '+COMBAT[combatId].items[powerId][0]:'Select a loadout to equip it.';
}
globalThis.openLoadout=function(){if(spinning)return;clearKeys();globalThis.Training?.cancel();refresh();if(!dialog.open)dialog.showModal()};
function close(){dialog.close();clearKeys()}
$('closeLoadout').onclick=close;$('finishLoadout').onclick=()=>{close();if($('pause').open)$('pause').close();if($('settings').open)$('settings').close()};
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
$('loadoutButton').onclick=openLoadout;
addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='l'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;if(dialog.open){e.preventDefault();close()}else if(!isPaused()){e.preventDefault();openLoadout()}});
// A saved, unfinished combat unlock resumes directly at equipment selection.
if(combatId!==null&&powerId===null&&!exited)openLoadout();
})();
