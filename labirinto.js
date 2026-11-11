// Il labirinto: sa dove sono muri, cibo e tunnel. Non disegna nulla.
class Labirinto {
  constructor(dati) {
    this.righe = dati.righe;
    this.tunnel = dati.tunnel;
    this.inizioGiocatore = dati.giocatore;
    this.inizioFantasmi = dati.fantasmi;
    this.trono = dati.trono || null;   // cella del Trono (solo nell'ultimo livello)
    this.cibo = new Set();
    for (let r = 0; r < RIGHE; r++) {
      for (let c = 0; c < COLONNE; c++) {
        if (this.righe[r][c] === '.') this.cibo.add(c + ',' + r);
      }
    }
    // Le sfere del potenziamento stanno negli angoli (se lì c'è un percorso).
    this.potenziamenti = new Set();
    for (const [c, r] of [[1, 1], [COLONNE - 2, 1], [1, RIGHE - 2], [COLONNE - 2, RIGHE - 2]]) {
      if (this.cibo.has(c + ',' + r)) this.potenziamenti.add(c + ',' + r);
    }
    // Nella cella di partenza del giocatore e in quella del Trono non c'è cibo.
    this.cibo.delete(this.inizioGiocatore.c + ',' + this.inizioGiocatore.r);
    if (this.trono) this.cibo.delete(this.trono.c + ',' + this.trono.r);
  }

  rigaConTunnel(r) {
    return this.tunnel.includes(r);
  }

  // Una cella è libera se non è un muro. Le colonne -1 e COLONNE
  // esistono solo sulle righe con il tunnel: sono "fuori schermo".
  aperto(c, r) {
    if (r < 0 || r >= RIGHE) return false;
    if (c === -1 || c === COLONNE) return this.rigaConTunnel(r);
    if (c < 0 || c > COLONNE) return false;
    return this.righe[r][c] !== '#';
  }

  // Si può andare dalla cella (c, r) nella direzione d?
  liberoVerso(c, r, d) {
    return this.aperto(c + DIREZIONI[d].dc, r + DIREZIONI[d].dr);
  }

  // Vicini reali (con il passaggio laterale), usati per cercare i percorsi.
  vicini(c, r) {
    const risultato = [];
    for (let d = 0; d < 4; d++) {
      let nc = c + DIREZIONI[d].dc;
      const nr = r + DIREZIONI[d].dr;
      if (this.rigaConTunnel(r)) {
        if (nc < 0) nc = COLONNE - 1;
        else if (nc >= COLONNE) nc = 0;
      }
      if (nc >= 0 && nc < COLONNE && this.aperto(nc, nr)) {
        risultato.push({ c: nc, r: nr, dir: d });
      }
    }
    return risultato;
  }

  // Distanza (in celle) di ogni cella da (c, r): ricerca in ampiezza.
  distanze(c, r) {
    const dist = [];
    for (let i = 0; i < RIGHE; i++) dist.push(new Array(COLONNE).fill(Infinity));
    dist[r][c] = 0;
    const coda = [{ c, r }];
    for (let i = 0; i < coda.length; i++) {
      const cella = coda[i];
      for (const v of this.vicini(cella.c, cella.r)) {
        if (dist[v.r][v.c] === Infinity) {
          dist[v.r][v.c] = dist[cella.r][cella.c] + 1;
          coda.push({ c: v.c, r: v.r });
        }
      }
    }
    return dist;
  }
}
