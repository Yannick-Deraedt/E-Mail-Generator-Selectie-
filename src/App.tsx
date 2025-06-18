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

  // Verzamelplaats aanpassen op matchtype (altijd aanpasbaar!)
  useEffect(() => {
    setGatheringPlace(prev =>
      matchType === "Thuiswedstrijd"
        ? (prev.startsWith("Kleedkamer") ? prev : "Kleedkamer X")
        : "Parking KVE"
    );
  // eslint-disable-next-line
  }, [matchType]);

  // Selecteren / deselecteren
  const handleSelect = (player: string) => {
    setSelectedPlayers(prev => ({ ...prev, [player]: "1" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setSearchTerm(""); // reset search
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

  // Zoekfunctie in niet-geselecteerde lijst, altijd zichtbaar
  const filteredNotSelected = playerList.filter(
    p => !(p in selectedPlayers) &&
      (searchTerm.trim() === "" || p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Geselecteerde bovenaan, sorteren op alfabet of rugnummer
  const selectedSorted = Object.entries(selectedPlayers)
    .sort((a, b) => a[0].localeCompare(b[0]));

  // Generate E-mail (preview)
  const generateEmail = () => {
    const aanhef = `<p>Beste spelers en ouders,</p>
      <p>Hierbij alle info over de komende wedstrijd. Gelieve goed alles na te lezen en tijdig door te geven indien je niet aanwezig kan zijn.</p>`;

    const detailsTable = `
      <table style="background:#f5f6fa;width:100%;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;margin-bottom:10px">
        <tbody>
          <tr><td style="padding:6px 8px"><b>Dag</b></td><td style="padding:6px 8px">${day}</td></tr>
          <tr><td style="padding:6px 8px"><b>Type wedstrijd</b></td><td style="padding:6px 8px">${matchType}</td></tr>
          <tr><td style="padding:6px 8px"><b>Datum</b></td><td style="padding:6px 8px">${date}</td></tr>
          <tr><td style="padding:6px 8px"><b>Start wedstrijd</b></td><td style="padding:6px 8px">${time}</td></tr>
          <tr><td style="padding:6px 8px"><b>Tegenstander</b></td><td style="padding:6px 8px">${opponent}</td></tr>
          <tr><td style="padding:6px 8px"><b>Terrein</b></td><td style="padding:6px 8px">${field}</td></tr>
          <tr><td style="padding:6px 8px"><b>Adres</b></td><td style="padding:6px 8px">${address}</td></tr>
        </tbody>
      </table>
      <table style="background:#f0fbf7;width:100%;border-radius:8px;overflow:hidden;border:1px solid #7dd3fc;margin-bottom:10px">
        <tbody>
          <tr><td style="padding:6px 8px"><b>Verzameltijd</b></td><td style="padding:6px 8px">${gatheringTime}</td></tr>
          <tr><td style="padding:6px 8px"><b>Verzamelplaats</b></td><td style="padding:6px 8px">${gatheringPlace}</td></tr>
          ${matchType === "Uitwedstrijd" && opponent ? `<tr><td style="padding:6px 8px"><b>Aankomst tegenstander</b></td><td style="padding:6px 8px">tegenstander: ${opponent}</td></tr>` : ""}
        </tbody>
      </table>
      ${
        matchType === "Uitwedstrijd"
          ? `<div style="background:#e8f4fc;padding:10px;border-radius:6px;margin-bottom:8px">
                <b>Carpool:</b> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen.<br>
                Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
            </div>`
          : ""
      }
    `;

    // Selectietabel
    const selectieTable = selectedSorted.length > 0 ? `
      <table style="width:100%;background:#f6f9f6;border-radius:8px;overflow:hidden;border:1px solid #a7f3d0;margin-top:20px">
        <thead><tr>
          <th style="padding:6px 8px;text-align:left">Rugnummer</th>
          <th style="padding:6px 8px;text-align:left">Naam speler</th>
          <th style="padding:6px 8px;text-align:left">Verantwoordelijke voor was, fruit & chocomelk</th>
        </tr></thead>
        <tbody>
          ${selectedSorted
            .map(
              ([name, num]) => `<tr>
                <td style="padding:6px 8px">${num}</td>
                <td style="padding:6px 8px">${name}</td>
                <td style="padding:6px 8px">${responsible === name ? "❌" : ""}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    ` : "";

    // Niet-geselecteerden
    const nietSelectieList = playerList
      .filter(p => !(p in selectedPlayers))
      .map(
        p =>
          `<tr><td style="padding:6px 8px">${p}</td><td style="padding:6px 8px">${nonSelectedReasons[p] || "Geen reden opgegeven"}</td></tr>`
      )
      .join("");

    const nietSelectieTable = nietSelectieList
      ? `<table style="width:100%;background:#fef6f6;border-radius:8px;overflow:hidden;border:1px solid #fecaca;margin-top:20px">
          <thead><tr>
            <th style="padding:6px 8px;text-align:left">Niet geselecteerd</th>
            <th style="padding:6px 8px;text-align:left">Reden</th>
          </tr></thead>
          <tbody>${nietSelectieList}</tbody>
        </table>`
      : "";

    const verantwoordelijkeText =
      responsible
        ? `<p style="margin-top:18px"><b>Verantwoordelijke voor was, fruit & chocomelk:</b> ${responsible}</p>`
        : "";

    const afsluit =
      `<p style="margin-top:16px"><b>Opmerking:</b> ${remark}</p>
       <p style="margin-top:40px">Sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 IP – KVE Drongen</p>`;

    setPreview(
      aanhef +
        detailsTable +
        selectieTable +
        nietSelectieTable +
        verantwoordelijkeText +
        afsluit
    );
  };

  // Kopieerfunctie zonder Preview-titel
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

  // UI
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

      {/* Selectie blok */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
          <h2 className="text-lg font-bold">Selectie</h2>
          <input
            ref={inputRef}
            type="text"
            className="p-2 rounded text-black w-full sm:w-60"
            placeholder="Zoek speler om toe te voegen..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredNotSelected.length > 0 && searchTerm && (
          <div className="bg-white text-black border rounded shadow max-h-44 overflow-auto mb-3">
            {filteredNotSelected.map(player => (
              <div key={player}
                className="flex items-center px-2 py-1 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelect(player)}
              >
                <input type="checkbox" checked={false} readOnly className="mr-2" />
                <span>{player}</span>
              </div>
            ))}
          </div>
        )}
        {/* Geselecteerde spelers als tabel */}
        {selectedSorted.length > 0 && (
          <table className="w-full bg-white text-black rounded mb-3">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Naam</th>
                <th className="px-2 py-1 text-left">Verantwoordelijk voor was, fruit & chocomelk</th>
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
        )}
        {/* Verantwoordelijke dropdown */}
        <label>
          Verantwoordelijke voor was, fruit & chocomelk
          <select value={responsible} onChange={e => setResponsible(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een speler</option>
            {selectedSorted.map(([player]) => <option key={player}>{player}</option>)}
          </select>
        </label>
      </div>

      {/* Niet-geselecteerden */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-2">Niet-geselecteerden</h2>
        <table className="w-full bg-white text-black rounded">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Naam</th>
              <th className="px-2 py-1 text-left">Reden</th>
            </tr>
          </thead>
          <tbody>
            {playerList
              .filter(p => !(p in selectedPlayers))
              .map(player => (
                <tr key={player}>
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
