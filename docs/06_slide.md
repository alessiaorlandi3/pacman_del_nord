# 6. Bozza delle slide — Pac-Man del Nord

Sono **10 slide**, prima e ultima comprese, per circa 10–12 minuti. Ogni slide ha:
- il **contenuto** da mettere sulla slide (poche parole, grandi);
- **cosa dire** a voce;
- **cosa mostrare** (immagine, video o tabella).

Gli screenshot e i video li devi fare tu dal gioco vero: usa la modalità prova (P) e i tasti 1–8 per arrivare subito a ogni livello.

---

## Slide 1 — Titolo
**Sulla slide:**
- **Pac-Man del Nord**
- Tre modi di costruire un'esperienza digitale: originale, un prompt, Waterfall con l'AI
- Nome, corso "Tecnologie avanzate per l'innovazione e l'esperienza", LUMSA, a.a. 2026/27

**Mostrare:** screenshot della vista 3D nel livello 8 (la sala del Trono).

**Dire:** «Ho preso un vecchio Pac-Man in Processing a tema Game of Thrones e l'ho rifatto in due modi con l'AI, per confrontarli.»

---

## Slide 2 — Il punto di partenza
**Sulla slide:**
- Pac-Man originale in Processing
- **15 problemi** trovati, per esempio: velocità legata ai frame, numeri sparsi nel codice, vicoli ciechi, logica mescolata al disegno *(scegli i 3–4 più evidenti)*
- Misure di partenza

**Mostrare:** screenshot dell'originale.

**Dire:** perché questi problemi contano per chi gioca e per chi deve modificare il codice.

---

## Slide 3 — Le tre versioni a confronto
**Sulla slide:** una tabella.

| | Originale | Un solo prompt | Waterfall con l'AI |
|---|---|---|---|
| Come è nato | a mano | 1 richiesta all'AI | 5 fasi, molte sessioni |
| Requisiti scritti | no | no | 20 RF + 8 RNF |
| Prove automatiche | no | no | 137 |
| Vista | 2D | *(dal confronto xlsx)* | 3D + 2D |

**Dire:** l'idea della tesi: con un metodo l'AI rende di più.

---

## Slide 4 — Fase 1: requisiti
**Sulla slide:**
- **20 requisiti funzionali**, per esempio: 3 fantasmi diversi, 8 regni, Trono finale, vista 3D, modalità prova
- **8 non funzionali**, per esempio: ≥ 55 FPS, velocità indipendente dai frame, logica separata dal disegno, solo licenze libere
- Ogni requisito ha un criterio per verificarlo

**Mostrare:** un pezzo della tabella di `01_requisiti.md`.

---

## Slide 5 — Fase 2: progettazione
**Sulla slide:**
- Schema a tre strati: **logica** (non disegna) → **colla** (`sketch.js`) → **presentazione** (viste e audio, che leggono soltanto)
- Macchina a stati: menu → pronto → gioco → vittoria / sconfitta
- Catena di ripiego: Three.js → 3D p5 → 2D

**Mostrare:** il disegno dell'architettura e il diagramma degli stati (da `02_progettazione.md`).

**Dire:** «Grazie a questa separazione posso provare tutte le regole senza aprire il browser.»

---

## Slide 6 — Fase 3: implementazione, il gioco
**Sulla slide:**
- 8 livelli: 7 regni + il Trono, ognuno con la sua palette, atmosfera e musica
- Fantasmi: insegue / anticipa / casuale, con fasi di dispersione e caccia
- Livelli 4 e 8 con il tempo limite; nel livello 8 il Trono si apre quando il cibo è finito

**Mostrare:** una griglia di 4 screenshot (Nord con la neve, Roccia con gli stendardi, Dorne con le palme, Trono).

---

## Slide 7 — Fase 3: implementazione, la vista 3D
**Sulla slide:**
- Terza persona, comandi relativi (Su avanti, Sinistra/Destra girano)
- Aiuti: tre frecce, minimappa che ruota, mappa ferma
- Personaggi CC0 (Quaternius): il cavaliere verde cammina; scheletro, pipistrello, slime, drago
- Audio generato dal codice, grave e cupo

**Mostrare:** un **video di 15–20 secondi** di gioco nel livello 1.

**Dire:** il giocatore si distingue sempre (verde + anello bianco + cristallo). In 3D i fantasmi vanno al 75%.

---

## Slide 8 — Fase 4: verifica
**Sulla slide:**
- `node verifica.js` → **137/137 prove superate** (136/136 con i comandi relativi)
- Ogni prova è collegata a un requisito (per esempio la guida alle svolte è controllata su 4424 casi)
- Prove delle viste con una libreria finta: 0 errori
- FPS: ~60 nel livello 1 *(aggiorna con le misure di tutti i livelli)*

**Mostrare:** screenshot del terminale con "Tutte le prove superate.".

---

## Slide 9 — Lavorare con l'AI: cosa ho imparato
**Sulla slide:**
- **L'AI scrive il codice, io dirigo e giudico**
- L'AI non vede né sente: aspetto e audio li ho decisi io (per esempio: dune tolte, musica cupa, effetti ridotti)
- Il metodo (requisiti → prove) evita gli errori della versione "un prompt"
- Limiti: la vista 3D vera l'ho vista solo io; gli FPS vanno misurati

**Dire:** un esempio concreto di una correzione chiesta da te (prendilo da `04_diario_lavoro_ai.md`).

---

## Slide 10 — Conclusioni e sviluppi
**Sulla slide:**
- Il Waterfall con l'AI dà un gioco più ricco **e** più affidabile
- Fase 5, manutenzione: nuovi regni "particolari", mostri che camminano, ottimizzazione degli FPS
- Grazie! — Domande?

**Mostrare:** lo screenshot della vittoria sul Trono.
