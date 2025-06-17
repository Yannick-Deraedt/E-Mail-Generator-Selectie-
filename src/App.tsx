// App.tsx
import { useState, useEffect } from "react";

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
  const [preview, setPreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

  const togglePlayer = (player: string) => {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (player in updated) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const setRugnummer = (player: string, number: string) => {
    setSelectedPlayers(prev => ({ ...prev, [player]: number }));
  };

  const setReason = (player: string, reason: string) => {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  };
  const generateEmail = () => {
    const selectedSorted = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedList = selectedSorted.map(([p, n]) => `${n}. ${p}`).join("<br/>");
    const nonSelectedList = playerList.filter(p => !(p in selectedPlayers))
      .map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");

    const extra = matchType === "Uitwedstrijd"
      ? `<p><span style='background-color:#d0ebff; font-weight:bold;'>Samenkomst op Parking KVE. Indien >15 min omweg, mag rechtstreeks met melding in WhatsApp.</span></p>`
      : "";

    const html = `
      <div style='font-family:Arial,sans-serif;line-height:1.5;padding:16px;'>
        <h2>Beste ouders & spelers van de U15</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>

        <div style="border:1px solid #ccc;padding:12px;border-radius:8px;margin-top:12px;">
          <h3>⚽ Wedstrijddetails</h3>
          <ul style="padding-left:18px;">
            <li><strong>Wedstrijd:</strong> ${matchType === "Thuiswedstrijd" ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</li>
            <li><strong>Datum:</strong> ${date || "[datum]"}</li>
            <li><strong>Start wedstrijd:</strong> ${time || "[uur]"}</li>
            <li><strong>Terrein:</strong> ${field || "[terrein]"}</li>
            <li><strong>Adres:</strong> ${address || "[adres]"}</li>
            ${matchType === "Uitwedstrijd" ? `<li><strong>Aankomst bij ${opponent}:</strong> ${arrivalTimeOpponent || "[uur]"}</li>` : ""}
          </ul>
        </div>

        <div style="border:1px solid #ccc;padding:12px;border-radius:8px;margin-top:12px;">
          <h3>📍 Verzameldetails</h3>
          <ul style="padding-left:18px;">
            <li><strong>Plaats:</strong> ${gatheringPlace}</li>
            <li><strong>Uur:</strong> ${gatheringTime || "[uur]"}</li>
          </ul>
        </div>

        <div><h3>✅ Selectie</h3><p>${selectedList || "Nog geen spelers geselecteerd."}</p></div>
        <div><h3>🚫 Niet geselecteerd</h3><p>${nonSelectedList || "Geen info"}</p></div>
        <div><h3>🧺 Verantwoordelijke</h3><p>${responsible || "[naam]"}</p></div>
        <div><h3>📣 Opmerking</h3>
          <p><span style="background-color:yellow;">Vergeet jullie ID niet mee te nemen!</span></p>
          ${extra}
        </div>
        <p style="margin-top:12px;">Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
      </div>`;

    setPreview(html);
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
      alert("Deze functie wordt niet ondersteund. Gebruik Ctrl+C.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Email Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div><label>Dag</label>
          <select className="w-full bg-gray-800 rounded p-2" value={day} onChange={e => setDay(e.target.value)}>
            <option value="">Kies een dag</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div><label>Type wedstrijd</label>
          <select className="w-full bg-gray-800 rounded p-2" value={matchType} onChange={e => setMatchType(e.target.value)}>
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </div>

        <div><label>Datum</label>
          <input type="date" className="w-full bg-gray-800 rounded p-2" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div><label>Start wedstrijd</label>
          <input type="time" className="w-full bg-gray-800 rounded p-2" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <div><label>Tegenstander</label>
          <input type="text" className="w-full bg-gray-800 rounded p-2" placeholder="Tegenstander" value={opponent} onChange={e => setOpponent(e.target.value)} />
        </div>

        <div><label>Terrein</label>
          <input type="text" className="w-full bg-gray-800 rounded p-2" placeholder="Terrein" value={field} onChange={e => setField(e.target.value)} />
        </div>

        <div><label>Adres</label>
          <input type="text" className="w-full bg-gray-800 rounded p-2" placeholder="Adres" value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        {matchType === "Uitwedstrijd" && (
          <div><label>Aankomst bij tegenstander</label>
            <input type="time" className="w-full bg-gray-800 rounded p-2" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} />
          </div>
        )}

        <div><label>Verzamelplaats</label>
          <input type="text" className="w-full bg-gray-800 rounded p-2" value={gatheringPlace} onChange={e => setGatheringPlace(e.target.value)} />
        </div>

        <div><label>Verzameltijd</label>
          <input type="time" className="w-full bg-gray-800 rounded p-2" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} />
        </div>

        <div><label>Verantwoordelijke</label>
          <select className="w-full bg-gray-800 rounded p-2" value={responsible} onChange={e => setResponsible(e.target.value)}>
            <option value="">Kies een speler</option>
            {playerList.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Wedstrijdselectie</h2>
        <input
          type="text"
          placeholder="Zoek speler..."
          className="w-full p-2 rounded bg-gray-800 mb-3"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
            <div
              key={player}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                player in selectedPlayers ? "bg-green-800" : "bg-gray-800"
              }`}
              onClick={() => togglePlayer(player)}
            >
              <input type="checkbox" checked={player in selectedPlayers} readOnly />
              <span className="flex-1">{player}</span>
              {player in selectedPlayers && (
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={selectedPlayers[player]}
                  onChange={e => setRugnummer(player, e.target.value)}
                  className="w-12 p-1 rounded text-black"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Niet-geselecteerden & reden</h2>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {playerList.filter(p => !(p in selectedPlayers)).map(player => (
            <div key={player} className="flex items-center gap-2">
              <span className="flex-1">{player}</span>
              <select
                value={nonSelectedReasons[player] || ""}
                onChange={e => setReason(player, e.target.value)}
                className="p-1 bg-gray-800 rounded"
              >
                <option value="">Reden</option>
                {reasons.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          onClick={generateEmail}
        >
          📧 Genereer e-mail
        </button>

        <button
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
          onClick={copyToClipboard}
          disabled={!preview}
        >
          📋 Kopieer e-mail
        </button>
      </div>

      {preview && (
        <div
          id="preview"
          className="bg-white text-black mt-8 p-4 rounded shadow-xl"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
    </div>
  );
}
