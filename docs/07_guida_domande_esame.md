# 7. Guida alle domande d'esame — Pac-Man del Nord

Questa guida serve per prepararti all'orale. Contiene:
- le domande probabili con una risposta breve, da dire con parole tue;
- la **mappa delle funzioni della vista 3D** (`vista_three.js` e i file che usa);
- un piccolo glossario.

Consiglio: per ogni risposta, apri il file indicato e guarda la funzione mentre ripeti.

---

## Parte A — Domande sul metodo

**1. Che cos'è il modello Waterfall e come l'hai applicato?**
È un modello "a cascata": 5 fasi in ordine, e ognuna parte dal risultato della precedente.
1. Requisiti: RF1–RF20 e RNF1–RNF8.
2. Progettazione: file, stati, livelli.
3. Implementazione: il codice.
4. Verifica: `verifica.js` e le prove manuali.
5. Manutenzione: miglioramenti e correzioni.

**2. Differenza tra requisito funzionale e non funzionale?**
Il funzionale dice *cosa fa* il gioco (es. RF4: 3 fantasmi diversi). Il non funzionale dice *come deve essere* (es. RNF1: almeno 55 FPS; RNF8: logica separata dal disegno).

**3. Perché tre versioni?**
Per confrontare: l'originale, l'AI usata senza metodo (un solo prompt) e l'AI usata con un metodo. Il confronto è nel file xlsx.

**4. Che ruolo hai avuto tu e che ruolo l'AI?**
Io ho deciso i requisiti, provato il gioco e giudicato l'aspetto e l'audio. L'AI ha scritto il codice e le prove. L'AI non vede lo schermo: ogni scelta visiva è passata da me.

**5. Come sai che il gioco funziona?**
`node verifica.js` esegue 137 prove automatiche, ognuna collegata a un requisito; tutte superate. Poi ci sono le prove delle viste e le prove manuali. Cosa manca: gli FPS con la scena completa.

---

## Parte B — Domande sull'architettura e sulla logica

**6. Cosa vuol dire "logica separata dal disegno" (RNF8)? Perché è utile?**
I file della logica (`gioco.js`, `entita.js`, `giocatore.js`, `fantasma.js`, `labirinto.js`, `livelli.js`) non usano p5 e non disegnano. Le viste leggono lo stato ma non lo cambiano.

È utile per due motivi:
- si può provare la logica con Node, senza browser;
- si può cambiare vista (2D o 3D) senza toccare le regole.

**7. Cosa succede a ogni fotogramma?** (`sketch.js`, funzione `draw`)
1. `gioco.aggiorna(dt)` muove tutto e controlla i contatti.
2. `disegnaScena()` disegna la 3D (o la 2D) e la barra.
3. `aggiornaSuoni()` legge gli eventi e fa suonare.

**8. Come fa il gioco ad andare alla stessa velocità su ogni computer (RNF2)?**
Le velocità sono in **celle al secondo**. A ogni fotogramma ci si muove di `velocità × dt`, dove `dt` è il tempo passato dal fotogramma prima (`Entita.aggiorna`). Se il computer è lento, `dt` è più grande e il passo è più lungo. Se un fotogramma dura troppo, `dt` viene limitato a 0,05 s.

**9. Come si muove un personaggio tra le celle?** (`entita.js`)
Ha una cella attuale (`col`, `row`), una cella successiva (`prossima`) e un avanzamento `prog` da 0 a 1. Quando `prog` arriva a 1 il personaggio è nella nuova cella e sceglie la direzione dopo (`scegliDirezione`). Ognuna delle due classi figlie la decide a modo suo.

**10. Come funzionano i tre fantasmi?** (`fantasma.js`)
- **Insegue:** va verso la cella del giocatore, con il percorso più breve.
- **Anticipa:** mira a 4 celle davanti al giocatore.
- **Casuale:** sceglie a caso a ogni incrocio.

Nessuno torna indietro, se può evitarlo. Il percorso più breve si calcola con una **BFS** (`Labirinto.distanze`).

**11. Cos'è la BFS?**
Ricerca in ampiezza. Parte da una cella e numera le vicine con 1, le loro vicine con 2, e così via, usando una coda. Così ogni cella sa a quanti passi si trova. Il fantasma prende la strada con il numero più piccolo.

**12. Dispersione e caccia?**
I fantasmi alternano 7 s di dispersione (ognuno va al suo angolo) e 20 s di caccia. È come nel Pac-Man classico: dà dei momenti di respiro. Con il potenziamento sono "spaventati": scappano verso la cella più lontana dal giocatore e vanno al 60% della velocità.

**13. Come si controlla il contatto (RF5)?**
`Gioco.controllaContatti` misura la distanza vera, con i decimali, tra il giocatore e ogni fantasma. Se è sotto 0,6 celle c'è contatto. Usando i decimali, due personaggi che si incrociano a metà corridoio si toccano comunque.

**14. Quali sono gli stati del gioco?**
menu → pronto → gioco → vittoria / sconfitta. "Pronto" è una pausa breve: 2,5 s a inizio livello, 1,5 s dopo una vita persa. Vedi il diagramma in `02_progettazione.md`.

**15. Come cresce la difficoltà?** (`livelli.js`, `parametriLivello`)
A ogni livello i fantasmi vanno 0,1 celle/s più veloci (fino a 3,2), escono 0,5 s prima (minimo 1 s) e il potere dura 1 s in meno (minimo 3 s). Nei livelli 4 e 8 c'è anche il tempo limite.

**16. Come funziona il record (RF9)?**
Si salva nel `localStorage` del browser con la chiave `pacman_del_nord_record`. Conta solo se si parte dal livello 1 e senza modalità prova. Il codice è dentro un `try/catch`: se il browser non può salvare, il gioco va avanti lo stesso.

**17. Come parla la logica con l'audio?**
Con una lista di **eventi** (`gioco.eventi`), per esempio `'vitaPersa'`. Lo sketch la svuota e chiama `suoni.effetto(nome)`. La logica non sa nulla dell'audio.

**18. Come è fatta la musica?**
È generata dal browser con la Web Audio API: oscillatori, filtri e rumore, nessun file audio. Ogni regno ha la sua scheda in `MUSICHE`: nota di base, scala (minore, dorica, frigia...), tempo, strumento, melodia. Le note diventano frequenze con `frequenza(n) = 440 × 2^((n − 69) / 12)`.

---

## Parte C — Mappa delle funzioni della vista 3D

### C.1 Quadro generale
```
sketch.js  creaVista3D()  ──►  new VistaThree(larghezza, altezza)      (se fallisce: Vista3D di p5, poi 2D)
sketch.js  disegnaScena() ──►  vista3d.disegna(gioco, dt)  ──►  vista3d.mostra(0, ALTEZZA_HUD)
                                     │
                                     ├─ costruisci(g)        solo quando cambia il livello
                                     │     ├─ creaTexturaMuro()   (ambiente.js)
                                     │     ├─ creaTrono()          (solo livello 8)
                                     │     ├─ decora()             (Roccia, Dorne, Trono)
                                     │     ├─ posizioniTorce()     (ambiente.js)
                                     │     └─ new Particelle()     (ambiente.js)
                                     ├─ creaFantasma(f) × 3   solo quando cambiano i fantasmi
                                     │     └─ creaMesh(nome)  ◄── MODELLI (modelli.js)
                                     ├─ aggiornaAngolo()      camera che ruota
                                     ├─ gira() / camminata()  personaggi
                                     ├─ particelle.aggiorna()
                                     └─ renderer.render(scena, camera)
```
**Idea chiave:** le cose che non cambiano durante un livello (muri, pavimento, decorazioni) si costruiscono **una volta sola** in `costruisci`. A ogni fotogramma `disegna` sposta soltanto quello che si muove. Così il gioco resta veloce.

### C.2 `vista_three.js`, funzione per funzione

| Riga | Funzione | Quando viene chiamata | Cosa fa | Concetti da saper spiegare |
|---|---|---|---|---|
| 14 | `CONFIGURAZIONE_MODELLI` (costante) | — | per ogni modello: dove "guarda" (`fronte`), altezza, larghezza, quota da terra, se vola o è gelatina | i modelli hanno misure diverse e vanno adattati ai corridoi larghi 1 |
| 23 | `modelloPerFantasma(comportamento, tema)` | in `creaFantasma` | insegue → scheletro (drago nel Trono), anticipa → pipistrello, casuale → slime | — |
| 30 | `constructor` | una volta all'avvio | crea il **renderer** WebGL, la **scena**, la **camera** prospettica (60°), le luci (cielo, sole, lanterna, 2 luci per le torce) e il giocatore. Se Three.js non c'è, lancia un errore e scatta il ripiego | renderer, scena, camera, luci |
| 60 | `static colore(c, fattore)` | ovunque | converte un colore `[r, g, b]` da 0–255 in `THREE.Color` (0–1) | — |
| 65 | `costruisci(g)` | quando cambia il livello | elimina la scena vecchia (`dispose`, per liberare memoria). Crea muri, cime, fregi, piastrelle e pavimento con **InstancedMesh**, poi cibo, potenziamenti, Trono, decorazioni e torce. Imposta nebbia, luci e particelle dalla scheda `AMBIENTI` | **InstancedMesh**: un solo oggetto disegna centinaia di cubi uguali in posizioni diverse = molto più veloce |
| 141 | `decora(gruppo, lab, amb)` | in `costruisci` | decorazioni per regno: `'leone'` (stendardi con disco d'oro, Roccia), `'deserto'` (giare, palme, cactus, Dorne), `'castello'` (muri alti, colonne, finestre, stendardi, tappeto, Trono) | si usano forme semplici (cubi, cilindri, sfere); numeri casuali "a seme" = sempre uguali |
| 220 | `creaTrono(t)` | in `costruisci` (livello 8) | pedana, seduta, schienale, braccioli e 5 spade, tutti con lo stesso materiale | un solo materiale, così basta cambiare colore per farlo diventare d'oro |
| 239 | `creaMesh(nome)` | per giocatore e fantasmi | dai numeri di `MODELLI` crea una **BufferGeometry** (posizioni + colori per vertice). Se il modello è diviso in parti (il cavaliere), ogni parte ruota attorno al suo perno (spalla, anca). Scala il modello per farlo entrare nel corridoio | vertici, triangoli, colori per vertice, `computeVertexNormals` (serve alle luci) |
| 273 | `creaGiocatore()` | nel costruttore | cavaliere + disco bianco + anello verde + cristallo verde sopra la testa. Se manca il modello, disegna un "viandante" con forme semplici (ripiego) | gruppo `gruppo` (posizione) e gruppo `interno` (rotazione): si separano spostamento e rotazione |
| 309 | `creaFantasma(f, tema)` | quando cambia l'elenco dei fantasmi | modello del mostro + anello colorato ai piedi (colore del regno, uguale alla mappa 2D) | — |
| 323 | `aggiornaAngolo(g, dt)` | ogni fotogramma | la camera ruota verso la direzione del giocatore di una frazione `dt × VELOCITA_ROTAZIONE`, nel verso più breve (`Vista3D.differenzaAngoli`). Fuori dallo stato `gioco` si allinea di colpo | **interpolazione**: ci si avvicina un po' alla volta, così il movimento è morbido |
| 330 | `camminata(o, inMovimento, dt)` | ogni fotogramma (giocatore) | braccia e gambe oscillano con un **seno**, in opposizione (gamba destra avanti = braccio destro indietro), più un piccolo rimbalzo. L'ampiezza va a 0 quando il cavaliere è fermo | `Math.sin(fase)`: valore che va su e giù in modo regolare |
| 343 | `gira(o, dir, dt, subito)` | ogni fotogramma (tutti) | gira il personaggio verso la direzione di marcia, dolcemente; tiene conto di dove "guarda" il modello (`fronte`) | — |
| 349 | `disegna(g, dt)` | **ogni fotogramma** | 1) ricostruisce se è cambiato il livello; 2) camera **dietro e sopra** il giocatore (`DISTANZA_CAMERA` 2,8, `ALTEZZA_CAMERA` 2,2) che guarda 1,6 celle avanti; 3) giocatore, cristallo che gira, lanterna; 4) fantasmi: posizione, colore (blu se spaventati, bianco lampeggiante alla fine), ondeggiamento; 5) cibo rimasto (aggiorna le istanze); 6) particelle, torce che tremolano, le 2 luci sulle torce più vicine, lampi; 7) Trono grigio o dorato pulsante; 8) `render` | legge `g` ma **non lo cambia mai** (RNF8) |
| 440 | `mostra(x, y)` | ogni fotogramma, dopo `disegna` | copia l'immagine di Three.js nella finestra di p5, sotto la barra | due librerie insieme: Three.js disegna, p5 incolla |

### C.3 Funzioni di altri file usate dalla vista 3D

| File : riga | Funzione | Cosa fa |
|---|---|---|
| `vista3d.js:19` | `Vista3D.angoloDirezione(dir)` | trasforma una direzione del gioco (0 su, 1 destra, 2 giù, 3 sinistra) in un angolo, con `atan2` |
| `vista3d.js:25` | `Vista3D.differenzaAngoli(da, a)` | differenza tra due angoli, sempre tra −π e +π: la camera gira dalla parte più corta |
| `vista3d.js:44` | `Vista3D.posizioneCamera(px, pz, angolo)` | calcola dove sta la camera e dove guarda (versione separata, usata nelle prove RF14) |
| `ambiente.js:16` | `AMBIENTI` | la "scheda" di ogni regno: nebbia, luci, texture, particelle, decorazioni, torce, lampi |
| `ambiente.js:43` | `casualeConSeme(seme)` | numeri casuali ripetibili: stessa texture a ogni avvio |
| `ambiente.js:55` | `creaTexturaMuro(tipo, base, luminosita, seme)` | disegna su un canvas la texture (pietra, marmo, roccia, siepe, sabbia, scacchi, ghiaia...) e la trasforma in texture di Three.js |
| `ambiente.js:137` | `class Particelle` | neve, pioggia, braci... in una "scatola" di 14 × 6 × 14 celle che segue il giocatore; quando una particella esce da un lato, rientra dall'altro |
| `ambiente.js:184` | `posizioniTorce(lab, ogniQuanti, sale)` | sceglie, in modo ripetibile, alcuni muri che danno su un corridoio (usato anche per stendardi e giare) |
| `vista2d.js` | `minimappa`, `minimappaIntera`, `guidaSvolte`, `disegnaBarraEMessaggi`, `schermate` | disegnate da p5 **sopra** la scena 3D |

### C.4 Domande probabili sulla vista 3D

**19. Perché Three.js e non solo p5?**
Three.js ha luci più realistiche, nebbia, materiali e InstancedMesh, ed è più veloce con tanti oggetti. La vista p5 resta come ripiego (catena Three.js → p5 → 2D).

**20. Come funziona la camera in terza persona?**
Sta `DISTANZA_CAMERA` celle **dietro** al giocatore (nella direzione opposta a dove guarda) e `ALTEZZA_CAMERA` celle in alto. Punta 1,6 celle davanti a lui. L'angolo segue la direzione con un'interpolazione morbida.

**21. Perché i comandi relativi in 3D?**
La camera ruota insieme al personaggio, quindi "su" sullo schermo vuol dire sempre "avanti". Con le frecce assolute sinistra e destra si invertirebbero quando si va verso il basso.

**22. Come fai a non disegnare tutto da capo a ogni fotogramma?**
`costruisci` crea i muri **una volta per livello**, con InstancedMesh. `disegna` aggiorna solo le posizioni dei personaggi, il cibo, le particelle e le luci.

**23. Come fa il cavaliere a camminare?**
Il modello è diviso in 5 parti (corpo, 2 braccia, 2 gambe), ognuna con un perno. A ogni fotogramma gambe e braccia ruotano di `sin(fase) × ampiezza`, in opposizione. La fase avanza solo quando il cavaliere si muove.

**24. Come si distingue il giocatore dai fantasmi?**
Ha un verde brillante `[38, 255, 38]`, scelto misurando la distanza dai colori di tutti i temi. In più ha un disco bianco ai piedi e un cristallo verde che gira sopra la testa: si vede anche da dietro.

**25. Da dove vengono i modelli 3D?**
Dai pacchetti Quaternius (CC0, pubblico dominio). `tools/bake.py` legge i file OBJ+MTL e scrive in `modelli.js` solo numeri: posizioni dei vertici e colori. Non ci sono immagini.

**26. Perché in 3D i fantasmi vanno più piano?**
In 3D si vede solo davanti, non tutta la mappa: sarebbe troppo difficile. `FATTORE_FANTASMI_3D = 0,75`, provato in RF15.

**27. Come fai a provare la vista 3D se non si vede?**
`tools/prova_vista_three.js` usa un Three.js "finto" che registra le chiamate. Controlla che non ci siano errori né numeri non validi (NaN) in tutti gli 8 livelli. L'aspetto vero l'ho controllato io con screenshot e video.

**28. Gli FPS?**
L'obiettivo è ≥ 55 (RNF1). Nel livello 1 senza atmosfera sono circa 60. *(Aggiorna con la tabella di `03_relazione_verifica.md` quando hai misurato tutti i livelli.)* Se servisse, si possono ridurre le particelle o le torce nella scheda `AMBIENTI` del livello.

---

## Parte D — Glossario veloce

| Parola | Significato semplice |
|---|---|
| **Scena** (Three.js) | il "contenitore" di tutto quello che c'è nel mondo 3D |
| **Camera** | il punto da cui si guarda la scena |
| **Renderer** | chi trasforma la scena in un'immagine sullo schermo |
| **Mesh** | un oggetto 3D = forma (geometria) + aspetto (materiale) |
| **InstancedMesh** | la stessa forma disegnata molte volte in un colpo solo |
| **Texture** | un'immagine "incollata" sopra una forma |
| **Nebbia (fog)** | gli oggetti lontani sfumano nel colore di sfondo |
| **dt** | il tempo passato dall'ultimo fotogramma, in secondi |
| **FPS** | fotogrammi al secondo: più sono, più il gioco è fluido |
| **BFS** | ricerca in ampiezza: trova le distanze più brevi in un labirinto |
| **Ereditarietà** | `Giocatore` e `Fantasma` "ereditano" il movimento da `Entita` |
| **CDN** | un server su internet da cui il browser scarica le librerie |
| **CC0** | licenza "pubblico dominio": si può usare tutto liberamente |
| **localStorage** | piccolo archivio del browser che resta anche dopo la chiusura |
