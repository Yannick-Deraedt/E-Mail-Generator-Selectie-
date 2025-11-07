# Selectie generator KVE Drongen

## Hoe gebruik je dit?
- installeer een IDE voor webdevelopment (zoals [Webstorm](https://www.jetbrains.com/webstorm/download/?section=windows))
- Git clone of download dit project naar een map
- Open de map via de IDE
- Ga naar het bestand package.json en voer het dev script uit (groene driehoekje ernaast)
- Open de lokale website (localhost/...)

## Hoe vul ik de gegevens van mijn ploeg in
- Het bestand public/squad_info.json bevat alle data die het programma gebruikt. Je moet die data aanpassen
- Dit is de huidige data die je kan ingeven:

| Definitie                | Uitleg                                                                           | standaardwaarde (als je niets invult)           |
|--------------------------|----------------------------------------------------------------------------------|-------------------------------------------------|
| clubName                 | naam van de club                                                                 | leeg                                            |
| teamName                 | naam/leeftijdscategorie van het team                                             | leeg                                            |
| trainerName              | volledige naam van de trainer                                                    | Trainer                                         |
| trainerPhone             | telefoonnummer van de trainer                                                    | leeg                                            |
| squadPlayers             | lijst van alle veldspelers van het team                                          | leeg                                            |
| squadKeepers             | lijst van alle keepers van het team                                              | leeg                                            |
| maxPlayers               | max aantal spelers per selectie                                                  | 16                                              |
| jerseyNumbers            | lijst van alle beschikbare rugnummers                                            | [1, 2, 3, ... , 16, 17]                         |
| arrivalPeriodMinutesHome | aantal minuten op voorhand dat de spelers aanwezig moeten zijn voor thuismatchen | 60                                              |
| arrivalPeriodMinutesAway | aantal minuten op voorhand dat de spelers aanwezig moeten zijn voor uitmatchen   | 60                                              |
| nonSelectionReasons      | lijst met redenen voor non-selectie                                              | [Geblesseerd, Ziek, ...]                        |
| defaultRemark            | algemene Opmerking                                                               | Vergeet jullie ID niet...                       |
| carpoolRemark            | opmerking voor meerijden/afspreken/carpoolen                                     | Gelieve onderling te carpoolen indien mogelijk. |
| responsibleRemark        | opmerking voor speler die verantwoordelijk is (voor was/fruit/...)               | Verantwoordelijk voor was van de shirts         |
| closingRemark            | afsluiting                                                                       | met sportieve groeten,                          |
| captainIcon              | icoontje in mail om kapitein aan te duiden                                       | (C)                                             |
| keeperIcon               | icoontje in mail om keeper aan te duiden                                         | (GK)                                            |
 

## Hoe deel ik dit op ProSoccerData?
- Vul alles in
- Druk op de kopieer-knop
- Plak het in een psd-mail
    - Je kan handmatig nog zaken aanpassen in psd
