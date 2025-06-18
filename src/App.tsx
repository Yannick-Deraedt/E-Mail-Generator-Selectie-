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

// Alleen 1 t.e.m. 25!
const jerseyNumbers = Array.from({ length: 25 }, (_, i) => (i + 1).toString());
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
    if (matchType !== "Uitwedstrijd") setArrivalTimeOpponent("");
  }, [matchType]);

  const handleSelect = (player: string) => {
    setSelectedPlayers(prev => ({ ...prev, [player]: "1" }));
    const updated = { ...nonSelectedReasons };
    delete updated[player];
    setNonSelectedReasons(updated);
    // Verantwoordelijke mag niet leeg zijn als niemand gekozen is
    if (!responsible) setResponsible(player);
  };

  const handleDeselect = (player: string) => {
    const updated = { ...selectedPlayers };
    delete updated[player];
    setSelectedPlayers(updated);
    setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
    if (responsible === player) setResponsible("");
  };

  const setRugnummer = (player: string, nummer: string) =>
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));

  const setReason = (player: string, reason: string) =>
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));

  const copyToClipboard = async () => {
    const el = document.querySelector("#preview-mail");
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
    // Geselecteerde spelers op rugnummer gesorteerd
    const selectedArr = Object.entries(selectedPlayers)
      .sort((a, b) => Number(a[1]) - Number(b[1]));

    // Tabel selectie met kruisje bij verantwoordelijke
    const selectedList = selectedArr.map(([name, number]) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #ececec"><strong>#${number}</strong></td>
        <td style="padding:6px 10px;border-bottom:1px solid #ececec">${name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #ececec;text-align:center">
          ${responsible === name ? '<span title="Verantwoordelijke" style="color:#159b29;font-weight:bold;font-size:20px;">&#10004;</span>' : ""}
        </td>
      </tr>
    `).join("");

    // Tabel niet-geselecteerden
    const nonSelectedList = playerList
      .filter(p => !(p in selectedPlayers))
      .map(p => `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #ffdede">${p}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #ffdede">${nonSelectedReasons[p] || "Geen reden opgegeven"}</td>
        </tr>
      `).join("");

    const arrivalRow = matchType === "Uitwedstrijd" && arrivalTimeOpponent
      ? `<tr><td style="font-weight:bold">Aankomst bij tegenstander:</td><td>${arrivalTimeOpponent} (${opponent})</td></tr>` : "";

    const carpoolText = matchType === "Uitwedstrijd"
      ? `<div style="margin:18px 0 12px 0;background:#e8f4fc;padding:10px;border-radius:6px;font-size:15px">
          <strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen.<br/>
          Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
        </div>`
      : "";

    const html = `
      <div style="font-family:sans-serif;line-height:1.7;max-width:650px;">
        <p style="margin-bottom:24px">
          Beste spelers en ouders,<br/><br/>
          Gelieve aandachtig alle informatie voor de komende wedstrijd hieronder te lezen. 
          Bevestig tijdig je aanwezigheid via ProSoccerData of via WhatsApp.<br/><br/>
        </p>
        <div style="background:#f2f7fd;border-radius:8px;padding:18px 20px 14px 20px;margin-bottom:20px;border:1px solid #d2e3f7">
          <h2 style="font-size:19px;color:#134c87;margin-bottom:14px;">Wedstrijddetails</h2>
          <table style="width:100%;font-size:16px">
            <tr><td style="font-weight:bold;width:220px">Dag:</td><td>${day}</td></tr>
            <tr><td style="font-weight:bold">Type:</td><td>${matchType}</td></tr>
            <tr><td style="font-weight:bold">Datum:</td><td>${date}</td></tr>
            <tr><td style="font-weight:bold">Start wedstrijd:</td><td>${time}</td></tr>
            <tr><td style="font-weight:bold">Tegenstander:</td><td>${opponent}</td></tr>
            <tr><td style="font-weight:bold">Terrein:</td><td>${field}</td></tr>
            <tr><td style="font-weight:bold">Adres:</td><td>${address}</td></tr>
            <tr><td style="font-weight:bold">Verzamelen:</td><td>${gatheringTime} aan ${gatheringPlace}</td></tr>
            ${arrivalRow}
          </table>
        </div>
        ${carpoolText}
        <div style="background:#f9fafc;border-radius:8px;padding:16px 20px;margin-bottom:18px;border:1px solid #e3e3e3">
          <h2 style="font-size:18px;color:#2b3e52;margin-bottom:8px;">Selectie</h2>
          <table style="width:100%;font-size:16px;background:#fff;border-radius:5px;">
            <thead>
              <tr style="background:#e6effa">
                <th style="padding:6px 10px;border-bottom:2px solid #b2d1f1;text-align:left">Rugnr</th>
                <th style="padding:6px 10px;border-bottom:2px solid #b2d1f1;text-align:left">Speler</th>
                <th style="padding:6px 10px;border-bottom:2px solid #b2d1f1;text-align:center">Verantw.</th>
              </tr>
            </thead>
            <tbody>
              ${selectedList}
            </tbody>
          </table>
        </div>
        <div style="background:#fdf6f7;border-radius:8px;padding:16px 20px;margin-bottom:18px;border:1px solid #efd4d7">
          <h2 style="font-size:18px;color:#852828;margin-bottom:8px;">Niet geselecteerd</h2>
          <table style="width:100%;font-size:16px;background:#fff;border-radius:5px;">
            <thead>
              <tr style="background:#fbe8e9">
                <th style="padding:6px 10px;border-bottom:2px solid #f5c8cc;text-align:left">Speler</th>
                <th style="padding:6px 10px;border-bottom:2px solid #f5c8cc;text-align:left">Reden</th>
              </tr>
            </thead>
            <tbody>
              ${nonSelectedList}
            </tbody>
          </table>
        </div>
        <div style="margin:0 0 24px 0;padding:8px 20px;">
          <strong>Opmerking:</strong> ${remark}
        </div>
        <p style="margin-top:40px">
          Met sportieve groet,<br/><br/>
          Yannick Deraedt<br/>
          Trainer U15 IP – KVE Drongen
        </p>
      </div>
    `;
    setPreview(html);
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">E-mail Generator</h1>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col">Dag
          <select value={day} onChange={e => setDay(e.target.value)} className="p-2 rounded text-black mt-1">
            <option value="">Kies een dag</option>{days.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col">Type wedstrijd
          <select value={matchType} onChange={e => setMatchType(e.target.value)} className="p-2 rounded text-black mt-1">
            <option>Thuiswedstrijd</option><option>Uitwedstrijd</option>
          </select>
        </label>
        <label className="flex flex-col">Datum
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Start wedstrijd
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Tegenstander
          <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Terrein
          <input type="text" value={field} onChange={e => setField(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Adres
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Verzameltijd
          <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>
        <label className="flex flex-col">Verzamelplaats
          <input type="text" value={gatheringPlace} readOnly className="p-2 rounded text-black mt-1" />
        </label>
        {matchType === "Uitwedstrijd" && (
          <label className="flex flex-col">Aankomst bij tegenstander
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="p-2 rounded text-black mt-1" />
          </label>
        )}
        <label className="flex flex-col">Verantwoordelijke
          <select value={responsible} onChange={e => setResponsible(e.target.value)} className="p-2 rounded text-black mt-1">
            <option value="">Kies een speler</option>
            {Object.keys(selectedPlayers).map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col">Opmerking
          <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="p-2 rounded text-black mt-1" />
        </label>

        <h2 className="text-xl font-bold mt-6">Geselecteerden</h2>
        {Object.keys(selectedPlayers).map(player => (
          <div key={player} className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked onChange={() => handleDeselect(player)} />
            <span className="flex-1">{player}</span>
            <select className="w-20 text-black" value={selectedPlayers[player]} onChange={e => setRugnummer(player, e.target.value)}>
              {jerseyNumbers.map(n => (<option key={n} value={n}>{n}</option>))}
            </select>
            {responsible === player && <span title="Verantwoordelijke" className="ml-2 text-green-400 text-lg font-bold">✔</span>}
          </div>
        ))}

        <h2 className="text-xl font-bold mt-6">Niet-geselecteerden</h2>
        {playerList.filter(p => !(p in selectedPlayers)).map(player => (
          <div key={player} className="flex items-center gap-2 mb-1">
            <input type="checkbox" onChange={() => handleSelect(player)} />
            <span className="flex-1">{player}</span>
            <select className="flex-1 text-black" value={nonSelectedReasons[player] || ""} onChange={e => setReason(player, e.target.value)}>
              <option value="">Reden niet geselecteerd</option>
              {nonSelectionReasons.map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
        ))}

        <div className="flex gap-4 mt-4 mb-6 flex-wrap">
          <button onClick={generateEmail} className="bg-blue-600 px-4 py-2 rounded">Genereer e-mail</button>
          <button onClick={copyToClipboard} className="bg-green-600 px-4 py-2 rounded">Kopieer e-mail</button>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-2">Preview</h2>
        <div id="preview-mail" className="bg-white text-black p-4 rounded" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
