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
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);

  // Selectie
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [addPlayer, setAddPlayer] = useState("");
  const [searchSelect, setSearchSelect] = useState("");

  // Voor sticky preview
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
    if (matchType === "Uitwedstrijd") setArrivalTimeOpponent("");
  }, [matchType]);

  // Player helpers
  const notSelected = playerList.filter(p => !(p in selectedPlayers));
  const selected = Object.keys(selectedPlayers);

  // Toevoegen met dropdown, met type-ahead zoeken
  function handleAddPlayer() {
    if (addPlayer && notSelected.includes(addPlayer)) {
      setSelectedPlayers(prev => ({ ...prev, [addPlayer]: "1" }));
      setAddPlayer("");
      setSearchSelect("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 600);
    }
  }

  function removeSelected(player: string) {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
  }

  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }

  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }

  const copyToClipboard = async () => {
    const el = document.querySelector("#preview");
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

  function generateEmail() {
    const selectionTableRows = selected
      .sort((a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b]))
      .map(player => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player]}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
            ${player === responsible ? "✅ Verantwoordelijk voor was, fruit & chocomelk" : ""}
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

    const opponentArrival = matchType === "Uitwedstrijd" && opponent && arrivalTimeOpponent
      ? `<tr><td style="font-weight:600;">Aankomst tegenstander:</td><td>${arrivalTimeOpponent} (${opponent})</td></tr>`
      : "";

    const carpoolText = matchType === "Uitwedstrijd"
      ? `<div style="margin-top:10px;background:#c6e6fb;padding:10px;border-radius:6px;border:1px solid #78a9d1;">
          <strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
        </div>` : "";

    const html = `
      <div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:auto;">
        <div style="background:#f9fafb;border-radius:12px;padding:18px 24px 10px 24px;margin-bottom:20px;box-shadow:0 2px 8px #0001;">
          <img src="/kve-logo.png" alt="KVE Drongen logo" style="width:85px;float:right;margin-left:12px;margin-bottom:12px;" />
          <p style="margin:0 0 12px 0;font-size:1.05em;color:#11294d;">Beste spelers en ouders,</p>
          <p style="margin:0 0 16px 0;color:#11294d;">Hieronder vinden jullie de info, selectie en afspraken voor de komende wedstrijd. Lees alles goed na en laat weten als er vragen zijn.</p>
        </div>
        <div style="background:#c6e6fb;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;color:#11294d;">Wedstrijddetails</h2>
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
        <div style="background:#eafaf1;border-radius:10px;padding:16px 20px;margin-bottom:18px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;color:#2076b9;">Selectie</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#bbe4fc;">
                <th style="text-align:left;padding:6px 12px;">Rugnummer</th>
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijk</th>
              </tr>
            </thead>
            <tbody>${selectionTableRows}</tbody>
          </table>
        </div>
        <div style="background:#fff7f7;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;color:#9a2424;">Niet geselecteerd</h2>
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
        <div style="background:#fffbe7;border-radius:8px;padding:14px 18px;">
          <p style="margin:0;"><strong>Opmerking:</strong> ${remark}</p>
        </div>
        <p style="margin-top:34px;margin-bottom:6px;color:#11294d;">Sportieve groeten,</p>
        <p style="margin:0;font-weight:600;color:#11294d;">Yannick Deraedt<br/>Trainer U15 IP – KVE Drongen</p>
      </div>
    `;
    setPreview(html);
    if (previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const filteredPlayers = notSelected.filter(p => p.toLowerCase().includes(searchSelect.toLowerCase()));

  return (
    <div className="p-3 md:p-8 min-h-screen" style={{ background: "#11294d" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">E-mail Generator – KVE Drongen</h1>
        {/* Invoer velden */}
        <div className="bg-[#c6e6fb] rounded-xl shadow-lg p-4 mb-8 space-y-3">
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
            <input
              type="text"
              value={gatheringPlace}
              onChange={e => setGatheringPlace(e.target.value)}
              className="w-full p-2 rounded text-black mt-1"
              placeholder={matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE"}
            />
          </label>
          {matchType === "Uitwedstrijd" && (
            <label className="block">Aankomstuur bij tegenstander
              <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
            </label>
          )}
        </div>

        {/* Selectie toevoegen */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-semibold mb-1 text-[#11294d]">Voeg speler toe aan selectie</div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Zoek speler..."
              value={searchSelect}
              onChange={e => setSearchSelect(e.target.value)}
              className="p-2 rounded text-black flex-1"
              autoComplete="off"
            />
            <select
              value={addPlayer}
              onChange={e => setAddPlayer(e.target.value)}
              className="p-2 rounded text-black flex-1"
            >
              <option value="">Kies een speler</option>
              {filteredPlayers.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={handleAddPlayer}
              className={`bg-[#2076b9] px-3 py-2 rounded text-white font-bold shadow ${success ? "scale-105 bg-green-600" : ""}`}
            >Toevoegen</button>
          </div>
        </div>

        {/* SELECTIEBLOK */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 text-[#2076b9]">Selectie</h2>
          {selected.length === 0 && <div className="italic text-gray-400 mb-2">Nog geen selectie.</div>}
          <div className="rounded-xl bg-[#eafaf1] overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: "#bbe4fc" }}>
                  <th className="p-2 text-left">Rugnummer</th>
                  <th className="p-2 text-left">Naam speler</th>
                  <th className="p-2 text-left">Verantwoordelijk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selected
                  .sort((a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b]))
                  .map(player => (
                    <tr key={player} className="hover:bg-green-100 transition">
                      <td className="p-2">
                        <select className="w-14 text-black" value={selectedPlayers[player]} onChange={e => handleRugnummer(player, e.target.value)}>
                          {jerseyNumbers.map(n => <option key={n}>{n}</option>)}
                        </select>
                      </td>
                      <td className="p-2">{player}</td>
                      <td className="p-2 text-center">
                        <input
                          type="radio"
                          name="verantwoordelijke"
                          checked={responsible === player}
                          onChange={() => setResponsible(player)}
                          className="scale-150 accent-[#2076b9]"
                          style={{ marginRight: 6 }}
                        />
                        <span className="ml-1 text-[#2076b9]">
                          {responsible === player && "✅"}
                        </span>
                        <span className="ml-2">{responsible === player && "Verantwoordelijk voor was, fruit & chocomelk"}</span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => removeSelected(player)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg"
                          aria-label="Verwijder uit selectie"
                        >✖</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NIET GESELECTEERDEN */}
        <div className="mb-10">
          <h2 className="font-bold text-lg mb-2 text-[#9a2424]">Niet-geselecteerden</h2>
          {notSelected.length === 0 && <div className="italic text-gray-400 mb-2">Iedereen is geselecteerd.</div>}
          <div className="rounded-xl bg-[#fff7f7] overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: "#ffd7d7" }}>
                  <th className="p-2 text-left">Naam speler</th>
                  <th className="p-2 text-left">Reden</th>
                </tr>
              </thead>
              <tbody>
                {notSelected.map(player => (
                  <tr key={player}>
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
        <div className="sticky bottom-0 bg-[#11294d] py-4 z-10 flex gap-4 border-t border-blue-900">
          <button
            onClick={generateEmail}
            className="bg-[#2076b9] hover:bg-[#3db2ff] text-white px-4 py-2 rounded font-bold mr-2 shadow"
          >Genereer e-mail</button>
          <button
            onClick={copyToClipboard}
            className={`bg-[#28be63] hover:bg-green-700 text-white px-4 py-2 rounded font-bold shadow ${success ? "scale-110" : ""}`}
          >Kopieer e-mail</button>
          {success && <span className="text-green-300 font-semibold px-3 self-center animate-pulse">✔️ Gekopieerd!</span>}
        </div>

        {/* PREVIEW */}
        <div className="bg-white text-black p-4 rounded mt-7 shadow" ref={previewRef} id="preview" style={{ border: '2px solid #2076b9' }}>
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  );
}
