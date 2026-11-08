const KEY = "project-you-save-v1";
const initial = {
  xp: 0, gold: 0,
  stats: [
    {id:"strength",name:"STRENGTH",desc:"Сила, витривалість, тіло",xp:0},
    {id:"intelligence",name:"INTELLIGENCE",desc:"Знання та мислення",xp:0},
    {id:"discipline",name:"DISCIPLINE",desc:"Самоконтроль і сталість",xp:0},
    {id:"career",name:"CAREER",desc:"Професія та дохід",xp:0},
    {id:"charisma",name:"CHARISMA",desc:"Комунікація та впевненість",xp:0},
    {id:"survival",name:"SURVIVAL",desc:"Побут і самостійність",xp:0},
    {id:"creativity",name:"CREATIVITY",desc:"Ідеї та створення",xp:0}
  ],
  quests: [
    {id:1,title:"Рухайся 20 хвилин",category:"Тіло • Щоденне",reward:20,stat:"strength",done:false},
    {id:2,title:"Навчайся 30 хвилин",category:"Розум • Щоденне",reward:25,stat:"intelligence",done:false},
    {id:3,title:"Виконай одну важливу справу",category:"Дисципліна • Щоденне",reward:20,stat:"discipline",done:false}
  ],
  log:[]
};
let state;
try { state = JSON.parse(localStorage.getItem(KEY)) || structuredClone(initial); } catch(e) { state = structuredClone(initial); }
const $ = id => document.getElementById(id);
const levelFor = xp => { let level=1, remaining=xp, need=500; while(remaining>=need){remaining-=need;level++;need=500+(level-1)*100;} return {level,remaining,need}; };
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function log(message){state.log.unshift({message,time:new Date().toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})});state.log=state.log.slice(0,6);}
function render(){
  const l=levelFor(state.xp);
  $("level").textContent=l.level;$("xpText").textContent=`${l.remaining} / ${l.need} XP`;$("totalXp").textContent=state.xp;$("gold").textContent=state.gold;
  $("xpBar").style.width=`${Math.min(100,l.remaining/l.need*100)}%`;
  $("statsGrid").innerHTML=state.stats.map(s=>{const sl=levelFor(s.xp);return `<article class="stat-card"><div class="stat-head"><span class="stat-name">${s.name}</span><span class="stat-level">LVL ${sl.level}</span></div><div class="stat-desc">${s.desc}</div><div class="mini-track"><div class="mini-fill" style="width:${Math.min(100,sl.remaining/sl.need*100)}%"></div></div><div class="stat-xp">${s.xp} XP</div></article>`}).join("");
  $("questList").innerHTML=state.quests.length?state.quests.map(q=>`<div class="quest ${q.done?"done":""}"><button class="quest-check" data-complete="${q.id}" aria-label="Позначити виконаним">${q.done?"✓":""}</button><div class="quest-main"><div class="quest-name">${escapeHtml(q.title)}</div><div class="quest-meta">${escapeHtml(q.category)}</div></div><div class="quest-reward">+${q.reward} XP</div></div>`).join(""):`<div class="empty">Активних завдань немає. Додай перший квест.</div>`;
  $("activityLog").innerHTML=state.log.length?state.log.map(x=>`<div class="log-entry"><b>${x.time}</b>　${escapeHtml(x.message)}</div>`).join(""):`<div class="empty">Система очікує на твою першу дію.</div>`;
  save();
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("questList").addEventListener("click",e=>{
 const btn=e.target.closest("[data-complete]");if(!btn)return;
 const q=state.quests.find(x=>x.id===Number(btn.dataset.complete));if(!q||q.done)return;
 q.done=true;state.xp+=q.reward;state.gold+=Math.max(5,Math.round(q.reward/2));
 const stat=state.stats.find(s=>s.id===q.stat)||state.stats.find(s=>s.id==="discipline");if(stat)stat.xp+=q.reward;
 log(`Квест завершено: ${q.title} <b>+${q.reward} XP</b> та GOLD отримано.`);
 render();
});
$("addQuestBtn").addEventListener("click",()=>{
 const title=prompt("Назва нового квесту:");if(!title||!title.trim())return;
 const rewardRaw=prompt("Нагорода XP (від 5 до 100):","20");const reward=Math.max(5,Math.min(100,Number(rewardRaw)||20));
 const categories=["strength","intelligence","discipline","career","charisma","survival","creativity"];
 const choice=prompt("Характеристика: 1 Сила, 2 Інтелект, 3 Дисципліна, 4 Кар'єра, 5 Харизма, 6 Самостійність, 7 Творчість","3");
 const idx=Math.max(0,Math.min(6,(Number(choice)||3)-1));const labels=["Тіло","Розум","Дисципліна","Кар'єра","Комунікація","Самостійність","Творчість"];
 state.quests.push({id:Date.now(),title:title.trim(),category:labels[idx]+" • Особисте",reward,stat:categories[idx],done:false});
 log(`Додано новий квест: ${title.trim()}`);render();
});
$("resetBtn").addEventListener("click",()=>{if(confirm("Скинути весь прогрес на цьому пристрої? Це не можна скасувати.")){state=structuredClone(initial);render();}});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
render();