# Ajokoulu

Suomenkielinen liikennemerkkien oppimisympäristö. Ensimmäisessä versiossa on 287 merkkiä yhdeksässä ryhmässä, haku nimen ja tunnuksen perusteella, selitteet sekä monivalintaharjoitus. Kunkin harjoituksen päätteeksi voi kerrata väärin menneet merkit. Opituiksi merkityt merkit tallentuvat selaimeen.

## Käyttö

Avaa `index.html` selaimessa tai käynnistä projektihakemistossa paikallinen palvelin.

```sh
python3 -m http.server 8000
```

Palvelimella sivu avautuu osoitteessa [localhost:8000](http://localhost:8000/). Sivusto käyttää paikallisia HTML-, CSS-, JavaScript- ja kuvatiedostoja.

## GitHub Pages

Vie tämän hakemiston sisältö GitHub-tietovaraston juureen. Valitse tietovaraston **Settings → Pages** -näkymässä **Deploy from a branch** sekä julkaistava haara ja kansioksi **/ (root)**. Kaikki tiedostopolut toimivat myös GitHub Pagesin projektikohtaisessa alihakemistossa. [GitHub Pagesin ohje](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Aineiston ylläpito

- `signs.js` sisältää merkkien tunnukset, nimet, kuvaversiot, selitteet ja hakusanat.
- Merkkiaineisto on tarkistettu 27.11.2026. Tarkista päivityksissä erityisesti uudet tai muuttuneet merkit, siirtymäsäännökset ja selitteet. [Tieliikennelaki 729/2018, liitteet 3.1–3.9](https://www.finlex.fi/fi/lainsaadanto/2018/729) · [Muutos 281/2026](https://www.finlex.fi/fi/lainsaadanto/saadoskokoelma/2026/281)
- Merkkikuvat ovat Väyläviraston CC0-kokoelmasta. A27:n uusi kuva, F3, H12.14 ja H27 ovat Finlexin ajantasaisen säädöksen liitteistä. [Väyläviraston merkkikuvat](https://github.com/finnishtransportagency/liikennemerkit) · [Traficomin merkkimääräys](https://www.traficom.fi/fi/tieliikenteen-turvallisuus-ja-valvonta/tie-ja-raitioliikenteen-ohjauslaitteiden-varit-rakenne-ja-mitoitus)
- Manrope-kirjasimen lisenssi on tiedostossa `assets/fonts/OFL.txt`.

## Seuraava versio

Kaista-ajo ja ajojärjestys risteyksissä.
