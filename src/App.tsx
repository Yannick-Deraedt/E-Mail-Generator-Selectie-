// App.tsx
import { useState, useEffect } from "react";

const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const playerList = [ /* jouw lijst blijft identiek */ ];
const reasons = [ /* jouw redenenlijst blijft identiek */ ];

export default function App() {
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
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

  const togglePlayer = (p: string) => {
    setSelectedPlayers(prev => {
      const next = { ...prev };
      next[p] ? delete next[p] : next[p] = "1";
      return next;
    });
  };
  const setRugnummer = (p: string, n: string) => setSelectedPlayers(prev => ({ ...prev, [p]: n }));
  const setReason = (p: string, r: string) => setNonSelectedReasons(prev => ({ ...prev, [p]: r }));

  const copyToClipboard = async () => {
    const el = document.querySelector("#preview");
    if (el && navigator.clipboard?.write) {
      const html = (el as HTMLElement).innerHTML;
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" })
      })]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else alert("Kopiëren niet ondersteund, gebruik Ctrl+C.");
  };

  const generateEmail = () => {
    const sel = Object.entries(selectedPlayers).sort((a,b)=>+a[1]-+b[1]);
    const selText = sel.map(([p,n])=>`${n}. ${p}`).join("<br/>");
    const nonSel = playerList.filter(p => !(p in selectedPlayers))
      .map(p=>`- ${p} – ${nonSelectedReasons[p]||"[reden]"}`).join("<br/>");
    const extra = matchType==="Uitwedstrijd"
      ? `<p style="background:#d0ebff;padding:8px;border-radius:6px;"><strong>🚗 Carpool:</strong> samen vanaf Parking KVE, tenzij >15min omweg.</p>`
      : "";

    const html = `
      <div style="font-family:Arial;line-height:1.4;padding:16px;">
        <div style="border:2px solid #004080;border-radius:8px;padding:16px;">
          <h2 style="margin:0;color:#004080;">Beste ouders & spelers U15</h2>
          <p>Aanstaande <strong>${day}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent}</strong>.</p>

          <div style="border:1px solid #ccc;border-radius:6px;margin:16px 0;padding:8px;">
            <h3 style="margin:0 0 8px;">⚽ Wedstrijddetails</h3>
            <ul style="margin:0;padding-left:18px;">
              <li><strong>Wedstrijd:</strong> ${matchType==="Thuiswedstrijd"?`KVE vs ${opponent}`:`${opponent} vs KVE`}</li>
              <li><strong>Datum:</strong> ${date}</li>
              <li><strong>Start wedstrijd:</strong> ${time}</li>
              <li><strong>Terrein:</strong> ${field}</li>
              <li><strong>Adres:</strong> ${address}</li>
              ${matchType==="Uitwedstrijd" && `<li><strong>Aankomst bij ${opponent}:</strong> ${arrivalTimeOpponent}</li>`}
            </ul>
          </div>

          <div style="border:1px solid #ccc;border-radius:6px;margin:16px 0;padding:8px;">
            <h3 style="margin:0 0 8px;">📍 Verzameldetails</h3>
            <ul style="margin:0;padding-left:18px;">
              <li><strong>Plaats:</strong> ${gatheringPlace}</li>
              <li><strong>Uur:</strong> ${gatheringTime}</li>
            </ul>
          </div>

          <div><h3 style="margin:16px 0 4px;">✅ Selectie</h3><p>${selText||"Nog geen spelers geselecteerd."}</p></div>
          <div><h3 style="margin:16px 0 4px;">🚫 Niet geselecteerd</h3><p>${nonSel||"Geen info"}</p></div>
          <div><h3 style="margin:16px 0 4px;">🧺 Verantwoordelijke</h3><p>${responsible}</p></div>
          <div><h3 style="margin:16px 0 4px;">📣 Opmerking</h3>
            <p><span style="background:yellow;">Vergeet jullie ID niet mee te nemen!</span></p>
            ${extra}
          </div>
          <p style="margin-top:16px;">Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
        </div>
      </div>`;
    setPreview(html);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Email Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Wedstrijddetails invulvelden */}
        {[["Dag", day, setDay, "select", days], ["Type", matchType, setMatchType, "select", ["Thuiswedstrijd","Uitwedstrijd"]],
          ["Datum", date, setDate, "date"], ["Uur", time, setTime, "time"],
          ["Tegenstander", opponent, setOpponent, "text"], ["Terrein", field, setField, "text"],
          ["Adres", address, setAddress, "text"],
          ...(matchType==="Uitwedstrijd" ? [["Aankomst bij tegenstander", arrivalTimeOpponent, setArrivalTimeOpponent, "time"]] : []),
          ["Verzamelplaats", gatheringPlace, ()=>{}, "text", , true],
          ["Verzameltijd", gatheringTime, setGatheringTime, "time"],
          ["Verantwoordelijke", responsible, setResponsible, "select", playerList]
        ].map(([label, val, setter, type, options=[], disabled]) => (
          <label key={label} className="block">
            <span>{label}</span>
            {type === "select" ? (
              <select disabled={disabled} value={val as string} onChange={e=>(setter as any)(e.target.value)}
                className="mt-1 w-full p-2 bg-gray-800 rounded">
                <option value="">-- Kies --</option>
                {options.map(o=><option key={o as string}>{o}</option>)}
              </select>
            ) : (
              <input type={type} disabled={disabled}
                value={val as string} onChange={e=>(setter as any)(e.target.value)}
                className="mt-1 w-full p-2 bg-gray-800 rounded"/>
            )}
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Wedstrijdselectie</h2>
        <input type="text" placeholder="Zoek speler..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
          className="w-full mb-3 p-2 bg-gray-800 rounded"/>
        <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
          {playerList.filter(p=>p.toLowerCase().includes(searchTerm.toLowerCase())).map(p=>(
            <div key={p} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${p in selectedPlayers?"bg-green-800":"bg-gray-800"}`}
              onClick={()=>togglePlayer(p)}>
              <input type="checkbox" checked={p in selectedPlayers} readOnly/>
              <span className="flex-1">{p}</span>
              {p in selectedPlayers && (
                <input type="number" min="1" max="99" value={selectedPlayers[p]}
                  onChange={e=>setRugnummer(p,e.target.value)}
                  className="w-12 p-1 text-black rounded"/>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Niet geselecteerden & reden</h2>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {playerList.filter(p=>!(p in selectedPlayers)).map(p=>(
            <div key={p} className="flex items-center gap-2">
              <span className="flex-1">{p}</span>
              <select value={nonSelectedReasons[p]||""} onChange={e=>setReason(p,e.target.value)}
                className="p-1 bg-gray-800 rounded">
                <option value="">Reden</option>
                {reasons.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={generateEmail}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">📧 Genereer e-mail</button>
        <button onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500">📋 Kopieer e-mail</button>
      </div>

      {preview && (
        <div id="preview" className="bg-white text-black p-4 rounded shadow-xl max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: preview }} />
      )}
    </div>
  );
}
