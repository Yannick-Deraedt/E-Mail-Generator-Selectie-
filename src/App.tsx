// App.tsx
import { useState, useEffect } from "react";
import "./index.css"; // zorg dat Tailwind geladen is

const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const playerList = [
  "Jerome Belpaeme", "Leon Boone", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver", "Mauro Dewitte", "Aron D'Hoore", "Ferran Dhuyvetter", "Arthur Germonpré", 
  "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers", "Andro Martens", "Lukas Onderbeke",
  "Siebe Passchyn", "Viktor Poelman", "Lav Rajkovic", "Moussa Sabir", "Mauro Savat", 
  "Mattias Smet", "Guillaume Telleir", "Otis Vanbiervliet", "Michiel Van Melkebeke", "Rube Verhille",
  "Filemon Verstraete"
];
const reasons = [
  "Blessure", "Geschorst", "Rust", "Schoolverplichting", "GU15", "Stand-by GU15", 
  "Niet getraind", "1x getraind", "Niet verwittigd", "Vakantie", "Ziek", "Disciplinair", "Andere redenen"
];

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

  const togglePlayer = (player: string) => {
    setSelectedPlayers((prev) => {
      const updated = { ...prev };
      if (player in updated) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const setRugnummer = (player: string, number: string) => {
    setSelectedPlayers((prev) => ({ ...prev, [player]: number }));
  };

  const setReason = (player: string, reason: string) => {
    setNonSelectedReasons((prev) => ({ ...prev, [player]: reason }));
  };

  const copyToClipboard = async () => {
    const previewElement = document.querySelector("#preview");
    if (previewElement && navigator.clipboard && window.ClipboardItem) {
      const html = previewElement.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" })
        })
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else {
      alert("Kopiëren met layout wordt niet ondersteund in deze browser. Gebruik Ctrl+C.");
    }
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br/>");
    const nonSelectedText = playerList.filter(p => !(p in selectedPlayers)).map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");
    const extraMededeling = matchType === 'Uitwedstrijd'
      ? `<p style='background:#d0ebff;padding:10px;border-radius:5px;margin-top:8px;'><strong>🚗 Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</p>`
      : "";

    const html = `
      <div style='font-family: Arial, sans-serif; padding: 16px; line-height: 1.6;'>
        <h2 style="margin-bottom:0;">Beste ouders en spelers van de U15,</h2>
        <p style="margin-top:4px;">Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>
        
        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <h3>⚽ Wedstrijddetails</h3>
          <ul>
            <li><strong>Wedstrijd:</strong> ${matchType === 'Thuiswedstrijd' ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</li>
            <li><strong>Datum:</strong> ${date || "[datum]"}</li>
            <li><strong>Start wedstrijd:</strong> ${time || "[uur]"}</li>
            <li><strong>Terrein:</strong> ${field || "[terrein]"}</li>
            <li><strong>Adres:</strong> ${address || "[adres]"}</li>
            ${matchType === 'Uitwedstrijd' && opponent ? `<li><strong>Aankomst bij ${opponent}:</strong> ${arrivalTimeOpponent || "[uur]"}</li>` : ""}
          </ul>
        </div>

        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <h3>📍 Verzameldetails</h3>
          <ul>
            <li><strong>Plaats:</strong> ${gatheringPlace}</li>
            <li><strong>Uur:</strong> ${gatheringTime || "[uur]"}</li>
          </ul>
        </div>

        <div style="margin-top: 16px;">
          <h3>✅ Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style="margin-top: 16px;">
          <h3>🚫 Niet geselecteerd</h3>
          <p>${nonSelectedText || "Geen info."}</p>
        </div>

        <div style="margin-top: 16px;">
          <h3>🧺 Verantwoordelijke</h3>
          <p>${responsible || "[verantwoordelijke]"}</p>
        </div>

        <div style="margin-top: 16px;">
          <h3>📣 Opmerking</h3>
          <p><span style="background: yellow;">Vergeet jullie ID niet mee te nemen!</span></p>
          ${extraMededeling}
        </div>

        <p style="margin-top: 32px;">Met sportieve groeten,<br/>
        Yannick Deraedt<br/>
        Trainer U15 KVE Drongen</p>
      </div>
    `;
    setPreview(html);
  };
  return (
    <div className="p-4 max-w-6xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📧 E-mail Generator U15</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <label className="block">
          <span>📅 Dag</span>
          <select className="w-full p-2 mt-1 rounded bg-gray-800" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">-- Kies een dag --</option>
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>

        <label className="block">
          <span>⚔️ Type wedstrijd</span>
          <select className="w-full p-2 mt-1 rounded bg-gray-800" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </label>

        <label className="block">
          <span>📆 Datum</span>
          <input type="date" className="w-full p-2 mt-1 rounded bg-gray-800" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label className="block">
          <span>⏰ Start wedstrijd</span>
          <input type="time" className="w-full p-2 mt-1 rounded bg-gray-800" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>

        <label className="block">
          <span>🏟️ Tegenstander</span>
          <input type="text" className="w-full p-2 mt-1 rounded bg-gray-800" placeholder="Tegenstander" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        </label>

        <label className="block">
          <span>🗺️ Terrein</span>
          <input type="text" className="w-full p-2 mt-1 rounded bg-gray-800" placeholder="Terrein" value={field} onChange={(e) => setField(e.target.value)} />
        </label>

        <label className="block">
          <span>📍 Adres</span>
          <input type="text" className="w-full p-2 mt-1 rounded bg-gray-800" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        {matchType === "Uitwedstrijd" && (
          <label className="block">
            <span>🕑 Aankomst uur bij tegenstander</span>
            <input type="time" className="w-full p-2 mt-1 rounded bg-gray-800" value={arrivalTimeOpponent} onChange={(e) => setArrivalTimeOpponent(e.target.value)} />
          </label>
        )}

        <label className="block">
          <span>📌 Verzamelplaats</span>
          <input type="text" className="w-full p-2 mt-1 rounded bg-gray-800" value={gatheringPlace} readOnly />
        </label>

        <label className="block">
          <span>🕖 Verzameltijd</span>
          <input type="time" className="w-full p-2 mt-1 rounded bg-gray-800" value={gatheringTime} onChange={(e) => setGatheringTime(e.target.value)} />
        </label>

        <label className="block">
          <span>🧺 Verantwoordelijke</span>
          <select className="w-full p-2 mt-1 rounded bg-gray-800" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
            <option value="">-- Kies --</option>
            {playerList.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">✅ Selectie spelers</h2>
        <input type="text" className="w-full mb-3 p-2 bg-gray-800 rounded" placeholder="Zoek speler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${p in selectedPlayers ? "bg-green-800" : "bg-gray-800"}`} onClick={() => togglePlayer(p)}>
              <input type="checkbox" checked={p in selectedPlayers} readOnly />
              <span className="flex-1">{p}</span>
              {p in selectedPlayers && (
                <input type="number" min="1" max="99" value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)} className="w-12 p-1 text-black rounded" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">🚫 Niet geselecteerden + reden</h2>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {playerList.filter(p => !(p in selectedPlayers)).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="flex-1">{p}</span>
              <select value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)} className="p-1 bg-gray-800 rounded">
                <option value="">Reden</option>
                {reasons.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={generateEmail} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">📧 Genereer e-mail</button>
        <button onClick={copyToClipboard} className="px-4 py-2 bg-green-600 rounded hover:bg-green-500">📋 Kopieer e-mail</button>
      </div>

      {preview && (
        <div id="preview" className="bg-white text-black p-6 rounded shadow-xl max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: preview }} />
      )}
    </div>
  );
}
