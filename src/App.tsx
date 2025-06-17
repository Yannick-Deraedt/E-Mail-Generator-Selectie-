// App.tsx — volledig met thema-switch, validation, tooltips, PDF-export, tabel-layout, sticky knop
import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";

const days = ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"];
const playerList = [
  "Jerome Belpaeme","Leon Boone","Wolf Cappan","Leon De Backer","Mateo De Tremerie",
  "Nicolas Desaver","Mauro Dewitte","Aron D'Hoore","Ferran Dhuyvetter","Arthur Germonpré",
  "Lander Helderweirt","Tuur Heyerick","Jef Lambers","Andro Martens","Lukas Onderbeke",
  "Siebe Passchyn","Viktor Poelman","Lav Rajkovic","Moussa Sabir","Mauro Savat",
  "Mattias Smet","Guillaume Telleir","Otis Vanbiervliet","Michiel Van Melkebeke","Rube Verhille",
  "Filemon Verstraete"
];
const reasons = [
  "Blessure","Geschorst","Rust","Schoolverplichting","GU15","Stand‑by GU15",
  "Niet getraind","1x getraind","Niet verwittigd","Vakantie","Ziek","Disciplinair","Andere redenen"
];

export default function App() {
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string,string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string,string>>({});
  const [notesAbsent, setNotesAbsent] = useState<Record<string,string>>({});
  const [responsible, setResponsible] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

  const requiredOK = day && date && time && opponent;

  const togglePlayer = (p:string) => {
    setSelectedPlayers(prev => {
      const u = {...prev};
      p in u ? delete u[p] : u[p] = "1";
      return u;
    });
  };
  const setRug = (p:string,n:string) => setSelectedPlayers(prev=>({...prev,[p]:n}));
  const setReason = (p:string,r:string) => setNonSelectedReasons(prev=>({...prev,[p]:r}));
  const setNote = (p:string,n:string) => setNotesAbsent(prev=>({...prev,[p]:n}));

  const generateEmail = () => {
    const sel = Object.entries(selectedPlayers).sort((a,b)=>+a[1]-+b[1]);
    const selectTbl = sel.map(([p,n])=>`<tr><td style="border:1px solid #ccc;padding:4px;">${n}</td><td style="border:1px solid #ccc;padding:4px;">${p}</td></tr>`).join("");
    const nonSel = playerList.filter(p=>!(p in selectedPlayers));
    const nonTbl = nonSel.map(p=>`<tr><td style="border:1px solid #ccc;padding:4px;">${p}</td><td style="border:1px solid #ccc;padding:4px;">${nonSelectedReasons[p]||"[reden]"}</td><td style="border:1px solid #ccc;padding:4px;">${notesAbsent[p]||""}</td></tr>`).join("");

    const extra = matchType==='Uitwedstrijd'?`<p style="background:#d0ebff;padding:8px;border-radius:6px;">🚗 <strong>Carpool:</strong> samen vanaf Parking KVE, tenzij >15 min omweg.</p>`:"";

    const html = `
      <div style="font-family:arial;padding:16px;">
        <h2 style="background:#004080;color:#fff;padding:8px;border-radius:6px;">Beste ouders & spelers U15</h2>
        <p>Aanstaande <strong>${day}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent}</strong>.</p>
        <div style="border:1px solid #ccc;border-radius:6px;margin:8px 0;padding:8px;">
          <h3 style="background:#e3e3e3;padding:4px;">⚽ Wedstrijddetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Datum</strong></td><td>${date}</td></tr>
            <tr><td><strong>Start wedstrijd</strong></td><td>${time}</td></tr>
            <tr><td><strong>Terrein</strong></td><td>${field}</td></tr>
            <tr><td><strong>Adres</strong></td><td>${address}</td></tr>
            ${matchType==='Uitwedstrijd'?`<tr><td><strong>Aankomst bij ${opponent}</strong></td><td>${arrivalTimeOpponent}</td></tr>`:""}
          </table>
        </div>
        <div style="border:1px solid #ccc;border-radius:6px;margin:8px 0;padding:8px;">
          <h3 style="background:#e3e3e3;padding:4px;">📍 Verzameldetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Plaats</strong></td><td>${gatheringPlace}</td></tr>
            <tr><td><strong>Uur</strong></td><td>${gatheringTime}</td></tr>
          </table>
        </div>
        <div style="border:1px solid #ccc;border-radius:6px;margin:8px 0;padding:8px;">
          <h3 style="background:#e3e3e3;padding:4px;">✅ Selectie</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th style="border:1px solid #ccc;padding:4px;">Nr</th><th style="border:1px solid #ccc;padding:4px;">Naam</th></tr>
            ${selectTbl}
          </table>
        </div>
        <div style="border:1px solid #ccc;border-radius:6px;margin:8px 0;padding:8px;">
          <h3 style="background:#e3e3e3;padding:4px;">🚫 Niet geselecteerd</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th>Naam</th><th>Reden</th><th>Opmerking</th></tr>${nonTbl}
          </table>
        </div>
        <div style="border:1px solid #ccc;border-radius:6px;margin:8px 0;padding:8px;">
          <h3 style="background:#e3e3e3;padding:4px;">🧺 Verantwoordelijke</h3><p>${responsible}</p>
        </div>
        ${extra}
        <p>Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
      </div>`;
    setPreviewHTML(html);
  };

  const exportPDF = () => {
    if (!cardRef.current) return;
    html2pdf()
      .from(cardRef.current)
      .set({margin:0.2,filename:`U15_${day}_${opponent}.pdf`,html2canvas:{scale:2}})
      .save();
  };

  return (
    <div className={`${theme==="dark"?"dark":""} min-h-screen bg-gray-900 text-white p-4`}>
      <button
        className="absolute top-4 right-4 p-2 rounded bg-gray-700 hover:bg-gray-600"
        onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}
      >
        {theme==="dark"?"🌞 Light":"🌙 Dark"}
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Email Generator</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dag, type, datum */}
          <label className="block">
            <span>Dag*</span>
            <select value={day} onChange={e=>setDay(e.target.value)}
              title="Dag van de wedstrijd" className="mt-1 p-2 w-full rounded bg-gray-800">
              <option value="">-- Kies een dag --</option>
              {days.map(d=> <option key={d}>{d}</option>)}
            </select>
          </label>

          <label className="block">
            <span>Type wedstrijd*</span>
            <select value={matchType} onChange={e=>setMatchType(e.target.value)}
              title="Thuis- of Uitwedstrijd" className="mt-1 p-2 w-full rounded bg-gray-800">
              <option>Thuiswedstrijd</option>
              <option>Uitwedstrijd</option>
            </select>
          </label>

          <label className="block">
            <span>Datum*</span>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              title="Datum van de wedstrijd" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block">
            <span>Tijd*</span>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
              title="Starttijd" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block md:col-span-2">
            <span>Tegenstander*</span>
            <input type="text" value={opponent} onChange={e=>setOpponent(e.target.value)}
              title="Naam tegenstander" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block">
            <span>Terrein</span>
            <input type="text" value={field} onChange={e=>setField(e.target.value)}
              title="Naam van het terrein" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block">
            <span>Adres</span>
            <input type="text" value={address} onChange={e=>setAddress(e.target.value)}
              title="Adres van het terrein" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          {matchType==="Uitwedstrijd"&&<label className="block">
            <span>Aankomst bij tegenstander</span>
            <input type="time" value={arrivalTimeOpponent} onChange={e=>setArrivalTimeOpponent(e.target.value)}
              title="Aankomsttijd bij tegenstander" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>}

          <label className="block">
            <span>Verzamelplaats</span>
            <input type="text" value={gatheringPlace} disabled title="Automatisch ingevuld" 
              className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block">
            <span>Verzameltijd</span>
            <input type="time" value={gatheringTime} onChange={e=>setGatheringTime(e.target.value)}
              title="Tijd van verzamelen" className="mt-1 p-2 w-full rounded bg-gray-800"/>
          </label>

          <label className="block">
            <span>Verantwoordelijke</span>
            <select value={responsible} onChange={e=>setResponsible(e.target.value)}
              title="Wie staat in voor fruit/was" className="mt-1 p-2 w-full rounded bg-gray-800">
              <option value="">-- Kies speler --</option>
              {playerList.map(p=> <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        {/* Spelersselectie */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Wedstrijdselectie</h2>
          <input type="text" placeholder="Zoek speler..." value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 mb-3"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {playerList.filter(p=>p.toLowerCase().includes(searchTerm.toLowerCase())).map(p=>(
              <div key={p} className={`flex items-center gap-2 p-2 rounded cursor-pointer
                ${p in selectedPlayers?"bg-green-800":"bg-gray-800"}`}
                onClick={()=>togglePlayer(p)}
              >
                <input type="checkbox" checked={p in selectedPlayers} readOnly/>
                <span className="flex-1">{p}</span>
                {p in selectedPlayers&&(
                  <input type="number" min="1" max="99" value={selectedPlayers[p]}
                    onChange={e=>setRug(p,e.target.value)}
                    className="w-12 p-1 text-black rounded"/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Niet-geselecteerden */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Niet‑geselecteerden & Opmerking</h2>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {playerList.filter(p=>!(p in selectedPlayers)).map(p=>(
              <div key={p} className="flex gap-2 items-center">
                <span className="flex-1">{p}</span>
                <select value={nonSelectedReasons[p]||""} onChange={e=>setReason(p,e.target.value)}
                  className="p-1 rounded bg-gray-800">
                  <option value="">Reden</option>
                  {reasons.map(r=><option key={r}>{r}</option>)}
                </select>
                <input type="text" placeholder="Opmerking" value={notesAbsent[p]||""}
                  onChange={e=>setNote(p,e.target.value)}
                  className="p-1 rounded bg-gray-700 flex-1"/>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky knoppen onderaan */}
        <div className="sticky bottom-4 left-0 bg-gray-900 py-3 flex gap-4 justify-center">
          <button disabled={!requiredOK} onClick={generateEmail}
            className={`px-5 py-2 rounded font-semibold 
              ${requiredOK?"bg-blue-600 hover:bg-blue-500":"bg-blue-400 cursor-not-allowed"}`}>
            ✉️ Genereer e-mail
          </button>
          <button onClick={exportPDF}
            className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500">
            📄 Download PDF
          </button>
        </div>

        {/* Voorvertoning */}
        {previewHTML && (
          <div ref={cardRef} id="preview" 
            className="bg-white text-black p-4 rounded shadow-lg mt-6 max-w-3xl mx-auto">
            <div dangerouslySetInnerHTML={{__html: previewHTML}}/>
          </div>
        )}
      </div>
    </div>
  );
}
