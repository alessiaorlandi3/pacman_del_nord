# Documentazione per l'esame — Pac-Man del Nord

Documentazione della terza versione del progetto: il gioco sviluppato con l'AI seguendo le 5 fasi del modello Waterfall.

| N. | Documento | Fase Waterfall | Contenuto |
|---|---|---|---|
| 1 | [Requisiti](01_requisiti.md) | Requisiti | RF1–RF20, RNF1–RNF8, con criterio e modo di verifica |
| 2 | [Progettazione](02_progettazione.md) | Progettazione | architettura, mappa dei file, macchina a stati, tabella dei livelli, algoritmi |
| 3 | [Relazione di verifica](03_relazione_verifica.md) | Verifica | esito di `node verifica.js` (137/137 e 136/136), prove delle viste, prove manuali, FPS |
| 4 | [Diario del lavoro con l'AI](04_diario_lavoro_ai.md) | tutte | decisioni prese, fase per fase, e chi le ha prese |
| 5 | [Tabella dei crediti](05_crediti.md) | — | provenienza e licenze di modelli, librerie e materiali originali |
| 6 | [Bozza delle slide](06_slide.md) | presentazione | 10 slide, con cosa dire e cosa mostrare |
| 7 | [Guida alle domande d'esame](07_guida_domande_esame.md) | orale | 28 domande con risposta, mappa delle funzioni della vista 3D, glossario |

File allegati: [`esito_verifica_assoluti.txt`](esito_verifica_assoluti.txt) e [`esito_verifica_relativi.txt`](esito_verifica_relativi.txt), cioè l'output completo delle prove dell'11/11/2026.

## Cosa resta da completare (lo sai solo tu)
- [ ] Controllare il testo di RF1, RF10, RF11, RNF1, RNF3, RNF5, RNF6, RNF7 con i tuoi appunti (in `01_requisiti.md`).
- [ ] Aggiungere l'elenco dei 15 problemi dell'originale e collegarli ai requisiti (`01_requisiti.md`, §1.3).
- [ ] Misurare gli FPS in tutti gli 8 livelli e riempire la tabella (`03_relazione_verifica.md`, §3.5).
- [ ] Mettere le date nel diario e scrivere le tue riflessioni (`04_diario_lavoro_ai.md`).
- [ ] Fare screenshot e video per le slide (`06_slide.md`).
- [ ] Testo breve di 4–6 pagine: si può ricavare da questi documenti quando le parti sopra sono complete.

Per aggiornare l'esito delle prove dopo una modifica:
```bash
node verifica.js > docs/esito_verifica_assoluti.txt
```
```bash
node verifica.js relativi > docs/esito_verifica_relativi.txt
```
