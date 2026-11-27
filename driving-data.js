"use strict";

// Tieliikennelaki 729/2018. Tarkistettu 27.11.2026.
const drivingTopics = {
  lanes: {
    title: "Kaista-ajo",
    situations: [
      {
        title: "Ryhmittyminen ajokaistanuolten mukaan",
        context: "Lähestyt henkilöautolla risteystä ja aiot kääntyä oikealle. Kaistan 1 nuoli osoittaa suoraan ja kaistan 2 nuoli oikealle.",
        question: "Mille kaistalle ryhmityt?",
        options: ["Kaistalle 1", "Kaistalle 2", "Kummalle tahansa kaistalle"],
        correct: 1,
        explanation: "Valitse kaista 2 hyvissä ajoin. Ajokaistanuoli osoittaa, mihin suuntaan kaistalta saa poistua risteyksestä.",
        law: [21, "M1"],
        map: { kind: "laneJunction", lanes: [246, 304], markings: ["straight", "right"] },
      },
      {
        title: "Vasemmalle yksisuuntaiselta kadulta",
        context: "Lähestyt risteystä yksisuuntaista, kaksikaistaista katua pitkin. Aiot kääntyä vasemmalle. Risteyksessä ei ole erillisiä ryhmitysmerkintöjä.",
        question: "Mille kaistalle ryhmityt?",
        options: ["Kaistalle 1 vasempaan reunaan", "Kaistalle 2 oikeaan reunaan", "Kummalle tahansa kaistalle"],
        correct: 0,
        explanation: "Ryhmittyminen vasemmalle tehdään yksisuuntaisen ajoradan vasempaan reunaan. Tässä se on kaista 1.",
        law: [21],
        map: {
          kind: "laneJunction", lanes: [182, 238],
          signs: [{ code: "E14.1", x: 292, y: 200, width: 33 }],
        },
      },
      {
        title: "Kaistanvaihto rinnakkaisen auton kohdalla",
        context: "Ajat autolla A oikealla kaistalla ja haluat siirtyä vasemmalle. Auto B on vasemmalla kaistalla vierelläsi.",
        question: "Miten toimit?",
        options: [
          "Vaihda kaistaa heti vilkun kytkemisen jälkeen",
          "Siirry osittain vasemmalle, jotta B tekee tilaa",
          "Odota turvallista väliä ja näytä vilkulla aikeesi hyvissä ajoin ennen siirtymistä",
        ],
        correct: 2,
        explanation: "Kaistaa saa vaihtaa, kun siirtyminen on turvallista eikä tarpeettomasti haittaa muuta liikennettä. Vilkku kertoo aikeesta, ja turvallinen väli pitää varmistaa ennen siirtymistä.",
        law: [35, 48],
        map: {
          kind: "twoLanes", vehicles: [
            { id: "A", x: 244, y: 197, angle: 0, label: "oma autosi oikealla kaistalla" },
            { id: "B", x: 176, y: 181, angle: 0, label: "auto vasemmalla kaistalla vierelläsi" },
          ],
        },
      },
      {
        title: "Kaistan valinta käännöksen jälkeen",
        context: "Käännyt autolla A oikealle. Risteävällä kadulla on ajosuuntaasi kaksi vapaata ajokaistaa. Merkit ja tiemerkinnät eivät määrää poistumiskaistaa.",
        question: "Mitä kaistaa voit käyttää risteyksestä poistuessasi?",
        options: ["Vain oikeanpuoleista kaistaa 2", "Kumpaa tahansa kaistaa tilanteen mukaan", "Vain vasemmanpuoleista kaistaa 1"],
        correct: 1,
        explanation: "Kun ajosuunnassa on vähintään kaksi kaistaa, voit poistua risteyksestä sopivinta kaistaa käyttäen. Valinnassa on otettava muu liikenne huomioon.",
        law: [22],
        map: {
          kind: "turnLanes",
          vehicles: [{ id: "A", x: 231, y: 250, angle: 0, label: "oma autosi, kääntyy oikealle" }],
        },
      },
      {
        title: "Liittyminen moottoritielle",
        context: "Ajat autolla A liittymiskaistalla. Auto B kulkee jo moottoritiellä viereisellä ajokaistalla samaan suuntaan ja on kohdallasi liittymiskohdassa.",
        question: "Kumpi väistää?",
        options: [
          "Moottoritiellä ajava B tekee aina tilaa",
          "Leveämpi ajokaista määrää ajojärjestyksen",
          "Liittyvä auto A väistää moottoritiellä jo ajavaa autoa B",
        ],
        correct: 2,
        explanation: "Liittyvä väistää moottoritiellä kulkevia. Sovita nopeutesi liikennevirtaan, etsi turvallinen väli ja näytä suuntamerkki ennen siirtymistä.",
        law: [59, 48],
        map: {
          kind: "merge",
          vehicles: [
            { id: "A", x: 151, y: 248, angle: 56, label: "oma autosi liittymiskaistalla" },
            { id: "B", x: 213, y: 193, angle: 90, label: "auto moottoritiellä" },
          ],
        },
      },
      {
        title: "Vapaa ajokaista moottoritiellä",
        context: "Moottoritiellä on ajosuuntaasi kaksi vapaata kaistaa. Opasteet eivät ohjaa tietyn suunnan liikennettä omalle kaistalle.",
        question: "Millä kaistalla jatkat?",
        options: ["Oikeanpuoleisella kaistalla 2", "Vasemmanpuoleisella kaistalla 1", "Vaihdat kaistaa tasaisin välein"],
        correct: 0,
        explanation: "Moottoritiellä ajetaan oikeanpuoleisimmalla vapaalla kaistalla. Jos kaista on liikennemerkillä osoitettu tietylle liikennesuunnalle, voit valita matkaasi ja olosuhteisiin parhaiten sopivan kaistan.",
        law: [61],
        map: { kind: "twoLanes", lanes: [176, 244] },
      },
    ],
  },
  junctions: {
    title: "Ajojärjestys risteyksissä",
    situations: [
      {
        title: "Kolme autoa tasa-arvoisessa risteyksessä",
        context: "Auto A tulee alhaalta, B oikealta ja C ylhäältä. Kaikki ajavat suoraan. Risteyksessä ei ole liikennevaloja eikä väistämismerkkejä.",
        explanation: "A väistää oikealta tulevaa B:tä. B väistää omalta oikealtaan tulevaa C:tä. C:n oikealta ei ole tulossa ketään, joten C ajaa ensin.",
        law: [24],
        order: ["C", "B", "A"],
        map: {
          kind: "cross", vehicles: [
            { id: "A", x: 234, y: 246, angle: 0, label: "alhaalta suoraan", route: "M234 219 L234 20", end: [234, 22, 0] },
            { id: "B", x: 337, y: 132, angle: 270, label: "oikealta suoraan", route: "M310 132 L27 132", end: [28, 132, 270] },
            { id: "C", x: 186, y: 57, angle: 180, label: "ylhäältä suoraan", route: "M186 85 L186 290", end: [186, 289, 180] },
          ],
        },
      },
      {
        title: "Vasemmalle kääntyvä ja vastaantulija",
        context: "Auto A tulee alhaalta ja kääntyy vasemmalle. Vastaan tuleva B ajaa suoraan. Muita tienkäyttäjiä, valoja tai väistämismerkkejä ei ole.",
        explanation: "Vasemmalle kääntyvä A väistää vastaantulevaa, suoraan ajavaa B:tä.",
        law: [24],
        order: ["B", "A"],
        map: {
          kind: "cross", vehicles: [
            { id: "A", x: 234, y: 246, angle: 0, label: "alhaalta vasemmalle", route: "M234 218 V178 Q234 132 179 132 H27", end: [28, 132, 270] },
            { id: "B", x: 186, y: 57, angle: 180, label: "ylhäältä suoraan", route: "M186 85 L186 290", end: [186, 289, 180] },
          ],
        },
      },
      {
        title: "STOP-merkki sivutiellä",
        context: "Auto A tulee STOP-merkin takaa ja aikoo ajaa suoraan. Auto B ajaa vasemmalta suoraan risteävää tietä.",
        explanation: "A pysähtyy pysäytysviivalle ja väistää risteävää tietä ajavaa B:tä. Pysähtyminen on pakollista myös silloin, kun risteävä tie on vapaa.",
        law: ["B6"],
        order: ["B", "A"],
        map: {
          kind: "cross", stopLine: true,
          signs: [{ code: "B6", x: 279, y: 208, width: 34 }],
          vehicles: [
            { id: "A", x: 234, y: 251, angle: 0, label: "alhaalta STOP-merkin takaa", route: "M234 223 L234 20", end: [234, 22, 0] },
            { id: "B", x: 76, y: 178, angle: 90, label: "vasemmalta suoraan", route: "M105 178 L389 178", end: [388, 178, 90] },
          ],
        },
      },
      {
        title: "Pysäköintialueelta kadulle",
        context: "Auto A tulee alhaalta pysäköintialueen liittymästä ja kääntyy vasemmalle kadulle. Kadulla kulkeva B tulee A:n vasemmalta.",
        explanation: "Pysäköintialueelta tielle tuleva A väistää kadun liikennettä kummastakin suunnasta. B ajaa ensin, vaikka se lähestyy A:n vasemmalta.",
        law: [24],
        order: ["B", "A"],
        map: {
          kind: "parking", signs: [{ code: "E2", x: 285, y: 255, width: 33 }],
          vehicles: [
            { id: "A", x: 233, y: 254, angle: 0, label: "pysäköintialueelta vasemmalle", route: "M233 224 V174 Q233 132 179 132 H29", end: [30, 132, 270] },
            { id: "B", x: 76, y: 178, angle: 90, label: "kadulla vasemmalta suoraan", route: "M104 178 H389", end: [388, 178, 90] },
          ],
        },
      },
      {
        title: "Kääntyvä auto kohtaa pyöräilijän",
        context: "Auto A kääntyy oikealle. Pyöräilijä B ylittää juuri sitä risteävää katua, jolle A on kääntymässä.",
        explanation: "Kääntyvän auton A on annettava risteävää tietä ylittävälle pyöräilijälle tilaa kulkea ensin.",
        law: [24],
        order: ["B", "A"],
        map: {
          kind: "crossing", vehicles: [
            { id: "A", x: 234, y: 251, angle: 0, label: "alhaalta oikealle kääntyvä auto", route: "M234 222 Q234 178 280 178 H389", end: [388, 178, 90] },
            { id: "B", x: 319, y: 87, angle: 180, type: "bike", label: "pyöräilijä ylittää risteävän kadun", route: "M319 111 V223", end: [319, 222, 180] },
          ],
        },
      },
      {
        title: "Liikenneympyrään saapuminen",
        context: "Auto A lähestyy liikenneympyrää kärkikolmion takaa ja aikoo poistua heti oikealle. Auto B ajaa jo ympyrässä ja kulkee A:n liittymän ohi.",
        explanation: "Kärkikolmio velvoittaa ympyrään saapuvan A:n väistämään ympyrässä kulkevaa B:tä.",
        law: ["B5"],
        order: ["B", "A"],
        map: {
          kind: "roundabout", signs: [{ code: "B5", x: 272, y: 226, width: 35 }],
          vehicles: [
            { id: "A", x: 232, y: 272, angle: 0, label: "alhaalta kärkikolmion takaa", route: "M232 246 Q232 218 254 202 Q280 176 315 176 H389", end: [388, 176, 90] },
            { id: "B", x: 149, y: 192, angle: 140, label: "jo liikenneympyrässä", route: "M166 207 Q203 234 246 207 Q282 185 282 142", end: [282, 142, 0] },
          ],
        },
      },
    ],
  },
};

const drivingLawReferences = {
  M1: { title: "Ajokaistanuoli M1", anchor: "attachment_14" },
  B5: { title: "Väistämismerkki B5", anchor: "attachment_4" },
  B6: { title: "STOP-merkki B6", anchor: "attachment_4" },
};
