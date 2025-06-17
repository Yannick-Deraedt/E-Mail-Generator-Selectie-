import { useState } from "react";

const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const playerList = [
  "Jerome Belpaeme", "Leon Boone", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver", "Mauro Dewitte", "Aron D'Hoore", "Ferran Dhuyvetter", "Arthur Germonpré",
  "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers", "Andro Martens", "Lukas Onderbeke",
  "Siebe Passchyn", "Viktor Poelman", "Lav Rajkovic", "Moussa Sabir", "Mauro Savat",
  "Mattias Smet", "Guillaume Telleir", "Otis Vanbiervliet", "Michiel Van Melkebeke", "Rube Verhille",
  "Filemon Verstraete"
];

const reasons = [
  "Blessure", "Geschorst", "Rust", "Schoolverplichting", "GU15", "Stand-by GU15",
  "Niet getraind", "1x getraind", "Niet verwittigd", "Vakantie", "Ziek", "Disciplinair", "Andere redenen"
];

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  options?: string[];
};

function FormField({ label, value, onChange, type = "text", options = [] }: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>
      {options.length > 0 ? (
        <select className="border p-2" value={value} onChange={onChange}>
          <option value="">Kies een optie</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input className="border p-2" type={type} value={value} onChange={onChange} />
      )}
    </div>
  );
}

export default function App() {
  const [matchInfo, setMatchInfo] = useState({
    matchType: "Thuiswedstrijd",
    date: "",
    time: "",
    day: "",
    opponent: "",
    field: "",
    address: "",
    gatheringPlace: "",
    gatheringTime: "",
    arrivalTimeOpponent: "",
    responsible: ""
  });

  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState("");
  const [plainText, setPlainText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const togglePlayer = (player: string) => {
    setSelectedPlayers((prev) => {
      const updated = { ...prev };
      if (player in updated) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const setRugnummer = (player: string, number: string) => {
    setSelectedPlayers((prev) => ({ ...prev, [player]: number }));
  };

  const setReason = (player: string, reason: string) => {
    setNonSelectedReasons((prev) => ({ ...prev, [player]: reason }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Succesvol gekopieerd!");
    } catch {
      alert("Kopiëren mislukt. Probeer manueel.");
    }
  };

  const generateEmail = () => {
    if (!matchInfo.date || !matchInfo.opponent || Object.keys(selectedPlayers).length === 0) {
      alert("Vul alle verplichte velden in en selecteer minstens één speler.");
      return;
    }

    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("\n");
    const nonSelectedText = playerList
      .filter((p) => !(p in selectedPlayers))
      .map((p) => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`)
      .join("\n");

    const plain = `📅 ${matchInfo.day} – ${matchInfo.matchType} tegen ${matchInfo.opponent}
Aanvang: ${matchInfo.time} | Datum: ${matchInfo.date}
Adres: ${matchInfo.address} | Terrein: ${matchInfo.field}${matchInfo.matchType === "Uitwedstrijd" ? `\nAankomst tegenstander: ${matchInfo.arrivalTimeOpponent}` : ""}
⏱️ Verzamelen: ${matchInfo.gatheringPlace} om ${matchInfo.gatheringTime}

✅ Selectie:
${selectedText}

❌ Niet geselecteerden:
${nonSelectedText}

🧺 Verantwoordelijke: ${matchInfo.responsible}

📌 Vergeet je ID niet!`;

    setPlainText(plain);
    setPreview(plain.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;"));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Email Generator</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Dag" value={matchInfo.day} onChange={(e) => setMatchInfo({ ...matchInfo, day: e.target.value })} options={days} />
        <FormField label="Type" value={matchInfo.matchType} onChange={(e) => setMatchInfo({ ...matchInfo, matchType: e.target.value })} options={["Thuiswedstrijd", "Uitwedstrijd"]} />
        <FormField label="Datum" type="date" value={matchInfo.date} onChange={(e) => setMatchInfo({ ...matchInfo, date: e.target.value })} />
        <FormField label="Tijd" type="time" value={matchInfo.time} onChange={(e) => setMatchInfo({ ...matchInfo, time: e.target.value })} />
        <FormField label="Tegenstander" value={matchInfo.opponent} onChange={(e) => setMatchInfo({ ...matchInfo, opponent: e.target.value })} />
        <FormField label="Terrein" value={matchInfo.field} onChange={(e) => setMatchInfo({ ...matchInfo, field: e.target.value })} />
        <FormField label="Adres" value={matchInfo.address} onChange={(e) => setMatchInfo({ ...matchInfo, address: e.target.value })} />
        {matchInfo.matchType === "Uitwedstrijd" && (
          <FormField label="Aankomst uitploeg" type="time" value={matchInfo.arrivalTimeOpponent} onChange={(e) => setMatchInfo({ ...matchInfo, arrivalTimeOpponent: e.target.value })} />
        )}
        <FormField label="Verzamelplaats" value={matchInfo.gatheringPlace} onChange={(e) => setMatchInfo({ ...matchInfo, gatheringPlace: e.target.value })} />
        <FormField label="Verzameltijd" type="time" value={matchInfo.gatheringTime} onChange={(e) => setMatchInfo({ ...matchInfo, gatheringTime: e.target.value })} />
        <FormField label="Verantwoordelijke" value={matchInfo.responsible} onChange={(e) => setMatchInfo({ ...matchInfo, responsible: e.target.value })} options={playerList} />
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Zoek & Selecteer spelers</h2>
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Zoek speler..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {playerList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={p in selectedPlayers} onChange={() => togglePlayer(p)} />
            <span className="flex-1 text-sm">{p}</span>
            {p in selectedPlayers && (
              <select value={selectedPlayers[p]} onChange={(e) => setRugnummer(p, e.target.value)} className="border p-1 text-sm">
                {[...Array(25)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mt-6">Niet-geselecteerden en reden</h2>
        {playerList.filter(p => !(p in selectedPlayers)).map((p) => (
          <div key={p} className="flex items-center gap-2 mt-1">
            <span className="flex-1 text-sm">{p}</span>
            <select value={nonSelectedReasons[p] || ""} onChange={(e) => setReason(p, e.target.value)} className="border p-1 text-sm">
              <option value="">Reden</option>
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generateEmail}>Genereer e-mail</button>

      {preview && (
        <>
          <div id="preview" className="bg-white p-4 border rounded shadow text-sm overflow-auto whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: preview }} />
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => copyToClipboard(preview)}>📋 Kopieer HTML</button>
            <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={() => copyToClipboard(plainText)}>📄 Kopieer platte tekst</button>
          </div>
        </>
      )}
    </div>
  );
}
