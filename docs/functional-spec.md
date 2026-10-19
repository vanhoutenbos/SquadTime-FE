# SquadTime – Functionele specificatie MVP (v0.1)

> **Status: v0.1 (full MVP spec).** Deferred from the demo: By friend view, self-service export, automatic admission, notifications, Discord friend list/Activity, iCal, "Best time" card. Added by the board: "Tonight" card, "Still true this week?" confirm, "signups closed" switch, demo cap of 50.

> **Werktitel:** SquadTime (definitieve naam nog in onderzoek; Squad Hours is een alternatief). Gebruik de naam via één plek in de code zodat hij makkelijk te wijzigen is.
> **Designs:** All reference designs (desktop and mobile) are in the `design/` folder (reference only: copy the look, not the structure).
> **Taal van de app:** alleen Engels. Dit document is in het Nederlands; teksten voor de interface staan in het Engels.

**Statuslabels**

- **[B]** besloten door JP
- **[V]** voorstel: geldt als standaard tenzij JP anders zegt
- **[O]** open: moet nog beslist of getest worden

---

## 1. Samenvatting

SquadTime laat casual gamers zien wanneer hun vrienden tegelijk kunnen spelen, over tijdzones heen. Gebruikers loggen in met Discord, geven hun beschikbaarheid door (terugkerend, met losse uitzonderingen) en zien in een weekkalender hoeveel en welke vrienden ook kunnen.

**Doelgroep [B]:** casual online gamegroepen en vriendengroepen, vooral mensen met een druk privéleven (ouders, onregelmatige diensten). Minimumleeftijd 16.

**Het probleem dat we oplossen [B]:** tijdzoneverschillen en het uitzoeken van overlap als iedereen op andere tijden kan (bijvoorbeeld 17:00-20:00 versus 18:00-21:00).

**Ontwerpprincipes**

1. Beschikbaarheid eerst, geen events aanmaken. [B]
2. Zo min mogelijk gegevens opslaan. [B]
3. Kosten in v1 zijn €0, maar het moet kunnen schalen. [B]
4. Zichtbaarheid is wederkerig: wie niet deelt, ziet ook niets. [B]
5. Casual, vriendelijk, een beetje gamertaal, niet overdreven. [B]
6. Simpel, Discord-geïnspireerd, geen "AI-look". [B]

**MVP-succescriterium [B]:** de app is live en heeft 100 gebruikers.
**Aanvullende maat [V]:** aantal vriendengroepen (gekoppelde gebruikers) dat wekelijks hun overzicht opent. "Actief" wordt bepaald met de laatste interactie van een gebruiker.

---

## 2. Scope

### In de MVP

- Inloggen met Discord
- Wachtrij met capaciteit, plaats zichtbaar in de app
- Tijdzone instellen en wijzigen
- Beschikbaarheid: terugkerende tijden, uitzonderingen per dag, eenmalige extra tijden
- Weekkalender met overlap en weergave per vriend ("By friend")
- Vrienden koppelen (uitnodigingslink als basis) en tonen/verbergen
- Wederkerig delen aan/uit
- Settings, accountmenu, privacy en data, account verwijderen
- Uitnodigingstekst kopiëren of delen
- "Coming soon"-overzicht
- Mobiele en desktopversie

### Niet in de MVP (later)

- iCal-feed [B]
- Spel kiezen, herinneringen/notificaties in de app [B]
- Spontaan "vanavond nog iemand?" [B]
- Uitnodigen via Discord-DM [B]
- Live online-status (bewust niet: de kern is beschikbaarheid) [B]
- Betaald plan, advertenties, sponsoring [V: niet in v1]
- Meerdere talen [B]
- Discord Activity als productroute [O: eerst een proef, zie hoofdstuk 9]

---

## 3. Begrippen

| Begrip                | Betekenis                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Usual times**       | Een terugkerend weekpatroon: dagen + van/tot-tijd, bijvoorbeeld ma/wo/vr 20:00-23:00. Er kunnen meerdere tijdsbereiken zijn. |
| **Occurrence**        | Eén keer dat een terugkerend patroon voorkomt, bijvoorbeeld woensdag 14 oktober 20:00-23:00.                                 |
| **Uitzondering**      | Een afwijking voor één occurrence: geannuleerd (_Cancelled_) of gewijzigd (_Changed_).                                       |
| **Extra**             | Een eenmalige tijd die niet in het patroon zit (_Extra · one time_).                                                         |
| **Sharing**           | Of je beschikbaarheid gedeeld wordt met je vrienden. Wederkerig: uit = jij ziet niemand en niemand ziet jou.                 |
| **Friend link**       | Een gekoppelde vriendschap tussen twee gebruikers in de app.                                                                 |
| **Waitlist / access** | Nieuwe gebruikers komen in een wachtrij zolang de capaciteit vol is. Toegang is een boolean per gebruiker.                   |
| **Slot**              | Een blok van 30 minuten. Alle berekeningen gebeuren in slots.                                                                |

---

## 4. Gebruikerstoestanden

| Toestand                          | Wat ziet de gebruiker                                                   |
| --------------------------------- | ----------------------------------------------------------------------- |
| Niet ingelogd                     | Landingspagina met "Log in with Discord"                                |
| Ingelogd, **wachtend**            | Wachtrijscherm met plaats ("Your spot is position N")                   |
| Ingelogd, **actief**, sharing aan | Volledige app                                                           |
| Ingelogd, actief, **sharing uit** | Kalender verborgen met uitlegkaart, pilletje "Sharing off" in de header |
| Actief, **geen vrienden**         | Lege staat met prominente deel-knop                                     |

Een vriend kan zijn: _sharing_ (zichtbaar), _niet sharing_ (niet zichtbaar), of _nog niet in de app_ (alleen mogelijk als vriendenlijst uit Discord beschikbaar is, zie 5.7).

---

## 5. Functionele eisen

### 5.1 Inloggen en toegang

| ID        | Eis                                                                                                                                                                                                                                                              | Status |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-AUTH-1 | Inloggen gebeurt uitsluitend met Discord (OAuth2, scope `identify`). Er is geen e-mail of wachtwoord.                                                                                                                                                            | B      |
| FR-AUTH-2 | Bij de eerste login: toon een kort scherm waarop de gebruiker (a) bevestigt dat hij **16 jaar of ouder** is, (b) akkoord gaat met de gebruiksvoorwaarden en privacyverklaring. Zonder akkoord geen account. Leeftijd wordt niet gecontroleerd, alleen bevestigd. | B/V    |
| FR-AUTH-3 | Bij de eerste login wordt de gebruiker toegelaten als er capaciteit is, anders in de wachtrij geplaatst (zie 5.2).                                                                                                                                               | B      |
| FR-AUTH-4 | Bij elke login wordt de weergavenaam ververst vanuit Discord. Het Discord-ID is de sleutel.                                                                                                                                                                      | V      |
| FR-AUTH-5 | Uitloggen beëindigt de sessie.                                                                                                                                                                                                                                   | B      |
| FR-AUTH-6 | De interface gebruikt **initialen** in cirkels in plaats van Discord-avatars (zoals in de designs). Er worden geen avatars opgeslagen.                                                                                                                           | V      |

**Klaar als:** een nieuwe gebruiker kan met Discord inloggen, de leeftijd/voorwaarden bevestigen en daarna ofwel in de app ofwel op het wachtrijscherm belanden.

### 5.2 Wachtrij

| ID      | Eis                                                                                                                                                                                                                                                | Status |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-WL-1 | Er is één instelling **max_active_users** (capaciteit). Elke gebruiker heeft een boolean **has_access**.                                                                                                                                           | B      |
| FR-WL-2 | Is het aantal actieve gebruikers kleiner dan de capaciteit, dan krijgt een nieuwe gebruiker direct toegang. Anders komt hij in de wachtrij met een inschrijftijdstip.                                                                              | B      |
| FR-WL-3 | De **plek in de wachtrij** wordt bij het openen berekend (aantal wachtenden zonder toegang met een eerder tijdstip + 1) en niet opgeslagen. Het wachtrijscherm toont "Your spot is position N".                                                    | B/V    |
| FR-WL-4 | Een gebruiker zonder toegang ziet alleen het wachtrijscherm. De server weigert alle andere gegevens aan wachtenden.                                                                                                                                | B      |
| FR-WL-5 | Toelaten gebeurt handmatig of met een eenvoudig script door de beheerder (zie 5.15). Wordt een account verwijderd, dan komt er een plek vrij.                                                                                                      | V      |
| FR-WL-6 | Wachtenden worden op de hoogte gebracht via de **Discord-communityserver** van de app (aankondiging met @mention). Een bot-DM is een optionele proef. In de app zelf is de plek zichtbaar bij het openen.                                          | B/O    |
| FR-WL-7 | Een wachtende kan zijn aanmelding intrekken (account verwijderen werkt ook vanuit het wachtrijscherm).                                                                                                                                             | V      |
| FR-WL-8 | Uitgenodigde vrienden (via link) van een toegelaten gebruiker kunnen **samen met hun uitnodiger toegelaten** worden, zodat het netwerkeffect niet vastloopt. Hoe dat precies gaat (voorrang of een extra kolom "invited_by") bepaalt de beheerder. | V      |

**Klaar als:** de capaciteit is instelbaar, nieuwe gebruikers boven de limiet staan in de wachtrij met een kloppende plek, en toegelaten gebruikers krijgen toegang zonder opnieuw in te schrijven.

### 5.3 Tijdzone

| ID      | Eis                                                                                                                                                                                                                                                     | Status |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-TZ-1 | Tijdens de eerste login wordt de tijdzone van het apparaat voorgesteld (IANA-naam, bijvoorbeeld `Europe/Amsterdam`) en kan de gebruiker die bevestigen of kiezen.                                                                                       | B/V    |
| FR-TZ-2 | De tijdzone is altijd wijzigbaar in **Settings** en via "Change timezone" in de balk boven de kalender.                                                                                                                                                 | B      |
| FR-TZ-3 | **Alle tijden in de app worden omgerekend naar de tijdzone van de gebruiker.** Boven de kalender staat altijd: "All times are converted to your timezone: Europe/Amsterdam · UTC+2 (CEST)". Het label in de hoek van de grid toont de afkorting (CEST). | B      |
| FR-TZ-4 | Zomer- en wintertijd worden correct afgehandeld. Terugkerende tijden worden opgeslagen als lokale tijd + IANA-tijdzone (dus niet als UTC of vaste offset).                                                                                              | B/V    |
| FR-TZ-5 | Bij vrienden in een andere tijdzone toont de app hun eigen lokale tijd waar relevant (in de kaart met het beste moment en in de kaart bij een aangetikt blokje, bijvoorbeeld "Tom · 04:00 next day (Tokyo)").                                           | B      |

**Klaar als:** twee gebruikers in verschillende tijdzones zien dezelfde gedeelde slots correct omgerekend, ook rond een overgang van zomer- naar wintertijd.

### 5.4 Beschikbaarheid invullen ("Add my times")

**Terugkerende tijden (Usual times)**

| ID      | Eis                                                                                                                                 | Status |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-AV-1 | De gebruiker kiest een of meer dagen (ma t/m zo) en een tijd van/tot (halfuurstappen). Bijvoorbeeld ma, wo, vr van 20:00 tot 23:00. | B      |
| FR-AV-2 | Het patroon herhaalt wekelijks tot de gebruiker het wijzigt.                                                                        | B      |
| FR-AV-3 | De gebruiker kan meerdere tijdsbereiken toevoegen ("Add another time range").                                                       | V      |
| FR-AV-4 | Een tijdsbereik dat over middernacht gaat (bijvoorbeeld 22:00-01:00) wordt ondersteund.                                             | O      |
| FR-AV-5 | Validatie: "tot" ligt na "van"; overlappende bereiken op dezelfde dag worden samengevoegd.                                          | V      |

**Uitzonderingen per dag (zonder de serie te wijzigen)**

| ID       | Eis                                                                                                                                                                                       | Status |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-AV-6  | In "Your upcoming times" (komende twee weken) is elke occurrence apart te **bewerken** of te **annuleren**.                                                                               | B      |
| FR-AV-7  | Bij bewerken kiest de gebruiker het bereik: **"Only this time"** (standaard) of **"This and all future times"**. Alleen de laatste wijzigt de serie.                                      | B      |
| FR-AV-8  | Een gewijzigde occurrence toont het label "Changed" met een korte uitleg (bijvoorbeeld "starts 30 min earlier") en heeft de acties _Save change_, _Reset to usual_ en _Cancel this time_. | B      |
| FR-AV-9  | Een geannuleerde occurrence staat doorgehaald met het label "Cancelled" en de actie _Restore_.                                                                                            | B      |
| FR-AV-10 | Een eenmalige extra tijd ("Extra · one time") kan op een datum worden toegevoegd en daarna worden bewerkt (_Edit_) of verwijderd (_Remove_).                                              | B      |
| FR-AV-11 | De status van elke rij staat altijd als tekstlabel, niet alleen als kleur: _Usual_, _Today_, _Changed_, _Cancelled_, _Extra · one time_.                                                  | B      |
| FR-AV-12 | Wijzigingen zijn direct zichtbaar voor vrienden (als sharing aan staat).                                                                                                                  | V      |
| FR-AV-13 | Tijden in het verleden worden niet meer getoond en niet bewaard.                                                                                                                          | V      |

**Klaar als:** je kunt ma/wo/vr 20:00-23:00 instellen, één woensdag laten beginnen om 19:30, één vrijdag annuleren en een extra donderdagavond toevoegen, terwijl de rest van de serie ongewijzigd blijft.

### 5.5 Kalenderoverzicht ("Calendar")

| ID       | Eis                                                                                                                                                                                                                                                                      | Status |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-CAL-1 | Het hoofdscherm toont een **weekgrid** (ma t/m zo) met rijen van **30 minuten** in de standaardrange **17:00-24:00**. Uurlabels staan op het begin van het blok (bovenrand), halve uren hebben geen label.                                                               | B      |
| FR-CAL-2 | Elke cel toont het **aantal vrienden dat vrij is** (de eigen gebruiker telt niet mee). Cellen met 0 zijn leeg. De kleur loopt op met het aantal (niveau 0 t/m 5) en het getal staat altijd in de cel, zodat informatie niet alleen via kleur wordt gegeven.              | B      |
| FR-CAL-3 | Boven de grid staat een weeknavigatie (vorige/volgende week) met het bereik (bijvoorbeeld "Oct 5 – 11"). Vandaag is gemarkeerd in de dagkop.                                                                                                                             | B      |
| FR-CAL-4 | Een segmentknop schakelt tussen **Calendar** en **By friend**.                                                                                                                                                                                                           | B      |
| FR-CAL-5 | Hover (desktop) of tik (mobiel) op een blok toont een kaart: dag/datum/tijdsblok, "N friends free" met namen en hun lokale tijd, "Not free: …" en de hint "Click to see the whole evening". Op mobiel opent dit als bottom sheet. Toetsenbordfocus toont dezelfde kaart. | B      |
| FR-CAL-6 | De kaart **"Best time this week"** toont het beste moment van de week, de tekst "All N friends who share are free" (of "N of M friends free"), de lokale tijden van vrienden en de knop **"See this evening"** (opent By friend voor die dag).                           | B/V    |
| FR-CAL-7 | **Beste moment [V]:** de langste aaneengesloten reeks slots (minimaal 60 minuten) met het hoogste aantal vrije vrienden. Bij gelijke stand wint de langste, daarna de vroegste. Bij een maximum onder 2 wordt de kaart verborgen.                                        | V      |
| FR-CAL-8 | De standaardrange 17:00-24:00 is bewust een avondfocus. Of de range uitgebreid of scrollbaar moet zijn (dagdiensten, nachtdiensten, vrienden in andere tijdzones) is nog niet beslist.                                                                                   | O      |
| FR-CAL-9 | Alleen vrienden die **zichtbaar** zijn (sharing aan, niet verborgen in het overzicht) tellen mee in de aantallen.                                                                                                                                                        | B      |

### 5.6 Weergave per vriend ("By friend")

| ID      | Eis                                                                                                                                                                                             | Status |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-BF-1 | Bovenaan staat een dagkeuze (ma t/m zo), standaard vandaag (of de dag waarvan de gebruiker komt via "See this evening").                                                                        | B/V    |
| FR-BF-2 | De tijdlijn toont 17:00-24:00 in blokken van 30 minuten, met uurlabels op het begin van het blok en het label van de eigen tijdzone (CEST) in de hoek.                                          | B      |
| FR-BF-3 | De rij **"Everyone"** toont per slot het aantal vrije vrienden (zelfde kleurschaal als het kalenderoverzicht).                                                                                  | B      |
| FR-BF-4 | Elke zichtbare vriend heeft een rij met naam, initialen, tijdzone en verschil (bijvoorbeeld "London · −1h", "Tokyo · +7h") en een balk voor hun vrije tijd (met begin- en eindtijd op desktop). | B      |
| FR-BF-5 | Een gemarkeerde band toont het beste moment van die dag.                                                                                                                                        | B      |
| FR-BF-6 | Op mobiel staan de lokale tijden van vrienden onder de tijdlijn als tekst.                                                                                                                      | B      |

### 5.7 Vrienden

**Vrienden koppelen**

| ID      | Eis                                                                                                                                                                                                                                                                                                | Status |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-FR-1 | **Basis [B/V]:** vrienden koppelen via een **uitnodigingslink**. Een uitgenodigde logt in met Discord, en na acceptatie ("X invited you") zijn beide gebruikers gekoppeld (wederkerig). Is de uitgenodigde nog in de wachtrij, dan wordt de koppeling bewaard en actief zodra toegang is verleend. | V      |
| FR-FR-2 | **Uitbreiding [O]:** de Discord-vriendenlijst gebruiken (scope `relationships.read`, via een Discord Activity of na goedkeuring van Discord). Dit staat achter een schakelaar en wordt eerst in de demo getest. Zonder deze toegang bestaan er geen "nog niet in de app"-vrienden in de lijst.     | O      |
| FR-FR-3 | Als de Discord-vriendenlijst beschikbaar is: toon vrienden die de app al gebruiken en vrienden die dat nog niet doen. Alleen **de koppeling tussen gebruikers van de app** wordt opgeslagen; de vriendenlijst zelf, openstaande verzoeken en geblokkeerde gebruikers worden nooit opgeslagen.      | B      |
| FR-FR-4 | Een vriend die de app nog niet heeft, staat met een stippelrand in de lijst, de tekst "Not on SquadTime yet" en een knop **Invite**.                                                                                                                                                               | B      |

**Vriendenlijst en zichtbaarheid in het overzicht**

| ID      | Eis                                                                                                                                                                                                                                               | Status |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-FR-5 | Het vriendenpaneel toont "Friends", het aantal ("7 friends · 5 sharing") en per vriend: initialen, naam, tijdzone en een vinkje onder het kopje **"Show in calendar"**. Dit vinkje is een **weergavefilter** en verandert niets aan wie jou ziet. | B      |
| FR-FR-6 | Bij **tot 10** vrienden staan ze allemaal aan. Bij **meer dan 10** staan standaard **10** aan en de rest uit. Welke 10 dat zijn: de **meest actieve** (op basis van laatste interactie).                                                          | B/V    |
| FR-FR-7 | Een vriend die niet deelt, wordt niet getoond met tijden. In de lijst staat hij met een neutrale status.                                                                                                                                          | V      |
| FR-FR-8 | De gebruiker kan een gekoppelde vriend verwijderen. De koppeling verdwijnt dan voor beiden.                                                                                                                                                       | V      |

**Uitnodigen**

| ID       | Eis                                                                                                                                                                                                                                   | Status |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-INV-1 | De knop **"Invite friends"** (vriendenpaneel en accountmenu) kopieert een uitnodigingstekst met link naar het klembord, of opent op telefoons de deelsheet. Daarna verschijnt de melding "Invite message copied. Paste it in a chat." | B      |
| FR-INV-2 | De knop **Invite** naast een vriend doet hetzelfde met zijn naam in de tekst.                                                                                                                                                         | B      |
| FR-INV-3 | Zonder vrienden in de app is de deel-knop **prominent** (lege staat); met vrienden is hij **subtiel**.                                                                                                                                | B      |
| FR-INV-4 | Een uitnodigingslink leidt naar de aanmelding: afhankelijk van capaciteit direct toegang of een plek in de wachtrij.                                                                                                                  | B      |
| FR-INV-5 | Een DM via Discord is een latere uitbreiding.                                                                                                                                                                                         | B      |

### 5.8 Delen (Sharing)

| ID      | Eis                                                                                                                                                                                                                      | Status |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-SH-1 | Er is één schakelaar **"Share my times"** (Settings). **Aan:** vrienden zien jouw beschikbaarheid en jij die van hen. **Uit:** niets van beide.                                                                          | B      |
| FR-SH-2 | De uitleg bij de schakelaar zegt dat delen uitzetten betekent dat je ook de tijden van anderen niet meer ziet, en dat je opgeslagen tijden blijven bestaan.                                                              | B      |
| FR-SH-3 | Staat delen uit, dan toont het hoofdscherm een **placeholder** van de kalender met de kaart "Your calendar is hidden", de knoppen **"Turn on sharing"** en **"Open Settings"**, en de tekst "Your saved times are kept." | B      |
| FR-SH-4 | Staat delen uit, dan staat er in de header het pilletje **"Sharing off"**, dat naar Settings leidt. Het pilletje verschijnt alleen als delen uit staat.                                                                  | B      |
| FR-SH-5 | In het vriendenpaneel zijn dan de vinkjes uitgeschakeld en de "next free"-teksten verborgen.                                                                                                                             | B      |
| FR-SH-6 | "Add my times" blijft werken met sharing uit, zodat je je rooster alvast kunt invullen.                                                                                                                                  | V      |
| FR-SH-7 | Bij de eerste keer gebruiken wordt kort uitgelegd dat vrienden je beschikbaarheid zien. De standaardwaarde na onboarding is **aan**.                                                                                     | V      |

### 5.9 Settings

| ID       | Eis                                                                                                                                                                                                                      | Status |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-SET-1 | **Timezone:** keuzelijst met de huidige tijdzone en de uitleg "Every time in the app is converted to this timezone." plus de melding dat de tijdzone van het apparaat is herkend en zomer-/wintertijd wordt afgehandeld. | B      |
| FR-SET-2 | **Share my times:** schakelaar (zie 5.8) met de uitleg. Toont ook een voorbeeld van wat je ziet als delen uit staat.                                                                                                     | B      |

### 5.10 Accountmenu (avatar "ME")

Het menu opent vanuit de knop rechtsboven (desktop: dropdown, mobiel: bottom sheet) met de Discord-naam en "Signed in with Discord".

| Item               | Beschrijving                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------ |
| My times           | Naar "Add my times"                                                                        |
| Invite friends     | Kopieert/deelt uitnodigingstekst                                                           |
| Settings           | Timezone en sharing                                                                        |
| Privacy & data     | Uitleg welke gegevens worden bewaard, link naar privacyverklaring, en **Download my data** |
| Join the community | Link naar de Discord-communityserver                                                       |
| Log out            | Beëindigt sessie                                                                           |
| Delete my account  | Opent bevestiging (5.11), onderaan in waarschuwingskleur                                   |

### 5.11 Account verwijderen en gegevens

| ID       | Eis                                                                                                                                                                                                                                                                                                                   | Status |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-ACC-1 | Een gebruiker kan zijn account **altijd** verwijderen.                                                                                                                                                                                                                                                                | B      |
| FR-ACC-2 | Bevestigingsscherm "Delete your account?" legt uit: alles wordt direct verwijderd (tijden, vriendkoppelingen, instellingen), het kan niet ongedaan worden gemaakt, en bij terugkomen sta je weer in de wachtrij. Knoppen: **Keep my account** (opvallend) en **Delete everything**. Link: **Download my data first**. | B      |
| FR-ACC-3 | Verwijderen is een **harde verwijdering** (geen soft delete) van alle gegevens van die gebruiker, inclusief koppelingen aan andere gebruikers en het wachtrij-record.                                                                                                                                                 | B/V    |
| FR-ACC-4 | **Download my data** levert een bestand (JSON) met alle gegevens die over de gebruiker zijn opgeslagen.                                                                                                                                                                                                               | V      |
| FR-ACC-5 | Inactieve accounts worden na 12 maanden zonder login automatisch verwijderd.                                                                                                                                                                                                                                          | O      |

### 5.12 "Coming soon"

| ID        | Eis                                                                                                                                                           | Status |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-SOON-1 | Onderaan het hoofdscherm staat een rij "Coming soon" met niet-klikbare chips (Pick a game, Reminders, Calendar feed) die laten zien wat er nog gebouwd wordt. | B      |
| FR-SOON-2 | Updates en feedback lopen via de Discord-communityserver.                                                                                                     | B      |

### 5.13 Notificaties

In de MVP **geen** notificaties in de app of per e-mail [B]. Aankondigingen (toelating, updates) lopen via de Discord-communityserver [B]. Bot-DM is een optionele proef [O].

### 5.14 Toon en teksten

- Casual, vriendelijk, een beetje gamertaal, niet overdreven. Alleen Engels. [B]
- Kopteksten uit de designs: "Who's up for a game?", "Add my times", "Your calendar is hidden", "Best time this week".
- Gebruik werkwoorden die zeggen wat een knop doet ("Turn on sharing", "Invite friends", "See this evening").
- Op een plek in de app (bijvoorbeeld Privacy & data of de footer) staat een korte zin dat de app met AI is gemaakt. [B]
- Afbeeldingen: CC0 of AI-gegenereerd, geen beschermde game-afbeeldingen. De pixel-kamer naast de titel en genre-iconen in dezelfde stijl. [B]

### 5.15 Beheer (zonder interface in de MVP)

| ID       | Eis                                                                                                                                                                                                   | Status |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-ADM-1 | De beheerder kan met een script of commando: de capaciteit (`max_active_users`) aanpassen, de volgende N gebruikers uit de wachtrij toelaten, en het aantal actieve en wachtende gebruikers opvragen. | V      |
| FR-ADM-2 | Het beheerscript kan alleen door de eigenaar worden gebruikt (geen openbare admin-pagina).                                                                                                            | V      |

### 5.16 Meten

Alleen wat nodig is: `last_active` per gebruiker en de aantallen actieve/wachtende gebruikers uit de eigen database. **Geen** advertenties, trackers of externe analytics. [B/V]

---

## 6. Gegevens (minimaal)

Bewaard:

| Gegeven                                                                     | Doel                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Discord-ID (sleutel)                                                        | Identiteit en koppelingen                                    |
| Weergavenaam (ververst bij login)                                           | Tonen in de app                                              |
| Tijdzone (IANA)                                                             | Omrekenen van tijden                                         |
| Sharing aan/uit                                                             | Zichtbaarheid                                                |
| `has_access`, tijdstip van inschrijving                                     | Wachtrij                                                     |
| Bevestiging 16+ en voorwaarden (versie + tijdstip)                          | AVG en voorwaarden                                           |
| `last_active`                                                               | "Wekelijks actief" en keuze van de 10 meest actieve vrienden |
| Terugkerende tijden en uitzonderingen                                       | Beschikbaarheid                                              |
| Vriendkoppelingen tussen app-gebruikers (inclusief openstaande uitnodiging) | Vrienden                                                     |

**Niet bewaard:** e-mail, echte naam, avatars, de Discord-vriendenlijst, openstaande vriendverzoeken, geblokkeerde gebruikers, IP-adressen voor analyse.

**Terugkerende tijden:** per patroon: dagen van de week, van/tot in lokale tijd, IANA-tijdzone, begin- en einddatum van de serie. **Uitzondering:** per occurrence: datum, type (_cancelled_, _changed_, _extra_), nieuwe van/tot.

---

## 7. Schermen en designs

Alle designs staan in de `design/` map (referentie markup; kopieer de look, niet de structuur).

| Scherm                                     | Desktopbord    | Mobiel bord                                 |
| ------------------------------------------ | -------------- | ------------------------------------------- |
| Calendar (hoofdscherm)                     | Main           | Mobile – calendar                           |
| By friend                                  | ByFriend       | Mobile – by friend                          |
| Add my times                               | AddTimes       | Mobile – add my times                       |
| Settings                                   | Settings       | Mobile – settings en sharing off            |
| Sharing off                                | SharingOff     | Mobile – settings en sharing off            |
| Accountmenu, verwijderen, kaart bij blokje | Account, Hover | Mobile – account menu, delete, tapped block |

**Ontwerpen die nog ontbreken** [O]

1. Landingspagina / login ("Log in with Discord")
2. Onboarding: tijdzone bevestigen, 16+ en voorwaarden, korte uitleg over delen
3. Wachtrijscherm ("Your spot is position N")
4. Lege staat zonder vrienden (met prominente deel-knop)
5. Landingspagina voor een uitnodigingslink ("X invited you")
6. Foutscherm als de gratis limiet bereikt is ("We're full for today, try later")
7. Privacyverklaring en gebruiksvoorwaarden (tekst)
8. Mobiele lege staat en onboarding

---

## 8. Niet-functionele eisen

- **Kosten:** v1 draait volledig op gratis tiers. Een technische limiet (capaciteit, daglimiet) is acceptabel; als een daglimiet bereikt is, toont de app een nette melding in plaats van een fout. [B]
- **Schaalbaarheid:** de opzet moet zonder herbouw kunnen doorgroeien naar een betaald plan. [B]
- **Privacy/AVG:** dataminimalisatie, volledige verwijdering op verzoek, dataexport, EU-hosting waar mogelijk, korte privacyverklaring, geen tracking, alleen strikt noodzakelijke cookies. Dit is geen juridisch advies; laat de teksten controleren. [B/V]
- **Toegankelijkheid:** WCAG AA-contrast, informatie nooit alleen via kleur, toetsenbordbediening, tikdoelen van minstens 44px (uitzondering: halfuurblokken in het weekoverzicht op mobiel, die staan op 28px en openen een sheet), `prefers-reduced-motion` respecteren. [V]
- **Responsive:** desktop en mobiel (390px en breder). [B]
- **Prestatie:** het weekoverzicht wordt in één keer berekend bij het openen. De datahoeveelheid is klein.
- **Naamgeving:** de productnaam staat op één plek configureerbaar. [V]

---

## 9. Voorgestelde techniek (standaard; hoeft niet door JP beslist te worden)

- **Website met Discord-login** als basis, met een kleine, aparte proef voor een Discord Activity om te testen of de vriendenlijst beschikbaar is. [B]
- Frontend: React + Vite. Backend: API services via HTTP (separate repo / deployment). All in Git, deploy via pipeline, config as code. [V]
- No user data in logs. All secrets live only as environment variables in the backend deployment (not in this repo). [V]
- Een Discord Activity moet voor publiek gebruik door Discord worden **geverifieerd**; niet-geverifieerde Activities zijn alleen zichtbaar voor jou, je team en testers. Dit is een risico voor het doel van 100 gebruikers. [O]
- Het scope `relationships.read` buiten een Activity vereist waarschijnlijk een aanvraag bij Discord. Indienen kost niets; niet op wachten. [O]

---

## 10. Bouwvolgorde (voorstel)

Werk in kleine delen (past bij Claude Pro-limieten) en houd een `CLAUDE.md` in de repo met deze spec, de designtokens en wat "klaar" betekent.

| Fase                     | Inhoud                                                                                        | Klaar als                                             |
| ------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **0. Demo**              | Discord-login, rooster, koppeling via link, weekkalender, Activity-proef                       | De vijf leervragen zijn beantwoord                    |
| **1. Basis**             | Project, designtokens, naam configureerbaar, Discord-login, 16+/voorwaarden, database         | Inloggen werkt, account wordt aangemaakt              |
| **2. Wachtrij**          | Capaciteit, `has_access`, plek berekenen, wachtrijscherm, beheerscript                        | Boven de limiet sta je in de wachtrij                 |
| **3. Beschikbaarheid**   | Tijdzone, usual times, uitzonderingen, extra tijden, "Add my times"                           | Voorbeeld uit 5.4 werkt                               |
| **4. Overzicht**         | Weekgrid, tellingen, kaart bij blokje, beste moment, By friend                                | Aantallen kloppen over tijdzones en zomer-/wintertijd |
| **5. Vrienden en delen** | Uitnodigingslink, koppelen, Show in calendar, wederkerig delen, sharing-off-staat             | Wederkerigheid werkt in beide richtingen              |
| **6. Account**           | Settings, accountmenu, Privacy & data, export, verwijderen                                    | Verwijderen wist alles                                |
| **7. Lancering**         | Privacyverklaring, communityserver, community-link, "Coming soon", foutstaten, mobiele polish | Live met eerste gebruikers                            |

---

## 11. Open punten en risico's

| #   | Punt                                           | Toelichting                                                                                                           |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Definitieve **naam**                           | SquadTime is voorlopig. Controleer domein, app stores, Discord-app-naam, handles en merk (BOIP/EUIPO).                |
| 2   | **Discord-vriendenlijst**                      | Werkt het in een Activity? Is een aanvraag nodig voor een website? Fallback: uitnodigingslink (staat al in 5.7).      |
| 3   | **Verificatie van de Activity**                | Nodig voor publiek gebruik; eisen en doorlooptijd onbekend.                                                           |
| 4   | **Meldingen aan wachtenden**                   | Communityserver is besloten; bot-DM nog testen.                                                                       |
| 5   | **Standaardrange van de kalender**             | Alleen 17:00-24:00, of uitbreidbaar? Relevant voor vrienden in andere tijdzones en wisseldiensten.                    |
| 6   | **Tijden over middernacht**                    | Ondersteunen we 22:00-01:00?                                                                                          |
| 7   | **Standaard sharing** na onboarding            | Voorstel: aan, met uitleg.                                                                                            |
| 8   | **"10 meest actieve" vrienden**                | Voorstel: laatste interactie.                                                                                         |
| 9   | **Beste-moment-regel**                         | Voorstel in FR-CAL-7.                                                                                                 |
| 10  | **Gratis limieten**                            | Controleer actuele limieten van de gekozen hosting en database; de app moet netjes omgaan met een bereikte daglimiet. |
| 11  | **Bewaartermijn**                              | Voorstel: inactieve accounts na 12 maanden verwijderen.                                                               |
| 12  | **Uitnodigingen bij een wachtende uitnodiger** | Hoe lang bewaren we een koppeling als iemand niet doorkomt?                                                           |
| 13  | **Misbruik**                                   | Spam via uitnodigingslinks en veel inschrijvingen; eenvoudige rate limits.                                            |
| 14  | **Support**                                    | Via de communityserver; adres of kanaal in de privacyverklaring.                                                      |
| 15  | **Juridisch**                                  | Teksten voor voorwaarden en privacy laten controleren.                                                                |
