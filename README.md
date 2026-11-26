# Pac-Man del Nord

Progetto d'esame del corso *Tecnologie Avanzate e Intelligenza Artificiale* (LUMSA) — autrice: Alessia Orlandi.

Un Pac-Man a tema Game of Thrones in **7 regni + il Trono** (8 livelli), con vista 3D in terza persona, fantasmi con comportamenti diversi, musica generata dal browser e record salvato.

Il progetto confronta **tre modi** di costruire la stessa esperienza digitale:

1. **Il gioco originale** scritto in Processing (analizzato: 15 problemi trovati e misurati);
2. **Un solo prompt** a un'AI (Claude, Gemini, ChatGPT; prompt semplice e prompt dettagliato);
3. **Questa versione**, sviluppata con l'AI seguendo le 5 fasi Waterfall (requisiti, progettazione, implementazione, verifica, manutenzione).

## Risultati in sintesi

**Tesi:** con un metodo chiaro (le 5 fasi Waterfall) l'AI non sostituisce chi progetta ma le dà controllo: il risultato è più solido di quello ottenuto con un solo prompt, e il codice resta spiegabile.

| | Originale (Processing) | Un solo prompt (6 prove) | Questa versione |
|---|---|---|---|
| Fantasmi | 1, movimento casuale | da 1 a 4, spesso tutti uguali | 3 con comportamenti diversi |
| Livelli | 1 | 1 (solo Claude semplice ne ha più) | 8 (7 regni + Trono) |
| FPS | circa 21 | non misurati | 56–64 (livelli 1 e 8) |
| Avvio | 5–6 secondi | Gemini dettagliato non parte | parte subito |
| Verifica | nessuna | nessuna | 142 prove automatiche |

- **Fase 1, requisiti:** RF1–RF25 (funzionali) e RNF1–RNF8 (non funzionali), nati dai 15 problemi trovati nell'originale.
- **Fase 2, progettazione:** logica separata dal disegno (RNF8), macchina a stati, tabella degli 8 livelli.
- **Fase 3, implementazione:** sviluppo con l'AI a piccoli passi; io provo e decido.
- **Fase 4, verifica:** `verifica.js` collega ogni prova a un requisito; FPS misurati con le librerie vere.
- **Fase 5, manutenzione:** correzioni e funzioni aggiunte dopo le mie prove (pausa, riavvio, fantasmi uniformi).
- **Limiti noti:** requisito RF7 solo parziale (3 fantasmi invece di 4); FPS misurati solo nei livelli 1 e 8; avvio osservato ma non cronometrato.

Spiegazioni complete con screenshot: [`docs/Spiegazioni_Pac-Man_del_Nord.pdf`](docs/Spiegazioni_Pac-Man_del_Nord.pdf).

## Come giocare

**Online (nessuna installazione):** https://alessiaorlandi3.github.io/pacman_del_nord/

**In locale:** scarica il repository (pulsante verde *Code → Download ZIP*), decomprimi e apri `index.html` con doppio clic. Serve una connessione a internet (le librerie p5.js e Three.js e i font vengono caricati dalla rete). Consigliato Chrome o Safari.

| Tasto | Azione |
|---|---|
| Frecce | Su = avanti, Sinistra/Destra = girano, Giù = inverti marcia |
| INVIO | avvia / conferma |
| 1–8 (dal menu) | scegli il livello |
| SPAZIO | pausa (da lì **R** ricomincia la partita) |
| V | cambia vista 3D / 2D |
| N | mostra/nasconde la mappa intera |
| M | audio on/off |
| I | impostazioni |
| P | modalità prova (invincibile, tempo fermo) |

## Cosa c'è nella cartella

| Cosa | Dove |
|---|---|
| Gioco (logica, viste, audio) | file `.js` e `index.html` nella cartella principale |
| Prove automatiche (142 prove, una per requisito) | `verifica.js` — si lanciano con `node verifica.js` e `node verifica.js relativi` |
| Strumenti di prova e di conversione modelli | `tools/` |
| Confronto tra le tre versioni | `confronto/` (codice Processing originale, i 5 giochi "single prompt", screenshot, tabella Excel) |
| Relazione e spiegazioni (PDF) | [`docs/Spiegazioni_Pac-Man_del_Nord.pdf`](docs/Spiegazioni_Pac-Man_del_Nord.pdf) |
| Crediti e licenze di modelli, librerie, font | `CREDITI.md` |

### Architettura in breve

La **logica** (`costanti`, `labirinti`, `labirinto`, `livelli`, `entita`, `giocatore`, `fantasma`, `gioco`) non disegna nulla ed è provata da `verifica.js`. Il **disegno** (`vista2d`, `vista_three`, `vista3d`, `ambiente`) e l'**audio** (`suoni`) leggono lo stato del gioco senza modificarlo. `sketch.js` collega tutto a p5.js. Se la vista Three.js dà errore, il gioco ripiega sulla vista 3D di p5 e poi sulla 2D.

## Crediti

Personaggi 3D: pacchetti Quaternius (CC0). Suoni, musica, texture e labirinti sono generati dal codice. Nessuna immagine, musica o volto protetto della serie. Dettagli in [`CREDITI.md`](CREDITI.md).
