import { useState, useEffect } from "react";

const days = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

const defaultPlayers = [
  "Jerome Belpaeme",
  "Wolf Cappan",
  "Leon De Backer",
  "Mateo De Tremerie",
  "Nicolas Desaver",
  "Mauro Dewitte",
  "Aaron D'Hoore",
  "Ferran Dhuyvetter",
  "Arthur Germonpré",
  "Lander Helderweirt",
  "Tuur Heyerick",
  "Jef Lambers",
  "Andro Martens",
  "Lukas Onderbeke",
  "Steffen Opstaele",
  "Siebe Passchyn",
  "Viktor Poelman",
  "Moussa Sabir",
  "Mauro Savat",
  "Mattias Smet",
  "Guillaume Telleir",
  "Thias Van Holle",
  "Michiel Van Melkebeke",
  "Rube Verhille",
  "Filemon Verstraete",
];

const reasons = [
  "Blessure",
  "Geschorst",
  "Rust",
  "Schoolverplichting",
  "GU15",
  "Stand-by GU15",
  "Niet getraind",
  "1x getraind",
  "Niet verwittigd",
  "Vakantie",
  "Ziek",
  "Disciplinair",
  "Andere redenen",
];

export default function App() {
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [players, setPlayers] = useState([...defaultPlayers]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState({});
  const [responsible, setResponsible] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (matchType === "Thuiswedstrijd") setGatheringPlace("Kleedkamer X");
    else if (matchType === "Uitwedstrijd") setGatheringPlace("Parking KVE");
  }, [matchType]);

  const filteredPlayers = players.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewPlayer = (name: string) => {
    if (name && !players.includes(name)) setPlayers((prev) => [...prev, name]);
  };

  const togglePlayer = (name: string) => {
    setSelectedPlayers((prev) => {
      const copy = { ...prev };
      if (name in copy) delete copy[name];
      else copy[name] = "1";
      return copy;
    });
  };

  const setRugnummer = (player: string, number: string) => {
    setSelectedPlayers((prev) => ({ ...prev, [player]: number }));
  };

  const setReason = (player: string, reason: string) => {
    setNonSelectedReasons((prev) => ({ ...prev, [player]: reason }));
  };

  const copyToClipboard = async () => {
    if (navigator.clipboard && preview) {
      await navigator.clipboard.writeText(preview);
      alert("E-mail gekopieerd naar klembord!");
    }
  };

  const generateEmail = () => {
    const selectedList = Object.entries(selectedPlayers).sort(
      (a, b) => parseInt(a[1]) - parseInt(b[1])
    );
    const selectie = selectedList.map(([p, n]) => `${n}. ${p}`).join("<br>");

    const nietGeselecteerd = players
      .filter((p) => !(p in selectedPlayers))
      .map((p) => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`)
      .join("<br>");

    const extra =
      matchType === "Uitwedstrijd"
        ? `<p style='background:#d0ebff;padding:0.5rem;border-radius:6px;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</p>`
        : "";

    const email = `
    <div style='font-family: Arial; padding:1rem;'>
      <h2>Beste ouders en spelers van de U14,</h2>
      <p>Aanstaande <strong>${day}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent}</strong>.</p>

      <div style='margin:1rem 0;padding:1rem;border:1px solid #ccc;border-radius:8px;'>
        <h3>Wedstrijdinformatie</h3>
        <p>Wedstrijd: ${matchType === "Thuiswedstrijd" ? "KVE vs " + opponent : opponent + " vs KVE"}<br>
        Datum: ${date}<br>
        Aanvang: ${time}<br>
        Terrein: ${field}<br>
        Adres: ${address}${matchType === "Uitwedstrijd" ? `<br>Aankomst bij ${opponent}: ${arrivalTimeOpponent}` : ""}</p>
      </div>

      <div style='margin:1rem 0;padding:1rem;border:1px solid #ccc;border-radius:8px;'>
        <h3>Verzamelinformatie</h3>
        <p>Verzamelplaats: ${gatheringPlace}<br>
        Verzameltijd: ${gatheringTime}</p>
      </div>

      <div><h3>Selectie</h3><p>${selectie}</p></div>
      <div><h3>Niet geselecteerden</h3><p>${nietGeselecteerd}</p></div>
      <div><h3>Verantwoordelijke</h3><p>Was, fruit & chocomelk: ${responsible}</p></div>
      <div><h3>Belangrijk</h3><p style='background:yellow;padding:0.4rem;border-radius:4px;'>Vergeet niet jullie ID mee te nemen!</p>${extra}</div>
      <p style='margin-top:2rem;'>Met sportieve groeten,<br>Yannick Deraedt<br>Trainer U14 KVE Drongen</p>
    </div>
    `;

    setPreview(email);
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Email Generator U14</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select className="p-2 rounded border" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="">Kies een dag</option>
          {days.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="p-2 rounded border" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
          <option>Thuiswedstrijd</option>
          <option>Uitwedstrijd</option>
        </select>
        <input className="p-2 rounded border" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="p-2 rounded border" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className="p-2 rounded border" placeholder="Tegenstander" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        <input className="p-2 rounded border" placeholder="Terrein" value={field} onChange={(e) => setField(e.target.value)} />
        <input className="p-2 rounded border" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} />
        {matchType === "Uitwedstrijd" && (
          <input className="p-2 rounded border" type="time" placeholder="Aankomst" value={arrivalTimeOpponent} onChange={(e) => setArrivalTimeOpponent(e.target.value)} />
        )}
        <input className="p-2 rounded border" placeholder="Verzamelplaats" value={gatheringPlace} onChange={(e) => setGatheringPlace(e.target.value)} />
        <input className="p-2 rounded border" type="time" placeholder="Verzameltijd" value={gatheringTime} onChange={(e) => setGatheringTime(e.target.value)} />
        <select className="p-2 rounded border" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
          <option value="">Verantwoordelijke</option>
          {players.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="mt-6">
        <input className="w-full p-2 border rounded mb-2" placeholder="Zoek speler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        {filteredPlayers.map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={p in selectedPlayers} onChange={() => togglePlayer(p)} />
            <span className="flex-1 text-sm">{p}</span>
            {p in selectedPlayers && (
              <select value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)} className="border p-1 text-sm">
                {[...Array(25)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            )}
          </div>
        ))}
        <div className="mt-4 flex gap-2">
          <input type="text" placeholder="Nieuwe speler" className="border p-2 rounded w-full" onKeyDown={(e) => { if (e.key === "Enter") addNewPlayer(e.currentTarget.value); }} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Niet-geselecteerden</h2>
        {players.filter((p) => !(p in selectedPlayers)).map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <span className="flex-1 text-sm">{p}</span>
            <select value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)} className="border p-1 text-sm">
              <option value="">Reden</option>
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button onClick={generateEmail} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 shadow hover:bg-blue-700">Genereer e-mail</button>

      {preview && (
        <>
          <div className="bg-white dark:bg-gray-800 p-4 border mt-4 rounded shadow text-sm overflow-auto" dangerouslySetInnerHTML={{ __html: preview }} />
          <button onClick={copyToClipboard} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">📋 Kopieer e-mail</button>
        </>
      )}
    </div>
  );
}
