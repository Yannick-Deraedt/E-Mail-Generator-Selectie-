import { useState, useEffect, useRef } from "react";
import FloatingCopyButton from "./FloatingCopyButton";
import Confetti from "./Confetti";
import clublogo from "./assets/clublogo.png";

// ====== SETTINGS ======
const MAX_PLAYERS = 15; // 14 veldspelers + 1 keeper
const AUTO_ARRIVAL_OFFSET_MIN = 75; // 1u15 voor aftrap

// Rugnummers: 1..17 + 25 (tweede keeperstrui)
const jerseyNumbers = Array.from({ length: 17 }, (_, i) => (i + 1).toString()).concat("25");
const nonSelectionReasons = [
  "Geblesseerd", "Ziek", "Afwezig", "Beurtrol", "Op vakantie",
  "GU15","Stand-by GU15", "1x getraind", "Schoolverplichtingen",
  "Te laat afgemeld/niet verwittigd", "Geschorst", "Andere reden"
];
const days = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ====== HELPERS ======
function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function timeMinusMinutes(hhmm: string, minutes: number): string {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setMinutes(d.getMinutes() - minutes);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function App() {
  // ====== Kernspelers & keepers laden ======
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [keeperList, setKeeperList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/squad_players.txt")
      .then(r => r.text())
      .then(t => {
        const arr = t.split("\n").map(s => s.trim()).filter(Boolean);
        setPlayerList(Array.from(new Set(arr)).sort());
      })
      .catch(e => console.error("Error loading squad_players.txt:", e));
  }, []);
  useEffect(() => {
    fetch("/keepers.txt")
      .then(r => r.text())
      .then(t => {
        const arr = t.split("\n").map(s => s.trim()).filter(Boolean);
        setKeeperList(Array.from(new Set(arr)).sort());
      })
      .catch(e => console.error("Error loading keepers.txt:", e));
  }, []);

  // ====== STATE ======
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  // Aankomsttijd = start - 75' (overschrijfbaar)
  const [arrivalTime, setArrivalTime] = useState("");
  const [autoArrivalEnabled, setAutoArrivalEnabled] = useState(true);
  const prevTimeRef = useRef<string>("");

  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [customGatheringPlace, setCustomGatheringPlace] = useState(false);
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen! Geen ID = Niet spelen!");

  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // selectie
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [nonSelectedComments, setNonSelectedComments] = useState<Record<string, string>>({});
  const [searchSelect, setSearchSelect] = useState("");
  const [searchRugnummer, setSearchRugnummer] = useState("");
  const [showSelection, setShowSelection] = useState(true);
  const [showNotSelected, setShowNotSelected] = useState(true);

  // Weekdag syncen bij datum
  const handleDateChange = (val: string) => {
    setDate(val);
    const parsed = new Date(val);
    setDay(days[parsed.getDay()]);
  };

  // Automatische verzamelplaats
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
  }, [matchType, customGatheringPlace, gatheringPlace]);

  // Automatische AANKOMSTtijd = 1u15 voor kickoff (blijft aan tot je 'm manueel wijzigt)
  useEffect(() => {
    if (!time) return;
    if (autoArrivalEnabled || prevTimeRef.current !== time) {
      const auto = timeMinusMinutes(time, AUTO_ARRIVAL_OFFSET_MIN);
      setArrivalTime(auto);
      prevTimeRef.current = time;
    }
  }, [time, autoArrivalEnabled]);

  // ====== LOGICA ======
  const isKeeper = (name: string) => keeperList.includes(name);

  // Niet-geselecteerd (veldspelers) – keepers beheren apart
  const allNotSelectedField = playerList.filter(p => !(p in selectedPlayers));
  let sortedNotSelectedField = [...allNotSelectedField];
  if (searchSelect.trim()) {
    const s = searchSelect.toLowerCase();
    const top = sortedNotSelectedField.filter(p => p.toLowerCase().includes(s));
    const rest = sortedNotSelectedField.filter(p => !p.toLowerCase().includes(s));
    sortedNotSelectedField = [...top, ...rest];
  }

  // Keepers die nog niet geselecteerd zijn
  const availableKeepers = keeperList.filter(k => !(k in selectedPlayers));

  const selected = Object.keys(selectedPlayers).sort(
    (a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b])
  );
  const usedNumbers = new Set(Object.values(selectedPlayers).filter(Boolean));
  const alleRugnummersUniek =
    selected.length === new Set(Object.values(selectedPlayers).filter(Boolean)).size &&
    !selected.some(p => !selectedPlayers[p]);

  function handleSelect(player: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: "" }));
    setNonSelectedReasons(prev => { const n = { ...prev }; delete n[player]; return n; });
    setNonSelectedComments(prev => { const n = { ...prev }; delete n[player]; return n; });
    setSearchSelect("");
  }
  function removeSelected(player: string) {
    setSelectedPlayers(prev => { const n = { ...prev }; delete n[player]; return n; });
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
    const vrije = jerseyNumbers.filter(n => !Object.values(selectedPlayers).includes(n));
    let i = 0;
    setSelectedPlayers(prev => {
      const nieuw = { ...prev };
      for (const p of Object.keys(nieuw)) {
        if (!nieuw[p] && vrije[i]) nieuw[p] = vrije[i++];
      }
      return nieuw;
    });
  }

  // Kopiëren + confetti
  const copyToClipboard = async () => {
    const el = document.querySelector("#mailpreview-only");
    if (el && navigator.clipboard && (window as any).ClipboardItem) {
      const html = (el as HTMLElement).innerHTML;
      await navigator.clipboard.write([
        new (window as any).ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      setSuccess(true);
      setShowConfetti(true);
      window.setTimeout(() => setSuccess(false), 2500);
      window.setTimeout(() => setShowConfetti(false), 15000);
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  // ====== EMAIL PREVIEW ======
  function generateEmail() {
    if (!date || !time || !opponent) {
      setPreview(`<div style="padding:16px;text-align:center;color:#a00;">Vul datum, tijd en tegenstander in.</div>`);
      return;
    }
    const hoofdKleur = matchType === "Uitwedstrijd" ? "#1679bc" : "#142c54";
    const arrivalLabel = matchType === "Uitwedstrijd" ? "Aankomst bij tegenstander" : "Aankomst (kleedkamer)";

    let detailsRows = `
      <tr><td style="font-weight:600;width:175px;">Dag:</td><td><strong>${day}</strong></td></tr>
      <tr><td style="font-weight:600;">Type wedstrijd:</td><td><strong>${matchType}</strong></td></tr>
      <tr>
        <td style="font-weight:600;">Datum:</td>
        <td><strong>${new Date(date).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" })}</strong></td>
      </tr>
      <tr><td style="font-weight:600;">Start wedstrijd:</td><td><strong>${time}</strong></td></tr>
      <tr><td style="font-weight:600;">${arrivalLabel}:</td><td><strong>${arrivalTime || "-"}</strong></td></tr>
      <tr><td style="font-weight:600;">Tegenstander:</td><td><strong>${opponent}</strong></td></tr>
      <tr><td style="font-weight:600;">Terrein:</td><td>${field}</td></tr>
    `;

    if (matchType === "Uitwedstrijd") {
      detailsRows += `
        <tr><td style="font-weight:600;">Adres:</td><td>${address}</td></tr>
        <tr><td style="font-weight:600;">Verzamelplaats:</td><td><strong>${gatheringPlace}</strong></td></tr>
      `;
    } else {
      detailsRows += `
        <tr><td style="font-weight:600;">Kleedkamer:</td><td><strong>${gatheringPlace || "Kleedkamer X"}</strong></td></tr>
      `;
    }

    const selectionTableRows = selected.map(player => `
      <tr style="${responsible === player ? 'background:#e6ffe6;box-shadow:0 0 0 2px #39f7;filter:drop-shadow(0 0 6px #80ee90);' : ''}">
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
          ${responsible === player ? "✅ Verantwoordelijk voor was, fruit & chocomelk" : ""}
        </td>
      </tr>
    `).join("");

    const nonSelectedTableRows = playerList
      .filter(p => !(p in selectedPlayers))
      .map(player => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${player}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedReasons[player] || "-"}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedComments[player] || ""}</td>
        </tr>
      `).join("");

    const html = `
      <div style="font-family:sans-serif;line-height:1.6;max-width:640px;margin:auto;background:#fff;color:#222;border-radius:16px;box-shadow:0 8px 32px #284cff11;">
        <div style="background:${hoofdKleur};border-radius:16px 16px 0 0;padding:18px 28px 14px 28px;margin-bottom:20px; color:#fff;display:flex;align-items:center;">
          <img src="https://i.imgur.com/cgvdj96.png" alt="logo" style="height:48px;margin-right:18px;border-radius:13px;box-shadow:0 1px 7px #0003"/>
          <div>
            <div style="font-size:1.22em;font-weight:700;letter-spacing:1px;">KVE Drongen</div>
            <div style="font-size:1.05em;font-weight:400;opacity:0.97;">Wedstrijddetails & selectie</div>
          </div>
        </div>
        <div style="background:#e7effb;border-radius:11px;padding:16px 22px 10px 22px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:${hoofdKleur};">Wedstrijddetails</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${detailsRows}
          </table>
        </div>
        <div style="background:#f1ffe9;border-radius:11px;padding:15px 22px;margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:#178530;">Selectie</h2>
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
        <div style="background:#fff7f7;border-radius:11px;padding:15px 22px;margin-bottom:14px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:#e66472;">Niet geselecteerd (veldspelers)</h2>
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
        <p style="margin:0;font-weight:600;">Yannick Deraedt<br/>Trainer IPU15 – KVE Drongen</p>
        <p style="margin:0;font-weight:600;">0487888086</p>
      </div>
    `;
    setPreview(html);
  }

  useEffect(() => {
    generateEmail();
    // eslint-disable-next-line
  }, [
    matchType, date, time, opponent, field, address, gatheringPlace, customGatheringPlace,
    responsible, remark, selectedPlayers, nonSelectedReasons, nonSelectedComments, day, arrivalTime
  ]);

  // ====== CONFETTI TRIGGER: exact 14 veldspelers + 1 keeper ======
  useEffect(() => {
    const total = selected.length;
    const keepersInSelection = selected.filter(p => isKeeper(p)).length;
    const fieldPlayers = total - keepersInSelection;
    const exactlyDesired = (total === 15 && keepersInSelection === 1 && fieldPlayers === 14);
    if (exactlyDesired) {
      setShowConfetti(true);
      const t = window.setTimeout(() => setShowConfetti(false), 15000);
      return () => window.clearTimeout(t);
    }
  }, [selected]);

  // ====== RENDER ======
  return (
    <>
      {/* Watermerk met duidelijke "breathing" */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 0,
          background: `url(${clublogo}) center center no-repeat`,
          backgroundSize: "56vw",
          opacity: 0.28,
          animation: "watermark-fade 6.5s ease-in-out infinite alternate",
          pointerEvents: "none"
        }}
      />

      {/* Confetti-layer */}
      <Confetti active={showConfetti} duration={15000} />

      <div className="flex flex-col md:flex-row gap-4 w-full p-0 m-0" style={{ position: "relative", zIndex: 1 }}>
        {/* LINKERDEEL */}
        <div className="w-full md:w-1/2 p-3 md:pl-8 pt-6 md:pt-10 flex flex-col">

          {/* Titel */}
          <div className="flex items-center mb-4" style={{ position: "relative", zIndex: 2 }}>
            <img src={clublogo} alt="clublogo" style={{ height: 54, marginRight: 16, borderRadius: 14, boxShadow: "0 1px 8px #2166aa55" }} />
            <span style={{ fontSize: "2.1rem", fontWeight: 900, letterSpacing: "1.5px", color: "#142c54",
              textShadow: "0 1px 16px #fff7, 0 1px 2px #0d183799", padding: "2px 7px", borderRadius: "8px" }}>
              E-mail Generator – KVE Drongen
            </span>
          </div>

          {/* Wedstrijdgegevens */}
          <div className="bg-blue-50 rounded-xl p-4 shadow mb-6">
            <ul className="space-y-4">
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Type wedstrijd <span className="text-red-500">*</span></label>
                <select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black">
                  <option>Thuiswedstrijd</option>
                  <option>Uitwedstrijd</option>
                </select>
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Datum <span className="text-red-500">*</span></label>
                <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Start wedstrijd <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={time}
                  onChange={e => { setTime(e.target.value); setAutoArrivalEnabled(true); }}
                  className="w-full p-2 rounded text-black"
                />
                <small className="text-blue-900 block mt-1 opacity-80">
                  <strong>Aankomsttijd</strong> wordt automatisch op {AUTO_ARRIVAL_OFFSET_MIN} min vóór de aftrap gezet (kan je overschrijven).
                </small>
              </li>

              {/* Aankomsttijd (auto –75') */}
              <li>
                <label className="block font-semibold mb-1 text-blue-800">
                  {matchType === "Uitwedstrijd" ? "Aankomst bij tegenstander" : "Aankomst (kleedkamer)"}
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={e => { setArrivalTime(e.target.value); setAutoArrivalEnabled(false); }}
                  className="w-full p-2 rounded text-black"
                />
              </li>

              <li>
                <label className="block font-semibold mb-1 text-blue-800">Tegenstander <span className="text-red-500">*</span></label>
                <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>

              <li>
                <label className="block font-semibold mb-1 text-blue-800">Terrein</label>
                <input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>

              {matchType === "Uitwedstrijd" && (
                <>
                  <li>
                    <label className="block font-semibold mb-1 text-blue-800">Adres</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black" />
                  </li>
                </>
              )}

              {/* Verzamelplaats (blijft bestaan, zonder tijd) */}
              <li>
                <label className="block font-semibold mb-1 text-blue-800">
                  {matchType === "Uitwedstrijd" ? "Verzamelplaats" : "Kleedkamer"}
                </label>
                {!customGatheringPlace ? (
                  <select
                    value={gatheringPlace}
                    onChange={e => {
                      if (e.target.value === "__custom") setCustomGatheringPlace(true);
                      else setGatheringPlace(e.target.value);
                    }}
                    className="w-full p-2 rounded text-black"
                  >
                    <option value="">Kies plaats</option>
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
                    placeholder="Geef plaats op"
                    onBlur={() => { if (!gatheringPlace) setCustomGatheringPlace(false); }}
                  />
                )}
              </li>

              <li>
                <label className="block font-semibold mb-1 text-blue-800">Opmerking (algemeen)</label>
                <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
            </ul>
          </div>

          {/* Keepers (NA wedstrijdinfo) */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-blue-900 mb-2">Keepers</h3>
            <div className="rounded-xl bg-blue-50 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Selecteer</th>
                    <th className="p-2 text-left">Naam keeper</th>
                    <th className="p-2 text-left">Reden niet geselecteerd & opmerking</th>
                  </tr>
                </thead>
                <tbody>
                  {availableKeepers.map(keeper => (
                    <tr key={keeper}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-6 h-6"
                          checked={false}
                          onChange={() => handleSelect(keeper)}
                          aria-label={`Selecteer ${keeper}`}
                        />
                      </td>
                      <td className="p-2">{keeper}</td>
                      <td className="p-2">
                        <select
                          className="w-full text-black"
                          value={nonSelectedReasons[keeper] || ""}
                          onChange={e => handleNonSelectedReason(keeper, e.target.value)}
                        >
                          <option value="">Reden niet geselecteerd</option>
                          {nonSelectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input
                          type="text"
                          className="w-full mt-1 p-1 rounded text-black"
                          placeholder="Extra opmerking (optioneel)"
                          value={nonSelectedComments[keeper] || ""}
                          onChange={e => handleNonSelectedComment(keeper, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tellers & checks */}
          <div className="mb-2 text-lg text-blue-900">
            Geselecteerd: <span className="font-bold">{selected.length}</span> / {MAX_PLAYERS}
            {selected.length > MAX_PLAYERS &&
              <span className="ml-2 px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold animate-bounce">
                ⚠️ Meer dan {MAX_PLAYERS} geselecteerd!
              </span>
            }
          </div>

          {selected.length > 0 && (
            <div className={`mb-2 px-2 py-1 rounded font-bold 
              ${alleRugnummersUniek ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900 animate-pulse'}`}>
              {alleRugnummersUniek ? '✅ Alle rugnummers zijn uniek' : '❌ Er zijn dubbele of ontbrekende rugnummers'}
            </div>
          )}

          {/* Selectie tabel */}
          <button className="font-bold mb-2 px-2 py-1 bg-blue-700 hover:bg-blue-900 rounded text-white transition-all"
            onClick={() => setShowSelection(s => !s)}>
            {showSelection ? "▼" : "►"} Selectie ({selected.length})
          </button>

          {showSelection && (
            <div className="mb-6">
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
                  className="bg-blue-600 text-white px-3 py-2 rounded ml-2 font-bold hover:bg-blue-900 transition-all"
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected
                      .filter(player => !searchRugnummer.trim() || (selectedPlayers[player] && selectedPlayers[player].includes(searchRugnummer)))
                      .map(player => (
                        <tr key={player} className={`transition-all ${responsible === player ? "bg-green-200" : "hover:bg-green-100"}`}>
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
                          <td className="p-2"></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Niet-geselecteerden (veldspelers) */}
          <button className="font-bold mb-2 px-2 py-1 bg-red-700 hover:bg-red-900 rounded text-white transition-all"
            onClick={() => setShowNotSelected(s => !s)}>
            {showNotSelected ? "▼" : "►"} Niet-geselecteerden (veldspelers) ({sortedNotSelectedField.length})
          </button>

          {showNotSelected && (
            <div className="mb-8">
              <h3 className="font-semibold mb-1 text-blue-900">Zoek en selecteer spelers</h3>
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
                      <th className="p-2 text-left">Reden niet geselecteerd & Opmerking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedNotSelectedField.map(player => (
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
                          <input
                            type="text"
                            className="w-full mt-1 p-1 rounded text-black"
                            placeholder="Extra opmerking (optioneel)"
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
          )}

        </div>

        {/* RECHTS: PREVIEW */}
        <div className="w-full md:w-1/2 p-2 md:pr-8 pt-7 flex flex-col">
          <div className="bg-white text-black p-4 rounded-2xl shadow-xl border border-blue-200" style={{ minHeight: 420, transition: "box-shadow 0.33s" }}>
            <div id="mailpreview-only" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      </div>

      {/* Kopieerknop */}
      <FloatingCopyButton onClick={copyToClipboard} success={success} />

      {/* Inline CSS voor breathing effect */}
      <style>{`
        @keyframes watermark-fade {
          0% { opacity: 0.18; transform: scale(0.985); }
          50% { opacity: 0.38; transform: scale(1.015); }
          100% { opacity: 0.2; transform: scale(0.99); }
        }
        .shadow-xl { box-shadow: 0 8px 32px #2166aa18, 0 2px 16px #284cff17 !important; }
        .rounded-2xl { border-radius: 18px !important; }
      `}</style>
    </>
  );
}
