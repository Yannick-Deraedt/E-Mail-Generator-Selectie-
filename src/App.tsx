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

  useEffect(() => {
    setGatheringPlace(prev =>
      matchType === "Thuiswedstrijd"
        ? (prev.startsWith("Kleedkamer") ? prev : "Kleedkamer X")
        : "Parking KVE"
    );
    // eslint-disable-next-line
  }, [matchType]);

  const selectedSorted = Object.entries(selectedPlayers).sort((a, b) => a[0].localeCompare(b[0]));
  let nonSelected = playerList.filter(p => !(p in selectedPlayers));
  if (searchTerm.trim() !== "") {
    const first = nonSelected.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const rest = nonSelected.filter(p => !p.toLowerCase().includes(searchTerm.toLowerCase()));
    nonSelected = [...first, ...rest];
  }

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

  const generateEmail = () => {
    const aanhef = `
      <div style="margin-bottom:18px;">
        <p style="margin-bottom:10px;">Beste spelers en ouders,</p>
        <p style="margin-bottom:18px;">Hierbij alle info over de komende wedstrijd. Gelieve alles goed na te lezen en tijdig door te geven indien je niet aanwezig kan zijn.</p>
      </div>`;
    const detailsTable = `
      <table style="width:100%;background:#f9fafb;border-radius:8px;border-collapse:separate;border-spacing:0;margin-bottom:16px;border:1px solid #d1d5db;">
        <tbody>
          <tr><td style="padding:5px 8px;"><b>Dag</b></td><td style="padding:5px 8px;">${day}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Type wedstrijd</b></td><td style="padding:5px 8px;">${matchType}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Datum</b></td><td style="padding:5px 8px;">${date}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Start wedstrijd</b></td><td style="padding:5px 8px;">${time}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Tegenstander</b></td><td style="padding:5px 8px;">${opponent}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Terrein</b></td><td style="padding:5px 8px;">${field}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Adres</b></td><td style="padding:5px 8px;">${address}</td></tr>
        </tbody>
      </table>
      <table style="width:100%;background:#f0fdf4;border-radius:8px;border-collapse:separate;border-spacing:0;margin-bottom:18px;border:1px solid #bbf7d0;">
        <tbody>
          <tr><td style="padding:5px 8px;"><b>Verzameltijd</b></td><td style="padding:5px 8px;">${gatheringTime}</td></tr>
          <tr><td style="padding:5px 8px;"><b>Verzamelplaats</b></td><td style="padding:5px 8px;">${gatheringPlace}</td></tr>
          ${
            matchType === "Uitwedstrijd" && opponent
              ? `<tr><td style="padding:5px 8px;"><b>Aankomst tegenstander</b></td><td style="padding:5px 8px;">tegenstander: ${opponent}</td></tr>`
              : ""
          }
        </tbody>
      </table>
      ${
        matchType === "Uitwedstrijd"
          ? `<div style="background:#f0f9ff;padding:10px 12px;border-radius:6px;margin-bottom:20px;font-size:15px;border:1px solid #bae6fd;">
                <b>Carpool:</b> We vragen om samen te vertrekken vanaf de parking van KVE Drongen.<br>
                Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen.<br>
                Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden.<br>
                Laat dit wel weten via de WhatsApp-poll.
            </div>`
          : ""
      }
    `;
    const selectieTable = selectedSorted.length > 0 ? `
      <h3 style="margin-top:28px;margin-bottom:10px;">Selectie</h3>
      <table style="width:100%;background:#fcfafa;border-radius:8px;border-collapse:separate;border-spacing:0;border:1px solid #e0e7ef;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="padding:5px 8px;text-align:left;font-size:15px;">Rugnummer</th>
            <th style="padding:5px 8px;text-align:left;font-size:15px;">Naam speler</th>
            <th style="padding:5px 8px;text-align:left;font-size:15px;">Verantwoordelijke voor was, fruit & chocomelk</th>
          </tr>
        </thead>
        <tbody>
          ${selectedSorted
            .map(
              ([name, num]) => `<tr>
                <td style="padding:5px 8px;">${num}</td>
                <td style="padding:5px 8px;">${name}</td>
                <td style="padding:5px 8px;">${responsible === name ? "❌" : ""}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    ` : "";

    const nietSelectieList = playerList
      .filter(p => !(p in selectedPlayers))
      .map(
        p =>
          `<tr><td style="padding:5px 8px;">${p}</td><td style="padding:5px 8px;">${nonSelectedReasons[p] || "Geen reden opgegeven"}</td></tr>`
      )
      .join("");
    const nietSelectieTable = nietSelectieList
      ? `<h3 style="margin-top:24px;margin-bottom:10px;">Niet geselecteerd</h3>
          <table style="width:100%;background:#fff7f7;border-radius:8px;border-collapse:separate;border-spacing:0;border:1px solid #fecaca;">
          <thead>
            <tr>
              <th style="padding:5px 8px;text-align:left;font-size:15px;">Naam</th>
              <th style="padding:5px 8px;text-align:left;font-size:15px;">Reden</th>
            </tr>
          </thead>
          <tbody>${nietSelectieList}</tbody>
        </table>`
      : "";
    const verantwoordelijkeText =
      responsible
        ? `<div style="margin-top:18px;"><b>Verantwoordelijke voor was, fruit & chocomelk:</b> ${responsible}</div>`
        : "";
    const afsluit =
      `<div style="margin-top:22px;">
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
      verantwoordelijkeText +
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
    <div className="p-4 max-w-2xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">E-mail Generator</h1>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-col gap-3">
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
      </div>

      {/* Selectie (bovenaan) */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-2">Selectie</h2>
        {selectedSorted.length > 0 ? (
          <table className="w-full bg-white text-black rounded mb-3 border border-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-sm">#</th>
                <th className="px-2 py-1 text-left text-sm">Naam</th>
                <th className="px-2 py-1 text-left text-sm">Verantwoordelijke voor was, fruit & chocomelk</th>
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
                    {responsible === player ? "❌" : ""}
                  </td>
                  <td className="px-2 py-1">
                    <button onClick={() => handleDeselect(player)} className="text-red-600 font-bold">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-300 mb-2">Nog geen spelers geselecteerd.</p>
        )}
        <label>
          Verantwoordelijke voor was, fruit & chocomelk
          <select value={responsible} onChange={e => setResponsible(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een speler</option>
            {selectedSorted.map(([player]) => <option key={player}>{player}</option>)}
          </select>
        </label>
      </div>

      {/* Niet-geselecteerden onderaan, zoekfunctie */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
          <h2 className="text-lg font-bold">Niet-geselecteerden</h2>
          <input
            ref={inputRef}
            type="text"
            className="p-2 rounded text-black w-full sm:w-60"
            placeholder="Zoek speler..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full bg-white text-black rounded border border-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-1"></th>
              <th className="px-2 py-1 text-left text-sm">Naam</th>
              <th className="px-2 py-1 text-left text-sm">Reden niet geselecteerd</th>
            </tr>
          </thead>
          <tbody>
            {nonSelected.map(player => (
              <tr key={player}>
                <td className="px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleSelect(player)}
                  />
                </td>
                <td className="px-2 py-1">{player}</td>
                <td className="px-2 py-1">
                  <select
                    className="w-full text-black"
                    value={nonSelectedReasons[player] || ""}
                    onChange={e =>
                      setNonSelectedReasons(prev => ({ ...prev, [player]: e.target.value }))
                    }
                  >
                    <option value="">Reden niet geselecteerd</option>
                    {nonSelectionReasons.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Opmerking en knoppen */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <label>Opmerking
          <input
            type="text"
            value={remark}
            onChange={e => setRemark(e.target.value)}
            className="w-full p-2 rounded text-black mt-1"
          />
        </label>
        <div className="flex gap-3 mt-4">
          <button onClick={generateEmail} className="bg-blue-600 px-4 py-2 rounded">Genereer e-mail</button>
          <button onClick={copyToClipboard} className="bg-green-600 px-4 py-2 rounded">Kopieer e-mail</button>
        </div>
      </div>

      {/* Preview */}
      <h2 className="text-xl font-bold mb-2">Preview e-mail</h2>
      <div
        id="mailpreview"
        className="bg-white text-black p-4 rounded"
        style={{ minHeight: 180, marginBottom: 100 }}
        dangerouslySetInnerHTML={{ __html: preview }}
      />
    </div>
  );
}
