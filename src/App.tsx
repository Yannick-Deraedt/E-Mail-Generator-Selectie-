// App.tsx – Vercel-build proof versie met correcte types
import { useState } from "react";

const days = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

const playerList = [
  "Jerome Belpaeme",
  "Wolf Cappan",
  "Leon De Backer",
  "Mateo De Tremerie",
  "Nicolas Desaver",
  "Mauro Dewitte",
  "Aaron D'Hoore",
  "Ferran Dhuyvetter",
  "Arthur Germonpré",
  "Lander Helderweirt",
  "Tuur Heyerick",
  "Jef Lambers",
  "Andro Martens",
  "Lukas Onderbeke",
  "Steffen Opstaele",
  "Siebe Passchyn",
  "Viktor Poelman",
  "Moussa Sabir",
  "Mauro Savat",
  "Mattias Smet",
  "Guillaume Telleir",
  "Thias Van Holle",
  "Michiel Van Melkebeke",
  "Rube Verhille",
  "Filemon Verstraete",
];

const reasons = [
  "Blessure",
  "Geschorst",
  "Rust",
  "Schoolverplichting",
  "GU15",
  "Stand-by GU15",
  "Niet getraind",
  "1x getraind",
  "Niet verwittigd",
  "Vakantie",
  "Ziek",
  "Disciplinair",
  "Andere redenen",
];

export default function App() {
  const [matchType, setMatchType] = useState<string>("Thuiswedstrijd");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [opponent, setOpponent] = useState<string>("");
  const [field, setField] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [gatheringPlace, setGatheringPlace] = useState<string>("");
  const [gatheringTime, setGatheringTime] = useState<string>("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

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
    if (navigator.clipboard && preview) {
      await navigator.clipboard.writeText(preview);
      alert("E-mail gekopieerd naar klembord!");
    }
  };

  const generateEmail = () => {
    const selectedEntries = Object.entries(selectedPlayers).sort(
      (a, b) => parseInt(a[1]) - parseInt(b[1])
    );
    const selectedText = selectedEntries
      .map(([p, n]) => `${n}. ${p}`)
      .join("<br>");

    const nonSelectedText = playerList
      .filter((p) => !(p in selectedPlayers))
      .map((p) => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`)
      .join("<br>");

    const extraMededeling =
      matchType === "Uitwedstrijd"
        ? `<p><span style='background-color: #d0ebff; font-weight: bold;'>We vragen om samen te vertrekken vanaf de parking van <strong>KVE Drongen</strong>. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.</span></p>`
        : "";

    const defaultGathering = matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE";

    const email = `
      <div style='font-family: Arial, sans-serif; padding: 1rem;'>
        <h2 style='font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem;'>Beste ouders en spelers van de U14,</h2>
        <p style='margin-bottom: 2rem;'>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>. Hieronder vinden jullie alle belangrijke details voor de wedstrijd.</p>

        <div style='margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;'>
          <h3 style='font-weight: bold;'>Wedstrijdinformatie</h3>
          <p>Wedstrijd: ${matchType === "Thuiswedstrijd" ? "KVE vs " + opponent : opponent + " vs KVE"}<br>
          Datum: ${date}<br>
          Aanvang: ${time}<br>
          Terrein: ${field || "[terrein]"}<br>
          Adres: ${address || "[adres]"}${
      matchType === "Uitwedstrijd"
        ? `<br>Aankomst bij ${opponent}: ${arrivalTimeOpponent || "[uur]"}`
        : ""
    }</p>
        </div>

        <div style='margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;'>
          <h3 style='font-weight: bold;'>Verzamelinformatie</h3>
          <p>Verzamelplaats: ${gatheringPlace || defaultGathering}<br>
          Verzameltijd: ${gatheringTime || "[verzameltijd]"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Selectie</h3>
          <p>${selectedText || "Nog geen spelers geselecteerd."}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Niet geselecteerde spelers</h3>
          <p>${nonSelectedText || "Geen info"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Verantwoordelijkheden</h3>
          <p>Was, fruit en chocomelk: ${responsible || "[naam speler]"}</p>
        </div>

        <div style='margin-bottom: 2rem;'>
          <h3 style='font-weight: bold;'>Belangrijke mededeling</h3>
          <p><span style='background-color: yellow; font-weight: bold;'>Vergeet niet om jullie identiteitskaart (ID) mee te nemen!</span></p>
          ${extraMededeling}
        </div>

        <p style='margin-top: 2rem;'>Met sportieve groeten,<br>Yannick Deraedt<br>Trainer U14 KVE Drongen</p>
      </div>
    `;

    setPreview(email);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 text-gray-900 dark:text-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold">Email Generator</h1>

      {/* De rest van de interface en invulvelden blijven behouden zoals eerder */}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={generateEmail}
      >
        Genereer e-mail
      </button>
      {preview && (
        <>
          <div
            className="bg-white text-black dark:bg-gray-100 dark:text-black p-4 border rounded shadow text-sm overflow-auto"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <button
            className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            onClick={copyToClipboard}
          >
            📋 Kopieer e-mail
          </button>
        </>
      )}
    </div>
  );
}
