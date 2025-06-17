// Volledige correcte App.tsx code met optimalisaties
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
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [searchTerm, setSearchTerm] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

  const togglePlayer = (player: string) => {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (updated[player]) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const setRugnummer = (player: string, nummer: string) =>
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));

  const setReason = (player: string, reason: string) =>
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));

  const copyToClipboard = async () => {
    const el = document.querySelector("#preview");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) })
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  const generateEmail = () => {
    const selected = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selected.map(([name, num]) => `
      <div style="margin-bottom:4px;">
        <span style="background-color:#e2e6ea;padding:2px 6px;border-radius:4px;margin-right:6px;font-weight:bold;">#${num}</span>${name}
      </div>
    `).join("");

    const nonSelectedText = playerList
      .filter(p => !(p in selectedPlayers))
      .map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");

    const extraNote = matchType === "Uitwedstrijd"
      ? `<p style="background-color: #d0ebff; padding: 10px; border-left: 4px solid #339af0; border-radius: 4px; margin-top: 1rem;">
          <strong>Carpool:</strong><br/>
          We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. 
          Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. 
          Laat dit wel weten via de WhatsApp-poll.
        </p>` : "";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 1rem;">
        <h2>Beste ouders en spelers van de U15,</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>

        <div style="border:1px solid #ccc; border-radius:6px; padding:1rem; margin-top:1rem; background:#f9f9f9;">
          <h3>Wedstrijddetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Wedstrijd:</strong></td><td>${matchType === "Thuiswedstrijd" ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</td></tr>
            <tr><td><strong>Datum:</strong></td><td>${date || "[datum]"}</td></tr>
            <tr><td><strong>Start wedstrijd:</strong></td><td>${time || "[tijd]"}</td></tr>
            <tr><td><strong>Terrein:</strong></td><td>${field || "[terrein]"}</td></tr>
            <tr><td><strong>Adres:</strong></td><td>${address || "[adres]"}</td></tr>
            ${matchType === "Uitwedstrijd" && opponent ? `<tr><td><strong>Aankomst bij ${opponent}:</strong></td><td>${arrivalTimeOpponent || "[uur]"}</td></tr>` : ""}
          </table>
        </div>

        <div style="border:1px solid #ccc; border-radius:6px; padding:1rem; margin-top:1rem; background:#f9f9f9;">
          <h3>Verzameldetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Plaats:</strong></td><td>${gatheringPlace}</td></tr>
            <tr><td><strong>Uur:</strong></td><td>${gatheringTime || "[uur]"}</td></tr>
          </table>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Selectie</h3>
          ${selectedText || "Nog geen spelers geselecteerd."}
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Niet geselecteerd</h3>
          <p>${nonSelectedText || "Geen info beschikbaar."}</p>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Verantwoordelijk voor was, fruit & chocomelk</h3>
          <p>${responsible || "[naam]"}</p>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Opmerking</h3>
          <p><span style="background-color: yellow;">${remark}</span></p>
          ${extraNote}
        </div>

        <p style="margin-top: 2rem;">Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen<br/><br/></p>
      </div>
    `;

    setPreview(html);
  };

  return (
  <div className="flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto text-white bg-gray-900 min-h-screen">
    {/* Inputsectie */}
    <div className="w-full md:w-1/2">
      <h1 className="text-3xl font-bold mb-6">E-mail Generator</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Dag</label>
          <select className="w-full p-2 rounded bg-gray-800" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Kies een dag</option>
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1">Type wedstrijd</label>
          <select className="w-full p-2 rounded bg-gray-800" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Datum</label>
          <input type="date" className="w-full p-2 rounded bg-gray-800" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Start wedstrijd</label>
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Tegenstander</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Terrein</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={field} onChange={(e) => setField(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Adres</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        {matchType === "Uitwedstrijd" && (
          <div>
            <label className="block mb-1">Aankomst bij tegenstander</label>
            <input type="time" className="w-full p-2 rounded bg-gray-800" value={arrivalTimeOpponent} onChange={(e) => setArrivalTimeOpponent(e.target.value)} />
          </div>
        )}

        <div>
          <label className="block mb-1">Verzamelplaats</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={gatheringPlace} onChange={(e) => setGatheringPlace(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Verzameltijd</label>
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={gatheringTime} onChange={(e) => setGatheringTime(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Verantwoordelijk voor was, fruit & chocomelk</label>
          <select className="w-full p-2 rounded bg-gray-800" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
            <option value="">Kies een verantwoordelijke</option>
            {playerList.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Opmerking</label>
          <input type="text" className="w-full p-2 rounded bg-yellow-100 text-black" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2 mt-6">Wedstrijdselectie</h2>
      <input type="text" placeholder="Zoek speler..." className="w-full p-2 mb-2 rounded bg-gray-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
          <div key={p} className={`flex items-center justify-between p-2 rounded ${p in selectedPlayers ? "bg-green-300 text-black" : "bg-gray-800"}`}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={p in selectedPlayers} onChange={() => togglePlayer(p)} />
              <span>{p}</span>
            </label>
            {p in selectedPlayers && (
              <select value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)} className="bg-white text-black p-1 rounded w-16">
                {[...Array(25)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Niet-geselecteerden & reden</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {playerList.filter(p => !(p in selectedPlayers)).map(p => (
          <div key={p} className="flex items-center gap-2">
            <span className="flex-1">{p}</span>
            <select className="bg-gray-800 p-1 rounded" value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)}>
              <option value="">Reden</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <button onClick={generateEmail} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white">
          Genereer e-mail
        </button>
        {preview && (
          <button onClick={copyToClipboard} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white">
            Kopieer e-mail
          </button>
        )}
      </div>
    </div>

    {/* Previewsectie */}
    <div className="w-full md:w-1/2">
      {preview && (
        <div id="preview" className="bg-white text-black p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]" dangerouslySetInnerHTML={{ __html: preview }} />
      )}
    </div>
  </div>
);
