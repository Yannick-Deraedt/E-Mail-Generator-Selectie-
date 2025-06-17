// ✅ Volledige App.tsx met alle functies en jouw gewenste aanpassingen
// ❌ Emojis zijn nu volledig verwijderd voor een professionelere uitstraling

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
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  const generateEmail = () => {
    const selectedList = Object.entries(selectedPlayers)
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map(([name, number]) => `<li><strong>#${number}</strong> - ${name}</li>`)
      .join("");

    const nonSelectedList = playerList
      .filter(p => !(p in selectedPlayers))
      .map(p => `<li>${p} – ${nonSelectedReasons[p] || "Geen reden opgegeven"}</li>`)
      .join("");

    const opponentArrivalText = matchType === "Uitwedstrijd" && arrivalTimeOpponent
      ? `<p><strong>Aankomst bij tegenstander:</strong> ${arrivalTimeOpponent}</p>`
      : "";

    const carpoolText = matchType === "Uitwedstrijd"
      ? `<p><strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</p>`
      : "";

    const html = `
      <div style="font-family:sans-serif;line-height:1.6">
        <h2 style="margin-bottom:4px">Wedstrijddetails</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td><strong>Dag:</strong></td><td>${day}</td></tr>
          <tr><td><strong>Type:</strong></td><td>${matchType}</td></tr>
          <tr><td><strong>Datum:</strong></td><td>${date}</td></tr>
          <tr><td><strong>Start wedstrijd:</strong></td><td>${time}</td></tr>
          <tr><td><strong>Tegenstander:</strong></td><td>${opponent}</td></tr>
          <tr><td><strong>Terrein:</strong></td><td>${field}</td></tr>
          <tr><td><strong>Adres:</strong></td><td>${address}</td></tr>
        </table>

        <h2 style="margin-top:20px;margin-bottom:4px">Verzameldetails</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td><strong>Verzamelen:</strong></td><td>${gatheringTime} aan ${gatheringPlace}</td></tr>
          ${opponentArrivalText}
        </table>

        ${carpoolText}

        <h2 style="margin-top:20px;margin-bottom:4px">Selectie</h2>
        <ul style="padding-left:16px;background:#f0f0f0;border-radius:6px;padding:10px">${selectedList}</ul>

        <h2 style="margin-top:20px;margin-bottom:4px">Niet geselecteerd</h2>
        <ul style="padding-left:16px;background:#f8d7da;border-radius:6px;padding:10px">${nonSelectedList}</ul>

        <p style="margin-top:20px"><strong>Verantwoordelijke voor was, fruit & chocomelk:</strong> ${responsible || "-"}</p>
        <p><strong>Opmerking:</strong> ${remark}</p>
      </div>
    `;

    setPreview(html);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">E-mail Generator</h1>

      {/* Formuliergedeelte */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block mb-1">Dag</label>
          <select className="w-full p-2 rounded bg-gray-800" value={day} onChange={e => setDay(e.target.value)}>
            <option value="">Kies een dag</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1">Type wedstrijd</label>
          <select className="w-full p-2 rounded bg-gray-800" value={matchType} onChange={e => setMatchType(e.target.value)}>
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Datum</label>
          <input type="date" className="w-full p-2 rounded bg-gray-800" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Start wedstrijd</label>
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Tegenstander</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={opponent} onChange={e => setOpponent(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Terrein</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={field} onChange={e => setField(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Adres</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        {matchType === "Uitwedstrijd" && (
          <div>
            <label className="block mb-1">Aankomst bij tegenstander</label>
            <input type="time" className="w-full p-2 rounded bg-gray-800" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} />
          </div>
        )}

        <div>
          <label className="block mb-1">Verzamelplaats</label>
          <input type="text" className="w-full p-2 rounded bg-gray-800" value={gatheringPlace} onChange={e => setGatheringPlace(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Verzameltijd</label>
          <input type="time" className="w-full p-2 rounded bg-gray-800" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Verantwoordelijk voor was, fruit & chocomelk</label>
          <select className="w-full p-2 rounded bg-gray-800" value={responsible} onChange={e => setResponsible(e.target.value)}>
            <option value="">Kies een verantwoordelijke</option>
            {playerList.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block mb-1">Opmerking (bv. ID meenemen)</label>
          <input type="text" className="w-full p-2 rounded bg-yellow-200 text-black" value={remark} onChange={e => setRemark(e.target.value)} />
        </div>
      </div>
        ))}
   </div>

      {/* Spelerselectie */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Selectie</h2>
        <input type="text" placeholder="Zoek speler..." className="mb-2 p-2 rounded bg-gray-800 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
            <div key={player} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
              <input type="checkbox" checked={selectedPlayers[player] !== undefined} onChange={() => togglePlayer(player)} />
              <span className="flex-1">{player}</span>
              {selectedPlayers[player] !== undefined && (
                <input type="text" placeholder="#" className="w-12 p-1 rounded text-black" value={selectedPlayers[player]} onChange={e => setRugnummer(player, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Niet-geselecteerden */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Niet geselecteerd</h2>
        {playerList.filter(p => !(p in selectedPlayers)).map(player => (
          <div key={player} className="flex items-center gap-2 mb-1">
            <span className="w-1/2">{player}</span>
            <select className="flex-1 p-1 rounded bg-gray-800" value={nonSelectedReasons[player] || ""} onChange={e => setReason(player, e.target.value)}>
              <option value="">Reden</option>
              {reasons.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Actieknoppen */}
      <div className="sticky bottom-0 bg-gray-900 py-4 z-10 flex gap-4 border-t border-gray-700">
        <button onClick={generateEmail} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Genereer e-mail</button>
        <button onClick={copyToClipboard} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Kopieer e-mail</button>
      </div>

      {/* Preview */}
      <div id="preview" className="bg-white text-black p-4 rounded mt-6">
        <h2 className="text-xl font-bold mb-2">Voorbeeld e-mail</h2>
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
