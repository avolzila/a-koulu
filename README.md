# Ajokoulu

Suomenkielinen liikennemerkkien ja ajotilanteiden oppimisympäristö.

Ajokoulu on itsenäinen ja epävirallinen projekti henkilökohtaiseen harjoitteluun. Sivusto ei ole Traficomin tai Ajovarman palvelu eikä osa virallista kuljettajantutkintoa. Harjoitusmateriaalissa voi olla virheitä tai vanhentuneita tietoja. Ajantasaiset säännöt ja tutkinto-ohjeet löytyvät viranomaislähteistä. [Finlex](https://www.finlex.fi/fi/lainsaadanto/2018/729) · [Traficom](https://www.traficom.fi/fi/autoilijat/ajokortit/kuljettajantutkinto)

- Merkkikirjastossa on 287 merkkiä yhdeksässä ryhmässä, haku nimen ja tunnuksen perusteella, selitteet sekä monivalintaharjoitus.
- Ajotilanteissa on kuusi kaista-ajon tehtävää ja kuusi risteysten ajojärjestystehtävää. Jokaisen vastauksen jälkeen näytetään perustelu ja linkki sovellettavaan sääntöön.
- [Renkaat ja pysähtymismatka](demot/renkaat.html) vertailee kesä- ja talvirenkaita eri nopeuksilla kuivalla, märällä, jäällä ja lumella sekä suhteuttaa pysähtymismatkan havaintoetäisyyteen lyhyillä ja pitkillä valoilla.
- B-luokan teoriakysymyspankissa on 100 Ajokoulun laatimaa sanallista monivalintakysymystä yhdeksästä aihepiiristä. Valitse yksi aihe tai tee 15 kysymyksen sekaharjoitus. Kysymykset sisältävät vastausperustelut ja lähdeviitteet.
- Harjoituksen päätteeksi voi kerrata virheet. Edistyminen säilyy käyttökerran ajan, ja käyttäjä voi sallia sen tallentamisen omaan selaimeensa 180 päiväksi.

## Käyttö

Avaa `index.html` selaimessa tai käynnistä projektihakemistossa paikallinen palvelin.

```sh
python3 -m http.server 8000
```

Palvelimella sivu avautuu osoitteessa [localhost:8000](http://localhost:8000/). Sivusto käyttää paikallisia HTML-, CSS-, JavaScript- ja kuvatiedostoja.

iPhonen Safarissa käytä julkaistun sivuston HTTPS-osoitetta. Paikallista esikatselua varten puhelimen ja palvelinta ajavan tietokoneen on oltava samassa lähiverkossa. Avaa silloin Safarissa tietokoneen lähiverkko-osoite ja esikatseluportti. Osoite `127.0.0.1` viittaa aina siihen laitteeseen, jossa selain on auki.

## GitHub Pages

Vie tämän hakemiston sisältö GitHub-tietovaraston juureen. Valitse tietovaraston **Settings → Pages** -näkymässä **Deploy from a branch** sekä julkaistava haara ja kansioksi **/ (root)**. Kaikki tiedostopolut toimivat myös GitHub Pagesin projektikohtaisessa alihakemistossa. [GitHub Pagesin ohje](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Tietosuoja

Ajokoulun harjoitustiedot käsitellään paikallisesti selaimessa. `progress-storage.js` hallitsee vapaaehtoista tallennusta, ja `tietosuoja.html` kuvaa tallennuksen tarkoituksen, säilytysajan ja GitHub Pagesin tietoturvalokit.

## Käyttöehdot

Kaikki oikeudet Ajokoulun omaan lähdekoodiin, harjoituskysymyksiin ja muuhun tekijänoikeudella suojattuun omaan sisältöön pidätetään. Niiden muokkaaminen, jatkokehittäminen, levittäminen ja uudelleenjulkaiseminen edellyttävät oikeudenhaltijan kirjallista lupaa, ellei sovellettava laki tai GitHubin käyttöehdot salli kyseistä käyttöä. Liikennemerkkikuvia, fontteja ja muuta kolmansien osapuolten aineistoa koskevat niiden omat käyttöehdot ja sovellettava laki. [GitHubin käyttöehdot](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#5-license-grant-to-other-users)

Epävirallisuusilmoitus ja käyttöehdot näytetään aloitusikkunassa ennen harjoittelua. Hyväksyntä koskee avoinna olevaa sivua ja on erillinen edistymisen tallennusluvasta.

## Aineiston ylläpito

- `signs.js` sisältää merkkien tunnukset, nimet, kuvaversiot, selitteet ja hakusanat.
- `driving-data.js` sisältää ajotilanteiden tehtävät, karttojen lähtötiedot, vastaukset, perustelut ja säädösviittaukset.
- `theory-data.js` sisältää teoriakysymykset, vastaukset, perustelut ja lähteet. Aihepiirit perustuvat 29.5.2026 voimaan tulleeseen teoriakoemääräykseen. [Traficomin teoriakoemääräys](https://www.finlex.fi/fi/viranomaiset/maarayskokoelmat/traficom-tieliikenne/2026/8)
- Merkkiaineisto on tarkistettu 27.11.2026. Tarkista päivityksissä erityisesti uudet tai muuttuneet merkit, siirtymäsäännökset ja selitteet. [Tieliikennelaki 729/2018, liitteet 3.1–3.9](https://www.finlex.fi/fi/lainsaadanto/2018/729) · [Muutos 281/2026](https://www.finlex.fi/fi/lainsaadanto/saadoskokoelma/2026/281)
- Merkkikuvat ovat Väyläviraston CC0-kokoelmasta. A27:n uusi kuva, F3, H12.14 ja H27 ovat Finlexin ajantasaisen säädöksen liitteistä. [Väyläviraston merkkikuvat](https://github.com/finnishtransportagency/liikennemerkit) · [Traficomin merkkimääräys](https://www.traficom.fi/fi/tieliikenteen-turvallisuus-ja-valvonta/tie-ja-raitioliikenteen-ohjauslaitteiden-varit-rakenne-ja-mitoitus)
- Manrope-kirjasimen lisenssi on tiedostossa `assets/fonts/OFL.txt`.
