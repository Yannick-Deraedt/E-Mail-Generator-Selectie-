import { useState, useEffect } from "react";
import FloatingCopyButton from "./FloatingCopyButton";
import Confetti from "./Confetti";
import clublogo from "./assets/clublogo.png";

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
  // STATES
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
  const [showConfetti, setShowConfetti] = useState(false);

  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [nonSelectedComments, setNonSelectedComments] = useState<Record<string, string>>({});
  const [searchSelect, setSearchSelect] = useState("");
  const [searchRugnummer, setSearchRugnummer] = useState("");
  const [showSelection, setShowSelection] = useState(true);
  const [showNotSelected, setShowNotSelected] = useState(true);

  // --- Verzamelplaats automatisch invullen ---
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
  }, [matchType, customGatheringPlace]);

  // --------- SELECTIE LOGICA ---------
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
  const usedNumbers = new Set(Object.values(selectedPlayers).filter(Boolean));
  const alleRugnummersUniek =
    selected.length === new Set(Object.values(selectedPlayers).filter(Boolean)).size
    && !selected.some(p => !selectedPlayers[p]);
  const maxSpelers = 15;

  function handleSelect(player: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: "" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedComments(prev => {
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
  }
  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }
  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }
  function handleNonSelectedComment(player: string, comment: string) {
    setNonSelectedComments(prev => ({ ...prev, [player]: comment }));
  }
  function handleResponsible(player: string) {
    setResponsible(player);
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
  // ---------- KOPIEER + KONFETTI ----------
  const copyToClipboard = async () => {
    const el = document.querySelector("#mailpreview-only");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      setSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setSuccess(false), 900);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  // -------- GENERATE EMAIL & LIVE PREVIEW --------
  function generateEmail() {
    if (!day || !date || !time || !opponent) {
      setPreview(`<div style="padding:16px;text-align:center;color:#a00;">Vul dag, datum, tijd en tegenstander in.</div>`);
      return;
    }
    // Themekleur afhankelijk van matchtype
    const hoofdKleur = matchType === "Uitwedstrijd"
      ? "#1679bc"
      : "#142c54";

    const selectionTableRows = selected.map(player => `
      <tr style="${responsible === player ? 'background:#e6ffe6;' : ''}">
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
          ${responsible === player ? "✅ Verantwoordelijk voor was, fruit & chocomelk" : ""}
        </td>
      </tr>
    `).join("");

    const nonSelectedTableRows = allNotSelected.map(player => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedReasons[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedComments[player] || ""}</td>
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
      <div style="font-family:sans-serif;line-height:1.6;max-width:640px;margin:auto;background:#fff;color:#222;border-radius:14px;box-shadow:0 2px 8px #0001;">
        <div style="background:${hoofdKleur};border-radius:12px 12px 0 0;padding:16px 24px 12px 24px;margin-bottom:20px; color:#fff;display:flex;align-items:center;">
          <img src="${clublogo}" alt="logo" style="height:46px;margin-right:18px;border-radius:12px;box-shadow:0 1px 7px #0003"/>
          <div>
            <div style="font-size:1.20em;font-weight:700;letter-spacing:1px;">KVE Drongen</div>
            <div style="font-size:1.02em;font-weight:400;opacity:0.97;">Wedstrijddetails & selectie</div>
          </div>
        </div>
        <div style="background:#e7effb;border-radius:10px;padding:14px 20px 8px 20px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:700;color:${hoofdKleur};">Wedstrijddetails</h2>
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
        <div style="background:#f1ffe9;border-radius:10px;padding:14px 20px;margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:700;color:#178530;">Selectie</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#d1f7b3;">
                <th style="text-align:left;padding:6px 12px;">Rugnummer</th>
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijk</th>
              </tr>
            </thead>
            <tbody>${selectionTableRows}</tbody>
          </table>
        </div>
        <div style="background:#fff7f7;border-radius:10px;padding:14px 20px;margin-bottom:14px;">
          <h2 style="margin:0 0 8px 0;font-size:1.1em;font-weight:700;color:#e66472;">Niet geselecteerd</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#ffd7d7;">
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Reden</th>
                <th style="text-align:left;padding:6px 12px;">Opmerking</th>
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
  }

  useEffect(() => {
    generateEmail();
    // eslint-disable-next-line
  }, [
    day, matchType, date, time, opponent, field, address, gatheringPlace, customGatheringPlace, gatheringTime,
    arrivalTimeOpponent, responsible, remark, selectedPlayers, nonSelectedReasons, nonSelectedComments
  ]);

  useEffect(() => {
    if (selected.length === 15) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1700);
    }
  }, [selected.length]);

  // ============ CLUB WATERMERK BACKGROUND =============
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background:
          "radial-gradient(circle at 68vw 30vh, rgba(32,89,190,0.12) 0, rgba(16,40,60,0.18) 100%), #162337",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* WATERMERK */}
      <img
        src={clublogo}
        alt="watermerk"
        style={{
          position: "fixed",
          zIndex: 0,
          right: "7vw",
          top: "10vh",
          width: "43vw",
          minWidth: 320,
          opacity: 0.055,
          pointerEvents: "none",
          filter: "blur(0.5px) grayscale(20%)",
          userSelect: "none"
        }}
        draggable={false}
      />
      <Confetti active={showConfetti} />
      {/* TITEL */}
      <div
        className="flex items-center mb-8"
        style={{
          minHeight: 88,
          background: "linear-gradient(90deg,#1558a7 60%,#68c6fa 100%)",
          borderRadius: 18,
          boxShadow: "0 2px 22px #1558a74a",
          padding: "12px 18px",
          margin: "0 auto 28px auto",
          maxWidth: 1100,
          width: "96vw",
          zIndex: 2,
          position: "relative",
        }}
      >
        <img
          src={clublogo}
          alt="KVE Drongen logo"
          style={{
            height: 62,
            marginRight: 24,
            borderRadius: 14,
            boxShadow: "0 2px 14px #0002, 0 0px 4px #2a90e6"
          }}
        />
        <div>
          <div
            style={{
              fontSize: "2.1rem",
              fontWeight: 900,
              letterSpacing: "1.5px",
              color: "#fff",
              textShadow: "0 3px 14px #1c397a85, 0 2px 2px #1558a7c8",
              fontFamily: "system-ui,Segoe UI,sans-serif"
            }}
          >
            E-mail Generator{" "}
            <span
              style={{
                fontWeight: 700,
                letterSpacing: 0,
                color: "#f7cf00",
                textShadow: "0 1px 2px #5557"
              }}
            >
              – KVE Drongen
            </span>
          </div>
          <div
            style={{
              fontSize: "1.10rem",
              fontWeight: 400,
              color: "#f3f8ff",
              textShadow: "0 1px 2px #2226"
            }}
          >
            Maak je selectie & verzend je clubmail in echte KVE-stijl
          </div>
        </div>
      </div>
      {/* MAIN BODY */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 10px 64px 10px",
          zIndex: 2,
          position: "relative"
        }}
      >
        {/* LINKS */}
        <div className="w-full md:w-1/2 p-2 md:pl-8">
          <div
            className="bg-white dark:bg-[#212f44] rounded-xl shadow p-4 mb-7"
            style={{
              border: "1.5px solid #c9e7fe",
              minWidth: 260,
              maxWidth: 460
            }}
          >
            <ul className="space-y-3">
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Dag <span className="text-red-500">*</span></label>
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 rounded text-black">
                  <option value="">Kies een dag</option>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Type wedstrijd</label>
                <select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black">
                  <option>Thuiswedstrijd</option>
                  <option>Uitwedstrijd</option>
                </select>
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Datum <span className="text-red-500">*</span></label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Start wedstrijd <span className="text-red-500">*</span></label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Tegenstander <span className="text-red-500">*</span></label>
                <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Terrein</label>
                <input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Adres</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Verzameltijd</label>
                <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Verzamelplaats</label>
                {!customGatheringPlace ? (
                  <select
                    value={gatheringPlace}
                    onChange={e => {
                      if (e.target.value === "__custom") setCustomGatheringPlace(true);
                      else setGatheringPlace(e.target.value);
                    }}
                    className="w-full p-2 rounded text-black"
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
                    className="w-full p-2 rounded text-black"
                    placeholder="Geef verzamelplaats op"
                    onBlur={() => { if (!gatheringPlace) setCustomGatheringPlace(false); }}
                  />
                )}
              </li>
              {matchType === "Uitwedstrijd" && (
                <li>
                  <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Aankomstuur bij tegenstander</label>
                  <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black" />
                </li>
              )}
              <li>
                <label className="block font-semibold mb-1 text-blue-900 dark:text-blue-200">Opmerking (algemeen)</label>
                <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
            </ul>
          </div>
          {/* SELECTIE */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">Selectie</h2>
              <button
                onClick={autoToewijzen}
                className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs font-semibold"
              >Auto-toewijs rugnummers</button>
            </div>
            {selected.length === 0 && <div className="italic text-gray-400 mb-2">Nog geen selectie.</div>}
            <input
              type="text"
              placeholder="Zoek speler in selectie..."
              value={searchRugnummer}
              onChange={e => setSearchRugnummer(e.target.value)}
              className="p-2 rounded text-black w-full mb-2"
              autoComplete="off"
            />
            <div className="rounded-xl bg-green-50 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Verwijder</th>
                    <th className="p-2 text-left">Rugnummer</th>
                    <th className="p-2 text-left">Naam speler</th>
                    <th className="p-2 text-left">Verantwoordelijk</th>
                  </tr>
                </thead>
                <tbody>
                  {selected
                    .filter(player => !searchRugnummer || player.toLowerCase().includes(searchRugnummer.toLowerCase()))
                    .map(player => (
                    <tr key={player} className="hover:bg-green-100 transition">
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
                        <select
                          className="w-14 text-black"
                          value={selectedPlayers[player]}
                          onChange={e => handleRugnummer(player, e.target.value)}
                        >
                          <option value="">Kies</option>
                          {jerseyNumbers.filter(n => !usedNumbers.has(n) || selectedPlayers[player] === n)
                            .map(n => <option key={n}>{n}</option>)}
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
                          <span className="ml-2">✅</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* NIET-GESELECTEERDEN */}
          <div className="mb-8">
            <div className="font-semibold mb-1">Niet-geselecteerden</div>
            <div className="font-semibold mb-1">Zoek & voeg spelers toe aan selectie</div>
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
                    <th className="p-2 text-left">Opmerking</th>
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
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full p-1 rounded text-black"
                          placeholder="Opmerking"
                          value={nonSelectedComments[player] || ""}
                          onChange={e => handleNonSelectedComment(player, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* RECHTS: LIVE PREVIEW */}
        <div className="w-full md:w-1/2 p-2 md:pr-8 pt-7 flex flex-col">
          <div className="bg-white dark:bg-[#172a45] text-black dark:text-blue-100 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-900"
            style={{ minHeight: 420 }}>
            <div id="mailpreview-only" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      </div>
      {/* FLOATING COPY BUTTON */}
      <FloatingCopyButton onClick={copyToClipboard} success={success} />
    </div>
  );
}
