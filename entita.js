// Chi si muove nel labirinto (giocatore e fantasmi) condivide questa logica.
// Il movimento è basato sul TEMPO (celle al secondo), non sui frame:
// il gioco va alla stessa velocità su qualsiasi computer (requisito RNF2).
class Entita {
  constructor(lab, inizio, dir, velocita) {
    this.lab = lab;
    this.inizio = inizio;
    this.dirIniziale = dir;
    this.velocita = velocita;
    this.riporta();
  }

  riporta() {
    this.col = this.inizio.c;
    this.row = this.inizio.r;
    this.dir = this.dirIniziale;
    this.prossima = { c: this.col, r: this.row };
    this.prog = 0;        // quanto manca per arrivare alla prossima cella (0..1)
    this.fermo = true;    // true = siamo al centro di una cella
  }

  // Posizione in celle, con decimali (serve a disegnare e a controllare i contatti).
  get x() { return this.col + (this.prossima.c - this.col) * this.prog; }
  get y() { return this.row + (this.prossima.r - this.row) * this.prog; }

  // Cella reale più vicina (le colonne fuori schermo contano come bordo).
  get cellaReale() {
    const c = Math.min(COLONNE - 1, Math.max(0, Math.round(this.x)));
    return { c, r: Math.round(this.y) };
  }

  get fuoriSchermo() {
    return this.col < 0 || this.col >= COLONNE ||
           this.prossima.c < 0 || this.prossima.c >= COLONNE;
  }

  get velocitaAttuale() {
    const sulBordo = this.lab.rigaConTunnel(this.row) &&
                     (this.col <= 0 || this.col >= COLONNE - 1);
    return this.velocita * (sulBordo ? FATTORE_TUNNEL : 1);
  }

  aggiorna(dt) {
    let rimanente = this.velocitaAttuale * dt;
    while (rimanente > 1e-9) {
      if (this.fermo) {
        this.parti();
        if (this.fermo) return;       // bloccato: aspetta
      }
      const passo = Math.min(rimanente, 1 - this.prog);
      this.prog += passo;
      rimanente -= passo;
      if (this.prog >= 1 - 1e-9) this.arriva();
    }
  }

  // Al centro di una cella: sceglie dove andare.
  parti() {
    let d;
    if (this.col === -1) d = 1;                  // fuori a sinistra: rientra
    else if (this.col === COLONNE) d = 3;        // fuori a destra: rientra
    else d = this.scegliDirezione();
    if (d < 0) return;
    this.dir = d;
    this.prossima = { c: this.col + DIREZIONI[d].dc, r: this.row + DIREZIONI[d].dr };
    this.prog = 0;
    this.fermo = false;
  }

  arriva() {
    this.col = this.prossima.c;
    this.row = this.prossima.r;
    this.prog = 0;
    this.fermo = true;
    this.suArrivo();
    // Uscendo da un lato si rientra dall'altro (passaggio laterale).
    if (this.col === -1) this.col = COLONNE;
    else if (this.col === COLONNE) this.col = -1;
    this.prossima = { c: this.col, r: this.row };
  }

  // Inversione di marcia a metà strada (non permessa fuori schermo).
  inverti() {
    if (this.fuoriSchermo) return;
    if (this.fermo) {                 // bloccato contro un muro: si gira dall'altra parte
      this.dir = (this.dir + 2) % 4;
      return;
    }
    const vecchia = { c: this.col, r: this.row };
    this.col = this.prossima.c;
    this.row = this.prossima.r;
    this.prossima = vecchia;
    this.prog = 1 - this.prog;
    this.dir = (this.dir + 2) % 4;
  }

  scegliDirezione() { return -1; }   // lo decidono giocatore e fantasmi
  suArrivo() {}                      // idem
}
