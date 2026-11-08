const STORE = "project-you-save-v2";
const ATTRS = [
  ["STRENGTH","Сила та фізична форма","STR"],
  ["INTELLIGENCE","Знання та навчання","INT"],
  ["DISCIPLINE","Самоконтроль і сталість","DIS"],
  ["CAREER","Професія та дохід","CAR"],
  ["CHARISMA","Комунікація та впевненість","CHA"],
  ["SURVIVAL","Самостійність і побут","SUR"],
  ["CREATIVITY","Ідеї та створення","CRE"]
];
const DEFAULT_QUESTS = [
  {id:"q1",title:"Виконати фізичне тренування",category:"STRENGTH",xp:40,gold:20,kind:"DAILY",done:false},
  {id:"q2",title:"Навчатися або практикувати навичку 30 хв",category:"INTELLIGENCE",xp:25,gold:10,kind:"DAILY",done:false},
  {id:"q3",title:"Виконати одну важливу справу без відкладання",category:"DISCIPLINE",xp:20,gold:10,kind:"DAILY",done:false},
  {id:"q4",title:"Зробити крок до власного доходу",category:"CAREER",xp:35,gold:15,kind:"WEEKLY",done:false}
];
const SKILLS = [
  {id:"s1",icon:"⚔",name:"PHYSICAL POWER",desc:"Розвивай силу, витривалість і контроль тіла.",attr:"STRENGTH",need:0},
  {id:"s2",icon:"◉",name:"FOCUS CORE",desc:"Тренуй концентрацію та глибоку роботу.",attr:"DISCIPLINE",need:0},
  {id:"s3",icon:"⌘",name:"KNOWLEDGE",desc:"Відкривай нові знання та інтелектуальні навички.",attr:"INTELLIGENCE",need:50},
  {id:"s4",icon:"◇",name:"SOCIAL INSTINCT",desc:"Комунікація, переговори та впевненість.",attr:"CHARISMA",need:50},
  {id:"s5",icon:"↗",name:"BUILDER",desc:"Створюй проєкти та формуй джерела доходу.",attr:"CAREER",need:100},
  {id:"s6",icon:"✧",name:"CREATOR",desc:"Перетворюй ідеї на завершені результати.",attr:"CREATIVITY",need:100}
];
const fresh = () => ({name:"PLAYER",xp:0,gold:0,level:1,attr:Object.fromEntries(ATTRS.map(a=>[a[0],0])),quests:DEFAULT_QUESTS.map(q=>({...q})),unlocked:[],log:[{text:"SYSTEM initialized. Welcome, Player.",time:Date.now()}],completedToday:0,lastCompleteDate:""});
let state;
try { state = JSON.parse(localStorage.getItem(STORE)) || fresh(); } catch { state=fresh(); }
function save(){localStorage.setItem(STORE,JSON.stringify(state));}
function needXP(level){return 500+(level-1)*100;}
function rankFor(level){if(level>=100)return"SSS";if(level>=75)return"SS";if(level>=50)return"S";if(level>=30)return"A";if(level>=20)return"B";if(level>=10)return"C";if(level>=5)return"D";return"E";}
function addLog(text){state.log.unshift({text,time:Date.now()});state.log=state.log.slice(0,30);}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300);}
function render(){
  document.getElementById("playerName").textContent=state.name||"PLAYER";
  document.getElementById("avatarInitial").textContent=(state.name||"P").trim().charAt(0).toUpperCase();
  document.getElementById("level").textContent=state.level;
  document.getElementById("rank").textContent="RANK "+rankFor(state.level);
  document.getElementById("totalXp").textContent=state.xp.toLocaleString("uk-UA");
  document.getElementById("gold").textContent=state.gold.toLocaleString("uk-UA");
  document.getElementById("streak").textContent=state.completedToday+" TODAY";
  const need=needXP(state.level), current=state.xp, pct=Math.min(100,Math.round(current/need*100));
  document.getElementById("xpText").textContent=`${current} / ${need} XP`;
  document.getElementById("xpPercent").textContent=pct+"%";
  document.getElementById("xpBar").style.width=pct+"%";
  document.getElementById("attributes").innerHTML=ATTRS.map(([name,desc])=>{let v=state.attr[name]||0;return `<article class="attribute"><div class="attribute-top"><span class="attribute-name">${name}</span><span class="attribute-value">${v} XP</span></div><div class="attribute-desc">${desc}</div><div class="mini-progress"><span style="width:${Math.min(100,v%100)}%"></span></div></article>`}).join("");
  const active=state.quests.filter(q=>!q.done);
  document.getElementById("questList").innerHTML=active.length?active.slice(0,4).map(q=>`<article class="quest" data-id="${q.id}"><div><div class="quest-title">${escapeHTML(q.title)}</div><div class="quest-meta">${q.kind} · ${q.category}</div><div class="quest-reward">+${q.xp} XP <b>+${q.gold} GOLD</b></div></div><button class="complete-btn" data-complete="${q.id}">COMPLETE</button></article>`).join(""):`<div class="panel" style="padding:18px;text-align:center;color:#8ba7c2;font-size:12px">Усі активні квести виконано. Створи новий виклик.</div>`;
  document.getElementById("skillGrid").innerHTML=SKILLS.map(s=>{let unlocked=state.unlocked.includes(s.id),v=state.attr[s.attr]||0,can=v>=s.need;return `<article class="skill ${unlocked?"":"locked"}"><div class="skill-icon">${s.icon}</div><div class="skill-name">${s.name}</div><div class="skill-desc">${s.desc}</div><div class="skill-foot"><span>${unlocked?"UNLOCKED":`REQUIRES ${s.need} ${s.attr} XP`}</span>${unlocked?'<span>✓ ACTIVE</span>':can?`<button class="skill-action" data-unlock="${s.id}">UNLOCK →</button>`:"LOCKED"}</div></article>`}).join("");
  document.getElementById("logList").innerHTML=state.log.slice(0,3).map(logHTML).join("")||emptyLog();
  document.getElementById("fullLog").innerHTML=state.log.map(logHTML).join("")||emptyLog();
  save();
}
function logHTML(item){return `<div class="log-entry"><span class="log-mark">›</span><span>${escapeHTML(item.text)}</span><span class="log-time">${new Date(item.time).toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}</span></div>`;}
function emptyLog(){return '<div class="log-entry">No activity recorded.</div>';}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function completeQuest(id){const q=state.quests.find(x=>x.id===id);if(!q||q.done)return;q.done=true;state.xp+=Number(q.xp);state.gold+=Number(q.gold);state.attr[q.category]=(state.attr[q.category]||0)+Number(q.xp);const today=new Date().toISOString().slice(0,10);if(state.lastCompleteDate!==today){state.completedToday=0;state.lastCompleteDate=today;}state.completedToday++;let leveled=false;while(state.xp>=needXP(state.level)){state.xp-=needXP(state.level);state.level++;leveled=true;}addLog(`Quest completed: ${q.title} · +${q.xp} XP · +${q.gold} GOLD`);if(leveled)addLog(`LEVEL UP! You reached level ${state.level}.`);render();toast(leveled?`LEVEL UP — LEVEL ${state.level}`:`QUEST COMPLETE  +${q.xp} XP`);}
document.addEventListener("click",e=>{
 const complete=e.target.closest("[data-complete]");if(complete){completeQuest(complete.dataset.complete);return;}
 const unlock=e.target.closest("[data-unlock]");if(unlock){const s=SKILLS.find(x=>x.id===unlock.dataset.unlock);if(s&&!state.unlocked.includes(s.id)&&(state.attr[s.attr]||0)>=s.need){state.unlocked.push(s.id);addLog(`Skill unlocked: ${s.name}`);render();toast("NEW SKILL UNLOCKED");}return;}
});
document.getElementById("addQuestBtn").addEventListener("click",()=>document.getElementById("questDialog").showModal());
document.getElementById("questForm").addEventListener("submit",e=>{e.preventDefault();const title=document.getElementById("questTitle").value.trim();if(!title)return;state.quests.push({id:"q"+Date.now(),title,category:document.getElementById("questCategory").value,xp:Math.max(5,Math.min(500,Number(document.getElementById("questXP").value)||25)),gold:Math.max(0,Math.min(300,Number(document.getElementById("questGold").value)||0)),kind:"CUSTOM",done:false});addLog(`New quest created: ${title}`);document.getElementById("questDialog").close();e.target.reset();render();toast("QUEST ADDED TO SYSTEM");});
document.getElementById("systemBtn").addEventListener("click",()=>document.getElementById("logDialog").showModal());
document.getElementById("allQuestsBtn").addEventListener("click",()=>{const done=state.quests.filter(q=>q.done);toast(`${state.quests.length-done.length} ACTIVE · ${done.length} COMPLETED`);});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const id=btn.dataset.target;if(id==="top")window.scrollTo({top:0,behavior:"smooth"});else document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});}));
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
