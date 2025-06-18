import { useState, useEffect, useRef } from "react";

const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
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

export default function App() {
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringTime, setGatheringTime] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [searchTerm, setSearchTerm] = useState("");
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Verzamelplaats automatisch wijzigen (maar altijd aanpasbaar!)
  useEffect(() => {
    setGatheringPlace(prev =>
      matchType === "Thuiswedstrijd"
        ? (prev.startsWith("Kleedkamer") ? prev : "Kleedkamer X")
        : "Parking KVE"
    );
    // eslint-disable-next-line
  }, [matchType]);

  // Sorteren: selectie alfabetisch (voor UI), niet-geselecteerd met zoek-term bovenaan
  const selectedSorted = Object.entries(selectedPlayers).sort((a, b) => a[0].localeCompare(b[0]));
  let nonSelected = playerList.filter(p => !(p in selectedPlayers));
  if (searchTerm.trim() !== "") {
    const first = nonSelected.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const rest = nonSelected.filter(p => !p.toLowerCase().includes(searchTerm.toLowerCase()));
    nonSelected = [...first, ...rest];
  }

  // Handlers
  const handleSelect = (player: string) => {
    setSelectedPlayers(prev => ({ ...prev, [player]: "1" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setSearchTerm("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const handleDeselect = (player: string) => {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
    if (responsible === player) setResponsible("");
  };

  // EMAIL PREVIEW
  const generateEmail = () => {
    const aanhef = `
      <div style="text-align:center;margin-bottom:20px;">
        <p style="margin-bottom:12px;">Beste spelers en ouders,</p>
        <p style="margin-bottom:22px;">Hierbij alle info over de komende wedstrijd.<br>
        Gelieve alles goed na te lezen en tijdig door te geven indien je niet aanwezig kan zijn.</p>
      </div>
    `;
    const detailsTable = `
      <table style="margin:0 auto 20px auto;width:98%;max-width:430px;background:#fff;border-radius:10px;border-collapse:separate;border-spacing:0;box-shadow:0 2px 8px #0001;">
        <tbody>
          <tr><td style="padding:6px 12px;"><b>Dag</b></td><td style="padding:6px 12px;">${day}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Type wedstrijd</b></td><td style="padding:6px 12px;">${matchType}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Datum</b></td><td style="padding:6px 12px;">${date}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Start wedstrijd</b></td><td style="padding:6px 12px;">${time}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Tegenstander</b></td><td style="padding:6px 12px;">${opponent}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Terrein</b></td><td style="padding:6px 12px;">${field}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Adres</b></td><td style="padding:6px 12px;">${address}</td></tr>
        </tbody>
      </table>
      <table style="margin:0 auto 24px auto;width:98%;max-width:430px;background:#f6fff6;border-radius:10px;border-collapse:separate;border-spacing:0;box-shadow:0 1px 6px #22c55e22;">
        <tbody>
          <tr><td style="padding:6px 12px;"><b>Verzameltijd</b></td><td style="padding:6px 12px;">${gatheringTime}</td></tr>
          <tr><td style="padding:6px 12px;"><b>Verzamelplaats</b></td><td style="padding:6px 12px;">${gatheringPlace}</td></tr>
          ${
            matchType === "Uitwedstrijd" && opponent
              ? `<tr><td style="padding:6px 12px;"><b>Aankomst tegenstander</b></td><td style="padding:6px 12px;">tegenstander: ${opponent}</td></tr>`
              : ""
          }
        </tbody>
      </table>
      ${
        matchType === "Uitwedstrijd"
          ? `<div style="background:#e0f2ff;padding:10px 12px;border-radius:8px;margin:0 auto 18px auto;max-width:430px;border:1px solid #60a5fa;text-align:center;">
                <b>Carpool:</b> We vragen om samen te vertrekken vanaf de parking van KVE Drongen.<br>
                Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen.<br>
                Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden.<br>
                Laat dit wel weten via de WhatsApp-poll.
            </div>`
          : ""
      }
    `;
    // Selectie (groen)
    const selectieTable = selectedSorted.length > 0 ? `
      <h3 style="text-align:center;margin:28px 0 10px 0;">Selectie</h3>
      <table style="margin:0 auto 0 auto;width:98%;max-width:430px;background:#e9fbe6;border-radius:10px;border-collapse:separate;border-spacing:0;border:1px solid #22c55e;">
        <thead>
          <tr>
            <th style="padding:6px 8px;text-align:left;font-size:15px;">Rugnummer</th>
            <th style="padding:6px 8px;text-align:left;font-size:15px;">Naam speler</th>
            <th style="padding:6px 8px;text-align:center;font-size:15px;">Verantwoordelijke voor was, fruit & chocomelk</th>
          </tr>
        </thead>
        <tbody>
          ${selectedSorted
            .map(
              ([name, num]) => `<tr>
                <td style="padding:6px 8px;">${num}</td>
                <td style="padding:6px 8px;">${name}</td>
                <td style="padding:6px 8px;text-align:center;">${responsible === name ? "✔️" : ""}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    ` : "";
    // Niet-selectie (rood)
    const nietSelectieList = playerList
      .filter(p => !(p in selectedPlayers))
      .map(
        p =>
          `<tr><td style="padding:6px 8px;">${p}</td><td style="padding:6px 8px;">${nonSelectedReasons[p] || "Geen reden opgegeven"}</td></tr>`
      )
      .join("");
    const nietSelectieTable = nietSelectieList
      ? `<h3 style="text-align:center;margin:28px 0 10px 0;">Niet geselecteerd</h3>
          <table style="margin:0 auto 0 auto;width:98%;max-width:430px;background:#fff0f0;border-radius:10px;border-collapse:separate;border-spacing:0;border:1px solid #f87171;">
          <thead>
            <tr>
              <th style="padding:6px 8px;text-align:left;font-size:15px;">Naam</th>
              <th style="padding:6px 8px;text-align:left;font-size:15px;">Reden</th>
            </tr>
          </thead>
          <tbody>${nietSelectieList}</tbody>
        </table>`
      : "";
    const afsluit =
      `<div style="margin-top:24px;text-align:center;">
        <b>Opmerking:</b> ${remark}
        <br/><br/>
        Sportieve groeten,<br/>
        Yannick Deraedt<br/>
        Trainer U15 IP – KVE Drongen
      </div>`;
    setPreview(
      aanhef +
      detailsTable +
      selectieTable +
      nietSelectieTable +
      afsluit
    );
  };
  const copyToClipboard = async () => {
    const el = document.getElementById("mailpreview");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new window.ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      alert("E-mail succesvol gekopieerd!");
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">E-mail Generator</h1>
      {/* Alles in 1 mooie kader */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 flex flex-col gap-3 border border-gray-700 shadow-md">
        <label>Dag
          <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een dag</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>Type wedstrijd
          <select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </label>
        <label>Datum
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Start wedstrijd
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Tegenstander
          <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Terrein
          <input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Adres
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Verzameltijd
          <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label>Verzamelplaats
          <input type="text" value={gatheringPlace} onChange={e => setGatheringPlace(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        {matchType === "Uitwedstrijd" && (
          <label>Aankomst bij tegenstander
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
          </label>
        )}
        <label>Opmerking
          <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
      </div>
      {/* Selectie */}
      <div className="bg-green-50 border border-green-400 p-4 rounded-xl mb-6">
        <h2 className="text-lg font-bold mb-2 text-green-700">Selectie</h2>
        {selectedSorted.length > 0 ? (
          <table className="w-full bg-green-100 rounded mb-3 border border-green-400 text-black">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-sm">#</th>
                <th className="px-2 py-1 text-left text-sm">Naam</th>
                <th className="px-2 py-1 text-center text-sm">Verantwoordelijke voor was, fruit & chocomelk</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {selectedSorted.map(([player, number]) => (
                <tr key={player}>
                  <td className="px-2 py-1">
                    <select
                      className="w-14 text-black"
                      value={number}
                      onChange={e =>
                        setSelectedPlayers(prev => ({ ...prev, [player]: e.target.value }))
                      }
                    >
                      {jerseyNumbers.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1">{player}</td>
                  <td className="px-2 py-1 text-center">
                    {responsible === player ? "✔️" : ""}
                  </td>
                  <td className="px-2 py-1">
                    <button onClick={() => handleDeselect(player)} className="text-red-600 font-bold">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-green-800 mb-2">Nog geen spelers geselecteerd.</p>
        )}
        <label className="text-green-700">Verantwoordelijke voor was, fruit & chocomelk
          <select value={responsible} onChange={e => setResponsible(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een speler</option>
            {selectedSorted.map(([player]) => <option key={player}>{player}</option>)}
          </select>
        </label>
      </div>
      {/* Niet-geselecteerden */}
      <div className="bg-red-50 border border-red-400 p-4 rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
          <h2 className="text-lg font-bold text-red-700">Niet-geselecteerden</h2>
          <input
            ref={inputRef}
            type="text"
            className="p-2 rounded text-black w-full sm:w-60"
            placeholder="Zoek speler..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full bg-red-100 rounded border border-red-400 text-black">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-sm">Selecteer</th>
              <th className="px-2 py-1 text-left text-sm">Naam</th>
              <th className="px-2 py-1 text-left text-sm">Reden</th>
            </tr>
          </thead>
          <tbody>
            {nonSelected.map(player => (
              <tr key={player}>
                <td className="px-2 py-1">
                  <input type="checkbox" checked={false} onChange={() => handleSelect(player)} />
                </td>
                <td className="px-2 py-1">{player}</td>
                <td className="px-2 py-1">
                  <select
                    className="text-black"
                    value={nonSelectedReasons[player] || ""}
                    onChange={e => setNonSelectedReasons(prev => ({ ...prev, [player]: e.target.value }))}
                  >
                    <option value="">Reden niet geselecteerd</option>
                    {nonSelectionReasons.map(r => (<option key={r} value={r}>{r}</option>))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-8">
        <button onClick={generateEmail} className="bg-blue-600 px-4 py-2 rounded font-bold">Genereer e-mail</button>
        <button onClick={copyToClipboard} className="bg-green-600 px-4 py-2 rounded font-bold">📋 Kopieer e-mail</button>
      </div>
      {/* Preview */}
      <h2 className="text-xl font-bold mb-2 text-center">Preview E-mail</h2>
      <div
        id="mailpreview"
        className="bg-white text-black p-4 rounded-lg max-w-2xl mx-auto mb-12 border border-gray-200"
        style={{ boxShadow: "0 1px 6px #0002" }}
        dangerouslySetInnerHTML={{ __html: preview }}
      />
    </div>
  );
}
