# 3. Relazione di verifica — Pac-Man del Nord

Quarta fase del modello Waterfall: controllare che il programma rispetti i requisiti della fase 1.

**Data della verifica:** 11 novembre 2026 · **Ambiente:** Node.js v22 (Linux) · **Versione del codice:** commit `570363c`

---

## 3.1 Come si verifica

Ci sono tre tipi di verifica.

1. **Prove automatiche della logica (`verifica.js`).**
   - Il file carica la logica del gioco in Node, senza browser, e controlla 137 casi. Si può fare perché la logica è separata dal disegno (RNF8).
   - Ogni prova scrive `OK` oppure `ERRORE`. Alla fine deve comparire *"Tutte le prove superate."*
   - Va lanciato due volte, una per ogni tipo di comandi:
     ```bash
     node verifica.js
     ```
     ```bash
     node verifica.js relativi
     ```
2. **Prove delle viste con una libreria finta (`tools/prova_vista_*.js`).**
   - Fanno girare le viste su tutti gli 8 livelli, con una versione "finta" di Three.js e di p5.
   - Controllano che non ci siano errori e che nessun numero passato alla grafica sia `NaN` o infinito.
3. **Prove manuali nel browser.**
   - La studentessa gioca e guarda lo schermo: aspetto, colori, audio, FPS.
   - Servono per quello che una prova automatica non può giudicare.

---

## 3.2 Esito delle prove automatiche

| Comando | Prove | Superate | Fallite | Esito |
|---|---|---|---|---|
| `node verifica.js` (comandi assoluti) | 137 | 137 | 0 | **Tutte le prove superate.** |
| `node verifica.js relativi` (comandi relativi) | 136 | 136 | 0 | **Tutte le prove superate.** |

I due comandi differiscono di una prova perché le prove sui comandi sono diverse:
- con i comandi assoluti ce ne sono 3 ("giù porta in basso", "svolta impossibile", "freccia opposta inverte");
- con quelli relativi ce ne sono 2 ("destra gira verso sud", "svolta impossibile").

La prova RF18 (la svolta che scade) ha senso solo con i comandi relativi. Con quelli assoluti viene segnata come *saltata*.

L'output completo è salvato in [`esito_verifica_assoluti.txt`](esito_verifica_assoluti.txt) e [`esito_verifica_relativi.txt`](esito_verifica_relativi.txt).

### Prove per requisito

| Requisito | N. prove | Cosa si controlla | Esito |
|---|---|---|---|
| RF1 movimento e cibo | 6 (5 con i relativi) | comandi; giocatore bloccato che torna indietro; cibo contato dal labirinto; simulazione casuale di 5 minuti sempre su celle libere | ✅ |
| RF2 nessun vicolo cieco | 16 | per ognuno degli 8 labirinti: nessun vicolo cieco, tutte le celle raggiungibili | ✅ |
| RF3 tunnel | 9 | bordi aperti sulle righe del tunnel (8 labirinti); si esce a sinistra e si rientra a destra | ✅ |
| RF4 tre fantasmi | 4 + 3 | "insegue" punta al giocatore, "anticipa" più avanti, i tre sono diversi, "casuale" non torna indietro; partenze ritardate; fantasma a casa innocuo; raggiunge un giocatore fermo (in 30 s) | ✅ |
| RF4 fasi | 6 | si parte dalla dispersione, poi la caccia, poi di nuovo la dispersione; angoli diversi e su celle libere in tutti i labirinti; in caccia si torna sul giocatore | ✅ |
| RF5 contatto | 1 | incrocio frontale in corridoio: contatto rilevato | ✅ |
| RF6 potenziamenti | 12 | 4 sfere in ogni labirinto; la sfera spaventa; si mangia il fantasma (+200); il potere finisce; il fantasma spaventato si allontana | ✅ |
| RF7 progressione | 4 + 1 | livello 1 = Nord; velocità crescente; minimi rispettati; passaggio al livello 2 con punti e vite; velocità mai sopra il massimo | ✅ |
| RF8 livelli speciali | 4 | solo il 4 e l'8; il secondo è più difficile; 2 tunnel e tempo limite; tempo scaduto = vita persa | ✅ |
| RF9 record | 6 | lettura, punteggio basso, punteggio alto, dopo il ricaricamento, partenza avanzata, browser che non salva | ✅ |
| RF10 stati e vite | 3 | sconfitta a 0 vite e riavvio; tasti 1–8 dal menu; tasti numerici ignorati in partita | ✅ |
| RF10/RF11 partenze | 24 | per ogni labirinto: partenze su celle libere, almeno 12 celle dai fantasmi, partenza nella direzione che si allontana | ✅ |
| RF11 Trono | 4 | cella libera e senza cibo; chiuso finché c'è cibo; si apre e i fantasmi si disperdono; raggiungerlo fa vincere | ✅ |
| RF12 8 regni | 3 | 8 livelli, labirinti tutti diversi, solo l'ultimo ha il Trono | ✅ |
| RF13 audio | 8 + 11 | 8 musiche distinte, melodie corrette, formula delle note (La4 = 440 Hz); effetti spenti o attivi; 11 eventi per i suoni; la lista eventi non cresce all'infinito | ✅ |
| RF14 camera 3D | 3 | camera dietro e sopra in ogni direzione; rotazione nel verso più breve; coordinate coerenti | ✅ |
| RF15 fantasmi in 3D | 1 | 2,40 → 1,80 celle/s (75%), invariati in 2D | ✅ |
| RF16 guida alle svolte | 1 | le frecce corrispondono alle strade vere in **4424 casi** | ✅ |
| RF17 modelli 3D | 1 | 5 modelli validi (scheletro 1810, pipistrello 1046, drago 1344, slime 1440, cavaliere 2144 triangoli) | ✅ |
| RF18 svolta che scade | 1 | dopo 1 s la svolta prenotata sparisce (solo comandi relativi) | ✅ |
| RF19 atmosfera | 1 | ogni regno ha la sua scheda; torce sui muri affacciati ai corridoi (Nord 5, Isole 11, Valle 7, Roccia 6, Altopiano 0, Tempesta 11, Dorne 0, Trono 12) | ✅ |
| RF20 modalità prova | 3 | invincibile, tempo fermo, E apre il Trono; il record non si salva; senza prova il contatto toglie una vita | ✅ |
| RNF2 tempo, non frame | 1 | stessa posizione dopo 2 s a 120, 60 e 20 FPS | ✅ |

**Totale: 137 prove** (136 con i relativi). *Nota:* il nome di ogni prova in `verifica.js` riporta solo alcuni numeri RF. La tabella raggruppa anche le prove senza numero sotto il requisito a cui si riferiscono.

---

## 3.3 Prove delle viste (libreria finta)

| Comando | Cosa fa | Esito |
|---|---|---|
| `node tools/prova_vista_three.js .` | 8 livelli × 240 fotogrammi con un Three.js finto | **OK**: 0 errori, nessun NaN, 1920 immagini incollate. Modelli giusti per livello: scheletro, pipistrello, slime; nel livello 8 il drago |
| `node tools/prova_vista_p5.js .` | la stessa prova sulla vista 3D di p5 | **OK**: 0 errori, nessun NaN |
| `node tools/prova_vista_2d.js .` | la stessa prova sulla vista 2D | **OK**: 0 errori |

Le ultime due stampano in console *"Vista Three.js non disponibile, provo la vista p5"*. **Non è un errore:** le prove tolgono apposta Three.js (e nella seconda anche la 3D di p5), così si controlla che la **catena di ripiego** funzioni (RNF5).

---

## 3.4 Prove manuali

| Cosa | Chi l'ha controllato | Esito |
|---|---|---|
| Aspetto della vista 3D (colori, proporzioni) | la studentessa, con screenshot e video | approvato nei livelli provati; le dune di Dorne sono state tolte su sua richiesta |
| Audio dei regni | la studentessa, ascoltando | livelli 1–5 e 7 approvati; 6 e 8 "più o meno bene" |
| Il giocatore si distingue dai fantasmi | la studentessa | sì (verde + anello bianco + cristallo) |
| Comandi relativi e guida alle svolte | la studentessa | approvati |
| **FPS (RNF1, obiettivo ≥ 55)** | — | **circa 60 nel livello 1 senza atmosfera.** Non ancora misurati con particelle, torce e decorazioni |

---

## 3.5 Limiti della verifica e lavoro rimasto

1. **Gli FPS con la scena completa non sono misurati (RNF1).** È la verifica più importante che manca.
   - Come si fa: aprire il gioco in Chrome, premere F12 e aprire la scheda *Console*. Il gioco scrive gli FPS una volta al secondo (`MISURA_FPS = true` in `costanti.js`).
   - Giocare 30 s per livello (con P e 1–8 si arriva subito a ogni livello) e annotare il valore più basso e quello medio.
   - Se un livello sta sotto 55: ridurre `conta` delle particelle o il numero di torce nella sua scheda di `ambiente.js`.

   | Livello | FPS medio | FPS minimo | ≥ 55? |
   |---|---|---|---|
   | 1 Nord | | | |
   | 2 Isole e Fiumi | | | |
   | 3 Valle | | | |
   | 4 Roccia | | | |
   | 5 Altopiano | | | |
   | 6 Tempesta | | | |
   | 7 Dorne | | | |
   | 8 Trono | | | |

2. **La vista Three.js è stata provata solo con una libreria finta.** Le prove dimostrano che il codice gira senza errori e con numeri validi, ma non dicono com'è fatta la scena. Il giudizio sull'aspetto viene solo dalle prove manuali.
3. **La parte grafica e l'audio sono provati solo in parte.** Le prove controllano i dati (melodie, modelli, posizioni delle torce), non il risultato che si vede o si sente.
4. **Nessuna prova su browser diversi.** È consigliato almeno un controllo veloce su Chrome, Firefox e Safari.

## 3.6 Conclusione

Tutti i requisiti funzionali sulla logica sono rispettati e provati in modo automatico: 137 prove su 137 con i comandi assoluti e 136 su 136 con quelli relativi.

Anche RNF2, RNF4, RNF5 e RNF8 sono verificati. RNF1 (FPS) resta da misurare con la scena completa; gli aspetti visivi e sonori sono stati approvati con le prove manuali.
