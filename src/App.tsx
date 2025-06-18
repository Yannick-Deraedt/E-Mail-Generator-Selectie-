import { useState, useEffect, useRef } from "react";

// Spelers en keuzes
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
  // Invoervelden
  const [day, setDay] = useState("");
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringTime, setGatheringTime] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);

  // Selectie
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  // Voor sticky preview
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Suggestie gathering place bij switch, maar altijd aanpasbaar
    if (matchType === "Uitwedstrijd" && gatheringPlace === "Kleedkamer X") {
      setGatheringPlace("Parking KVE");
    }
    if (matchType === "Thuiswedstrijd" && gatheringPlace === "Parking KVE") {
      setGatheringPlace("Kleedkamer X");
    }
    if (matchType === "Uitwedstrijd") setArrivalTimeOpponent(""); // reset bij switch
  }, [matchType]);

  // Helpers
  const notSelected = playerList.filter(p => !(p in selectedPlayers));
  // Zoekfunctie
  const filteredNotSelected = [...notSelected].sort((a, b) => a.localeCompare(b));
  let visibleNotSelected = filteredNotSelected;
  if (search.trim()) {
    // Zet matchende bovenaan
    visibleNotSelected = [
      ...filteredNotSelected.filter(p => p.toLowerCase().includes(search.toLowerCase())),
      ...filteredNotSelected.filter(p => !p.toLowerCase().includes(search.toLowerCase()))
    ];
  }
  // SORTEREN OP RUGNUMMER voor selectie
  const selectedSorted = Object.entries(selectedPlayers)
    .sort((a, b) => Number(a[1]) - Number(b[1]));

  function handleSelect(player: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: "1" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setSearch(""); // Reset zoekveld na selectie
  }

  function handleDeselect(player: string) {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
    if (responsible === player) setResponsible("");
  }

  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }

  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }

  // Kopieerfunctie
  const copyToClipboard = async () => {
    const el = document.querySelector("#preview-html");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 800);
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  // Genereer email
  function generateEmail() {
    const selectionTableRows = selectedSorted
      .map(([player, nummer]) => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${nummer}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
            ${player === responsible ? "✅ Was, fruit & chocomelk meenemen" : ""}
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

    // Mail-opmaak
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
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijke</th>
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
        <div style="background:#fffbe6;border-radius:8px;padding:14px 18px;">
          <p style="margin:0;"><strong>Opmerking:</strong> ${remark}</p>
        </div>
        <p style="margin-top:34px;margin-bottom:6px;">Sportieve groeten,</p>
        <p style="margin:0;font-weight:600;">Yannick Deraedt<br/>Trainer U15 IP – KVE Drongen</p>
      </div>
    `;
    setPreview(html);
    if (previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="p-3 md:p-8 max-w-3xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-3">E-mail Generator – KVE Drongen</h1>
      {/* INVOERLIJST onder elkaar */}
      <div className="space-y-3 mb-7">
        <label className="block">Dag
          <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option value="">Kies een dag</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">Type wedstrijd
          <select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black mt-1">
            <option>Thuiswedstrijd</option>
            <option>Uitwedstrijd</option>
          </select>
        </label>
        <label className="block">Datum
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Start wedstrijd
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Tegenstander
          <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Terrein
          <input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Adres
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Verzameltijd
          <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
        <label className="block">Verzamelplaats
          <input type="text" value={gatheringPlace} onChange={e => setGatheringPlace(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
          <span className="text-xs text-gray-400 ml-1">{matchType === "Thuiswedstrijd" ? "bv. Kleedkamer X" : "Parking KVE"}</span>
        </label>
        {matchType === "Uitwedstrijd" && (
          <label className="block">Aankomstuur bij tegenstander
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
          </label>
        )}
        <label className="block font-semibold">Opmerking
          <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
      </div>

      {/* SELECTIEBLOK */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-2">Selectie</h2>
        {selectedSorted.length === 0 && <div className="italic text-gray-400 mb-2">Nog geen selectie.</div>}
        <div className="rounded-xl bg-green-50 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                <th className="p-2 text-left">Rugnummer</th>
                <th className="p-2 text-left">Naam speler</th>
                <th className="p-2 text-left">Verantwoordelijke</th>
              </tr>
            </thead>
            <tbody>
              {selectedSorted.map(([player, nummer]) => (
                <tr key={player} className="hover:bg-green-100 transition">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleDeselect(player)}
                      style={{ width: 22, height: 22, accentColor: "#22c55e", cursor: "pointer" }}
                      title="Verwijder uit selectie"
                    />
                  </td>
                  <td className="p-2">
                    <select className="w-14 text-black" value={nummer} onChange={e => handleRugnummer(player, e.target.value)}>
                      {jerseyNumbers.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </td>
                  <td className="p-2">{player}</td>
                  <td className="p-2 text-center">
                    <input
                      type="radio"
                      checked={responsible === player}
                      onChange={() => setResponsible(player)}
                      style={{ width: 20, height: 20, accentColor: "#fbbf24", cursor: "pointer", marginRight: 6 }}
                      title="Vink aan als verantwoordelijk"
                    />
                    <span className="text-sm">{responsible === player ? "✅ Was, fruit & chocomelk" : ""}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NIET GESELECTEERDEN */}
      <div className="mb-10">
        <h2 className="font-bold text-lg mb-2">Niet-geselecteerden</h2>
        <div className="mb-2 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Zoek speler..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 rounded text-black"
            style={{ minWidth: 180 }}
            autoComplete="off"
          />
          <span className="text-xs text-gray-400">(selecteren via checkbox)</span>
        </div>
        <div className="rounded-xl bg-red-50 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                <th className="p-2 text-left">Naam speler</th>
                <th className="p-2 text-left">Reden</th>
              </tr>
            </thead>
            <tbody>
              {visibleNotSelected.map(player => (
                <tr key={player}>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleSelect(player)}
                      style={{ width: 22, height: 22, accentColor: "#ef4444", cursor: "pointer" }}
                      title="Zet in selectie"
                    />
                  </td>
                  <td className="p-2">{player}</td>
                  <td className="p-2">
                    <select
                      className="w-full text-black"
                      value={nonSelectedReasons[player] || ""}
                      onChange={e => handleNonSelectedReason(player, e.target.value)}
                    >
                      <option value="">Reden niet geselecteerd</option>
                      {nonSelectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIEKNOPPEN */}
      <div className="sticky bottom-0 bg-gray-900 py-4 z-10 flex gap-4 border-t border-gray-700">
        <button
          onClick={generateEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold mr-2 shadow"
        >Genereer e-mail</button>
        <button
          onClick={copyToClipboard}
          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold shadow ${success ? "scale-110" : ""}`}
        >Kopieer e-mail</button>
        {success && <span className="text-green-400 font-semibold px-3 self-center animate-pulse">✔️ Gekopieerd!</span>}
      </div>

      {/* PREVIEW */}
      <div className="bg-white text-black p-4 rounded mt-7 shadow" ref={previewRef} id="preview-html">
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
