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
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("Kleedkamer X");
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [searchTerm, setSearchTerm] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setGatheringPlace(matchType === "Thuiswedstrijd" ? "Kleedkamer X" : "Parking KVE");
  }, [matchType]);

  const togglePlayer = (player: string) => {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (updated[player]) delete updated[player];
      else updated[player] = "1";
      return updated;
    });
  };

  const setRugnummer = (player: string, nummer: string) =>
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));

  const setReason = (player: string, reason: string) =>
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));

  const copyToClipboard = async () => {
    const el = document.querySelector("#preview");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) })
      ]);
      alert("E-mail succesvol gekopieerd met layout!");
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  const generateEmail = () => {
    const selected = Object.entries(selectedPlayers).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
    const selectedText = selected.map(([name, num]) => `
      <div style="margin-bottom:4px;">
        <span style="background-color:#e2e6ea;padding:2px 6px;border-radius:4px;margin-right:6px;font-weight:bold;">#${num}</span>${name}
      </div>
    `).join("");

    const nonSelectedText = playerList
      .filter(p => !(p in selectedPlayers))
      .map(p => `- ${p} – ${nonSelectedReasons[p] || "[reden]"}`).join("<br/>");

    const extraNote = matchType === "Uitwedstrijd"
      ? `<p style="background-color: #d0ebff; padding: 10px; border-left: 4px solid #339af0; border-radius: 4px; margin-top: 1rem;">
          <strong>Carpool:</strong><br/>
          We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. 
          Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. 
          Laat dit wel weten via de WhatsApp-poll.
        </p>` : "";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 1rem;">
        <h2>Beste ouders en spelers van de U15,</h2>
        <p>Aanstaande <strong>${day || "[dag]"}</strong> spelen we een <strong>${matchType}</strong> tegen <strong>${opponent || "[tegenstander]"}</strong>.</p>

        <div style="border:1px solid #ccc; border-radius:6px; padding:1rem; margin-top:1rem; background:#f9f9f9;">
          <h3>Wedstrijddetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Wedstrijd:</strong></td><td>${matchType === "Thuiswedstrijd" ? `KVE vs ${opponent}` : `${opponent} vs KVE`}</td></tr>
            <tr><td><strong>Datum:</strong></td><td>${date || "[datum]"}</td></tr>
            <tr><td><strong>Start wedstrijd:</strong></td><td>${time || "[tijd]"}</td></tr>
            <tr><td><strong>Terrein:</strong></td><td>${field || "[terrein]"}</td></tr>
            <tr><td><strong>Adres:</strong></td><td>${address || "[adres]"}</td></tr>
            ${matchType === "Uitwedstrijd" && opponent ? `<tr><td><strong>Aankomst bij ${opponent}:</strong></td><td>${arrivalTimeOpponent || "[uur]"}</td></tr>` : ""}
          </table>
        </div>

        <div style="border:1px solid #ccc; border-radius:6px; padding:1rem; margin-top:1rem; background:#f9f9f9;">
          <h3>Verzameldetails</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>Plaats:</strong></td><td>${gatheringPlace}</td></tr>
            <tr><td><strong>Uur:</strong></td><td>${gatheringTime || "[uur]"}</td></tr>
          </table>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Selectie</h3>
          ${selectedText || "Nog geen spelers geselecteerd."}
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Niet geselecteerd</h3>
          <p>${nonSelectedText || "Geen info beschikbaar."}</p>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Verantwoordelijk voor was, fruit & chocomelk</h3>
          <p>${responsible || "[naam]"}</p>
        </div>

        <div style="margin-top:1.5rem;">
          <h3>Opmerking</h3>
          <p><span style="background-color: yellow;">${remark}</span></p>
          ${extraNote}
        </div>

        <p style="margin-top: 2rem;">Met sportieve groeten,<br/>Yannick Deraedt<br/>Trainer U15 KVE Drongen<br/><br/></p>
      </div>
    `;

    setPreview(html);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto text-white bg-gray-900 min-h-screen">
      <div className="w-full md:w-1/2">
        {/* Alle invoervelden en selecties komen hier */}
        {/* Zie vorige versie of laat weten als je ze hier wil uitgewerkt */}
      </div>

      <div className="w-full md:w-1/2">
        {preview && (
          <div id="preview" className="bg-white text-black p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]" dangerouslySetInnerHTML={{ __html: preview }} />
        )}
      </div>
    </div>
  );
}
