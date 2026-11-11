# 1. Requisiti — Pac-Man del Nord

Prima fase del modello Waterfall: **cosa** deve fare il gioco, prima di decidere **come** farlo.

- **Requisiti funzionali (RF):** descrivono quello che il gioco fa, cioè quello che il giocatore vede e può fare.
- **Requisiti non funzionali (RNF):** descrivono come deve essere il gioco: veloce, robusto, chiaro, legale.

Ogni requisito ha una colonna **Verifica**, che dice come si controlla che sia rispettato:
- `verifica.js` = prova automatica (vedi `03_relazione_verifica.md`);
- *manuale* = va provato giocando o guardando lo schermo.

> **Nota per la studentessa.** Nel codice e nelle prove compaiono con il loro numero RF2–RF9, RF12–RF20, RNF2, RNF4 e RNF8. Il testo di **RF1, RF10, RF11, RNF1, RNF3, RNF5, RNF6 e RNF7** è stato ricostruito dalle regole approvate in `CLAUDE.md` e dal codice. Confrontalo con i tuoi appunti: se un numero era diverso, basta correggere la tabella.

---

## 1.1 Requisiti funzionali

### Il gioco base

| ID | Requisito | Criterio di accettazione | Verifica |
|---|---|---|---|
| **RF1** | Il giocatore guida il cavaliere nel labirinto con le frecce. Mangiando il cibo guadagna punti (cibo 10, sfera 50, fantasma 200). | Il personaggio si muove solo sulle strade, mai nei muri. Ogni pezzo di cibo mangiato dà i suoi punti e sparisce. | `verifica.js` (comandi assoluti e relativi, simulazione di 5 minuti); manuale |
| **RF2** | Nessun labirinto ha vicoli ciechi e ogni cella libera è raggiungibile. | Per ognuno degli 8 labirinti: ogni cella libera ha almeno 2 uscite e la ricerca BFS le raggiunge tutte. | `verifica.js` |
| **RF3** | Passaggio laterale (tunnel): chi esce da un lato rientra dall'altro, sulla stessa riga. Vale anche per i fantasmi, e nel tunnel tutti vanno più piano (60%). | Esce a sinistra e rientra a destra sulla stessa riga. I bordi sono aperti solo sulle righe del tunnel. | `verifica.js` |
| **RF4** | Ci sono 3 fantasmi con comportamenti diversi: **insegue** (percorso più breve verso il giocatore), **anticipa** (mira 4 celle davanti a lui), **casuale** (sceglie a caso a ogni incrocio). Escono di casa a turno (3, 8, 12 s). | I tre comportamenti sono diversi. "Insegue" raggiunge un giocatore fermo. "Casuale" non torna indietro senza motivo. | `verifica.js` |
| **RF5** | Contatto con un fantasma: si perde una vita. Il contatto conta anche se i due si incrociano a metà di un corridoio. | Due personaggi che vanno l'uno contro l'altro si toccano sempre (niente "scambio di posto"). | `verifica.js` |
| **RF6** | 4 sfere di potenziamento negli angoli. Per qualche secondo i fantasmi diventano blu, scappano e si possono mangiare. Negli ultimi 2 s lampeggiano. | Prendere la sfera spaventa tutti i fantasmi. Toccarli dà +200 senza perdere vite. Finito il potere tornano pericolosi. | `verifica.js` |
| **RF7** | Progressione: finito il cibo si passa al livello dopo, conservando punti e vite. A ogni livello i fantasmi sono più veloci ed escono prima, e il potere dura meno (sempre sopra i minimi). | Velocità crescente fino a 3,2 celle/s. Ritardi mai sotto 1 s. Potere mai sotto 3 s. | `verifica.js` |
| **RF8** | Livelli speciali **4 e 8**: hanno **solo** un tempo limite (150 s e 140 s). Se il tempo scade si perde una vita e il tempo riparte. Negli ultimi 10 s si sente un "tic" ogni secondo. | Solo i livelli 4 e 8 sono speciali. Il secondo è più difficile del primo. | `verifica.js` |
| **RF9** | Record: il punteggio migliore resta salvato nel browser (localStorage). Conta solo se la partita è partita dal livello 1 e senza modalità prova. | Il record viene letto all'avvio e aggiornato solo se il punteggio è più alto. Resta dopo il ricaricamento. Il gioco funziona anche se il browser non può salvare. | `verifica.js` |
| **RF10** | Stati della partita: **menu → pronto → gioco → vittoria / sconfitta**. Si parte con 3 vite. INVIO (o spazio) avvia o riavvia; dal menu i tasti 1–8 scelgono il livello. | Senza vite si va in sconfitta e INVIO fa ripartire con 3 vite. Durante la partita i tasti 1–8 non fanno nulla. | `verifica.js` |
| **RF11** | Il Trono (livello 8, Approdo del Re): il Trono sta al centro di una piazza ed è chiuso finché c'è cibo. Finito il cibo si apre, i fantasmi si disperdono per 7 s e raggiungerlo significa vincere. | Con il cibo ancora presente, salire sul Trono non fa vincere. Con il Trono aperto sì. Il cavaliere parte in basso al centro. | `verifica.js` |
| **RF12** | 8 livelli = 7 regni + il Trono, ognuno con un labirinto diverso e una palette ispirata alla sua casata. | Ci sono 8 regni e 8 labirinti tutti diversi. Solo l'ultimo ha il Trono. | `verifica.js` |
| **RF13** | Ogni regno ha la sua musica, generata dal browser, con un tono grave e cupo. Gli effetti sopra la musica sono pochi e la abbassano mentre suonano. Il tasto M spegne e riaccende l'audio. | 8 musiche distinte (scala, tempo, strumento). Note nella scala giusta. Effetti di cibo e caccia spenti. Con l'audio spento nessun effetto. | `verifica.js` (dati musicali); manuale (ascolto) |

### La vista 3D e gli aiuti

| ID | Requisito | Criterio di accettazione | Verifica |
|---|---|---|---|
| **RF14** | Vista 3D in **terza persona**: la camera sta dietro e sopra il cavaliere, guarda un po' avanti e ruota dolcemente quando lui gira. Il tasto V passa dalla 3D alla 2D e viceversa. | La camera sta dietro al personaggio in tutte e 4 le direzioni, sempre sopra il pavimento. Ruota nel verso più breve. | `verifica.js` (geometria); manuale (aspetto) |
| **RF15** | Nella vista 3D i fantasmi vanno al **75%** della velocità, perché si vede meno della mappa. In 2D la velocità resta normale. | 2,40 → 1,80 celle/s nel livello 1. | `verifica.js` |
| **RF16** | Aiuti all'orientamento: in basso al centro la **guida con tre frecce** (sinistra / avanti / destra), accese se c'è una strada e arancioni se la svolta è prenotata. In basso a destra una **minimappa tonda** che ruota con la camera; in alto a destra la **mappa intera** ferma (il tasto N la mostra o la nasconde). | Le frecce corrispondono sempre alle strade vere della cella. | `verifica.js` (frecce, 4424 casi); manuale (minimappe) |
| **RF17** | Personaggi 3D: il giocatore è un **cavaliere** che cammina (braccia e gambe). I fantasmi sono **scheletro, pipistrello, slime**, con il **drago** al posto dello scheletro nel livello 8. Il giocatore si distingue sempre: verde brillante, anello bianco, cristallo verde sopra la testa. | Modelli completi: triangoli interi, un colore per ogni vertice, nessun numero non valido. Il cavaliere ha le 5 parti. | `verifica.js`; `tools/prova_vista_three.js` |
| **RF18** | Comandi **relativi** in 3D: Su = avanti, Sinistra/Destra = gira al prossimo incrocio, Giù = inverte. Una svolta prenotata che non trova strada **scade dopo 1 s**. | Dopo 1 s senza strada libera la prenotazione sparisce: il personaggio non gira da solo molto più avanti. | `verifica.js relativi` |
| **RF19** | Atmosfera per regno (solo vista Three.js): texture dei muri, nebbia, luci, particelle (neve, pioggia, braci...), torce sui muri, decorazioni speciali (Roccia, Altopiano, Dorne, Trono), lampi nella Tempesta. | Ogni regno ha la sua scheda completa. Le torce stanno solo su muri che danno su un corridoio. | `verifica.js`; manuale |
| **RF20** | **Modalità prova** (tasto P): il giocatore è invincibile e il tempo limite è fermo. Il tasto E apre il Trono o fa passare al livello dopo. Il record non conta. | Con la prova il contatto non toglie vite, il tempo resta fermo, E apre il Trono e il record non viene salvato. Senza la prova il contatto toglie una vita. | `verifica.js` |

---

## 1.2 Requisiti non funzionali

| ID | Requisito | Misura / criterio | Verifica |
|---|---|---|---|
| **RNF1** | **Fluidità:** almeno **55 FPS** nella vista 3D. | FPS scritti in console una volta al secondo (`MISURA_FPS`). | Manuale con browser vero: *da misurare in tutti i livelli* |
| **RNF2** | **Velocità indipendente dai frame:** il movimento si basa sul tempo (celle al secondo), non sul numero di fotogrammi. Se un fotogramma dura troppo, il tempo viene limitato a 0,05 s. | Dopo 2 s la posizione è la stessa a 120, 60 e 20 FPS. | `verifica.js` |
| **RNF3** | **Avvio semplice:** si apre con un doppio clic su `index.html`, senza installare niente e senza server. Le librerie arrivano da internet (CDN). | Funziona su un browser moderno con la connessione attiva. | Manuale |
| **RNF4** | **Nessun "numero magico":** tutte le costanti hanno un nome e stanno in `costanti.js`. Il cibo viene contato dal labirinto, non scritto a mano. | Revisione del codice; la prova sul cibo contato. | `verifica.js`; revisione |
| **RNF5** | **Robustezza:** se qualcosa non funziona il gioco non si blocca. Catena di ripiego Three.js → 3D p5 → 2D. Il record funziona anche se il browser non può salvare. Gli eventi non letti non crescono all'infinito. | Simulazione casuale di 5 minuti senza errori. Le prove delle viste non danno errori. | `verifica.js`; `tools/prova_vista_*.js` |
| **RNF6** | **Licenze:** solo materiali originali o gratuiti (CC0, MIT, LGPL), con i crediti documentati. Niente immagini, musiche o volti protetti della serie. | Tabella dei crediti completa (`05_crediti.md`). | Revisione |
| **RNF7** | **Comprensibilità:** nomi, commenti e testi in italiano, codice semplice e senza trucchi. Ogni file ha un compito solo. | Ogni file inizia con un commento che spiega cosa fa. | Revisione |
| **RNF8** | **Logica separata dal disegno:** la logica non usa p5 e non disegna. Le viste e l'audio leggono lo stato e non lo cambiano mai. | `verifica.js` fa girare tutta la logica in Node, senza browser. | `verifica.js` (esiste e funziona) |

---

## 1.3 Collegamento con i 15 problemi del progetto originale

Nella fase 1 (analisi del Pac-Man originale in Processing) sono stati trovati 15 problemi. Molti requisiti nascono da lì: per esempio RNF2 (velocità legata ai frame), RNF4 (numeri sparsi nel codice), RF2 (vicoli ciechi), RF5 (contatti mancati) e RNF8 (logica mescolata al disegno).

> **Da completare:** qui serve l'elenco dei 15 problemi della fase 1, che non è nel repository. Aggiungi una colonna "problema originale → requisito che lo risolve".
