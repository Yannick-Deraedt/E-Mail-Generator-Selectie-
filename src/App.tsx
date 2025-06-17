// App.tsx – verbeterde versie met correcte layout, blokken, en extra mededeling + afsluiting
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

  const copyToClipboard = async () => {
    const previewElement = document.querySelector("#preview");
    if (previewElement && navigator.clipboard && typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(previewElement.innerHTML);
        alert("HTML succesvol gekopieerd!");
      } catch {
        alert("Kopiëren mislukt. Probeer manueel te kopiëren.");
      }
    }
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br/>");
    const nonSelectedText = playerList
      .filter((p) => !(p in selectedPlayers))
      .map((p) => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`)
      .join("<br/>");

    const extraMededeling = matchInfo.matchType === "Uitwedstrijd"
      ? `<p><span style='background-color: #d0ebff; font-weight: bold;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</span></p>`
      : "";

    const email = `
      <div style='font-family: Arial, sans-serif; padding: 1rem;'>
        <h2 style='font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem;'>Beste ouders en spelers van de U16,</h2>
        <p style='margin-bottom: 1rem;'>Aanstaande <strong>${matchInfo.day || "[dag]"}</strong> spelen we een <strong>${matchInfo.matchType}</strong> tegen <strong>${matchInfo.opponent || "[tegenstander]"}</strong>. Hieronder vinden jullie alle belangrijke details voor de wedstrijd.</p>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>📅 Wedstrijdinformatie</h3>
          <p>Wedstrijd: ${matchInfo.matchType === 'Thuiswedstrijd' ? 'KVE vs ' + matchInfo.opponent : matchInfo.opponent + ' vs KVE'}<br/>
          Datum: ${matchInfo.date}<br/>
          Aanvang: ${matchInfo.time}<br/>
          Terrein: ${matchInfo.field}<br/>
          Adres: ${matchInfo.address}${matchInfo.matchType === 'Uitwedstrijd' ? `<br/>Aankomst tegenstander: ${matchInfo.arrivalTimeOpponent}` : ""}</p>
        </div>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>⏱️ Verzamelen</h3>
          <p>Locatie: ${matchInfo.gatheringPlace}<br/>
          Tijd: ${matchInfo.gatheringTime}</p>
        </div>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>✅ Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>❌ Niet geselecteerd</h3>
          <p>${nonSelectedText || "Geen info beschikbaar."}</p>
        </div>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>🧺 Verantwoordelijke</h3>
          <p>Was, fruit en chocomelk: ${matchInfo.responsible}</p>
        </div>

        <div style='border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;'>
          <h3 style='font-weight: bold;'>📌 Belangrijke mededeling</h3>
          <p><span style='background-color: yellow; font-weight: bold;'>Vergeet niet om jullie identiteitskaart (ID) mee te nemen!</span></p>
          ${extraMededeling}
        </div>

        <p style='margin-top: 2rem;'>Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
      </div>
    `;

    setPreview(email);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Email Generator</h1>
      {/* ...overige UI code blijft ongewijzigd... */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generateEmail}>Genereer e-mail</button>
      {preview && (
        <>
          <div
            id="preview"
            className="bg-white p-4 border rounded shadow text-sm overflow-auto"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded" onClick={copyToClipboard}>📋 Kopieer e-mail</button>
        </>
      )}
    </div>
  );
}
