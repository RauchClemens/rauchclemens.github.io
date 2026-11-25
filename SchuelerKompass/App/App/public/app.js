'use strict';
const key = 'schuelerkompass.journal.v1';
const main = document.querySelector('main');
const statusBox = document.querySelector('#status');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty = () => ({records:{}, goals:[], journal:[], reminder:''});
const localDate = (d = new Date()) => [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const displayDate = (day, options) => new Date(day+'T12:00:00').toLocaleDateString('de-DE', options ?? {weekday:'long',day:'numeric',month:'long'});
function monday() {
  const d = new Date();
  d.setDate(d.getDate() - (d.getDay()+6)%7);
  return localDate(d);
}
function valid(raw) {
  const s = JSON.parse(raw);
  if (!s || typeof s.records!=='object' || !s.records || !Array.isArray(s.goals) || !Array.isArray(s.journal)) throw Error('Speicherformat');
  return s;
}
let state = empty(), storage, permanent = false, storageError = false;
try {
  permanent = localStorage.getItem(key) !== null;
  storage = permanent ? localStorage : sessionStorage;
  const raw = storage.getItem(key);
  if (raw) state = valid(raw);
} catch { storageError = true }
let toastTimer;
function notice(text) {
  statusBox.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>statusBox.textContent='',6000);
}
function change(fn) {
  if (storageError) { notice('Speicher nicht verfügbar. Prüfe die Einstellungen.'); return false }
  try {
    const raw = storage.getItem(key);
    const next = raw ? valid(raw) : empty();
    fn(next);
    storage.setItem(key, JSON.stringify(next));
    state = next;
    return true;
  } catch { notice('Speichern fehlgeschlagen. Prüfe den freien Speicher deines Geräts.'); return false }
}
function link(route, text, cls = '') { return `<a class="${cls}" href="#${route}">${text}</a>` }
function labelDay() {return displayDate(localDate())}
function totalPoints() {
  return Object.values(state.records).flatMap(Object.values).reduce((n,x)=>n+x.points,0) + state.journal.length*15;
}
function header(kicker,title,sub='') {
  return `<div class="page-heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>`;
}
function weeklyGoals() {
  const goals=state.goals.filter(g=>g.week===monday());
  return `<section class="panel"><div class="section-heading"><h2>Mein Wochenziel</h2><span class="muted">Ab ${displayDate(monday(),{day:'numeric',month:'short'})}</span></div>
    ${goals.map(g=>`<label class="goal"><input type="checkbox" data-goal="${esc(g.id)}" ${g.done?'checked':''}><span>${esc(g.text)}</span></label>`).join('')}
    <form id="goal-form"><label for="goal">Was möchtest du diese Woche ausprobieren?</label><div class="form-row"><input id="goal" maxlength="160" required placeholder="z. B. in der Pause nach draußen gehen"><button class="secondary">Ziel anlegen</button></div></form></section>`;
}
function home() {
  const today=state.records[localDate()] ?? {};
  const cards=Object.entries(themen).map(([id,t])=>link('runde/'+id,
    `<span class="topic-icon" aria-hidden="true">${t.icon}</span><span><strong>${t.name}</strong><small>${t.intro}</small></span><span class="arrow" aria-label="${today[id]?'Abgeschlossen':'Öffnen'}">${today[id]?'✓':'↗'}</span>`,'topic '+id)).join('');
  return `<section class="hero"><div><p class="eyebrow">${labelDay()}</p><h1>Mein Tagesrückblick</h1><p>Wie war dein Tag? Such dir ein Thema aus.</p><div class="progress-dots" aria-hidden="true">${Object.keys(themen).map(id=>`<i class="${today[id]?'on':''}"></i>`).join('')}</div><small>${Object.keys(today).length} von 4 Themen abgeschlossen</small></div><img class="hero-compass" src="kompass-512.png" alt=""></section>
    <section><div class="section-heading"><h2>Meine Reflexionen</h2><span class="muted">Je 4 Fragen</span></div><div class="topics">${cards}</div></section>
    <div class="two-col"><section class="panel journal-card"><p class="eyebrow">Persönliches Tagebuch</p><h2>Das bin ich heute</h2><p>Welche Stärke hast du heute gezeigt?</p>${link('journal','Gedanken festhalten →','text-link')}</section>
    <section class="panel"><p class="eyebrow">Mein Fortschritt</p><h2>${totalPoints()} Punkte</h2><p>Level ${1+Math.floor(totalPoints()/100)} · Noch ${100-totalPoints()%100} Punkte bis zum nächsten Level.</p>${link('statistik','Statistik ansehen →','text-link')}</section></div>
    ${weeklyGoals()}<footer>${link('optionen',permanent?'Auf diesem Gerät gespeichert':'Aktuell nur in diesem Tab')} · <a href="datenschutz.html">Datenschutz</a></footer>`;
}
let draft, entered=0;
function stopClock() {
  if (!draft || !entered) return;
  draft.seconds[draft.step] += Math.min(120,Math.max(0,(Date.now()-entered)/1000));
  entered=0;
}
function startClock() { if(draft && !document.hidden && !draft.tip && !draft.noteStep && !entered) entered=Date.now() }
document.addEventListener('visibilitychange',()=>document.hidden?stopClock():startClock());
function round(id) {
  const t=themen[id];
  if (!t) return home();
  if (!draft || draft.id!==id) {
    const day=localDate(), old=state.records[day]?.[id];
    draft={id,day,step:0,tip:false,values:old?.values.slice()??Array(4).fill(null),seconds:old?.seconds?.slice()??Array(4).fill(0),note:old?.note??''};
  }
  const i=draft.step, [question,answers,tip]=t.fragen[i];
  if(draft.tip) return header(t.name,'Ein Tipp für dich')+`<section class="panel reader"><p class="tip-text">${tip}</p><button class="primary" data-act="advance">${i===3?'Zur Notiz':'Nächste Frage'} →</button></section>`;
  if(draft.noteStep) return header(t.name,'Was nimmst du mit?')+`<form id="round-form" class="panel reader"><label for="note">Deine Gedanken (freiwillig)</label><textarea id="note" maxlength="1200" rows="5" placeholder="Das ist mir heute aufgefallen …">${esc(draft.note)}</textarea><div class="actions"><button type="button" class="secondary" data-act="step-back">Zurück</button><button class="primary">Reflexion speichern</button></div></form>`;
  startClock();
  const value=draft.values[i];
  return header(t.name,`Frage ${i+1} von 4`)+`<section class="panel reader"><progress max="4" value="${i+1}" aria-label="Frage ${i+1} von 4"></progress><h2 id="question">${question}</h2>
    <output id="answer" for="range" aria-live="polite">${value===null?'Noch keine Antwort':answers[value]}</output>
    <input type="range" id="range" min="0" max="4" step="1" value="${value??2}" aria-labelledby="question" aria-valuetext="${value===null?'Noch keine Antwort':answers[value]}">
    <div class="scale"><span>${answers[0]}</span><span>${answers[4]}</span></div><div class="answers" aria-label="Antwort auswählen">${answers.map((a,j)=>`<button type="button" data-value="${j}" aria-pressed="${value===j}">${a}</button>`).join('')}</div>
    <div class="actions"><button class="secondary" data-act="step-back">Zurück</button><button class="primary" data-act="tip">Weiter →</button></div></section>`;
}
function historyView() {
  const days=[...new Set([...Object.keys(state.records),...state.journal.map(j=>j.day)])].sort().reverse();
  const entries=days.map(day=>{
    const rows=Object.entries(state.records[day]??{}).map(([id,r])=>{
      const t=themen[id]; if(!t)return '';
      return `<details><summary>${t.name} · ${r.points} Punkte</summary><ul>${r.values.map((v,i)=>`<li>${t.fragen[i][0]} <strong>${v===null?'Ausgelassen':t.fragen[i][1][v]}</strong></li>`).join('')}</ul>${r.note?`<p class="entry">${esc(r.note)}</p>`:''}</details>`;
    }).join('');
    const notes=state.journal.filter(j=>j.day===day).map(j=>`<p class="entry"><strong>Das bin ich heute</strong><br>${esc(j.text)}</p>`).join('');
    return `<section class="panel"><h2>${displayDate(day,{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</h2>${rows}${notes}</section>`;
  }).join('');
  return header('Meine Einträge','Verlauf')+(entries||`<div class="panel"><h2>Hier beginnt dein Rückblick</h2><p>Deine gespeicherten Reflexionen und Tagebucheinträge erscheinen hier.</p>${link('heute','Thema auswählen →','text-link')}</div>`);
}
function statistics() {
  const days=Object.keys(state.records), counts=Object.keys(themen).map(id=>days.filter(d=>state.records[d][id]).length);
  return header('Mein Fortschritt','Statistik')+`<div class="metrics"><div><strong>${totalPoints()}</strong>Punkte</div><div><strong>${counts.reduce((n,x)=>n+x,0)}</strong>Reflexionen</div><div><strong>${state.journal.length}</strong>Texte</div></div>
    <section class="panel"><h2>Meine Themen</h2>${Object.values(themen).map((t,i)=>`<div class="stat-row"><label for="stat-${i}">${t.name}</label><meter id="stat-${i}" value="${counts[i]}" max="${Math.max(1,...counts)}"></meter><strong>${counts[i]}</strong></div>`).join('')}
    <p>Eine gewählte Antwort zählt 5 Punkte. Ab 15 Sekunden aktiver Fragezeit kommt ein Punkt dazu, ab 30 Sekunden ein zweiter. Eine Notiz zur beantworteten Runde bringt 5 Punkte. Die gewählte Antwort hat keinen Einfluss auf die Punkte.</p></section>`;
}
function journal() {
  return header('Persönliches Tagebuch','Das bin ich heute','Was ist dir gelungen? Wofür bist du dankbar?')+`<form class="panel reader" id="journal-form"><label for="thought">Mein Gedanke</label><textarea required minlength="20" maxlength="2000" rows="6" id="thought"></textarea><p>Ab 20 Zeichen kannst du deinen Eintrag speichern und erhältst 15 Punkte.</p><button class="primary">Gedanken speichern</button></form>`;
}
const nativePlugin=()=>window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.LocalNotifications : null;
function options() {
  return header('SchülerKompass','Einstellungen')+`<section class="panel"><h2>Meine Daten</h2><p>${permanent?'Deine Einträge bleiben in diesem Browserprofil oder in dieser App gespeichert.':'Deine Einträge bleiben für diesen Tab erhalten. Auf deinem eigenen Gerät kannst du sie für spätere Tage behalten.'} Wer dieses Profil mitbenutzt, kann sie öffnen.</p>
    ${permanent?'':'<button class="secondary" data-act="persist">Auf meinem Gerät behalten</button>'} <button class="secondary" data-act="reset">Meine Daten löschen</button></section>
    <form id="reminder-form" class="panel"><h2>Tageserinnerung</h2><p>${nativePlugin()?'Dein Gerät kann dich täglich an den Rückblick erinnern.':'Lade einen täglichen Termin herunter und öffne ihn in deiner Kalender-App. Dort kannst du die Erinnerung ändern oder löschen.'}</p><label for="time">Uhrzeit</label><input id="time" type="time" required value="${esc(state.reminder||'17:00')}"><div class="actions"><button class="primary">${nativePlugin()?'Erinnerung einstellen':'Kalenderdatei laden'}</button>${nativePlugin()?'<button type="button" class="secondary" data-act="alarm-off">Ausschalten</button>':''}</div></form>
    <section class="panel"><h2>Hilfe &amp; Datenschutz</h2><p>Support und Datenschutz · Clemens Rauch</p><a class="text-link" href="mailto:clemens.kg@online.de">clemens.kg@online.de</a><p><a href="datenschutz.html">Datenschutzerklärung lesen</a></p></section>`;
}
function render(focus=false) {
  stopClock();
  const [route='heute',id]=location.hash.slice(1).split('/');
  if(route!=='runde')draft=null;
  let page;
  if(route==='runde' && Object.hasOwn(themen,id)) page=round(id);
  else page=({verlauf:historyView,statistik:statistics,journal,optionen:options})[route]?.()??home();
  main.innerHTML=page;
  if(storageError) main.insertAdjacentHTML('afterbegin','<p class="panel" role="alert">Der Gerätespeicher ist nicht verfügbar oder beschädigt. In den Einstellungen kannst du die App-Daten zurücksetzen.</p>');
  document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+(route||'heute'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  document.title=(main.querySelector('h1')?.textContent??'Heute')+' · SchülerKompass';
  if(focus){window.scrollTo(0,0);main.focus({preventScroll:true})}
}
function selectAnswer(v) {
  if(!draft)return;
  draft.values[draft.step]=v;
  const answer=themen[draft.id].fragen[draft.step][1][v];
  const slider=document.querySelector('#range'); slider.value=v; slider.setAttribute('aria-valuetext',answer);
  document.querySelector('#answer').textContent=answer;
  document.querySelectorAll('[data-value]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.value)===v));
}
async function reminder(time) {
  const [hour,minute]=time.split(':').map(Number), p=nativePlugin();
  if(p){
    const perm=await p.requestPermissions();
    if(perm.display!=='granted')throw Error('Erlaube Mitteilungen in den Geräteeinstellungen, um die Erinnerung zu nutzen.');
    await p.schedule({notifications:[{id:4101,title:'SchülerKompass',body:'Zeit für deinen Tagesrückblick.',isExactNotification:false,schedule:{on:{hour,minute},repeats:true,allowWhileIdle:true}}]});
  } else {
    const first=new Date();first.setHours(hour,minute,0,0);if(first<=new Date())first.setDate(first.getDate()+1);
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const start=localDate(first).replaceAll('-','')+'T'+time.replace(':','')+'00';
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SchuelerKompass//DE','BEGIN:VEVENT','UID:tagesrueckblick@schuelerkompass.local','DTSTAMP:'+stamp,'DTSTART:'+start,'DURATION:PT5M','RRULE:FREQ=DAILY','SUMMARY:SchülerKompass – Tagesrückblick','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Zeit für deinen Tagesrückblick','END:VALARM','END:VEVENT','END:VCALENDAR',''];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='SchuelerKompass-Erinnerung.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  if(change(s=>s.reminder=time)){render();notice(p?'Tageserinnerung eingestellt.':'Kalenderdatei erstellt. Öffne sie zum Übernehmen.')}
}
main.addEventListener('input',e=>{
  if(e.target.id==='range')selectAnswer(Number(e.target.value));
  if(e.target.id==='note'&&draft)draft.note=e.target.value;
});
main.addEventListener('change',e=>{
  if(e.target.dataset.goal){
    const ok=change(s=>{const g=s.goals.find(g=>g.id===e.target.dataset.goal);if(g)g.done=e.target.checked});
    if(!ok)e.target.checked=!e.target.checked;
  }
});
main.addEventListener('click',async e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.hasAttribute('data-value')){selectAnswer(Number(b.dataset.value));return}
  switch(b.dataset.act){
    case 'tip':stopClock();draft.tip=true;render(true);break;
    case 'advance':draft.tip=false;if(draft.step===3)draft.noteStep=true;else draft.step++;render(true);break;
    case 'step-back':stopClock();if(draft.noteStep)draft.noteStep=false;else if(draft.step>0)draft.step--;else {location.hash='heute';break}render(true);break;
    case 'persist':
      try{if(localStorage.getItem(key)!==null){notice('Dieses Gerät enthält bereits ein Journal. Lade die Seite neu.');break}
        localStorage.setItem(key,JSON.stringify(state));sessionStorage.removeItem(key);storage=localStorage;permanent=true;render();notice('Dein Rückblick bleibt auf diesem Gerät.')}
      catch{notice('Dauerhaftes Speichern ist auf diesem Gerät nicht möglich.')}break;
    case 'reset':
      if(!confirm('Alle SchülerKompass-Einträge, Ziele und gespeicherten Einstellungen in diesem Browserprofil oder in dieser App löschen?'))break;
      try{if(nativePlugin())await nativePlugin().cancel({notifications:[{id:4101}]});
        localStorage.removeItem(key);sessionStorage.removeItem(key);permanent=false;storage=sessionStorage;storageError=false;state=empty();draft=null;render();notice('Deine App-Daten wurden gelöscht.')}
      catch{notice('Löschen fehlgeschlagen. Prüfe die Website- oder App-Einstellungen deines Geräts.')}break;
    case 'alarm-off':
      try{await nativePlugin().cancel({notifications:[{id:4101}]});if(change(s=>s.reminder='')){render();notice('Erinnerung ausgeschaltet.')}}
      catch{notice('Die Erinnerung konnte nicht ausgeschaltet werden.')}break;
  }
});
main.addEventListener('submit',async e=>{
  e.preventDefault();
  if(e.target.id==='round-form'&&draft){
    const d=draft;const note=d.note.trim();
    const base=d.values.reduce((n,v,i)=>n+(v===null?0:5+Math.min(2,Math.floor(d.seconds[i]/15))),0);
    const record={values:d.values,seconds:d.seconds.map(Math.round),note,points:base+(base&&note?5:0)};
    if(change(s=>{(s.records[d.day]??={})[d.id]=record})){draft=null;location.hash='heute';notice('Reflexion gespeichert · '+record.points+' Punkte.')}
  } else if(e.target.id==='goal-form'){
    const text=document.querySelector('#goal').value.trim();if(!text)return;
    if(change(s=>s.goals.push({id:crypto.randomUUID(),week:monday(),text,done:false}))){render();notice('Wochenziel gespeichert.')}
  } else if(e.target.id==='journal-form'){
    const text=document.querySelector('#thought').value.trim();if(text.length<20){notice('Schreibe mindestens 20 Zeichen.');return}
    if(change(s=>s.journal.push({day:localDate(),text}))){location.hash='verlauf';notice('Gedanke gespeichert · 15 Punkte.')}
  } else if(e.target.id==='reminder-form'){
    try{await reminder(document.querySelector('#time').value)}catch(error){notice(error.message||'Erinnerung konnte nicht gespeichert werden.')}
  }
});
window.addEventListener('storage',e=>{
  if(e.key!==key||e.storageArea!==localStorage||!permanent)return;
  if(!e.newValue){state=empty();storage=sessionStorage;permanent=false;draft=null;location.hash='heute';render();return}
  try{state=valid(e.newValue);if(!draft)render()}catch{notice('Die Daten konnten nicht geladen werden.')}
});
window.addEventListener('hashchange',()=>render(true));
render();
if('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.() && ['https:','http:'].includes(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{});

