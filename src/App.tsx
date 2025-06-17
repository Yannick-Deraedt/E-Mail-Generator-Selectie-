// ✅ Volledige App.tsx met alle functies en jouw gewenste aanpassingen
// ✅ Verbeterde UI met dropdowns voor rugnummers en redenen
// ✅ Alle redenopties terug toegevoegd (inclusief GU15, stand-by GU15, ...)
// ✅ Verbeterde layout met tabellen en onder elkaar voor mobiel

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

const jerseyNumbers = Array.from({ length: 99 }, (_, i) => (i + 1).toString());
const nonSelectionReasons = [
  "Geblesseerd", "Ziek", "Afwezig", "Rust", "Op vakantie",
  "GU15", "Stand-by GU15", "1x getraind", "Schoolverplichtingen",
  "Te laat afgemeld/niet verwittigd", "Geschorst", "Andere reden"
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
      ? `<tr><td><strong>Aankomst bij tegenstander:</strong></td><td>${arrivalTimeOpponent}</td></tr>`
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
          ${opponentArrivalText}
        </table>

        <h2 style="margin-top:20px;margin-bottom:4px">Verzameldetails</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td><strong>Verzamelen:</strong></td><td>${gatheringTime} aan ${gatheringPlace}</td></tr>
        </table>


        ${carpoolText}

        <h2 style="margin-top:20px;margin-bottom:4px">Selectie</h2>
        <ul style="padding-left:16px;background:#e0f7fa;border-radius:6px;padding:10px">${selectedList}</ul>

        <h2 style="margin-top:20px;margin-bottom:4px">Niet geselecteerd</h2>
        <ul style="padding-left:16px;background:#ffe0e0;border-radius:6px;padding:10px">${nonSelectedList}</ul>

        <p style="margin-top:20px"><strong>Verantwoordelijke voor was, fruit & chocomelk:</strong> ${responsible || "-"}</p>
        <p><strong>Opmerking:</strong> ${remark}</p>
      </div>
    `;

    setPreview(html);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">E-mail Generator</h1>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="block text-sm font-medium">Type wedstrijd</span>
          <select value={matchType} onChange={e => setMatchType(e.target.value)} className="text-black w-full p-1 rounded">
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Dag</span>
          <select value={day} onChange={e => setDay(e.target.value)} className="text-black w-full p-1 rounded">
            <option value="">Kies een dag</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Datum</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Startuur</span>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Tegenstander</span>
          <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Terrein</span>
          <input type="text" value={field} onChange={e => setField(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Adres</span>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Verzameluur</span>
          <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        {matchType === "Uitwedstrijd" && (
          <label className="block">
            <span className="block text-sm font-medium">Aankomstuur bij tegenstander</span>
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="text-black w-full p-1 rounded" />
          </label>
        )}
        <label className="block">
          <span className="block text-sm font-medium">Verantwoordelijke (was, fruit & chocomelk)</span>
          <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Opmerking</span>
          <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="text-black w-full p-1 rounded" />
        </label>

        <h2 className="text-xl font-bold mt-6 mb-2">Selectie spelers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {playerList.map(player => (
            <div key={player} className="flex items-center gap-2">
              <input type="checkbox" checked={player in selectedPlayers} onChange={() => togglePlayer(player)} />
              <span>{player}</span>
              {player in selectedPlayers ? (
                <select
                  className="ml-auto text-black px-2 py-1 rounded"
                  value={selectedPlayers[player]}
                  onChange={e => setRugnummer(player, e.target.value)}
                >
                  {jerseyNumbers.map(nr => (
                    <option key={nr} value={nr}>{nr}</option>
                  ))}
                </select>
              ) : (
                <select
                  className="ml-auto text-black px-2 py-1 rounded"
                  value={nonSelectedReasons[player] || ""}
                  onChange={e => setReason(player, e.target.value)}
                >
                  <option value="">Reden</option>
                  {nonSelectionReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button onClick={generateEmail} className="mt-4 bg-blue-600 px-4 py-2 rounded">Genereer e-mail</button>
        <button onClick={copyToClipboard} className="mt-2 bg-green-600 px-4 py-2 rounded">📋 Kopieer e-mail</button>

        <h2 className="text-xl font-bold mt-6 mb-2">Preview</h2>
        <div id="preview" className="bg-white text-black p-4 rounded" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
