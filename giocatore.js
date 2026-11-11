// Il giocatore. Comandi RELATIVI alla direzione in cui sta andando:
// su = avanti, sinistra/destra = gira al prossimo incrocio, giù = inversione.
class Giocatore extends Entita {
  constructor(lab) {
    const inizio = lab.inizioGiocatore;
    // Parte nella direzione che lo allontana di più dai fantasmi.
    const f = lab.inizioFantasmi[0];
    const dist = lab.distanze(f.c, f.r);
    let dir = 0, migliore = -1;
    for (const v of lab.vicini(inizio.c, inizio.r)) {
      if (dist[v.r][v.c] > migliore) { migliore = dist[v.r][v.c]; dir = v.dir; }
    }
    super(lab, inizio, dir, VELOCITA_GIOCATORE);
    this.scadenzaRichiesta = 0;
    this.richiesta = null;   // relativi: -1 = sinistra, +1 = destra; assoluti: direzione 0..3
    this.punti = 0;
    this.potenziamentoPreso = false;   // lo legge il gioco, che poi lo azzera
    this.eventi = [];                  // 'cibo' o 'potenziamento': il gioco li inoltra ai suoni
  }

  riporta() {
    super.riporta();
    this.richiesta = null;
  }

  tasto(t) {
    if (CONTROLLI_RELATIVI) this.tastoRelativo(t);
    else this.tastoAssoluto(t);
  }

  // Frecce come sulla mappa: su = verso l'alto dello schermo, ecc.
  tastoAssoluto(t) {
    const d = { su: 0, destra: 1, giu: 2, sinistra: 3 }[t];
    if (d === undefined) return;
    if (d === (this.dir + 2) % 4) this.inverti();   // direzione opposta: inversione subito
    else this.richiesta = d;                          // altrimenti, appena possibile
  }

  // Comandi dal punto di vista del personaggio.
  tastoRelativo(t) {
    if (t === 'su') this.richiesta = null;
    else if (t === 'sinistra') { this.richiesta = -1; this.scadenzaRichiesta = TEMPO_SVOLTA_PRENOTATA; }
    else if (t === 'destra') { this.richiesta = 1; this.scadenzaRichiesta = TEMPO_SVOLTA_PRENOTATA; }
    else if (t === 'giu') this.inverti();
  }

  // Una svolta prenotata (comandi relativi) vale solo per un momento: se non c'è una strada
  // da prendere, scade, così il personaggio non gira da solo molto più avanti.
  aggiorna(dt) {
    if (CONTROLLI_RELATIVI && this.richiesta !== null) {
      this.scadenzaRichiesta -= dt;
      if (this.scadenzaRichiesta <= 0) this.richiesta = null;
    }
    super.aggiorna(dt);
  }

  scegliDirezione() {
    if (!CONTROLLI_RELATIVI && this.richiesta !== null) {
      const nuova = this.richiesta;
      if (this.lab.liberoVerso(this.col, this.row, nuova)) {
        this.richiesta = null;
        return nuova;
      }
    }
    if (CONTROLLI_RELATIVI && this.richiesta !== null) {
      const nuova = (this.dir + (this.richiesta < 0 ? 3 : 1)) % 4;
      if (this.lab.liberoVerso(this.col, this.row, nuova)) {
        this.richiesta = null;
        return nuova;
      }
    }
    if (this.lab.liberoVerso(this.col, this.row, this.dir)) return this.dir;
    return -1;
  }

  // Quali strade ci sono al prossimo incrocio, viste dal personaggio (serve alla guida sullo schermo).
  uscite() {
    const c = this.fermo ? this.col : this.prossima.c;
    const r = this.fermo ? this.row : this.prossima.r;
    if (c < 0 || c >= COLONNE) return { sinistra: false, avanti: true, destra: false };   // nel tunnel si va dritti
    const libero = d => this.lab.liberoVerso(c, r, d);
    return { sinistra: libero((this.dir + 3) % 4), avanti: libero(this.dir), destra: libero((this.dir + 1) % 4) };
  }

  suArrivo() {
    const chiave = this.col + ',' + this.row;
    if (this.lab.cibo.delete(chiave)) {
      if (this.lab.potenziamenti.has(chiave)) {
        this.punti += PUNTI_POTENZIAMENTO;
        this.potenziamentoPreso = true;
        this.eventi.push('potenziamento');
      } else {
        this.punti += PUNTI_CIBO;
        this.eventi.push('cibo');
      }
    }
  }
}
