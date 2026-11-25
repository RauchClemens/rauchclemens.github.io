const base = "https://lernportal-jps-eigenstaendig.onrender.com";
const area = document.querySelector("#area");
const program = document.querySelector("#program");
const year = document.querySelector("#year");
const result = document.querySelector("#result");
function selectOptions(select, prompt, values) {
  select.replaceChildren(new Option(prompt, ""), ...values.map(([value, label]) => new Option(label, value)));
  select.disabled = values.length === 0;
}
function element(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
function link(title, href) { const el = element("a", title + " →"); el.href = href; result.append(el); }
function label(value,group) { return group === "technik" ? value + ". Schuljahr" : Number(value) >= 10 ? value + ". Klasse" : String(value); }
try {
  const response = await fetch("./programme.json?v=2");
  if (!response.ok) throw Error();
  const groups = await response.json();
  selectOptions(area,"Bildungsbereich auswählen",groups.map(g=>[g.id,g.name]));
  function refresh(level) {
    const group = groups.find(g=>g.id===area.value);
    const directYears = group?.years;
    program.closest("label").hidden = Boolean(directYears);
    if (level <= 1) selectOptions(program,group ? "Bildungsgang auswählen" : "Erst Bereich wählen",(group?.programs ?? []).map(p=>[p.name,p.name]));
    const item = group?.programs?.find(p=>p.name===program.value);
    const years = directYears ?? item?.years ?? [];
    if (level <= 2) selectOptions(year,years.length ? "Jahrgang auswählen" : "Erst Bildungsgang wählen",years.map(v=>[v,label(v,group.id)]));
    result.replaceChildren(element("h3",item ? item.name : group ? group.name : "Dein Unterricht"));
    const yearSelected = Boolean(year.value && (item || directYears));
    const electrical = group?.id === "elektro" || group?.id === "mechatronik";
    if (yearSelected) result.append(element("p",label(year.value,group.id)));
    if (group?.id === "bv" && (!item || item.years.some(stufe => stufe === "BIK" || stufe === "BVJ"))) {
      link("Berufswahl-Tool · Drei Berufsideen finden · ohne Anmeldung","./berufswahl.html");
      if (!item || item.years.includes("BVJ")) {
        link("BVJ-Rechenwerkstatt · Mathe im Berufsalltag · ohne Anmeldung","./bvj-rechenwerkstatt.html");
      }
    } else if (!yearSelected) {
      result.append(element("p",!group ? "Wähle deinen Bildungsbereich." : !item && !directYears ? "Wähle einen Beruf oder Bildungsgang." : "Wähle deinen Jahrgang."));
      return;
    } else if(electrical && year.value==="10") {
      link("Lichtschaltungen · Schaltlabor ohne Anmeldung","./lichtschaltungen.html");
    } else if(electrical && year.value==="11") {
      link("Schutzmaßnahmen-Board · frei zugänglich","./schutzmassnahmen.html");
      link("TT-System",base+"/klassen/klasse-11/faecher/ie/tt-system");
      link("TN-System · Arbeitsheft ohne Anmeldung","./tn-system.html");
    } else if(electrical && ["12","13"].includes(year.value)) {
      link("Schaltwerk · Betriebstechnik",base+"/klassen/klasse-"+year.value+"/faecher/bt/schaltwerk");
    } else result.append(element("p","Für diese Auswahl sind noch keine öffentlichen Materialien eingetragen."));
    if (yearSelected) link("Zu meiner Klasse",base+"/anmelden");
  }
  area.addEventListener("change",()=>refresh(1)); program.addEventListener("change",()=>refresh(2)); year.addEventListener("change",()=>refresh(3));
} catch { result.replaceChildren(element("p","Der Katalog konnte nicht geladen werden. Bitte lade die Seite erneut.")); }
