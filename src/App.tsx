// App.tsx – volledige versie met verbeterde kopieerfunctie (rich HTML)
import { useState } from "react";

const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const playerList = [
  "Jerome Belpaeme", "Leon Boone", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver","Mauro Dewitte", "Aron D'Hoore", "Ferran Dhuyvetter", "Arthur Germonpré", 
  "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers", "Andro Martens", "Lukas Onderbeke"
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
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState("");
  const [preview, setPreview] = useState("");

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
    if (navigator.clipboard && previewElement) {
      const html = previewElement.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" })
        })
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    }
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br>");

    const nonSelectedText = playerList
      .filter((p) => !(p in selectedPlayers))
      .map((p) => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`)
      .join("<br>");

    const extraMededeling = matchType === 'Uitwedstrijd'
      ? `<p><span style='background-color: #d0ebff; font-weight: bold;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</span></p>`
      : "";

    const email = `
      <div style='font-family: Arial, sans-serif; padding: 1rem;'>
        <h2 style='font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem;'>Beste ouders en spelers van de U16,</h2>
        <p style='margin-bottom: 2rem;'>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>. Hieronder vinden jullie alle belangrijke details voor de wedstrijd.</p>

        <div style='margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;'>
          <h3 style='font-weight: bold;'>Wedstrijdinformatie</h3>
          <p>Wedstrijd: ${matchType === 'Thuiswedstrijd' ? 'KVE vs ' + opponent : opponent + ' vs KVE'}<br>
          Datum: ${date}<br>
          Aanvang: ${time}<br>
          Terrein: ${field || "[terrein]"}<br>
          Adres: ${address || "[adres]"}${matchType === 'Uitwedstrijd' ? `<br>Aankomst bij ${opponent}: ${arrivalTimeOpponent || "[uur]"}` : ""}</p>
        </div>

        <div style='margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;'>
          <h3 style='font-weight: bold;'>Verzamelinformatie</h3>
          <p>Verzamelplaats: ${gatheringPlace || "[verzamelplaats]"}<br>
          Verzameltijd: ${gatheringTime || "[verzameltijd]"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Niet geselecteerde spelers</h3>
          <p>${nonSelectedText || "Geen info"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Verantwoordelijkheden</h3>
          <p>Was, fruit en chocomelk: ${responsible || "[naam speler]"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Belangrijke mededeling</h3>
          <p><span style='background-color: yellow; font-weight: bold;'>Vergeet niet om jullie identiteitskaart (ID) mee te nemen!</span></p>
          ${extraMededeling}
        </div>

        <p style='margin-top: 2rem;'>Met sportieve groeten,<br>Yannick Deraedt<br>Trainer U15 KVE Drongen</p>
      </div>
    `;

    setPreview(email);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Email Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select className="border p-2" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="">Kies een dag</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="border p-2" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
          <option>Thuiswedstrijd</option>
          <option>Uitwedstrijd</option>
        </select>
        <input className="border p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border p-2" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className="border p-2" placeholder="Tegenstander" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        <input className="border p-2" placeholder="Terrein" value={field} onChange={(e) => setField(e.target.value)} />
        <input className="border p-2" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} />
        {matchType === "Uitwedstrijd" && (
          <input className="border p-2" type="time" placeholder="Aankomst" value={arrivalTimeOpponent} onChange={(e) => setArrivalTimeOpponent(e.target.value)} />
        )}
        <input className="border p-2" placeholder="Verzamelplaats" value={gatheringPlace} onChange={(e) => setGatheringPlace(e.target.value)} />
        <input className="border p-2" type="time" placeholder="Verzameltijd" value={gatheringTime} onChange={(e) => setGatheringTime(e.target.value)} />
        <select className="border p-2" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
          <option value="">Verantwoordelijke</option>
          {playerList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Wedstrijdselectie</h2>
        {playerList.map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={p in selectedPlayers} onChange={() => togglePlayer(p)} />
            <span className="flex-1 text-sm">{p}</span>
            {p in selectedPlayers && (
              <select value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)} className="border p-1 text-sm">
                {[...Array(25)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Niet-geselecteerden en reden</h2>
        {playerList.filter(p => !(p in selectedPlayers)).map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <span className="flex-1 text-sm">{p}</span>
            <select value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)} className="border p-1 text-sm">
              <option value="">Reden</option>
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generateEmail}>Genereer e-mail</button>
      {preview && (
        <>
          <div
            id="preview"
            className="bg-white p-4 border rounded shadow text-sm overflow-auto"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded" onClick={copyToClipboard}>📋 Kopieer e-mail</button>
        </>
      )}
    </div>
  );
}
