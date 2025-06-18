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
  // Basis states
  const [day, setDay] = useState("");
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [customGatheringPlace, setCustomGatheringPlace] = useState(false);
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);

  // Selectie-gerelateerd
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [playerComments, setPlayerComments] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [searchSelect, setSearchSelect] = useState("");
  const [searchRugnummer, setSearchRugnummer] = useState("");
  const [showSelection, setShowSelection] = useState(true);
  const [showNotSelected, setShowNotSelected] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);

  // Verzamelplaats dropdown smartness
  useEffect(() => {
    if (!customGatheringPlace) {
      if (matchType === "Uitwedstrijd") {
        if (!gatheringPlace || gatheringPlace.trim().toLowerCase().includes("kleedkamer")) {
          setGatheringPlace("Parking KVE");
        }
      } else {
        if (!gatheringPlace || gatheringPlace.trim().toLowerCase().includes("parking")) {
          setGatheringPlace("Kleedkamer X");
        }
      }
    }
    // eslint-disable-next-line
  }, [matchType, customGatheringPlace]);

  // Geselecteerd + zoeklogica
  const allNotSelected = playerList.filter(p => !(p in selectedPlayers));
  let sortedNotSelected = [...allNotSelected];
  if (searchSelect.trim()) {
    const top = sortedNotSelected.filter(p => p.toLowerCase().includes(searchSelect.toLowerCase()));
    const rest = sortedNotSelected.filter(p => !p.toLowerCase().includes(searchSelect.toLowerCase()));
    sortedNotSelected = [...top, ...rest];
  }
  const selected = Object.keys(selectedPlayers).sort(
    (a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b])
  );

  // Unieke rugnummers check
  const usedNumbers = new Set(Object.values(selectedPlayers).filter(Boolean));
  const alleRugnummersUniek =
    selected.length === new Set(Object.values(selectedPlayers).filter(Boolean)).size
    && !selected.some(p => !selectedPlayers[p]);

  // Selectie max 15 waarschuwing
  const maxSpelers = 15;

  // Functies
  function handleSelect(player: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: "" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setSearchSelect("");
  }
  function removeSelected(player: string) {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedReasons(prev => ({ ...prev, [player]: "" }));
    setPlayerComments(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
  }
  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }
  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }
  function handleResponsible(player: string) {
    setResponsible(player);
  }
  function handlePlayerComment(player: string, comment: string) {
    setPlayerComments(prev => ({ ...prev, [player]: comment }));
  }
  function autoToewijzen() {
    let vrijeNummers = jerseyNumbers.filter(n => !Object.values(selectedPlayers).includes(n));
    let i = 0;
    setSelectedPlayers(prev => {
      const nieuw = {...prev};
      for (let p of Object.keys(nieuw)) {
        if (!nieuw[p] && vrijeNummers[i]) nieuw[p] = vrijeNummers[i++];
      }
      return nieuw;
    });
  }
  const copyToClipboard = async () => {
    const el = document.querySelector("#mailpreview-only");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1000);
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  function generateEmail() {
    if (!day || !date || !time || !opponent) {
      alert("Vul dag, datum, tijd en tegenstander in voordat je de e-mail genereert.");
      return;
    }

    const selectionTableRows = selected.map(player => `
      <tr style="${responsible === player ? 'background:#e6ffe6;' : ''}">
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
          ${responsible === player ? "✅ Verantwoordelijk voor was, fruit & chocomelk" : ""}
        </td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${playerComments[player] || ""}</td>
      </tr>
    `).join("");

    const nonSelectedTableRows = allNotSelected.map(player => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedReasons[player] || "-"}</td>
      </tr>
    `).join("");

    const opponentArrival = matchType === "Uitwedstrijd" && opponent && arrivalTimeOpponent
      ? `<tr><td style="font-weight:600;">Aankomst tegenstander:</td><td><strong>${arrivalTimeOpponent} (${opponent})</strong></td></tr>`
      : "";

    const carpoolText = matchType === "Uitwedstrijd"
      ? `<div style="margin-top:10px;background:#e8f4fc;padding:10px;border-radius:6px;border:1px solid #c0e6fa;">
          <strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
        </div>` : "";

    const html = `
      <div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:auto;background:#fff;color:#222;border-radius:14px;box-shadow:0 2px 8px #0001;">
        <div style="background:#f9fafb;border-radius:12px;padding:18px 24px 10px 24px;margin-bottom:20px;">
          <p style="margin:0 0 12px 0;font-size:1.05em">Beste spelers en ouders,</p>
          <p style="margin:0 0 16px 0;">Hieronder vinden jullie de info, selectie en afspraken voor de komende wedstrijd. Lees alles goed na en laat weten als er vragen zijn.</p>
        </div>
        <div style="background:#e7effb;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:600;">Wedstrijddetails</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="font-weight:600;width:175px;">Dag:</td><td><strong>${day}</strong></td></tr>
            <tr><td style="font-weight:600;">Type wedstrijd:</td><td><strong>${matchType}</strong></td></tr>
            <tr><td style="font-weight:600;">Datum:</td><td><strong>${date}</strong></td></tr>
            <tr><td style="font-weight:600;">Start wedstrijd:</td><td><strong>${time}</strong></td></tr>
            <tr><td style="font-weight:600;">Tegenstander:</td><td><strong>${opponent}</strong></td></tr>
            <tr><td style="font-weight:600;">Terrein:</td><td>${field}</td></tr>
            <tr><td style="font-weight:600;">Adres:</td><td>${address}</td></tr>
            <tr><td style="font-weight:600;">Verzamelen:</td><td><strong>${gatheringTime}</strong> aan <strong>${gatheringPlace}</strong></td></tr>
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
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijk</th>
                <th style="text-align:left;padding:6px 12px;">Opmerking</th>
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
        <br/><br/>
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
      {/* ----------- FORM START ----------- */}
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
          {!customGatheringPlace ? (
            <select
              value={gatheringPlace}
              onChange={e => {
                if (e.target.value === "__custom") setCustomGatheringPlace(true);
                else setGatheringPlace(e.target.value);
              }}
              className="w-full p-2 rounded text-black mt-1"
            >
              <option value="">Kies verzamelplaats</option>
              <option value="Kleedkamer X">Kleedkamer X</option>
              <option value="Parking KVE">Parking KVE</option>
              <option value="__custom">Andere (manueel invullen)</option>
            </select>
          ) : (
            <input
              type="text"
              value={gatheringPlace}
              onChange={e => setGatheringPlace(e.target.value)}
              className="w-full p-2 rounded text-black mt-1"
              placeholder="Geef verzamelplaats op"
              onBlur={() => { if (!gatheringPlace) setCustomGatheringPlace(false); }}
            />
          )}
        </label>
        {matchType === "Uitwedstrijd" && (
          <label className="block">Aankomstuur bij tegenstander
            <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
          </label>
        )}
        <label className="block">Opmerking
          <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black mt-1" />
        </label>
      </div>
      {/* ----------- SELECTIE INFO & UX ----------- */}
      <div className="mb-2 text-lg">
        Geselecteerd: <span className="font-bold">{selected.length}</span> / {playerList.length}
        {selected.length > maxSpelers &&
          <span className="ml-2 px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold">⚠️ Meer dan 15 geselecteerd!</span>
        }
      </div>
      {selected.length > 0 && (
        <div className={`mb-2 px-2 py-1 rounded font-bold 
          ${alleRugnummersUniek 
          ? 'bg-green-200 text-green-900' 
          : 'bg-red-200 text-red-900'}`}>
          {alleRugnummersUniek
            ? '✅ Alle rugnummers zijn uniek'
            : '❌ Er zijn dubbele of ontbrekende rugnummers'}
        </div>
      )}
      {/* ----------- SELECTIE COLLAPSIBLE ----------- */}
      <button className="font-bold mb-2 px-2 py-1 bg-blue-800 hover:bg-blue-700 rounded"
        onClick={() => setShowSelection(s => !s)}>
        {showSelection ? "▼" : "►"} Selectie ({selected.length})
      </button>
      {showSelection && (
      <div className="mb-6">
        {/* Live search + auto-vul */}
        <div className="mb-2 flex flex-col md:flex-row gap-2 items-center">
          <input
            type="text"
            className="p-2 rounded text-black w-40"
            placeholder="Zoek rugnummer..."
            value={searchRugnummer}
            onChange={e => setSearchRugnummer(e.target.value)}
          />
          <button
            onClick={autoToewijzen}
            className="bg-blue-600 text-white px-3 py-2 rounded ml-2 font-bold"
          >
            Vul rugnummers op volgorde
          </button>
        </div>
        <div className="rounded-xl bg-green-50 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Selectie</th>
                <th className="p-2 text-left">Rugnummer</th>
                <th className="p-2 text-left">Naam speler</th>
                <th className="p-2 text-left">Verantwoordelijk</th>
                <th className="p-2 text-left">Opmerking</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selected
                .filter(player => !searchRugnummer.trim() || (selectedPlayers[player] && selectedPlayers[player].includes(searchRugnummer)))
                .map(player => (
                <tr key={player} className={`transition ${responsible === player ? "bg-green-200" : "hover:bg-green-100"}`}>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      className="w-6 h-6"
                      checked={true}
                      onChange={() => removeSelected(player)}
                      aria-label={`Verwijder ${player} uit selectie`}
                    />
                  </td>
                  <td className="p-2">
                    <select className="w-14 text-black" value={selectedPlayers[player]} onChange={e => handleRugnummer(player, e.target.value)}>
                      <option value="">--</option>
                      {jerseyNumbers.map(n => (
                        <option key={n} value={n} disabled={usedNumbers.has(n) && selectedPlayers[player] !== n}>{n}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">{player}</td>
                  <td className="p-2 text-center">
                    <input
                      type="radio"
                      name="verantwoordelijke"
                      checked={responsible === player}
                      onChange={() => handleResponsible(player)}
                    />
                    {responsible === player && (
                      <span className="ml-2">✅ Verantwoordelijk voor was, fruit & chocomelk</span>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={playerComments[player] || ""}
                      onChange={e => handlePlayerComment(player, e.target.value)}
                      placeholder="Opmerking"
                      className="w-32 md:w-48 p-1 rounded text-black"
                    />
                  </td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {/* ----------- NIET-GESELECTEERDEN COLLAPSIBLE ----------- */}
      <button className="font-bold mb-2 px-2 py-1 bg-red-800 hover:bg-red-700 rounded"
        onClick={() => setShowNotSelected(s => !s)}>
        {showNotSelected ? "▼" : "►"} Niet-geselecteerden ({sortedNotSelected.length})
      </button>
      {showNotSelected && (
      <div className="mb-10">
        <div className="font-semibold mb-1">Zoek en selecteer spelers</div>
        <input
          type="text"
          placeholder="Zoek speler..."
          value={searchSelect}
          onChange={e => setSearchSelect(e.target.value)}
          className="p-2 rounded text-black w-full mb-2"
          autoComplete="off"
        />
        <div className="rounded-xl bg-red-50 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Selecteer</th>
                <th className="p-2 text-left">Naam speler</th>
                <th className="p-2 text-left">Reden niet geselecteerd</th>
              </tr>
            </thead>
            <tbody>
              {sortedNotSelected.map(player => (
                <tr key={player}>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      className="w-6 h-6"
                      checked={false}
                      onChange={() => handleSelect(player)}
                      aria-label={`Selecteer ${player}`}
                    />
                  </td>
                  <td className="p-2">
                    <span className={player.toLowerCase().includes(searchSelect.toLowerCase()) && searchSelect ? "bg-yellow-200 px-1 rounded" : ""}>
                      {player}
                    </span>
                  </td>
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
      )}
      {/* ----------- WAARSCHUWING + KNOPPEN ----------- */}
      {selected.some(p => !selectedPlayers[p]) && (
        <p className="text-yellow-300 font-semibold mb-2">⚠️ Sommige spelers hebben nog geen rugnummer!</p>
      )}
      <div className="sticky bottom-0 bg-gray-900 py-4 z-10 flex gap-4 border-t border-gray-700">
        <button
          onClick={generateEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold mr-2 text-lg shadow"
        >Genereer e-mail</button>
        <button
          onClick={copyToClipboard}
          className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold text-lg shadow ${success ? "scale-110" : ""}`}
        >Kopieer e-mail</button>
        {success && <span className="text-green-400 font-semibold px-3 self-center animate-pulse">✔️ Gekopieerd!</span>}
      </div>
      {/* ----------- PREVIEW ----------- */}
      <div className="overflow-x-auto bg-white text-black p-4 rounded mt-7 shadow" ref={previewRef}>
        <div id="mailpreview-only" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
