import { useState, useEffect } from "react";

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
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState("");
  const [preview, setPreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

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
    if (previewElement && navigator.clipboard && window.ClipboardItem) {
      const html = previewElement.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" })
        })
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else {
      alert("Kopiëren met layout wordt niet ondersteund in deze browser. Gebruik Ctrl+C.");
    }
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selectedEntries.map(([p, n]) => `${n}. ${p}`).join("<br/>");
    const nonSelectedText = playerList.filter(p => !(p in selectedPlayers)).map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");

    const extraMededeling = matchType === 'Uitwedstrijd'
      ? `<p style="background-color: #d0ebff; font-weight: bold; padding: 10px; border-radius: 6px;">We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</p>`
      : "";

    const email = `
      <div style="font-family: Arial, sans-serif; padding: 1rem;">
        <h2 style="font-size: 1.2rem;">Beste ouders en spelers van de U15,</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>
        
        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>⚽ Wedstrijddetails</h3>
          <ul>
            <li><strong>Wedstrijd:</strong> ${matchType === 'Thuiswedstrijd' ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</li>
            <li><strong>Datum:</strong> ${date || "[datum]"}</li>
            <li><strong>Start wedstrijd:</strong> ${time || "[tijd]"}</li>
            <li><strong>Terrein:</strong> ${field || "[terrein]"}</li>
            <li><strong>Adres:</strong> ${address || "[adres]"}</li>
            ${matchType === 'Uitwedstrijd' && arrivalTimeOpponent ? `<li><strong>Aankomst bij ${opponent}:</strong> ${arrivalTimeOpponent}</li>` : ""}
          </ul>
        </div>

        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>📍 Verzameldetails</h3>
          <ul>
            <li><strong>Plaats:</strong> ${gatheringPlace}</li>
            <li><strong>Uur:</strong> ${gatheringTime || "[uur]"}</li>
          </ul>
        </div>

        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>✅ Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>🚫 Niet geselecteerd</h3>
          <p>${nonSelectedText || "Geen info"}</p>
        </div>

        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>🧺 Verantwoordelijke</h3>
          <p>${responsible || "[naam]"}</p>
        </div>

        <div style="margin-top:1rem; border:1px solid #ccc; border-radius:6px; padding:1rem;">
          <h3>📣 Opmerking</h3>
          <p><span style="background-color: yellow;">Vergeet jullie ID niet mee te nemen!</span></p>
          ${extraMededeling}
        </div>

        <p style="margin-top: 2rem;">Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen</p>
      </div>`;

    setPreview(email);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Email Generator</h1>

      {/* Alles van inputs (zoals je al had) */}
      {/* ... zie Deel 1 voor de inputsectie ... */}

      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-6" onClick={generateEmail}>
        ✉️ Genereer e-mail
      </button>

      {preview && (
        <>
          <div
            id="preview"
            className="bg-white p-4 border rounded shadow text-black mt-6"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" onClick={copyToClipboard}>
            📋 Kopieer e-mail met layout
          </button>
        </>
      )}
    </div>
  );
}
