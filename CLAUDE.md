# Pac-Man del Nord — guida per chi continua il progetto

Progetto universitario (LUMSA, corso "Tecnologie avanzate per l'innovazione e l'esperienza"). Esame a gennaio, presentazione al professore a dicembre.
Confronto tra tre modi di costruire un'esperienza digitale partendo da un vecchio Pac-Man in Processing a tema Game of Thrones:
1. analisi del progetto originale (chiusa: 15 problemi trovati, misure di partenza prese);
2. un solo prompt a un'AI (fatto, c'è un confronto in xlsx);
3. **questa versione**: sviluppata con l'AI seguendo le 5 fasi Waterfall (requisiti, progettazione, implementazione, verifica, manutenzione), che va oltre il gioco base.

**L'utente è una studentessa italiana: parlale in italiano, spiega le cose in modo semplice.** Deve capire il codice per l'esame orale: codice chiaro, commenti in italiano, nomi in italiano, niente trucchi.
Lei dirige, prova il gioco e decide; l'AI scrive il codice. Dopo ogni modifica falle provare il gioco e chiedi com'è andata (non puoi giudicare l'aspetto da solo).

## Come si avvia e si prova
- Il gioco si apre con doppio clic su `index.html` (nessun server). Carica p5.js 1.9.4 e Three.js r147 da internet (CDN).
- **Test automatici (solo Node, nessuna dipendenza):** `node verifica.js` (comandi assoluti) e `node verifica.js relativi` (comandi relativi). Vanno lanciati dopo ogni modifica alla logica: devono finire con "Tutte le prove superate.". Ogni prova è collegata a un requisito (RF/RNF).
- `node tools/prova_vista_three.js .` prova la vista Three.js con una libreria finta (errori, NaN, modelli per livello). Con la libreria vera si può provare meglio: sul computer dell'utente le CDN sono raggiungibili, quindi si può usare un browser headless (Playwright) per vedere davvero la scena e misurare gli FPS.
- `tools/prova_vista_p5.js` e `tools/prova_vista_2d.js`: prove analoghe per la vista p5 e per la 2D.
- `tools/bake.py`: trasforma i modelli OBJ+MTL in `modelli.js` (serve solo se si cambiano i modelli): `python3 tools/bake.py modelli.js cartella_dei_modelli`.

## Architettura (requisito RNF8: logica separata dal disegno)
La **logica** non usa p5 né disegna, ed è provata da `verifica.js`. Il **disegno** e l'**audio** leggono lo stato del gioco e non lo cambiano mai.
| File | Cosa fa |
|---|---|
| `costanti.js` | tutte le costanti (velocità, tempi, camera, finestra...). Prima di scrivere numeri nel codice, cercare qui |
| `labirinti.js` | gli 8 labirinti (stringhe `#` muro, `.` strada), tunnel, partenze, Trono |
| `labirinto.js` | muri, cibo, potenziamenti, distanze (BFS), tunnel laterali |
| `livelli.js` | tabella degli 8 regni e difficoltà per livello (`parametriLivello`) |
| `entita.js`, `giocatore.js`, `fantasma.js` | movimento a celle basato sul tempo; comandi; i 3 comportamenti dei fantasmi |
| `gioco.js` | stati (menu/pronto/gioco/vittoria/sconfitta), vite, punti, contatti, Trono, record, modalità prova |
| `sketch.js` | colla con p5: finestra, input da tastiera, scelta della vista, audio |
| `vista2d.js` | vista 2D, barra in alto, minimappe, messaggi, guida alle svolte |
| `vista_three.js` | **vista 3D principale** (Three.js): camera in terza persona, personaggi, decorazioni |
| `ambiente.js` | atmosfera per regno (texture dei muri, nebbia, particelle, torce): tabella `AMBIENTI` |
| `modelli.js` | modelli 3D dei personaggi, generati da `tools/bake.py` (file grande, non modificare a mano) |
| `vista3d.js` | vista 3D di ripiego in p5 (+ funzioni di geometria usate anche da `vista_three.js`) |
| `suoni.js` | musica ed effetti generati dal browser (Web Audio), niente file audio |
Catena di ripiego: Three.js → vista 3D p5 → vista 2D (se qualcosa dà errore).

## Regole di gioco e scelte già approvate dall'utente
- Nessun vicolo cieco; passaggio laterale (tunnel) anche per i fantasmi (più lenti); 3 fantasmi con comportamento diverso (insegue / anticipa / casuale); potenziamento negli angoli; 3 vite; fasi dispersione 7 s / caccia 20 s.
- 8 livelli = 7 regni + il Trono (livello 8). Livelli speciali 4 e 8: **solo il tempo limite** (non altri cambiamenti). Casate note e riconoscibili, palette per regno.
- Livello 8: il Trono sta **al centro** di una piazza; si apre quando il cibo è finito, i fantasmi si disperdono per 7 s, raggiungerlo = vittoria. Il cavaliere parte in basso al centro (non vicino ai portali).
- Record salvato nel browser (localStorage), conta solo se si parte dal livello 1 e senza modalità prova.
- Vista 3D: terza persona, **comandi relativi** (Su avanti, Sinistra/Destra girano, Giù inverte). Fantasmi al 75% della velocità in 3D (`FATTORE_FANTASMI_3D`). Le svolte prenotate scadono dopo 1 s. In basso al centro la guida con tre frecce; minimappa tonda che ruota in basso a destra, mappa intera ferma in alto a destra.
- Tasti: frecce; INVIO avvia; 1-8 (dal menu) scelgono il livello; V cambia vista 2D/3D; N mostra/nasconde la mappa ferma; M audio; **P modalità prova** (invincibile, tempo fermo, record disattivato); **E** in prova apre il Trono / passa al livello dopo.
- Audio: l'utente lo vuole grave, cupo, non "da giochi per bambini"; pochi effetti sopra la musica (cibo e caccia spenti). Livelli 1-5 e 7 approvati, 6 e 8 "più o meno bene".

## Grafica e licenze (importante)
- Si usano solo materiali originali o gratuiti con crediti documentati in `CREDITI.md` (aggiornarlo se si aggiunge qualcosa). Niente immagini, musiche o volti protetti della serie; nomi e colori delle casate vanno bene solo come riferimento.
- Personaggi: pacchetti Quaternius CC0 (cavaliere, scheletro, pipistrello, drago, slime). Il cavaliere ha la tunica ricolorata di verde (colore del giocatore) ed è diviso in parti (corpo, braccia, gambe) per camminare; i mostri oscillano soltanto.
- Il giocatore deve sempre distinguersi dai fantasmi: verde brillante + anello bianco + cristallo verde.

## Cosa non è mai stato visto con i propri occhi
Chi ha scritto `vista_three.js`, `ambiente.js` e le decorazioni non poteva scaricare Three.js: sono stati provati solo con una libreria finta. L'aspetto reale (colori, proporzioni, FPS) l'ha visto solo l'utente da screenshot e video. Va misurato con una libreria vera: obiettivo ≥ 55 FPS (RNF1); finora circa 60 nel livello 1 senza atmosfera, mai misurato dopo l'aggiunta di particelle e decorazioni.

## Da fare / idee aperte
- Rendere "particolari" anche Nord, Isole e Fiumi, Valle, Tempesta (come già fatto per Altopiano, Dorne, Roccia, Trono). Le dune di Dorne sono state tolte (le dava fastidio).
- Far camminare anche i mostri (scheletro: gambe) e provare le animazioni vere dei file FBX.
- Misurare gli FPS in tutti i livelli con la scena completa; ridurre particelle/torce se servono.
- **Documentazione per l'esame:** testo dei requisiti (RF1–RF20, RNF1–RNF8), progettazione (mappa dei file, macchina a stati, tabella livelli), relazione di verifica (risultati di `verifica.js`, FPS), diario del lavoro con l'AI, tabella crediti, slide (massimo 10, prima e ultima incluse) + testo breve di 4–6 pagine, guida alle domande d'esame con la mappa delle funzioni della vista 3D. Eventuale aggiornamento del confronto xlsx con le nuove misure.
- Facoltativo: Dorne ha il colore di sfondo non verificato; ricontrollare i colori delle casate se l'utente cambia idea.
