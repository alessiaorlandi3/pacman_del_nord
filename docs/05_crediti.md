# 5. Tabella dei crediti — Pac-Man del Nord

Requisito RNF6: si usano solo materiali **originali** o **gratuiti con licenza aperta**, con la provenienza documentata. Il riferimento ufficiale nel codice è [`CREDITI.md`](../CREDITI.md), da aggiornare se si aggiunge qualcosa.

**In sintesi:** suoni, labirinti, texture e forme sono **generati dal codice**. Le uniche cose esterne sono i modelli 3D dei personaggi (CC0) e le due librerie JavaScript. Nel progetto non c'è nessun file di immagine, font o audio esterno.

## Materiali esterni

| Elemento | Autore / fonte | Licenza | Come è usato | Modifiche |
|---|---|---|---|---|
| Cavaliere (giocatore) | Quaternius, "Lowpoly Animated Knight" — https://quaternius.itch.io/lowpoly-animated-knight | **CC0 1.0** (pubblico dominio) | modello 3D in `modelli.js` | parti unite e divise (corpo, braccia, gambe) con `tools/bake.py`; tunica ricolorata di verde; anello e cristallo aggiunti nel codice |
| Scheletro, pipistrello, drago, slime (fantasmi) | Quaternius, "Animated Monsters" — https://www.patreon.com/quaternius | **CC0 1.0** (credito facoltativo, riportato comunque) | modelli 3D in `modelli.js` | convertiti in numeri (posizioni e colori), senza texture; licenza in `LICENZA_mostri_Quaternius.txt` |
| p5.js 1.9.4 | Processing Foundation e contributori | **LGPL 2.1** | caricata dalla rete (cdnjs): finestra, 2D, minimappe, tastiera | nessuna |
| Three.js r147 | autori di Three.js | **MIT** | caricata dalla rete (jsDelivr): scena 3D | nessuna |

## Materiali originali (creati per il progetto)

| Elemento | Dove | Come è fatto |
|---|---|---|
| 8 labirinti | `labirinti.js` | generati con un programma e controllati da `verifica.js` |
| Texture dei muri e dei pavimenti (pietra, marmo, roccia, siepe, sabbia, scacchi, ghiaia) | `ambiente.js` | disegnate dal codice con numeri casuali "a seme" (sempre uguali) |
| Nebbia, neve, pioggia, braci, lucciole, torce, lampi | `ambiente.js`, `vista_three.js` | effetti di Three.js con parametri scelti per ogni regno |
| Trono di spade, muri, cibo, decorazioni (stendardi, giare, palme, cactus, colonne) | `vista_three.js` | forme geometriche semplici (cubi, cilindri, sfere) |
| Viandante (ripiego se manca il cavaliere) | `vista_three.js` | forme geometriche |
| 8 musiche ed effetti sonori | `suoni.js` | composizioni originali, sintetizzate con la Web Audio API (oscillatori, filtri, rumore) |

## Riferimenti alla serie (solo testo e colori)

| Elemento | Uso | Perché è lecito |
|---|---|---|
| Nomi dei regni e delle casate (Stark, Lannister, Targaryen...) | solo come **testo** sullo schermo | non si usano marchi, loghi o immagini |
| Colori delle casate | solo come **riferimento cromatico** per le palette | un colore non è protetto |

**Non sono usati:** immagini, musiche, volti, attori, loghi o personaggi della serie TV o dei libri.
