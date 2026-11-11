# 4. Diario del lavoro con l'AI — Pac-Man del Nord

Questo diario racconta come è stata costruita la terza versione del gioco: sviluppata con un'AI seguendo le 5 fasi del modello Waterfall.

**Divisione dei ruoli:**
- **la studentessa dirige:** decide cosa fare, prova il gioco, giudica l'aspetto e il suono, approva o fa cambiare;
- **l'AI scrive il codice:** propone soluzioni, scrive le prove automatiche e spiega le scelte.

> **Come completarlo.** La storia del repository contiene un solo commit, quindi le date precise delle singole sessioni non si possono ricostruire dal codice. Le voci qui sotto sono ordinate per fase e contengono le decisioni documentate in `CLAUDE.md`. Aggiungi tu le **date** (anche solo approssimative, per settimana) e, se te li ricordi, gli esempi di richieste fatte all'AI.

---

## Fase 0 — Punto di partenza (prima del Waterfall)

| Data | Cosa è stato fatto | Risultato |
|---|---|---|
| *…* | **Analisi del Pac-Man originale** (Processing, tema Game of Thrones) | 15 problemi trovati e misure di partenza prese |
| *…* | **Versione "un solo prompt"**: tutto il gioco chiesto all'AI con una sola richiesta | Fatta; il confronto con l'originale è nel file xlsx |

## Fase 1 — Requisiti

| Data | Decisione | Chi ha deciso / perché |
|---|---|---|
| *…* | Requisiti scritti come RF1–RF20 e RNF1–RNF8, ognuno con un modo per verificarlo | Metodo Waterfall: prima *cosa*, poi *come* |
| *…* | Regole base: nessun vicolo cieco, tunnel anche per i fantasmi (più lenti), 3 fantasmi diversi, potenziamenti negli angoli, 3 vite, fasi 7 s / 20 s | La studentessa, partendo dai problemi dell'originale e dal Pac-Man classico |
| *…* | 8 livelli = 7 regni + il Trono; nei livelli speciali 4 e 8 **solo** il tempo limite | La studentessa: niente altri cambiamenti, per non confondere |
| *…* | Record solo partendo dal livello 1 | Per non "barare" scegliendo un livello avanzato |
| *…* | Obiettivo ≥ 55 FPS; logica separata dal disegno | Requisiti non funzionali: fluidità e possibilità di provare il codice |

## Fase 2 — Progettazione

| Data | Decisione | Perché |
|---|---|---|
| *…* | p5.js (erede di Processing) e JavaScript nel browser, apertura con doppio clic | Confronto diretto con l'originale; niente da installare |
| *…* | Divisione in file: logica (`gioco.js`, `entita.js`...) e presentazione (viste, audio) | RNF8: la logica si prova con Node |
| *…* | Movimento a celle basato sul tempo | RNF2: stessa velocità su ogni computer (era uno dei problemi dell'originale) |
| *…* | Tutte le costanti in `costanti.js` | RNF4: niente numeri sparsi |
| *…* | Macchina a stati menu / pronto / gioco / vittoria / sconfitta | Regole chiare, facili da provare |

## Fase 3 — Implementazione

| Data | Cosa è stato fatto | Intervento della studentessa |
|---|---|---|
| *…* | Logica di base: labirinto, giocatore, fantasmi, contatti, vite, livelli | Ha provato il gioco in 2D |
| *…* | Labirinti generati al computer e controllati da `verifica.js` | — |
| *…* | Palette per regno ispirate alle casate | Ha scelto colori "noti e riconoscibili" |
| *…* | **Vista 3D in terza persona** con comandi relativi | Ha approvato: Su avanti, Sinistra/Destra girano, Giù inverte |
| *…* | Fantasmi al 75% della velocità in 3D | Si vede meno della mappa, quindi era troppo difficile |
| *…* | Svolta prenotata che scade dopo 1 s | Il personaggio girava "da solo" molto dopo il tasto |
| *…* | Guida con tre frecce; minimappa tonda che ruota; mappa ferma (tasto N) | Per orientarsi nella 3D |
| *…* | Passaggio a **Three.js** come vista principale, con la 3D di p5 e la 2D come ripiego | Più realistica (luci, nebbia, modelli) |
| *…* | Personaggi Quaternius CC0: cavaliere (tunica verde, cammina), scheletro, pipistrello, drago, slime | Il giocatore deve distinguersi sempre: verde + anello bianco + cristallo |
| *…* | Atmosfera per regno (`ambiente.js`): texture, nebbia, particelle, torce, lampi | — |
| *…* | Regni "particolari": Roccia (stendardi), Altopiano (siepi), Dorne (giare, palme), Trono (sala del castello) | **Ha fatto togliere le dune di Dorne** (le davano fastidio) |
| *…* | Livello 8: Trono al centro della piazza, cavaliere in basso al centro | Lontano dai portali |
| *…* | Musica generata con Web Audio, una per regno | Voleva un suono **grave e cupo**, non "da giochi per bambini"; ha fatto spegnere gli effetti del cibo e della caccia |
| *…* | Modalità prova (P, E) | Per le dimostrazioni e per vedere subito ogni livello |

## Fase 4 — Verifica

| Data | Cosa | Esito |
|---|---|---|
| *…* | `verifica.js`: prove collegate ai requisiti, nelle due modalità di comando | 137/137 e 136/136 superate (11/11/2026) |
| *…* | Prove delle viste con una libreria finta (`tools/`) | Nessun errore, nessun NaN |
| *…* | Prove manuali: aspetto (screenshot, video), audio | Audio 1–5 e 7 approvati; 6 e 8 "più o meno bene" |
| *…* | FPS | ~60 nel livello 1 senza atmosfera; **da rimisurare con la scena completa** |

## Fase 5 — Manutenzione (in corso)

| Idea | Stato |
|---|---|
| Rendere "particolari" anche Nord, Isole e Fiumi, Valle, Tempesta | da fare |
| Far camminare anche i mostri; provare le animazioni dei file FBX | da fare |
| Misurare gli FPS in tutti i livelli | da fare |
| Ricontrollare il colore di sfondo di Dorne | facoltativo |
| Documentazione per l'esame (questa cartella `docs/`) | fatta, da rivedere |

---

## Riflessioni sul lavoro con l'AI (da completare con le tue parole)

Domande guida per scrivere le tue conclusioni:

1. **Cosa ha fatto bene l'AI?** Per esempio: scrivere tanto codice in poco tempo; le prove automatiche; trovare i vicoli ciechi; spiegare.
2. **Dove ha avuto bisogno di te?** L'AI **non vede lo schermo e non sente l'audio**: ogni giudizio estetico (colori, dune, musica cupa) è venuto da te. Inoltre non poteva scaricare Three.js, quindi ha provato la 3D solo con una libreria finta.
3. **Differenza con la versione "un solo prompt".** Lì l'AI ha deciso tutto da sola e senza prove. Qui ogni requisito ha una verifica e ogni scelta visiva è passata da te.
4. **Cosa rifaresti diversamente?** Per esempio: misurare gli FPS dopo ogni aggiunta grafica, non solo alla fine.
