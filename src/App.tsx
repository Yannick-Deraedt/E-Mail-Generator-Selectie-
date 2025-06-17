import { useState } from "react";

const playerList = [
  "Jerome Belpaeme", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver", "Mauro Dewitte", "Aaron D'Hoore", "Ferran Dhuyvetter",
  "Arthur Germonpré", "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers",
  "Andro Martens", "Lukas Onderbeke", "Steffen Opstaele", "Siebe Passchyn",
  "Viktor Poelman", "Moussa Sabir", "Mauro Savat", "Mattias Smet",
  "Guillaume Telleir", "Thias Van Holle", "Michiel Van Melkebeke",
  "Rube Verhille", "Filemon Verstraete"
];

const reasons = [
  "Blessure", "Geschorst", "Rust", "Schoolverplichting", "GU15",
  "Stand-by GU15", "Niet getraind", "1x getraind", "Niet verwittigd",
  "Vakantie", "Ziek", "Disciplinair", "Andere redenen"
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

  const handlePlayerToggle = (player: string) => {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (player in updated) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const handleRugnummerChange = (player: string, number: string) => {
    setSelectedPlayers(prev => ({ ...prev, [player]: number }));
  };

  const handleReasonChange = (player: string, reason: string) => {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br>");

    const nonSelectedText = playerList.filter(p => !(p in selectedPlayers)).map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br>");

    const extra = matchType === "Uitwedstrijd"
      ? `<p><span style='background-color:#d0ebff;font-weight:bold;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</span></p>`
      : "";

    const email = `
      <div style='font-family:Arial,sans-serif;padding:1rem;'>
        <h2>Beste ouders en spelers van de U15,</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Wedstrijdinformatie</h3>
          <p>Wedstrijd: ${matchType === "Thuiswedstrijd" ? `KVE vs ${opponent}` : `${opponent} vs KVE`}<br>
          Datum: ${date}<br>
          Aanvang: ${time}<br>
          Terrein: ${field}<br>
          Adres: ${address}${matchType === "Uitwedstrijd" ? `<br>Aankomst bij ${opponent}: ${arrivalTimeOpponent}` : ""}</p>
        </div>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Verzamelinformatie</h3>
          <p>Verzamelplaats: ${gatheringPlace}<br>Verzameltijd: ${gatheringTime}</p>
        </div>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Niet geselecteerde spelers</h3>
          <p>${nonSelectedText || "Geen info"}</p>
        </div>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Verantwoordelijkheden</h3>
          <p>Was, fruit en chocomelk: ${responsible}</p>
        </div>

        <div style='border:1px solid #ccc;border-radius:8px;padding:1rem;margin:1rem 0;'>
          <h3>Belangrijke mededeling</h3>
          <p style='background-color:yellow;font-weight:bold;'>Vergeet niet om jullie identiteitskaart (ID) mee te nemen!</p>
          ${extra}
        </div>

        <p>Met sportieve groeten,<br>Yannick Deraedt<br>Trainer U15 KVE Drongen</p>
      </div>
    `;

    setPreview(email);
  };

  const copyToClipboard = async () => {
    if (navigator.clipboard && preview) {
      await navigator.clipboard.writeText(preview);
      alert("E-mail gekopieerd naar klembord!");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">E-mail Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2" placeholder="Dag" value={day} onChange={e => setDay(e.target.value)} />
        <select className="border p-2" value={matchType} onChange={e => setMatchType(e.target.value)}>
          <option>Thuiswedstrijd</option>
          <option>Uitwedstrijd</option>
        </select>
        <input className="border p-2" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input className="border p-2" type="time" value={time} onChange={e => setTime(e.target.value)} />
        <input className="border p-2" placeholder="Tegenstander" value={opponent} onChange={e => setOpponent(e.target.value)} />
        <input className="border p-2" placeholder="Terrein" value={field} onChange={e => setField(e.target.value)} />
        <input className="border p-2" placeholder="Adres" value={address} onChange={e => setAddress(e.target.value)} />
        {matchType === "Uitwedstrijd" && (
          <input className="border p-2" placeholder="Aankomsttijd" type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} />
        )}
        <input className="border p-2" placeholder="Verzamelplaats" value={gatheringPlace} onChange={e => setGatheringPlace(e.target.value)} />
        <input className="border p-2" placeholder="Verzameltijd" type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} />
        <select className="border p-2" value={responsible} onChange={e => setResponsible(e.target.value)}>
          <option value="">Verantwoordelijke</option>
          {playerList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Wedstrijdselectie</h2>
        {playerList.map(p => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={p in selectedPlayers} onChange={() => handlePlayerToggle(p)} />
            <span className="flex-1 text-sm">{p}</span>
            {p in selectedPlayers && (
              <select value={selectedPlayers[p]} onChange={e => handleRugnummerChange(p, e.target.value)} className="border p-1 text-sm">
                {[...Array(25)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Niet-geselecteerden en reden</h2>
        {playerList.filter(p => !(p in selectedPlayers)).map(p => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <span className="flex-1 text-sm">{p}</span>
            <select value={nonSelectedReasons[p] || ""} onChange={e => handleReasonChange(p, e.target.value)} className="border p-1 text-sm">
              <option value="">Reden</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generateEmail}>Genereer e-mail</button>

      {preview && (
        <>
          <div className="bg-white p-4 border rounded shadow text-sm overflow-auto" dangerouslySetInnerHTML={{ __html: preview }} />
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded" onClick={copyToClipboard}>📋 Kopieer e-mail</button>
        </>
      )}
    </div>
  );
}
