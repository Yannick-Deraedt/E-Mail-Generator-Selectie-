// App.tsx — volledige en verbeterde versie met nette layout
import { useState, useEffect } from "react";
import "./index.css";

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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");
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
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1] || "999") - parseInt(b[1] || "999"));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br/>");
    const nonSelectedText = playerList.filter(p => !(p in selectedPlayers)).map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");
    const extraMededeling = matchType === 'Uitwedstrijd' ?
      `<p><span style='background-color: #d0ebff; font-weight: bold;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</span></p>`
      : "";

    const email = `
      <div style='font-family: Arial, sans-serif; padding: 1rem;'>
        <h2 style='font-size: 1.2rem; font-weight: bold;'>Beste ouders en spelers van de U15,</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>
        <div style='margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;'>
          <h3>⚽ Wedstrijdinfo</h3>
          <ul>
            <li><strong>Wedstrijd:</strong> ${matchType === 'Thuiswedstrijd' ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</li>
            <li><strong>Datum:</strong> ${date || "[datum]"}</li>
            <li><strong>Uur:</strong> ${time || "[uur]"}</li>
            <li><strong>Terrein:</strong> ${field || "[terrein]"}</li>
            <li><strong>Adres:</strong> ${address || "[adres]"}</li>
            ${matchType === 'Uitwedstrijd' ? `<li><strong>Aankomst:</strong> ${arrivalTimeOpponent || "[uur]"}</li>` : ""}
          </ul>
        </div>
        <div style='margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;'>
          <h3>📍 Verzamelen</h3>
          <ul>
            <li><strong>Plaats:</strong> ${gatheringPlace}</li>
            <li><strong>Uur:</strong> ${gatheringTime || "[uur]"}</li>
          </ul>
        </div>
        <div style='margin-top:1rem;'>
          <h3>✅ Selectie</h3><p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>
        <div style='margin-top:1rem;'>
          <h3>🚫 Niet geselecteerd</h3><p>${nonSelectedText || "Geen info"}</p>
        </div>
        <div style='margin-top:1rem;'>
          <h3>🧺 Verantwoordelijke</h3><p>${responsible || "[naam]"}</p>
        </div>
        <div style='margin-top:1rem;'>
          <h3>📣 Opmerking</h3>
          <p><span style='background-color: yellow;'>Vergeet jullie ID niet mee te nemen!</span></p>
          ${extraMededeling}
        </div>
        <p style='margin-top: 2rem;'>Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
      </div>`;

    setPreview(email);
  };

  const handleInputBlock = (label: string, children: JSX.Element) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-4 max-w-5xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Email Generator</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {handleInputBlock("Dag", (
          <select className="w-full p-2 rounded bg-gray-800" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Kies een dag</option>
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
        ))}
        {handleInputBlock("Type wedstrijd", (
          <select className="w-full p-2 rounded bg-gray-800" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        ))}
        {handleInputBlock("Datum", (
          <input type="date" className="w-full p-2 rounded bg-gray-800" value={date} onChange={(e) => setDate(e.target.value)} />
        ))}
        {handleInputBlock("Aanvangsuur", (
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={time} onChange={(e) => setTime(e.target.value)} />
        ))}
        {handleInputBlock("Tegenstander", (
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Tegenstander" />
        ))}
        {handleInputBlock("Terrein", (
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={field} onChange={(e) => setField(e.target.value)} placeholder="Terrein" />
        ))}
        {handleInputBlock("Adres", (
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres" />
        ))}
        {matchType === "Uitwedstrijd" && handleInputBlock("Aankomsttijd uitploeg", (
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={arrivalTimeOpponent} onChange={(e) => setArrivalTimeOpponent(e.target.value)} />
        ))}
        {handleInputBlock("Verzamelplaats", (
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={gatheringPlace} onChange={(e) => setGatheringPlace(e.target.value)} />
        ))}
        {handleInputBlock("Verzameltijd", (
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={gatheringTime} onChange={(e) => setGatheringTime(e.target.value)} />
        ))}
        {handleInputBlock("Verantwoordelijke", (
          <select className="w-full p-2 rounded bg-gray-800" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
            <option value="">Verantwoordelijke</option>
            {playerList.map((p) => <option key={p}>{p}</option>)}
          </select>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">Wedstrijdselectie</h2>
      <input type="text" className="w-full mb-2 p-2 rounded bg-gray-800" placeholder="Zoek speler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <div className="grid md:grid-cols-2 gap-2">
        {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
          <div key={p} className="flex gap-2 items-center">
            <input type="checkbox" checked={p in selectedPlayers} onChange={() => togglePlayer(p)} />
            <label className="flex-1 text-sm">{p}</label>
            {p in selectedPlayers && (
              <select className="bg-gray-800 p-1 rounded text-sm" value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)}>
                {[...Array(25)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Niet-geselecteerden en reden</h2>
      {playerList.filter(p => !(p in selectedPlayers)).map((p) => (
        <div key={p} className="flex gap-2 items-center mb-1">
          <label className="flex-1 text-sm">{p}</label>
          <select className="bg-gray-800 p-1 rounded text-sm" value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)}>
            <option value="">Reden</option>
            {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ))}

      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-6" onClick={generateEmail}>Genereer e-mail</button>
      {preview && (
        <>
          <div id="preview" className="bg-white p-4 border rounded shadow text-black mt-4" dangerouslySetInnerHTML={{ __html: preview }} />
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded" onClick={copyToClipboard}>📋 Kopieer e-mail</button>
        </>
      )}
    </div>
  );
}
