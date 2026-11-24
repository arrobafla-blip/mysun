const STORAGE_KEY="mySun.v1";
const defaults=[
  {id:"workout",name:"Movimentar o corpo",category:"Corpo"},
  {id:"food",name:"Alimentação equilibrada",category:"Nutrição"},
  {id:"water",name:"Atingir minha meta de água",category:"Nutrição"},
  {id:"skincare",name:"Skincare",category:"Autocuidado"},
  {id:"reading",name:"Ler por 10 minutos",category:"Mente"},
  {id:"selfcare",name:"Fazer algo por mim",category:"Autocuidado"},
  {id:"sleep",name:"Respeitar meu descanso",category:"Descanso"}
];
const arcana=[
["0","O Louco","☼","Começos e coragem"],["I","O Mago","✧","Intenção e iniciativa"],["II","A Sacerdotisa","☾","Intuição e escuta"],["III","A Imperatriz","❀","Nutrição e criatividade"],["IV","O Imperador","♜","Estrutura e limites"],["V","O Hierofante","⌘","Aprendizado e valores"],["VI","Os Enamorados","♡","Escolhas alinhadas"],["VII","O Carro","➶","Direção e movimento"],["VIII","A Força","♌","Coragem gentil"],["IX","O Eremita","☽","Pausa e reflexão"],["X","A Roda da Fortuna","✺","Ciclos e mudanças"],["XI","A Justiça","⚖","Equilíbrio e responsabilidade"],["XII","O Enforcado","♧","Nova perspectiva"],["XIII","A Morte","✿","Transformação"],["XIV","A Temperança","⚗","Moderação e harmonia"],["XV","O Diabo","∞","Reconhecer padrões"],["XVI","A Torre","ϟ","Recomeçar com verdade"],["XVII","A Estrela","✦","Esperança e inspiração"],["XVIII","A Lua","☾","Emoções e mistério"],["XIX","O Sol","☀","Vitalidade e clareza"],["XX","O Julgamento","♧","Despertar e renovação"],["XXI","O Mundo","◎","Integração e realização"]
];
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function fresh(){return {habits:defaults,logs:{},water:{},waterGoal:3,bottleSize:600,journals:{},meals:{},challengeStart:null,xp:0,dreams:[],evolution:[],capsules:[],moods:[],ritualHistory:[],glowGoals:[],transactions:[],financeGoals:[],lifeItems:[],selfCareLog:[],monthlyBudgets:{}}}
let state;
try{state={...fresh(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}catch(e){state=fresh()}
// Migração: a versão anterior contava copos. Para preservar o histórico,
 // convertemos cada copo antigo em 200 ml (estimativa) uma única vez.
if(!state.waterUnitVersion){Object.keys(state.water||{}).forEach(k=>{state.water[k]=Number(state.water[k]||0)*200});state.waterUnitVersion=2;localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function logFor(date=todayKey()){return state.logs[date]||(state.logs[date]={})}
function activeHabits(){return state.habits}
function completedCount(date=todayKey()){const l=logFor(date);return activeHabits().filter(h=>l[h.id]).length}
function isDayDone(date){return activeHabits().length>0&&completedCount(date)===activeHabits().length}
function dayNumber(date){if(!state.challengeStart)return 0;const a=new Date(state.challengeStart+"T12:00:00"),b=new Date(date+"T12:00:00");return Math.floor((b-a)/86400000)+1}
function doneDays(){if(!state.challengeStart)return 0;let n=0;for(let i=0;i<21;i++){const d=new Date(state.challengeStart+"T12:00:00");d.setDate(d.getDate()+i);if(isDayDone(d.toISOString().slice(0,10)))n++}return n}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function dateText(date){return new Date(date+"T12:00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"})}
function renderMonthlyGoals(){
 const now=new Date(),month=now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 const label=document.getElementById("monthlyGoalsMonth");if(label)label.textContent=month.charAt(0).toUpperCase()+month.slice(1);
 const ml=Number(state.water[todayKey()]||0),pct=Math.min(100,ml/2500*100);
 const bar=document.getElementById("monthlyWaterProgress"),amount=document.getElementById("monthlyWaterAmount"),percent=document.getElementById("monthlyWaterPercent");
 if(bar)bar.style.width=pct+"%";if(amount)amount.textContent=ml.toLocaleString("pt-BR")+" ml";if(percent)percent.textContent=Math.round(pct)+"%";
}
function render(){
 const now=new Date();document.getElementById("todayLabel").textContent=now.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});document.getElementById("longDate").textContent=now.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});document.getElementById("journalDate").textContent=dateText(todayKey());
 renderToday();renderOverviewCalendar();renderWater();renderMonthlyGoals();renderChallenge();renderHabits();renderJournal();renderArcana();renderMap();renderFood();renderSpiritual();renderOverviewCalendar();
}

let overviewMonth=todayKey().slice(0,7),overviewSelectedDate=todayKey();
function overviewDateLabel(d){return new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function overviewRecords(date){
 const meals=state.meals[date]||[],training=(state.trainingSessions||[]).filter(x=>x.date===date),selfcare=(state.selfCareLog||[]).filter(x=>x.date===date),sleep=(state.sleepLogs||[]).find(x=>x.date===date),mood=(state.moods||[]).find(x=>x.date===date),journal=state.journals[date]||{},water=Number(state.water[date]||0),waterGoal=(Number(state.waterGoal)||3)*(Number(state.bottleSize)||600),habits=state.logs[date]||{};
 return {meals,training,selfcare,sleep,mood,journal,water,waterGoal,habits};
}
function renderOverviewCalendar(){
 const host=document.getElementById("overviewCalendar");if(!host)return;
 const [year,month]=overviewMonth.split("-").map(Number),first=new Date(year,month-1,1),days=new Date(year,month,0).getDate(),offset=first.getDay();
 const label=document.getElementById("overviewMonthLabel");label.textContent=first.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 host.innerHTML="";["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].forEach(d=>{const w=document.createElement("div");w.className="overview-weekday";w.textContent=d;host.appendChild(w)});
 for(let i=0;i<offset;i++){const blank=document.createElement("div");blank.className="overview-blank";host.appendChild(blank)}
 for(let day=1;day<=days;day++){
  const key=year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0"),r=overviewRecords(key),cell=document.createElement("button");cell.type="button";cell.className="overview-day"+(key===overviewSelectedDate?" selected":"")+(key===todayKey()?" today":"");
  const num=document.createElement("b");num.textContent=day;cell.appendChild(num);
  const marks=document.createElement("span");marks.className="overview-day-marks";
  if(r.meals.length)marks.append("●");if(r.training.length)marks.append("◆");if(r.selfcare.length)marks.append("♥");if(r.sleep)marks.append("☾");
  cell.appendChild(marks);cell.title=[r.meals.length? "Alimentação registrada":"",r.training.length?"Treino registrado":"",r.selfcare.length?"Autocuidado registrado":"",r.sleep?"Sono registrado":""].filter(Boolean).join(" · ")||"Sem registros neste dia";
  cell.addEventListener("click",()=>{overviewSelectedDate=key;renderOverviewCalendar()});host.appendChild(cell);
 }
 renderOverviewDay();
}
function overviewMetric(icon,label,value,status,cls=""){
 const el=document.createElement("div");el.className="overview-metric "+cls;
 const top=document.createElement("div");top.className="overview-metric-top";const glyph=document.createElement("span");glyph.textContent=icon;const name=document.createElement("small");name.textContent=label;top.append(glyph,name);
 const strong=document.createElement("b");strong.textContent=value;const note=document.createElement("span");note.className="overview-metric-status";note.textContent=status;el.append(top,strong,note);return el;
}
function renderOverviewDay(){
 const r=overviewRecords(overviewSelectedDate),title=document.getElementById("overviewDayTitle"),status=document.getElementById("overviewDayStatus"),metrics=document.getElementById("overviewDayMetrics"),details=document.getElementById("overviewDayDetails");
 if(!metrics)return;
 title.textContent=overviewDateLabel(overviewSelectedDate);
 const habitTotal=activeHabits().length,habitDone=activeHabits().filter(h=>r.habits[h.id]).length;
 const waterPct=r.waterGoal?Math.min(100,Math.round(r.water/r.waterGoal*100)):0;
 const mealStatus=!r.meals.length?"Sem registro":r.meals.length>=3?"Bem registrado":"Registro parcial";
 const sleepStatus=r.sleep?(r.sleep.quality||"Registrado"):"Sem registro";
 const moodValue=r.mood?.mood||r.journal.mood||"Não registrado";
 const allCount=r.meals.length+r.training.length+r.selfcare.length+(r.sleep?1:0)+(r.mood||r.journal.mood?1:0);
 status.textContent=allCount?"Dia com "+allCount+" tipo(s) de registro":"Nenhum registro neste dia";
 metrics.innerHTML="";
 metrics.append(
  overviewMetric("🥗","Alimentação",r.meals.length+" refeições",mealStatus),
  overviewMetric("🏃","Movimento",r.training.length?r.training.length+" atividade(s)":"—",r.training.map(x=>x.type).join(", ")||"Sem treino registrado"),
  overviewMetric("💧","Hidratação",r.water.toLocaleString("pt-BR")+" ml",waterPct+"% da meta"),
  overviewMetric("♡","Autocuidado",r.selfcare.length+" atividade(s)",r.selfcare.length?"Registrado":"Sem registro"),
  overviewMetric("☾","Sono",r.sleep?Number(r.sleep.hours).toLocaleString("pt-BR")+" h":"—",sleepStatus),
  overviewMetric("☀","Humor",moodValue,moodValue==="Não registrado"?"Sem registro":"Check-in registrado"),
  overviewMetric("✓","Hábitos",habitDone+"/"+habitTotal,habitTotal?(habitDone===habitTotal?"Todos concluídos":"Em andamento"):"Sem hábitos ativos")
 );
 details.innerHTML="";
 const lines=[];
 if(r.meals.length){const names=r.meals.map(x=>(x.time?x.time+" · ":"")+x.type+": "+x.name);lines.push(["Refeições",names.join(" | ")]);}
 if(r.training.length)lines.push(["Treinos",r.training.map(x=>x.type+(x.duration?" · "+x.duration+" min":"")).join(" | ")]);
 if(r.selfcare.length)lines.push(["Autocuidado",r.selfcare.map(x=>{const item=(window.mySunSelfCareNames||[])[x.id];return item||"Atividade realizada"}).join(", ")]);
 if(r.sleep?.note)lines.push(["Observação do sono",r.sleep.note]);
 if(r.journal.win)lines.push(["Pequena vitória",r.journal.win]);
 if(r.journal.gratitude)lines.push(["Gratidão",r.journal.gratitude]);
 if(!lines.length){details.textContent="Os detalhes das refeições, treinos, autocuidado e diário aparecerão aqui conforme você registrar seu dia.";}
 else lines.forEach(([k,v])=>{const row=document.createElement("p");const b=document.createElement("b");b.textContent=k+": ";row.append(b,document.createTextNode(v));details.appendChild(row)});
}

function renderToday(){
 const host=document.getElementById("todayHabits"),l=logFor();host.innerHTML="";
 activeHabits().forEach(h=>{const row=document.createElement("label");row.className="habit-row"+(l[h.id]?" done":"");row.innerHTML=`<input class="habit-check" type="checkbox" ${l[h.id]?"checked":""}><span class="habit-name"></span><span class="category-tag"></span>`;row.querySelector(".habit-name").textContent=h.name;row.querySelector(".category-tag").textContent=h.category;row.querySelector("input").addEventListener("change",e=>toggleHabit(h.id,e.target.checked));host.appendChild(row)});
 document.getElementById("todayCount").textContent=`${completedCount()}/${activeHabits().length}`;
}
function toggleHabit(id,checked){const l=logFor();const before=!!l[id];l[id]=checked;if(checked&&!before){state.xp=(state.xp||0)+10;toast("Mais um passo de cuidado. +10 pontos de luz ✧")}if(!checked&&before){state.xp=Math.max(0,(state.xp||0)-10)}save();render();if(isDayDone(todayKey()))toast("Dia completo! Você honrou seus compromissos. ☼")}
function renderWater(){const ml=state.water[todayKey()]||0;const goal=state.waterGoal||3;const size=state.bottleSize||600;const bottles=ml/size;document.getElementById("waterCount").textContent=bottles.toLocaleString("pt-BR",{maximumFractionDigits:1});document.getElementById("waterGoalLabel").textContent=goal;document.getElementById("waterMl").textContent=ml.toLocaleString("pt-BR");document.getElementById("bottleSizeLabel").textContent=size;document.getElementById("waterLevel").style.height=Math.min(100,ml/(goal*size)*100)+"%";renderOverviewCalendar()}
function renderChallenge(){
 const done=doneDays(),pct=done/21*100,started=!!state.challengeStart;document.getElementById("completedDays").textContent=done;document.getElementById("challengeProgress").style.width=pct+"%";document.getElementById("challengeStatus").textContent=started?"Em andamento":"Ainda não iniciada";document.getElementById("challengeMessage").textContent=done===21?"Você concluiu seu ciclo. Celebre sua caminhada!":started?"Cada dia é uma nova oportunidade.":"Toda transformação começa com uma escolha.";
 document.getElementById("challengeHeadline").textContent=done===21?"Você chegou ao fim desta etapa!":started?"Sua jornada está em movimento.":"Tudo começa com uma intenção.";document.getElementById("challengeSub").textContent=started?`Iniciado em ${dateText(state.challengeStart)} · ${done} dias completos.`:"Inicie seu ciclo quando estiver pronta.";document.getElementById("startChallenge").textContent=started?"Recomeçar um novo ciclo":"Iniciar meu desafio";document.getElementById("challengeCounter").textContent=`${done} de 21 completos`;
 const grid=document.getElementById("challengeDays");grid.innerHTML="";
 for(let i=1;i<=21;i++){let date=null,cls="",status="A INICIAR";if(started){let d=new Date(state.challengeStart+"T12:00:00");d.setDate(d.getDate()+i-1);date=d.toISOString().slice(0,10);if(isDayDone(date)){cls="done";status="CONCLUÍDO"}else if(completedCount(date)>0){cls="partial";status="EM CURSO"}if(date===todayKey())cls+=" current"}const tile=document.createElement("div");tile.className="day-tile "+cls;tile.innerHTML=`<small>DIA</small><b>${String(i).padStart(2,"0")}</b><small>${status}</small>`;grid.appendChild(tile)}
}
function renderHabits(){const host=document.getElementById("manageHabits");host.innerHTML="";document.getElementById("habitTotal").textContent=`${state.habits.length} hábitos`;state.habits.forEach(h=>{const row=document.createElement("div");row.className="manage-row";row.innerHTML=`<span class="habit-name"></span><span class="category-tag"></span><button class="delete-habit" title="Excluir hábito">×</button>`;row.querySelector(".habit-name").textContent=h.name;row.querySelector(".category-tag").textContent=h.category;row.querySelector("button").addEventListener("click",()=>{if(confirm(`Remover "${h.name}" da sua lista?`)){state.habits=state.habits.filter(x=>x.id!==h.id);save();render()}});host.appendChild(row)})}
function renderJournal(){const j=state.journals[todayKey()]||{};["mood","win","tomorrow","gratitude"].forEach(k=>document.getElementById(k).value=j[k]||"");const host=document.getElementById("journalHistory");host.innerHTML="";Object.keys(state.journals).sort().reverse().filter(k=>k!==todayKey()).slice(0,8).forEach(date=>{const j=state.journals[date],item=document.createElement("article");item.className="history-item";const title=document.createElement("b");title.textContent=dateText(date);item.appendChild(title);if(j.mood){const mood=document.createElement("p");mood.textContent=j.mood;item.appendChild(mood)}["win","gratitude"].forEach(k=>{if(j[k]){const p=document.createElement("p");p.textContent=(k==="win"?"Vitória: ":"Gratidão: ")+j[k];item.appendChild(p)}});host.appendChild(item)});if(!host.children.length)host.innerHTML='<p class="muted small">Suas reflexões anteriores aparecerão aqui.</p>'}
function renderArcana(){const xp=state.xp||0,unlocked=Math.min(22,Math.max(1,Math.floor(xp/40)+1));document.getElementById("xpTotal").textContent=xp;document.getElementById("cardCount").textContent=`${unlocked} / 22 reveladas`;document.getElementById("levelName").textContent=unlocked>=18?"Iluminada":unlocked>=10?"Florescendo":unlocked>=5?"Despertando":"Iniciante";const host=document.getElementById("arcanaGrid");host.innerHTML="";arcana.forEach((a,i)=>{const open=i<unlocked,card=document.createElement("div");card.className="arcana-card"+(open?"":" locked");card.innerHTML=`<div class="tarot-inner"><span class="tarot-num"></span><span class="tarot-symbol"></span><span class="tarot-name"></span></div><div class="arcana-caption"></div>`;card.querySelector(".tarot-num").textContent=a[0];card.querySelector(".tarot-symbol").textContent=open?a[2]:"✧";card.querySelector(".tarot-name").textContent=open?a[1].toUpperCase():"CARTA A REVELAR";card.querySelector(".arcana-caption").textContent=open?a[3]:`${Math.max(0,i*40-xp)} pts para revelar`;host.appendChild(card)})}
function renderMap(){const host=document.getElementById("miniMap");host.innerHTML="";const n=doneDays();[1,8,15,21].forEach((v,i)=>{const el=document.createElement("div");el.className="map-node"+(n>=v?" reached":"");el.textContent=["☼","♌","✧","◎"][i];host.appendChild(el)})}

function foodDate(){return document.getElementById("foodEntryDate").value||todayKey()}
function mealsFor(date){return state.meals[date]||(state.meals[date]=[])}
function foodMonth(){return document.getElementById("foodCalendarMonth").value||todayKey().slice(0,7)}
function foodDayTotal(date){return (state.meals[date]||[]).reduce((s,m)=>s+(Number(m.kcal)||0),0)}
function foodHasSugar(date){return (state.meals[date]||[]).some(m=>m.sugar===true)}
function macroForDay(date,key){const meals=state.meals[date]||[];let total=0,complete=true;meals.forEach(m=>{const v=m[key];if(v===null||v===undefined||!Number.isFinite(Number(v)))complete=false;else total+=Number(v)});return {total,complete}}
function renderFoodMacros(date){const defs=[["protein","foodProteinTotal","foodProteinProgress",120],["carbs","foodCarbsTotal","foodCarbsProgress",160],["fat","foodFatTotal","foodFatProgress",42]],meals=state.meals[date]||[];let incomplete=0;defs.forEach(([key,label,bar,target])=>{const r=macroForDay(date,key);if(!r.complete)incomplete++;document.getElementById(label).textContent=r.complete?r.total.toFixed(1).replace(".",",")+" / "+target+" g":"Dados incompletos / "+target+" g";document.getElementById(bar).style.width=r.complete?Math.min(100,r.total/target*100)+"%":"0%"});document.getElementById("foodMacroDataStatus").textContent=!meals.length?"Registre suas refeições para começar.":incomplete?"Algumas refeições não têm todos os macronutrientes; os totais ficam pendentes até completar os dados.":"Totais calculados com os alimentos registrados. Confira os valores da base nutricional."}
function renderFood(){
 const date=foodDate(),meals=mealsFor(date).slice().sort((a,b)=>(a.time||"").localeCompare(b.time||"")),total=meals.reduce((sum,m)=>sum+(Number(m.kcal)||0),0);
 document.getElementById("foodCalories").textContent=Math.round(total).toLocaleString("pt-BR");
 document.getElementById("foodMealCount").textContent=meals.length+" "+(meals.length===1?"refeição":"refeições")+" · "+dateText(date);
 document.getElementById("foodDaySugar").textContent=foodHasSugar(date)?"🍬 Teve doce com açúcar":"♡ Sem doce com açúcar registrado";renderFoodMacros(date);
 const host=document.getElementById("foodMealList");host.innerHTML="";
 if(!meals.length){host.innerHTML='<div class="empty-meals">☼<br><br>Nenhuma refeição registrada neste dia.</div>'}
 meals.forEach(m=>{const item=document.createElement("article");item.className="food-meal-item";if(m.photo){const img=document.createElement("img");img.src=m.photo;img.alt="Foto da refeição";item.appendChild(img)}
 const info=document.createElement("div");info.className="food-meal-info";const type=document.createElement("div");type.className="meal-type";type.textContent=(m.time?m.time+" · ":"")+m.type;const name=document.createElement("h3");name.textContent=m.name;
 const qty=document.createElement("p");qty.textContent=(m.grams?m.grams+" g · ":"")+(m.kcal!==null&&m.kcal!==undefined?Math.round(m.kcal)+" kcal estimadas":"calorias não informadas")+(m.sugar?" · doce com açúcar":"");
 const del=document.createElement("button");del.className="meal-delete";del.textContent="×";del.title="Excluir refeição";del.addEventListener("click",()=>{if(confirm("Excluir este registro alimentar?")){state.meals[date]=state.meals[date].filter(x=>x!==m);save();renderFood()}});
 info.append(type,name,qty);if(m.kcal!==null&&m.kcal!==undefined){const kcal=document.createElement("strong");kcal.textContent=Math.round(m.kcal)+" kcal";info.appendChild(kcal)}item.append(info,del);host.appendChild(item)});
 renderFoodCalendar();renderFasting(date);renderFoodSchedule();
}
function renderFoodSchedule(){
 const defaults={"Café da manhã":"07:30","Lanche da manhã":"10:00","Almoço":"12:30","Lanche da tarde":"15:30","Jantar":"19:00","Ceia":"21:00"};
 if(!state.foodSchedule||typeof state.foodSchedule!=="object")state.foodSchedule={...defaults};
 const host=document.getElementById("foodScheduleFields");host.innerHTML="";
 Object.entries(defaults).forEach(([meal,defaultTime])=>{const label=document.createElement("label");label.textContent=meal;const input=document.createElement("input");input.type="time";input.value=state.foodSchedule[meal]||defaultTime;input.dataset.meal=meal;label.appendChild(input);host.appendChild(label)});
}
function renderFasting(date){
 const box=document.getElementById("foodFastingStatus"),current=(state.meals[date]||[]).filter(m=>m.time).slice().sort((a,b)=>a.time.localeCompare(b.time));
 const prev=new Date(date+"T12:00:00");prev.setDate(prev.getDate()-1);const prevKey=prev.getFullYear()+"-"+String(prev.getMonth()+1).padStart(2,"0")+"-"+String(prev.getDate()).padStart(2,"0");
 const prior=(state.meals[prevKey]||[]).filter(m=>m.time).slice().sort((a,b)=>a.time.localeCompare(b.time));
 if(!current.length||!prior.length){box.textContent="Registre o horário da última refeição de ontem e da primeira refeição deste dia para visualizar o intervalo.";return}
 const [ph,pm]=prior[prior.length-1].time.split(":").map(Number),[ch,cm]=current[0].time.split(":").map(Number);
 const from=new Date(prevKey+"T00:00:00");from.setHours(ph,pm,0,0);const to=new Date(date+"T00:00:00");to.setHours(ch,cm,0,0);let minutes=Math.round((to-from)/60000);
 if(minutes<0){box.textContent="Confira os horários registrados para calcular o intervalo.";return}
 box.textContent="Intervalo entre registros: "+Math.floor(minutes/60)+"h"+String(minutes%60).padStart(2,"0")+" · da última refeição ("+prior[prior.length-1].time+") à primeira ("+current[0].time+"). É apenas um registro de horário, não uma meta.";
}
function renderFoodCalendar(){
 const host=document.getElementById("foodCalendar");host.innerHTML="";const month=foodMonth(),parts=month.split("-").map(Number),year=parts[0],mo=parts[1],first=new Date(year,mo-1,1),days=new Date(year,mo,0).getDate(),offset=first.getDay();
 document.getElementById("foodCalendarLabel").textContent=first.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].forEach(d=>{const el=document.createElement("div");el.className="food-cal-weekday";el.textContent=d;host.appendChild(el)});
 for(let n=0;n<offset;n++){const blank=document.createElement("div");blank.className="food-cal-blank";host.appendChild(blank)}
 for(let day=1;day<=days;day++){const key=year+"-"+String(mo).padStart(2,"0")+"-"+String(day).padStart(2,"0"),records=state.meals[key]||[],cell=document.createElement("button");cell.type="button";cell.className="food-cal-day"+(key===foodDate()?" selected":"")+(records.length?" has-records":"");
 const num=document.createElement("b");num.textContent=day;cell.appendChild(num);const kcal=document.createElement("small");const total=foodDayTotal(key);kcal.textContent=records.length?Math.round(total).toLocaleString("pt-BR")+" kcal":"—";cell.appendChild(kcal);
 if(foodHasSugar(key)){const sugar=document.createElement("span");sugar.className="food-cal-sugar";sugar.textContent="🍬";sugar.title="Doce com açúcar registrado";cell.appendChild(sugar)}
 cell.addEventListener("click",()=>{document.getElementById("foodEntryDate").value=key;renderFood()});host.appendChild(cell)}
}
const reflectionPrompts=["O que estou pronta para deixar ir?","Que parte de mim precisa de mais acolhimento?","O que significa prosperidade para mim neste momento?","Qual pequeno passo me aproximaria da vida que desejo?","Que padrão já não combina com a pessoa que estou me tornando?","Do que eu gostaria de me orgulhar daqui a seis meses?"];
function renderSpiritual(){const entry=state.spiritualReflections?.[todayKey()]||"";document.getElementById("spiritualReflection").value=entry;document.getElementById("newYearIntentions").value=state.newYearIntentions||"";}
document.getElementById("newReflectionPrompt").addEventListener("click",()=>{const current=document.getElementById("reflectionPrompt").textContent;const options=reflectionPrompts.filter(x=>x!==current);document.getElementById("reflectionPrompt").textContent=options[Math.floor(Math.random()*options.length)]});
document.getElementById("saveSpiritualReflection").addEventListener("click",()=>{state.spiritualReflections=state.spiritualReflections||{};state.spiritualReflections[todayKey()]=document.getElementById("spiritualReflection").value.trim();save();document.getElementById("spiritualStatus").textContent="Reflexão salva neste dispositivo.";setTimeout(()=>document.getElementById("spiritualStatus").textContent="",2500)});
document.getElementById("saveNewYearIntentions").addEventListener("click",()=>{state.newYearIntentions=document.getElementById("newYearIntentions").value.trim();save();document.getElementById("newYearStatus").textContent="Suas intenções foram salvas neste dispositivo.";setTimeout(()=>document.getElementById("newYearStatus").textContent="",2500)});

let selectedMealPhoto="";
function updateKcalPreview(){const g=Number(document.getElementById("foodGrams").value)||0,k=Number(document.getElementById("foodKcal100").value);document.getElementById("foodKcalPreview").textContent=Number.isFinite(k)&&k>=0&&g>0?`${Math.round(k*g/100)} kcal`:"— kcal"}
async function searchFood(){
 const query=document.getElementById("foodName").value.trim(),status=document.getElementById("foodSearchStatus"),results=document.getElementById("foodSearchResults");if(!query){status.textContent="Digite o nome de um alimento para pesquisar.";return}
 status.textContent="Pesquisando calorias e macronutrientes...";results.innerHTML="";
 try{const url="https://world.openfoodfacts.org/cgi/search.pl?search_terms="+encodeURIComponent(query)+"&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments";const response=await fetch(url);if(!response.ok)throw Error("Falha na pesquisa");const data=await response.json();
 const products=(data.products||[]).filter(p=>p.product_name&&p.nutriments&&Number.isFinite(Number(p.nutriments["energy-kcal_100g"]??p.nutriments["energy-kcal_value"])));if(!products.length){status.textContent="Não encontramos resultados com calorias disponíveis. Você pode preencher os dados manualmente.";return}
 status.textContent="Escolha o alimento correspondente:";products.slice(0,8).forEach(p=>{const n=p.nutriments,kcal=Number(n["energy-kcal_100g"]??n["energy-kcal_value"]),protein=Number(n.proteins_100g),carbs=Number(n.carbohydrates_100g),fat=Number(n.fat_100g);const b=document.createElement("button");b.type="button";b.className="food-result";const left=document.createElement("b");left.textContent=p.product_name+(p.brands?" · "+p.brands:"");const right=document.createElement("small");right.textContent=Math.round(kcal)+" kcal · P "+(Number.isFinite(protein)?protein.toFixed(1):"—")+" g · C "+(Number.isFinite(carbs)?carbs.toFixed(1):"—")+" g · G "+(Number.isFinite(fat)?fat.toFixed(1):"—")+" g / 100 g";b.append(left,right);b.addEventListener("click",()=>{document.getElementById("foodName").value=p.product_name;document.getElementById("foodKcal100").value=kcal;document.getElementById("foodProtein100").value=Number.isFinite(protein)?protein:"";document.getElementById("foodCarbs100").value=Number.isFinite(carbs)?carbs:"";document.getElementById("foodFat100").value=Number.isFinite(fat)?fat:"";updateKcalPreview();status.textContent="Dados preenchidos. Confira e ajuste a quantidade e os valores se necessário.";results.innerHTML=""});results.appendChild(b)})
 }catch(e){status.textContent="A busca não está disponível agora. Você ainda pode preencher os dados manualmente."}
}
document.getElementById("foodSearchBtn").addEventListener("click",searchFood);
document.getElementById("foodGrams").addEventListener("input",updateKcalPreview);
document.getElementById("foodKcal100").addEventListener("input",updateKcalPreview);
document.getElementById("mealPhoto").addEventListener("change",e=>{
 const file=e.target.files[0];selectedMealPhoto="";document.getElementById("mealPhotoPreview").innerHTML="";if(!file)return;
 if(!file.type.startsWith("image/")){toast("Escolha um arquivo de imagem.");return}
 const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=720,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);selectedMealPhoto=canvas.toDataURL("image/jpeg",.68);document.getElementById("mealPhotoPreview").innerHTML=`<img src="${selectedMealPhoto}" alt="Prévia da refeição">`};img.src=reader.result};reader.readAsDataURL(file)
});
document.getElementById("foodForm").addEventListener("submit",e=>{
 e.preventDefault();const name=document.getElementById("foodName").value.trim(),grams=Number(document.getElementById("foodGrams").value)||0,date=foodDate();const per100=id=>document.getElementById(id).value===""?null:Number(document.getElementById(id).value);const portion=v=>v===null?null:v*grams/100;const kcal=portion(per100("foodKcal100"));mealsFor(date).push({type:document.getElementById("mealType").value,name,grams,kcal,protein:portion(per100("foodProtein100")),carbs:portion(per100("foodCarbs100")),fat:portion(per100("foodFat100")),time:document.getElementById("mealTime").value||"",sugar:document.getElementById("mealSugar").checked,photo:selectedMealPhoto||"",createdAt:new Date().toISOString()});
 save();e.target.reset();document.getElementById("foodGrams").value=100;document.getElementById("foodEntryDate").value=date;document.getElementById("foodSearchStatus").textContent="Pesquisa opcional na base Open Food Facts.";document.getElementById("foodSearchResults").innerHTML="";document.getElementById("mealPhotoPreview").innerHTML="";selectedMealPhoto="";updateKcalPreview();renderFood();renderOverviewCalendar();toast("Refeição registrada. Bom cuidado! ♡")
});
document.getElementById("foodEntryDate").value=todayKey();document.getElementById("foodEntryDate").addEventListener("change",()=>{document.getElementById("foodCalendarMonth").value=foodDate().slice(0,7);renderFood()});
document.getElementById("foodCalendarMonth").value=todayKey().slice(0,7);document.getElementById("foodCalendarMonth").addEventListener("change",renderFoodCalendar);
document.getElementById("foodCalendarPrev").addEventListener("click",()=>{const p=foodMonth().split("-").map(Number),d=new Date(p[0],p[1]-2,1);document.getElementById("foodCalendarMonth").value=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");renderFoodCalendar()});
document.getElementById("foodCalendarNext").addEventListener("click",()=>{const p=foodMonth().split("-").map(Number),d=new Date(p[0],p[1],1);document.getElementById("foodCalendarMonth").value=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");renderFoodCalendar()});
document.getElementById("saveFoodSchedule").addEventListener("click",()=>{state.foodSchedule={};document.querySelectorAll("#foodScheduleFields input").forEach(input=>state.foodSchedule[input.dataset.meal]=input.value);save();toast("Seus horários habituais foram salvos.")});

document.querySelectorAll("[data-page]").forEach(btn=>btn.addEventListener("click",()=>{const page=btn.dataset.page;document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));document.querySelectorAll(".nav-link[data-page]").forEach(n=>n.classList.toggle("active",n.dataset.page===page));document.getElementById("sidebar").classList.remove("open");window.scrollTo(0,0)}));
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("waterPlus").addEventListener("click",()=>{state.water[todayKey()]=(state.water[todayKey()]||0)+(state.bottleSize||600);save();renderWater();toast("Garrafa registrada. Um gesto de cuidado 💧")});
document.getElementById("waterMinus").addEventListener("click",()=>{state.water[todayKey()]=Math.max(0,(state.water[todayKey()]||0)-(state.bottleSize||600));save();renderWater();renderOverviewCalendar()});
document.getElementById("waterGoalBtn").addEventListener("click",()=>{const goal=prompt("Quantas garrafas você quer beber por dia?",state.waterGoal||3);if(goal===null)return;if(!(Number(goal)>0&&Number(goal)<=20)){alert("Informe uma meta entre 1 e 20 garrafas.");return}const size=prompt("Qual é a capacidade da sua garrafa em ml?",state.bottleSize||600);if(size===null)return;if(!(Number(size)>0&&Number(size)<=3000)){alert("Informe uma capacidade válida em ml.");return}state.waterGoal=Number(goal);state.bottleSize=Number(size);save();renderWater();renderOverviewCalendar();toast("Sua meta de hidratação foi atualizada.")});
document.getElementById("startChallenge").addEventListener("click",()=>{if(state.challengeStart&&!confirm("Começar um novo ciclo de 21 dias? Seu histórico anterior continuará salvo, mas o novo desafio começa do zero."))return;state.challengeStart=todayKey();save();render();toast("Sua nova jornada começou. Que floresça! ☼")});
document.getElementById("addHabitForm").addEventListener("submit",e=>{e.preventDefault();const input=document.getElementById("newHabit"),name=input.value.trim();if(!name)return;state.habits.push({id:"h"+Date.now(),name,category:document.getElementById("newCategory").value});input.value="";save();render();toast("Novo hábito adicionado ✧")});
document.getElementById("saveJournal").addEventListener("click",()=>{state.journals[todayKey()]={mood:mood.value,win:win.value.trim(),tomorrow:tomorrow.value.trim(),gratitude:gratitude.value.trim()};save();renderJournal();renderOverviewCalendar();document.getElementById("journalStatus").textContent="Reflexão salva com carinho.";setTimeout(()=>document.getElementById("journalStatus").textContent="",2600)});
document.getElementById("backupBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="my-sun-backup-"+todayKey()+".json";a.click();URL.revokeObjectURL(url);toast("Backup preparado para salvar.")});
document.getElementById("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data.habits||!data.logs)throw Error();if(confirm("Importar este backup? Os dados atuais deste navegador serão substituídos.")){state={...fresh(),...data};save();render();window.dispatchEvent(new Event("mySunStateUpdated"));toast("Backup importado com sucesso.")}}catch(err){alert("Não foi possível importar. Confira se o arquivo é um backup do my sun.")}e.target.value=""});

document.getElementById("overviewPrev").addEventListener("click",()=>{const [y,m]=overviewMonth.split("-").map(Number),d=new Date(y,m-2,1);overviewMonth=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");renderOverviewCalendar()});
document.getElementById("overviewNext").addEventListener("click",()=>{const [y,m]=overviewMonth.split("-").map(Number),d=new Date(y,m,1);overviewMonth=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");renderOverviewCalendar()});
render();
