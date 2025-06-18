import { useState, useEffect, useRef } from "react";

const playerList = [
  "Jerome Belpaeme", "Leon Boone", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver", "Mauro Dewitte", "Aron D'Hoore", "Ferran Dhuyvetter", "Arthur Germonpré", 
  "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers", "Andro Martens", "Lukas Onderbeke",
  "Siebe Passchyn", "Viktor Poelman", "Lav Rajkovic", "Moussa Sabir", "Mauro Savat", 
  "Mattias Smet", "Guillaume Telleir", "Otis Vanbiervliet", "Michiel Van Melkebeke", "Rube Verhille",
  "Filemon Verstraete"
];
const jerseyNumbers = Array.from({ length: 25 }, (_, i) => (i + 1).toString());
const nonSelectionReasons = [
  "Geblesseerd", "Ziek", "Afwezig", "Rust", "Op vakantie",
  "GU15", "Stand-by GU15", "1x getraind", "Schoolverplichtingen",
  "Te laat afgemeld/niet verwittigd", "Geschorst", "Andere reden"
];
const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

export default function App() {
  // Input state
  const [day, setDay] = useState("");
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [preview, setPreview] = useState("");
  const [searchPlayer, setSearchPlayer] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
    if (matchType === "Thuiswedstrijd") setArrivalTimeOpponent("");
  }, [matchType]);

  // Filter voor zoeken
  const filteredNotSelected = playerList.filter(
    p => !(p in selectedPlayers) &&
      p.toLowerCase().includes(searchPlayer.toLowerCase())
  );
  const selected = Object.keys(selectedPlayers)
    .sort((a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b]));
  const notSelected = playerList.filter(p => !(p in selectedPlayers));

  // Selectie
  function togglePlayer(player: string) {
    if (player in selectedPlayers) {
      const upd = { ...selectedPlayers };
      delete upd[player];
      setSelectedPlayers(upd);
      setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
    } else {
      setSelectedPlayers(prev => ({ ...prev, [player]: "1" }));
    }
  }
  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }
  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }

  // Verantwoordelijke: alleen uit selectie
  const responsibleOptions = selected;

  // Kopieerfunctie (enkel mail)
  const copyToClipboard = async () => {
    const el = document.getElementById("mailonly");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      alert("E-mail succesvol gekopieerd!");
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  function generateEmail() {
    const selectionTableRows = selected
      .map(player => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player]}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
            ${player === responsible ? "Verantwoordelijke voor was, fruit & chocomelk" : ""}
          </td>
        </tr>
      `).join("");

    const nonSelectedTableRows = notSelected
      .map(player => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${player}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedReasons[player] || "-"}</td>
        </tr>
      `).join("");

    // Aankomstuur alleen bij uitwedstrijd
    const opponentArrival = matchType === "Uitwedstrijd" && opponent && arrivalTimeOpponent
      ? `<tr><td style="font-weight:600;">Aankomst tegenstander:</td><td>${arrivalTimeOpponent} (${opponent})</td></tr>`
      : "";

    // Carpool
    const carpoolText = matchType === "Uitwedstrijd"
      ? `<div style="margin-top:10px;background:#e8f4fc;padding:10px;border-radius:6px;border:1px solid #c0e6fa;">
          <strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
        </div>` : "";

    // Mail
    const html = `
      <div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:auto;">
        <div style="background:#f9fafb;border-radius:12px;padding:18px 24px 10px 24px;margin-bottom:20px;box-shadow:0 2px 8px #0001;">
          <p style="margin:0 0 12px 0;font-size:1.05em">Beste spelers en ouders,</p>
          <p style="margin:0 0 16px 0;">Hieronder vinden jullie de info, selectie en afspraken voor de komende wedstrijd. Lees alles goed na en laat weten als er vragen zijn.</p>
        </div>
        <div style="background:#e7effb;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;">Wedstrijddetails</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="font-weight:600;width:175px;">Dag:</td><td>${day}</td></tr>
            <tr><td style="font-weight:600;">Type wedstrijd:</td><td>${matchType}</td></tr>
            <tr><td style="font-weight:600;">Datum:</td><td>${date}</td></tr>
            <tr><td style="font-weight:600;">Start wedstrijd:</td><td>${time}</td></tr>
            <tr><td style="font-weight:600;">Tegenstander:</td><td>${opponent}</td></tr>
            <tr><td style="font-weight:600;">Terrein:</td><td>${field}</td></tr>
            <tr><td style="font-weight:600;">Adres:</td><td>${address}</td></tr>
            <tr><td style="font-weight:600;">Verzamelen:</td><td>${gatheringTime} aan ${gatheringPlace}</td></tr>
            ${opponentArrival}
          </table>
          ${carpoolText}
        </div>
        <div style="background:#f1ffe9;border-radius:10px;padding:16px 20px;margin-bottom:18px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;">Selectie</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#d1f7b3;">
                <th style="text-align:left;padding:6px 12px;">Rugnummer</th>
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijke voor was, fruit & chocomelk</th>
              </tr>
            </thead>
            <tbody>${selectionTableRows}</tbody>
          </table>
        </div>
        <div style="background:#fff7f7;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;">Niet geselecteerd</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#ffd7d7;">
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Reden</th>
              </tr>
            </thead>
            <tbody>${nonSelectedTableRows}</tbody>
          </table>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;">
          <p style="margin:0;"><strong>Opmerking:</strong> ${remark}</p>
        </div>
        <p style="margin-top:34px;margin-bottom:6px;">Sportieve groeten,</p>
        <p style="margin:0;font-weight:600;">Yannick Deraedt<br/>Trainer U15 IP – KVE Drongen</p>
      </div>
    `;
    setPreview(html);
    if (previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth" });
  }

  // Render UI
  return (
    <div className="p-4 max-w-2xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">E-mail Generator</h1>
      <div className="space-y-3">
        <label>Dag<select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 rounded text-black mt-1"><option value="">Kies een dag</option>{days.map(d => <option key={d}>{d}</option>)}</select></label>
        <label>Type wedstrijd<select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black mt-1"><option>Thuiswedstrijd</option><option>Uitwedstrijd</option></select></label>
        <label>Datum<input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        <label>Start wedstrijd<input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        <label>Tegenstander<input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        <label>Terrein<input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        <label>Adres<input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        <label>Verzameltijd<input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
        {matchType === "Uitwedstrijd" && (
          <label>
            Aankomst bij tegenstander
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
          </label>
        )}
        <label>
          Verantwoordelijke voor was, fruit & chocomelk
          <select value={responsible} onChange={e => setResponsible(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een speler</option>
            {responsibleOptions.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Opmerking<input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black mt-1" /></label>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-2">Selectie</h2>
      <div className="mb-4">
        {selected.length === 0 && <div className="text-gray-400 mb-2 text-sm">Nog geen spelers geselecteerd</div>}
        <div className="space-y-2">
          {selected.map(player => (
            <div key={player} className="flex items-center gap-2 bg-green-100 rounded p-2">
              <input
                type="checkbox"
                checked
                onChange={() => togglePlayer(player)}
                className="accent-green-500"
              />
              <span className="flex-1 text-black">{player}</span>
              <select
                className="w-16 text-black"
                value={selectedPlayers[player]}
                onChange={e => handleRugnummer(player, e.target.value)}
              >
                {jerseyNumbers.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {player === responsible && (
                <span className="text-xs bg-yellow-200 px-2 py-1 rounded text-black ml-2">
                  Verantwoordelijke voor was, fruit & chocomelk
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-2">Niet geselecteerd</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Zoek speler…"
          value={searchPlayer}
          onChange={e => setSearchPlayer(e.target.value)}
          className="w-full mb-3 p-2 rounded text-black"
        />
        <div className="space-y-2">
          {filteredNotSelected.map(player => (
            <div key={player} className="flex items-center gap-2 bg-red-100 rounded p-2">
              <input
                type="checkbox"
                checked={false}
                onChange={() => togglePlayer(player)}
                className="accent-red-500"
              />
              <span className="flex-1 text-black">{player}</span>
              <select
                className="flex-1 text-black"
                value={nonSelectedReasons[player] || ""}
                onChange={e => handleNonSelectedReason(player, e.target.value)}
              >
                <option value="">Reden niet geselecteerd</option>
                {nonSelectionReasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <button
          onClick={generateEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          Genereer e-mail
        </button>
        <button
          onClick={copyToClipboard}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          Kopieer e-mail
        </button>
      </div>

      <div ref={previewRef} className="mt-8">
        <div id="mailonly" className="bg-white text-black p-4 rounded">
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  );
}
